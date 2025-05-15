import { createContext, useMemo, useState } from 'react';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { blue, orange } from '@mui/material/colors';
import { AppRouter } from './components/AppRouter';
import { Snackbar } from './components/common/Snackbar';
import { AppContextProvider } from './components/AppContextProvider';
import Loader from './components/common/Loader';

export const ColorModeContext = createContext({
  toggleColorMode: () => {}
});
type ColorModeTypes = 'light' | 'dark';
const __dapp_color_mode = '__dapp_color_mode';

const initialMode = (localStorage.getItem(__dapp_color_mode) ?? 'light') as ColorModeTypes;

export function DApp() {
  const [mode, setMode] = useState<'light' | 'dark'>(initialMode);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem(__dapp_color_mode, newMode);
          return newMode;
        });
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
          },
          MuiFormHelperText: {
            defaultProps: {
              component: 'div'
            }
          },
          MuiStack: {
            defaultProps: {
              component: 'div'
            }
          }
        }
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline>
          <AppContextProvider>
            <AppRouter />
            <Snackbar />
            <Loader />
          </AppContextProvider>
        </CssBaseline>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
