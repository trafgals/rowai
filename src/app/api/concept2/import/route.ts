import { NextResponse } from 'next/server';
import { getWorkouts, parseWorkoutTime } from '@/lib/concept2';
import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export async function POST() {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const integration = await prisma.connectedIntegration.findUnique({
    where: {
      userId_provider: {
        userId,
        provider: 'concept2',
      },
    },
  });

  if (!integration?.accessToken) {
    return NextResponse.json({ error: 'Not connected to Concept2' }, { status: 400 });
  }

  try {
    let totalImported = 0;
    let hasMore = true;
    let page = 1;

    while (hasMore) {
      const data = await getWorkouts(integration.accessToken);
      
      if (!data.data?.length) {
        hasMore = false;
        break;
      }

      for (const workout of data.data) {
        if (!workout.id) continue;

        await prisma.workout.upsert({
          where: {
            concept2Id: workout.id.toString(),
          },
          update: {
            date: new Date(workout.date),
            distanceMeters: workout.distance ?? 0,
            timeSeconds: parseWorkoutTime(workout.time ?? 0),
            strokeRate: workout.strokes_per_minute ?? null,
            calories: workout.calories ?? null,
            workoutType: workout.workout_type ?? null,
          },
          create: {
            userId,
            concept2Id: workout.id.toString(),
            date: new Date(workout.date),
            distanceMeters: workout.distance ?? 0,
            timeSeconds: parseWorkoutTime(workout.time ?? 0),
            strokeRate: workout.strokes_per_minute ?? null,
            calories: workout.calories ?? null,
            workoutType: workout.workout_type ?? null,
          },
        });
        totalImported++;
      }

      hasMore = !!data.next_page;
      page++;
    }

    return NextResponse.json({ imported: totalImported });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}
