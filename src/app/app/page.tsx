export default function App() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[#2A2A30]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-white">
            Row<span className="text-[#00D4AA]">.ai</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#A8A8B3]">Dashboard</span>
            <span className="text-[#6B6B75]">Settings</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-[#A8A8B3]">Track your training and get AI-powered workouts</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#151518] border border-[#2A2A30] rounded-lg p-4">
            <p className="text-[#6B6B75] text-sm mb-1">This Week</p>
            <p className="text-2xl font-bold text-white">12.5km</p>
            <p className="text-[#6B6B75] text-xs">distance</p>
          </div>
          <div className="bg-[#151518] border border-[#2A2A30] rounded-lg p-4">
            <p className="text-[#6B6B75] text-sm mb-1">Workouts</p>
            <p className="text-2xl font-bold text-white">4</p>
            <p className="text-[#6B6B75] text-xs">this week</p>
          </div>
          <div className="bg-[#151518] border border-[#2A2A30] rounded-lg p-4">
            <p className="text-[#6B6B75] text-sm mb-1">Time</p>
            <p className="text-2xl font-bold text-white">45 min</p>
            <p className="text-[#6B6B75] text-xs">this week</p>
          </div>
        </div>

        <div className="bg-[#00D4AA]/10 border border-[#00D4AA]/30 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-[#00D4AA] text-xl">↑</span>
            <div>
              <p className="text-white font-medium mb-1">Great progress this week!</p>
              <p className="text-[#A8A8B3] text-sm">You&apos;re 80% of the way to your weekly distance goal. Keep it up!</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-[#151518] border border-[#2A2A30] rounded-lg p-6">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="text-lg font-semibold text-white mb-2">Generate AI Workout</h3>
            <p className="text-[#A8A8B3] text-sm mb-4">Get a personalized workout based on your training history</p>
            <button className="bg-[#FF6B35] text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#e85d04] transition-colors w-full">
              Generate Workout
            </button>
          </div>

          <div className="bg-[#151518] border border-[#2A2A30] rounded-lg p-6">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold text-white mb-2">View Insights</h3>
            <p className="text-[#A8A8B3] text-sm mb-4">Analyze your performance and track improvements</p>
            <button className="bg-[#00D4AA] text-black font-semibold px-4 py-2 rounded-lg hover:bg-[#00b894] transition-colors w-full">
              View Analytics
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Workouts</h2>
          <button className="text-[#00D4AA] hover:text-[#00b894] text-sm font-medium">
            Import from Concept Rower →
          </button>
        </div>

        <div className="bg-[#151518] border border-[#2A2A30] rounded-lg p-8 text-center">
          <p className="text-[#6B6B75] mb-4">Connect your Concept Rower to see your workouts</p>
          <button className="bg-[#00D4AA] text-black font-semibold px-6 py-3 rounded-lg hover:bg-[#00b894] transition-colors">
            Connect Concept Rower
          </button>
        </div>
      </main>
    </div>
  );
}
