import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { InsightsCards } from '@/components/InsightsCards';

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${meters}m`;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  return `${mins} min`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const user = await currentUser();
  
  const workouts = await prisma.workout.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 10,
  });

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const weekWorkouts = await prisma.workout.findMany({
    where: {
      userId,
      date: { gte: weekAgo },
    },
  });

  const generatedWorkouts = await prisma.generatedWorkout.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const weekGeneratedCount = await prisma.generatedWorkout.count({
    where: {
      userId,
      createdAt: { gte: weekAgo },
    },
  });

  const weekStats = {
    distance: weekWorkouts.reduce((sum: number, w: { distanceMeters: number }) => sum + w.distanceMeters, 0),
    count: weekWorkouts.length + weekGeneratedCount,
    time: weekWorkouts.reduce((sum: number, w: { timeSeconds: number }) => sum + w.timeSeconds, 0),
  };

  const allWorkouts = [
    ...workouts.map((w) => ({
      id: w.id,
      type: 'imported' as const,
      title: w.workoutType ?? 'Rowing',
      date: w.date,
      distance: w.distanceMeters,
      time: w.timeSeconds,
    })),
    ...generatedWorkouts.map((g) => ({
      id: g.id,
      type: 'generated' as const,
      title: g.title,
      date: g.createdAt,
      distance: null,
      time: g.durationMinutes * 60,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
        <p className="text-[#A8A8B3]">{user?.firstName}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#151518] border border-[#2A2A30] rounded-lg p-4">
          <p className="text-[#6B6B75] text-sm mb-1">This Week</p>
          <p className="text-2xl font-bold text-white">{formatDistance(weekStats.distance)}</p>
          <p className="text-[#6B6B75] text-xs">distance</p>
        </div>
        <div className="bg-[#151518] border border-[#2A2A30] rounded-lg p-4">
          <p className="text-[#6B6B75] text-sm mb-1">Workouts</p>
          <p className="text-2xl font-bold text-white">{weekStats.count}</p>
          <p className="text-[#6B6B75] text-xs">this week</p>
        </div>
        <div className="bg-[#151518] border border-[#2A2A30] rounded-lg p-4">
          <p className="text-[#6B6B75] text-sm mb-1">Time</p>
          <p className="text-2xl font-bold text-white">{formatTime(weekStats.time)}</p>
          <p className="text-[#6B6B75] text-xs">this week</p>
        </div>
      </div>

      <InsightsCards />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Recent Workouts</h2>
        <div className="flex gap-4">
          <Link
            href="/generate"
            className="text-[#FF6B35] hover:text-[#e85d04] text-sm font-medium"
          >
            AI Generate
          </Link>
          <Link
            href="/settings"
            className="text-[#00D4AA] hover:text-[#00b894] text-sm font-medium"
          >
            Import More
          </Link>
        </div>
      </div>

      {allWorkouts.length === 0 ? (
        <div className="bg-[#151518] border border-[#2A2A30] rounded-lg p-8 text-center">
          <p className="text-[#6B6B75] mb-4">No workouts yet</p>
          <Link
            href="/settings"
            className="bg-[#00D4AA] text-black font-semibold px-6 py-3 rounded-lg hover:bg-[#00b894] transition-colors inline-block"
          >
            Connect Concept Rower
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {allWorkouts.map((workout) => (
            <div
              key={`${workout.type}-${workout.id}`}
              className="bg-[#151518] border border-[#2A2A30] rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {workout.type === 'generated' && (
                  <span className="bg-[#FF6B35]/20 text-[#FF6B35] text-xs font-medium px-2 py-1 rounded">
                    AI
                  </span>
                )}
                <div>
                  <p className="text-white font-medium">{workout.title}</p>
                  <p className="text-[#6B6B75] text-sm">
                    {formatDate(workout.date)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {workout.distance && (
                  <p className="text-white font-medium">{formatDistance(workout.distance)}</p>
                )}
                <p className="text-[#6B6B75] text-sm">{formatTime(workout.time)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
