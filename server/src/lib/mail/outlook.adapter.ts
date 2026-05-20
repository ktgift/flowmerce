import type { MailAdapter } from "./index"
import type { MailMessage } from "../../../../shared/types"

const GRAPH = "https://graph.microsoft.com/v1.0"

export const outlookAdapter: MailAdapter = {

  async fetchUnread(accessToken): Promise<MailMessage[]> {
    const res  = await fetch(
      `${GRAPH}/me/mailFolders/inbox/messages?$filter=isRead eq false&$top=20&$select=id,from,subject,body,receivedDateTime`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    const data = await res.json()
    if (!data.value) return []
    return data.value.map((msg: any) => ({
      id:         msg.id,
      fromEmail:  msg.from.emailAddress.address,
      fromName:   msg.from.emailAddress.name ?? "",
      subject:    msg.subject ?? "(ไม่มีหัวข้อ)",
      bodyText:   msg.body.contentType === "text"
                    ? msg.body.content
                    : stripHtml(msg.body.content),
      receivedAt: msg.receivedDateTime,
    }))
  },

  async sendReply(accessToken, originalId, body) {
    await fetch(`${GRAPH}/me/messages/${originalId}/reply`, {
      method:  "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body:    JSON.stringify({
        message: { body: { contentType: "Text", content: body } },
        comment: body,
      }),
    })
  },

  async markAsRead(accessToken, messageId) {
    await fetch(`${GRAPH}/me/messages/${messageId}`, {
      method:  "PATCH",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body:    JSON.stringify({ isRead: true }),
    })
  },

  async refreshToken(refreshToken) {
    const res  = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    new URLSearchParams({
        grant_type:    "refresh_token",
        refresh_token: refreshToken,
        client_id:     process.env.MICROSOFT_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        scope:         "Mail.ReadWrite Mail.Send offline_access",
      }),
    })
    const data = await res.json()
    return {
      accessToken: data.access_token,
      expiresAt:   Math.floor(Date.now() / 1000) + data.expires_in,
    }
  },
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}