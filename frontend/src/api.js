const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export async function api(path, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${apiBase}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data.message
    throw new Error(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Erreur inconnue'))
  }
  return data
}
