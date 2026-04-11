import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, TrendingUp, BarChart3, Globe, Zap, Loader2, Check, ExternalLink, ChevronDown, Activity, Sparkles, AlertCircle, Maximize, BookOpen, Shield, TrendingDown, Award, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import AISnapshot from './AISnapshot';
import { io } from 'socket.io-client';

const baseURL = window._env_?.VITE_AISA_BACKEND_API || import.meta.env.VITE_AISA_BACKEND_API || "http://localhost:8080/api";

const PRESET_STOCKS = [
   { symbol: 'TCS.BSE', name: 'Tata Consultancy', region: 'IN' },
   { symbol: 'RELIANCE.BSE', name: 'Reliance Ind.', region: 'IN' },
   { symbol: 'HDFCBANK.BSE', name: 'HDFC Bank', region: 'IN' },
   { symbol: 'INFY.BSE', name: 'Infosys Ltd', region: 'IN' },
   { symbol: 'ICICIBANK.BSE', name: 'ICICI Bank', region: 'IN' },
   { symbol: 'TCS.NSE', name: 'Tata Consultancy', region: 'IN' },
   { symbol: 'RELIANCE.NSE', name: 'Reliance Ind.', region: 'IN' },
   { symbol: 'HDFCBANK.NSE', name: 'HDFC Bank', region: 'IN' },
   { symbol: 'INFY.NSE', name: 'Infosys Ltd', region: 'IN' },
   { symbol: 'ICICIBANK.NSE', name: 'ICICI Bank', region: 'IN' }

   //   { symbol: 'AAPL', name: 'Apple Inc.', region: 'US' },
   //   { symbol: 'MSFT', name: 'Microsoft Corp.', region: 'US' },
   //   { symbol: 'NVDA', name: 'NVIDIA Corp.', region: 'US' }
];

const TradingViewWidget = ({ symbol, interval = "D", containerId = "tv_chart_container" }) => {
   const containerRef = React.useRef(null);

   useEffect(() => {
      let tvSymbol = "BSE:SENSEX";
      if (symbol) {
         // Standardize symbol for TradingView (NSE:TCS, BSE:RELIANCE, etc.)
         const cleanSymbol = symbol.split('.')[0];
         if (symbol.includes('.BSE')) tvSymbol = `BSE:${cleanSymbol}`;
         else if (symbol.includes('.NSE')) tvSymbol = `NSE:${cleanSymbol}`;
         else if (!symbol.includes('.')) tvSymbol = `NASDAQ:${cleanSymbol}`;
         else tvSymbol = symbol;
      }

      const currentContainer = containerRef.current;
      if (currentContainer) {
         currentContainer.innerHTML = '';
         const script = document.createElement("script");
         script.src = "https://s3.tradingview.com/tv.js";
         script.async = true;
         script.onload = () => {
            if (window.TradingView) {
               new window.TradingView.widget({
                  "autosize": true,
                  "symbol": tvSymbol,
                  "interval": interval,
                  "timezone": "Asia/Kolkata",
                  "theme": "light",
                  "style": "1",
                  "locale": "en",
                  "toolbar_bg": "#f1f3f6",
                  "enable_publishing": false,
                  "hide_side_toolbar": false,
                  "allow_symbol_change": true,
                  "container_id": containerId,
                  "studies": [
                     "Volume@tv-basicstudies",
                  ],
                  "show_popup_button": true,
                  "popup_width": "1000",
                  "popup_height": "650"
               });
            }
         };
         currentContainer.appendChild(script);
      }
   }, [symbol, interval, containerId]);

   return <div ref={containerRef} id={containerId} className="w-full h-full" />;
};

const COUNTRIES = [
   { code: 'IN', name: 'India', flag: '🇮🇳' },
   { code: 'US', name: 'United States', flag: '🇺🇸' },
   { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
   { code: 'DE', name: 'Germany', flag: '🇩🇪' },
   { code: 'JP', name: 'Japan', flag: '🇯🇵' },
   { code: 'CN', name: 'China', flag: '🇨🇳' },
   { code: 'AU', name: 'Australia', flag: '🇦🇺' },
   { code: 'CA', name: 'Canada', flag: '🇨🇦' },
   { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
   { code: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
];

const CashFlowStockModal = ({ isOpen, onClose, onSelect }) => {
   const [searchTerm, setSearchTerm] = useState('');
   const [searchResults, setSearchResults] = useState([]);
   const [isSearching, setIsSearching] = useState(false);
   const [selectedCountry, setSelectedCountry] = useState('IN');
   const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
   const [selectedStock, setSelectedStock] = useState(PRESET_STOCKS[0]);
   const [activeTab, setActiveTab] = useState('Realtime chart');
   const [isStockSelectOpen, setIsStockSelectOpen] = useState(false);
   const [chartInterval, setChartInterval] = useState('D');
   const [fullScreenChart, setFullScreenChart] = useState(null);

   // Tab-specific data states
   const [tabData, setTabData] = useState({
      'Realtime chart': null,
      'News': null,
      'Historical chart': null,
      'Advisory': null,
      'Research and recommendation': null
   });
   const [isLoadingTab, setIsLoadingTab] = useState(false);
   const [tabError, setTabError] = useState(null);

   // Benjamin Graham analysis state
   const [grahamData, setGrahamData] = useState(null);
   const [isGrahamLoading, setIsGrahamLoading] = useState(false);
   const [showGrahamPanel, setShowGrahamPanel] = useState(false);

   const [socket, setSocket] = useState(null);

   useEffect(() => {
      if (isOpen && !socket) {
         const wsUrl = baseURL.replace('/api', '');
         const newSocket = io(wsUrl);
         setSocket(newSocket);
      }
      if (!isOpen && socket) {
         socket.disconnect();
         setSocket(null);
      }
   }, [isOpen]);

   // Clear data only when symbol changes to prevent jarring UI
   useEffect(() => {
      if (isOpen && selectedStock) {
         setTabData({
            'Realtime chart': null,
            'News': null,
            'Historical chart': null,
            'Advisory': null,
            'Research and recommendation': null
         });
         setActiveTab('Realtime chart');
         // Reset Graham panel when stock changes
         setGrahamData(null);
         setShowGrahamPanel(false);
      }
   }, [isOpen, selectedStock]);

   // Search debounce
   useEffect(() => {
      const delayDebounceFn = setTimeout(() => {
         if (searchTerm.length >= 2) {
            handleSearch();
         } else {
            setSearchResults([]);
         }
      }, 500);
      return () => clearTimeout(delayDebounceFn);
   }, [searchTerm]);

   const handleSearch = async () => {
      setIsSearching(true);
      try {
         const token = JSON.parse(localStorage.getItem('user') || '{}')?.token;
         const res = await axios.get(`${baseURL}/cashflow/search`, {
            params: { keywords: searchTerm },
            headers: { 'Authorization': `Bearer ${token}` }
         });
         if (Array.isArray(res.data)) {
            setSearchResults(res.data);
         }
      } catch (error) {
         console.error("Search Error:", error);
      } finally {
         setIsSearching(false);
      }
   };

   // Main data coordination
   useEffect(() => {
      if (!isOpen || !selectedStock) return;

      const token = JSON.parse(localStorage.getItem('user') || '{}')?.token;
      const headers = { 'Authorization': `Bearer ${token}` };
      const params = { symbol: selectedStock.symbol };

      if (activeTab === 'Realtime chart') {
         // HTTP for Intraday (Chart Area)
         axios.get(`${baseURL}/stock/intraday`, { params, headers })
            .then(res => setTabData(prev => ({ ...prev, 'Realtime chart': { quote: prev['Realtime chart']?.quote, intraday: res.data.intraday } })))
            .catch(() => { });

         if (socket) {
            setIsLoadingTab(!tabData['Realtime chart']?.quote); // Only load if absolutely no quote
            socket.emit('subscribe_realtime', { symbol: selectedStock.symbol });

            const handleRealtime = (data) => {
               setIsLoadingTab(false);
               setTabData(prev => ({
                  ...prev,
                  'Realtime chart': { quote: data.quote, intraday: prev['Realtime chart']?.intraday || [] }
               }));
            };
            socket.on('realtime_update', handleRealtime);

            return () => socket.off('realtime_update', handleRealtime);
         }
      } else if (activeTab === 'Historical chart') {
         if (socket) {
            if (!tabData['Historical chart']) setIsLoadingTab(true);
            socket.emit('request_historical', { symbol: selectedStock.symbol });

            const handleHistorical = (data) => {
               setIsLoadingTab(false);
               if (data.error) setTabError(data.error);
               else setTabData(prev => ({ ...prev, 'Historical chart': { historical: data.historical } }));
            };
            socket.on('historical_data_response', handleHistorical);

            return () => socket.off('historical_data_response', handleHistorical);
         }
      } else {
         // Other tabs via traditional HTTP
         if (tabData[activeTab]) return; // Already cached
         setIsLoadingTab(true);
         setTabError(null);

         let promise = null;
         if (activeTab === 'News') promise = axios.get(`${baseURL}/stock/news`, { params, headers }).then(r => ({ news: r.data.news }));
         else if (activeTab === 'Advisory') promise = axios.get(`${baseURL}/stock/advisory`, { params, headers }).then(r => ({ advisory: r.data.advisory }));
         else if (activeTab === 'Research and recommendation') promise = axios.get(`${baseURL}/stock/research`, { params: { symbol: selectedStock.symbol }, headers }).then(r => ({ research: r.data.research }));

         if (promise) {
            promise.then(result => {
               setTabData(prev => ({ ...prev, [activeTab]: result }));
            }).catch(err => {
               setTabError(`Failed to load ${activeTab}.`);
            }).finally(() => setIsLoadingTab(false));
         }
      }
   }, [activeTab, selectedStock, isOpen, socket]);

   const handleFinalSelect = () => {
      onSelect(selectedStock);
      onClose();
   };

   const fetchGrahamAnalysis = async () => {
      if (grahamData || isGrahamLoading) return;
      setIsGrahamLoading(true);
      setShowGrahamPanel(true);
      try {
         const token = JSON.parse(localStorage.getItem('user') || '{}')?.token;
         const price = tabData['Realtime chart']?.quote?.price || '';
         const res = await axios.get(`${baseURL}/stock/graham-analysis`, {
            params: { symbol: selectedStock.symbol, name: selectedStock.name, price },
            headers: { 'Authorization': `Bearer ${token}` }
         });
         setGrahamData(res.data.graham);
      } catch (err) {
         console.error('[Graham] Analysis failed:', err);
      } finally {
         setIsGrahamLoading(false);
      }
   };

   const getRelativeTime = (timeStr) => {
      if (!timeStr) return '';
      try {
         const pubDate = new Date(timeStr);
         const diffInMs = new Date() - pubDate;
         const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
         if (diffInHours < 1) return 'Just now';
         if (diffInHours < 24) return `${diffInHours}h ago`;
         return `${Math.floor(diffInHours / 24)}d ago`;
      } catch (e) { return ''; }
   };

   const currencySymbol = useMemo(() => {
      if (tabData['Realtime chart']?.quote?.currency === 'INR') return '₹';
      if (selectedStock?.region === 'IN' || selectedStock?.symbol.includes('.BSE') || selectedStock?.symbol.includes('.NSE') || selectedStock?.symbol.endsWith('.BO') || selectedStock?.symbol.endsWith('.NS')) {
         return '₹';
      }
      return '$';
   }, [selectedStock, tabData['Realtime chart']]);

   const realtimeLineData = useMemo(() => {
      const data = tabData['Realtime chart']?.intraday || [];
      return data.map(d => ({
         date: d.date.split(' ')[1] || d.date, // Time portion
         price: d.close
      }));
   }, [tabData['Realtime chart']]);

   const historicalLineData = useMemo(() => {
      const data = tabData['Historical chart']?.historical || [];
      return data.map(d => ({
         date: d.date.split('-').slice(1).join('/'),
         price: parseFloat(d.close)
      }));
   }, [tabData['Historical chart']]);

   if (!isOpen) return null;

   return (
      <AnimatePresence>
         <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.98 }}
               className="relative w-full w-[95vw] max-w-7xl bg-[#fdfaf5] rounded-[14px] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col h-[94vh] border border-white/10"
            >
               {/* Header */}
               <div className="px-6 py-5 bg-[#5154ff] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/5 shadow-inner">
                        <TrendingUp className="w-6 h-6 shadow-sm" />
                     </div>
                     <div>
                        <h2 className="text-2xl font-black text-white leading-tight font-sans tracking-tight">AI CashFlow Explorer</h2>
                        <p className="text-[10px] text-white/60 font-black uppercase tracking-[0.2em] mt-0.5">Market Intelligence · Real-time Analytics · Strategy</p>
                     </div>
                  </div>
                  <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-white/90 hover:text-white group">
                     <X className="w-8 h-8 group-hover:rotate-90 transition-transform" />
                  </button>
               </div>

               {/* Stock Selection Section */}
               <div className="px-8 py-8 border-b border-gray-100 flex gap-6 bg-[#fdfaf5] shrink-0">
                  <div className="flex-1 max-w-[320px] relative">
                     <label className="block text-[11px] font-black text-[#999] uppercase tracking-[0.1em] mb-2.5 ml-1">Country</label>
                     <div
                        onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                        className={`bg-white border ${isCountryDropdownOpen ? 'border-[#5154ff] ring-4 ring-[#5154ff]/10' : 'border-gray-200'
                           } rounded-[14px] px-5 py-4 text-[14px] font-bold flex items-center gap-3 shadow-sm cursor-pointer group transition-all min-h-[54px] select-none`}
                     >
                        <span className="text-[22px] leading-none">{COUNTRIES.find(c => c.code === selectedCountry)?.flag || '🌐'}</span>
                        <span className="text-[#888] font-extrabold text-[13px]">{selectedCountry}</span>
                        <span className="text-[#111] flex-1">{COUNTRIES.find(c => c.code === selectedCountry)?.name || 'Unknown'}</span>
                        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isCountryDropdownOpen ? 'rotate-180 text-[#5154ff]' : 'text-[#ccc] group-hover:text-[#5154ff]'
                           }`} />
                     </div>

                     <AnimatePresence>
                        {isCountryDropdownOpen && (
                           <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.98 }}
                              className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-black/5 rounded-[18px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] overflow-hidden z-[110]"
                           >
                              <div className="py-2 max-h-64 overflow-y-auto custom-scrollbar">
                                 {COUNTRIES.map(country => (
                                    <button
                                       key={country.code}
                                       onClick={() => {
                                          setSelectedCountry(country.code);
                                          setIsCountryDropdownOpen(false);
                                          // Auto-select first matching preset stock for chosen country
                                          const match = PRESET_STOCKS.find(s => s.region === country.code);
                                          if (match) {
                                             setSelectedStock(match);
                                             setSearchTerm('');
                                          }
                                       }}
                                       className="w-full text-left px-5 py-3 hover:bg-[#fdfaf5] transition-colors flex items-center gap-3 group border-b border-gray-50/50 last:border-0"
                                    >
                                       <span className="text-[20px] leading-none">{country.flag}</span>
                                       <span className="text-[12px] font-black text-[#888] w-8">{country.code}</span>
                                       <span className="text-[14px] font-bold text-[#111] group-hover:text-[#5154ff] flex-1">{country.name}</span>
                                       {selectedCountry === country.code && <Check className="w-4 h-4 text-[#5154ff]" />}
                                    </button>
                                 ))}
                              </div>
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </div>

                  <div className="flex-1 relative">
                     <label className="block text-[11px] font-black text-[#999] uppercase tracking-[0.1em] mb-2.5 ml-1">Stock</label>
                     <div
                        onClick={() => setIsStockSelectOpen(!isStockSelectOpen)}
                        className={`bg-white border ${isStockSelectOpen ? 'border-[#5154ff] ring-4 ring-[#5154ff]/10' : 'border-gray-200'} rounded-[14px] px-5 py-4 text-[14px] font-bold flex items-center justify-between shadow-sm cursor-pointer group transition-all min-h-[54px]`}
                     >
                        <span className="text-[#111] truncate">{selectedStock?.symbol} - {selectedStock?.name}</span>
                        <div className="flex items-center gap-3">
                           {isSearching && <Loader2 className="w-4 h-4 animate-spin text-[#5154ff]" />}
                           <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isStockSelectOpen ? 'rotate-180 text-[#5154ff]' : 'text-[#ccc] group-hover:text-[#5154ff]'}`} />
                        </div>
                     </div>

                     <AnimatePresence>
                        {isStockSelectOpen && (
                           <motion.div
                              initial={{ opacity: 0, y: 15, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 15, scale: 0.98 }}
                              className="absolute top-[calc(100%+12px)] left-0 right-0 bg-white border border-black/5 rounded-[18px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] overflow-hidden z-[100] max-h-80 overflow-y-auto"
                           >
                              <div className="p-4 border-b border-gray-50 flex items-center bg-[#fdfaf5]/50 sticky top-0 backdrop-blur-xl z-10">
                                 <Search className="w-5 h-5 text-[#aaa] ml-2" />
                                 <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search symbols..."
                                    className="w-full bg-transparent border-0 outline-none px-4 text-sm font-bold text-[#111]"
                                    autoFocus
                                 />
                              </div>
                              <div className="py-2">
                                 {(searchTerm.length >= 2 ? searchResults : PRESET_STOCKS).map((stock) => (
                                    <button
                                       key={stock.symbol}
                                       onClick={() => {
                                          setSelectedStock(stock);
                                          setIsStockSelectOpen(false);
                                          setSearchTerm('');
                                       }}
                                       className="w-full text-left px-6 py-4 hover:bg-[#fdfaf5] transition-colors border-b border-gray-50/50 last:border-0 flex items-center justify-between group"
                                    >
                                       <div>
                                          <div className="text-[14px] font-black text-[#111] group-hover:text-[#5154ff]">{stock.symbol}</div>
                                          <div className="text-[11px] text-[#888] font-bold uppercase tracking-wider">{stock.name}</div>
                                       </div>
                                       {selectedStock?.symbol === stock.symbol && <Check className="w-5 h-5 text-[#5154ff]" />}
                                    </button>
                                 ))}
                              </div>
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </div>
               </div>

               {/* Tab Navigation */}
               <div className="px-8 border-b border-gray-100 flex items-center gap-10 overflow-x-auto no-scrollbar bg-white shrink-0">
                  {['Realtime chart', 'News', 'Historical chart', 'Advisory', 'Research and recommendation'].map(tab => (
                     <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-5 text-[14px] font-black whitespace-nowrap transition-all border-b-2 tracking-wide uppercase ${activeTab === tab ? 'text-[#5154ff] border-[#5154ff]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                     >
                        {tab}
                     </button>
                  ))}
               </div>

               {/* Main Content Area */}
               <div className="flex-1 overflow-y-auto px-8 py-8 bg-white custom-scrollbar">
                  {isLoadingTab ? (
                     <div className="h-full flex flex-col items-center justify-center gap-6 text-[#999]">
                        <div className="relative">
                           <Loader2 className="w-16 h-16 animate-spin text-[#5154ff] opacity-20" />
                           <Activity className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#5154ff] animate-pulse" />
                        </div>
                        <p className="text-[12px] font-black uppercase tracking-[0.3em] animate-pulse">Syncing Network Data...</p>
                     </div>
                  ) : tabError ? (
                     <div className="h-full flex flex-col items-center justify-center gap-4 text-rose-500">
                        <AlertCircle className="w-12 h-12 opacity-80" />
                        <p className="text-[14px] font-black uppercase tracking-wider">{tabError}</p>
                        <p className="text-[12px] text-[#888] font-bold text-center max-w-sm mt-2">
                           If using AngelOne SmartAPI, ensure your API_KEY and AUTHORIZATION_TOKEN are correctly configured in your Backend .env file.
                        </p>
                     </div>
                  ) : !tabData[activeTab] ? (
                     <div className="h-full flex flex-col items-center justify-center gap-4 text-[#999]">
                        <Activity className="w-12 h-12 opacity-20" />
                        <p className="text-[14px] font-black uppercase tracking-wider">No Data Available</p>
                     </div>
                  ) : (
                     <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
                        {/* Realtime Chart Tab */}
                        {activeTab === 'Realtime chart' && tabData['Realtime chart'] && (
                           <div className="space-y-8">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                 <div className="bg-[#fcf8f0] rounded-[20px] p-6 border border-[#f0ebe0] shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                                    <p className="text-[11px] font-black text-[#aaa] uppercase tracking-widest mb-2 flex items-center gap-2">
                                       Live Price <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
                                    </p>
                                    <p className="text-4xl font-black text-[#111] tracking-tight">
                                       {tabData['Realtime chart'].quote?.price ? `${currencySymbol}${parseFloat(tabData['Realtime chart'].quote.price).toLocaleString()}` : currencySymbol + '---'}
                                    </p>
                                    <div className={`flex items-center gap-1.5 mt-3 text-[13px] font-bold ${parseFloat(tabData['Realtime chart'].quote?.change) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                       <TrendingUp className={`w-4 h-4 ${parseFloat(tabData['Realtime chart'].quote?.change) < 0 ? 'rotate-180' : ''}`} />
                                       {tabData['Realtime chart'].quote?.changePercent || '0.00%'}
                                    </div>
                                 </div>
                                 <div className="bg-[#fcf8f0] rounded-[20px] p-6 border border-[#f0ebe0] shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                                    <p className="text-[11px] font-black text-[#aaa] uppercase tracking-widest mb-2">Day high</p>
                                    <p className="text-4xl font-black text-[#111] tracking-tight">
                                       {tabData['Realtime chart'].quote?.high ? `${currencySymbol}${parseFloat(tabData['Realtime chart'].quote.high).toLocaleString()}` : currencySymbol + '---'}
                                    </p>
                                    <div className="mt-3 w-full bg-black/5 h-1 rounded-full overflow-hidden">
                                       <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-[#5154ff]" />
                                    </div>
                                 </div>
                                 <div className="bg-[#fcf8f0] rounded-[20px] p-6 border border-[#f0ebe0] shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                                    <p className="text-[11px] font-black text-[#aaa] uppercase tracking-widest mb-2">Volume (24h)</p>
                                    <p className="text-4xl font-black text-[#111] tracking-tight">
                                       {tabData['Realtime chart'].quote?.volume ? (parseFloat(tabData['Realtime chart'].quote.volume) / 1000).toFixed(1) + 'k' : '---'}
                                    </p>
                                    <div className="mt-4 flex items-center gap-2 text-[11px] font-black text-[#5154ff] uppercase tracking-wider">
                                       AngelOne Live Data <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                                    </div>
                                 </div>
                              </div>

                              <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm min-h-[700px]">
                                 <div className="flex items-center justify-between mb-8">
                                    <div>
                                       <h3 className="text-lg font-black text-[#111] flex items-center gap-2.5">
                                          Advanced Market Dynamics <Sparkles className="w-5 h-5 text-[#5154ff]" />
                                       </h3>
                                       <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-[0.15em] mt-1 mb-3">Professional Dynamic Chart</p>
                                       <div className="flex bg-gray-100/80 p-1 rounded-xl gap-1 w-fit border border-black/5">
                                          {[{ label: '15m', val: '15' }, { label: '1H', val: '60' }, { label: '1D', val: 'D' }, { label: '1W', val: 'W' }, { label: '1M', val: 'M' }].map(intv => (
                                             <button
                                                key={intv.val}
                                                onClick={() => setChartInterval(intv.val)}
                                                className={`px-3 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all 
                                               ${chartInterval === intv.val ? 'bg-white text-[#5154ff] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] border border-black/5' : 'text-[#888] hover:text-[#555] hover:bg-black/5 border border-transparent'}`}
                                             >
                                                {intv.label}
                                             </button>
                                          ))}
                                       </div>
                                    </div>
                                    {tabData['Realtime chart'].quote?.price && (
                                       <div className="flex items-center gap-3">
                                          <button onClick={() => setFullScreenChart('realtime')} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-black uppercase tracking-wider rounded-lg transition-colors mr-4 border border-gray-200 shadow-sm">
                                             <Maximize className="w-3.5 h-3.5" /> Pro View
                                          </button>
                                          <div className="flex flex-col items-center justify-center px-5 py-1.5 bg-[#fffafb] border border-[#f23645] rounded-[6px] min-w-[100px] shadow-sm cursor-pointer hover:bg-red-50 transition-colors">
                                             <span className="text-[18px] font-semibold text-[#f23645] leading-tight">
                                                {parseFloat(tabData['Realtime chart'].quote.price - 0.25).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                             </span>
                                             <span className="text-[12px] font-medium text-[#f23645] uppercase tracking-wide">SELL</span>
                                          </div>
                                          <span className="text-[13px] font-medium text-[#333]">0.50</span>
                                          <div className="flex flex-col items-center justify-center px-5 py-1.5 bg-[#f8fbff] border border-[#2962ff] rounded-[6px] min-w-[100px] shadow-sm cursor-pointer hover:bg-blue-50 transition-colors">
                                             <span className="text-[18px] font-semibold text-[#2962ff] leading-tight">
                                                {parseFloat(tabData['Realtime chart'].quote.price + 0.25).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                             </span>
                                             <span className="text-[12px] font-medium text-[#2962ff] uppercase tracking-wide">BUY</span>
                                          </div>
                                       </div>
                                    )}
                                 </div>
                                 <div className="h-[550px] w-full pt-4 relative rounded-xl overflow-hidden shadow-inner border border-black/5">
                                    <TradingViewWidget symbol={selectedStock?.symbol} interval={chartInterval} containerId="tv_chart_realtime" />
                                 </div>
                              </div>
                           </div>
                        )}

                        {/* News Tab */}
                        {activeTab === 'News' && tabData['News'] && (
                           <div className="space-y-6">
                              {tabData['News'].news?.length === 0 ? (
                                 <div className="p-12 text-center text-[#aaa] font-bold uppercase tracking-widest bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    No news detected
                                 </div>
                              ) : (
                                 tabData['News'].news?.map((item, idx) => (
                                    <motion.div
                                       initial={{ opacity: 0, x: -10 }}
                                       animate={{ opacity: 1, x: 0 }}
                                       transition={{ delay: idx * 0.1 }}
                                       key={idx}
                                       className="bg-[#fcf8f0] rounded-[20px] p-6 border border-[#f0ebe0] group hover:border-[#5154ff]/30 transition-all cursor-pointer shadow-sm"
                                    >
                                       <div className="flex items-center gap-3 mb-3">
                                          <span className="text-[10px] font-black text-[#5154ff] bg-white border border-[#5154ff]/10 px-2.5 py-1 rounded-lg uppercase tracking-wider">{item.source || 'Finance'}</span>
                                          <span className="text-[10px] font-bold text-[#888] uppercase tracking-wider">{getRelativeTime(item.time_published)}</span>
                                       </div>
                                       <h4 className="text-[17px] font-black text-[#111] mb-3 group-hover:text-[#5154ff] transition-colors">{item.title}</h4>
                                       <p className="text-[13px] text-[#777] mb-4 line-clamp-2 leading-relaxed">{item.summary}</p>
                                       <div className="flex items-center justify-between">
                                          <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.05em] ${(item.overall_sentiment_label || 'Neutral').includes('Bullish') ? 'bg-emerald-50 text-emerald-600' : (item.overall_sentiment_label || 'Neutral').includes('Bearish') ? 'bg-rose-50 text-rose-600' : 'bg-white border border-gray-200 text-[#999]'}`}>
                                             Sentiment: {item.overall_sentiment_label || 'Neutral'}
                                          </span>
                                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white rounded-xl text-[#5154ff] hover:bg-[#5154ff] hover:text-white transition-all shadow-sm">
                                             <ExternalLink className="w-4 h-4" />
                                          </a>
                                       </div>
                                    </motion.div>
                                 ))
                              )}
                           </div>
                        )}

                        {/* Historical Chart Tab */}
                        {activeTab === 'Historical chart' && tabData['Historical chart'] && (
                           <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm min-h-[700px]">
                              <div className="flex items-center justify-between mb-8">
                                 <div>
                                    <h3 className="text-xl font-black text-[#111] flex items-center gap-3">
                                       Advanced Historical Chart <BarChart3 className="w-6 h-6 text-[#5154ff]" />
                                    </h3>
                                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1.5">Interactive TradingView Historical Record</p>
                                 </div>
                                 <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-4 text-[10px] font-black text-[#5154ff] uppercase tracking-widest bg-[#5154ff]/10 px-4 py-2 rounded-lg">
                                       <Activity className="w-3 h-3 animate-pulse" /> TradingView Visualizer
                                    </div>
                                    <button onClick={() => setFullScreenChart('historical')} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-black uppercase tracking-wider rounded-lg transition-colors border border-gray-200 shadow-sm">
                                       <Maximize className="w-3.5 h-3.5" /> Pro View
                                    </button>
                                 </div>
                              </div>
                              <div className="h-[550px] w-full pt-4 relative rounded-xl overflow-hidden shadow-inner border border-black/5">
                                 <TradingViewWidget symbol={selectedStock?.symbol} interval="D" containerId="tv_chart_historical" />
                              </div>
                           </div>
                        )}

                        {/* Advisory Tab */}
                        {activeTab === 'Advisory' && tabData['Advisory'] && (
                           <div className="h-full flex items-center justify-center py-2 overflow-hidden">
                              <motion.div
                                 initial={{ opacity: 0, scale: 0.96 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 className={`w-full max-w-3xl border border-black/5 rounded-[28px] p-6 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center gap-6
                                     ${tabData['Advisory'].advisory.verdict === 'BUY' ? 'bg-gradient-to-br from-emerald-50/70 to-teal-50/70' :
                                       tabData['Advisory'].advisory.verdict === 'SELL' ? 'bg-gradient-to-br from-rose-50/70 to-orange-50/70' :
                                          'bg-gradient-to-br from-[#fcf8f0] to-[#f5f0e1]'}
                                 `}
                              >
                                 {/* Left: Verdict Card */}
                                 <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2">
                                    <div className={`p-4 rounded-full bg-white/60 shadow-sm 
                                        ${tabData['Advisory'].advisory.verdict === 'BUY' ? 'text-emerald-500' :
                                          tabData['Advisory'].advisory.verdict === 'SELL' ? 'text-rose-500' :
                                             'text-yellow-500'}
                                    `}>
                                       <Zap fill="currentColor" className="w-12 h-12" />
                                    </div>
                                    <div>
                                       <h3 className="text-[12px] font-black text-[#888] uppercase tracking-[0.3em] mb-0.5">System Signal</h3>
                                       <p className={`text-6xl font-black uppercase tracking-tighter
                                             ${tabData['Advisory'].advisory.verdict === 'BUY' ? 'text-emerald-600' :
                                             tabData['Advisory'].advisory.verdict === 'SELL' ? 'text-rose-600' :
                                                'text-yellow-600'}
                                       `}>
                                          {tabData['Advisory'].advisory.verdict}
                                       </p>
                                    </div>
                                 </div>

                                 {/* Right: Indicators Grid */}
                                 <div className="w-full md:w-[320px] grid grid-cols-2 gap-3">
                                    <div className="bg-white/80 p-3.5 rounded-[20px] border border-white shadow-sm hover:shadow-md transition-shadow">
                                       <p className="text-[10px] font-black uppercase tracking-widest text-[#aaa] mb-0.5">RSI</p>
                                       <p className="text-xl font-black text-[#111]">{tabData['Advisory'].advisory.indicators?.RSI}</p>
                                    </div>
                                    <div className="bg-white/80 p-3.5 rounded-[20px] border border-white shadow-sm hover:shadow-md transition-shadow">
                                       <p className="text-[10px] font-black uppercase tracking-widest text-[#aaa] mb-0.5">MACD</p>
                                       <p className="text-xl font-black text-[#111]">{tabData['Advisory'].advisory.indicators?.MACD}</p>
                                    </div>
                                    <div className="bg-white/80 p-3.5 rounded-[20px] border border-white shadow-sm hover:shadow-md transition-shadow">
                                       <p className="text-[10px] font-black uppercase tracking-widest text-[#aaa] mb-0.5">Ichimoku</p>
                                       <p className={`text-sm font-black ${tabData['Advisory'].advisory.indicators?.Ichimoku === 'Bullish' ? 'text-emerald-600' : tabData['Advisory'].advisory.indicators?.Ichimoku === 'Bearish' ? 'text-rose-600' : 'text-[#111]'}`}>
                                          {tabData['Advisory'].advisory.indicators?.Ichimoku || 'Neutral'}
                                       </p>
                                    </div>
                                    <div className="bg-white/80 p-3.5 rounded-[20px] border border-white shadow-sm hover:shadow-md transition-shadow">
                                       <p className="text-[10px] font-black uppercase tracking-widest text-[#aaa] mb-0.5">SMA20</p>
                                       <p className="text-xl font-black text-[#111]">{tabData['Advisory'].advisory.indicators?.SMA}</p>
                                    </div>
                                    <div className="col-span-2 bg-white/80 p-3 rounded-[20px] border border-white shadow-sm flex justify-between items-center px-6">
                                       <p className="text-[10px] font-black uppercase tracking-widest text-[#aaa]">Fibonacci Level</p>
                                       <p className="text-xl font-black text-[#5154ff]">₹{tabData['Advisory'].advisory.indicators?.Fibonacci || '---'}</p>
                                    </div>
                                 </div>
                              </motion.div>
                           </div>
                        )}

                        {/* Research Tab — Button always visible when tab is active */}
                        {activeTab === 'Research and recommendation' && selectedStock && (
                           <div className="space-y-6">

                              {/* ── Benjamin Graham Button — TOP, always visible ── */}
                              <motion.div
                                 initial={{ opacity: 0, y: 10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 transition={{ delay: 0.1 }}
                              >
                                 <button
                                    id="graham-analysis-btn"
                                    onClick={() => showGrahamPanel ? setShowGrahamPanel(false) : fetchGrahamAnalysis()}
                                    className={`group relative w-full flex items-center justify-between px-8 py-5 rounded-[20px] border-2 transition-all duration-300 overflow-hidden
                                       ${showGrahamPanel
                                          ? 'bg-amber-950 border-amber-800'
                                          : 'bg-gradient-to-r from-amber-950 to-stone-900 border-amber-800/60 hover:border-amber-600 hover:shadow-xl hover:shadow-amber-900/30'
                                       }`}
                                 >
                                    <div className="flex items-center gap-4">
                                       <div className="w-12 h-12 rounded-xl bg-amber-700/40 border border-amber-600/30 flex items-center justify-center shadow-inner">
                                          <BookOpen className="w-6 h-6 text-amber-300" />
                                       </div>
                                       <div className="text-left">
                                          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-amber-400/70 mb-0.5">Value Investing Analysis</p>
                                          <p className="text-lg font-black text-amber-100">Benjamin Graham <span className="text-amber-400">Perspective</span></p>
                                          <p className="text-[11px] text-amber-300/60 font-semibold mt-0.5">Based on &quot;The Intelligent Investor&quot;</p>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                       {isGrahamLoading
                                          ? <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
                                          : <ChevronRight className={`w-5 h-5 text-amber-400 transition-transform duration-300 group-hover:translate-x-1 ${showGrahamPanel ? 'rotate-90' : ''}`} />
                                       }
                                    </div>
                                 </button>

                                 {/* Graham Analysis Panel */}
                                 <AnimatePresence>
                                    {showGrahamPanel && (
                                       <motion.div
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{ opacity: 1, height: 'auto' }}
                                          exit={{ opacity: 0, height: 0 }}
                                          transition={{ duration: 0.4 }}
                                          className="overflow-hidden"
                                       >
                                          {isGrahamLoading ? (
                                             <div className="mt-4 flex flex-col items-center justify-center gap-4 py-16 bg-amber-950/30 rounded-[20px] border border-amber-900/40">
                                                <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
                                                <p className="text-sm font-black text-amber-400 uppercase tracking-widest animate-pulse">Consulting The Intelligent Investor...</p>
                                             </div>
                                          ) : grahamData ? (
                                             <div className="mt-4 bg-gradient-to-br from-amber-950/20 to-stone-900/10 border border-amber-900/30 rounded-[24px] p-8 space-y-6">
                                                {/* Header */}
                                                <div className="flex items-center justify-between pb-5 border-b border-amber-900/30">
                                                   <div className="flex items-center gap-3">
                                                      <div className="w-10 h-10 rounded-xl bg-amber-700/30 flex items-center justify-center">
                                                         <Award className="w-5 h-5 text-amber-400" />
                                                      </div>
                                                      <div>
                                                         <h3 className="text-lg font-black text-stone-800">Graham&apos;s Verdict</h3>
                                                         <p className="text-[11px] text-stone-500 font-bold uppercase tracking-wider">{grahamData.source}</p>
                                                      </div>
                                                   </div>
                                                   <div className={`px-5 py-2 rounded-xl text-sm font-black uppercase tracking-widest
                                                      ${grahamData.graham_verdict === 'BUY' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                                         grahamData.graham_verdict === 'AVOID' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                                                            'bg-amber-100 text-amber-700 border border-amber-200'}
                                                   `}>
                                                      {grahamData.graham_verdict === 'AVOID' ? '⛔ AVOID' : grahamData.graham_verdict === 'BUY' ? '✅ BUY' : '⏸ HOLD'}
                                                   </div>
                                                </div>

                                                {/* Quote */}
                                                <blockquote className="relative pl-6 border-l-4 border-amber-400 italic text-stone-700 text-[15px] font-semibold leading-relaxed">
                                                   <span className="absolute -left-3 -top-2 text-5xl text-amber-300/50 font-serif leading-none">&ldquo;</span>
                                                   {grahamData.graham_quote}
                                                </blockquote>

                                                {/* Key Principle */}
                                                <div className="bg-amber-50 border border-amber-200 rounded-[16px] p-4 flex items-center gap-3">
                                                   <Shield className="w-5 h-5 text-amber-600 shrink-0" />
                                                   <div>
                                                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-0.5">Key Principle Applied</p>
                                                      <p className="text-sm font-bold text-amber-900">{grahamData.key_principle_applied}</p>
                                                   </div>
                                                </div>

                                                {/* Analysis Grid */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                   {[
                                                      { label: 'Margin of Safety', value: grahamData.margin_of_safety, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                                                      { label: 'Intrinsic Value', value: grahamData.intrinsic_value_note, color: 'text-blue-600 bg-blue-50 border-blue-100' },
                                                      { label: 'For Defensive Investor', value: grahamData.defensive_investor, color: 'text-violet-600 bg-violet-50 border-violet-100' },
                                                      { label: 'For Enterprising Investor', value: grahamData.enterprising_investor, color: 'text-rose-600 bg-rose-50 border-rose-100' },
                                                   ].map((item, i) => (
                                                      <div key={i} className={`rounded-[16px] border p-5 ${item.color.split(' ').slice(1).join(' ')}`}>
                                                         <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${item.color.split(' ')[0]}`}>{item.label}</p>
                                                         <p className="text-sm font-semibold text-stone-700 leading-relaxed">{item.value}</p>
                                                      </div>
                                                   ))}
                                                </div>

                                                {/* Graham Number */}
                                                <div className="bg-stone-100 border border-stone-200 rounded-[16px] p-5">
                                                   <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Graham Number &amp; Valuation</p>
                                                   <p className="text-sm font-semibold text-stone-700 leading-relaxed">{grahamData.graham_number_note}</p>
                                                </div>

                                                {/* Final Advice */}
                                                <div className="bg-gradient-to-r from-amber-900/10 to-stone-800/5 border border-amber-800/20 rounded-[20px] p-6">
                                                   <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-3">Graham&apos;s Final Advice</p>
                                                   <p className="text-[15px] font-semibold text-stone-800 leading-relaxed">{grahamData.final_advice}</p>
                                                </div>

                                                {/* Footer */}
                                                <div className="flex items-center gap-2 text-[11px] text-stone-400 font-bold pt-2 border-t border-stone-200">
                                                   <BookOpen className="w-4 h-4" />
                                                   Source: {grahamData.source} &middot; {grahamData.rag_used ? '📚 Knowledge Base Retrieved' : '🤖 AI Generated'}
                                                </div>
                                             </div>
                                          ) : null}
                                       </motion.div>
                                    )}
                                 </AnimatePresence>
                              </motion.div>

                              {/* Analyst Estimates Block */}
                              {tabData['Research and recommendation']?.research?.analyst_estimates && (
                                 <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white border-2 border-[#5154ff]/5 rounded-[32px] p-8 shadow-sm"
                                 >
                                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                       <h3 className="text-xl font-black text-[#111] flex items-center gap-3">
                                          Analyst Estimates & Target Price
                                       </h3>
                                       <div className="flex items-center gap-2 px-3 py-1 bg-black/5 rounded-lg text-[10px] font-bold text-[#555] uppercase tracking-wider">
                                          <Activity className="w-3 h-3" /> Live Analysis <span className="bg-[#5154ff] text-white px-1.5 py-0.5 rounded-[4px] ml-1">+4</span>
                                       </div>
                                    </div>
                                    <ul className="space-y-4">
                                       {[
                                          { label: 'Average Target Price', value: tabData['Research and recommendation'].research.analyst_estimates.average_target_price },
                                          { label: 'High Estimate', value: tabData['Research and recommendation'].research.analyst_estimates.high_estimate },
                                          { label: 'Low Estimate', value: tabData['Research and recommendation'].research.analyst_estimates.low_estimate },
                                          { label: 'Analyst Sentiment', value: tabData['Research and recommendation'].research.analyst_estimates.analyst_sentiment },
                                          { label: 'Context', value: tabData['Research and recommendation'].research.analyst_estimates.context }
                                       ].map((item, idx) => (
                                          <li key={idx} className="text-[15px] sm:text-[16px] text-[#333] leading-relaxed relative pl-6 before:content-[''] before:absolute before:left-0 before:top-[10px] before:w-1.5 before:h-1.5 before:bg-[#111] before:rounded-full">
                                             <span className="font-bold text-[#111]">{item.label}:</span> {item.value}
                                          </li>
                                       ))}
                                    </ul>
                                 </motion.div>
                              )}

                              {/* Advisory Report — shows if Advisory tab was visited */}
                              {tabData['Advisory']?.advisory?.report && (
                                 <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white border-2 border-[#5154ff]/5 rounded-[32px] p-8 shadow-sm"
                                 >
                                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                                       <div>
                                          <h3 className="text-2xl font-black text-[#111] flex items-center gap-3">
                                             Detailed Stock Analysis <Activity className="w-6 h-6 text-[#5154ff]" />
                                          </h3>
                                          <p className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">AI-Powered Research &amp; Recommendation for {selectedStock?.name}</p>
                                       </div>
                                       <div className={`px-5 py-2 rounded-xl text-sm font-black uppercase tracking-widest
                                           ${tabData['Advisory'].advisory.verdict === 'BUY' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}
                                       `}>
                                          Signal: {tabData['Advisory'].advisory.verdict}
                                       </div>
                                    </div>
                                    <div className="prose prose-slate max-w-none">
                                       <ReactMarkdown components={{
                                          p: ({ node, ...props }) => <p className="text-[16px] text-[#333] font-semibold mb-4 leading-relaxed" {...props} />,
                                          li: ({ node, ...props }) => <li className="text-[16px] font-bold text-[#111] mb-3 list-none pl-8 relative before:content-[''] before:absolute before:left-0 before:top-[12px] before:w-2.5 before:h-2.5 before:bg-[#5154ff] before:rounded-full before:opacity-20" {...props} />
                                       }}>
                                          {tabData['Advisory'].advisory.report}
                                       </ReactMarkdown>
                                    </div>
                                 </motion.div>
                              )}

                           </div>
                        )}
                     </div>
                  )}
               </div>


            </motion.div>

            <AnimatePresence>
               {fullScreenChart && (
                  <motion.div
                     initial={{ opacity: 0, y: 50, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: 20, scale: 0.95 }}
                     transition={{ type: "spring", stiffness: 300, damping: 25 }}
                     className="fixed inset-0 z-[2000] bg-[#fdfaf5] flex flex-col"
                  >
                     <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shadow-sm shrink-0">
                        <h2 className="text-xl font-black text-[#111] flex items-center gap-3">
                           <Activity className="w-5 h-5 text-[#5154ff] animate-pulse" />
                           {selectedStock?.symbol} - {selectedStock?.name}
                           <span className="text-[12px] text-[#5154ff] font-black uppercase tracking-widest bg-[#5154ff]/10 px-3 py-1.5 rounded-lg border border-[#5154ff]/20 ml-4 shadow-inner">
                              {fullScreenChart === 'realtime' ? 'Realtime Pro View' : 'Historical Pro View'}
                           </span>
                        </h2>
                        <button onClick={() => setFullScreenChart(null)} className="p-2.5 bg-gray-100 rounded-full hover:bg-rose-500 hover:text-white text-gray-500 transition-all shadow-sm active:scale-95">
                           <X className="w-6 h-6" />
                        </button>
                     </div>
                     <div className="flex-1 bg-white relative p-6">
                        <div className="w-full h-full rounded-2xl overflow-hidden shadow-inner border border-black/5 relative">
                           <TradingViewWidget
                              symbol={selectedStock?.symbol}
                              interval={fullScreenChart === 'realtime' ? chartInterval : 'D'}
                              containerId={`tv_chart_fullscreen_${fullScreenChart}`}
                           />
                        </div>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>

         </div>
      </AnimatePresence>
   );
};

export default CashFlowStockModal;
