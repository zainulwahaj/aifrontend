import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Star } from 'lucide-react';

const StarBarChart = ({ data, theme }) => {
  const processedData = useMemo(() => {
    const starCounts = {
      '1 star': 0,
      '2 stars': 0,
      '3 stars': 0,
      '4 stars': 0,
      '5 stars': 0,
    };

    data.forEach((item) => {
      const starLabel = item.star_label.toLowerCase();
      if (starCounts.hasOwnProperty(starLabel)) {
        starCounts[starLabel]++;
      }
    });

    return Object.entries(starCounts).map(([label, count]) => ({
      label,
      count,
    }));
  }, [data]);

  const getStarColor = (stars) => {
    const num = parseInt(stars);
    if (num >= 4) return '#fbbf24'; // yellow-400
    if (num >= 3) return '#f59e0b'; // yellow-500
    if (num >= 2) return '#f97316'; // orange-500
    return '#ef4444'; // red-500
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-lg shadow-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } border ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <p className="font-medium">{label}</p>
          <p className="text-sm">
            Count: <span className="font-semibold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-[400px] p-4"
    >
      <div className="flex items-center justify-center mb-6">
        <Star className="h-6 w-6 text-yellow-400 mr-2" />
        <h3 className={`text-xl font-semibold ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
        }`}>
          Star Rating Distribution
        </h3>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={processedData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
          />
          <XAxis
            dataKey="label"
            stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'}
            tick={{ fill: theme === 'dark' ? '#9ca3af' : '#4b5563' }}
          />
          <YAxis
            stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'}
            tick={{ fill: theme === 'dark' ? '#9ca3af' : '#4b5563' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="count"
            fill={theme === 'dark' ? '#3b82f6' : '#2563eb'}
            radius={[4, 4, 0, 0]}
            animationDuration={1000}
          >
            {processedData.map((entry, index) => (
              <motion.cell
                key={`cell-${index}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                fill={getStarColor(entry.label)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default StarBarChart; 