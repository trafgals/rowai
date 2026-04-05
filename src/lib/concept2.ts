const CONCEPT2_AUTH_URL = 'https://log.concept2.com/oauth2/authorize';
const CONCEPT2_TOKEN_URL = 'https://log.concept2.com/oauth2/token';
const CONCEPT2_API_URL = 'https://log.concept2.com/api/v1';

export async function getConcept2AuthUrl(state: string): Promise<string> {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.CONCEPT2_CLIENT_ID ?? '',
    redirect_uri: `${process.env.NEXT_PUBLIC_URL}/api/concept2/callback`,
    scope: 'user:read results:read',
    state,
  });
  return `${CONCEPT2_AUTH_URL}?${params}`;
}

export async function exchangeCodeForTokens(code: string) {
  const res = await fetch(CONCEPT2_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: process.env.CONCEPT2_CLIENT_ID ?? '',
      client_secret: process.env.CONCEPT2_CLIENT_SECRET ?? '',
      redirect_uri: `${process.env.NEXT_PUBLIC_URL}/api/concept2/callback`,
    }),
  });
  return res.json();
}

export async function getWorkouts(accessToken: string, from?: string, to?: string) {
  const params = new URLSearchParams({ per_page: '250' });
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const res = await fetch(`${CONCEPT2_API_URL}/users/me/results?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.json();
}

export function parseWorkoutTime(time: string | number): number {
  if (typeof time === 'number') return time;
  const parts = time.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0];
}
