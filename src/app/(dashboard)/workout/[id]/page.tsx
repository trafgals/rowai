'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface WorkoutSegment {
  type: string;
  duration: number;
  targetPace?: string;
  targetHeartRate?: string;
  description: string;
}

interface Workout {
  id: string;
  title: string;
  goal: string;
  durationMinutes: number;
  workoutType: string;
  segments: WorkoutSegment[];
  coachingCues: string[];
  estimatedCalories: number;
  status: string;
}

type WorkoutState = 'ready' | 'active' | 'paused' | 'completed';

export default function WorkoutExecutionPage() {
  const router = useRouter();
  const params = useParams();
  const workoutId = params.id as string;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [workoutState, setWorkoutState] = useState<WorkoutState>('ready');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [segmentElapsed, setSegmentElapsed] = useState(0);

  useEffect(() => {
    async function fetchWorkout() {
      try {
        const res = await fetch(`/api/workouts/${workoutId}`);
        if (res.ok) {
          const data = await res.json();
          setWorkout(data);
        }
      } catch (error) {
        console.error('Failed to fetch workout:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchWorkout();
  }, [workoutId]);

  const totalSeconds = workout ? workout.durationMinutes * 60 : 0;
  const progress = totalSeconds > 0 ? (elapsedSeconds / totalSeconds) * 100 : 0;

  const currentSegment = workout?.segments[currentSegmentIndex];
  const segmentProgress = currentSegment
    ? (segmentElapsed / (currentSegment.duration * 60)) * 100
    : 0;

  useEffect(() => {
    if (workoutState !== 'active') return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const newElapsed = prev + 1;
        
        if (newElapsed >= totalSeconds) {
          setWorkoutState('completed');
          return totalSeconds;
        }

        const segmentDuration = (currentSegment?.duration ?? 1) * 60;
        setSegmentElapsed((segPrev) => {
          const newSegElapsed = segPrev + 1;
          if (newSegElapsed >= segmentDuration && workout?.segments[currentSegmentIndex + 1]) {
            setCurrentSegmentIndex((idx) => idx + 1);
            return 0;
          }
          return newSegElapsed;
        });

        return newElapsed;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [workoutState, totalSeconds, currentSegment, currentSegmentIndex, workout?.segments]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setWorkoutState('active');
  const handlePause = () => setWorkoutState('paused');
  const handleResume = () => setWorkoutState('active');
  
  const handleComplete = async () => {
    if (!workout) return;
    
    setWorkoutState('completed');
    
    try {
      await fetch(`/api/workouts/${workoutId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedAt: new Date().toISOString(),
          totalTimeSeconds: elapsedSeconds,
        }),
      });
    } catch (error) {
      console.error('Failed to save workout:', error);
    }
  };

  const handleReset = () => {
    setWorkoutState('ready');
    setElapsedSeconds(0);
    setCurrentSegmentIndex(0);
    setSegmentElapsed(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <div className="text-white">Loading workout...</div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <div className="text-white">Workout not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white p-6">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => router.back()}
          className="text-[#6B6B75] hover:text-white mb-6 flex items-center gap-2"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold mb-2">{workout.title}</h1>
        <p className="text-[#6B6B75] mb-8">{workout.goal}</p>

        {workoutState === 'ready' && (
          <div className="space-y-6">
            <div className="bg-[#151518] border border-[#2A2A30] rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Workout Structure</h2>
              <div className="space-y-4">
                {workout.segments.map((segment, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      segment.type === 'warmup' ? 'bg-yellow-500' :
                      segment.type === 'main' ? 'bg-[#00D4AA]' :
                      segment.type === 'cooldown' ? 'bg-blue-500' :
                      'bg-[#FF6B35]'
                    }`} />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="capitalize font-medium">{segment.type}</span>
                        <span className="text-[#6B6B75]">{segment.duration} min</span>
                      </div>
                      <p className="text-[#A8A8B3] text-sm">{segment.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleStart}
              className="w-full bg-[#00D4AA] text-black font-bold py-4 rounded-lg hover:bg-[#00b894] transition-colors text-lg"
            >
              Start Workout
            </button>
          </div>
        )}

        {(workoutState === 'active' || workoutState === 'paused') && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-[#6B6B75] text-sm mb-2">
                {currentSegment?.type.toUpperCase()} • Segment {currentSegmentIndex + 1} of {workout.segments.length}
              </p>
              <p className="text-6xl font-bold font-mono">
                {formatTime(elapsedSeconds)}
              </p>
              <p className="text-[#6B6B75] mt-2">
                / {formatTime(totalSeconds)}
              </p>
            </div>

            <div className="bg-[#151518] rounded-lg p-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-[#2A2A30] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00D4AA] transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="bg-[#151518] rounded-lg p-4">
              <p className="text-[#6B6B75] text-sm mb-1">Current Segment</p>
              <p className="text-xl font-semibold mb-2">{currentSegment?.description}</p>
              {currentSegment?.targetPace && (
                <p className="text-[#00D4AA]">Target: {currentSegment.targetPace}</p>
              )}
              <div className="mt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Segment Progress</span>
                  <span>{Math.round(segmentProgress)}%</span>
                </div>
                <div className="h-1 bg-[#2A2A30] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FF6B35] transition-all duration-1000"
                    style={{ width: `${segmentProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {workout.coachingCues.length > 0 && (
              <div className="bg-[#151518] rounded-lg p-4">
                <p className="text-[#6B6B75] text-sm mb-2">Coaching Cue</p>
                <p className="text-lg">
                  {workout.coachingCues[currentSegmentIndex % workout.coachingCues.length]}
                </p>
              </div>
            )}

            <div className="flex gap-4">
              {workoutState === 'paused' ? (
                <button
                  onClick={handleResume}
                  className="flex-1 bg-[#00D4AA] text-black font-bold py-4 rounded-lg hover:bg-[#00b894] transition-colors"
                >
                  Resume
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="flex-1 bg-[#FF6B35] text-white font-bold py-4 rounded-lg hover:bg-[#e85d04] transition-colors"
                >
                  Pause
                </button>
              )}
              <button
                onClick={handleComplete}
                className="flex-1 bg-[#151518] border border-[#2A2A30] text-white font-bold py-4 rounded-lg hover:border-red-500 transition-colors"
              >
                Finish Early
              </button>
            </div>
          </div>
        )}

        {workoutState === 'completed' && (
          <div className="space-y-6">
            <div className="bg-[#151518] border border-[#00D4AA] rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">✓</div>
              <h2 className="text-2xl font-bold mb-2">Workout Complete!</h2>
              <p className="text-[#6B6B75]">
                {formatTime(elapsedSeconds)} • {workout.estimatedCalories} kcal estimated
              </p>
            </div>

            <div className="bg-[#151518] rounded-lg p-6">
              <h3 className="font-semibold mb-4">Workout Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[#6B6B75] text-sm">Duration</p>
                  <p className="text-xl font-bold">{formatTime(elapsedSeconds)}</p>
                </div>
                <div>
                  <p className="text-[#6B6B75] text-sm">Calories</p>
                  <p className="text-xl font-bold">{workout.estimatedCalories} kcal</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-[#00D4AA] text-black font-bold py-4 rounded-lg hover:bg-[#00b894] transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
