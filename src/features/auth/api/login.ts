import { httpClient } from '@/shared/api'
import type { LoginResponse } from '../model/types'

export const loginApi = {
  login: async (payload: any): Promise<LoginResponse> => {
    const { data } = await httpClient.post<LoginResponse>('/accounts/api/token/', payload)
    return data
  },
}
