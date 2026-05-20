import { drizzle } from "drizzle-orm/bun-sqlite"
import { Database } from "bun:sqlite"
import * as schema from "./schema"
import { runMigrations } from "./migrate"

const DB_PATH = process.env.DB_PATH
  ?? (process.env.NODE_ENV === "production" ? "/app/data/rag.db" : "rag.db")

const sqlite = new Database(DB_PATH)
sqlite.run("PRAGMA journal_mode = WAL;")
sqlite.run("PRAGMA foreign_keys = ON;")
runMigrations(sqlite)

export const db = drizzle({ client: sqlite, schema })