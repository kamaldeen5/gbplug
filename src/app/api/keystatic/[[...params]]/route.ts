import { makeGenericAPIRouteHandler } from '@keystatic/core/api/generic';
import config from '../../../../../keystatic.config';

const handler = makeGenericAPIRouteHandler({ config });

async function handle(req: Request): Promise<Response> {
  const result: any = await handler(req);
  if (result instanceof Response) {
    return result;
  }
  return new Response(result?.body as BodyInit | null, {
    status: result?.status,
    headers: result?.headers,
  });
}

export const GET = (req: Request) => handle(req);
export const POST = (req: Request) => handle(req);
