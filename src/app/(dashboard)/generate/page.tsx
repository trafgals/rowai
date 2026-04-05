'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface WorkoutSegment {
  type: string;
  duration: number;
  targetPace?: string;
  targetHeartRate?: string;
  description: string;
}

interface GeneratedWorkout {
  id: string;
  title: string;
  totalDuration: number;
  goal: string;
  workoutType: string;
  segments: WorkoutSegment[];
  coachingCues: string[];
  estimatedCalories: number;
}

export default function GeneratePage() {
  const router = useRouter();
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState(30);
  const [type, setType] = useState('endurance');
  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!goal.trim()) {
      setError('Please enter a goal');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, duration, type }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      setWorkout(data.workout);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const goalPresets = [
    { label: 'Build endurance', value: 'Build my aerobic endurance with steady state rowing' },
    { label: 'Improve speed', value: 'Improve my 2k pace with intervals' },
    { label: 'Recovery day', value: 'Light recovery row focusing on technique' },
    { label: 'Full body workout', value: 'Challenging workout that builds strength and endurance' },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Generate Workout</h1>

      {!workout ? (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#A8A8B3] mb-2">
              What is your training goal?
            </label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Build my aerobic endurance, improve my 2k pace..."
              className="w-full bg-[#151518] border border-[#2A2A30] rounded-lg p-4 text-white placeholder-[#6B6B75] focus:outline-none focus:border-[#00D4AA] resize-none"
              rows={3}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {goalPresets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => setGoal(preset.value)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  goal === preset.value
                    ? 'bg-[#00D4AA] text-black'
                    : 'bg-[#151518] border border-[#2A2A30] text-[#A8A8B3] hover:border-[#00D4AA]'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#A8A8B3] mb-2">
                Duration (minutes)
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-[#151518] border border-[#2A2A30] rounded-lg p-3 text-white focus:outline-none focus:border-[#00D4AA]"
              >
                {[20, 25, 30, 35, 40, 45, 50, 60].map((d) => (
                  <option key={d} value={d}>{d} min</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#A8A8B3] mb-2">
                Workout Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-[#151518] border border-[#2A2A30] rounded-lg p-3 text-white focus:outline-none focus:border-[#00D4AA]"
              >
                <option value="endurance">Endurance</option>
                <option value="intervals">Intervals</option>
                <option value="strength">Strength</option>
                <option value="recovery">Recovery</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-[#00D4AA] text-black font-semibold py-4 rounded-lg hover:bg-[#00b894] transition-colors disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Workout'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-[#151518] border border-[#2A2A30] rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-2">{workout.title}</h2>
            <p className="text-[#6B6B75] text-sm mb-4">{workout.totalDuration} min • {workout.workoutType}</p>

            <div className="space-y-4">
              {workout.segments.map((segment, i) => (
                <div key={i} className="flex gap-4">
                  <div className={`w-2 rounded-full ${
                    segment.type === 'warmup' ? 'bg-yellow-500' :
                    segment.type === 'main' ? 'bg-[#00D4AA]' :
                    segment.type === 'cooldown' ? 'bg-blue-500' :
                    'bg-[#FF6B35]'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium capitalize">{segment.type}</span>
                      <span className="text-[#6B6B75] text-sm">{segment.duration} min</span>
                    </div>
                    <p className="text-[#A8A8B3] text-sm">{segment.description}</p>
                    {segment.targetPace && (
                      <p className="text-[#00D4AA] text-sm mt-1">Target: {segment.targetPace}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {workout.coachingCues.length > 0 && (
              <div className="mt-6 pt-6 border-t border-[#2A2A30]">
                <h3 className="text-white font-medium mb-3">Coaching Cues</h3>
                <ul className="space-y-2">
                  {workout.coachingCues.map((cue, i) => (
                    <li key={i} className="text-[#A8A8B3] text-sm flex items-start gap-2">
                      <span className="text-[#00D4AA]">•</span>
                      {cue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-[#2A2A30] flex items-center justify-between">
              <div>
                <p className="text-[#6B6B75] text-sm">Estimated Calories</p>
                <p className="text-white font-medium">{workout.estimatedCalories} kcal</p>
              </div>
              <button
                onClick={() => setWorkout(null)}
                className="text-[#00D4AA] hover:text-[#00b894] text-sm font-medium"
              >
                Generate Another
              </button>
            </div>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-[#151518] border border-[#2A2A30] text-white font-medium py-3 rounded-lg hover:border-[#00D4AA] transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
