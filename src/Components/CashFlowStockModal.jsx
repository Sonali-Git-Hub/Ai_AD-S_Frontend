import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, TrendingUp, BarChart3, Globe, Zap, Loader2, Check, ExternalLink, ChevronDown, Activity, Sparkles, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const baseURL = window._env_?.VITE_AISA_BACKEND_API || import.meta.env.VITE_AISA_BACKEND_API || "http://localhost:8080/api";

const PRESET_STOCKS = [
  { symbol: 'TCS.BSE', name: 'Tata Consultancy', region: 'IN' },
  { symbol: 'RELIANCE.BSE', name: 'Reliance Ind.', region: 'IN' },
  { symbol: 'HDFCBANK.BSE', name: 'HDFC Bank', region: 'IN' },
  { symbol: 'INFY.BSE', name: 'Infosys Ltd', region: 'IN' },
  { symbol: 'AAPL', name: 'Apple Inc.', region: 'US' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', region: 'US' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', region: 'US' }
];

const CashFlowStockModal = ({ isOpen, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStock, setSelectedStock] = useState(PRESET_STOCKS[0]);
  const [activeTab, setActiveTab] = useState('Realtime chart');
  const [isStockSelectOpen, setIsStockSelectOpen] = useState(false);
  
  // Tab-specific data states
  const [tabData, setTabData] = useState({
      'Realtime chart': null,
      'News': null,
      'Historical chart': null,
      'Advisory': null,
      'Research and recommendation': null
  });
  const [isLoadingTab, setIsLoadingTab] = useState(false);

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
        fetchTabData('Realtime chart', selectedStock);
        setActiveTab('Realtime chart');
    }
  }, [isOpen, selectedStock]);

  useEffect(() => {
      if (isOpen && selectedStock) {
        fetchTabData(activeTab, selectedStock);
      }
  }, [activeTab]);

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
      // Search still uses cashflow route
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

  const fetchTabData = async (tabName, stock) => {
      if (tabData[tabName]) return; // Already cached for this stock
      setIsLoadingTab(true);
      try {
          const token = JSON.parse(localStorage.getItem('user') || '{}')?.token;
          const headers = { 'Authorization': `Bearer ${token}` };
          const params = { symbol: stock.symbol };

          let result = {};
          if (tabName === 'Realtime chart') {
              const [quoteRes, intraRes] = await Promise.all([
                  axios.get(`${baseURL}/stock/quote`, { params, headers }),
                  axios.get(`${baseURL}/stock/intraday`, { params, headers }).catch(() => ({ data: { intraday: [] } }))
              ]);
              result = { quote: quoteRes.data.quote, intraday: intraRes.data.intraday };
          } else if (tabName === 'News') {
              const res = await axios.get(`${baseURL}/stock/news`, { params, headers });
              result = { news: res.data.news };
          } else if (tabName === 'Historical chart') {
              const res = await axios.get(`${baseURL}/stock/historical`, { params, headers });
              result = { historical: res.data.historical };
          } else if (tabName === 'Advisory') {
              const res = await axios.get(`${baseURL}/stock/advisory`, { params, headers });
              result = { advisory: res.data.advisory };
          } else if (tabName === 'Research and recommendation') {
              const res = await axios.get(`${baseURL}/stock/research`, { headers });
              result = { research: res.data.research };
          }

          setTabData(prev => ({ ...prev, [tabName]: result }));
      } catch (err) {
          console.error(`Error fetching ${tabName}:`, err);
      } finally {
          setIsLoadingTab(false);
      }
  };

  const handleFinalSelect = () => {
    onSelect(selectedStock);
    onClose();
  };

  const getRelativeTime = (timeStr) => {
     if (!timeStr) return '';
     try {
        const pubDate = new Date(timeStr);
        const diffInMs = new Date() - pubDate;
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        return `${Math.floor(diffInHours/24)}d ago`;
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
          className="relative w-full max-w-5xl bg-[#fdfaf5] rounded-[14px] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col h-[85vh] border border-white/10"
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
              <div className="flex-1 max-w-[320px]">
                 <label className="block text-[11px] font-black text-[#999] uppercase tracking-[0.1em] mb-2.5 ml-1">Country</label>
                 <div className="bg-white border border-gray-200 rounded-[14px] px-5 py-4 text-[14px] font-bold flex items-center gap-3 shadow-sm cursor-not-allowed transition-all opacity-80 select-none">
                    <span className="text-[#888] font-extrabold">{selectedStock?.region === 'IN' ? 'IN' : 'US'}</span>
                    <span className="text-[#111]">{selectedStock?.region === 'IN' ? 'India' : 'United States'}</span>
                    <Globe className="w-5 h-5 text-[#ccc] ml-auto" />
                 </div>
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
                                   AlphaVantage Data <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                                </div>
                             </div>
                          </div>

                          <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm min-h-[320px]">
                             <div className="flex items-center justify-between mb-8">
                                <div>
                                   <h3 className="text-lg font-black text-[#111] flex items-center gap-2.5">
                                      Intraday Dynamics <Sparkles className="w-5 h-5 text-[#5154ff]" />
                                   </h3>
                                   <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-[0.15em] mt-1">Short-Term Market Movement</p>
                                </div>
                             </div>
                             <div className="h-[240px] w-full pt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                   <AreaChart data={realtimeLineData}>
                                      <defs>
                                         <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#5154ff" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#5154ff" stopOpacity={0}/>
                                         </linearGradient>
                                      </defs>
                                      <Tooltip 
                                         contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px', padding: '10px 14px' }}
                                         labelStyle={{ color: '#666', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '4px' }}
                                         itemStyle={{ color: '#fff', fontSize: '14px', fontWeight: '900' }}
                                         formatter={(value) => [`${currencySymbol}${value}`, 'Price']}
                                      />
                                      <Area 
                                         type="monotone" 
                                         dataKey="price" 
                                         stroke="#5154ff" 
                                         strokeWidth={4}
                                         fillOpacity={1} 
                                         fill="url(#colorPrice)" 
                                         animationDuration={1500}
                                      />
                                   </AreaChart>
                                </ResponsiveContainer>
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
                       <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm min-h-[400px]">
                          <div className="flex items-center justify-between mb-8">
                             <div>
                                <h3 className="text-xl font-black text-[#111] flex items-center gap-3">
                                   Daily Historical Array <BarChart3 className="w-6 h-6 text-[#5154ff]" />
                                </h3>
                                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1.5">30-Day Retrospective Record</p>
                             </div>
                             <div className="flex items-center gap-4 text-[10px] font-black text-[#5154ff] uppercase tracking-widest">
                                <Activity className="w-3 h-3 animate-pulse" /> AV Time Series
                             </div>
                          </div>
                          <div className="h-[300px] w-full">
                             <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={historicalLineData}>
                                   <XAxis dataKey="date" hide />
                                   <YAxis domain={['auto', 'auto']} hide />
                                   <Tooltip 
                                      contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px', color: '#fff' }}
                                      labelStyle={{ fontWeight: '900', color: '#666', marginBottom: '8px' }}
                                      formatter={(val) => [`${currencySymbol}${val}`, 'Close Price']}
                                   />
                                   <Area 
                                      type="monotone" 
                                      dataKey="price" 
                                      stroke="#5154ff" 
                                      strokeWidth={6}
                                      fillOpacity={0.06} 
                                      fill="#5154ff" 
                                      animationDuration={1500}
                                   />
                                </AreaChart>
                             </ResponsiveContainer>
                          </div>
                       </div>
                    )}

                    {/* Advisory Tab */}
                    {activeTab === 'Advisory' && tabData['Advisory'] && (
                       <div className="space-y-6">
                            <motion.div 
                               initial={{ opacity: 0, scale: 0.95 }}
                               animate={{ opacity: 1, scale: 1 }}
                               className={`border-2 border-dashed rounded-[24px] p-10 text-center shadow-sm relative overflow-hidden
                                   ${tabData['Advisory'].advisory.verdict === 'BUY' ? 'bg-emerald-50 border-emerald-200' :
                                     tabData['Advisory'].advisory.verdict === 'SELL' ? 'bg-rose-50 border-rose-200' :
                                     'bg-[#fcf8f0] border-yellow-200'}
                               `}
                            >
                               <div className="mb-4">
                                   <Zap fill="currentColor" className={`w-12 h-12 mx-auto 
                                       ${tabData['Advisory'].advisory.verdict === 'BUY' ? 'text-emerald-500' :
                                         tabData['Advisory'].advisory.verdict === 'SELL' ? 'text-rose-500' :
                                         'text-yellow-500'}
                                   `} />
                               </div>
                               <h3 className="text-xl font-black text-[#111] uppercase tracking-[0.2em] mb-2 opacity-60">System Verdict</h3>
                               <p className={`text-6xl font-black uppercase tracking-tight
                                     ${tabData['Advisory'].advisory.verdict === 'BUY' ? 'text-emerald-600' :
                                     tabData['Advisory'].advisory.verdict === 'SELL' ? 'text-rose-600' :
                                     'text-yellow-600'}
                               `}>
                                   {tabData['Advisory'].advisory.verdict}
                               </p>
                               
                               <div className="mt-8 flex justify-center gap-6">
                                   <div className="bg-white/60 px-5 py-3 rounded-xl border border-black/5 shadow-sm">
                                      <p className="text-[10px] font-black uppercase tracking-widest text-[#888]">RSI</p>
                                      <p className="text-xl font-bold text-[#111]">{tabData['Advisory'].advisory.indicators?.RSI}</p>
                                   </div>
                                   <div className="bg-white/60 px-5 py-3 rounded-xl border border-black/5 shadow-sm">
                                      <p className="text-[10px] font-black uppercase tracking-widest text-[#888]">MACD</p>
                                      <p className="text-xl font-bold text-[#111]">{tabData['Advisory'].advisory.indicators?.MACD}</p>
                                   </div>
                                   <div className="bg-white/60 px-5 py-3 rounded-xl border border-black/5 shadow-sm">
                                      <p className="text-[10px] font-black uppercase tracking-widest text-[#888]">SMA20</p>
                                      <p className="text-xl font-bold text-[#111]">{tabData['Advisory'].advisory.indicators?.SMA}</p>
                                   </div>
                               </div>

                               <div className="mt-8 text-left bg-white/40 p-6 rounded-2xl border border-white/50 prose prose-sm max-w-none prose-slate">
                                   <ReactMarkdown components={{
                                        p: ({node, ...props}) => <p className="text-[14px] text-[#444] font-semibold mb-2 leading-relaxed" {...props} />,
                                        li: ({node, ...props}) => <li className="text-[14px] font-bold text-[#444] mb-2 list-none pl-6 relative before:content-[''] before:absolute before:left-0 before:top-[9px] before:w-2 before:h-2 before:bg-[#5154ff] before:rounded-full before:opacity-30" {...props} />
                                   }}>
                                       {tabData['Advisory'].advisory.report}
                                   </ReactMarkdown>
                               </div>
                            </motion.div>
                       </div>
                    )}

                    {/* Research Tab */}
                    {activeTab === 'Research and recommendation' && tabData['Research and recommendation'] && (
                       <div className="space-y-6">
                           {tabData['Research and recommendation'].research?.aiInsights ? (
                               <div className="bg-[#fcf8f0] border border-[#f0ebe0] rounded-[24px] p-8">
                                   <h3 className="text-lg font-black text-[#111] mb-6 flex items-center gap-2">
                                       <Activity className="w-5 h-5 text-[#5154ff]" /> Market General Sentiment
                                   </h3>
                                   <ReactMarkdown components={{
                                        p: ({node, ...props}) => <p className="text-[14px] text-[#444] font-semibold mb-2 leading-relaxed" {...props} />,
                                        li: ({node, ...props}) => <li className="text-[14px] font-bold text-[#444] mb-2 list-none pl-6 relative before:content-[''] before:absolute before:left-0 before:top-[9px] before:w-2 before:h-2 before:bg-[#5154ff] before:rounded-full before:opacity-30" {...props} />
                                   }}>
                                       {tabData['Research and recommendation'].research.aiInsights}
                                   </ReactMarkdown>
                               </div>
                           ) : (
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                   <div className="bg-emerald-50 rounded-[20px] p-6 border border-emerald-100 shadow-sm">
                                       <h3 className="text-[12px] font-black text-emerald-800 uppercase tracking-[0.2em] mb-4">Top Gainers</h3>
                                       <div className="space-y-3">
                                           {tabData['Research and recommendation'].research?.topGainers?.map(g => (
                                               <div key={g.ticker} className="flex justify-between items-center bg-white p-3 rounded-xl border border-emerald-100/50">
                                                   <span className="font-bold text-[#111]">{g.ticker}</span>
                                                   <span className="text-[12px] font-black text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">{g.change_percentage}</span>
                                               </div>
                                           ))}
                                       </div>
                                   </div>
                                   <div className="bg-rose-50 rounded-[20px] p-6 border border-rose-100 shadow-sm">
                                       <h3 className="text-[12px] font-black text-rose-800 uppercase tracking-[0.2em] mb-4">Top Losers</h3>
                                       <div className="space-y-3">
                                           {tabData['Research and recommendation'].research?.topLosers?.map(l => (
                                               <div key={l.ticker} className="flex justify-between items-center bg-white p-3 rounded-xl border border-rose-100/50">
                                                   <span className="font-bold text-[#111]">{l.ticker}</span>
                                                   <span className="text-[12px] font-black text-rose-600 bg-rose-100 px-2 py-1 rounded-md">{l.change_percentage}</span>
                                               </div>
                                           ))}
                                       </div>
                                   </div>
                               </div>
                           )}
                       </div>
                    )}
                 </div>
              )}
          </div>

          {/* Footer Footer */}
          <div className="shrink-0 flex items-center justify-center p-8 bg-white border-t border-gray-100/50">
             <button 
                onClick={handleFinalSelect}
                className="w-16 h-16 rounded-full border-4 border-gray-100/50 flex items-center justify-center text-[#bbb] hover:bg-[#5154ff] hover:text-white hover:border-[#5154ff]/20 transition-all group active:scale-95 shadow-xl relative"
             >
                <ChevronDown className="w-10 h-10 group-hover:translate-y-1.5 transition-transform" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-[3px] border-white shadow-md animate-pulse" />
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CashFlowStockModal;
