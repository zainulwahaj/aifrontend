import React, { useState, useMemo } from 'react';
import axios from 'axios';
import InputForm from './components/InputForm';
import ResultsTable from './components/ResultsTable';
import BarChart from './components/BarChart';
import { FaRobot } from 'react-icons/fa';

function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formHidden, setFormHidden] = useState(false);

  // Start BFS or DFS
  const handleAnalyse = async ({ url, method, depth }) => {
    setFormHidden(true);
    setLoading(true);
    setResults([]);
    setErrorMsg('');
  
    try {
      const response = await axios.post('https://8759-39-58-160-102.ngrok-free.app/analyse', {
        url,
        method,
        depth: Number(depth),
      });
      console.log(response)
      setResults(response.data);
    } catch (err) {
      if (err.response && err.response.data) {
        setErrorMsg(err.response.data.error || 'Server error occurred');
      } else {
        setErrorMsg(err.message || 'Network error');
      }
    } finally {
      setLoading(false);
    }
  };
  

  // Reset for new crawl or error
  const handleReset = () => {
    setResults([]);
    setLoading(false);
    setErrorMsg('');
    setFormHidden(false);
  };

  // Download CSV client-side
  const handleDownloadCSV = () => {
    if (results.length === 0) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'URL,Star Label,Sentiment Label,Confidence,Summary\n';
    results.forEach((item) => {
      const row = [
        item.url,
        item.star_label,
        item.sentiment_label,
        item.sentiment_score,
        `"${item.summary?.replace(/"/g, '""')}"`,
      ].join(',');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="min-h-screen w-full bg-gradient-to-br from-black to-red-900 text-gray-200 pb-10"
    >
      <header className="py-6 text-center">
        <h1
          className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-red-200 to-red-600 drop-shadow-lg"
        >
          ScrapeVision
        </h1>
        <p className="text-sm text-gray-300 mt-2 font-medium">
          Dark, Stylish, and Animated Crawler
        </p>
      </header>

      <div className="max-w-6xl mx-auto px-4">
        {/* Show Input Form only if there are no results */}
        {!results.length && !loading && !errorMsg && (
          <InputForm onSubmit={handleAnalyse} hidden={formHidden} />
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-8 flex flex-col items-center gap-4 animate-fadeInUp">
            <div className="flex space-x-2 text-red-100 text-2xl">
              <FaRobot className="animate-bounce" />
              <span>Generating Summaries</span>
            </div>

            {/* Dot wave loader */}
            <div className="text-red-100 text-xl">
              <span className="loader-dot">.</span>
              <span className="loader-dot">.</span>
              <span className="loader-dot">.</span>
              <span className="loader-dot">.</span>
            </div>
          </div>
        )}

        {/* Error */}
        {errorMsg && !loading && (
          <div className="mt-4 bg-red-100 text-red-700 px-4 py-2 rounded shadow-lg text-center space-y-2">
            <p>{errorMsg}</p>
            <button onClick={handleReset} className="underline text-blue-600">
              Go back
            </button>
          </div>
        )}

        {/* Results Section */}
        {results.length > 0 && !loading && (
          <div
            className="mt-4 bg-black/70 backdrop-blur-xl p-6 rounded-xl shadow-2xl border border-red-800"
          >
            <div className="flex justify-end mb-4">
              <button
                onClick={handleDownloadCSV}
                className="mr-4 px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition-all duration-300 transform hover:scale-105"
              >
                Download CSV
              </button>

              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-700 text-white transition-all duration-300 transform hover:scale-105"
              >
                New Crawl
              </button>
            </div>

            {/* Results Table */}
            <ResultsTable data={results} />

            {/* Bar Chart */}
            <div className="mt-8">
              <BarChart data={results} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;