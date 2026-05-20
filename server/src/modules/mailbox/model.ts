// in-memory mail (RAM)
export interface MailRecord {
  id:         string
  sessionId:  string
  provider:   string
  fromEmail:  string
  fromName:   string
  subject:    string
  bodyText:   string
  receivedAt: string
}

export interface DraftRecord {
  id:        string
  emailId:   string
  sessionId: string
  draftBody: string
  status:    "pending" | "edited" | "sent" | "discarded"
  sentAt?:   string
  createdAt: string
  updatedAt: string
}