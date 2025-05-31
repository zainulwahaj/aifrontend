import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight } from 'lucide-react';

const InputForm = ({ onSubmit, hidden }) => {
  const [url, setUrl] = useState('');
  const [limit, setLimit] = useState(10);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!url) {
      setError('Please enter a URL');
      return;
    }

    try {
      new URL(url);
    } catch (err) {
      setError('Please enter a valid URL');
      return;
    }

    if (limit < 1 || limit > 100) {
      setError('Limit must be between 1 and 100');
      return;
    }

    onSubmit({ url, limit });
  };

  if (hidden) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto mt-8"
    >
      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-200/20">
        <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          Start Crawling
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="url" className="block text-sm font-medium mb-2">
              URL to Crawl
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white/5 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>

          <div>
            <label htmlFor="limit" className="block text-sm font-medium mb-2">
              Number of Reviews to Analyze
            </label>
            <input
              type="number"
              id="limit"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              min="1"
              max="100"
              className="block w-full px-3 py-3 border border-gray-300 rounded-lg bg-white/5 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
          >
            Start Analysis
            <ArrowRight className="h-5 w-5" />
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default InputForm;
