import React from 'react';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';

const ResultsTable = ({ data, theme }) => {
  const getStarColor = (stars) => {
    const num = parseInt(stars);
    if (num >= 4) return 'text-yellow-400';
    if (num >= 3) return 'text-yellow-500';
    if (num >= 2) return 'text-orange-500';
    return 'text-red-500';
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'text-green-500';
      case 'negative':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="overflow-x-auto"
    >
      <table className="w-full">
        <thead>
          <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              URL
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Rating
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Sentiment
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Confidence
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Summary
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((item, index) => (
            <motion.tr
              key={index}
              variants={item}
              className={`${
                theme === 'dark'
                  ? 'hover:bg-gray-800/50'
                  : 'hover:bg-gray-50'
              } transition-colors duration-200`}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="text-sm font-medium">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`hover:text-blue-500 transition-colors duration-200 ${
                        theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                      }`}
                    >
                      {item.url}
                    </a>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Star className={`h-5 w-5 ${getStarColor(item.star_label)}`} />
                  <span className="ml-2 text-sm font-medium">
                    {item.star_label}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {item.sentiment_label.toLowerCase() === 'positive' ? (
                    <ThumbsUp className="h-5 w-5 text-green-500" />
                  ) : item.sentiment_label.toLowerCase() === 'negative' ? (
                    <ThumbsDown className="h-5 w-5 text-red-500" />
                  ) : (
                    <MessageSquare className="h-5 w-5 text-gray-500" />
                  )}
                  <span className={`ml-2 text-sm font-medium ${getSentimentColor(item.sentiment_label)}`}>
                    {item.sentiment_label}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">
                  {(item.sentiment_score * 100).toFixed(1)}%
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm max-w-md">
                  {item.summary}
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
};

export default ResultsTable; 