//1. as const ใช้เพื่อให้ TypeScript รู้ว่าค่าที่กำหนดในอ็อบเจ็กต์นี้เป็นค่าคงที่และไม่สามารถเปลี่ยนแปลงได้ เช่น PAGINATION.MAX_LIMIT = 999 จะเกิด error

//2. as const เพื่อล็อคค่าให้แน่นเพื่อให้ตอนที่แปลงเป็น type ทีหลัง ได้ค่าที่แม่นยำ ถ้าไม่มี as const จะได้ type เป็น string แทนที่จะเป็น union type ของค่าที่กำหนดไว้
//ตัวอย่างการใช้งาน
// type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS]
// จะได้ type เป็น 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' แทนที่จะเป็น string

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1
} as const