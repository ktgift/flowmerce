import { ValidationError } from "./errors"

export function parseId(raw: string, label = "id"): number {
  const id = Number(raw)
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError(`${label} ต้องเป็นตัวเลขจำนวนเต็มบวก`, { received: raw })
  }
  return id
}
