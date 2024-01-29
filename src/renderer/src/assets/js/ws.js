import proto from '@renderer/assets/js/proto.js'
import { useUserStore } from '../../store/userStore'

const HeadType = proto.lookupEnum('HeadType')
const Message = proto.lookup('Message')
const LoginRequest = proto.lookup('LoginRequest')
const KeepAliveRequest = proto.lookup('KeepAliveRequest')

let websocket
let userInfo
// 重连成功
let reconnetCallBack
let messageCallBack
let closeCallBack
let errorCallBack

let heartbeatTimer

let missNumber = 0
let isConnet = false

const heartbeat = (keepAliveRequestFun) => {
  heartbeatTimer = setInterval(() => {
    keepAliveRequestFun() // 发送心跳请求的方法
  }, 5000) // 每5秒发送一次心跳请求
}

const createWS = (loginParam, message, close, error, reconnect) => {
  userInfo = loginParam
  messageCallBack = message
  closeCallBack = close
  errorCallBack = error
  reconnetCallBack = reconnect
  newWs()
}

const newWs = () => {
  websocket = new WebSocket(import.meta.env.RENDERER_VITE_WS_URL)
  websocket.binaryType = 'arraybuffer'
  const userStore = useUserStore()

  const keepAliveRequest = KeepAliveRequest.create({
    userId: userInfo.userId,
    platform: userInfo.platform
  })

  const keepAliveRequestMessage = Message.create({
    headType: HeadType.values.KEEP_ALIVE_REQUEST,
    keepAliveRequest: keepAliveRequest
  })

  websocket.onopen = () => {
    console.log('websocket open')
    const loginRequest = LoginRequest.create(userInfo)
    const message = Message.create({
      headType: HeadType.values.LOGIN_REQUEST,
      loginRequest: loginRequest
    })
    websocket.send(Message.encode(message).finish())
  }

  websocket.onmessage = (event) => {
    const message = Message.decode(new Uint8Array(event.data))
    if (message.headType === HeadType.values.LOGIN_RESPONSE) {
      console.log('ws 连接成功')
      isConnet = true
      reconnetCallBack()
      // 连接成功后，开启心跳检测
      heartbeat(() => {
        if (!userStore.isLogin) {
          websocket.close()
        }
        if (missNumber > 3 || websocket.readyState !== WebSocket.OPEN) {
          clearInterval(heartbeatTimer)
          heartbeatTimer = null
          missNumber = 0
          return
        }
        if (websocket && websocket.readyState === WebSocket.OPEN) {
          console.log('发送心跳请求')
          websocket.send(Message.encode(keepAliveRequestMessage).finish())
          missNumber++
        }
      })
    } else if (message.headType === HeadType.values.KEEP_ALIVE_RESPONSE) {
      // 收到pong
      missNumber = 0
    } else {
      messageCallBack(message)
      console.log('ws 收到消息:', message)
    }
  }

  websocket.onclose = () => {
    console.log('websocket close')
    isConnet = false
    if(userStore.isLogin){
      // 重连
      closeCallBack()
      reconnectWS()
    }
  }

  websocket.onerror = (error) => {
    console.log('websocket error:', error)
    errorCallBack(error)
  }
}

const reconnectWS = () => {
  if(websocket && websocket.readyState === WebSocket.OPEN) return;
  setTimeout(() => {
    console.log('ws重连中')
    newWs()
  }, 5000)
}

const closeWS = () => {
  if (websocket) {
    websocket.close()
  }
}

export { createWS, closeWS }
