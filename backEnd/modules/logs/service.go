package logs

import "gin-quickstart/database"

type LogService interface {
	GetLogs(workspaceID uint, filter LogFilterDto) ([]database.SystemLog, int64, error)
}

type logService struct {
	repo LogRepository
}

func NewLogService(repo LogRepository) LogService {
	return &logService{repo: repo}
}

func (s *logService) GetLogs(workspaceID uint, filter LogFilterDto) ([]database.SystemLog, int64, error) {
	return s.repo.GetLogs(workspaceID, filter)
}
