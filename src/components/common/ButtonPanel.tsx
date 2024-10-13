import * as React from 'react';
import { ReactNode } from 'react';
import { Stack, SxProps } from '@mui/material';

type Mode = 'left' | 'right' | 'center' | 'space-between' | 'space-around';
const styles: Record<Mode, SxProps> = {
  left: {
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  right: {
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  'space-between': {
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  'space-around': {
    justifyContent: 'space-between',
    alignItems: 'center'
  }
};

export function ButtonPanel({
  content,
  mode = 'right'
}: Readonly<{
  content: ReactNode | ReactNode[];
  mode?: Mode;
}>) {
  return (
    <Stack direction={'row'} spacing={1} sx={styles[mode]}>
      {content}
    </Stack>
  );
}

//
// export const ButtonPanel: FC<StackProps & { mode?: Mode; content: ReactElement | ReactNode | ReactNode[] | false }> = ({
//   content,
//   mode = 'right'
// }) => {
//   return (
//     <Stack direction={'row'} spacing={1} sx={styles[mode]}>
//       {content}
//     </Stack>
//   );
// };
