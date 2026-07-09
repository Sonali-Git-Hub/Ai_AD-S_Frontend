import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';
import {
    RefreshCw, PieChart, MessageSquare, AlertTriangle, Cpu, TrendingUp, X,
    Layers, TrendingDown, Clock, BarChart2
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { SectionCard } from './AdminCommon';

const AnalyticsTab = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('7d');
    const [refreshing, setRefreshing] = useState(false);

    // Drill-down state
    const [drillMode, setDrillMode] = useState(null); // which mode was clicked
    const [drillData, setDrillData] = useState(null);
    const [drillLoading, setDrillLoading] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedSubTool, setSelectedSubTool] = useState(null);

    const fetchAnalytics = async (isManual = false) => {
        if (isManual) setRefreshing(true);
        else setLoading(true);
        try {
            const res = await apiService.getAdminAnalytics(range);
            setData(res.analytics);
        } catch (err) {
            console.error('Analytics fetch failed:', err);
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const openDrillDown = async (mode, subTool = null) => {
        setDrillMode(mode);
        setSelectedSubTool(subTool);
        setDrawerOpen(true);
        setDrillLoading(true);
        setDrillData(null);
        try {
            const res = await apiService.getAdminErrorDrillDown(mode, range, subTool || '');
            setDrillData(res.drillDown);
        } catch (err) {
            console.error('Drill-down fetch failed:', err);
            toast.error('Failed to load error details');
        } finally {
            setDrillLoading(false);
        }
    };

    useEffect(() => {
        if (drawerOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [drawerOpen]);

    useEffect(() => { fetchAnalytics(); }, [range]);

    const MODE_LABELS = {
        NORMAL_CHAT: 'AI Chat',
        LEGAL_TOOLKIT: 'Legal Toolkit',
        IMAGE_GENERATION: 'Image Generation',
        VIDEO_GENERATION: 'Video Generation',
        IMAGE_EDIT: 'Image Edit',
        AUDIO_CONVERT: 'Audio Convert',
        DOCUMENT_CONVERT: 'Document Convert',
        CODE_WRITER: 'Code Writer',
        CASHFLOW: 'Cashflow',
        RAG: 'RAG / Knowledge',
    };

    const MODE_COLORS = [
        '#6C63FF', '#FF6584', '#43D9B2', '#FFB347', '#4FC3F7',
        '#E57373', '#81C784', '#FFD54F', '#BA68C8', '#4DB6AC'
    ];

    const getLabel = (mode) => MODE_LABELS[mode] || mode || 'Unknown';

    const maxModeCount = data?.modeUsage?.[0]?.count || 1;
    const maxErrorCount = data?.errorByMode?.[0]?.errorCount || 1;

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            <p className="text-subtext text-sm">Loading analytics...</p>
        </div>
    );

    const mainContent = (
        <div className="space-y-6">
            {/* Header Row */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-lg font-black text-maintext flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-primary" /> Analytics Overview
                    </h2>
                    <p className="text-xs text-subtext mt-0.5">Error rates, card usage & trends</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Range Selector */}
                    <div className="flex gap-1 bg-white/10 dark:bg-white/5 rounded-xl p-1 border border-white/20">
                        {['24h', '7d', '30d', '90d'].map(r => (
                            <button
                                key={r}
                                onClick={() => setRange(r)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${range === r
                                        ? 'bg-primary text-white shadow-md'
                                        : 'text-subtext hover:text-maintext hover:bg-white/10'
                                    }`}
                            >{r}</button>
                        ))}
                    </div>
                    <button
                        onClick={() => fetchAnalytics(true)}
                        disabled={refreshing}
                        className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-all disabled:opacity-50"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
                    className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl p-5 group hover:border-primary/30 transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-maintext">{data?.summary?.totalSessions ?? 0}</p>
                    <p className="text-xs font-semibold text-subtext uppercase tracking-wider mt-1">Total Sessions</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                    className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl p-5 group hover:border-red-500/30 transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        {data?.summary?.errorRate > 0 && (
                            <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20">
                                {data.summary.errorRate}% rate
                            </span>
                        )}
                    </div>
                    <p className="text-2xl font-black text-maintext">{data?.summary?.totalErrors ?? 0}</p>
                    <p className="text-xs font-semibold text-subtext uppercase tracking-wider mt-1">Total Errors</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl p-5 group hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <Cpu className="w-5 h-5 text-emerald-400" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-maintext">{data?.summary?.apiHits ?? 0}</p>
                    <p className="text-xs font-semibold text-subtext uppercase tracking-wider mt-1">Backend API Hits</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl p-5 group hover:border-primary/30 transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-maintext">{(data?.summary?.avgLatency ?? 0).toFixed(0)}ms</p>
                    <p className="text-xs font-semibold text-subtext uppercase tracking-wider mt-1">Avg Response Latency</p>
                </motion.div>
            </div>

            {/* Split row: Usage and Error matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mode Usage stats */}
                <SectionCard title="Feature Usage Share">
                    <div className="space-y-4">
                        {(!data?.modeUsage || data.modeUsage.length === 0) ? (
                            <p className="text-center py-12 text-subtext text-sm">No usage data found.</p>
                        ) : (
                            data.modeUsage.map((m, i) => {
                                const pct = maxModeCount > 0 ? (m.count / maxModeCount) * 100 : 0;
                                const barColor = MODE_COLORS[i % MODE_COLORS.length];
                                return (
                                    <div key={m._id} className="space-y-1">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-maintext flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: barColor }} />
                                                {getLabel(m._id)}
                                            </span>
                                            <span className="text-subtext font-mono font-bold">{m.count} sessions</span>
                                        </div>
                                        <div className="w-full bg-white/10 dark:bg-black/20 rounded-full h-2 overflow-hidden border border-white/5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ duration: 0.5, delay: i * 0.05 }}
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: barColor }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </SectionCard>

                {/* Error share list with clickable drill-down */}
                <SectionCard title="Errors by Sub-Tool (Click to inspect)">
                    <div className="space-y-3">
                        {(!data?.errorByMode || data.errorByMode.length === 0) ? (
                            <p className="text-center py-12 text-emerald-500 font-semibold text-sm">No errors detected! Clean sheet 🚀</p>
                        ) : (
                            data.errorByMode.map((m, i) => {
                                const pct = maxErrorCount > 0 ? (m.errorCount / maxErrorCount) * 100 : 0;
                                return (
                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        key={m._id}
                                        onClick={() => openDrillDown(m._id)}
                                        className="w-full text-left p-3.5 bg-white/20 dark:bg-white/5 hover:bg-red-500/5 dark:hover:bg-red-500/5 rounded-2xl border border-white/10 hover:border-red-500/30 transition-all flex flex-col gap-1.5"
                                    >
                                        <div className="flex justify-between items-center text-xs w-full">
                                            <span className="font-bold text-maintext">{getLabel(m._id)}</span>
                                            <span className="text-red-400 font-bold bg-red-400/10 px-2 py-0.5 rounded-lg border border-red-500/15">
                                                {m.errorCount} errors
                                            </span>
                                        </div>
                                        <div className="w-full bg-white/10 dark:bg-black/20 rounded-full h-1.5 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                className="bg-red-400 h-full rounded-full"
                                            />
                                        </div>
                                    </motion.button>
                                );
                            })
                        )}
                    </div>
                </SectionCard>
            </div>
        </div>
    );

    const maxPatternCount = drillData?.patterns?.[0]?.count || 1;
    const maxDailyErr = drillData?.dailyErrors?.[0]?.errorCount || 1;

    return (
        <div className="relative">
            <style dangerouslySetInnerHTML={{__html: `
                .custom-drawer-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-drawer-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-drawer-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 999px;
                }
                .custom-drawer-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
            `}} />

            {mainContent}

            {/* Slide over Drill-down Drawer */}
            <AnimatePresence>
                {drawerOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDrawerOpen(false)}
                            className="fixed inset-0 z-[2000] bg-black"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 26, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 z-[2010] w-full max-w-lg bg-[#0e1117] border-l border-white/10 shadow-2xl flex flex-col"
                        >
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
                                <div>
                                    <h3 className="font-bold text-maintext text-base flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-red-400" /> Inspecting Errors: {getLabel(drillMode)}
                                    </h3>
                                    <p className="text-[11px] text-subtext mt-0.5">
                                        {selectedSubTool ? `Filtered by Sub-Tool: ${selectedSubTool}` : 'Sub-pattern analyzer for the active range'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setDrawerOpen(false)}
                                    className="p-2 rounded-xl hover:bg-white/10 text-subtext hover:text-maintext transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Drawer Content */}
                            <div className="flex-1 overflow-y-auto custom-drawer-scrollbar p-5 space-y-6">
                                {drillLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                                        <RefreshCw className="w-6 h-6 text-primary animate-spin" />
                                        <p className="text-xs text-subtext">Parsing error logs & matching patterns...</p>
                                    </div>
                                ) : drillData ? (
                                    <>
                                        {/* ── Tool/Sub-feature Breakdown ─── */}
                                        {drillData.toolStats.length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-bold text-maintext mb-3 flex items-center justify-between gap-2">
                                                    <span className="flex items-center gap-2">
                                                        <Layers className="w-4 h-4 text-primary" /> Errors by Sub-Tool (Click to Filter)
                                                    </span>
                                                    {selectedSubTool && (
                                                        <button 
                                                            onClick={() => openDrillDown(drillMode, null)}
                                                            className="text-[10px] text-primary hover:underline font-bold"
                                                        >
                                                            Clear Filter
                                                        </button>
                                                    )}
                                                </h3>
                                                <div className="space-y-2">
                                                    {drillData.toolStats.map((t, i) => {
                                                        const isSelected = selectedSubTool === t.tool;
                                                        return (
                                                            <button
                                                                key={i}
                                                                onClick={() => openDrillDown(drillMode, isSelected ? null : t.tool)}
                                                                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                                                                    isSelected 
                                                                        ? 'bg-red-500/10 border-red-500/50 hover:bg-red-500/20' 
                                                                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                                                }`}
                                                            >
                                                                <span className="text-sm text-maintext font-medium">{t.tool}</span>
                                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-lg transition-all ${
                                                                    isSelected 
                                                                        ? 'text-red-400 bg-red-500/20' 
                                                                        : 'text-red-400 bg-red-400/10'
                                                                }`}>{t.count} errors</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* ── Pattern Matches ─── */}
                                        {drillData.patterns.length > 0 ? (
                                            <div>
                                                <h3 className="text-sm font-bold text-maintext mb-3 flex items-center gap-2">
                                                    <BarChart2 className="w-4 h-4 text-primary" /> Error Sub-types & Patterns
                                                </h3>
                                                <div className="space-y-2">
                                                    {drillData.patterns.map((p, i) => (
                                                        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                                                                    <span className="text-sm font-semibold text-maintext">{p.label}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs">
                                                                    <span className="font-bold" style={{ color: p.color }}>{p.count}×</span>
                                                                    <span className="text-subtext">{p.sessionCount} sessions</span>
                                                                </div>
                                                            </div>
                                                            <div className="w-full bg-white/10 rounded-full h-1.5 mb-2">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${Math.round((p.count / maxPatternCount) * 100)}%` }}
                                                                    style={{ width: `${Math.round((p.count / maxPatternCount) * 100)}%`, backgroundColor: p.color }}
                                                                    transition={{ duration: 0.5, delay: i * 0.04 }}
                                                                    className="h-1.5 rounded-full"
                                                                />
                                                            </div>
                                                            {/* Sample error messages */}
                                                            {p.samples.length > 0 && (
                                                                <div className="space-y-1 mt-2">
                                                                    <p className="text-[10px] text-subtext uppercase tracking-wider font-bold">Sample Messages:</p>
                                                                    {p.samples.map((sample, si) => (
                                                                        <div key={si} className="bg-black/10 dark:bg-black/30 rounded-lg px-3 py-2 text-xs text-subtext font-mono leading-relaxed border border-white/5">
                                                                            "{sample.length > 200 ? sample.substring(0, 200) + '...' : sample}"
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-subtext text-xs border border-dashed border-white/10 rounded-xl">
                                                No specific patterns matched for this sub-tool.
                                            </div>
                                        )}

                                        {/* ── Daily Error Trend ─── */}
                                        {drillData.dailyErrors.length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-bold text-maintext mb-3 flex items-center gap-2">
                                                    <TrendingDown className="w-4 h-4 text-red-400" /> Daily Error Trend
                                                </h3>
                                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                                    <div className="flex items-end gap-1.5 h-20">
                                                        {drillData.dailyErrors.map((d, i) => {
                                                            const heightPct = Math.max(4, Math.round((d.errorCount / maxDailyErr) * 100));
                                                            return (
                                                                <div key={i} className="flex flex-col items-center flex-1 gap-1" title={`${d._id}: ${d.errorCount} errors`}>
                                                                    <motion.div
                                                                        initial={{ height: 0 }}
                                                                        animate={{ height: `${heightPct}%` }}
                                                                        transition={{ duration: 0.4, delay: i * 0.03 }}
                                                                        className="w-full rounded-t-sm bg-gradient-to-t from-red-500 to-red-300"
                                                                        style={{ height: `${heightPct}%` }}
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="flex justify-between text-[9px] text-subtext mt-1">
                                                        <span>{drillData.dailyErrors[0]?._id?.slice(5)}</span>
                                                        <span>{drillData.dailyErrors[drillData.dailyErrors.length - 1]?._id?.slice(5)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* ── Recent Error Sessions ─── */}
                                        {drillData.recentSessions.length > 0 ? (
                                            <div>
                                                <h3 className="text-sm font-bold text-maintext mb-3 flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-subtext" /> Recent Affected Sessions
                                                </h3>
                                                <div className="space-y-2">
                                                    {drillData.recentSessions.map((s, i) => (
                                                        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
                                                            <div className="flex items-center justify-between flex-wrap gap-2">
                                                                <span className="font-mono text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-lg">
                                                                    {s.sessionId?.substring(0, 20)}...
                                                                </span>
                                                                <div className="flex items-center gap-2 text-xs">
                                                                    <span className="text-red-400 font-bold bg-red-400/10 px-2 py-0.5 rounded-lg">{s.errorCount} errors</span>
                                                                    <span className="text-subtext">{s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '-'}</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-[10px] text-subtext px-0.5">
                                                                Sub-Tool: <span className="text-maintext font-bold">{s.activeTool || 'General'}</span>
                                                            </div>
                                                            {s.topError && (
                                                                <p className="text-[11px] text-subtext bg-black/10 dark:bg-black/30 rounded-lg px-2.5 py-1.5 font-mono leading-relaxed border border-white/5 line-clamp-3">
                                                                    {s.topError}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-subtext text-xs border border-dashed border-white/10 rounded-xl">
                                                No recent error sessions found for this sub-tool.
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-16 text-subtext">No data available</div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AnalyticsTab;
