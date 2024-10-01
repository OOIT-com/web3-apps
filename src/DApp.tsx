import { createContext, useMemo, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material';
import { blue, orange } from '@mui/material/colors';
import { AppRouter } from './components/AppRouter';
import { Snackbar } from './components/common/Snackbar';
import { AppContextProvider } from './components/AppContextProvider';
import Loader from './components/Loader';

export const ColorModeContext = createContext({
  toggleColorMode: () => {}
});

export function DApp() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      }
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: blue,
          secondary: orange
        },
        components: {
          // Name of the component
          MuiTooltip: {
            defaultProps: {
              // The props to change the default for.
              arrow: true // No more ripple!
            }
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none' // Disable the uppercase transformation globally
              }
            }
          },
          MuiTab: {
            styleOverrides: {
              root: {
                textTransform: 'none' // Disable the uppercase transformation globally
              }
            }
          }
        }
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <AppContextProvider>
          <AppRouter />
          <Loader />
          <Snackbar />
        </AppContextProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
