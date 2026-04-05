import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const workout = await prisma.generatedWorkout.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!workout) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(workout);
  } catch (error) {
    console.error('Fetch workout error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
