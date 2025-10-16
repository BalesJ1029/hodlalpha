import type { APIRoute } from 'astro';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../convex/_generated/api';

export const prerender = false;

interface IncomingPayload {
  asset: string;
  entryDate: string;
  entryPrice: number;
  alertType: 'classic' | 'vision';
}

type AlertType = 'classic' | 'vision';

const jsonHeaders = { 'content-type': 'application/json' };

const parseBody = async (request: Request) => {
  try {
    return (await request.json()) as IncomingPayload;
  } catch {
    return null;
  }
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const allowedAlertTypes: ReadonlyArray<AlertType> = ['classic', 'vision'];

const normaliseAlertType = (value: unknown): AlertType | null => {
  if (!isNonEmptyString(value)) {
    return null;
  }
  const lower = value.toLowerCase();
  return allowedAlertTypes.includes(lower as AlertType) ? (lower as AlertType) : null;
};

const validate = (payload: IncomingPayload) => {
  const errors: string[] = [];
  let asset: string | undefined;
  let entryDate: string | undefined;
  let entryPrice: number | undefined;
  let alertType: AlertType = 'classic';

  if (!isNonEmptyString(payload.asset)) {
    errors.push('asset is required and must be a non-empty string');
  } else {
    asset = payload.asset.trim();
  }

  if (!isNonEmptyString(payload.entryDate)) {
    errors.push('entryDate is required and must be a non-empty string');
  } else if (Number.isNaN(Date.parse(payload.entryDate))) {
    errors.push('entryDate must be a valid ISO-8601 date string');
  } else {
    entryDate = payload.entryDate.trim();
  }

  if (!isNumber(payload.entryPrice)) {
    errors.push('entryPrice is required and must be a finite number');
  } else {
    entryPrice = payload.entryPrice;
  }

  if (payload.alertType !== undefined && payload.alertType !== null) {
    const maybeAlertType = normaliseAlertType(payload.alertType);
    if (!maybeAlertType) {
      errors.push(`alertType must be one of: ${allowedAlertTypes.join(', ')}`);
    } else {
      alertType = maybeAlertType;
    }
  }

  if (errors.length > 0) {
    return { ok: false as const, errors };
  }

  return {
    ok: true as const,
    value: {
      asset: asset!,
      entryDate: entryDate!,
      entryPrice: entryPrice!,
      alertType,
    },
  };
};

const createClient = () => {
  const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    return { error: 'Server misconfigured: missing Convex URL' } as const;
  }

  const client = new ConvexHttpClient(convexUrl);
  return { client };
};

const ensureAuthorized = (request: Request) => {
  const expectedToken = import.meta.env.ALERTS_API_TOKEN;
  if (!expectedToken) {
    return { ok: false as const, status: 500, message: 'Server misconfigured: missing API token' };
  }

  const header = request.headers.get('authorization');
  if (!header || header !== `Bearer ${expectedToken}`) {
    return { ok: false as const, status: 401, message: 'Unauthorized' };
  }

  return { ok: true as const };
};

export const POST: APIRoute = async ({ request }) => {
  const auth = ensureAuthorized(request);
  if (!auth.ok) {
    return new Response(JSON.stringify({ error: auth.message }), {
      status: auth.status,
      headers: jsonHeaders,
    });
  }

  const body = await parseBody(request);
  if (!body) {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
      status: 400,
      headers: jsonHeaders,
    });
  }

  const validation = validate(body);
  if (!validation.ok) {
    return new Response(
      JSON.stringify({ error: 'Validation failed', details: validation.errors }),
      {
        status: 400,
        headers: jsonHeaders,
      }
    );
  }

  const clientResult = createClient();
  if ('error' in clientResult) {
    return new Response(JSON.stringify({ error: clientResult.error }), {
      status: 500,
      headers: jsonHeaders,
    });
  }

  try {
    const id = await clientResult.client.mutation(api.alerts.createAlert, validation.value);
    return new Response(JSON.stringify({ id }), {
      status: 201,
      headers: jsonHeaders,
    });
  } catch (error) {
    console.error('Failed to create alert', error);
    return new Response(JSON.stringify({ error: 'Failed to create alert' }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
};
