// 全局事件总线，用于 WebSocket 消息分发
import { ref } from 'vue'

class EventBus {
  constructor() {
    this.events = {}
  }

  // 订阅事件
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
    console.log(`📡 [EventBus] 订阅事件: ${event}, 当前监听器数量:`, this.events[event].length)
  }

  // 取消订阅
  off(event, callback) {
    if (!this.events[event]) return
    
    if (callback) {
      // 移除指定的回调
      this.events[event] = this.events[event].filter(cb => cb !== callback)
    } else {
      // 移除所有回调
      delete this.events[event]
    }
    console.log(`📡 [EventBus] 取消订阅事件: ${event}`)
  }

  // 触发事件
  emit(event, data) {
    console.log(`📡 [EventBus] 触发事件: ${event}`, data)
    if (!this.events[event]) {
      console.log(`📡 [EventBus] 没有监听器订阅事件: ${event}`)
      return
    }
    
    this.events[event].forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`📡 [EventBus] 事件处理器执行出错 (${event}):`, error)
      }
    })
  }

  // 清空所有事件
  clear() {
    this.events = {}
    console.log('📡 [EventBus] 已清空所有事件监听器')
  }
}

// 导出单例
export default new EventBus()

