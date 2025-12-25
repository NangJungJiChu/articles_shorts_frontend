import axios from 'axios'

export const httpClient = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth token
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor for error handling
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 Unauthorized and not a retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refreshToken')

      if (refreshToken) {
        try {
          // Attempt refresh
          const { data } = await axios.post(
            'http://localhost:8000/accounts/api/token/refresh/',
            { refresh: refreshToken },
          )

          // Update tokens
          localStorage.setItem('accessToken', data.access)
          if (data.refresh) {
            localStorage.setItem('refreshToken', data.refresh)
          }

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${data.access}`
          return httpClient(originalRequest)
        } catch (refreshError) {
          // Refresh failed - clean up and redirect
          console.error('Token refresh failed:', refreshError)
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      } else {
        // No refresh token available
        localStorage.removeItem('accessToken')
        window.location.href = '/login'
      }
    }

    // Handle common errors here
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  },
)
