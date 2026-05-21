import { createTheme } from "@mui/material/styles"
import { COLORS } from "@/lib/constants/colors"

const theme = createTheme({
  palette: {
    primary: { main: COLORS.primary },
    secondary: { main: COLORS.secondary },
    background: { default: COLORS.backgroundDefault },
    // text: {
    //   secondary: COLORS.subText,
    // },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Roboto", sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
})

export default theme
