import { httpClient } from '@/shared/api'
import type { User } from '../model/types'

export const userApi = {
  getUser: async (): Promise<User> => {
    const { data } = await httpClient.get<User>('/accounts/api/user/')
    return data
  },
}
