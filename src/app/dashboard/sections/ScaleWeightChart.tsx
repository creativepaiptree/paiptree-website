'use client';

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Generate sample data for 50 days
const generateData = () => {
  const data = [];
  for (let day = 8; day <= 50; day++) {
    const baseWeight = 200 + (day - 8) * 65;
    const variation = Math.sin(day * 0.3) * 30;
    data.push({
      day,
      avg: Math.round(baseWeight + variation),
      s4: Math.round(baseWeight + variation + 50),
      s5: Math.round(baseWeight + variation - 30),
      s6: Math.round(baseWeight + variation + 20),
    });
  }
  return data;
};

const data = generateData();

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1c2128] border border-gray-700 rounded-lg p-3 shadow-lg">
        <p className="text-gray-300 font-medium mb-2">Day {label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-400">{entry.name}:</span>
            <span className="text-gray-200">{entry.value} g</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ScaleWeightChart = () => {
  return (
    <div className="bg-[#161b22] rounded-lg p-4 border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 font-medium text-lg">SCALE WEIGHT</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-[#8b5cf6] rounded-sm" />
            <span className="text-gray-400">AVG</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-[#ef4444] rounded-sm" />
            <span className="text-gray-400">S4</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-[#eab308] rounded-sm" />
            <span className="text-gray-400">S5</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-[#f472b6] rounded-sm" />
            <span className="text-gray-400">S6</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#374151' }}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#374151' }}
              domain={[0, 3500]}
              ticks={[0, 500, 1000, 1500, 2000, 2500, 3000, 3500]}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* AVG Bars */}
            <Bar
              dataKey="avg"
              fill="#8b5cf6"
              name="AVG"
              radius={[2, 2, 0, 0]}
              maxBarSize={20}
            />

            {/* Lines */}
            <Line
              type="monotone"
              dataKey="s4"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              name="S4"
            />
            <Line
              type="monotone"
              dataKey="s5"
              stroke="#eab308"
              strokeWidth={2}
              dot={false}
              name="S5"
            />
            <Line
              type="monotone"
              dataKey="s6"
              stroke="#f472b6"
              strokeWidth={2}
              dot={false}
              name="S6"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ScaleWeightChart;
