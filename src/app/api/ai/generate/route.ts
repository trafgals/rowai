import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { openai } from '@ai-sdk/openai';

interface WorkoutRequest {
  goal: string;
  duration?: number;
  type?: string;
}

interface WorkoutSegment {
  type: 'warmup' | 'main' | 'cooldown' | 'intervals';
  duration: number;
  targetPace?: string;
  targetHeartRate?: string;
  description: string;
}

interface GeneratedWorkout {
  title: string;
  totalDuration: number;
  segments: WorkoutSegment[];
  coachingCues: string[];
  estimatedCalories: number;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body: WorkoutRequest = await req.json();
  const { goal, duration = 30, type = 'endurance' } = body;

  if (!goal) {
    return NextResponse.json({ error: 'Goal is required' }, { status: 400 });
  }

  try {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentWorkouts = await prisma.workout.findMany({
      where: {
        userId,
        date: { gte: monthAgo },
      },
      orderBy: { date: 'desc' },
      take: 10,
    });

    const avgDistance = recentWorkouts.length > 0
      ? Math.round(recentWorkouts.reduce((sum, w) => sum + w.distanceMeters, 0) / recentWorkouts.length)
      : 5000;
    
    const avgTime = recentWorkouts.length > 0
      ? Math.round(recentWorkouts.reduce((sum, w) => sum + w.timeSeconds, 0) / recentWorkouts.length / 60)
      : 20;

    const avgStrokeRate = recentWorkouts.length > 0
      ? Math.round(recentWorkouts.filter(w => w.strokeRate).reduce((sum, w) => sum + (w.strokeRate || 0), 0) / recentWorkouts.filter(w => w.strokeRate).length) || 24
      : 24;

    const workoutHistory = recentWorkouts.length > 0
      ? recentWorkouts.map(w => ({
          date: w.date.toISOString().split('T')[0],
          distance: w.distanceMeters,
          time: Math.round(w.timeSeconds / 60),
          type: w.workoutType || 'Rowing',
        })).join('\n')
      : 'No recent workouts';

    const prompt = `You are an expert rowing coach creating personalized workouts. Generate a workout for a rower with this recent history:

${workoutHistory}

Their average workout: ${avgDistance}m in ${avgTime} minutes, avg stroke rate ${avgStrokeRate} spm.

Request: ${goal}
Duration: ${duration} minutes
Type: ${type}

Generate a structured workout in JSON format with this exact structure:
{
  "title": "Workout name",
  "totalDuration": number in minutes,
  "segments": [
    {
      "type": "warmup|main|cooldown|intervals",
      "duration": minutes,
      "targetPace": "2:05/500m" or null,
      "targetHeartRate": "Zone 2-3" or null,
      "description": "What to do"
    }
  ],
  "coachingCues": ["cue1", "cue2", "cue3"],
  "estimatedCalories": number
}

Rules:
- Warmup: 5-10 minutes, easy pace
- Main set: Based on goal (endurance = steady state, intervals = alternating work/rest)
- Cooldown: 5 minutes, easy
- Consider their recent history - don't make it drastically harder unless requested
- Include 2-3 coaching cues focusing on technique
- Calories estimate: ~8-12 per minute for moderate rowing`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    let workout: GeneratedWorkout;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        workout = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    const savedWorkout = await prisma.generatedWorkout.create({
      data: {
        userId,
        title: workout.title,
        goal,
        durationMinutes: workout.totalDuration,
        workoutType: type,
        segments: workout.segments as any,
        coachingCues: workout.coachingCues,
        estimatedCalories: workout.estimatedCalories,
        status: 'generated',
      },
    });

    return NextResponse.json({
      workout: savedWorkout,
      segments: workout.segments,
      coachingCues: workout.coachingCues,
    });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
