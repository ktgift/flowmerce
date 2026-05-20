import { traderStrategy }       from "./trader.strategy"
import type { VerticalStrategy } from "./strategy"
import type { Vertical }         from "shared"

const registry: Record<Vertical, VerticalStrategy> = {
  trader:  traderStrategy,
  hvac:    traderStrategy,
  generic: traderStrategy,
}

export function getVerticalStrategy(vertical: Vertical): VerticalStrategy {
  return registry[vertical] ?? traderStrategy
}
