import { useMediaQuery, useTheme } from '@mui/material';

export function useIsSmall(): boolean {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('sm'));
}

// export async function wrap<P = void>(loading: string, p: () => Promise<P>): Promise<P | StatusMessage> {
//   const { setLoading } = useAppContext();
//   try {
//     setLoading(loading);
//     return await p();
//   } catch (e) {
//     return errorMessage('Error occurred', e);
//   } finally {
//     setLoading('');
//   }
// }
//
// export async function wrapPromise<T = void>(promise: Promise<T>, loading = 'Loading...') {
//   const { setLoading } = useAppContext();
//   try {
//     setLoading(loading);
//     return await promise;
//   } catch (e) {
//     console.error(e);
//     return errorMessage(`Error while: ${loading}`, e);
//   } finally {
//     setLoading('');
//   }
// }
