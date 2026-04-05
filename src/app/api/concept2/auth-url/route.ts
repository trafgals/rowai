import { NextResponse } from 'next/server';
import { getConcept2AuthUrl } from '@/lib/concept2';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = await getConcept2AuthUrl(userId);
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error getting auth URL:', error);
    return NextResponse.json({ error: 'Failed to get auth URL' }, { status: 500 });
  }
}
