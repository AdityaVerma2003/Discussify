// src/theme.js
import { createTheme } from '@mui/material/styles';
import { blue, grey } from '@mui/material/colors';

// Define the professional, subtle, and enterprise-standard theme
const theme = createTheme({
  palette: {
    // Primary: Brand color (Blue-600) for actions and highlights
    primary: {
      main: blue[700], // #007BFF equivalent
    },
    // Secondary: Subtle accent (Grey-600) for secondary elements
    secondary: {
      main: grey[600],
    },
    // Background: Light subtle canvas
    background: {
      default: '#F4F7FA', // Light grey background
      paper: '#FFFFFF',   // White for cards and surfaces
    },
    // Success and Error for confirmations and validation
    success: {
      main: '#28A745', // Green
    },
    error: {
      main: '#DC3545', // Red
    },
  },
  typography: {
    fontFamily: [
      'Roboto', // MUI Default
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Professional look
          borderRadius: 8,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', // Subtle shadow (Elevation 1)
        },
      },
    },
    MuiCard: {
        defaultProps: {
            elevation: 1, // Subtle default elevation
        },
    }
  }
});

export default theme;