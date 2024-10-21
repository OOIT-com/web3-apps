import moment from 'moment/moment';

export const formatIso = (value: number | string) => moment(+value).format('YYYY-MM-DD HH:mm');

export const formatIso1000 = (value: number | string) => formatIso(+value * 1000);
