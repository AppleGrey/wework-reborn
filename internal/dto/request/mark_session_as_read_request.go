package request

type MarkSessionAsReadRequest struct {
	SessionId string `json:"session_id" binding:"required"` // 会话 UUID
}

