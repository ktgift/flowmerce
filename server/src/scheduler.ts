import { notificationRulesService } from "./modules/reporting/notification-rules"
import { reportCacheRepository }    from "./modules/reporting/repositories/report-cache"

const HOUR = 3_600_000

console.log("[scheduler] started")

async function runNotifications() {
  console.log("[scheduler] running notification rules...")
  try {
    await notificationRulesService.runForAllTenants()
    console.log("[scheduler] notifications done")
  } catch (err) {
    console.error("[scheduler] notifications failed:", err)
  }
}

async function sweepCache() {
  console.log("[scheduler] sweeping expired cache...")
  try {
    const n = await reportCacheRepository.sweepExpired()
    console.log(`[scheduler] swept ${n} cache rows`)
  } catch (err) {
    console.error("[scheduler] sweep failed:", err)
  }
}

// Delay first runs so DB is ready
setTimeout(runNotifications, 30_000)
setTimeout(sweepCache,       60_000)

setInterval(runNotifications, 1 * HOUR)
setInterval(sweepCache,       6 * HOUR)

const shutdown = () => {
  console.log("[scheduler] shutting down")
  process.exit(0)
}
process.on("SIGINT",  shutdown)
process.on("SIGTERM", shutdown)
