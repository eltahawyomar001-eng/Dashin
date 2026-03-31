/**
 * Clerk webhook endpoint – mocked out while auth keys are not configured.
 * Returns 200 OK for any incoming request so external callers don't error.
 */
export async function POST(_req: Request) {
  return new Response('Webhook endpoint mocked – no Clerk keys configured', {
    status: 200,
  });
}
