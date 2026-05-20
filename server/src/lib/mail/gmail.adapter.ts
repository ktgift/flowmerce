import type { MailAdapter } from "./index"
import type { MailMessage } from "../../../../shared/types"

export const gmailAdapter: MailAdapter = {

  async fetchUnread(accessToken): Promise<MailMessage[]> {
    const listRes  = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread&maxResults=20",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    const listData = await listRes.json()
    if (!listData.messages) return []

    const messages: MailMessage[] = []
    for (const { id } of listData.messages.slice(0, 20)) {
      const msgRes  = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      const msg     = await msgRes.json()
      const headers = msg.payload.headers as { name: string; value: string }[]
      const from    = headers.find(h => h.name === "From")?.value ?? ""
      const subject = headers.find(h => h.name === "Subject")?.value ?? "(ไม่มีหัวข้อ)"
      const date    = headers.find(h => h.name === "Date")?.value ?? ""

      const fromMatch = from.match(/^(.+?)\s*<(.+?)>$/)
      messages.push({
        id,
        fromEmail:  fromMatch?.[2]?.trim() ?? from,
        fromName:   fromMatch?.[1]?.trim() ?? from,
        subject,
        bodyText:   extractBody(msg.payload),
        receivedAt: date,
      })
    }
    return messages
  },

  async sendReply(accessToken, originalId, body) {
    const origRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${originalId}?format=metadata`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    const orig    = await origRes.json()
    const headers = orig.payload.headers as { name: string; value: string }[]
    const to      = headers.find(h => h.name === "From")?.value ?? ""
    const subject = headers.find(h => h.name === "Subject")?.value ?? ""
    const msgId   = headers.find(h => h.name === "Message-ID")?.value ?? ""

    const raw = [
      `To: ${to}`,
      `Subject: Re: ${subject}`,
      `In-Reply-To: ${msgId}`,
      `References: ${msgId}`,
      `Content-Type: text/plain; charset=utf-8`,
      "",
      body,
    ].join("\r\n")

    const encoded = btoa(unescape(encodeURIComponent(raw)))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")

    await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method:  "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body:    JSON.stringify({ raw: encoded, threadId: orig.threadId }),
    })
  },

  async markAsRead(accessToken, messageId) {
    await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`,
      {
        method:  "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body:    JSON.stringify({ removeLabelIds: ["UNREAD"] }),
      }
    )
  },

  async refreshToken(refreshToken) {
    const res  = await fetch("https://oauth2.googleapis.com/token", {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    new URLSearchParams({
        grant_type:    "refresh_token",
        refresh_token: refreshToken,
        client_id:     process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    })
    const data = await res.json()
    return {
      accessToken: data.access_token,
      expiresAt:   Math.floor(Date.now() / 1000) + data.expires_in,
    }
  },
}

function extractBody(payload: any): string {
  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return Buffer.from(payload.body.data, "base64").toString("utf-8")
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      const text = extractBody(part)
      if (text) return text
    }
  }
  return ""
}