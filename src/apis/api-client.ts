// api/apiClient.ts
import { HttpClient } from './codegen/http-client'
import { useUserStore } from '@/stores/user'
// import { emitter } from '@/core/mitt'
// import { APIERROR } from './config'

interface SecurityDataType {
  token?: string
}

// 初始化全局的 HttpClient 实例
export const apiClient = new HttpClient<SecurityDataType>({
  baseURL: import.meta.env.VITE_PROXY_PREFIX || '/cloud',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  secure: true,
  withCredentials: true,
  securityWorker: (securityData) => {
    if (securityData && securityData.token) {
      return {
        headers: {
          Token: securityData.token,
        },
      }
    }
  },
})

// 全局错误处理 request 攔截器
apiClient.instance.interceptors.request.use(
  (response) => {
    // console.log('response ===>', response)
    return response
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 全局错误处理 response 攔截器
apiClient.instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401 && !error.config._retry) {
      const userStore = useUserStore()
      userStore.logout()

      // TODO 權限異常
    }
    if (error?.response?.status === 400) {
      // const errorCode = APIERROR[error?.response?.data?.errorCode]
      // const errorMessage = error?.response?.data?.errorMessage
      // console.warn('resepose erro ==>', { errorCode, errorMessage, origin: error?.response?.data })
    }

    // emitter.emit('errorMsg', error)
    console.log('interceptors error', error)
    return Promise.reject(error)
  },
)

export const setHeaderToken = (token: string | null) => {
  apiClient.setSecurityData(token ? { token } : null)
}

if (typeof localStorage !== 'undefined') {
  const cacheToken = localStorage.getItem('userToken')

  if (cacheToken) {
    setHeaderToken(cacheToken)
  }
}
