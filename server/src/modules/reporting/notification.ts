import { notificationRepository, type NotificationValues } from "./repositories/notification"

export const notificationService = {

  async create(
    tenantId: number,
    values: NotificationValues,
    opts: { dedupHours?: number } = {},
  ) {
    if (values.entityType && values.entityId != null) {
      const exists = await notificationRepository.existsRecent(
        tenantId,
        values.type,
        values.entityType,
        values.entityId,
        opts.dedupHours ?? 24,
      )
      if (exists) return null
    }
    return notificationRepository.create(tenantId, values)
  },

  async list(tenantId: number, opts: { onlyUnread?: boolean; userId?: number | null } = {}) {
    return notificationRepository.findAll(tenantId, opts)
  },

  async unreadCount(tenantId: number, userId?: number | null) {
    return notificationRepository.countUnread(tenantId, userId)
  },

  async markRead(tenantId: number, id: number) {
    return notificationRepository.markRead(tenantId, id)
  },

  async markAllRead(tenantId: number, userId?: number | null) {
    return notificationRepository.markAllRead(tenantId, userId)
  },
}

export type NotificationService = typeof notificationService
