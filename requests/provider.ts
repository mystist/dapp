const TIMEOUT = 20 * 1000

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

interface RequestOptions extends Omit<RequestInit, 'method' | 'body'> {
  headers?: Record<string, string>
}

class RequestError extends Error {
  response: Response

  constructor(message: string, response: Response) {
    super(message)
    this.response = response
  }
}

const request = {
  async get<T>(url: string, options: RequestOptions = {}): Promise<T> {
    try {
      return this._fetch<T>(url, { ...options, method: 'GET' })
    } catch (error) {
      console.log(error)
      throw error
    }
  },

  async post<T>(url: string, data: any, options: RequestOptions = {}): Promise<T> {
    try {
      const defaultHeaders = {
        'Content-Type': 'application/json',
      }

      const mergedOptions: RequestOptions & { method: HttpMethod; body: string } = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        method: 'POST',
        body: JSON.stringify(data),
      }

      return this._fetch<T>(url, mergedOptions)
    } catch (error) {
      console.log(error)
      throw error
    }
  },

  async _fetch<T>(url: string, options: RequestOptions & { method: HttpMethod; body?: string }): Promise<T> {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), TIMEOUT)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })

      clearTimeout(id)

      if (!response.ok) {
        throw new RequestError(`HTTP error! status: ${response.status}`, response)
      }

      const data: T = await response.json()
      return data
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out')
      }
      throw error
    }
  },
}

export default request
