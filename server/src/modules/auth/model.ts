export interface TokenRecord {
  id:           string
  sessionId:    string
  provider:     string
  accessToken:  string
  refreshToken: string | null
  expiresAt:    number
  email:        string
  createdAt:    string | null
}

export interface RefreshedToken {
  accessToken: string
  expiresAt:   number
}