import { env } from './env.config';

export const CORS_CONFIG = {
  origin: '*',
  // origin: env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()),
  methods: 'POST,GET,PATCH,DELETE,PUT',
  credentials: true,
};
