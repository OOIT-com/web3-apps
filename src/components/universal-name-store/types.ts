import { ReactNode } from 'react';
import { NotifyFun } from '../../types';

export type ConfirmData = {
  title: ReactNode | string;
  content?: (string | ReactNode)[];
  accept: NotifyFun;
  cancel: NotifyFun;
};
