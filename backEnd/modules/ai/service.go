package ai

import (
	"encoding/json"
	"fmt"
	"strings"
	"sync"
	"time"

	"gin-quickstart/database"
	"gin-quickstart/pkg/gemini"
)

type AIService interface {
	StreamChat(workspaceID uint, sessionID string, message string, onChunk func(string) error) error
	GetInsights(workspaceID uint) ([]InsightDto, error)
	GetStockPredictions(workspaceID uint) ([]StockPredictionDto, error)
	SearchProducts(workspaceID uint, query string) ([]database.Product, error)
}

type aiService struct {
	repo         AIRepository
	geminiClient *gemini.GeminiClient

	// In-memory chat history map with mutex
	sessionMu sync.RWMutex
	sessions  map[string][]gemini.ChatMessage
}

func NewAIService(repo AIRepository) AIService {
	return &aiService{
		repo:         repo,
		geminiClient: gemini.NewGeminiClient(),
		sessions:     make(map[string][]gemini.ChatMessage),
	}
}

func cleanJsonOutput(raw string) string {
	s := strings.TrimSpace(raw)
	if strings.HasPrefix(s, "```json") {
		s = strings.TrimPrefix(s, "```json")
		s = strings.TrimSuffix(s, "```")
	} else if strings.HasPrefix(s, "```") {
		s = strings.TrimPrefix(s, "```")
		s = strings.TrimSuffix(s, "```")
	}
	return strings.TrimSpace(s)
}

func (s *aiService) getSessionHistory(sessionKey string) []gemini.ChatMessage {
	s.sessionMu.RLock()
	defer s.sessionMu.RUnlock()

	history, exists := s.sessions[sessionKey]
	if !exists {
		return []gemini.ChatMessage{}
	}
	// Return a copy
	res := make([]gemini.ChatMessage, len(history))
	copy(res, history)
	return res
}

func (s *aiService) appendSessionHistory(sessionKey string, userMsg, assistantMsg string) {
	s.sessionMu.Lock()
	defer s.sessionMu.Unlock()

	history := s.sessions[sessionKey]
	history = append(history,
		gemini.ChatMessage{Role: "user", Content: userMsg},
		gemini.ChatMessage{Role: "model", Content: assistantMsg},
	)

	// Keep last 10 messages (5 turns) to prevent unbounded memory growth
	if len(history) > 10 {
		history = history[len(history)-10:]
	}
	s.sessions[sessionKey] = history
}

func (s *aiService) StreamChat(workspaceID uint, sessionID string, message string, onChunk func(string) error) error {
	snapshot, err := s.repo.GetBusinessSnapshot(workspaceID)
	if err != nil {
		return fmt.Errorf("gagal memuat data bisnis untuk konteks AI: %w", err)
	}

	snapshotBytes, _ := json.MarshalIndent(snapshot, "", "  ")
	systemPrompt := gemini.BuildBusinessChatSystemPrompt(snapshot.WorkspaceName, snapshot.Currency, string(snapshotBytes))

	sessionKey := fmt.Sprintf("ws_%d_sess_%s", workspaceID, sessionID)
	if sessionID == "" {
		sessionKey = fmt.Sprintf("ws_%d_default", workspaceID)
	}

	history := s.getSessionHistory(sessionKey)

	var fullResponse strings.Builder
	streamWrapper := func(chunk string) error {
		fullResponse.WriteString(chunk)
		return onChunk(chunk)
	}

	if err := s.geminiClient.StreamChat(systemPrompt, history, message, streamWrapper); err != nil {
		return err
	}

	// Save completed response to history
	s.appendSessionHistory(sessionKey, message, fullResponse.String())

	return nil
}

func (s *aiService) GetInsights(workspaceID uint) ([]InsightDto, error) {
	snapshot, err := s.repo.GetBusinessSnapshot(workspaceID)
	if err != nil {
		return nil, fmt.Errorf("gagal memuat snapshot bisnis: %w", err)
	}

	snapshotBytes, _ := json.MarshalIndent(snapshot, "", "  ")
	prompt := gemini.BuildInsightsPrompt(snapshot.WorkspaceName, string(snapshotBytes))

	rawResponse, err := s.geminiClient.GenerateContent("", prompt, true)
	if err != nil {
		return nil, err
	}

	cleaned := cleanJsonOutput(rawResponse)

	var insights []InsightDto
	if err := json.Unmarshal([]byte(cleaned), &insights); err != nil {
		return nil, fmt.Errorf("gagal parse hasil insight dari AI: %w (raw: %s)", err, rawResponse)
	}

	if insights == nil {
		insights = []InsightDto{}
	}

	return insights, nil
}

func (s *aiService) GetStockPredictions(workspaceID uint) ([]StockPredictionDto, error) {
	snapshot, _ := s.repo.GetBusinessSnapshot(workspaceID)
	businessName := "theKasir"
	if snapshot != nil && snapshot.WorkspaceName != "" {
		businessName = snapshot.WorkspaceName
	}

	velocities, err := s.repo.GetProductVelocityData(workspaceID)
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil data penjualan produk: %w", err)
	}

	velocityBytes, _ := json.MarshalIndent(velocities, "", "  ")
	prompt := gemini.BuildStockPredictionPrompt(businessName, string(velocityBytes))

	rawResponse, err := s.geminiClient.GenerateContent("", prompt, true)
	if err != nil {
		// Fallback algorithmic calculation if AI fails or key is missing
		return s.fallbackStockPredictions(velocities), nil
	}

	cleaned := cleanJsonOutput(rawResponse)

	var predictions []StockPredictionDto
	if err := json.Unmarshal([]byte(cleaned), &predictions); err != nil {
		return s.fallbackStockPredictions(velocities), nil
	}

	if predictions == nil {
		predictions = []StockPredictionDto{}
	}

	return predictions, nil
}

func (s *aiService) fallbackStockPredictions(velocities []ProductVelocityData) []StockPredictionDto {
	var list []StockPredictionDto
	now := time.Now()

	for _, v := range velocities {
		avgDaily := float64(v.SoldLast30D) / 30.0
		daysRemaining := 999
		if avgDaily > 0 {
			daysRemaining = int(float64(v.Stock) / avgDaily)
		} else if v.Stock <= 0 {
			daysRemaining = 0
		}

		targetStock := v.MinStock * 3
		if targetStock < 10 {
			targetStock = 10
		}
		recommendedQty := targetStock - v.Stock
		if recommendedQty < 0 {
			recommendedQty = 0
		}

		restockDate := now.AddDate(0, 0, daysRemaining).Format("2006-01-02")
		notes := "Penjualan stabil dalam 30 hari terakhir."
		if v.Stock <= v.MinStock {
			notes = "Stok saat ini sudah berada di bawah atau sama dengan batas minimum stok!"
		} else if avgDaily == 0 {
			notes = "Belum ada penjualan tercatat dalam 30 hari terakhir."
		}

		list = append(list, StockPredictionDto{
			ProductID:              v.ProductID,
			ProductName:            v.ProductName,
			CurrentStock:           v.Stock,
			AvgDailySales:          avgDaily,
			EstimatedDaysRemaining: daysRemaining,
			RecommendedRestockDate: restockDate,
			RecommendedRestockQty:  recommendedQty,
			AINotes:                notes,
		})
	}

	return list
}

func (s *aiService) SearchProducts(workspaceID uint, query string) ([]database.Product, error) {
	if strings.TrimSpace(query) == "" {
		return []database.Product{}, nil
	}

	catalog, err := s.repo.GetProductCatalog(workspaceID, 50)
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil katalog produk: %w", err)
	}

	if len(catalog) == 0 {
		return []database.Product{}, nil
	}

	catalogBytes, _ := json.Marshal(catalog)
	prompt := gemini.BuildProductSearchPrompt(query, string(catalogBytes))

	rawResponse, err := s.geminiClient.GenerateContent("", prompt, true)
	if err != nil {
		return nil, err
	}

	cleaned := cleanJsonOutput(rawResponse)

	var productIDs []uint
	if err := json.Unmarshal([]byte(cleaned), &productIDs); err != nil {
		return nil, fmt.Errorf("gagal parse hasil pencarian AI: %w", err)
	}

	if len(productIDs) == 0 {
		return []database.Product{}, nil
	}

	return s.repo.GetProductsByIDs(productIDs, workspaceID)
}
