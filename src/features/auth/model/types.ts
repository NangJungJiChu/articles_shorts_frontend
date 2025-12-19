export interface LoginResponse {
  access: string
  refresh: string
}

export interface User {
  username: string
}

export interface SignupRequest {
  username: string
  password: string
  confirmPassword?: string
}
