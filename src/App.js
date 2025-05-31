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
      const response = await axios.post('https://scrapvision.onrender.com/analyse', {
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
        await axios.post(`https://scrapvision.onrender.com/cancel/${jobId}`);
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
        const response = await axios.get(`https://scrapvision.onrender.com/status/${jobId}`);
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
      className={`min-h-screen w-full ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-200'
          : 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 text-gray-800'
      } transition-colors duration-300`}
    >
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          height: formHidden ? '120px' : '40vh',
          padding: formHidden ? '1rem' : '2rem'
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="w-full flex items-center justify-center relative overflow-hidden"
      >
        <button
          onClick={toggleTheme}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-opacity-20 hover:bg-gray-500 transition-all duration-300 z-50"
          style={{ zIndex: 1000 }}
        >
          {theme === 'dark' ? <Sun className="text-yellow-400" /> : <Moon className="text-gray-600" />}
        </button>

        <div className="w-full max-w-4xl mx-auto px-4 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: formHidden ? 0.7 : 1
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="relative w-full flex flex-col items-center"
          >
            <motion.h1
              className={`text-6xl md:text-8xl font-black tracking-tighter bg-clip-text text-transparent uppercase text-center ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500'
                  : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600'
              }`}
              animate={{
                backgroundPosition: ['0%', '100%'],
                textShadow: [
                  '0 0 10px rgba(59, 130, 246, 0.5)',
                  '0 0 20px rgba(59, 130, 246, 0.5)',
                  '0 0 10px rgba(59, 130, 246, 0.5)'
                ],
                fontSize: formHidden ? '2.5rem' : 'inherit'
              }}
              transition={{
                backgroundPosition: {
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse"
                },
                textShadow: {
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                },
                fontSize: {
                  duration: 0.5,
                  ease: "easeInOut"
                }
              }}
              style={{
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              CRAWL.AI
            </motion.h1>

            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl -z-10"
              animate={{
                opacity: [0.5, 0.8, 0.5],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />

            <motion.div
              className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-2xl -z-20"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1.1, 1, 1.1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: formHidden ? 0 : 1, 
              y: 0,
              height: formHidden ? 0 : 'auto',
              marginTop: formHidden ? 0 : '1.5rem'
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className={`text-lg md:text-xl font-medium text-center w-full ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            <motion.span
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              AI Powered Web Crawler
            </motion.span>
          </motion.p>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {!jobId && !loading && !errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <InputForm onSubmit={handleAnalyse} hidden={formHidden} />
            </motion.div>
          )}

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
