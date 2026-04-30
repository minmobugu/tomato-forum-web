import axios from 'axios'
import type { AxiosError } from 'axios'

import { readStoredAuthSession } from '../utils/authSession'
import type { ApiResponse } from '../types/auth'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const session = readStoredAuthSession()
  const accessToken = session?.token.accessToken

  if (!accessToken || config.headers.Authorization) {
    return config
  }

  config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

export function extractApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse<unknown>>
    const message = axiosError.response?.data?.message
    if (message) {
      return message
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallbackMessage
}

export async function unwrapApiResponse<T>(
  request: Promise<{ data: ApiResponse<T> }>,
  fallbackMessage: string,
  options?: { allowNullData?: boolean },
) {
  try {
    const response = await request
    const { data } = response

    if (data.code !== 0) {
      throw new Error(data.message || fallbackMessage)
    }

    if (!options?.allowNullData && data.data == null) {
      throw new Error(data.message || fallbackMessage)
    }

    return data.data as T
  }
  catch (error) {
    throw new Error(extractApiErrorMessage(error, fallbackMessage), { cause: error })
  }
}
