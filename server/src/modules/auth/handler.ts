import { Elysia, t }   from "elysia"
import { authService } from "./service"

const GOOGLE_AUTH_URL  = "https://accounts.google.com/o/oauth2/v2/auth"
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
const GOOGLE_SCOPE     = "https://www.googleapis.com/auth/gmail.modify email profile"
const MS_AUTH_URL      = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
const MS_TOKEN_URL     = "https://login.microsoftonline.com/common/oauth2/v2.0/token"
const MS_SCOPE         = "Mail.ReadWrite Mail.Send offline_access User.Read"

const handler = {

  buildLoginUrl(provider: "gmail" | "outlook", sessionId: string): string {
    const state = Buffer.from(JSON.stringify({ sessionId, provider })).toString("base64")

    if (provider === "gmail") {
      const url = new URL(GOOGLE_AUTH_URL)
      url.searchParams.set("client_id",     process.env.GOOGLE_CLIENT_ID!)
      url.searchParams.set("redirect_uri",  process.env.OAUTH_REDIRECT_URI!)
      url.searchParams.set("response_type", "code")
      url.searchParams.set("scope",         GOOGLE_SCOPE)
      url.searchParams.set("access_type",   "offline")
      url.searchParams.set("prompt",        "consent")
      url.searchParams.set("state",         state)
      return url.toString()
    }

    const url = new URL(MS_AUTH_URL)
    url.searchParams.set("client_id",     process.env.MICROSOFT_CLIENT_ID!)
    url.searchParams.set("redirect_uri",  process.env.OAUTH_REDIRECT_URI!)
    url.searchParams.set("response_type", "code")
    url.searchParams.set("scope",         MS_SCOPE)
    url.searchParams.set("state",         state)
    return url.toString()
  },

  async handleCallback(code: string, state: string): Promise<{ sessionId: string }> {
    const { sessionId, provider } = JSON.parse(Buffer.from(state, "base64").toString())
    const isGoogle = provider === "gmail"

    const tokenBody: Record<string, string> = {
      grant_type:    "authorization_code",
      code,
      redirect_uri:  process.env.OAUTH_REDIRECT_URI!,
      client_id:     isGoogle ? process.env.GOOGLE_CLIENT_ID!     : process.env.MICROSOFT_CLIENT_ID!,
      client_secret: isGoogle ? process.env.GOOGLE_CLIENT_SECRET!  : process.env.MICROSOFT_CLIENT_SECRET!,
    }
    if (!isGoogle) tokenBody.scope = MS_SCOPE

    const tokenRes  = await fetch(isGoogle ? GOOGLE_TOKEN_URL : MS_TOKEN_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    new URLSearchParams(tokenBody),
    })
    const tokenData = await tokenRes.json()

    const userEmail = isGoogle
      ? await fetchGoogleEmail(tokenData.access_token)
      : await fetchMicrosoftEmail(tokenData.access_token)

    await authService.saveToken({
      sessionId,
      provider,
      accessToken:  tokenData.access_token,
      refreshToken: tokenData.refresh_token ?? null,
      expiresAt:    Math.floor(Date.now() / 1000) + (tokenData.expires_in ?? 3600),
      email:        userEmail,
    })

    return { sessionId }
  },

  async handleStatus(sessionId: string) {
    return authService.listConnectedProviders(sessionId)
  },

  async handleLogout(sessionId: string, provider: string) {
    await authService.logout(sessionId, provider)
    return { ok: true }
  },
}

async function fetchGoogleEmail(accessToken: string): Promise<string> {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo",
    { headers: { Authorization: `Bearer ${accessToken}` } })
  return (await res.json()).email
}

async function fetchMicrosoftEmail(accessToken: string): Promise<string> {
  const res = await fetch("https://graph.microsoft.com/v1.0/me",
    { headers: { Authorization: `Bearer ${accessToken}` } })
  const d   = await res.json()
  return d.mail ?? d.userPrincipalName
}

export const authRoute = new Elysia()

  .get("/auth/:provider/login", ({ params, query, set }) => {
    const url = handler.buildLoginUrl(
      params.provider as "gmail" | "outlook",
      query.sessionId
    )
    set.redirect = url
  }, {
    query: t.Object({ sessionId: t.String() })
  })

  .get("/auth/callback", async ({ query, set }) => {
    const { sessionId } = await handler.handleCallback(query.code, query.state)
    set.redirect = `http://localhost:5173?tab=mailbox&session=${sessionId}`
  }, {
    query: t.Object({ code: t.String(), state: t.String() })
  })

  .get("/auth/status", ({ query }) =>
    handler.handleStatus(query.sessionId),
  {
    query: t.Object({ sessionId: t.String() })
  })

  .delete("/auth/:provider/logout", ({ params, query }) =>
    handler.handleLogout(query.sessionId, params.provider),
  {
    query: t.Object({ sessionId: t.String() })
  })
