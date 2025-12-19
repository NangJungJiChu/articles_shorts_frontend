import { httpClient } from '@/shared/api'
import type { SignupRequest, User } from '../model/types'

export const signupApi = {
  signup: async (payload: SignupRequest): Promise<User> => {
    const { data } = await httpClient.post<User>('/accounts/api/signup/', payload)
    return data
  },
}
