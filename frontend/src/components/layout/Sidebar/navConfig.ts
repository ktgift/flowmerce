import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined"
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined"
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined"
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined"
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined"
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined"
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined"
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined"
import MailOutlineIcon from "@mui/icons-material/MailOutlined"
import { ROUTES } from "@/lib/constants/routes"

export interface NavItem {
  label: string
  icon: React.ElementType
  to: string
  exact?: boolean
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "WORKSPACE",
    items: [{ label: "Dashboard", icon: GridViewOutlinedIcon, to: ROUTES.home, exact: true }],
  },
  {
    title: "SALES",
    items: [
      { label: "Quotations", icon: DescriptionOutlinedIcon, to: ROUTES.quotations },
      { label: "Customers", icon: PeopleAltOutlinedIcon, to: ROUTES.customers },
    ],
  },
  {
    title: "PROCUREMENT",
    items: [
      { label: "Purchase Orders", icon: ReceiptLongOutlinedIcon, to: ROUTES.purchaseOrders },
    ],
  },
  {
    title: "DATA",
    items: [
      { label: "Products", icon: InventoryOutlinedIcon, to: ROUTES.products },
      { label: "Suppliers", icon: LocalShippingOutlinedIcon, to: ROUTES.suppliers },
      { label: "Import Data", icon: FileUploadOutlinedIcon, to: ROUTES.import },
    ],
  },
  {
    title: "SYSTEMS & INSIGHTS",
    items: [
      { label: "Reports", icon: BarChartOutlinedIcon, to: ROUTES.report },
      { label: "AI Assistant", icon: AutoAwesomeOutlinedIcon, to: ROUTES.chat },
      { label: "Email", icon: MailOutlineIcon, to: ROUTES.email },
    ],
  },
]
