import { httpClient } from '@/shared/api'
import type { LoginResponse } from '../model/types'

interface LoginPayload {
  username: string
  password: string
}

export const loginApi = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const { data } = await httpClient.post<LoginResponse>('/accounts/api/token/', payload)
    return data
  },
}
