import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { createBrowserRouter } from "react-router-dom"
import ProtectedRoute from "@/components/hoc/ProtectedRoute"
import MainLayout from "@/components/layout/MainLayout"
import LoginPage from "@/components/container/auth/LoginPage"
import HomePage from "@/components/container/home/HomePage"
import PoListPage from "@/components/container/purchaseOrder/POList"
import PoFormPage from "@/components/container/purchaseOrder/form"
import PoDetailPage from "@/components/container/purchaseOrder/detail"
import ComponentShowcasePage from "@/components/container/dev/ComponentShowcasePage"
import { ROUTES } from "@/lib/constants/routes"

function Placeholder({ name }: { name: string }) {
  return (
    <Box sx={{ p: 3 }}>
      <Typography color="text.secondary">TODO: {name}</Typography>
    </Box>
  )
}

export const router = createBrowserRouter([
  {
    path: ROUTES.login,
    element: <LoginPage />,
  },
  {
    path: "/showcase",
    element: <ComponentShowcasePage />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "customers", element: <Placeholder name="Customers" /> },
          { path: "suppliers", element: <Placeholder name="Suppliers" /> },
          { path: "products", element: <Placeholder name="Products" /> },
          { path: "quotations", element: <Placeholder name="Quotations" /> },
          {
            path: "purchase-orders",
            children: [
              { index: true,       element: <PoListPage />                        },
              { path: "new",       element: <PoFormPage mode="create" />          },
              { path: ":id",       element: <PoDetailPage />                      },
              { path: ":id/edit",  element: <PoFormPage mode="edit" />            },
            ],
          },
          { path: "report", element: <Placeholder name="Reports" /> },
          { path: "chat", element: <Placeholder name="AI Assistant" /> },
          { path: "email", element: <Placeholder name="Email" /> },
          { path: "notification", element: <Placeholder name="Notifications" /> },
          { path: "import", element: <Placeholder name="Import Data" /> },
          { path: "setting", element: <Placeholder name="Settings" /> },
        ],
      },
    ],
  },
])
