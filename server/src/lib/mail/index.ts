import type { MailMessage } from "../../../../shared/types"
import { gmailAdapter } from "./gmail.adapter"
import { outlookAdapter } from "./outlook.adapter"

export interface MailAdapter {
  fetchUnread:  (accessToken: string) => Promise<MailMessage[]>
  sendReply:    (accessToken: string, originalId: string, body: string) => Promise<void>
  markAsRead:   (accessToken: string, messageId: string) => Promise<void>
  refreshToken: (refreshToken: string) => Promise<{ accessToken: string; expiresAt: number }>
}

export function getMailAdapter(provider: "gmail" | "outlook"): MailAdapter {
  return provider === "gmail" ? gmailAdapter : outlookAdapter
}