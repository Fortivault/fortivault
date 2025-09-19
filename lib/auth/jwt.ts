import { SignJWT, jwtVerify } from "jose"
import { createSecretKey } from "crypto"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const secretKey = createSecretKey(Buffer.from(JWT_SECRET))

export async function signJWT(payload: any, expiresIn: string = "15m") {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey)
  
  return jwt
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey)
    return payload
  } catch (error) {
    console.error("JWT verification error:", error)
    return null
  }
}

export async function refreshJWT(token: string) {
  const payload = await verifyJWT(token)
  if (!payload) return null
  
  // Create new token with fresh expiration
  return signJWT({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
  })
}