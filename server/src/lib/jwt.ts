const SECRET = process.env.JWT_SECRET ?? "flowmerce-dev-secret-change-in-production"
const ALG     = { name: "HMAC", hash: "SHA-256" } as const

function toB64Url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

function fromB64Url(s: string): ArrayBuffer {
  const binary = atob(s.replace(/-/g, "+").replace(/_/g, "/"))
  const buf = new ArrayBuffer(binary.length)
  const view = new Uint8Array(buf)
  for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i)
  return buf
}

async function getKey(usage: KeyUsage[]): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(SECRET), ALG, false, usage)
}

export interface JwtPayload {
  sub:   number   // userId
  tid:   number   // tenantId
  role:  string
  name:  string
  email: string
  iat:   number
  exp:   number
}

export async function signJwt(
  payload: Omit<JwtPayload, "iat" | "exp">,
  ttlHours = 24,
): Promise<string> {
  const now    = Math.floor(Date.now() / 1000)
  const claims = { ...payload, iat: now, exp: now + ttlHours * 3_600 }
  const header = toB64Url(new TextEncoder().encode(JSON.stringify({ alg: "HS256", typ: "JWT" })))
  const body   = toB64Url(new TextEncoder().encode(JSON.stringify(claims)))
  const data   = `${header}.${body}`
  const key    = await getKey(["sign"])
  const sig    = await crypto.subtle.sign(ALG, key, new TextEncoder().encode(data))
  return `${data}.${toB64Url(sig)}`
}

export async function verifyJwt(token: string): Promise<JwtPayload> {
  const parts = token.split(".")
  if (parts.length !== 3) throw new Error("malformed token")
  const [header, body, sig] = parts
  const key   = await getKey(["verify"])
  const valid = await crypto.subtle.verify(
    ALG,
    key,
    fromB64Url(sig),
    new TextEncoder().encode(`${header}.${body}`),
  )
  if (!valid) throw new Error("invalid signature")
  const claims = JSON.parse(new TextDecoder().decode(fromB64Url(body))) as JwtPayload
  if (claims.exp < Math.floor(Date.now() / 1000)) throw new Error("token expired")
  return claims
}
