// src/components/ResultsTable.jsx

import React, { useState, useMemo } from 'react';
import { FaFilter } from 'react-icons/fa';

const ResultsTable = ({ data }) => {
  const [filterStar, setFilterStar] = useState('all');
  const [filterSentiment, setFilterSentiment] = useState('all');

  // Filter logic
  const filteredData = useMemo(() => {
    return data.filter(item => {
      let starPass = true;
      let sentimentPass = true;

      if (filterStar !== 'all') {
        starPass = (item.star_label === filterStar);
      }
      if (filterSentiment !== 'all') {
        sentimentPass = (item.sentiment_label === filterSentiment);
      }

      return starPass && sentimentPass;
    });
  }, [data, filterStar, filterSentiment]);

  return (
    <div className="w-full animate-fadeInUp">
      {/* Filters */}
      <div className="flex items-center justify-between mb-4 space-x-4">
        {/* Star Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-gray-200 font-medium">Star Rating</label>
          <div className="relative">
            <FaFilter className="absolute left-2 top-2 text-gray-400" />
            <select
              className="pl-8 pr-3 py-1 rounded border border-gray-300
                         focus:outline-none focus:ring-2 focus:ring-red-500
                         transition duration-300 text-gray-700"
              value={filterStar}
              onChange={(e) => setFilterStar(e.target.value)}
            >
              <option value="all">All</option>
              <option value="1 star">1 star</option>
              <option value="2 stars">2 stars</option>
              <option value="3 stars">3 stars</option>
              <option value="4 stars">4 stars</option>
              <option value="5 stars">5 stars</option>
            </select>
          </div>
        </div>

        {/* Sentiment Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-gray-200 font-medium">Sentiment</label>
          <div className="relative">
            <FaFilter className="absolute left-2 top-2 text-gray-400" />
            <select
              className="pl-8 pr-3 py-1 rounded border border-gray-300
                         focus:outline-none focus:ring-2 focus:ring-red-500
                         transition duration-300 text-gray-700"
              value={filterSentiment}
              onChange={(e) => setFilterSentiment(e.target.value)}
            >
              <option value="all">All</option>
              <option value="NEGATIVE">NEGATIVE</option>
              <option value="NEUTRAL">NEUTRAL</option>
              <option value="POSITIVE">POSITIVE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filtered Results */}
      {filteredData.length === 0 ? (
        <p className="text-center text-gray-300 mt-4">
          No results match the filters.
        </p>
      ) : (
        <div className="overflow-x-auto border border-gray-300 rounded-xl shadow-2xl">
          <table className="min-w-full table-fixed bg-black text-gray-200">
            <thead className="bg-gradient-to-r from-black to-red-900 text-white">
              <tr>
                <th className="py-3 px-4 text-left font-semibold" style={{ width: '20%' }}>URL</th>
                <th className="py-3 px-4 text-left font-semibold" style={{ width: '10%' }}>Star Rating</th>
                <th className="py-3 px-4 text-left font-semibold" style={{ width: '10%' }}>Sentiment</th>
                <th className="py-3 px-4 text-left font-semibold" style={{ width: '10%' }}>Confidence</th>
                <th className="py-3 px-4 text-left font-semibold" style={{ width: '50%' }}>Summary</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-700 hover:bg-gray-800 transition"
                >
                  <td className="py-2 px-4">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="underline text-blue-400">
                      {item.url}
                    </a>
                  </td>
                  <td className="py-2 px-4">{item.star_label}</td>
                  <td className="py-2 px-4">{item.sentiment_label}</td>
                  <td className="py-2 px-4">{(item.sentiment_score || 0).toFixed(3)}</td>
                  <td className="py-2 px-4">{item.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ResultsTable;
