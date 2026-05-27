import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router-dom"
import { queryClient } from "@/lib/api/queryClient"
import { router } from "@/lib/config/router"
import GlobalLoader from "@/components/common/GlobalLoader"
import { ConfirmDialogProvider } from "@/components/context/ConfirmDialogContext"
import { ModalProvider } from "@/components/context/ModalContext"
import { SnackbarProvider } from "@/components/context/SnackbarContext"

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider>
        <ConfirmDialogProvider>
          <ModalProvider>
            <RouterProvider router={router} />
            <GlobalLoader />
          </ModalProvider>
        </ConfirmDialogProvider>
      </SnackbarProvider>
    </QueryClientProvider>
  )
}
