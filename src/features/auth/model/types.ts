export interface LoginResponse {
  access: string
  refresh: string
}

export interface User {
  username: string
  email?: string
  profile_img?: string
}

export interface SignupRequest {
  username: string
  password: string
  confirmPassword?: string
}
