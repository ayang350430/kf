class WebSocketClient {
  constructor(url) {
    this.url = url
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectInterval = 3000 // 3秒
    this.messageCallbacks = new Set()
    this.isConnected = false

    // 心跳相关配置
    this.heartbeatInterval = 30000 // 心跳间隔，30秒
    this.heartbeatTimer = null
    this.missedHeartbeats = 0
    this.maxMissedHeartbeats = 3 // 最大允许的心跳丢失次数
  }

  connect() {
    try {
      // 获取存储在本地的 token
      const token = localStorage.getItem('token')
      // 创建带有 token 的子协议
      const protocols = token ? [`token.${token}`] : []
      this.ws = new WebSocket(this.url, protocols)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.isConnected = true
        this.reconnectAttempts = 0

        // 连接成功后启动心跳
        this.startHeartbeat()
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.messageCallbacks.forEach(callback => callback(data))
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.isConnected = false
        this.reconnect()
        this.stopHeartbeat() // 停止心跳
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.isConnected = false
      }
    } catch (error) {
      console.error('Error creating WebSocket connection:', error)
      this.reconnect()
    }
  }

  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
      setTimeout(() => this.connect(), this.reconnectInterval)
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  send(message) {
    if (this.isConnected && this.ws) {
      try {
        this.ws.send(JSON.stringify(message))
      } catch (error) {
        console.error('Error sending message:', error)
      }
    } else {
      console.error('WebSocket is not connected')
    }
  }

  onMessage(callback) {
    this.messageCallbacks.add(callback)
    return () => this.messageCallbacks.delete(callback)
  }

  // 启动心跳
  startHeartbeat() {
    this.stopHeartbeat() // 先停止可能存在的心跳定时器
    this.missedHeartbeats = 0

    this.heartbeatTimer = setInterval(() => {
      if (this.missedHeartbeats >= this.maxMissedHeartbeats) {
        console.log('Too many missed heartbeats, reconnecting...')
        this.stopHeartbeat()
        this.ws.close() // 关闭连接，触发重连
        return
      }

      console.log('Sending heartbeat...');
      
      // 发送心跳消息 (与后端的约定有关)
      this.send({
        type: 'UP_HEARTBEAT',
        data: {
          timestamp: new Date().getTime()
        }
      })
      this.missedHeartbeats++
    }, this.heartbeatInterval)
  }

  // 停止心跳
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  disconnect() {
    this.stopHeartbeat() // 断开连接时停止心跳
    if (this.ws) {
      this.ws.close()
      this.ws = null
      this.isConnected = false
    }
  }


}

// 创建单例实例
const wsClient = new WebSocketClient(import.meta.env.VITE_WS_URL)

export default wsClient 