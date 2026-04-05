'use client';

import { useEffect, useState } from 'react';

interface Insight {
  type: 'improvement' | 'trend' | 'tip' | 'warning';
  title: string;
  description: string;
  metric?: string;
  change?: number;
}

const typeStyles = {
  improvement: {
    bg: 'bg-[#00D4AA]/10',
    border: 'border-[#00D4AA]/30',
    icon: '↑',
    iconColor: 'text-[#00D4AA]',
  },
  trend: {
    bg: 'bg-[#6B9FFF]/10',
    border: 'border-[#6B9FFF]/30',
    icon: '→',
    iconColor: 'text-[#6B9FFF]',
  },
  tip: {
    bg: 'bg-[#FFD700]/10',
    border: 'border-[#FFD700]/30',
    icon: '★',
    iconColor: 'text-[#FFD700]',
  },
  warning: {
    bg: 'bg-[#FF6B6B]/10',
    border: 'border-[#FF6B6B]/30',
    icon: '!',
    iconColor: 'text-[#FF6B6B]',
  },
};

export function InsightsCards() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ai/insights')
      .then((res) => res.json())
      .then((data) => {
        setInsights(data.insights || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-[#151518] border border-[#2A2A30] rounded-lg p-4 h-32 animate-pulse" />
        <div className="bg-[#151518] border border-[#2A2A30] rounded-lg p-4 h-32 animate-pulse" />
      </div>
    );
  }

  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {insights.slice(0, 4).map((insight, index) => {
        const style = typeStyles[insight.type];
        return (
          <div
            key={index}
            className={`${style.bg} border ${style.border} rounded-lg p-4`}
          >
            <div className="flex items-start gap-3">
              <span className={`${style.iconColor} text-xl`}>{style.icon}</span>
              <div>
                <p className="text-white font-medium mb-1">{insight.title}</p>
                <p className="text-[#A8A8B3] text-sm">{insight.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
