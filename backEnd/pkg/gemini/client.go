package gemini

import (
	"bufio"
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

type ChatMessage struct {
	Role    string `json:"role"` // "user" or "model"
	Content string `json:"content"`
}

type GeminiClient struct {
	apiKey     string
	model      string
	httpClient *http.Client
}

func NewGeminiClient() *GeminiClient {
	apiKey := os.Getenv("GEMINI_API_KEY")
	model := os.Getenv("GEMINI_MODEL")
	if model == "" {
		model = "gemini-2.0-flash"
	}
	return &GeminiClient{
		apiKey: apiKey,
		model:  model,
		httpClient: &http.Client{
			Timeout: 60 * time.Second,
		},
	}
}

func (g *GeminiClient) HasApiKey() bool {
	return strings.TrimSpace(g.apiKey) != ""
}

// Request models matching Gemini REST API specification
type geminiPart struct {
	Text string `json:"text"`
}

type geminiContent struct {
	Role  string       `json:"role,omitempty"`
	Parts []geminiPart `json:"parts"`
}

type geminiSystemInstruction struct {
	Parts []geminiPart `json:"parts"`
}

type geminiReqPayload struct {
	SystemInstruction *geminiSystemInstruction `json:"system_instruction,omitempty"`
	Contents          []geminiContent          `json:"contents"`
	GenerationConfig  *geminiGenConfig         `json:"generationConfig,omitempty"`
}

type geminiGenConfig struct {
	Temperature     float64 `json:"temperature,omitempty"`
	ResponseMimeType string `json:"responseMimeType,omitempty"`
}

type geminiCandidate struct {
	Content      geminiContent `json:"content"`
	FinishReason string        `json:"finishReason"`
}

type geminiRespPayload struct {
	Candidates []geminiCandidate `json:"candidates"`
	Error      *struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
		Status  string `json:"status"`
	} `json:"error,omitempty"`
}

func (g *GeminiClient) buildPayload(systemPrompt string, messages []ChatMessage, jsonMode bool) geminiReqPayload {
	var sysInst *geminiSystemInstruction
	if systemPrompt != "" {
		sysInst = &geminiSystemInstruction{
			Parts: []geminiPart{{Text: systemPrompt}},
		}
	}

	var contents []geminiContent
	for _, msg := range messages {
		role := msg.Role
		if role == "assistant" {
			role = "model"
		} else if role == "" {
			role = "user"
		}
		contents = append(contents, geminiContent{
			Role:  role,
			Parts: []geminiPart{{Text: msg.Content}},
		})
	}

	var genConfig *geminiGenConfig
	if jsonMode {
		genConfig = &geminiGenConfig{
			Temperature:      0.2,
			ResponseMimeType: "application/json",
		}
	} else {
		genConfig = &geminiGenConfig{
			Temperature: 0.7,
		}
	}

	return geminiReqPayload{
		SystemInstruction: sysInst,
		Contents:          contents,
		GenerationConfig:  genConfig,
	}
}

// GenerateContent sends a non-streaming request to Gemini API
func (g *GeminiClient) GenerateContent(systemPrompt string, userPrompt string, jsonMode bool) (string, error) {
	if !g.HasApiKey() {
		return "", errors.New("GEMINI_API_KEY belum dikonfigurasi di environment / .env")
	}

	messages := []ChatMessage{{Role: "user", Content: userPrompt}}
	payload := g.buildPayload(systemPrompt, messages, jsonMode)
	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("gagal serialize payload: %w", err)
	}

	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", g.model, g.apiKey)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return "", fmt.Errorf("gagal membuat request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := g.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("request ke Gemini API gagal: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("gagal membaca response body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("Gemini API error (status %d): %s", resp.StatusCode, string(respBody))
	}

	var res geminiRespPayload
	if err := json.Unmarshal(respBody, &res); err != nil {
		return "", fmt.Errorf("gagal parse response JSON: %w", err)
	}

	if res.Error != nil {
		return "", fmt.Errorf("Gemini API error: %s", res.Error.Message)
	}

	if len(res.Candidates) == 0 || len(res.Candidates[0].Content.Parts) == 0 {
		return "", errors.New("Gemini tidak mengembalikan output konten")
	}

	return res.Candidates[0].Content.Parts[0].Text, nil
}

// StreamChat sends a streaming SSE request to Gemini API and streams the output chunks to onChunk callback
func (g *GeminiClient) StreamChat(systemPrompt string, history []ChatMessage, userPrompt string, onChunk func(text string) error) error {
	if !g.HasApiKey() {
		return errors.New("GEMINI_API_KEY belum dikonfigurasi di environment / .env")
	}

	messages := append(history, ChatMessage{Role: "user", Content: userPrompt})
	payload := g.buildPayload(systemPrompt, messages, false)
	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("gagal serialize payload: %w", err)
	}

	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:streamGenerateContent?alt=sse&key=%s", g.model, g.apiKey)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return fmt.Errorf("gagal membuat request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	// Custom client with no timeout for stream reading
	streamClient := &http.Client{Timeout: 0}
	resp, err := streamClient.Do(req)
	if err != nil {
		return fmt.Errorf("request stream ke Gemini API gagal: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("Gemini API stream error (status %d): %s", resp.StatusCode, string(respBody))
	}

	reader := bufio.NewReader(resp.Body)
	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			if err == io.EOF {
				break
			}
			return fmt.Errorf("error reading stream: %w", err)
		}

		line = strings.TrimSpace(line)
		if !strings.HasPrefix(line, "data:") {
			continue
		}

		dataContent := strings.TrimSpace(strings.TrimPrefix(line, "data:"))
		if dataContent == "" || dataContent == "[DONE]" {
			continue
		}

		var chunk geminiRespPayload
		if err := json.Unmarshal([]byte(dataContent), &chunk); err != nil {
			continue
		}

		if len(chunk.Candidates) > 0 && len(chunk.Candidates[0].Content.Parts) > 0 {
			textPart := chunk.Candidates[0].Content.Parts[0].Text
			if textPart != "" {
				if err := onChunk(textPart); err != nil {
					return err
				}
			}
		}
	}

	return nil
}
