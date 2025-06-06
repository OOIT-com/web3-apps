import { Login } from './login/Login';
import { Box, Container, Stack } from '@mui/material';
import { AppHeader } from './landing-page/AppHeader';
import { createHashRouter, Outlet, RouterProvider, useNavigate } from 'react-router-dom';
import { AppMenu } from './landing-page/AppMenu';
import { useEffect } from 'react';
import { appMenuColumns, AppMenuEntry } from './landing-page/app-menu-columns';
import { useAppContext } from './AppContextProvider';
import { ErrorPage } from './login/ErrorPage';
import Loader from './common/Loader';

const menuEntries: AppMenuEntry[] = appMenuColumns.reduce<AppMenuEntry[]>(
  (acc, col) => [...acc, ...col.appMenuEntries],
  []
);

const router = () =>
  createHashRouter(
    [
      {
        path: '*',
        element: <AppNavigation />,
        errorElement: <ErrorPage />,
        children: [
          {
            path: '*',
            element: <AppMenu />
          },
          ...menuEntries.map(({ path, element }) => ({ path, element }))
        ]
      },

      {
        path: '/login',
        element: <Login />,
        errorElement: <ErrorPage />
      },

      {
        path: '/error-page',
        element: <ErrorPage />,
        errorElement: <ErrorPage />
      }
    ],
    {
      //basename
    }
  );

export function AppRouter() {
  return <RouterProvider router={router()} />;
}

function AppNavigation() {
  const { web3Session } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!web3Session) {
      navigate('/login');
    }
  }, [web3Session, navigate]);

  return (
    <Box
      sx={{
        display: 'block',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        boxSizing: 'border-box',
        p: 0
      }}
    >
      <AppHeader />

      <Container key={'app-menu'} maxWidth={false} sx={{ minHeight: '100vh' }}>
        <Stack spacing={2} mt={'1em'} mb={'1em'}>
          <Outlet />
        </Stack>
        <Loader />
      </Container>
    </Box>
  );
}
