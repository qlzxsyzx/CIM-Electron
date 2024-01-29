import { watch } from 'vue'
import { useUserStore } from '../../store/userStore'

export function useReconnect(reconnectCallBack) {
  const userStore = useUserStore()

  watch(
    () => userStore.reconnectSuccess,
    (newVal, oldVal) => {
      // 处理重新连接的逻辑
      if (!oldVal && newVal) {
        // 执行重新连接的操作
        if (reconnectCallBack) {
          reconnectCallBack()
        }
      }
    }
  )
}
