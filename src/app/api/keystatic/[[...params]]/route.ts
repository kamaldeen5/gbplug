import { makeRouteHandler } from '@keystatic/next/route-handler';
import config from '../../../../../keystatic.config';

export const { GET, POST } = makeRouteHandler({
  config,
  clientId:
    process.env.KEYSTATIC_GITHUB_CLIENT_ID ||
    process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_CLIENT_ID ||
    'build-time-client-id',
  clientSecret:
    process.env.KEYSTATIC_GITHUB_CLIENT_SECRET ||
    'build-time-client-secret',
  secret:
    process.env.KEYSTATIC_SECRET ||
    'build-time-secret-gbplug-2026-fallback-key',
});
