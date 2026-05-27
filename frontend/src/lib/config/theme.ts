import { createTheme } from "@mui/material/styles"
import { COLORS } from "@/lib/constants/colors"

const FONT_SIZE = 12

const theme = createTheme({
  palette: {
    primary: { main: COLORS.primary },
    secondary: { main: COLORS.secondary },
    background: { default: COLORS.backgroundDefault },
    text: {
      primary: COLORS.text,
      secondary: COLORS.subText,
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Roboto", sans-serif',
    fontSize: FONT_SIZE,
    htmlFontSize: 16,
    body1: { fontSize: FONT_SIZE },
    body2: { fontSize: FONT_SIZE },
    subtitle1: { fontSize: FONT_SIZE },
    subtitle2: { fontSize: FONT_SIZE },
    caption: { fontSize: FONT_SIZE },
    button: { fontSize: FONT_SIZE },
    overline: { fontSize: FONT_SIZE },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiInputLabel: {
      styleOverrides: {
        root: { fontSize: FONT_SIZE },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: { fontSize: FONT_SIZE },
        input: { fontSize: FONT_SIZE },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "10px",
          backgroundColor: COLORS.white,
          height: 38,
          "&.MuiInputBase-multiline": { height: "auto" },
          "& fieldset": { borderColor: COLORS.border },
          "&:hover fieldset": { borderColor: COLORS.neutral },
          "&.Mui-focused fieldset": {
            borderColor: COLORS.primary,
            borderWidth: "1.5px",
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: { fontSize: FONT_SIZE },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: { fontSize: FONT_SIZE },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: FONT_SIZE,
          borderRadius: "10px",
          height: 38,
          textTransform: "none",
        },
        contained: {
          fontWeight: 600,
          padding: "0 20px",
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
        outlined: {
          fontWeight: 600,
          padding: "0 20px",
          color: COLORS.primary,
          borderColor: "transparent",
          backgroundColor: COLORS.primarylight,
          "&:hover": {
            backgroundColor: COLORS.primarylightHover,
            borderColor: "transparent",
            color: COLORS.primary,
          },
          "&.Mui-disabled": {
            backgroundColor: COLORS.disabledBg,
            borderColor: "transparent",
            color: COLORS.disabledText,
          },
        },
      },
      variants: [
        {
          props: { variant: "contained", color: "primary" },
          style: { "&:hover": { backgroundColor: COLORS.primaryHover } },
        },
      ],
    },
    MuiChip: {
      styleOverrides: {
        label: { fontSize: FONT_SIZE },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { fontSize: FONT_SIZE },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: { fontSize: FONT_SIZE },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        input: { fontSize: FONT_SIZE },
        option: { fontSize: FONT_SIZE },
        noOptions: { fontSize: FONT_SIZE },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { fontSize: FONT_SIZE },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { fontSize: FONT_SIZE },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: { fontSize: FONT_SIZE },
        secondary: { fontSize: FONT_SIZE },
      },
    },
  },
})

export default theme
