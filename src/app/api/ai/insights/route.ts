import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

interface Insight {
  type: 'improvement' | 'trend' | 'tip' | 'warning';
  title: string;
  description: string;
  metric?: string;
  change?: number;
}

export async function GET() {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentWorkouts = await prisma.workout.findMany({
      where: {
        userId,
        date: { gte: monthAgo },
      },
      orderBy: { date: 'desc' },
    });

    const weekWorkouts = recentWorkouts.filter(w => w.date >= weekAgo);

    if (recentWorkouts.length === 0) {
      return NextResponse.json({ insights: [] });
    }

    const avgPaceThisWeek = weekWorkouts.length > 0
      ? weekWorkouts.reduce((sum, w) => sum + (w.timeSeconds / w.distanceMeters * 500), 0) / weekWorkouts.length
      : 0;

    const avgPaceLastMonth = recentWorkouts.length > 0
      ? recentWorkouts.reduce((sum, w) => sum + (w.timeSeconds / w.distanceMeters * 500), 0) / recentWorkouts.length
      : 0;

    const totalDistanceWeek = weekWorkouts.reduce((sum, w) => sum + w.distanceMeters, 0);
    const totalDistanceMonth = recentWorkouts.reduce((sum, w) => sum + w.distanceMeters, 0);

    const avgStrokeRate = recentWorkouts.filter(w => w.strokeRate).length > 0
      ? recentWorkouts.filter(w => w.strokeRate).reduce((sum, w) => sum + (w.strokeRate || 0), 0) / recentWorkouts.filter(w => w.strokeRate).length
      : 0;

    const insights: Insight[] = [];

    if (avgPaceThisWeek > 0 && avgPaceLastMonth > 0) {
      const paceChange = ((avgPaceLastMonth - avgPaceThisWeek) / avgPaceLastMonth) * 100;
      
      if (paceChange > 2) {
        insights.push({
          type: 'improvement',
          title: 'Your pace is improving!',
          description: `Your average pace has improved by ${paceChange.toFixed(1)}% compared to your monthly average. Keep up the consistent training!`,
          metric: 'pace',
          change: paceChange,
        });
      } else if (paceChange < -5) {
        insights.push({
          type: 'warning',
          title: 'Pace has slowed recently',
          description: `Your recent pace is ${Math.abs(paceChange).toFixed(1)}% slower than your average. Make sure you're recovering adequately between sessions.`,
          metric: 'pace',
          change: paceChange,
        });
      }
    }

    const weeklyGoal = 30000;
    if (totalDistanceWeek > 0) {
      const goalProgress = (totalDistanceWeek / weeklyGoal) * 100;
      
      if (goalProgress >= 100) {
        insights.push({
          type: 'improvement',
          title: 'Weekly distance goal achieved!',
          description: `You've rowed ${(totalDistanceWeek / 1000).toFixed(1)}km this week, exceeding your ${weeklyGoal / 1000}km goal!`,
          metric: 'distance',
          change: goalProgress,
        });
      } else if (goalProgress >= 70) {
        insights.push({
          type: 'trend',
          title: 'Almost at your weekly goal',
          description: `You're ${Math.round(goalProgress)}% of the way to your ${weeklyGoal / 1000}km weekly goal. ${((weeklyGoal - totalDistanceWeek) / 1000).toFixed(1)}km to go!`,
          metric: 'distance',
          change: goalProgress,
        });
      }
    }

    if (avgStrokeRate > 0) {
      if (avgStrokeRate < 22) {
        insights.push({
          type: 'tip',
          title: 'Focus on stroke rate',
          description: `Your average stroke rate (${Math.round(avgStrokeRate)} spm) is on the lower end. For endurance work, 24-28 spm is often optimal. Try incorporating some higher-SPM intervals.`,
          metric: 'strokeRate',
        });
      } else if (avgStrokeRate > 30) {
        insights.push({
          type: 'tip',
          title: 'Consider longer strokes',
          description: `Your average stroke rate (${Math.round(avgStrokeRate)} spm) is quite high. For most rowing, a rate of 24-28 allows better efficiency and power transfer.`,
          metric: 'strokeRate',
        });
      }
    }

    const workoutFrequency = weekWorkouts.length;
    if (workoutFrequency >= 5) {
      insights.push({
        type: 'tip',
        title: 'Great workout consistency',
        description: `${workoutFrequency} workouts this week! Just remember to include adequate recovery. Listen to your body for signs of overtraining.`,
        metric: 'frequency',
      });
    } else if (workoutFrequency >= 3) {
      insights.push({
        type: 'trend',
        title: 'Solid training week',
        description: `${workoutFrequency} workouts is a good baseline. If you're feeling strong, adding 1-2 more sessions could accelerate your progress.`,
        metric: 'frequency',
      });
    }

    const generatedWorkoutsThisWeek = await prisma.generatedWorkout.count({
      where: {
        userId,
        createdAt: { gte: weekAgo },
        status: 'completed',
      },
    });

    if (generatedWorkoutsThisWeek > 0 && insights.length === 0) {
      insights.push({
        type: 'trend',
        title: 'AI workouts helping your training',
        description: `You've completed ${generatedWorkoutsThisWeek} AI-generated workout${generatedWorkoutsThisWeek > 1 ? 's' : ''} this week. The variety should help keep your training fresh!`,
      });
    }

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Insights error:', error);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}
