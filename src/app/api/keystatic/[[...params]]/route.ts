import { makeRouteHandler } from '@keystatic/next/route-handler';
import config from '../../../../../keystatic.config';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const handler = makeRouteHandler({
    config,
    clientId: process.env.KEYSTATIC_GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_CLIENT_ID,
    clientSecret: process.env.KEYSTATIC_GITHUB_CLIENT_SECRET,
    secret: process.env.KEYSTATIC_SECRET,
  });
  return handler.GET(req);
}

export async function POST(req: Request) {
  const handler = makeRouteHandler({
    config,
    clientId: process.env.KEYSTATIC_GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_CLIENT_ID,
    clientSecret: process.env.KEYSTATIC_GITHUB_CLIENT_SECRET,
    secret: process.env.KEYSTATIC_SECRET,
  });
  return handler.POST(req);
}
