import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, AlertTriangle, Search, Lightbulb, 
  TrendingUp, BarChart3, Activity, ShieldCheck,
  ChevronRight, ArrowUpRight, ArrowDownRight, Info,
  Percent, Building2, Compass
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const AISnapshot = ({ data }) => {
  if (!data) return null;

  const {
    symbol,
    name,
    currentPrice,
    verdict,
    overview,
    trend_sector,
    risk_analysis,
    research,
    recommendation,
    chart_data,
    banking_metrics,
    indicators
  } = data;

  const isBuy = verdict === 'BUY';
  const isSell = verdict === 'SELL';
  
  // Color Helpers
  const getRiskColor = (impact) => {
    if (!impact) return 'text-gray-500 bg-gray-50 border-gray-100';
    switch (impact.toLowerCase()) {
      case 'high': return 'text-rose-500 bg-rose-50 border-rose-100';
      case 'medium': return 'text-amber-500 bg-amber-50 border-amber-100';
      case 'low': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
      default: return 'text-gray-500 bg-gray-50 border-gray-100';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[1000px] bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-xl my-6 font-sans text-gray-800"
    >
      {/* Header */}
      <div className="bg-[#f8f9fa] px-8 py-6 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <BarChart3 size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900">AI Snapshot: {name || symbol}</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{symbol}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-gray-900">₹{currentPrice}</p>
          <div className={`flex items-center gap-1 justify-end font-bold text-sm ${isBuy ? 'text-emerald-500' : isSell ? 'text-rose-500' : 'text-amber-500'}`}>
             <Zap size={14} fill="currentColor" /> {verdict}
          </div>
        </div>
      </div>
      
      {/* Banking Fundamentals (Conditional) */}
      {banking_metrics && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-indigo-50/30 border-b border-gray-100 p-8 overflow-hidden"
        >
           <div className="flex items-center gap-2 mb-6">
              <Building2 size={20} className="text-indigo-600" />
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-900/40">Banking Sector Fundamentals</h3>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Net Interest Margin', val: banking_metrics.nim, color: 'bg-indigo-500', pct: '70%' },
                { label: 'CASA Ratio', val: banking_metrics.casa, color: 'bg-emerald-500', pct: '60%' },
                { label: 'Asset Quality (NPA)', val: banking_metrics.npa, color: 'bg-rose-500', pct: '30%' },
                { label: 'CAR (Adequacy)', val: banking_metrics.car, color: 'bg-indigo-500', pct: '85%' }
              ].map((m, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-100/50 hover:shadow-md transition-shadow">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{m.label}</p>
                   <p className="text-xl font-black text-indigo-600">{m.val}</p>
                   <div className="mt-3 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: m.pct }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                        className={`h-full ${m.color}`} 
                      />
                   </div>
                </div>
              ))}
           </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
        
        {/* Column 1: Overview & Price Action */}
        <div className="md:col-span-4 p-8 border-r border-gray-100 space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Activity size={18} className="text-indigo-500" />
              <h3 className="text-sm font-black uppercase tracking-wider text-gray-400">1-Minute Overview</h3>
            </div>
            <p className="text-sm leading-relaxed font-medium text-gray-600">{overview}</p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={18} className="text-emerald-500" />
              <h3 className="text-sm font-black uppercase tracking-wider text-gray-400">AI Trend & Sector Context</h3>
            </div>
            <p className="text-sm leading-relaxed font-medium text-gray-600">{trend_sector}</p>
          </section>

          <section className={`p-5 rounded-2xl border ${isBuy ? 'bg-emerald-50/50 border-emerald-100' : isSell ? 'bg-rose-50/50 border-rose-100' : 'bg-amber-50/50 border-amber-100'}`}>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={18} className={isBuy ? 'text-emerald-500' : isSell ? 'text-rose-500' : 'text-amber-500'} />
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-500">The Verdict</h3>
            </div>
            <p className="text-sm font-bold text-gray-800 leading-snug">{data.verdict_justification || data.verdict_text || data.verdict || "Maintain long-term positive outlook."}</p>
          </section>

          {/* Fibonacci Series (Dynamic) */}
          {indicators?.FibonacciSeries && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/50 backdrop-blur-sm border border-blue-100 rounded-3xl p-6 mb-8"
            >
              <h3 className="text-sm font-bold text-blue-600 mb-4 flex items-center gap-2 uppercase tracking-widest">
                <Compass className="w-4 h-4" />
                Fibonacci Retracement Series (30D Live)
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                  { label: '23.6% (Weak)', price: indicators.FibonacciSeries.level236, color: 'text-gray-600' },
                  { label: '38.2% (Moderate)', price: indicators.FibonacciSeries.level382, color: 'text-blue-600' },
                  { label: '50.0% (Strong)', price: indicators.FibonacciSeries.level500, color: 'text-indigo-600' },
                  { label: '61.8% (Golden)', price: indicators.FibonacciSeries.level618, color: 'text-amber-600' },
                  { label: '78.6% (Critical)', price: indicators.FibonacciSeries.level786, color: 'text-rose-600' }
                ].map((lvl, idx) => (
                  <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-3 text-center shadow-sm">
                    <div className="text-[10px] uppercase font-black text-gray-400 mb-1">{lvl.label}</div>
                    <div className={`text-sm font-black ${lvl.color}`}>₹{lvl.price}</div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[11px] text-gray-400 italic">
                *Levels are recalculated in real-time based on the 30-day volatility range including the current live price.
              </p>
            </motion.div>
          )}

          {/* Mini Chart */}
          <div className="h-32 w-full pt-4">
             <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">30-Day Price Action</span>
             </div>
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={chart_data}>
                 <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke={isBuy ? '#10b981' : isSell ? '#f43f5e' : '#f59e0b'} 
                    strokeWidth={3} 
                    dot={false} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Column 2: Risk Analysis */}
        <div className="md:col-span-4 p-8 border-r border-gray-100 bg-[#fafafa]/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              <h3 className="text-sm font-black uppercase tracking-wider text-gray-400">Risk Analysis</h3>
            </div>
            <span className="text-[10px] font-bold bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-500">Overall: MEDIUM</span>
          </div>

          {/* Donut Chart SVG */}
          <div className="relative w-40 h-40 mx-auto mb-8">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r="16" fill="none" stroke="#f1f5f9" strokeWidth="4"></circle>
              {(() => {
                 const high = risk_analysis?.high || 0;
                 const medium = risk_analysis?.medium || 0;
                 const low = risk_analysis?.low || 0;
                 const total = (high + medium + low) || 1;
                 
                 const pHigh = (high / total) * 100;
                 const pMed = (medium / total) * 100;
                 const pLow = (low / total) * 100;

                 return (
                   <>
                     {/* High Risk */}
                     <motion.circle 
                        initial={{ strokeDasharray: "0 100" }}
                        animate={{ strokeDasharray: `${pHigh} 100` }}
                        transition={{ duration: 1 }}
                        cx="18" cy="18" r="16" fill="none" stroke="#f43f5e" strokeWidth="4" pathLength="100" strokeDashoffset="0" 
                     />
                     {/* Medium Risk */}
                     <motion.circle 
                        initial={{ strokeDasharray: "0 100" }}
                        animate={{ strokeDasharray: `${pMed} 100` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        cx="18" cy="18" r="16" fill="none" stroke="#f59e0b" strokeWidth="4" pathLength="100" strokeDashoffset={-pHigh} 
                     />
                     {/* Low Risk */}
                     <motion.circle 
                        initial={{ strokeDasharray: "0 100" }}
                        animate={{ strokeDasharray: `${pLow} 100` }}
                        transition={{ duration: 1, delay: 0.4 }}
                        cx="18" cy="18" r="16" fill="none" stroke="#10b981" strokeWidth="4" pathLength="100" strokeDashoffset={-(pHigh + pMed)} 
                     />
                   </>
                 );
              })()}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="text-xs font-bold text-gray-400 uppercase">Total</span>
               <span className="text-3xl font-black text-gray-900">{risk_analysis?.total || 0}</span>
               <span className="text-[10px] font-bold text-gray-400">Risk Factors</span>
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex justify-between items-center text-xs font-bold px-1 uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">
                <span>Risk Breakdown</span>
                <div className="flex gap-4">
                   <span>Impact</span>
                   <span>Count</span>
                </div>
             </div>
             {(risk_analysis?.breakdown || []).map((risk, idx) => (
                <div key={idx} className="flex justify-between items-center">
                   <span className="text-sm font-bold text-gray-700">{risk.factor}</span>
                   <div className="flex items-center gap-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${getRiskColor(risk.impact)}`}>
                        {risk.impact}
                      </span>
                      <span className="text-sm font-bold text-gray-400 w-4 text-center">{risk.factors}</span>
                   </div>
                </div>
             ))}
          </div>
        </div>

        {/* Column 3: Research & Recommendation */}
        <div className="md:col-span-4 p-8 flex flex-col justify-between">
          <div>
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Search size={18} className="text-indigo-500" />
                <h3 className="text-sm font-black uppercase tracking-wider text-gray-400">Research</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                  <p className="text-sm font-medium text-gray-600">
                    <span className="font-bold text-gray-800">Industry Deep Dive:</span> {research?.industry}
                  </p>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                  <p className="text-sm font-medium text-gray-600">
                    <span className="font-bold text-gray-800">Segment Performance:</span> {research?.performance}
                  </p>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                  <p className="text-sm font-medium text-gray-600">
                    <span className="font-bold text-gray-800">Competitor Comparison:</span> {research?.competitor}
                  </p>
                </li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb size={18} className="text-amber-500" />
                <h3 className="text-sm font-black uppercase tracking-wider text-gray-400">Recommendation</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <p className="text-sm font-medium text-gray-600">
                    <span className="font-bold text-gray-800">Entry Strategy:</span> {recommendation?.entry}
                  </p>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <p className="text-sm font-medium text-gray-600">
                    <span className="font-bold text-gray-800">Investment View:</span> {recommendation?.view}
                  </p>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <p className="text-sm font-medium text-gray-600">
                    <span className="font-bold text-gray-800">Actionable Advice:</span> {recommendation?.advice}
                  </p>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <p className="text-sm font-medium text-gray-600">
                    <span className="font-bold text-gray-800">Key Monitoring Metric:</span> {recommendation?.metric}
                  </p>
                </li>
              </ul>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
             <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 italic">
               <Info size={12} />
               General AI Snapshot for informational purposes.
             </div>
             <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-indigo-100"
             >
               View Full Analysis <ChevronRight size={14} />
             </motion.button>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default AISnapshot;
