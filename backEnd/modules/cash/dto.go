package cash

type OpenShiftDto struct {
	OpeningCash float64 `json:"opening_cash" binding:"required,min=0"`
	Notes       string  `json:"notes"`
}

type CloseShiftDto struct {
	ActualCash float64 `json:"actual_cash" binding:"required,min=0"`
	Notes      string  `json:"notes"`
}

type CashMovementDto struct {
	Type   string  `json:"type" binding:"required,oneof=CASH_IN CASH_OUT"`
	Amount float64 `json:"amount" binding:"required,gt=0"`
	Reason string  `json:"reason" binding:"required,min=3"`
}

type SessionSummaryDto struct {
	SessionID    uint    `json:"session_id"`
	Status       string  `json:"status"`
	OpeningCash  float64 `json:"opening_cash"`
	TotalSales   float64 `json:"total_sales"`
	TotalCashIn  float64 `json:"total_cash_in"`
	TotalCashOut float64 `json:"total_cash_out"`
	ExpectedCash float64 `json:"expected_cash"`
	ClosingCash  float64 `json:"closing_cash"`
	Difference   float64 `json:"difference"`
}
