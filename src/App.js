// src/App.jsx

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, Moon, Bot, ArrowDown, X, 
  Download, RefreshCw, Search, 
  BarChart3, LineChart, Table
} from 'lucide-react';
import InputForm from './components/InputForm';
import ResultsTable from './components/ResultsTable';
import StarBarChart from './components/StarBarChart';
import ConfidenceBarChart from './components/ConfidenceBarChart';

function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formHidden, setFormHidden] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('table'); // 'table', 'starChart', 'confidenceChart'
  const pollingRef = useRef(null);
  const resultsRef = useRef(null);

  // Theme detection and management
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(darkModeMediaQuery.matches ? 'dark' : 'light');

    const handleThemeChange = (e) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    darkModeMediaQuery.addEventListener('change', handleThemeChange);
    return () => darkModeMediaQuery.removeEventListener('change', handleThemeChange);
  }, []);

  // Start crawl
  const handleAnalyse = async ({ url, limit }) => {
    setFormHidden(true);
    setLoading(true);
    setResults([]);
    setErrorMsg('');
    setJobId(null);

    try {
      const response = await axios.post('https://scrapvision-app-75184386a6fb.herokuapp.com/analyse', {
        urls: [url],
        limit: Number(limit),
      });
      const receivedJobId = response.data.job_id;
      setJobId(receivedJobId);
    } catch (err) {
      if (err.response && err.response.data) {
        setErrorMsg(err.response.data.error || 'Server error occurred');
      } else {
        setErrorMsg(err.message || 'Network error');
      }
      setLoading(false);
      setFormHidden(false);
    }
  };

  // Cancel crawl
  const handleCancel = async () => {
    if (jobId) {
      try {
        await axios.post(`https://scrapvision-app-75184386a6fb.herokuapp.com/cancel/${jobId}`);
      } catch (err) {
        console.error('Error canceling job:', err);
      }
    }
    handleReset();
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    const resultsSection = document.querySelector('.results-section');
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  // Polling to fetch job status
  useEffect(() => {
    if (!jobId) return;

    const fetchStatus = async () => {
      try {
        const response = await axios.get(`https://scrapvision-app-75184386a6fb.herokuapp.com/status/${jobId}`);
        const { status, results: newResults, error } = response.data;

        if (error) {
          setErrorMsg(error);
          setLoading(false);
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          setFormHidden(false);
          return;
        }

        setResults(newResults);

        if (status === 'completed' || status === 'failed') {
          setLoading(false);
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          if (status === 'failed') {
            setErrorMsg('Crawl job failed.');
            setFormHidden(false);
          }
        }
      } catch (err) {
        setErrorMsg('Error fetching job status.');
        setLoading(false);
        clearInterval(pollingRef.current);
        pollingRef.current = null;
        setFormHidden(false);
      }
    };

    pollingRef.current = setInterval(fetchStatus, 2000);
    fetchStatus();

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [jobId]);

  // Reset for new crawl or error
  const handleReset = () => {
    setResults([]);
    setLoading(false);
    setErrorMsg('');
    setFormHidden(false);
    setJobId(null);
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  // Download CSV client-side
  const handleDownloadCSV = () => {
    if (results.length === 0) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'URL,Star Rating,Sentiment Label,Confidence,Summary\n';
    results.forEach((item) => {
      const row = [
        `"${item.url}"`,
        `"${item.star_label}"`,
        `"${item.sentiment_label}"`,
        `${(item.sentiment_score || 0).toFixed(3)}`,
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

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col justify-center items-center px-2 sm:px-4 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-200'
          : 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 text-gray-800'
      } transition-colors duration-300`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Header + Form Group */}
      <motion.div
        initial={{ scale: 1, y: 0 }}
        animate={{
          scale: formHidden ? 0.6 : 1,
          y: formHidden ? -120 : 0,
          transition: { type: 'spring', stiffness: 80, damping: 18 }
        }}
        className="w-full flex flex-col items-center justify-center text-center gap-y-2 md:gap-y-4 max-w-xs sm:max-w-md md:max-w-xl px-2 sm:px-4"
        style={{ zIndex: 10 }}
      >
        <motion.h1
          className={`font-extrabold tracking-tight bg-clip-text text-transparent uppercase text-center leading-tight drop-shadow-2xl select-none text-[12vw] sm:text-7xl md:text-8xl ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500'
              : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600'
          }`}
          animate={{
            backgroundPosition: [
              '0% 50%',
              '100% 50%',
              '0% 50%'
            ],
            textShadow: [
              '0 0 40px #6366f1, 0 0 80px #a21caf',
              '0 0 80px #a21caf, 0 0 40px #6366f1',
              '0 0 40px #6366f1, 0 0 80px #a21caf'
            ]
          }}
          transition={{
            backgroundPosition: {
              duration: 6,
              repeat: Infinity,
              repeatType: 'reverse'
            },
            textShadow: {
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse'
            }
          }}
          style={{
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 0,
          }}
        >
          CRAWL.AI
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className={`text-xs sm:text-base md:text-lg font-medium text-center w-full select-none ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
          style={{ marginBottom: 0 }}
        >
          AI Powered Web Crawler
        </motion.p>
        {/* InputForm and rest of app */}
        <div className="w-full flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {!jobId && !loading && !errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full"
              >
                <InputForm onSubmit={handleAnalyse} hidden={formHidden} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="max-w-7xl w-full mx-auto px-2 sm:px-4 lg:px-8">
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 flex flex-col items-center gap-4"
            >
              <div className="flex space-x-2 text-blue-500 text-2xl">
                <Bot className="animate-bounce" />
                <span>Generating Summaries</span>
              </div>

              <div className="text-blue-500 text-xl">
                <span className="loader-dot">.</span>
                <span className="loader-dot">.</span>
                <span className="loader-dot">.</span>
                <span className="loader-dot">.</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                className="mt-4 px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition-all duration-300 flex items-center gap-2"
              >
                <X />
                Cancel
              </motion.button>
            </motion.div>
          )}

          {errorMsg && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 ${
                theme === 'dark' ? 'bg-red-900/50' : 'bg-red-100'
              } text-red-700 px-4 py-2 rounded shadow-lg text-center space-y-2`}
            >
              <p>{errorMsg}</p>
              <button onClick={handleReset} className="underline text-blue-600">
                Go back
              </button>
            </motion.div>
          )}

          {results.length > 0 && (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 results-section ${
                theme === 'dark' ? 'bg-gray-900/70' : 'bg-white/70'
              } backdrop-blur-xl p-6 rounded-xl shadow-2xl border ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              {/* Navigation Tabs */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('table')}
                    className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all duration-300 ${
                      activeTab === 'table'
                        ? 'bg-blue-600 text-white'
                        : theme === 'dark'
                        ? 'bg-gray-800 text-gray-300'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Table size={20} />
                    Table View
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('starChart')}
                    className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all duration-300 ${
                      activeTab === 'starChart'
                        ? 'bg-blue-600 text-white'
                        : theme === 'dark'
                        ? 'bg-gray-800 text-gray-300'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <BarChart3 size={20} />
                    Star Distribution
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('confidenceChart')}
                    className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all duration-300 ${
                      activeTab === 'confidenceChart'
                        ? 'bg-blue-600 text-white'
                        : theme === 'dark'
                        ? 'bg-gray-800 text-gray-300'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <LineChart size={20} />
                    Confidence Analysis
                  </motion.button>
                </div>

                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={scrollToBottom}
                    className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-700 text-white transition-all duration-300 flex items-center gap-2"
                  >
                    <ArrowDown size={20} />
                    Scroll to Bottom
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownloadCSV}
                    className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 flex items-center gap-2"
                  >
                    <Download size={20} />
                    Download CSV
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReset}
                    className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-700 text-white transition-all duration-300 flex items-center gap-2"
                  >
                    <RefreshCw size={20} />
                    New Crawl
                  </motion.button>
                </div>
              </div>

              {/* Content Area */}
              <AnimatePresence mode="wait">
                {activeTab === 'table' && (
                  <motion.div
                    key="table"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <ResultsTable data={results} theme={theme} />
                  </motion.div>
                )}
                {activeTab === 'starChart' && (
                  <motion.div
                    key="starChart"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <StarBarChart data={results} theme={theme} />
                  </motion.div>
                )}
                {activeTab === 'confidenceChart' && (
                  <motion.div
                    key="confidenceChart"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <ConfidenceBarChart data={results} theme={theme} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
