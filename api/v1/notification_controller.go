package v1

import (
	"kama_chat_server/internal/dto/request"
	"kama_chat_server/internal/dto/respond"
	"kama_chat_server/internal/service/gorm"
	"kama_chat_server/pkg/constants"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetNotificationList 获取通知列表
func GetNotificationList(c *gin.Context) {
	// 从 JWT 获取用户 ID（安全）
	uuid, exists := c.Get("uuid")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    http.StatusUnauthorized,
			"message": "未授权",
		})
		return
	}
	userId := uuid.(string)

	var req request.GetNotificationListRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"code":    500,
			"message": constants.SYSTEM_ERROR,
		})
		return
	}
	message, data, ret := gorm.NotificationService.GetNotificationList(
		userId, // 使用从 JWT 解析的 userId，不信任前端传递的参数
		req.Page,
		req.PageSize,
		req.Type,
		req.Status,
	)
	if ret == 0 {
		c.JSON(http.StatusOK, gin.H{
			"code":    200,
			"message": message,
			"data":    data.Data,
			"total":   data.Total,
		})
	} else if ret == -2 {
		c.JSON(http.StatusOK, gin.H{
			"code":    400,
			"message": message,
		})
	} else {
		c.JSON(http.StatusOK, gin.H{
			"code":    500,
			"message": message,
		})
	}
}

// GetUnreadCount 获取未读通知数量
func GetUnreadCount(c *gin.Context) {
	// 从 JWT 获取用户 ID（安全）
	uuid, exists := c.Get("uuid")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    http.StatusUnauthorized,
			"message": "未授权",
		})
		return
	}
	userId := uuid.(string)

	var req request.GetUnreadCountRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"code":    500,
			"message": constants.SYSTEM_ERROR,
		})
		return
	}
	message, count, ret := gorm.NotificationService.GetUnreadCount(userId, req.Type)
	JsonBack(c, message, ret, respond.GetUnreadCountResponse{Count: count})
}

// MarkAsRead 标记通知为已读
func MarkAsRead(c *gin.Context) {
	// 从 JWT 获取用户 ID（安全）
	uuid, exists := c.Get("uuid")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    http.StatusUnauthorized,
			"message": "未授权",
		})
		return
	}
	userId := uuid.(string)

	var req request.MarkAsReadRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"code":    500,
			"message": constants.SYSTEM_ERROR,
		})
		return
	}
	message, count, ret := gorm.NotificationService.MarkAsRead(userId, req.NotificationIds)
	JsonBack(c, message, ret, respond.MarkAsReadResponse{Count: count})
}

// DeleteNotification 删除通知
func DeleteNotification(c *gin.Context) {
	// 从 JWT 获取用户 ID（安全）
	uuid, exists := c.Get("uuid")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    http.StatusUnauthorized,
			"message": "未授权",
		})
		return
	}
	userId := uuid.(string)

	var req request.DeleteNotificationRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"code":    500,
			"message": constants.SYSTEM_ERROR,
		})
		return
	}
	message, count, ret := gorm.NotificationService.DeleteNotification(userId, req.NotificationIds)
	JsonBack(c, message, ret, respond.DeleteNotificationResponse{Count: count})
}

// ClearAllNotification 清空所有通知
func ClearAllNotification(c *gin.Context) {
	// 从 JWT 获取用户 ID（安全）
	uuid, exists := c.Get("uuid")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    http.StatusUnauthorized,
			"message": "未授权",
		})
		return
	}
	userId := uuid.(string)

	var req request.ClearAllNotificationRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"code":    500,
			"message": constants.SYSTEM_ERROR,
		})
		return
	}
	message, count, ret := gorm.NotificationService.ClearAllNotification(userId, req.Type)
	JsonBack(c, message, ret, respond.ClearAllNotificationResponse{Count: count})
}

