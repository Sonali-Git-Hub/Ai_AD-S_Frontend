import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';
import {
    RefreshCw, PieChart, MessageSquare, AlertTriangle, Cpu, TrendingUp, X,
    Layers, TrendingDown, Clock, BarChart2, Eye, Mail, Copy, Check, User2,
    Laptop, Terminal, ExternalLink, ChevronRight, Globe, Monitor, BugPlay,
    Smartphone, Server, FileWarning, MessageCircle, ShieldAlert
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { SectionCard } from './AdminCommon';
import ErrorMonitoring from './ErrorMonitoring';

const AnalyticsTab = () => {
    const [subTab, setSubTab] = useState('usage');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('7d');
    const [refreshing, setRefreshing] = useState(false);
    const [lastFetched, setLastFetched] = useState(null); // timestamp of last successful fetch

    // Drill-down state
    const [drillMode, setDrillMode] = useState(null);
    const [drillData, setDrillData] = useState(null);
    const [drillLoading, setDrillLoading] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedSubTool, setSelectedSubTool] = useState(null);
    // In-memory drill-down cache: key → { data, fetchedAt }
    const drillCache = React.useRef({});

    // Session inspector state
    const [inspectSession, setInspectSession] = useState(null);
    const [copiedStack, setCopiedStack] = useState(false);

    const copyStack = useCallback((text) => {
        navigator.clipboard.writeText(text || '');
        setCopiedStack(true);
        setTimeout(() => setCopiedStack(false), 2000);
    }, []);

    const fetchAnalytics = async (isManual = false) => {
        // Skip if data already fresh (< 3 min old) and not manually triggered
        if (!isManual && data && lastFetched && Date.now() - lastFetched < 3 * 60 * 1000) return;
        if (isManual) setRefreshing(true);
        else setLoading(true);
        try {
            const res = await apiService.getAdminAnalytics(range);
            setData(res.analytics);
            setLastFetched(Date.now());
        } catch (err) {
            console.error('Analytics fetch failed:', err);
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const openDrillDown = async (mode, subTool = null) => {
        const key = `${mode}:${range}:${subTool || ''}`;
        setDrillMode(mode);
        setSelectedSubTool(subTool);
        setDrawerOpen(true);

        // Use cache if available and < 3 min old
        const cached = drillCache.current[key];
        if (cached && Date.now() - cached.fetchedAt < 3 * 60 * 1000) {
            setDrillData(cached.data);
            return;
        }

        setDrillLoading(true);
        setDrillData(null);
        try {
            const res = await apiService.getAdminErrorDrillDown(mode, range, subTool || '');
            setDrillData(res.drillDown);
            drillCache.current[key] = { data: res.drillDown, fetchedAt: Date.now() };
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

    useEffect(() => {
        // Clear drill cache when range changes
        drillCache.current = {};
        fetchAnalytics();
    }, [range]);

    // Relative time helper
    const relativeTime = (ts) => {
        if (!ts) return null;
        const diff = Math.floor((Date.now() - ts) / 1000);
        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
        return `${Math.floor(diff / 3600)}h ago`;
    };

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
                    {lastFetched && (
                        <span className="text-[10px] text-subtext/60 hidden sm:block">
                            Updated {relativeTime(lastFetched)}
                        </span>
                    )}
                    <button
                        onClick={() => fetchAnalytics(true)}
                        disabled={refreshing}
                        className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-all disabled:opacity-50"
                        title="Force refresh (bypass cache)"
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
        <div className="relative space-y-6">
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

            {/* Sub Tabs Selector */}
            <div className="flex bg-white/10 dark:bg-black/25 p-1 rounded-xl border border-white/10 self-start max-w-sm gap-1">
                <button
                    onClick={() => setSubTab('usage')}
                    className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
                        subTab === 'usage' 
                            ? 'bg-primary text-white shadow-md' 
                            : 'text-subtext hover:text-maintext'
                    }`}
                >
                    <Layers className="w-3.5 h-3.5" /> Usage & Latency
                </button>
                <button
                    onClick={() => setSubTab('incidents')}
                    className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
                        subTab === 'incidents' 
                            ? 'bg-primary text-white shadow-md' 
                            : 'text-subtext hover:text-maintext'
                    }`}
                >
                    <AlertTriangle className="w-3.5 h-3.5 text-orange-400" /> Incident Monitoring
                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                </button>
            </div>

            {subTab === 'usage' ? (
                <>
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
                                                    <span className="ml-auto text-[10px] text-subtext font-normal">Click Inspect to see full details</span>
                                                </h3>
                                                <div className="space-y-2">
                                                    {drillData.recentSessions.map((s, i) => (
                                                        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2 hover:border-white/20 transition-all">
                                                            {/* Row 1: User + date + error count */}
                                                            <div className="flex items-center justify-between flex-wrap gap-2">
                                                                <div className="flex items-center gap-2">
                                                                    {s.user ? (
                                                                        <div className="flex items-center gap-1.5">
                                                                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                                                                <User2 className="w-3 h-3 text-primary" />
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-[11px] font-bold text-maintext leading-tight">{s.user.name}</p>
                                                                                <p className="text-[9px] text-subtext leading-tight">{s.user.email}</p>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                                                            <Globe className="w-2.5 h-2.5" /> Guest Session
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs">
                                                                    <span className="text-red-400 font-bold bg-red-400/10 px-2 py-0.5 rounded-lg">{s.errorCount} error{s.errorCount !== 1 ? 's' : ''}</span>
                                                                    <span className="text-subtext">{s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                                                                </div>
                                                            </div>

                                                            {/* Row 2: Session title + sub-tool */}
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-[10px] text-subtext">
                                                                    <span className="text-maintext font-semibold">"{s.sessionTitle || 'Unnamed Session'}"</span>
                                                                </span>
                                                                <span className="text-[9px] text-subtext/60">·</span>
                                                                <span className="text-[9px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-mono text-subtext">{s.activeTool || 'General'}</span>
                                                            </div>

                                                            {/* Row 3: Error snippet */}
                                                            {s.topError && (
                                                                <p className="text-[10px] text-red-300/80 bg-red-500/5 border border-red-500/10 rounded-lg px-2.5 py-1.5 font-mono leading-relaxed line-clamp-2">
                                                                    {s.topError}
                                                                </p>
                                                            )}

                                                            {/* Row 4: Telemetry chips + Inspect button */}
                                                            <div className="flex items-center justify-between flex-wrap gap-2">
                                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                                    {s.os && <span className="text-[9px] bg-white/5 border border-white/5 px-1.5 py-0.5 rounded font-mono text-subtext/70 flex items-center gap-1"><Monitor className="w-2.5 h-2.5" />{s.os}</span>}
                                                                    {s.browser && <span className="text-[9px] bg-white/5 border border-white/5 px-1.5 py-0.5 rounded font-mono text-subtext/70 flex items-center gap-1"><Globe className="w-2.5 h-2.5" />{s.browser}</span>}
                                                                    {s.statusCode && <span className="text-[9px] bg-orange-500/10 border border-orange-500/10 px-1.5 py-0.5 rounded font-mono text-orange-400">{s.statusCode}</span>}
                                                                </div>
                                                                <button
                                                                    onClick={() => { setInspectSession(s); setDrawerOpen(false); }}
                                                                    className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 px-2.5 py-1 rounded-lg transition-all"
                                                                >
                                                                    <Eye className="w-3 h-3" /> Inspect &amp; Resolve
                                                                </button>
                                                            </div>
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
                </>
            ) : (
                <ErrorMonitoring />
            )}

            {/* Session Inspector Modal */}
            {inspectSession && (
                <SessionInspectorModal
                    session={inspectSession}
                    onClose={() => setInspectSession(null)}
                    copiedStack={copiedStack}
                    onCopyStack={copyStack}
                />
            )}
        </div>
    );
};

export default AnalyticsTab;

// ──────────────────────────────────────────────────────────────────────────────────
// Session Inspector Modal - shown when admin clicks "Inspect & Resolve"
// ──────────────────────────────────────────────────────────────────────────────────
export const SessionInspectorModal = ({ session, onClose, copiedStack, onCopyStack }) => {
    const [activeTab, setActiveTab] = useState('error');
    if (!session) return null;
    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4" style={{ perspective: '1000px' }}>
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/70 backdrop-blur-md"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 24 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 24 }}
                    transition={{ type: 'spring', damping: 24, stiffness: 200 }}
                    className="relative z-10 w-full max-w-4xl max-h-[92vh] min-h-[520px] flex flex-col bg-[#0a0c12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* ── Header ── */}
                    <div className="flex items-start justify-between p-5 border-b border-white/10 bg-gradient-to-r from-red-950/30 to-transparent shrink-0">
                        <div className="space-y-1 min-w-0 flex-1 pr-4">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="flex items-center gap-1.5 text-[10px] font-black text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                    <BugPlay className="w-3 h-3" /> Session Error Inspector
                                </span>
                                <span className="text-[10px] font-mono text-subtext/60">{session.sessionId ? `ID: ${session.sessionId.substring(0, 24)}...` : 'Guest / No Session'}</span>
                            </div>
                            <h2 className="text-base font-bold text-maintext leading-tight truncate">
                                "{session.sessionTitle || 'Unnamed Session'}"
                            </h2>
                            <p className="text-[11px] text-subtext">
                                {session.createdAt ? new Date(session.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}
                                {' · '}
                                <span className="text-red-400 font-bold">{session.errorCount} error{session.errorCount !== 1 ? 's' : ''}</span>
                                {' · '}
                                <span className="text-subtext">{session.activeTool || 'General'}</span>
                            </p>
                        </div>

                        {/* User / Guest Badge */}
                        <div className="flex items-center gap-3 shrink-0">
                            {session.user ? (
                                <div className="text-right">
                                    <p className="text-xs font-bold text-maintext">{session.user.name}</p>
                                    <p className="text-[10px] text-subtext">{session.user.email}</p>
                                </div>
                            ) : (
                                <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-1 rounded-lg flex items-center gap-1">
                                    <Globe className="w-3 h-3" /> Guest
                                </span>
                            )}
                            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-subtext hover:text-maintext transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* ── Tab Bar ── */}
                    <div className="shrink-0 bg-[#0d1017] border-b border-white/10 px-5 py-3">
                        <div className="flex items-center gap-2">
                            {[
                                { id: 'error',        label: 'Error & Stack',  Icon: ShieldAlert,    color: 'text-red-400',    activeBg: 'bg-red-500/15 border-red-500/30' },
                                { id: 'conversation', label: 'Conversation',   Icon: MessageCircle,  color: 'text-blue-400',   activeBg: 'bg-blue-500/15 border-blue-500/30' },
                                { id: 'telemetry',    label: 'Telemetry',      Icon: Monitor,        color: 'text-emerald-400',activeBg: 'bg-emerald-500/15 border-emerald-500/30' },
                                { id: 'breadcrumbs',  label: 'User Journey',   Icon: ChevronRight,   color: 'text-amber-400',  activeBg: 'bg-amber-500/15 border-amber-500/30' },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                                        activeTab === tab.id
                                            ? `${tab.activeBg} ${tab.color}`
                                            : 'border-transparent text-subtext hover:text-maintext hover:bg-white/5'
                                    }`}
                                >
                                    <tab.Icon className={`w-3.5 h-3.5 shrink-0 ${ activeTab === tab.id ? tab.color : 'text-subtext/60' }`} />
                                    <span className="truncate">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Tab Content ── */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">

                        {/* ERROR & STACK TRACE TAB */}
                        {activeTab === 'error' && (
                            <div className="space-y-4">
                                {/* Top Error Message */}
                                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 space-y-2">
                                    <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <ShieldAlert className="w-3.5 h-3.5" /> Error Message
                                    </h4>
                                    <p className="text-sm text-maintext font-mono whitespace-pre-wrap leading-relaxed select-all">
                                        {session.topError || 'No error message captured.'}
                                    </p>
                                </div>

                                {/* Stack Trace */}
                                {session.stackTrace ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[10px] font-black text-subtext uppercase tracking-widest flex items-center gap-1.5">
                                                <Terminal className="w-3.5 h-3.5" /> Full Stack Trace
                                            </h4>
                                            <button
                                                onClick={() => onCopyStack(session.stackTrace)}
                                                className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline transition-all"
                                            >
                                                {copiedStack ? <><Check className="w-3 h-3 text-emerald-400" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy Stack</>}
                                            </button>
                                        </div>
                                        <pre className="p-4 bg-[#05070a] border border-white/5 rounded-xl font-mono text-[10.5px] leading-relaxed text-subtext/90 overflow-x-auto select-text whitespace-pre max-h-72 overflow-y-auto custom-scrollbar">
                                            {session.stackTrace}
                                        </pre>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-subtext text-xs border border-dashed border-white/10 rounded-xl">
                                        No stack trace was captured for this error occurrence.
                                    </div>
                                )}

                                {/* API Info */}
                                {(session.apiRoute || session.statusCode) && (
                                    <div className="flex items-center gap-3 p-3 bg-orange-500/5 border border-orange-500/10 rounded-xl">
                                        <Server className="w-4 h-4 text-orange-400 shrink-0" />
                                        <div className="text-[11px] font-mono">
                                            {session.statusCode && <span className="text-orange-400 font-bold mr-2">[{session.statusCode}]</span>}
                                            <span className="text-maintext">{session.apiRoute || 'Unknown route'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* CONVERSATION REPLAY TAB */}
                        {activeTab === 'conversation' && (
                            <div className="space-y-3">
                                {session.conversation && session.conversation.length > 0 ? (
                                    <>
                                        <p className="text-[10px] text-subtext italic">Showing last {session.conversation.length} messages in this session at the time of error.</p>
                                        <div className="space-y-2 flex flex-col">
                                            {session.conversation.map((msg, idx) => {
                                                const isModel = msg.role === 'model' || msg.role === 'assistant';
                                                return (
                                                    <div key={idx} className={`flex flex-col max-w-[85%] ${isModel ? 'self-start' : 'self-end ml-auto'}`}>
                                                        <span className={`text-[9px] uppercase font-bold tracking-wider mb-0.5 ${isModel ? 'text-primary/70' : 'text-subtext/70'}`}>
                                                            {isModel ? '🤖 AISA AI' : `👤 ${session.user?.name || 'User'}`}
                                                        </span>
                                                        <div className={`p-2.5 rounded-xl text-xs leading-relaxed ${
                                                            isModel
                                                                ? 'bg-white/5 border border-white/10 text-maintext'
                                                                : 'bg-primary text-white'
                                                        }`}>
                                                            {msg.content}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-12 text-subtext text-xs border border-dashed border-white/10 rounded-xl">
                                        <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                        No conversation messages were recorded in this session.
                                        <p className="mt-1 text-[10px] opacity-60">This may be a direct API call or guest one-shot request.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TELEMETRY TAB */}
                        {activeTab === 'telemetry' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {[
                                        { label: 'Operating System', value: session.os, icon: Monitor },
                                        { label: 'Browser', value: session.browser, icon: Globe },
                                        { label: 'Device', value: session.device, icon: Smartphone },
                                        { label: 'Sub-Tool', value: session.activeTool, icon: Cpu },
                                        { label: 'Session Mode', value: session.detectedMode, icon: BugPlay },
                                        { label: 'Session Type', value: session.isGuest ? 'Guest Session' : 'Authenticated', icon: User2 },
                                    ].map((item, idx) => (
                                        <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-3 space-y-1">
                                            <div className="flex items-center gap-1.5 text-[9px] text-subtext/60 uppercase tracking-wider font-extrabold">
                                                <item.icon className="w-3 h-3 text-primary/60" />
                                                {item.label}
                                            </div>
                                            <p className="text-xs font-bold text-maintext break-all">{item.value || 'Unknown'}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* User Card */}
                                {session.user && (
                                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                            <User2 className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-maintext">{session.user.name}</p>
                                            <p className="text-[11px] text-subtext flex items-center gap-1 mt-0.5">
                                                <Mail className="w-3 h-3" /> {session.user.email}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Session ID (copyable) */}
                                {session.sessionId && (
                                    <div className="bg-white/5 border border-white/5 rounded-xl p-3 space-y-1">
                                        <p className="text-[9px] text-subtext/60 uppercase tracking-wider font-extrabold">Full Session ID</p>
                                        <p
                                            className="text-xs font-mono text-primary select-all cursor-pointer hover:underline"
                                            onClick={() => { navigator.clipboard.writeText(session.sessionId); toast.success('Session ID copied!'); }}
                                        >
                                            {session.sessionId}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* BREADCRUMBS / JOURNEY TAB */}
                        {activeTab === 'breadcrumbs' && (
                            <div className="space-y-3">
                                {session.breadcrumbs && session.breadcrumbs.length > 0 ? (
                                    <>
                                        <p className="text-[10px] text-subtext italic">User journey leading up to the error — {session.breadcrumbs.length} events captured.</p>
                                        <div className="relative border-l-2 border-primary/20 pl-4 ml-2 space-y-4">
                                            {session.breadcrumbs.map((crumb, idx) => (
                                                <div key={idx} className="relative">
                                                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-[#0a0c12] border-2 border-primary/50" />
                                                    <div className="bg-white/5 border border-white/5 rounded-xl p-3 space-y-1">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="text-[9px] font-black uppercase tracking-wider text-primary">{crumb.category || 'event'}</span>
                                                            <span className="text-[9px] text-subtext/50 font-mono">{crumb.timestamp ? new Date(crumb.timestamp).toLocaleTimeString('en-IN') : ''}</span>
                                                        </div>
                                                        <p className="text-xs font-semibold text-maintext">{crumb.message}</p>
                                                        {crumb.data && Object.keys(crumb.data).length > 0 && (
                                                            <p className="text-[9px] text-subtext/60 font-mono truncate">{JSON.stringify(crumb.data)}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-12 text-subtext text-xs border border-dashed border-white/10 rounded-xl">
                                        <ChevronRight className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                        No breadcrumb events were captured for this session.
                                        <p className="mt-1 text-[10px] opacity-60">Breadcrumbs are logged when the SDK is configured on the client side.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
