import { db }             from "../../db"
import { emails, drafts } from "../../db/schema"
import { eq }             from "drizzle-orm"
import type { MailRecord, DraftRecord } from "./model"

export const mailRepository = {

  // ─── Emails ───────────────────────────────────────────────

  async insertEmail(mail: MailRecord): Promise<void> {
    await db.insert(emails).values({
      id:         mail.id,
      sessionId:  mail.sessionId,
      provider:   mail.provider,
      fromEmail:  mail.fromEmail,
      fromName:   mail.fromName,
      subject:    mail.subject,
      bodyText:   mail.bodyText,
      receivedAt: mail.receivedAt,
    })
  },

  async emailExists(id: string): Promise<boolean> {
    const row = await db.query.emails.findFirst({
      where:   eq(emails.id, id),
      columns: { id: true },
    })
    return !!row
  },

  async findEmailsBySession(sessionId: string): Promise<MailRecord[]> {
    const rows = await db.query.emails.findMany({
      where:   eq(emails.sessionId, sessionId),
      orderBy: (t, { desc }) => [desc(t.receivedAt)],
    })
    return rows.map(toMailRecord)
  },

  async findEmailById(id: string): Promise<MailRecord | null> {
    const row = await db.query.emails.findFirst({ where: eq(emails.id, id) })
    return row ? toMailRecord(row) : null
  },

  // ─── Drafts ───────────────────────────────────────────────

  async insertDraft(draft: DraftRecord): Promise<void> {
    await db.insert(drafts).values({
      id:        draft.id,
      emailId:   draft.emailId,
      sessionId: draft.sessionId,
      draftBody: draft.draftBody,
      status:    draft.status,
      sentAt:    draft.sentAt ?? null,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
    })
  },

  async findDraftByEmailId(emailId: string): Promise<DraftRecord | null> {
    const row = await db.query.drafts.findFirst({
      where: eq(drafts.emailId, emailId),
    })
    return row ? toDraftRecord(row) : null
  },

  async findDraftById(draftId: string): Promise<DraftRecord | null> {
    const row = await db.query.drafts.findFirst({
      where: eq(drafts.id, draftId),
    })
    return row ? toDraftRecord(row) : null
  },

  async updateDraft(draftId: string, patch: Partial<DraftRecord>): Promise<void> {
    await db.update(drafts)
      .set({ ...patch, updatedAt: new Date().toISOString() })
      .where(eq(drafts.id, draftId))
  },
}

function toMailRecord(row: any): MailRecord {
  return {
    id:         row.id,
    sessionId:  row.sessionId,
    provider:   row.provider,
    fromEmail:  row.fromEmail,
    fromName:   row.fromName,
    subject:    row.subject,
    bodyText:   row.bodyText,
    receivedAt: row.receivedAt,
  }
}

function toDraftRecord(row: any): DraftRecord {
  return {
    id:        row.id,
    emailId:   row.emailId,
    sessionId: row.sessionId,
    draftBody: row.draftBody,
    status:    row.status as DraftRecord["status"],
    sentAt:    row.sentAt   ?? undefined,
    createdAt: row.createdAt ?? "",
    updatedAt: row.updatedAt ?? "",
  }
}
