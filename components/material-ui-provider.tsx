"use client"

import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#428dc7",
      dark: "#2f6f9f",
      light: "#dcecf7",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#f4a6a6",
      dark: "#d77b7b",
      light: "#fff0f0",
      contrastText: "#2f2a2a",
    },
    background: {
      default: "#fbfaf8",
      paper: "#ffffff",
    },
    text: {
      primary: "#1f2933",
      secondary: "#64707d",
    },
    success: {
      main: "#5aa878",
    },
    warning: {
      main: "#d99a2b",
    },
    error: {
      main: "#d65f5f",
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily:
      'var(--font-geist-sans), Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    button: {
      fontWeight: 700,
      textTransform: "none",
    },
    h1: {
      letterSpacing: 0,
      fontWeight: 800,
    },
    h2: {
      letterSpacing: 0,
      fontWeight: 750,
    },
    h3: {
      letterSpacing: 0,
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        variant: "contained",
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: "1px solid rgba(66, 141, 199, 0.16)",
          boxShadow: "0 8px 24px rgba(31, 41, 51, 0.06)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
  },
})

export function MaterialUiProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
