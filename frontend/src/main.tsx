import React from 'react'
import ReactDOM from 'react-dom/client'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0f172a',
      dark: '#020617',
    },
    secondary: {
      main: '#c2410c',
    },
    success: {
      main: '#15803d',
    },
    warning: {
      main: '#b45309',
    },
    background: {
      default: '#f3f6fb',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
    },
  },
  typography: {
    fontFamily:
      '"Plus Jakarta Sans", "Segoe UI", Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    h2: {
      fontWeight: 800,
      letterSpacing: '-0.03em',
    },
    h3: {
      fontWeight: 800,
      letterSpacing: '-0.03em',
    },
    h4: {
      fontWeight: 800,
      letterSpacing: '-0.03em',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h6: {
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingInline: 16,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 12px 28px rgba(15, 23, 42, 0.06)',
        },
      },
    },
  },
})

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
)
