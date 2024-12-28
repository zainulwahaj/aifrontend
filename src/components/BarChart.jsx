import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const StarBarChart = ({ data }) => {
  // Tally star labels into { '1 star': X, '2 stars': Y, ... }
  const chartData = useMemo(() => {
    const counts = { '1 star': 0, '2 stars': 0, '3 stars': 0, '4 stars': 0, '5 stars': 0 };
    data.forEach(item => {
      if (counts[item.star_label] !== undefined) {
        counts[item.star_label]++;
      }
    });
    return Object.keys(counts).map(star => ({
      star,
      count: counts[star],
    }));
  }, [data]);

  // Define custom colors for each rating
  const starColors = {
    '1 star': '#ef4444', // red-500
    '2 stars': '#f59e0b', // amber-500
    '3 stars': '#eab308', // yellow-500
    '4 stars': '#10b981', // green-500
    '5 stars': '#3b82f6', // blue-500
  };

  return (
    <div className="w-full h-[300px] sm:h-[400px]">
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 20, bottom: 30, left: 10 }}
          barCategoryGap="10%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#555" />
          <XAxis
            dataKey="star"
            tick={{ fontSize: 14, fill: '#fff' }}
            label={{ value: 'Star Rating', position: 'bottom', fill: '#fff', fontSize: 16, offset: 10 }}
          />
          <YAxis
            tick={{ fontSize: 14, fill: '#fff' }}
            label={{ value: 'Count', angle: -90, position: 'insideLeft', fill: '#fff', fontSize: 16 }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#111', border: 'none' }}
            labelStyle={{ color: '#fff' }}
            itemStyle={{ color: '#fff' }}
          />
          <Bar dataKey="count" barSize={30} radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => {
              const color = starColors[entry.star] || '#f87171';
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StarBarChart;
