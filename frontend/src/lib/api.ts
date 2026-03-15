import { clearToken, getToken } from './auth'

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  auth?: boolean
  responseType?: 'json' | 'blob'
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers({
    Accept: 'application/json',
  })

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.auth !== false) {
    const token = getToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  const response = await fetch(path, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  if (response.status === 401) {
    clearToken()
    throw new Error('Sesi login berakhir. Silakan login ulang.')
  }

  if (options.responseType === 'blob') {
    if (!response.ok) {
      throw new Error('Gagal mengambil file dari server.')
    }

    return (await response.blob()) as T
  }

  const contentType = response.headers.get('Content-Type') ?? ''
  const data = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    const message =
      (data && typeof data.message === 'string' && data.message) ||
      'Terjadi kesalahan saat menghubungi server.'
    throw new Error(message)
  }

  return data as T
}
