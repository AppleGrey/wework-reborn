package chat

import (
	"encoding/json"
	"fmt"
	"kama_chat_server/internal/config"
	"kama_chat_server/pkg/zlog"
)

// NotificationPushMessage WebSocket 推送通知消息结构
type NotificationPushMessage struct {
	Type        string `json:"type"`         // 消息类型：notification
	UnreadCount int64  `json:"unread_count"` // 当前未读通知数量
}

// PushNotification 推送通知给用户（如果用户在线）
// userId: 接收通知的用户ID
// unreadCount: 当前未读通知数量
// 注意：只推送未读数量，不推送完整通知对象，前端打开通知界面时会自动从后端获取
func PushNotification(userId string, unreadCount int64) {
	kafkaConfig := config.GetConfig().KafkaConfig
	var client *Client
	var found bool

	// 根据配置选择服务器
	if kafkaConfig.MessageMode == "channel" {
		ChatServer.mutex.Lock()
		client, found = ChatServer.Clients[userId]
		ChatServer.mutex.Unlock()
	} else {
		KafkaChatServer.mutex.Lock()
		client, found = KafkaChatServer.Clients[userId]
		KafkaChatServer.mutex.Unlock()
	}

	if !found || client == nil {
		zlog.Info(fmt.Sprintf("用户 %s 不在线，通知已保存到数据库，等待用户登录后查看", userId))
		return
	}

	// 构建推送消息（只推送类型和未读数量，不推送完整通知对象）
	pushMessage := NotificationPushMessage{
		Type:        "notification",
		UnreadCount: unreadCount,
	}

	jsonMessage, err := json.Marshal(pushMessage)
	if err != nil {
		zlog.Error(fmt.Sprintf("序列化通知推送消息失败: %s", err.Error()))
		return
	}

	// 通过 WebSocket 推送
	messageBack := &MessageBack{
		Message: jsonMessage,
		Uuid:    "", // 通知推送不需要 UUID
	}

	select {
	case client.SendBack <- messageBack:
		zlog.Info(fmt.Sprintf("已通过 WebSocket 推送通知给用户 %s, 未读数量: %d", userId, unreadCount))
	default:
		zlog.Warn(fmt.Sprintf("用户 %s 的 WebSocket 发送通道已满，通知推送失败", userId))
	}
}
