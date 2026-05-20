import { authService }    from "../auth/service"
import { ragService }     from "../rag/service"
import { callGemini }     from "../../lib/gemini"
import { getMailAdapter } from "../../lib/mail"
import { mailRepository } from "./repository"
import { Errors }         from "../../lib/errors"
import { randomUUID }     from "crypto"
import type { EmailWithDraft } from "../../../../shared/types"

export const mailboxService = {

  async fetchAndDraft(sessionId: string, provider: "gmail" | "outlook"): Promise<{
    fetched: number
    results: { emailId: string; subject: string }[]
  }> {
    const accessToken = await authService.getValidAccessToken(sessionId, provider)
    const adapter     = getMailAdapter(provider)

    let fetched
    try {
      fetched = await adapter.fetchUnread(accessToken)
    } catch (cause) {
      throw Errors.MAIL_FETCH_FAILED(cause)
    }

    const results: { emailId: string; subject: string }[] = []

    for (const mail of fetched) {
      const exists = await mailRepository.emailExists(mail.id)
      if (exists) continue

      await mailRepository.insertEmail({ ...mail, sessionId, provider })

      const draftBody = await this.generateDraft(sessionId, mail.bodyText, mail.fromName || mail.fromEmail)
      await mailRepository.insertDraft({
        id:        randomUUID(),
        emailId:   mail.id,
        sessionId,
        draftBody,
        status:    "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      await adapter.markAsRead(accessToken, mail.id)
      results.push({ emailId: mail.id, subject: mail.subject })
    }

    return { fetched: results.length, results }
  },

  async listEmails(sessionId: string): Promise<EmailWithDraft[]> {
    const mails = await mailRepository.findEmailsBySession(sessionId)
    const result: EmailWithDraft[] = []
    for (const email of mails) {
      const draft = await mailRepository.findDraftByEmailId(email.id)
      result.push({ ...email, draft: draft ?? undefined })
    }
    return result
  },

  async updateDraft(draftId: string, draftBody: string): Promise<void> {
    await mailRepository.updateDraft(draftId, { draftBody, status: "edited" })
  },

  async sendMail(sessionId: string, draftId: string): Promise<{ sentTo: string }> {
    const draft = await mailRepository.findDraftById(draftId)
    if (!draft) throw Errors.DRAFT_NOT_FOUND()

    const email = await mailRepository.findEmailById(draft.emailId)
    if (!email) throw Errors.EMAIL_NOT_FOUND()

    const accessToken = await authService.getValidAccessToken(sessionId, email.provider)
    const adapter     = getMailAdapter(email.provider as "gmail" | "outlook")

    try {
      await adapter.sendReply(accessToken, email.id, draft.draftBody)
    } catch (cause) {
      throw Errors.SEND_FAILED(cause)
    }

    await mailRepository.updateDraft(draftId, { status: "sent", sentAt: new Date().toISOString() })
    return { sentTo: email.fromEmail }
  },

  async discardDraft(draftId: string): Promise<void> {
    await mailRepository.updateDraft(draftId, { status: "discarded" })
  },

  async generateDraft(sessionId: string, emailBody: string, senderName: string): Promise<string> {
    let chunks: Awaited<ReturnType<typeof ragService.findRelevantChunks>> = []
    try {
      chunks = await ragService.findRelevantChunks(
        sessionId, emailBody,
        { topPerFile: 2, maxTotal: 5, minScore: 0.4 }
      )
    } catch {
      // ไม่มีข้อมูลใน session — ร่างโดยไม่มี context
    }
    const context = chunks.length > 0 ? ragService.buildContext(chunks) : ""

    const prompt = `
คุณเป็นผู้ช่วย Sales มืออาชีพ ร่างคำตอบอีเมลเป็นภาษาเดียวกับเมล
${context ? "\nข้อมูลสินค้า/ราคา:\n" + context + "\n" : ""}
อีเมลจาก ${senderName}:
${emailBody}

ร่างคำตอบ: สุภาพ ตรงประเด็น ใส่ข้อมูลจาก context ถ้ามี ถ้าไม่มีให้บอกว่าจะติดต่อกลับ ไม่เส้น subject line

คำตอบ:`.trim()

    return callGemini(prompt)
  },
}
