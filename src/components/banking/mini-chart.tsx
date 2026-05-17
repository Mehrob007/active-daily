'use client';

import { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

interface MiniChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
  className?: string;
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

const DEFAULT_COLOR = '#C8102E';

export function MiniChart({
  data,
  color = DEFAULT_COLOR,
  height = 40,
  className,
}: MiniChartProps) {
  // Build a unique gradient ID so multiple charts on one page don't clash
  const gradientId = useMemo(
    () => `mini-chart-gradient-${Math.random().toString(36).slice(2, 9)}`,
    [],
  );

  return (
    <div className={className} style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          {/* Hidden YAxis so the chart auto-scales to data */}
          <YAxis domain={['dataMin', 'dataMax']} hide />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
