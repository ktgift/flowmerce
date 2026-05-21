import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router-dom"
import { queryClient } from "@/lib/api/queryClient"
import { router } from "@/lib/config/router"
import GlobalLoader from "@/components/common/GlobalLoader"
// import { useLoaderStore } from "./lib/services/loaderService"

export default function App() {

// function TestLoader() {
//   const { inc, dec } = useLoaderStore()
//   return (
//     <div style={{ position: "fixed", bottom: 16, right: 16, zIndex: 10000 }}>
//       <button onClick={inc}>Show Loader</button>
//       <button onClick={dec}>Hide Loader</button>
//     </div>
//   )
// }

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <GlobalLoader />
      {/* <TestLoader /> */}
    </QueryClientProvider>
  )
}
