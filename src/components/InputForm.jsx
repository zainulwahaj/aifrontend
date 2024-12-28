import React, { useState } from 'react';
import { HiPlay } from 'react-icons/hi';

const InputForm = ({ onSubmit, hidden }) => {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('bfs');
  const [depth, setDepth] = useState(5);

  // If hidden, animate fade out
  const containerClass = hidden
    ? 'animate-fadeOutDown pointer-events-none'
    : 'animate-fadeInUp';

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ url, method, depth });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`
        max-w-md w-full mx-auto p-6 rounded-xl shadow-2xl
        bg-white/80 backdrop-blur border border-red-900
        space-y-4 transition-all duration-500
        ${containerClass}
      `}
    >
      <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">
        Enter Crawler Settings
      </h2>

      <div className="flex flex-col space-y-1">
        <label className="font-medium text-gray-700">Start URL</label>
        <input
          type="text"
          placeholder="https://example.com"
          required
          className="px-4 py-2 rounded border border-gray-300
                     focus:outline-none focus:ring-2 focus:ring-red-500
                     transition duration-300 text-gray-700"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

      <div className="flex flex-col space-y-1">
        <label className="font-medium text-gray-700">Method</label>
        <select
          className="px-4 py-2 rounded border border-gray-300
                     focus:outline-none focus:ring-2 focus:ring-red-500
                     transition duration-300 text-gray-700"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          <option value="bfs">BFS</option>
          <option value="dfs">DFS</option>
        </select>
      </div>

      <div className="flex flex-col space-y-1">
        <label className="font-medium text-gray-700">Depth</label>
        <input
          type="number"
          min="1"
          className="px-4 py-2 rounded border border-gray-300
                     focus:outline-none focus:ring-2 focus:ring-red-500
                     transition duration-300 text-gray-700"
          value={depth}
          onChange={(e) => setDepth(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2
                   bg-red-700 text-white py-2 rounded-xl
                   hover:bg-red-800 transition-all duration-300
                   transform hover:scale-105 font-semibold"
      >
        <HiPlay />
        Start Crawl
      </button>
    </form>
  );
};

export default InputForm;
