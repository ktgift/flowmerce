import { Database } from "bun:sqlite"
import { DEFAULT_TENANT_ID } from "shared"

const DB_PATH = process.env.NODE_ENV === "production" ? "/app/data/rag.db" : "rag.db"
const sqlite = new Database(DB_PATH)

// ─── Seed Supplier: Kalsec (via Caldic Thailand) ────────────────────────────

const existingSupplier = sqlite
  .prepare(`SELECT id FROM suppliers WHERE code = ? AND tenant_id = ?`)
  .get("SUP-KAL", DEFAULT_TENANT_ID)

if (!existingSupplier) {
  sqlite
    .prepare(`
      INSERT INTO suppliers (tenant_id, code, name, tax_id, address, phone, email, contact_person, notes, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `)
    .run(
      DEFAULT_TENANT_ID,
      "SUP-KAL",
      "Kalsec (via Caldic Thailand, LLC)",
      "0100524000726",
      "B.B. Building, 18th Floor, Unit 1802, No. 54 Sukhumvit 21 Road (Asoke), Klongtoey-Nuea, Wattana, Bangkok 10110",
      "02-259-8500",
      "",
      "",
      "Supplier of Kalsec natural flavor extracts, oleoresins, and antioxidants. Price list Revision 100.",
    )
  console.log("Supplier SUP-KAL seeded.")
} else {
  console.log("Supplier SUP-KAL already exists, skipped.")
}

// ─── Seed Products: Kalsec ──────────────────────────────────────────────────

const kalsecProducts = [
  {
    code:        "KAL-001",
    name:        "DURALOX BLEND NV-3",
    description: "Kalsec product code: 62.510.02",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 62.510.02 | Price 15kg pail: $35.0 USD/kg | 3.2-3.4kg bottle: $41.0 USD/kg
  },
  {
    code:        "KAL-002",
    name:        "DURALOX BLEND AN-20 WD",
    description: "Kalsec product code: 62.220.35",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 62.220.35 | Price 15kg pail: $32.0 USD/kg | 3.2-3.4kg bottle: $38.0 USD/kg
  },
  {
    code:        "KAL-003",
    name:        "DURALOX BLEND MANC-213",
    description: "Kalsec product code: 62.220.32",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 62.220.32 | Price 15kg pail: $29.0 USD/kg | 3.2-3.4kg bottle: $35.0 USD/kg
  },
  {
    code:        "KAL-004",
    name:        "OLEORESIN SERRANO PEPPER, EXPELLER PRESSED",
    description: "Kalsec product code: 55.006.00.603",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 55.006.00.603 | Price 15kg pail: $300.0 USD/kg | 3.2-3.4kg bottle: $306.0 USD/kg
  },
  {
    code:        "KAL-005",
    name:        "Natural Toasted Serrano Pepper Type Flavor",
    description: "Kalsec product code: 22.55.081",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.55.081 | Price 15kg pail: $233.0 USD/kg | 3.2-3.4kg bottle: $239.0 USD/kg
  },
  {
    code:        "KAL-006",
    name:        "ISOFRESH WHITE ONION TYPE FLAVOT",
    description: "Kalsec product code: 22.51.028. PRODUCTION L/T 20 WK DAYS",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.51.028 | Price 15kg pail: $101.0 USD/kg | 3.2-3.4kg bottle: $107.0 USD/kg
  },
  {
    code:        "KAL-007",
    name:        "FRIED ONION CONCENTRATE",
    description: "Kalsec product code: 51.15. PRODUCTION L/T 10 WK DAYS",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 51.15 | Price 15kg pail: $120.0 USD/kg | 3.2-3.4kg bottle: $126.0 USD/kg
  },
  {
    code:        "KAL-008",
    name:        "NATURAL PEPPERONI SPICE FLAVOR",
    description: "Kalsec product code: 22.01.094. PRODUCTION L/T 20 WK DAYS",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.01.094 | Price 15kg pail: $54.55 USD/kg | 3.2-3.4kg bottle: $60.55 USD/kg
  },
  {
    code:        "KAL-009",
    name:        "SMOKED PAPRIKA TYPE FLAVOR- NATURAL",
    description: "Kalsec product code: 55.001.00.01. PRODUCTION L/T 20 WK DAYS",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 55.001.00.01 | Price 15kg pail: $305.0 USD/kg | 3.2-3.4kg bottle: $311.0 USD/kg
  },
  {
    code:        "KAL-010",
    name:        "HORSERADISH FLAVOR WONF NS",
    description: "Kalsec product code: 22.58.227. PRODUCTION L/T 10 WK DAYS",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.58.227 | Price 15kg pail: $52.05 USD/kg | 3.2-3.4kg bottle: $58.05 USD/kg
  },
  {
    code:        "KAL-011",
    name:        "GOCHUJANG TYPE FLAVOR",
    description: "Kalsec product code: 22.89.42. PRODUCTION L/T 10 WK DAYS",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.89.42 | Price 15kg pail: $32.0 USD/kg | 3.2-3.4kg bottle: $38.0 USD/kg
  },
  {
    code:        "KAL-012",
    name:        "KIMCHI SPICE",
    description: "Kalsec product code: 22.31.021. PRODUCTION L/T 10 WK DAYS",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.31.021 | Price 15kg pail: $46.0 USD/kg | 3.2-3.4kg bottle: $52.0 USD/kg
  },
  {
    code:        "KAL-013",
    name:        "NATURAL KIMCHI TYPE FLAVOR",
    description: "Kalsec product code: 22.02.054. PRODUCTION L/T 10 WK DAYS",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.02.054 | Price 15kg pail: $67.0 USD/kg | 3.2-3.4kg bottle: $73.0 USD/kg
  },
  {
    code:        "KAL-014",
    name:        "TACO SPICE",
    description: "Kalsec product code: 22.02.095. PRODUCTION L/T 10 WK DAYS",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.02.095 | Price 15kg pail: $50.0 USD/kg | 3.2-3.4kg bottle: $56.0 USD/kg
  },
  {
    code:        "KAL-015",
    name:        "AQUARSIN TACO SPICE",
    description: "Kalsec product code: 22.39.47. PRODUCTION L/T 10 WK DAYS",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.39.47 | Price 15kg pail: $52.6 USD/kg | 3.2-3.4kg bottle: $58.6 USD/kg
  },
  {
    code:        "KAL-016",
    name:        "AQUARESIN CURRY SPICE",
    description: "Kalsec product code: 22.39.132. PRODUCTION L/T 10 WK DAYS",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.39.132 | Price 15kg pail: $56.0 USD/kg | 3.2-3.4kg bottle: $62.0 USD/kg
  },
  {
    code:        "KAL-017",
    name:        "NA NASHVILLE HOT CHICKEN",
    description: "Kalsec product code: 22.55.082. PRODUCTION L/T 10 WK DAYS",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.55.082 | Price 15kg pail: $48.0 USD/kg | 3.2-3.4kg bottle: $54.0 USD/kg
  },
  {
    code:        "KAL-018",
    name:        "NATURAL LEMON PEPPER",
    description: "Kalsec product code: 22.48.023. PRODUCTION L/T 10 WK DAYS",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.48.023 | Price 15kg pail: $62.0 USD/kg | 3.2-3.4kg bottle: $68.0 USD/kg
  },
  {
    code:        "KAL-019",
    name:        "OLEORESIN DILL",
    description: "Kalsec product code: 11.05. PRODUCTION L/T 10 WK DAYS",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 11.05 | Price 15kg pail: $78.0 USD/kg | 3.2-3.4kg bottle: $84.0 USD/kg
  },
  {
    code:        "KAL-020",
    name:        "LEMONGRASS OIL SOLUBLE",
    description: "Kalsec product code: 48.007685. PRODUCTION L/T 10 WK DAYS",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 48.007685 | Price 15kg pail: $25.0 USD/kg | 3.2-3.4kg bottle: $31.0 USD/kg
  },
  {
    code:        "KAL-021",
    name:        "AQUARESIN TABASCO PEPPER",
    description: "Kalsec product code: 01.010.00.39. PRODUCTION L/T 10 WK DAYS",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 01.010.00.39 | Price 15kg pail: $32.0 USD/kg | 3.2-3.4kg bottle: $38.0 USD/kg
  },
  {
    code:        "KAL-022",
    name:        "NATIRAL BIRD'S EYE CHILI TYPF FLAVOR WATER SOLOBLE",
    description: "Kalsec product code: 22.01.102. PRODUCTION L/T 10 WK DAYS",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.01.102 | Price 15kg pail: $60.0 USD/kg | 3.2-3.4kg bottle: $66.0 USD/kg
  },
  {
    code:        "KAL-023",
    name:        "OLEORESIN CLILANTRO TYPE C",
    description: "Kalsec product code: 48.10.03. QUOTED ON 30 OCT 2024",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 48.10.03 | Price 15kg pail: $29.21 USD/kg | 3.2-3.4kg bottle: $35.21 USD/kg
  },
  {
    code:        "KAL-024",
    name:        "OLEORESIN WHITE PEPPER",
    description: "Kalsec product code: 43.02. QUOTED ON 30 OCT 2024",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 43.02 | Price 15kg pail: $224.0 USD/kg | 3.2-3.4kg bottle: $230.0 USD/kg
  },
  {
    code:        "KAL-025",
    name:        "OLEORESIN MARJORAM, NS",
    description: "Kalsec product code: 32.01. QUOTED ON 30 OCT 2024",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 32.01 | Price 15kg pail: $93.5 USD/kg | 3.2-3.4kg bottle: $99.5 USD/kg
  },
  {
    code:        "KAL-026",
    name:        "THAI ROASTED CHILI SPICES BLEND",
    description: "Kalsec product code: 22.607011. QUOTED ON 30 OCT 2024",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.607011 | Price 15kg pail: $46.5 USD/kg | 3.2-3.4kg bottle: $52.5 USD/kg
  },
  {
    code:        "KAL-027",
    name:        "OLEORESIN ROSEMARY, NS",
    description: "Kalsec product code: 19.01. QUOTED ON 30 OCT 2024",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 19.01 | Price 15kg pail: $69.8 USD/kg | 3.2-3.4kg bottle: $75.8 USD/kg
  },
  {
    code:        "KAL-028",
    name:        "OLEORESIN GHOST PEPPER, NS",
    description: "Kalsec product code: 55.150.01.603. QUOTED ON 30 OCT 2024",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 55.150.01.603 | Price 15kg pail: $131.95 USD/kg | 3.2-3.4kg bottle: $137.95 USD/kg
  },
  {
    code:        "KAL-029",
    name:        "OLEORESIN HABANERO PEPPER EXPELLER PRESED",
    description: "Kalsec product code: 55.013.01.603. QUOTED ON 30 OCT 2024",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 55.013.01.603 | Price 15kg pail: $223.35 USD/kg | 3.2-3.4kg bottle: $229.35 USD/kg
  },
  {
    code:        "KAL-030",
    name:        "OLEORESIN CAYENNE PEPPER EXPELLER PRESSED",
    description: "Kalsec product code: 55.009.02.603. QUOTED ON 30 OCT 2024",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 55.009.02.603 | Price 15kg pail: $145.0 USD/kg | 3.2-3.4kg bottle: $151.0 USD/kg
  },
  {
    code:        "KAL-031",
    name:        "OLEOREIN CELERY, FRENCH",
    description: "Kalsec product code: 09.04. QUOTED ON 30 OCT 2024",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 09.04 | Price 15kg pail: $28.0 USD/kg | 3.2-3.4kg bottle: $34.0 USD/kg
  },
  {
    code:        "KAL-032",
    name:        "TURMERIC EXTRACT IN CANOLA OIL",
    description: "Kalsec product code: 12.100.28. QUOTED ON 30 OCT 2024",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 12.100.28 | Price 15kg pail: $42.0 USD/kg | 3.2-3.4kg bottle: $48.0 USD/kg
  },
  {
    code:        "KAL-033",
    name:        "OLEORESIN GREEN GINGER",
    description: "Kalsec product code: 14.03. QUOTED ON 30 OCT 2024",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 14.03 | Price 15kg pail: $100.0 USD/kg | 3.2-3.4kg bottle: $106.0 USD/kg
  },
  {
    code:        "KAL-034",
    name:        "AQUARESIN CHILI SPICE",
    description: "Kalsec product code: 22.19.13. QUOTED ON 30 OCT 2024",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.19.13 | Price 15kg pail: $63.61 USD/kg | 3.2-3.4kg bottle: $69.61 USD/kg
  },
  {
    code:        "KAL-035",
    name:        "FRIED GARLIC CONCENTRATE",
    description: "Kalsec product code: 31.08.01. QUOTED ON 30 OCT 2024",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 31.08.01 | Price 15kg pail: $40.0 USD/kg | 3.2-3.4kg bottle: $46.0 USD/kg
  },
  {
    code:        "KAL-036",
    name:        "OLEORESIN ORIGANO, NS",
    description: "Kalsec product code: 33.01. QUOTED ON 30 OCT 2024",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 33.01 | Price 15kg pail: $120.46 USD/kg | 3.2-3.4kg bottle: $125.46 USD/kg
  },
  {
    code:        "KAL-037",
    name:        "AQUARESIN TURMERIC",
    description: "Kalsec product code: 12.150.39. ETA Kalsec Singapore in 8-11 weeks upon receive your order",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 12.150.39 | Price 15kg pail: $53.55 USD/kg | 3.2-3.4kg bottle: $59.55 USD/kg
  },
  {
    code:        "KAL-038",
    name:        "GARLIC OIL",
    description: "Kalsec product code: 31.24. ETA Kalsec Singapore in 8-11 weeks upon receive your order",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 31.24 | Price 15kg pail: $55.0 USD/kg | 3.2-3.4kg bottle: $61.0 USD/kg
  },
  {
    code:        "KAL-039",
    name:        "HORSERADISH FLAVOR",
    description: "Kalsec product code: 22.497075. 10 working days",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.497075 | Price 15kg pail: $43.05 USD/kg | 3.2-3.4kg bottle: $49.05 USD/kg
  },
  {
    code:        "KAL-040",
    name:        "natural pickled Jalapeno Type flavor",
    description: "Kalsec product code: 22.55.078. Kalmazoo oriiginal lead-time 8-11 weeks",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.55.078 | Price 15kg pail: $49.05 USD/kg | 3.2-3.4kg bottle: $55.05 USD/kg
  },
  {
    code:        "KAL-041",
    name:        "Vegetone rich Red T2",
    description: "Kalsec product code: 59.02. Kalmazoo oriiginal lead-time 8-11 weeks",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 59.02 | Price 15kg pail: $184.2 USD/kg | 3.2-3.4kg bottle: $190.2 USD/kg
  },
  {
    code:        "KAL-042",
    name:        "oil of Dillweed, prime",
    description: "Kalsec product code: 11.01",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 11.01 | Price 15kg pail: $68.95 USD/kg | 3.2-3.4kg bottle: $74.95 USD/kg
  },
  {
    code:        "KAL-043",
    name:        "Aquaresin dillweed",
    description: "Kalsec product code: 11.02.49",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 11.02.49 | Price 15kg pail: $56.0 USD/kg | 3.2-3.4kg bottle: $62.0 USD/kg
  },
  {
    code:        "KAL-044",
    name:        "OIL OF LEMON, SINGLE STRENGTH",
    description: "Kalsec product code: 48.48. DG Class 3 good",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 48.48 | Price 15kg pail: $32.0 USD/kg | 3.2-3.4kg bottle: $38.0 USD/kg
  },
  {
    code:        "KAL-045",
    name:        "OLEORESIN FENNEL",
    description: "Kalsec product code: 56.01",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 56.01 | Price 15kg pail: $54.05 USD/kg | 3.2-3.4kg bottle: $60.05 USD/kg
  },
  {
    code:        "KAL-046",
    name:        "OIL OF FENNEL",
    description: "Kalsec product code: 56.02",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 56.02 | Price 15kg pail: $89.05 USD/kg | 3.2-3.4kg bottle: $95.05 USD/kg
  },
  {
    code:        "KAL-047",
    name:        "SHALLOT OIL SOLUBLE, NS",
    description: "Kalsec product code: 70.497016",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 70.497016 | Price 15kg pail: $33.05 USD/kg | 3.2-3.4kg bottle: $39.05 USD/kg
  },
  {
    code:        "KAL-048",
    name:        "OLEORESIN CAPSICUM, AFRICAN, NS",
    description: "Kalsec product code: 01.473003. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 01.473003 | Price 15kg pail: $33.55 USD/kg | 3.2-3.4kg bottle: $39.55 USD/kg
  },
  {
    code:        "KAL-049",
    name:        "CLEARCAP® SUPER SOLUBLE CAPSICUM",
    description: "Kalsec product code: 01.025.00.06. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 01.025.00.06 | Price 15kg pail: $18.3 USD/kg | 3.2-3.4kg bottle: $24.3 USD/kg
  },
  {
    code:        "KAL-050",
    name:        "AQUARESIN® CAPSICUM, NS",
    description: "Kalsec product code: 01.030.02.639. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 01.030.02.639 | Price 15kg pail: $34.8 USD/kg | 3.2-3.4kg bottle: $40.8 USD/kg
  },
  {
    code:        "KAL-051",
    name:        "CLEARCAP® SUPER SOLUBLE CAPSICUM",
    description: "Kalsec product code: 01.050.00.06. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 01.050.00.06 | Price 15kg pail: $21.74 USD/kg | 3.2-3.4kg bottle: $27.74 USD/kg
  },
  {
    code:        "KAL-052",
    name:        "AQUARESIN® CAPSICUM, DECOLORIZED, NS",
    description: "Kalsec product code: 01.050.00.39. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 01.050.00.39 | Price 15kg pail: $33.0 USD/kg | 3.2-3.4kg bottle: $39.0 USD/kg
  },
  {
    code:        "KAL-053",
    name:        "OLEORESIN CAPSICUM, DECOLORIZED, NS",
    description: "Kalsec product code: 01.100.00.03. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 01.100.00.03 | Price 15kg pail: $62.8 USD/kg | 3.2-3.4kg bottle: $68.8 USD/kg
  },
  {
    code:        "KAL-054",
    name:        "OLEORESIN CAPSICUM, AFRICAN, NS",
    description: "Kalsec product code: 01.100.03.03. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 01.100.03.03 | Price 15kg pail: $25.9 USD/kg | 3.2-3.4kg bottle: $31.9 USD/kg
  },
  {
    code:        "KAL-055",
    name:        "OLEORESIN CAPSICUM, NS",
    description: "Kalsec product code: 01.100.20.03. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 01.100.20.03 | Price 15kg pail: $52.4 USD/kg | 3.2-3.4kg bottle: $58.4 USD/kg
  },
  {
    code:        "KAL-056",
    name:        "AQUARESIN® PAPRIKA, NS",
    description: "Kalsec product code: 02.040.39. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 02.040.39 | Price 15kg pail: $36.9 USD/kg | 3.2-3.4kg bottle: $42.9 USD/kg
  },
  {
    code:        "KAL-057",
    name:        "DURABRITE® OLEORESIN PAPRIKA, NS",
    description: "Kalsec product code: 02.080.30. the quotation will effect from 30th May 2025 till 31st Dec 2025, but I will need your commitment to confirm the switch of origin by 29th May",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 02.080.30 | Price 15kg pail: $47.65 USD/kg | 3.2-3.4kg bottle: $53.65 USD/kg
  },
  {
    code:        "KAL-058",
    name:        "OLEORESIN BLACK PEPPER",
    description: "Kalsec product code: 03.01. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 03.01 | Price 15kg pail: $77.7 USD/kg | 3.2-3.4kg bottle: $83.7 USD/kg
  },
  {
    code:        "KAL-059",
    name:        "OLEORESIN BLACK PEPPER",
    description: "Kalsec product code: 03.21. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 03.21 | Price 15kg pail: $152.4 USD/kg | 3.2-3.4kg bottle: $158.4 USD/kg
  },
  {
    code:        "KAL-060",
    name:        "AQUARESIN® BLACK PEPPER,NS",
    description: "Kalsec product code: 03.21.39. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 03.21.39 | Price 15kg pail: $77.3 USD/kg | 3.2-3.4kg bottle: $83.3 USD/kg
  },
  {
    code:        "KAL-061",
    name:        "AQUARESIN® CLOVE, NS",
    description: "Kalsec product code: 05.03.39. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 05.03.39 | Price 15kg pail: $62.31 USD/kg | 3.2-3.4kg bottle: $68.31 USD/kg
  },
  {
    code:        "KAL-062",
    name:        "OLEORESIN SAGE, DALMATIAN, NS",
    description: "Kalsec product code: 07.06. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 07.06 | Price 15kg pail: $54.51 USD/kg | 3.2-3.4kg bottle: $60.51 USD/kg
  },
  {
    code:        "KAL-063",
    name:        "OLEORESIN SAGE, NS",
    description: "Kalsec product code: 07.11. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 07.11 | Price 15kg pail: $101.45 USD/kg | 3.2-3.4kg bottle: $107.45 USD/kg
  },
  {
    code:        "KAL-064",
    name:        "OLEORESIN CELERY, SWEET",
    description: "Kalsec product code: 09.07. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 09.07 | Price 15kg pail: $54.65 USD/kg | 3.2-3.4kg bottle: $60.65 USD/kg
  },
  {
    code:        "KAL-065",
    name:        "SIMPLY AQUARESIN™ TURMERIC G-1",
    description: "Kalsec product code: 12.075.101. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 12.075.101 | Price 15kg pail: $33.275000000000006 USD/kg | 3.2-3.4kg bottle: $39.28 USD/kg
  },
  {
    code:        "KAL-066",
    name:        "OLEORESIN GINGER",
    description: "Kalsec product code: 13.01. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 13.01 | Price 15kg pail: $144.23 USD/kg | 3.2-3.4kg bottle: $150.23 USD/kg
  },
  {
    code:        "KAL-067",
    name:        "SUPER SOLUBLE GREEN GINGER",
    description: "Kalsec product code: 13.05. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 13.05 | Price 15kg pail: $113.3 USD/kg | 3.2-3.4kg bottle: $119.3 USD/kg
  },
  {
    code:        "KAL-068",
    name:        "OIL OF GINGER",
    description: "Kalsec product code: 14.01. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 14.01 | Price 15kg pail: $166.35 USD/kg | 3.2-3.4kg bottle: $172.35 USD/kg
  },
  {
    code:        "KAL-069",
    name:        "OLEORESIN MACE",
    description: "Kalsec product code: 15.01. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 15.01 | Price 15kg pail: $112.8 USD/kg | 3.2-3.4kg bottle: $118.8 USD/kg
  },
  {
    code:        "KAL-070",
    name:        "AQ ROSEMARY NS 19-06-39",
    description: "Kalsec product code: 19.06.39. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 19.06.39 | Price 15kg pail: $45.0 USD/kg | 3.2-3.4kg bottle: $51.0 USD/kg
  },
  {
    code:        "KAL-071",
    name:        "AQUARESIN® ITALIAN SPICE, NS",
    description: "Kalsec product code: 22.007558. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.007558 | Price 15kg pail: $72.0 USD/kg | 3.2-3.4kg bottle: $78.0 USD/kg
  },
  {
    code:        "KAL-072",
    name:        "NATURAL MEXICAN STYLE SEASONING EXTRACTS",
    description: "Kalsec product code: 22.037474. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.037474 | Price 15kg pail: $42.0 USD/kg | 3.2-3.4kg bottle: $48.0 USD/kg
  },
  {
    code:        "KAL-073",
    name:        "ZERO DEGREES® HABANERO WONF, OS",
    description: "Kalsec product code: 22.087305. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.087305 | Price 15kg pail: $55.45 USD/kg | 3.2-3.4kg bottle: $61.45 USD/kg
  },
  {
    code:        "KAL-074",
    name:        "HABANERO PEPPER FLAVOR WONF",
    description: "Kalsec product code: 22.01.036. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.01.036 | Price 15kg pail: $61.15 USD/kg | 3.2-3.4kg bottle: $67.15 USD/kg
  },
  {
    code:        "KAL-075",
    name:        "OLEORESIN CHILI SPICE, NO HEAT, NS",
    description: "Kalsec product code: 22.02.029. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.02.029 | Price 15kg pail: $33.0 USD/kg | 3.2-3.4kg bottle: $39.0 USD/kg
  },
  {
    code:        "KAL-076",
    name:        "OLEORESIN CHILI SPICE, MILD, NS",
    description: "Kalsec product code: 22.02.158. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.02.158 | Price 15kg pail: $34.95 USD/kg | 3.2-3.4kg bottle: $40.95 USD/kg
  },
  {
    code:        "KAL-077",
    name:        "OLEORESIN CHILI SPICE, HOT, NS",
    description: "Kalsec product code: 22.02.177. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.02.177 | Price 15kg pail: $33.0 USD/kg | 3.2-3.4kg bottle: $39.0 USD/kg
  },
  {
    code:        "KAL-078",
    name:        "OLEORESIN CHILI SPICE, MEDIUM, NS",
    description: "Kalsec product code: 22.02.179. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.02.179 | Price 15kg pail: $37.92 USD/kg | 3.2-3.4kg bottle: $43.92 USD/kg
  },
  {
    code:        "KAL-079",
    name:        "AQUARESIN® TERIYAKI SPICE, NS",
    description: "Kalsec product code: 22.13.001. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.13.001 | Price 15kg pail: $60.7 USD/kg | 3.2-3.4kg bottle: $66.7 USD/kg
  },
  {
    code:        "KAL-080",
    name:        "AQUARESIN® CHILI SPICE, NS",
    description: "Kalsec product code: 22.19.137. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.19.137 | Price 15kg pail: $63.61 USD/kg | 3.2-3.4kg bottle: $69.61 USD/kg
  },
  {
    code:        "KAL-081",
    name:        "AQUARESIN® CAJUN SPICE, NS",
    description: "Kalsec product code: 22.39.163. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.39.163 | Price 15kg pail: $58.300000000000004 USD/kg | 3.2-3.4kg bottle: $64.3 USD/kg
  },
  {
    code:        "KAL-082",
    name:        "OLEORESIN CHILI SPICE, NS",
    description: "Kalsec product code: 22.39.171. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.39.171 | Price 15kg pail: $81.15 USD/kg | 3.2-3.4kg bottle: $87.15 USD/kg
  },
  {
    code:        "KAL-083",
    name:        "AQUARESIN® TANDOORI SPICE, NS",
    description: "Kalsec product code: 22.39.202. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.39.202 | Price 15kg pail: $67.33 USD/kg | 3.2-3.4kg bottle: $73.33 USD/kg
  },
  {
    code:        "KAL-084",
    name:        "SPICED HABANERO",
    description: "Kalsec product code: 22.48.044. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.48.044 | Price 15kg pail: $89.0 USD/kg | 3.2-3.4kg bottle: $95.0 USD/kg
  },
  {
    code:        "KAL-085",
    name:        "KIMCHI SPICE, O/S",
    description: "Kalsec product code: 22.51.023. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.51.023 | Price 15kg pail: $42.85 USD/kg | 3.2-3.4kg bottle: $48.85 USD/kg
  },
  {
    code:        "KAL-086",
    name:        "GREEN BELL PEPPER FLAVOR WONF",
    description: "Kalsec product code: 22.55.009. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.55.009 | Price 15kg pail: $65.8 USD/kg | 3.2-3.4kg bottle: $71.8 USD/kg
  },
  {
    code:        "KAL-087",
    name:        "GOCHUJANG TYPE FLAVOR - NATURAL",
    description: "Kalsec product code: 22.89.23. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.89.23 | Price 15kg pail: $46.35 USD/kg | 3.2-3.4kg bottle: $52.35 USD/kg
  },
  {
    code:        "KAL-088",
    name:        "SUN DRIED TOMATO FLAVOR",
    description: "Kalsec product code: 22.89.25. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.89.25 | Price 15kg pail: $42.1 USD/kg | 3.2-3.4kg bottle: $48.1 USD/kg
  },
  {
    code:        "KAL-089",
    name:        "TOASTED SESAME TYPE FLAVOR - NATURAL",
    description: "Kalsec product code: 22.91.031. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.91.031 | Price 15kg pail: $73.0 USD/kg | 3.2-3.4kg bottle: $79.0 USD/kg
  },
  {
    code:        "KAL-090",
    name:        "OLEORESIN BBQ GRILL SPICE WITH SMOKE W/D, NS",
    description: "Kalsec product code: 22.507209. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.507209 | Price 15kg pail: $35.0 USD/kg | 3.2-3.4kg bottle: $41.0 USD/kg
  },
  {
    code:        "KAL-091",
    name:        "Natural Kimchi Spice Type Flavor",
    description: "Kalsec product code: 22.697012. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.697012 | Price 15kg pail: $41.0 USD/kg | 3.2-3.4kg bottle: $47.0 USD/kg
  },
  {
    code:        "KAL-092",
    name:        "OLEORESIN ALLSPICE, NS",
    description: "Kalsec product code: 23.06. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 23.06 | Price 15kg pail: $213.0 USD/kg | 3.2-3.4kg bottle: $219.0 USD/kg
  },
  {
    code:        "KAL-093",
    name:        "OLEORESIN CINNAMON",
    description: "Kalsec product code: 29.01. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 29.01 | Price 15kg pail: $131.45 USD/kg | 3.2-3.4kg bottle: $137.45 USD/kg
  },
  {
    code:        "KAL-094",
    name:        "GARLIC O/S, NS",
    description: "Kalsec product code: 31.08. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 31.08 | Price 15kg pail: $32.0 USD/kg | 3.2-3.4kg bottle: $38.0 USD/kg
  },
  {
    code:        "KAL-095",
    name:        "NATURAL SMOKED GARLIC TYPE FLAVOR",
    description: "Kalsec product code: 31.097472. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 31.097472 | Price 15kg pail: $38.0 USD/kg | 3.2-3.4kg bottle: $44.0 USD/kg
  },
  {
    code:        "KAL-096",
    name:        "NATURAL FIRE ROASTED GARLIC TYPE FLAVOR",
    description: "Kalsec product code: 31.097551. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 31.097551 | Price 15kg pail: $34.2 USD/kg | 3.2-3.4kg bottle: $40.2 USD/kg
  },
  {
    code:        "KAL-097",
    name:        "AQUARESIN® GARLIC, NS",
    description: "Kalsec product code: 31.10.39. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 31.10.39 | Price 15kg pail: $32.63 USD/kg | 3.2-3.4kg bottle: $38.63 USD/kg
  },
  {
    code:        "KAL-098",
    name:        "AQUARESIN® THYME, NS",
    description: "Kalsec product code: 35.06.39. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 35.06.39 | Price 15kg pail: $143.65 USD/kg | 3.2-3.4kg bottle: $149.65 USD/kg
  },
  {
    code:        "KAL-099",
    name:        "ACID PROOF ANNATTO, TYPENG",
    description: "Kalsec product code: 37.160.27. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 37.160.27 | Price 15kg pail: $23.0 USD/kg | 3.2-3.4kg bottle: $29.0 USD/kg
  },
  {
    code:        "KAL-100",
    name:        "GARLIC, OIL SOLUBLE, 80X, NS",
    description: "Kalsec product code: 31.22. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 31.22 | Price 15kg pail: $46.05 USD/kg | 3.2-3.4kg bottle: $52.05 USD/kg
  },
  {
    code:        "KAL-101",
    name:        "THAI GARLIC REPLACER",
    description: "Kalsec product code: 31.28. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 31.28 | Price 15kg pail: $50.35 USD/kg | 3.2-3.4kg bottle: $56.35 USD/kg
  },
  {
    code:        "KAL-102",
    name:        "OLEORESIN CUMIN",
    description: "Kalsec product code: 34.02. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 34.02 | Price 15kg pail: $119.3 USD/kg | 3.2-3.4kg bottle: $125.3 USD/kg
  },
  {
    code:        "KAL-103",
    name:        "OLEORESIN ROSEMARY, HERBALOX® BRAND, TYPE  XT-W",
    description: "Kalsec product code: 41.098332. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 41.098332 | Price 15kg pail: $42.0 USD/kg | 3.2-3.4kg bottle: $48.0 USD/kg
  },
  {
    code:        "KAL-104",
    name:        "OLEORESIN ROSEMARY, HERBALOX® BRAND, TYPE O, NS",
    description: "Kalsec product code: 41.19.16. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 41.19.16 | Price 15kg pail: $38.75 USD/kg | 3.2-3.4kg bottle: $44.75 USD/kg
  },
  {
    code:        "KAL-105",
    name:        "OLEORESIN ROSEMARY, HERBALOX® BRAND",
    description: "Kalsec product code: 41.19.52. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 41.19.52 | Price 15kg pail: $71.05 USD/kg | 3.2-3.4kg bottle: $77.05 USD/kg
  },
  {
    code:        "KAL-106",
    name:        "AQUARESIN® CILANTRO",
    description: "Kalsec product code: 48.10.19. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 48.10.19 | Price 15kg pail: $62.0 USD/kg | 3.2-3.4kg bottle: $68.0 USD/kg
  },
  {
    code:        "KAL-107",
    name:        "AQUARESIN® OIL OF LEMON",
    description: "Kalsec product code: 48.48.19. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 48.48.19 | Price 15kg pail: $85.45 USD/kg | 3.2-3.4kg bottle: $91.45 USD/kg
  },
  {
    code:        "KAL-108",
    name:        "AQUARESIN® OIL OF LIME",
    description: "Kalsec product code: 48.50.19. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 48.50.19 | Price 15kg pail: $76.8 USD/kg | 3.2-3.4kg bottle: $82.8 USD/kg
  },
  {
    code:        "KAL-109",
    name:        "SZECHUAN PEPPER OLEORESIN",
    description: "Kalsec product code: 48.002. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 48.002 | Price 15kg pail: $159.0 USD/kg | 3.2-3.4kg bottle: $165.0 USD/kg
  },
  {
    code:        "KAL-110",
    name:        "DURABRITE® OLEORESIN CARROT, 2%",
    description: "Kalsec product code: 49.13. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 49.13 | Price 15kg pail: $130.74 USD/kg | 3.2-3.4kg bottle: $136.74 USD/kg
  },
  {
    code:        "KAL-111",
    name:        "NATURAL ROASTED ONION TYPE FLAVOR",
    description: "Kalsec product code: 51.097506. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 51.097506 | Price 15kg pail: $26.65 USD/kg | 3.2-3.4kg bottle: $32.65 USD/kg
  },
  {
    code:        "KAL-112",
    name:        "NATURAL CARAMELIZED ONION FLAVOR WONF",
    description: "Kalsec product code: 51.43. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 51.43 | Price 15kg pail: $18.4 USD/kg | 3.2-3.4kg bottle: $24.4 USD/kg
  },
  {
    code:        "KAL-113",
    name:        "ONION, OIL SOLUBLE, NS",
    description: "Kalsec product code: 51.44. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 51.44 | Price 15kg pail: $47.37 USD/kg | 3.2-3.4kg bottle: $53.37 USD/kg
  },
  {
    code:        "KAL-114",
    name:        "GREEN ONION, OIL SOLUBLE, NS",
    description: "Kalsec product code: 51.987923. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 51.987923 | Price 15kg pail: $35.25 USD/kg | 3.2-3.4kg bottle: $41.25 USD/kg
  },
  {
    code:        "KAL-115",
    name:        "CHIPOTLE [SMOKED PEPPER]FLAVOR",
    description: "Kalsec product code: 55.097493. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 55.097493 | Price 15kg pail: $46.0 USD/kg | 3.2-3.4kg bottle: $52.0 USD/kg
  },
  {
    code:        "KAL-116",
    name:        "OLEORESIN MUSTARD, NS",
    description: "Kalsec product code: 58.007449. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 58.007449 | Price 15kg pail: $34.0 USD/kg | 3.2-3.4kg bottle: $40.0 USD/kg
  },
  {
    code:        "KAL-117",
    name:        "AQUARESIN® ONION",
    description: "Kalsec product code: 51.10.39. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 51.10.39 | Price 15kg pail: $33.66 USD/kg | 3.2-3.4kg bottle: $39.66 USD/kg
  },
  {
    code:        "KAL-118",
    name:        "AQUARESIN® ONION, NS",
    description: "Kalsec product code: 51.18.39. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 51.18.39 | Price 15kg pail: $43.95 USD/kg | 3.2-3.4kg bottle: $49.95 USD/kg
  },
  {
    code:        "KAL-119",
    name:        "COPPER CHLOROPHYLLIN W/S-100",
    description: "Kalsec product code: 52.100.04. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 52.100.04 | Price 15kg pail: $81.05 USD/kg | 3.2-3.4kg bottle: $87.05 USD/kg
  },
  {
    code:        "KAL-120",
    name:        "AQUARESIN® CHIPOTLE, NS",
    description: "Kalsec product code: 55.004.00.39. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 55.004.00.39 | Price 15kg pail: $111.9 USD/kg | 3.2-3.4kg bottle: $117.9 USD/kg
  },
  {
    code:        "KAL-121",
    name:        "AQUARESIN® CHIPOTLE PEPPER EXTRACT, NS",
    description: "Kalsec product code: 55.005.03.39. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 55.005.03.39 | Price 15kg pail: $103.0 USD/kg | 3.2-3.4kg bottle: $109.0 USD/kg
  },
  {
    code:        "KAL-122",
    name:        "OLEORESIN JALAPENO PEPPEREXTRACT, HOT, NS",
    description: "Kalsec product code: 55.020.00.01. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 55.020.00.01 | Price 15kg pail: $68.9 USD/kg | 3.2-3.4kg bottle: $74.9 USD/kg
  },
  {
    code:        "KAL-123",
    name:        "AQUARESIN® JALAPENO PEPPER EXTRACT, HOT, NS",
    description: "Kalsec product code: 55.020.00.39. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 55.020.00.39 | Price 15kg pail: $48.2 USD/kg | 3.2-3.4kg bottle: $54.2 USD/kg
  },
  {
    code:        "KAL-124",
    name:        "SRIRACHA SPICE FLAVOR",
    description: "Kalsec product code: 63.02.77. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 63.02.77 | Price 15kg pail: $62.42 USD/kg | 3.2-3.4kg bottle: $68.42 USD/kg
  },
  {
    code:        "KAL-125",
    name:        "DURALOX® AQUARESIN® BOLOGNA SEASONING, NS",
    description: "Kalsec product code: 63.19.29. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 63.19.29 | Price 15kg pail: $36.5 USD/kg | 3.2-3.4kg bottle: $42.5 USD/kg
  },
  {
    code:        "KAL-126",
    name:        "FRIED FLAVOR - SHALLOT TYPE",
    description: "Kalsec product code: 70.04. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 70.04 | Price 15kg pail: $22.35 USD/kg | 3.2-3.4kg bottle: $28.35 USD/kg
  },
  {
    code:        "KAL-127",
    name:        "Natural Fried Shallot Type Flavor",
    description: "Kalsec product code: 70.097447. Contract 2025",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 70.097447 | Price 15kg pail: $35.05 USD/kg | 3.2-3.4kg bottle: $41.05 USD/kg
  },
  {
    code:        "KAL-128",
    name:        "VEGETONE RADIANT YELLOW",
    description: "Kalsec product code: 49.59.02. EXW SENOKO SINGAPORE",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 49.59.02 | Price 15kg pail: $54.45 USD/kg | 3.2-3.4kg bottle: $60.45 USD/kg
  },
  {
    code:        "KAL-129",
    name:        "NATURAL SAUTEE SWEET ONION",
    description: "Kalsec product code: 51.097520. EXW SENOKO SINGAPORE",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 51.097520 | Price 15kg pail: $31.05 USD/kg | 3.2-3.4kg bottle: $37.05 USD/kg
  },
  {
    code:        "KAL-130",
    name:        "VEGETONE YELLOW OS",
    description: "Kalsec product code: 66.100.001. EXW SENOKO SINGAPORE",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 66.100.001 | Price 15kg pail: $102.0 USD/kg | 3.2-3.4kg bottle: $108.0 USD/kg
  },
  {
    code:        "KAL-131",
    name:        "NATURAL SHALLOT FLAVOR WONF",
    description: "Kalsec product code: 22.89.60. EXW SENOKO SINGAPORE",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.89.60 | Price 15kg pail: $30.95 USD/kg | 3.2-3.4kg bottle: $36.95 USD/kg
  },
  {
    code:        "KAL-132",
    name:        "VEGETON ANTOHO RED 3-1",
    description: "Kalsec product code: 40.03.01. EXW SENOKO SINGAPORE",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 40.03.01 | Price 15kg pail: $62.0 USD/kg | 3.2-3.4kg bottle: $68.0 USD/kg
  },
  {
    code:        "KAL-133",
    name:        "OLEORESIN TABASCO PEPPER EXTRACT",
    description: "Kalsec product code: 01.010.00.601. EXW SENOKO SINGAPORE",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 01.010.00.601 | Price 15kg pail: $37.0 USD/kg | 3.2-3.4kg bottle: $43.0 USD/kg
  },
  {
    code:        "KAL-134",
    name:        "Tom Yam Spice Blend",
    description: "Kalsec product code: 22.607004. EXW SENOKO SINGAPORE",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.607004 | Price 15kg pail: $50.95 USD/kg | 3.2-3.4kg bottle: $56.95 USD/kg
  },
  {
    code:        "KAL-135",
    name:        "Duralox Aquaresin Tom Yam spice blend",
    description: "Kalsec product code: 63.48.03. EXW SENOKO SINGAPORE",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 63.48.03 | Price 15kg pail: $51.05 USD/kg | 3.2-3.4kg bottle: $57.05 USD/kg
  },
  {
    code:        "KAL-136",
    name:        "NATURAL FRIED SHALLOT",
    description: "Kalsec product code: 22.89.63. EXW SENOKO SINGAPORE / LT 6-8 WEEKS",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.89.63 | Price 15kg pail: $30.05 USD/kg | 3.2-3.4kg bottle: $36.05 USD/kg
  },
  {
    code:        "KAL-137",
    name:        "OIL OF SAGE, DALMATIAN",
    description: "Kalsec product code: 08.02. EXW SENOKO SINGAPORE / DG Good class 3",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 08.02 | Price 15kg pail: $156.55 USD/kg | 3.2-3.4kg bottle: $162.55 USD/kg
  },
  {
    code:        "KAL-138",
    name:        "MAPLE TYPE FLAVOR - NATURAL OS",
    description: "Kalsec product code: 22.89.15. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.89.15 | Price 15kg pail: $30.05 USD/kg | 3.2-3.4kg bottle: $36.05 USD/kg
  },
  {
    code:        "KAL-139",
    name:        "THAI GARLIC AND CORIANDER ROOT TYPE BLEND",
    description: "Kalsec product code: 22.607014. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.607014 | Price 15kg pail: $50.05 USD/kg | 3.2-3.4kg bottle: $56.05 USD/kg
  },
  {
    code:        "KAL-140",
    name:        "OLEORESIN JAPAPENO PEPPER EXTRACT MILD",
    description: "Kalsec product code: 55.005.00.01. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 55.005.00.01 | Price 15kg pail: $53.05 USD/kg | 3.2-3.4kg bottle: $59.05 USD/kg
  },
  {
    code:        "KAL-141",
    name:        "MALAYSIAN CURRY FLAVOR",
    description: "Kalsec product code: 22.607021. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.607021 | Price 15kg pail: $61.05 USD/kg | 3.2-3.4kg bottle: $67.05 USD/kg
  },
  {
    code:        "KAL-142",
    name:        "OLEORESIN CHIPOTLE PEPPER EXPELLER PRESSED",
    description: "Kalsec product code: 55.005.03.01. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 55.005.03.01 | Price 15kg pail: $130.0 USD/kg | 3.2-3.4kg bottle: $136.0 USD/kg
  },
  {
    code:        "KAL-143",
    name:        "AQUARESIN JAPANESE CURRY",
    description: "Kalsec product code: 63.497001. EXW SENOKO SINGAPORE",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 63.497001 | Price 15kg pail: $41.0 USD/kg | 3.2-3.4kg bottle: $47.0 USD/kg
  },
  {
    code:        "KAL-144",
    name:        "AQUARESIN JALAPENO, EXTRA MILD, NS",
    description: "Kalsec product code: 55.001.00.39. EXW SENOKO SINGAPORE",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 55.001.00.39 | Price 15kg pail: $78.0 USD/kg | 3.2-3.4kg bottle: $84.0 USD/kg
  },
  {
    code:        "KAL-145",
    name:        "CLEARCAP® GHOST PEPPER EXTRACT",
    description: "Kalsec product code: 01.050.01.606. EXW SENOKO SINGAPORE",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 01.050.01.606 | Price 15kg pail: $60.0 USD/kg | 3.2-3.4kg bottle: $66.0 USD/kg
  },
  {
    code:        "KAL-146",
    name:        "CARMINE LIQUID",
    description: "Kalsec product code: 44.91.033. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 44.91.033 | Price 15kg pail: $46.0 USD/kg | 3.2-3.4kg bottle: $52.0 USD/kg
  },
  {
    code:        "KAL-147",
    name:        "OLEORESIN ROSEMARY, HERBALOX BRAND XT-O 41.19.58",
    description: "Kalsec product code: 41.19.58. Incoterms: EXW Singapore. Product origin: made in USA",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 41.19.58 | Price 15kg pail: $34.05 USD/kg | 3.2-3.4kg bottle: $40.05 USD/kg
  },
  {
    code:        "KAL-148",
    name:        "Natural Paprika Flaovr",
    description: "Kalsec product code: 22.02.020. EXW SENOKO SINGAPORE",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.02.020 | Price 15kg pail: $60.0 USD/kg | 3.2-3.4kg bottle: $66.0 USD/kg
  },
  {
    code:        "KAL-149",
    name:        "ONION CONCENTRATE NS",
    description: "Kalsec product code: 51.25. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 51.25 | Price 15kg pail: $116.0 USD/kg | 3.2-3.4kg bottle: $122.0 USD/kg
  },
  {
    code:        "KAL-150",
    name:        "ISOFRESH BASIL",
    description: "Kalsec product code: 22.47.008. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.47.008 | Price 15kg pail: $106.0 USD/kg | 3.2-3.4kg bottle: $112.0 USD/kg
  },
  {
    code:        "KAL-151",
    name:        "OLEORESIN CLOVE NS",
    description: "Kalsec product code: 05.03. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 05.03 | Price 15kg pail: $102.0 USD/kg | 3.2-3.4kg bottle: $108.0 USD/kg
  },
  {
    code:        "KAL-152",
    name:        "OLEORESIN GARAM MASALA,NS",
    description: "Kalsec product code: 22.29.192. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.29.192 | Price 15kg pail: $155.0 USD/kg | 3.2-3.4kg bottle: $161.0 USD/kg
  },
  {
    code:        "KAL-153",
    name:        "SOLUBLE KAFFIR LIME LEAF, NS",
    description: "Kalsec product code: 48.067171. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 48.067171 | Price 15kg pail: $50.0 USD/kg | 3.2-3.4kg bottle: $56.0 USD/kg
  },
  {
    code:        "KAL-154",
    name:        "AQUARESIN® LEMONGRASS, TYPE C",
    description: "Kalsec product code: 48.49.39. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 48.49.39 | Price 15kg pail: $40.0 USD/kg | 3.2-3.4kg bottle: $46.0 USD/kg
  },
  {
    code:        "KAL-155",
    name:        "OIL OF BASIL, SWEET",
    description: "Kalsec product code: 47.03P. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 47.03P | Price 15kg pail: $301.0 USD/kg | 3.2-3.4kg bottle: $307.0 USD/kg
  },
  {
    code:        "KAL-156",
    name:        "DURALOX® BLEND QST-25, NS",
    description: "Kalsec product code: 62.225.05. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 62.225.05 | Price 15kg pail: $30.0 USD/kg | 3.2-3.4kg bottle: $36.0 USD/kg
  },
  {
    code:        "KAL-157",
    name:        "SAVORY FLAVOR BOOSTER",
    description: "Kalsec product code: 68.65.005. EXW Singapore, The pack size of this item is only in 11.34kg",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 68.65.005 | Price 15kg pail: $nan USD/kg | 3.2-3.4kg bottle: $nan USD/kg
  },
  {
    code:        "KAL-158",
    name:        "Fermented Red Pepper WONF OS",
    description: "Kalsec product code: 22.01.106. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.01.106 | Price 15kg pail: $31.0 USD/kg | 3.2-3.4kg bottle: $37.0 USD/kg
  },
  {
    code:        "KAL-159",
    name:        "AQUARESIN® OIL OF LIME, NS",
    description: "Kalsec product code: 49.29. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 49.29 | Price 15kg pail: $99.0 USD/kg | 3.2-3.4kg bottle: $105.0 USD/kg
  },
  {
    code:        "KAL-160",
    name:        "AQUARESIN® OIL OF LIME, NS",
    description: "Kalsec product code: 48.517141. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 48.517141 | Price 15kg pail: $nan USD/kg | 3.2-3.4kg bottle: $56.0 USD/kg
  },
  {
    code:        "KAL-161",
    name:        "OVEN ROASTED TOMATO FLAVOR WONF",
    description: "Kalsec product code: 22.89.47. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.89.47 | Price 15kg pail: $40.5 USD/kg | 3.2-3.4kg bottle: $46.5 USD/kg
  },
  {
    code:        "KAL-162",
    name:        "OLEORESIN PIZZA SPICE, NS",
    description: "Kalsec product code: 22.47.004. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.47.004 | Price 15kg pail: $120.0 USD/kg | 3.2-3.4kg bottle: $126.0 USD/kg
  },
  {
    code:        "KAL-163",
    name:        "NATURAL ROASTED GARLIC FLAVOR WONF",
    description: "Kalsec product code: 31.56. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 31.56 | Price 15kg pail: $25.0 USD/kg | 3.2-3.4kg bottle: $31.0 USD/kg
  },
  {
    code:        "KAL-164",
    name:        "OLEORESIN ROSEMARY, HERBALOX® BRAND, TYPE HT-O, NS",
    description: "Kalsec product code: 41.19.25. EXW SENOKO",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 41.19.25 | Price 15kg pail: $40.0 USD/kg | 3.2-3.4kg bottle: $46.0 USD/kg
  },
  {
    code:        "KAL-165",
    name:        "PURIFIED SOLUBLE TURMERIC, NS",
    description: "Kalsec product code: 12.080.37. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 12.080.37 | Price 15kg pail: $40.05 USD/kg | 3.2-3.4kg bottle: $46.05 USD/kg
  },
  {
    code:        "KAL-166",
    name:        "Vegetone® Beta Carotene WSP",
    description: "Kalsec product code: 66.010.001.200. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 66.010.001.200 | Price 15kg pail: $nan USD/kg | 3.2-3.4kg bottle: $nan USD/kg
  },
  {
    code:        "KAL-167",
    name:        "Natural Chili Crisp Type Flavor",
    description: "Kalsec product code: 22.01.096. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.01.096 | Price 15kg pail: $40.05 USD/kg | 3.2-3.4kg bottle: $46.05 USD/kg
  },
  {
    code:        "KAL-168",
    name:        "DURALOX BLEND RT-50",
    description: "Kalsec product code: 62.200.02. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 62.200.02 | Price 15kg pail: $50.8 USD/kg | 3.2-3.4kg bottle: $56.8 USD/kg
  },
  {
    code:        "KAL-169",
    name:        "AQUARESIN® BARBEQUE SPICE, NS",
    description: "Kalsec product code: 22.19.004. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.19.004 | Price 15kg pail: $48.0 USD/kg | 3.2-3.4kg bottle: $54.0 USD/kg
  },
  {
    code:        "KAL-170",
    name:        "NATURAL BIRD'S EYE CHILI FLAVOR WONF",
    description: "Kalsec product code: 22.01.101. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.01.101 | Price 15kg pail: $63.05 USD/kg | 3.2-3.4kg bottle: $69.05 USD/kg
  },
  {
    code:        "KAL-171",
    name:        "Aquaresin Turmeric",
    description: "Kalsec product code: 12.050.19. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 12.050.19 | Price 15kg pail: $35.05 USD/kg | 3.2-3.4kg bottle: $41.05 USD/kg
  },
  {
    code:        "KAL-172",
    name:        "Vegetone Yellow WS",
    description: "Kalsec product code: 66.010.005. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 66.010.005 | Price 15kg pail: $23.0 USD/kg | 3.2-3.4kg bottle: $29.0 USD/kg
  },
  {
    code:        "KAL-173",
    name:        "Duralox Aquaresin Pesto Seasoning, NS",
    description: "Kalsec product code: 63.99715. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 63.99715 | Price 15kg pail: $57.0 USD/kg | 3.2-3.4kg bottle: $63.0 USD/kg
  },
  {
    code:        "KAL-174",
    name:        "Oleoresin Basil, NS",
    description: "Kalsec product code: 47.01. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 47.01 | Price 15kg pail: $99.05 USD/kg | 3.2-3.4kg bottle: $105.05 USD/kg
  },
  {
    code:        "KAL-175",
    name:        "Basil Flavor, Thai Holy Type",
    description: "Kalsec product code: 22.507048. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 22.507048 | Price 15kg pail: $107.05 USD/kg | 3.2-3.4kg bottle: $113.05 USD/kg
  },
  {
    code:        "KAL-176",
    name:        "Oleoresin Thyme, NS",
    description: "Kalsec product code: 35.01. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 35.01 | Price 15kg pail: $173.0 USD/kg | 3.2-3.4kg bottle: $179.0 USD/kg
  },
  {
    code:        "KAL-177",
    name:        "OIL OF CORIANDER",
    description: "Kalsec product code: 30.04. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 30.04 | Price 15kg pail: $161.0 USD/kg | 3.2-3.4kg bottle: $nan USD/kg
  },
  {
    code:        "KAL-178",
    name:        "DURALOX A AN-110 XT,NS",
    description: "Kalsec product code: 62.150.34. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 62.150.34 | Price 15kg pail: $23.0 USD/kg | 3.2-3.4kg bottle: $29.0 USD/kg
  },
  {
    code:        "KAL-179",
    name:        "HERBALOX XT-W",
    description: "Kalsec product code: 41-098332. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 41-098332 | Price 15kg pail: $44.6 USD/kg | 3.2-3.4kg bottle: $50.6 USD/kg
  },
  {
    code:        "KAL-180",
    name:        "NATUREBRITE PAPRIKA OIL",
    description: "Kalsec product code: 02.040.71. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 02.040.71 | Price 15kg pail: $130.0 USD/kg | 3.2-3.4kg bottle: $136.0 USD/kg
  },
  {
    code:        "KAL-181",
    name:        "CLEARCAP SUPER SOLUBLE CAPSICUM",
    description: "Kalsec product code: 01.031.00.506. EXW Singapore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 01.031.00.506 | Price 15kg pail: $40.0 USD/kg | 3.2-3.4kg bottle: $46.0 USD/kg
  },
  {
    code:        "KAL-182",
    name:        "NATURAL SAUTEE SWEET ONION",
    description: "Kalsec product code: 51.09752. EX KALSEC SENOKO, SINGAPORE",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 51.09752 | Price 15kg pail: $34.0 USD/kg | 3.2-3.4kg bottle: $40.0 USD/kg
  },
  {
    code:        "KAL-183",
    name:        "DURALOX® AQUARESIN® FRANKFURTE",
    description: "Kalsec product code: 63.30.01. EX KALSEC SENOKO, SINGAPORE",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 63.30.01 | Price 15kg pail: $47.0 USD/kg | 3.2-3.4kg bottle: $53.0 USD/kg
  },
  {
    code:        "KAL-184",
    name:        "OLEORESIN CELERY, NS",
    description: "Kalsec product code: 09.26. EXW Singapore, Kalsec Sinagpore",
    unit:        "kg",
    category:    "Food Ingredient",
    // Kalsec code: 09.26 | Price 15kg pail: $20.25 USD/kg | 3.2-3.4kg bottle: $26.25 USD/kg
  },
]

for (const product of kalsecProducts) {
  const existing = sqlite
    .prepare(`SELECT id FROM trader_products WHERE code = ? AND tenant_id = ?`)
    .get(product.code, DEFAULT_TENANT_ID)

  if (!existing) {
    sqlite
      .prepare(`
        INSERT INTO trader_products (tenant_id, code, name, description, unit, category, is_active)
        VALUES (?, ?, ?, ?, ?, ?, 1)
      `)
      .run(DEFAULT_TENANT_ID, product.code, product.name, product.description, product.unit, product.category)
    console.log(`Product ${product.code} seeded.`)
  } else {
    console.log(`Product ${product.code} already exists, skipped.`)
  }
}