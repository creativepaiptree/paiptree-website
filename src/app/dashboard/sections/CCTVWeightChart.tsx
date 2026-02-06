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
  ReferenceLine,
  Label,
} from 'recharts';

// Generate sample data for 50 days
const generateData = () => {
  const data = [];
  for (let day = 8; day <= 50; day++) {
    const baseWeight = 200 + (day - 8) * 65;
    const variation = Math.sin(day * 0.3) * 50;
    data.push({
      day,
      farmWeight: Math.round(baseWeight + variation),
      standardWeight: Math.round(180 + (day - 8) * 62),
      weightGain: Math.round(20 + Math.sin(day * 0.2) * 15),
      ct01: Math.round(baseWeight + variation + 30),
      ct02: Math.round(baseWeight + variation - 20),
      ct03: Math.round(baseWeight + variation + 10),
    });
  }
  return data;
};

const data = generateData();

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1c2128] border border-gray-700 rounded-lg p-3 shadow-lg">
        <p className="text-gray-300 font-medium mb-2">Day {label} - 01/24 10:00</p>
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

const CCTVWeightChart = () => {
  return (
    <div className="bg-[#161b22] rounded-lg p-4 border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 font-medium text-lg">CCTV WEIGHT</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-[#8b5cf6] rounded-sm" />
            <span className="text-gray-400">Farm Weight</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-[#22d3ee] rounded-sm" />
            <span className="text-gray-400">Standard Weight</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-[#3fb950] rounded-sm" />
            <span className="text-gray-400">Weight Gain</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-[#f472b6] rounded-sm" />
            <span className="text-gray-400">CT01 (1.043)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-[#ef4444] rounded-sm" />
            <span className="text-gray-400">CT02 (1.043)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-[#eab308] rounded-sm" />
            <span className="text-gray-400">CT03 (1.043)</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
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

            {/* Farm Weight Bars */}
            <Bar
              dataKey="farmWeight"
              fill="#8b5cf6"
              name="Farm Weight"
              radius={[2, 2, 0, 0]}
              maxBarSize={20}
            />

            {/* Lines */}
            <Line
              type="monotone"
              dataKey="standardWeight"
              stroke="#22d3ee"
              strokeWidth={2}
              dot={false}
              name="Standard Weight"
            />
            <Line
              type="monotone"
              dataKey="weightGain"
              stroke="#3fb950"
              strokeWidth={2}
              dot={false}
              name="Weight Gain"
            />
            <Line
              type="monotone"
              dataKey="ct01"
              stroke="#f472b6"
              strokeWidth={2}
              dot={false}
              name="CT01 (1.043)"
            />
            <Line
              type="monotone"
              dataKey="ct02"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              name="CT02 (1.043)"
            />
            <Line
              type="monotone"
              dataKey="ct03"
              stroke="#eab308"
              strokeWidth={2}
              dot={false}
              name="CT03 (1.043)"
            />

            {/* Shipment Completed Reference Line */}
            <ReferenceLine x={39} stroke="#ef4444" strokeDasharray="5 5">
              <Label
                value="Shipment Completed"
                position="top"
                fill="#ef4444"
                fontSize={11}
                offset={10}
              />
            </ReferenceLine>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Annotation */}
      <div className="flex justify-end mt-2">
        <div className="bg-[#f97316] text-white text-xs px-2 py-1 rounded">
          1/28 01:00
        </div>
        <div className="bg-[#f97316] text-white text-xs px-2 py-1 rounded ml-1">
          [21 BARN] 01/28 01:00 | 2,979g
        </div>
      </div>
    </div>
  );
};

export default CCTVWeightChart;
