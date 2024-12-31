// src/components/ConfidenceBarChart.jsx

import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const ConfidenceBarChart = ({ data }) => {
  // Calculate average confidence per star rating
  const chartData = useMemo(() => {
    const starMap = {
      '1 star': { total: 0, count: 0 },
      '2 stars': { total: 0, count: 0 },
      '3 stars': { total: 0, count: 0 },
      '4 stars': { total: 0, count: 0 },
      '5 stars': { total: 0, count: 0 },
    };

    data.forEach(item => {
      const star = item.star_label;
      if (starMap[star]) {
        starMap[star].total += item.sentiment_score;
        starMap[star].count += 1;
      }
    });

    return Object.keys(starMap).map(star => ({
      star,
      averageConfidence: starMap[star].count > 0 ? (starMap[star].total / starMap[star].count) : 0,
    }));
  }, [data]);

  // Define custom colors matching the star ratings
  const confidenceColors = {
    '1 star': '#ef4444', // red-500
    '2 stars': '#f59e0b', // amber-500
    '3 stars': '#eab308', // yellow-500
    '4 stars': '#10b981', // green-500
    '5 stars': '#3b82f6', // blue-500
  };

  // Format tooltip to show percentage
  const tooltipFormatter = (value) => {
    return [`${(value * 100).toFixed(1)}%`, 'Average Confidence'];
  };

  return (
    <div className="w-full h-[300px] sm:h-[400px] mt-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-200">Average Confidence per Star Rating</h2>
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
            label={{ value: 'Average Confidence (%)', angle: -90, position: 'insideLeft', fill: '#fff', fontSize: 16 }}
            domain={[0, 1]}
            ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]}
            tickFormatter={(tick) => `${tick * 100}%`}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#111', border: 'none' }}
            labelStyle={{ color: '#fff' }}
            itemStyle={{ color: '#fff' }}
            formatter={tooltipFormatter}
          />
          <Bar dataKey="averageConfidence" barSize={30} radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => {
              const color = confidenceColors[entry.star] || '#f87171';
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ConfidenceBarChart;
