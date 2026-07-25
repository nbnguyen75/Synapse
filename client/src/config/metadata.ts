import { env } from '@/config/env';

export const createTitle = (title?: string) =>
   title ? `${title} | ${env.VITE_APP_NAME}` : env.VITE_APP_NAME;
