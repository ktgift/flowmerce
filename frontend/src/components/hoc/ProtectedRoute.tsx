import { Outlet } from "react-router-dom"
// import { Navigate, Outlet } from "react-router-dom"
// import { useAuthStore } from "@/lib/store/authStore"
// import { ROUTES } from "@/lib/constants/routes"

export default function ProtectedRoute() {
  // const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  // if (!isAuthenticated) return <Navigate to={ROUTES.login} replace />
  
  //TODO : Implement role-based access control if admin show all routes, if user show limited routes and return Access Denied page for unauthorized access
  return <Outlet />
}
