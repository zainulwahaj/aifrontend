import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LineChart } from 'lucide-react';

const ConfidenceBarChart = ({ data, theme }) => {
  const processedData = useMemo(() => {
    const starConfidence = {
      '1 star': { total: 0, count: 0 },
      '2 stars': { total: 0, count: 0 },
      '3 stars': { total: 0, count: 0 },
      '4 stars': { total: 0, count: 0 },
      '5 stars': { total: 0, count: 0 },
    };

    data.forEach((item) => {
      const starLabel = item.star_label.toLowerCase();
      if (starConfidence.hasOwnProperty(starLabel)) {
        starConfidence[starLabel].total += item.sentiment_score || 0;
        starConfidence[starLabel].count += 1;
      }
    });

    return Object.entries(starConfidence).map(([label, { total, count }]) => ({
      label,
      confidence: count > 0 ? (total / count) * 100 : 0,
    }));
  }, [data]);

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
            Confidence: <span className="font-semibold">{payload[0].value.toFixed(1)}%</span>
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
        <LineChart className="h-6 w-6 text-blue-500 mr-2" />
        <h3 className={`text-xl font-semibold ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
        }`}>
          Sentiment Confidence by Star Rating
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
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="confidence"
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
                fill={theme === 'dark' ? '#3b82f6' : '#2563eb'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default ConfidenceBarChart; 