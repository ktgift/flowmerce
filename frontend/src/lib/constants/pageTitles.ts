import { ROUTES } from "@/lib/constants/routes"

export const PAGE_TITLES: Record<string, string> = {
  [ROUTES.home]: "Dashboard",
  [ROUTES.customers]: "Customers",
  [ROUTES.suppliers]: "Suppliers",
  [ROUTES.products]: "Products",
  [ROUTES.quotations]: "Quotations",
  [ROUTES.purchaseOrders]: "Purchase Orders",
  [ROUTES.report]: "Reports",
  [ROUTES.setting]: "Settings",
  [ROUTES.chat]: "AI Assistant",
  [ROUTES.email]: "Email",
  [ROUTES.notification]: "Notifications",
  [ROUTES.import]: "Import Data",
}

export function getPageTitle(pathname: string): string {
  if (pathname === "/") return "Dashboard"
  const match = Object.entries(PAGE_TITLES).find(
    ([path]) => path !== "/" && (pathname === path || pathname.startsWith(path + "/")),
  )
  return match?.[1] ?? "Flowmerce"
}
