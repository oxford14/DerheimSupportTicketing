import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#0f766e",
      light: "#0d9488",
      dark: "#0f766e",
    },
    secondary: {
      main: "#2dd4bf",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#64748b",
    },
    warning: {
      main: "#d97706",
      light: "#fef3c7",
      dark: "#b45309",
    },
  },
  typography: {
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  ...theme,
  palette: {
    mode: "dark",
    primary: {
      main: "#2dd4bf",
      light: "#5eead4",
      dark: "#0f766e",
    },
    secondary: {
      main: "#2dd4bf",
    },
    background: {
      default: "#0f172a",
      paper: "#1e293b",
    },
    text: {
      primary: "#f1f5f9",
      secondary: "#94a3b8",
    },
    warning: {
      main: "#f59e0b",
      light: "#fef3c7",
      dark: "#d97706",
    },
  },
});
