import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[#2A2A30]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-white">
            Row<span className="text-[#00D4AA]">.ai</span>
          </div>
          <nav className="flex gap-6">
            <a href="#features" className="text-[#A8A8B3] hover:text-white transition-colors">
              Features
            </a>
            <a href="#how" className="text-[#A8A8B3] hover:text-white transition-colors">
              How it Works
            </a>
            <Link href="/app" className="bg-[#00D4AA] text-black font-semibold px-4 py-2 rounded-lg hover:bg-[#00b894] transition-colors">
              Launch App
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="py-24 px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 max-w-3xl mx-auto leading-tight">
            AI-Powered Rowing Workouts for Your <span className="text-[#00D4AA]">Concept Rower</span>
          </h1>
          <p className="text-xl text-[#A8A8B3] mb-10 max-w-2xl mx-auto">
            Import your rowing history, let AI analyze your performance, and get personalized workout programs tailored to your goals.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/app" className="bg-[#00D4AA] text-black font-bold px-8 py-4 rounded-lg hover:bg-[#00b894] transition-colors text-lg">
              Get Started
            </Link>
            <a href="#features" className="border border-[#2A2A30] text-white font-semibold px-8 py-4 rounded-lg hover:bg-[#151518] transition-colors text-lg">
              Learn More
            </a>
          </div>
        </section>

        <section id="features" className="py-20 px-6 border-t border-[#2A2A30]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Features</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[#151518] border border-[#2A2A30] rounded-lg p-6">
                <div className="text-4xl mb-4">🧠</div>
                <h3 className="text-xl font-semibold text-white mb-2">AI-Generated Workouts</h3>
                <p className="text-[#A8A8B3]">
                  Personalized training programs based on your fitness level and goals.
                </p>
              </div>
              <div className="bg-[#151518] border border-[#2A2A30] rounded-lg p-6">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-white mb-2">Performance Insights</h3>
                <p className="text-[#A8A8B3]">
                  Track pace improvement, stroke rate, and weekly training goals.
                </p>
              </div>
              <div className="bg-[#151518] border border-[#2A2A30] rounded-lg p-6">
                <div className="text-4xl mb-4">🔄</div>
                <h3 className="text-xl font-semibold text-white mb-2">Concept Rower Sync</h3>
                <p className="text-[#A8A8B3]">
                  Import your rowing history automatically from your Concept Rower log.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="py-20 px-6 border-t border-[#2A2A30]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="bg-[#00D4AA] text-black font-bold w-10 h-10 rounded-full flex items-center justify-center shrink-0">1</div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Connect Your Concept Rower</h3>
                  <p className="text-[#A8A8B3]">Link your Concept Rower account to import your rowing history and past workouts.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="bg-[#00D4AA] text-black font-bold w-10 h-10 rounded-full flex items-center justify-center shrink-0">2</div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">AI Analyzes Your Data</h3>
                  <p className="text-[#A8A8B3]">Our AI reviews your performance metrics, identifies patterns, and understands your fitness level.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="bg-[#00D4AA] text-black font-bold w-10 h-10 rounded-full flex items-center justify-center shrink-0">3</div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Get Personalized Workouts</h3>
                  <p className="text-[#A8A8B3]">Receive AI-generated workout programs designed specifically for your goals and current fitness.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 border-t border-[#2A2A30] text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Training?</h2>
          <p className="text-[#A8A8B3] mb-8">Join rowers using AI to optimize their performance.</p>
          <Link href="/app" className="bg-[#00D4AA] text-black font-bold px-8 py-4 rounded-lg hover:bg-[#00b894] transition-colors text-lg">
            Launch App
          </Link>
        </section>
      </main>

      <footer className="border-t border-[#2A2A30] py-8 px-6">
        <div className="max-w-4xl mx-auto text-center text-[#6B6B75]">
          <p>Row.ai — AI-Powered Rowing Training</p>
        </div>
      </footer>
    </div>
  );
}
