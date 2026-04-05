import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { completedAt, totalTimeSeconds } = body;

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

    await prisma.generatedWorkout.update({
      where: { id },
      data: {
        status: 'completed',
        completedAt: completedAt ? new Date(completedAt) : new Date(),
        actualDurationSeconds: totalTimeSeconds,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Complete workout error:', error);
    return NextResponse.json({ error: 'Failed to complete' }, { status: 500 });
  }
}
