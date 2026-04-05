import { NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/concept2';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code || !state) {
    return NextResponse.redirect(new URL('/dashboard/settings?error=no_code', req.url).toString());
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    
    if (tokens.error) {
      console.error('Concept2 token error:', tokens.error);
      return NextResponse.redirect(new URL('/dashboard/settings?error=token_failed', req.url).toString());
    }

    await prisma.connectedIntegration.upsert({
      where: {
        userId_provider: {
          userId: state,
          provider: 'concept2',
        },
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? null,
      },
      create: {
        userId: state,
        provider: 'concept2',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? null,
      },
    });

    return NextResponse.redirect(new URL('/dashboard/settings?connected=concept2', req.url).toString());
  } catch (error) {
    console.error('Concept2 callback error:', error);
    return NextResponse.redirect(new URL('/dashboard/settings?error=callback_failed', req.url).toString());
  }
}
