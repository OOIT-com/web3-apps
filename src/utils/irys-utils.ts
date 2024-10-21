export const IRYS_GATEWAY = process.env.REACT_APP_IRYS_GATEWAY;

export const downloadLink = (id?: string) => IRYS_GATEWAY + (id ?? '');
