import axios from 'axios'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useUserStore } from '../../store/userStore'
import { ElLoading } from 'element-plus'

axios.defaults.withCredentials = true

const service = axios.create({
  baseURL: import.meta.env.RENDERER_VITE_BASE_URL, // 设置默认的 baseURL
  timeout: 5000 // 设置默认的 timeout
})

let fullScreenLoading = null

// request interceptor
service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    userStore.reqCount++
    fullScreenLoading = ElLoading.service({
      lock: true,
      text: '请求中',
      background: 'rgba(0, 0, 0, 0.2)'
  })
    // Do something before request is sent
    // token设置在cookie,由后端操控
    return config
  },
  (error) => {
    // Do something with request error
    console.error('Error in request:', error)
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  (response) => {
    const userStore = useUserStore()
    userStore.reqCount--
    if(userStore.reqCount === 0){
      fullScreenLoading.close()
    }
    // 没有权限
    if (response.status === 403) {
      ElMessage.warning('没有权限')
    }
    const res = response.data
    if (res.code === 200) {
      return res
    }
    // 401 unauthorize
    if (res.code === 401) {
      userStore.logout()
      ElMessageBox.confirm('您的登录凭证已过期，请重新登录。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        location.href = '/login'
      })
    }
    // 400显示，500不显示
    if (res.code === 400) {
      ElMessage({
        message: res.msg,
        type: 'error',
        duration: 5 * 1000
      })
      console.error('Fail in response:', res.msg)
      return res
    } else {
      return res
    }
  },
  (error) => {
    console.error('Error in response:', error)
    return Promise.reject(error)
  }
)

export default service
