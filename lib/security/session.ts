function base64url(input: ArrayBuffer | string): string {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input)
  let str = ""
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i])
  return btoa(str).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
}

async function importKey(secret: string): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  )
}

export async function signSession(payload: Record<string, any>, expiresInSeconds = 60 * 60 * 24 * 7) {
  const secret = process.env.SUPABASE_JWT_SECRET || process.env.NEXTAUTH_SECRET || ""
  if (!secret) throw new Error("Missing secret for signing")

  const header = { alg: "HS256", typ: "JWT" }
  const now = Math.floor(Date.now() / 1000)
  const body = { ...payload, iat: now, exp: now + expiresInSeconds }

  const encodedHeader = base64url(JSON.stringify(header))
  const encodedPayload = base64url(JSON.stringify(body))
  const data = `${encodedHeader}.${encodedPayload}`

  const key = await importKey(secret)
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data))
  const encodedSig = base64url(sig)
  return `${data}.${encodedSig}`
}

export async function verifySession(token: string): Promise<Record<string, any> | null> {
  try {
    const secret = process.env.SUPABASE_JWT_SECRET || process.env.NEXTAUTH_SECRET || ""
    if (!secret) return null
    const [encodedHeader, encodedPayload, signature] = token.split(".")
    if (!encodedHeader || !encodedPayload || !signature) return null
    const data = `${encodedHeader}.${encodedPayload}`

    const key = await importKey(secret)
    const sigBytes = Uint8Array.from(atob(signature.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0))
    const valid = await crypto.subtle.verify("HMAC", key, sigBytes, new TextEncoder().encode(data))
    if (!valid) return null

    const json = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(encodedPayload.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0)))))
    if (typeof json.exp === "number" && json.exp < Math.floor(Date.now() / 1000)) return null
    return json
  } catch {
    return null
  }
}