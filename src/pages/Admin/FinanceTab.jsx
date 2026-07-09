import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, TrendingDown, DollarSign, Receipt, BarChart3, FileSpreadsheet,
    Search, Filter, Download, Printer, RefreshCw, ChevronLeft, ChevronRight,
    CreditCard, Users, Activity, Percent, ArrowUpRight, ArrowDownRight,
    Calendar, Building2, Hash, Eye, Send, X, ChevronDown, RotateCcw, Zap, CheckCircle, AlertTriangle
} from 'lucide-react';

import { apiService } from '../../services/apiService';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const fmt = (n = 0) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtNum = (n = 0) => Number(n).toLocaleString('en-IN');
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

const GATEWAY_COLORS = {
    razorpay: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', hex: '#60a5fa' },
    paypal: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', hex: '#fbbf24' },
    apple_pay: { bg: 'bg-gray-400/10', text: 'text-gray-300', border: 'border-gray-400/20', hex: '#9ca3af' },
    play_store: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', hex: '#34d399' },
    app_store: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', hex: '#a78bfa' },
};

const STATUS_COLORS = {
    captured: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    success: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    pending: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400' },
    failed: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400' },
    refunded: { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-400' },
};

const downloadBlob = (response, filename) => {
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
};

// ─────────────────────────────────────────────────────────────────────────────
// MINI COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const Spinner = () => (
    <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
);

const KPICard = ({ label, value, sub, icon: Icon, color = 'primary', trend, trendUp }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white/5 dark:bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-4 overflow-hidden group hover:border-primary/30 transition-all"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
        <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-${color}/10`}>
                    <Icon className={`w-4 h-4 text-${color}`} />
                </div>
                {trend !== undefined && (
                    <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg ${trendUp ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
                        {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <p className="text-xl font-black text-maintext tracking-tight">{value}</p>
            <p className="text-[10px] font-semibold text-subtext uppercase tracking-wider mt-0.5">{label}</p>
            {sub && <p className="text-[10px] text-subtext/70 mt-1">{sub}</p>}
        </div>
    </motion.div>
);

const SubTab = ({ id, label, icon: Icon, active, onClick }) => (
    <button
        onClick={() => onClick(id)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${active
            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
            : 'text-subtext hover:text-maintext border-white/10 hover:border-white/20 hover:bg-white/5'
        }`}
    >
        <Icon className="w-3.5 h-3.5" />
        {label}
    </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// SVG LINE CHART — Monthly Revenue
// ─────────────────────────────────────────────────────────────────────────────
const LineChart = ({ data, height = 120 }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-32 text-subtext text-xs">
                No chart data yet
            </div>
        );
    }

    const padLeft = 60, padRight = 20, padTop = 10, padBottom = 30;
    const width = 600;
    const maxVal = Math.max(...data.map(d => d.revenue), 1);

    const toX = (i) => padLeft + (i / (data.length - 1 || 1)) * (width - padLeft - padRight);
    const toY = (v) => padTop + (1 - v / maxVal) * (height - padTop - padBottom);

    const pathD = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(d.revenue)}`).join(' ');
    const areaD = `${pathD} L ${toX(data.length - 1)} ${toY(0)} L ${toX(0)} ${toY(0)} Z`;

    const monthLabel = (d) => {
        const m = MONTHS[(d._id?.month || 1) - 1]?.slice(0, 3) || '';
        return `${m} '${String(d._id?.year || '').slice(2)}`;
    };

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
            <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
            </defs>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((f) => {
                const y = toY(maxVal * f);
                return (
                    <g key={f}>
                        <line x1={padLeft} y1={y} x2={width - padRight} y2={y}
                            stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                        <text x={padLeft - 6} y={y + 4} textAnchor="end"
                            fill="rgba(255,255,255,0.3)" fontSize="9">
                            {maxVal * f >= 1000 ? `₹${(maxVal * f / 1000).toFixed(0)}k` : `₹${(maxVal * f).toFixed(0)}`}
                        </text>
                    </g>
                );
            })}
            {/* Area fill */}
            <path d={areaD} fill="url(#lineGrad)" />
            {/* Line */}
            <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Dots + labels */}
            {data.map((d, i) => (
                <g key={i}>
                    <circle cx={toX(i)} cy={toY(d.revenue)} r="4" fill="#6366f1" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                    {i % Math.max(1, Math.floor(data.length / 6)) === 0 && (
                        <text x={toX(i)} y={height - 4} textAnchor="middle"
                            fill="rgba(255,255,255,0.35)" fontSize="9">
                            {monthLabel(d)}
                        </text>
                    )}
                </g>
            ))}
        </svg>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// SVG DONUT CHART — Gateway / Plan Distribution
// ─────────────────────────────────────────────────────────────────────────────
const DonutChart = ({ data, size = 120, colors }) => {
    if (!data || data.length === 0) return (
        <div className="flex items-center justify-center" style={{ width: size, height: size }}>
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center">
                <span className="text-[9px] text-subtext">No data</span>
            </div>
        </div>
    );

    const total = data.reduce((s, d) => s + (d.revenue || d.count || 0), 0);
    const cx = size / 2, cy = size / 2, r = size * 0.38, innerR = size * 0.22;
    let angle = -Math.PI / 2;

    const segments = data.map((d, i) => {
        const val = d.revenue || d.count || 0;
        const frac = total > 0 ? val / total : 0;
        const sweep = frac * 2 * Math.PI;
        const x1 = cx + r * Math.cos(angle);
        const y1 = cy + r * Math.sin(angle);
        angle += sweep;
        const x2 = cx + r * Math.cos(angle);
        const y2 = cy + r * Math.sin(angle);
        const xi1 = cx + innerR * Math.cos(angle - sweep);
        const yi1 = cy + innerR * Math.sin(angle - sweep);
        const xi2 = cx + innerR * Math.cos(angle);
        const yi2 = cy + innerR * Math.sin(angle);
        const large = sweep > Math.PI ? 1 : 0;

        const color = colors ? colors[i % colors.length] : `hsl(${(i * 60 + 220) % 360}, 70%, 65%)`;

        return { d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${innerR} ${innerR} 0 ${large} 0 ${xi1} ${yi1} Z`, color, frac, val };
    });

    return (
        <svg width={size} height={size}>
            {segments.map((seg, i) => (
                <path key={i} d={seg.d} fill={seg.color} opacity="0.85" />
            ))}
            <text x={cx} y={cy + 4} textAnchor="middle" fill="white" fontSize={size * 0.1} fontWeight="800">
                {fmtNum(total)}
            </text>
        </svg>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// BAR CHART — Daily Revenue (last 30 days)
// ─────────────────────────────────────────────────────────────────────────────
const BarChart = ({ data, height = 80 }) => {
    if (!data || data.length === 0) return (
        <div className="flex items-center justify-center h-20 text-xs text-subtext">No data</div>
    );
    const maxVal = Math.max(...data.map(d => d.revenue), 1);
    const barW = Math.max(2, Math.floor(580 / (data.length + 1)));

    return (
        <svg viewBox={`0 0 600 ${height}`} className="w-full" style={{ height }}>
            {data.map((d, i) => {
                const barH = Math.max(2, (d.revenue / maxVal) * (height - 20));
                const x = 10 + i * (barW + 2);
                const y = height - barH - 4;
                return (
                    <rect key={i} x={x} y={y} width={barW} height={barH}
                        rx="2" fill="#6366f1" opacity="0.7" />
                );
            })}
        </svg>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB 1: FINANCE DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
const FinanceDashboardTab = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState(null); // { synced, skipped, errors }

    const load = useCallback(async (isManual = false) => {
        if (isManual) setRefreshing(true);
        try {
            const data = await apiService.getFinanceStats();
            setStats(data.stats);
        } catch (e) {
            console.error('Finance stats fetch error:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const handleSync = useCallback(async () => {
        setSyncing(true);
        setSyncResult(null);
        try {
            const result = await apiService.syncRazorpayPayments(90);
            setSyncResult(result.stats);
            // Reload stats after sync
            await load(false);
        } catch (e) {
            console.error('Razorpay sync error:', e);
            setSyncResult({ error: e?.response?.data?.message || e.message });
        } finally {
            setSyncing(false);
        }
    }, [load]);

    useEffect(() => { load(); }, [load]);

    if (loading) return <Spinner />;

    const s = stats || {};
    const growth = s.revenueGrowth ?? 0;
    const isGrowthUp = growth >= 0;

    // Build 12-month series filling missing months
    const buildMonthSeries = () => {
        const now = new Date();
        const series = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const found = (s.monthlyRevenueSeries || []).find(m => m._id.year === d.getFullYear() && m._id.month === d.getMonth() + 1);
            series.push({
                _id: { year: d.getFullYear(), month: d.getMonth() + 1 },
                revenue: found?.revenue || 0,
                count: found?.count || 0,
            });
        }
        return series;
    };

    const monthSeries = buildMonthSeries();
    const gatewayColors = (s.gatewayDistribution || []).map((g) => GATEWAY_COLORS[g._id]?.hex || '#6366f1');

    return (
        <div className="space-y-5">
            {/* Header: Title + Sync + Refresh */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <p className="text-xs font-bold text-subtext uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-primary" />
                        Live Finance Overview
                    </p>
                    {stats?.dataSource === 'subscriptions_fallback' && (
                        <p className="text-[10px] text-amber-400 mt-1 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Showing estimated data from subscriptions. Click "Sync Razorpay" for accurate amounts.
                        </p>
                    )}
                    {stats?.dataSource === 'invoices' && (
                        <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Showing verified data synced from Razorpay.
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {/* Sync Razorpay Button */}
                    <button
                        onClick={handleSync}
                        disabled={syncing || refreshing}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Sync payment data from Razorpay API"
                    >
                        <RotateCcw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                        {syncing ? 'Syncing…' : 'Sync Razorpay'}
                    </button>
                    {/* Refresh Button */}
                    <button onClick={() => load(true)} disabled={refreshing || syncing}
                        className="p-1.5 rounded-lg text-subtext hover:text-primary hover:bg-primary/10 transition-all disabled:opacity-50"
                        title="Refresh dashboard data"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Sync Result Banner */}
            <AnimatePresence>
                {syncResult && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border text-xs font-medium ${
                            syncResult.error
                                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            {syncResult.error
                                ? <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                : <CheckCircle className="w-4 h-4 flex-shrink-0" />
                            }
                            {syncResult.error
                                ? `Sync failed: ${syncResult.error}`
                                : `✓ Synced ${syncResult.synced} new payment${syncResult.synced !== 1 ? 's' : ''} · Skipped ${syncResult.skipped} (already synced) · ${syncResult.errors} error${syncResult.errors !== 1 ? 's' : ''}`
                            }
                        </div>
                        <button onClick={() => setSyncResult(null)} className="p-0.5 hover:opacity-70">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Revenue KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <KPICard icon={DollarSign} label="Total Revenue" value={fmt(s.totalRevenue)} color="primary" />
                <KPICard icon={TrendingUp} label="Today's Revenue" value={fmt(s.todayRevenue)} sub={`${fmtNum(s.todayTransactions)} txns`} color="emerald-400" />
                <KPICard icon={BarChart3} label="This Week" value={fmt(s.weekRevenue)} color="blue-400" />
                <KPICard icon={Calendar} label="This Month" value={fmt(s.monthRevenue)} sub={`${fmtNum(s.monthTransactions)} txns`} color="violet-400" trend={growth} trendUp={isGrowthUp} />
                <KPICard icon={TrendingUp} label="This Year" value={fmt(s.yearRevenue)} color="amber-400" />
            </div>

            {/* GST + Revenue Split */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KPICard icon={Percent} label="Total GST Collected" value={fmt(s.totalGst)} sub="18% CGST+SGST / IGST" color="amber-400" />
                <KPICard icon={Receipt} label="Net Revenue (Base)" value={fmt(s.netRevenue)} sub="Excl. GST" color="emerald-400" />
                <KPICard icon={DollarSign} label="Avg Order Value" value={fmt(s.avgOrderValue)} color="primary" />
                <KPICard icon={TrendingUp} label="Revenue Growth" value={`${isGrowthUp ? '+' : ''}${growth}%`} sub="vs last month" color={isGrowthUp ? 'emerald-400' : 'red-400'} />
            </div>

            {/* Transactions + Customers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KPICard icon={Activity} label="Total Transactions" value={fmtNum(s.totalTransactions)} color="primary" />
                <KPICard icon={CreditCard} label="Active Subscriptions" value={fmtNum(s.activeSubscriptions)} color="emerald-400" />
                <KPICard icon={Users} label="Total Customers" value={fmtNum(s.totalUsers)} sub={`+${s.newUsersThisMonth || 0} this month`} color="blue-400" />
                <KPICard icon={Activity} label="Cancelled Subs" value={fmtNum(s.cancelledSubscriptions)} color="red-400" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Monthly Revenue Line Chart */}
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-maintext">Monthly Revenue (12 Months)</h3>
                        <span className="text-[10px] text-subtext bg-white/5 px-2 py-0.5 rounded-lg">Line Chart</span>
                    </div>
                    <LineChart data={monthSeries} height={130} />
                </div>

                {/* Gateway Donut */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <h3 className="text-sm font-bold text-maintext mb-3">Gateway Distribution</h3>
                    <div className="flex items-center gap-4">
                        <DonutChart data={s.gatewayDistribution || []} size={100} colors={gatewayColors} />
                        <div className="space-y-1.5 flex-1 min-w-0">
                            {(s.gatewayDistribution || []).map((g, i) => {
                                const colors = GATEWAY_COLORS[g._id] || { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20', hex: '#6366f1' };
                                return (
                                    <div key={i} className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colors.hex }} />
                                            <span className={`text-[10px] font-bold ${colors.text} truncate uppercase`}>{g._id}</span>
                                        </div>
                                        <span className="text-[10px] text-subtext whitespace-nowrap">{g.count} txns</span>
                                    </div>
                                );
                            })}
                            {(!s.gatewayDistribution || s.gatewayDistribution.length === 0) && (
                                <p className="text-[10px] text-subtext">No payment data yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Bar Chart + Plan Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <h3 className="text-sm font-bold text-maintext mb-3">Daily Revenue (Last 30 Days)</h3>
                    <BarChart data={s.dailyRevenueSeries || []} height={80} />
                </div>

                {/* Plan Distribution */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <h3 className="text-sm font-bold text-maintext mb-3">Subscription Plan Revenue</h3>
                    <div className="space-y-2">
                        {(s.planDistribution || []).slice(0, 5).map((p, i) => {
                            const totalPlan = (s.planDistribution || []).reduce((s, d) => s + d.revenue, 0);
                            const pct = totalPlan > 0 ? Math.round((p.revenue / totalPlan) * 100) : 0;
                            return (
                                <div key={i} className="space-y-1">
                                    <div className="flex items-center justify-between text-[10px]">
                                        <span className="font-bold text-maintext truncate max-w-[120px]">{p._id || 'Unknown Plan'}</span>
                                        <span className="text-subtext ml-2">{fmt(p.revenue)} · {p.count} subs</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                        {(!s.planDistribution || s.planDistribution.length === 0) && (
                            <p className="text-xs text-subtext py-4 text-center">No plan data yet</p>
                        )}
                    </div>
                </div>
            </div>

            {/* GST Breakdown */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <h3 className="text-sm font-bold text-maintext mb-4">GST Breakdown (CA Report)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Taxable Base Amount', value: fmt(s.netRevenue), sub: 'Pre-tax revenue' },
                        { label: 'CGST Collected (9%)', value: fmt(s.totalCgst), sub: 'Central GST' },
                        { label: 'SGST Collected (9%)', value: fmt(s.totalSgst), sub: 'State GST' },
                        { label: 'IGST Collected (18%)', value: fmt(s.totalIgst), sub: 'Integrated GST' },
                    ].map((item, i) => (
                        <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5">
                            <p className="text-[10px] text-subtext uppercase tracking-wider">{item.label}</p>
                            <p className="text-base font-black text-maintext mt-1">{item.value}</p>
                            <p className="text-[10px] text-subtext/60 mt-0.5">{item.sub}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB 2: INVOICE LEDGER
// ─────────────────────────────────────────────────────────────────────────────
const InvoiceLedgerTab = () => {
    const [invoices, setInvoices] = useState([]);
    const [filterTotals, setFilterTotals] = useState(null);
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [filters, setFilters] = useState({
        search: '', gateway: '', status: '', month: '', year: '', startDate: '', endDate: '',
        sortBy: 'createdAt', sortOrder: 'desc', page: 1, limit: 20,
    });
    const debounceRef = useRef(null);

    const loadInvoices = useCallback(async (f = filters) => {
        setLoading(true);
        try {
            const params = {};
            Object.entries(f).forEach(([k, v]) => { if (v !== '') params[k] = v; });
            const data = await apiService.getFinanceInvoices(params);
            setInvoices(data.invoices || []);
            setFilterTotals(data.filterTotals);
            setPagination(data.pagination || { total: 0, page: 1, pages: 1 });
        } catch (e) {
            console.error('Invoice fetch error:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadInvoices(filters); }, [filters]);

    const updateFilter = (key, value) => {
        const newFilters = { ...filters, [key]: value, page: key === 'page' ? value : 1 };
        setFilters(newFilters);
    };

    const handleSearchChange = (val) => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            updateFilter('search', val);
        }, 400);
    };

    const handleExportCSV = async () => {
        setExporting(true);
        try {
            const params = {};
            ['gateway', 'status', 'month', 'year', 'startDate', 'endDate'].forEach(k => {
                if (filters[k]) params[k] = filters[k];
            });
            const response = await apiService.exportFinanceCSV(params);
            const month = filters.month ? String(filters.month).padStart(2, '0') : '';
            const year = filters.year || '';
            const filename = month && year
                ? `AISA_Invoices_${year}_${month}.csv`
                : `AISA_Invoices_${new Date().toISOString().split('T')[0]}.csv`;
            downloadBlob(response, filename);
        } catch (e) {
            console.error('Export failed:', e);
            alert('Export failed. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    const handleDownloadPDF = async (inv) => {
        try {
            const subId = inv.subscriptionId?._id || inv.subscriptionId;
            if (!subId) { alert('No subscription ID found for this invoice.'); return; }
            const response = await apiService.downloadInvoicePDF(subId);
            downloadBlob(response, `Invoice_${inv.invoiceNumber}.pdf`);
        } catch (e) {
            // If PDF endpoint not available, open URL
            if (inv.invoiceUrl) window.open(inv.invoiceUrl, '_blank');
            else alert('PDF not available for this invoice.');
        }
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    return (
        <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[180px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-subtext" />
                        <input
                            type="text"
                            placeholder="Search invoice, name, email, ID..."
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-maintext placeholder-subtext focus:outline-none focus:border-primary transition-all"
                        />
                    </div>

                    {/* Gateway */}
                    <select
                        value={filters.gateway}
                        onChange={(e) => updateFilter('gateway', e.target.value)}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-maintext focus:outline-none focus:border-primary transition-all"
                    >
                        <option value="">All Gateways</option>
                        <option value="razorpay">Razorpay</option>
                        <option value="paypal">PayPal</option>
                        <option value="apple_pay">Apple Pay</option>
                        <option value="play_store">Play Store</option>
                        <option value="app_store">App Store</option>
                    </select>

                    {/* Status */}
                    <select
                        value={filters.status}
                        onChange={(e) => updateFilter('status', e.target.value)}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-maintext focus:outline-none focus:border-primary transition-all"
                    >
                        <option value="">All Statuses</option>
                        <option value="captured">Captured</option>
                        <option value="success">Success</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                    </select>

                    {/* Month */}
                    <select
                        value={filters.month}
                        onChange={(e) => updateFilter('month', e.target.value)}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-maintext focus:outline-none focus:border-primary transition-all"
                    >
                        <option value="">All Months</option>
                        {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>

                    {/* Year */}
                    <select
                        value={filters.year}
                        onChange={(e) => updateFilter('year', e.target.value)}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-maintext focus:outline-none focus:border-primary transition-all"
                    >
                        <option value="">All Years</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>

                    {/* Clear */}
                    {(filters.gateway || filters.status || filters.month || filters.year || filters.search) && (
                        <button
                            onClick={() => setFilters({ search: '', gateway: '', status: '', month: '', year: '', startDate: '', endDate: '', sortBy: 'createdAt', sortOrder: 'desc', page: 1, limit: 20 })}
                            className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-400/10 rounded-xl border border-red-400/20 transition-all"
                        >
                            <X className="w-3 h-3" /> Clear
                        </button>
                    )}

                    {/* Export */}
                    <button
                        onClick={handleExportCSV}
                        disabled={exporting}
                        className="ml-auto flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    >
                        {exporting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                        Export CSV
                    </button>
                </div>

                {/* Filter Totals */}
                {filterTotals && (
                    <div className="flex items-center gap-4 pt-2 border-t border-white/5 text-[10px]">
                        <span className="text-subtext">{fmtNum(pagination.total)} invoices found</span>
                        <span className="text-maintext font-bold">Revenue: {fmt(filterTotals.totalRevenue)}</span>
                        <span className="text-subtext">Base: {fmt(filterTotals.totalBase)}</span>
                        <span className="text-amber-400 font-semibold">GST: {fmt(filterTotals.totalGst)}</span>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-white/10 text-subtext uppercase tracking-wider">
                                <th className="py-3 px-3 font-bold">Invoice #</th>
                                <th className="py-3 px-3 font-bold">Date</th>
                                <th className="py-3 px-3 font-bold">Customer</th>
                                <th className="py-3 px-3 font-bold">Plan</th>
                                <th className="py-3 px-3 font-bold text-right">Base</th>
                                <th className="py-3 px-3 font-bold text-right">GST</th>
                                <th className="py-3 px-3 font-bold text-right">Total</th>
                                <th className="py-3 px-3 font-bold">Gateway</th>
                                <th className="py-3 px-3 font-bold">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={9}><Spinner /></td></tr>
                            ) : invoices.length === 0 ? (
                                <tr><td colSpan={9} className="py-12 text-center text-subtext">No invoices found.</td></tr>
                            ) : invoices.map((inv) => {
                                const gstCalc = inv.gstAmount || ((inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0));
                                const planName = inv.subscriptionId?.planId?.planName || '—';
                                const status = inv.paymentStatus || 'captured';
                                const sc = STATUS_COLORS[status] || STATUS_COLORS['captured'];
                                const gc = GATEWAY_COLORS[inv.paymentGateway] || { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' };

                                return (
                                    <tr key={inv._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="py-3 px-3">
                                            <span className="font-mono font-bold text-primary text-[10px]">{inv.invoiceNumber}</span>
                                            <div className="text-[9px] text-subtext font-mono truncate max-w-[90px] mt-0.5" title={inv.paymentId}>{inv.paymentId}</div>
                                        </td>
                                        <td className="py-3 px-3 text-subtext whitespace-nowrap">
                                            {new Date(inv.invoiceDate || inv.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="py-3 px-3">
                                            <div className="font-semibold text-maintext">{inv.billingDetails?.name || inv.userId?.name || 'N/A'}</div>
                                            <div className="text-[10px] text-subtext">{inv.userId?.email || '—'}</div>
                                            {inv.billingDetails?.companyName && <div className="text-[9px] text-subtext/60">{inv.billingDetails.companyName}</div>}
                                        </td>
                                        <td className="py-3 px-3">
                                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-primary/10 text-primary border border-primary/10">{planName}</span>
                                        </td>
                                        <td className="py-3 px-3 text-right font-medium text-maintext">{fmt(inv.baseAmount)}</td>
                                        <td className="py-3 px-3 text-right text-subtext">
                                            {fmt(gstCalc)}
                                            <div className="text-[9px] opacity-60">{(inv.igst || 0) > 0 ? 'IGST' : 'C+S GST'}</div>
                                        </td>
                                        <td className="py-3 px-3 text-right font-black text-maintext">{fmt(inv.totalAmount)}</td>
                                        <td className="py-3 px-3">
                                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${gc.bg} ${gc.text} border ${gc.border}`}>
                                                {inv.paymentGateway}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3">
                                            <span className={`flex items-center gap-1 text-[10px] font-semibold ${sc.text}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                                {status}
                                            </span>
                                        </td>

                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 text-xs">
                        <span className="text-subtext">Page {pagination.page} of {pagination.pages} · {fmtNum(pagination.total)} records</span>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={pagination.page <= 1}
                                onClick={() => updateFilter('page', pagination.page - 1)}
                                className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-40 transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                disabled={pagination.page >= pagination.pages}
                                onClick={() => updateFilter('page', pagination.page + 1)}
                                className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-40 transition-all"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB 3: MONTHLY REPORTS
// ─────────────────────────────────────────────────────────────────────────────
const MonthlyReportsTab = () => {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    const loadReport = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiService.getMonthlyReport(month, year);
            setReport(data.report);
        } catch (e) {
            console.error('Monthly report error:', e);
        } finally {
            setLoading(false);
        }
    }, [month, year]);

    useEffect(() => { loadReport(); }, [loadReport]);

    const handleExportCSV = async () => {
        setExporting(true);
        try {
            const response = await apiService.exportFinanceCSV({ month, year });
            downloadBlob(response, `AISA_Report_${year}_${String(month).padStart(2, '0')}.csv`);
        } catch (e) {
            console.error('Export failed:', e);
        } finally {
            setExporting(false);
        }
    };

    const handleExportExcel = () => {
        if (!report || !report.invoices) return;
        try {
            const XLSX = window.XLSX || require('xlsx');
            // Build worksheet data
            const header = ['Invoice #', 'Date', 'Customer', 'Email', 'Company', 'GSTIN', 'Plan', 'Gateway', 'Payment ID', 'Base (₹)', 'CGST (₹)', 'SGST (₹)', 'IGST (₹)', 'GST Total (₹)', 'Total (₹)', 'Status'];
            const rows = report.invoices.map(inv => {
                const gst = inv.gstAmount || ((inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0));
                return [
                    inv.invoiceNumber,
                    new Date(inv.invoiceDate || inv.createdAt).toLocaleDateString('en-IN'),
                    inv.billingDetails?.name || inv.userId?.name || 'N/A',
                    inv.userId?.email || 'N/A',
                    inv.billingDetails?.companyName || '',
                    inv.billingDetails?.gstin || '',
                    inv.subscriptionId?.planId?.planName || 'N/A',
                    inv.paymentGateway,
                    inv.paymentId,
                    inv.baseAmount || 0,
                    inv.cgst || 0,
                    inv.sgst || 0,
                    inv.igst || 0,
                    gst,
                    inv.totalAmount || 0,
                    inv.paymentStatus || 'captured',
                ];
            });

            import('xlsx').then(XLSX => {
                const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, report.period);
                XLSX.writeFile(wb, `AISA_Report_${year}_${String(month).padStart(2, '0')}.xlsx`);
            });
        } catch (e) {
            console.error('XLSX export failed:', e);
            handleExportCSV(); // fallback to CSV
        }
    };

    const handlePrintReport = () => window.print();

    const currentYear = now.getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    const s = report?.summary || {};

    return (
        <div className="space-y-4">
            {/* Month/Year Selector */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                    <select
                        value={month}
                        onChange={(e) => setMonth(parseInt(e.target.value))}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-maintext font-bold focus:outline-none focus:border-primary transition-all"
                    >
                        {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>
                    <select
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-maintext font-bold focus:outline-none focus:border-primary transition-all"
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <button onClick={loadReport} disabled={loading}
                        className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-sm font-bold transition-all disabled:opacity-50">
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Load
                    </button>
                </div>

                {report && (
                    <div className="flex items-center gap-2 ml-auto">
                        <button onClick={handleExportCSV} disabled={exporting}
                            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold transition-all disabled:opacity-50">
                            {exporting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                            CSV
                        </button>
                        <button onClick={handleExportExcel}
                            className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl text-xs font-bold transition-all">
                            <FileSpreadsheet className="w-3 h-3" />
                            Excel
                        </button>
                    </div>
                )}
            </div>

            {loading && <Spinner />}

            {!loading && report && (
                <div className="space-y-4" id="finance-monthly-report">
                    {/* Report Header Banner */}
                    <div className="bg-gradient-to-r from-primary/10 via-violet-500/10 to-primary/5 border border-primary/20 rounded-2xl p-5">
                        <div className="flex items-start justify-between flex-wrap gap-3">
                            <div>
                                <h2 className="text-xl font-black text-maintext">{report.period} — Monthly Report</h2>
                                <p className="text-xs text-subtext mt-1">Generated at {new Date(report.generatedAt).toLocaleString('en-IN')} · For Chartered Accountant</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-primary">{fmt(s.totalRevenue)}</p>
                                <p className="text-xs text-subtext">Total Revenue · {s.count} transactions</p>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {[
                            { label: 'Total Sales', value: fmt(s.totalRevenue), color: 'primary' },
                            { label: 'Taxable Base', value: fmt(s.totalBase), color: 'emerald-400' },
                            { label: 'GST Collected', value: fmt(s.totalGst), color: 'amber-400' },
                            { label: 'CGST (9%)', value: fmt(s.totalCgst), color: 'blue-400' },
                            { label: 'SGST (9%)', value: fmt(s.totalSgst), color: 'violet-400' },
                            { label: 'IGST (18%)', value: fmt(s.totalIgst), color: 'pink-400' },
                        ].map((item, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                                <p className="text-[10px] text-subtext uppercase tracking-wide">{item.label}</p>
                                <p className={`text-sm font-black mt-1 text-${item.color}`}>{item.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Gateway + Plan Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Gateway */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-white/10">
                                <h3 className="text-sm font-bold text-maintext">Payment Gateway Breakdown</h3>
                            </div>
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="py-2 px-4 text-left text-subtext font-semibold">Gateway</th>
                                        <th className="py-2 px-4 text-right text-subtext font-semibold">Txns</th>
                                        <th className="py-2 px-4 text-right text-subtext font-semibold">Revenue</th>
                                        <th className="py-2 px-4 text-right text-subtext font-semibold">GST</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(report.gatewayBreakdown || []).map((g, i) => {
                                        const gc = GATEWAY_COLORS[g._id] || { text: 'text-primary' };
                                        return (
                                            <tr key={i} className="border-b border-white/5">
                                                <td className={`py-2.5 px-4 font-bold uppercase text-[10px] ${gc.text}`}>{g._id}</td>
                                                <td className="py-2.5 px-4 text-right text-subtext">{g.count}</td>
                                                <td className="py-2.5 px-4 text-right font-semibold text-maintext">{fmt(g.revenue)}</td>
                                                <td className="py-2.5 px-4 text-right text-amber-400">{fmt(g.gst)}</td>
                                            </tr>
                                        );
                                    })}
                                    {(!report.gatewayBreakdown || report.gatewayBreakdown.length === 0) && (
                                        <tr><td colSpan={4} className="py-6 text-center text-subtext">No data</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Plan */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-white/10">
                                <h3 className="text-sm font-bold text-maintext">Subscription Plan Breakdown</h3>
                            </div>
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="py-2 px-4 text-left text-subtext font-semibold">Plan</th>
                                        <th className="py-2 px-4 text-right text-subtext font-semibold">Subs</th>
                                        <th className="py-2 px-4 text-right text-subtext font-semibold">Revenue</th>
                                        <th className="py-2 px-4 text-right text-subtext font-semibold">GST</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(report.planBreakdown || []).map((p, i) => (
                                        <tr key={i} className="border-b border-white/5">
                                            <td className="py-2.5 px-4 font-bold text-maintext text-[11px]">{p._id || 'Unknown'}</td>
                                            <td className="py-2.5 px-4 text-right text-subtext">{p.count}</td>
                                            <td className="py-2.5 px-4 text-right font-semibold text-primary">{fmt(p.revenue)}</td>
                                            <td className="py-2.5 px-4 text-right text-amber-400">{fmt(p.gst)}</td>
                                        </tr>
                                    ))}
                                    {(!report.planBreakdown || report.planBreakdown.length === 0) && (
                                        <tr><td colSpan={4} className="py-6 text-center text-subtext">No data</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Invoice List for Month */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-maintext">All Invoices — {report.period}</h3>
                            <span className="text-xs text-subtext">{report.invoices?.length || 0} invoices</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-white/5 text-subtext uppercase tracking-wider">
                                        <th className="py-2.5 px-4 font-semibold">Invoice #</th>
                                        <th className="py-2.5 px-4 font-semibold">Date</th>
                                        <th className="py-2.5 px-4 font-semibold">Customer</th>
                                        <th className="py-2.5 px-4 font-semibold">Plan</th>
                                        <th className="py-2.5 px-4 text-right font-semibold">Base</th>
                                        <th className="py-2.5 px-4 text-right font-semibold">GST</th>
                                        <th className="py-2.5 px-4 text-right font-semibold">Total</th>
                                        <th className="py-2.5 px-4 font-semibold">Gateway</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(report.invoices || []).map((inv) => {
                                        const gst = inv.gstAmount || ((inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0));
                                        const gc = GATEWAY_COLORS[inv.paymentGateway] || { text: 'text-primary' };
                                        return (
                                            <tr key={inv._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                                <td className="py-2.5 px-4 font-mono font-bold text-primary text-[10px]">{inv.invoiceNumber}</td>
                                                <td className="py-2.5 px-4 text-subtext whitespace-nowrap">{new Date(inv.invoiceDate || inv.createdAt).toLocaleDateString('en-IN')}</td>
                                                <td className="py-2.5 px-4">
                                                    <div className="font-semibold text-maintext">{inv.billingDetails?.name || inv.userId?.name || 'N/A'}</div>
                                                    <div className="text-[9px] text-subtext">{inv.userId?.email}</div>
                                                </td>
                                                <td className="py-2.5 px-4 text-subtext">{inv.subscriptionId?.planId?.planName || '—'}</td>
                                                <td className="py-2.5 px-4 text-right">{fmt(inv.baseAmount)}</td>
                                                <td className="py-2.5 px-4 text-right text-amber-400">{fmt(gst)}</td>
                                                <td className="py-2.5 px-4 text-right font-bold text-maintext">{fmt(inv.totalAmount)}</td>
                                                <td className={`py-2.5 px-4 font-bold uppercase text-[9px] ${gc.text}`}>{inv.paymentGateway}</td>
                                            </tr>
                                        );
                                    })}
                                    {(!report.invoices || report.invoices.length === 0) && (
                                        <tr><td colSpan={8} className="py-8 text-center text-subtext">No invoices for this period</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// ROOT: FINANCE TAB
// ─────────────────────────────────────────────────────────────────────────────
const FinanceTab = () => {
    const [activeSubTab, setActiveSubTab] = useState('dashboard');

    const subTabs = [
        { id: 'dashboard', label: 'Finance Dashboard', icon: TrendingUp },
        { id: 'invoices', label: 'Invoice Ledger', icon: Receipt },
        { id: 'reports', label: 'Monthly Reports', icon: FileSpreadsheet },
    ];

    const renderSubTab = () => {
        switch (activeSubTab) {
            case 'dashboard': return <FinanceDashboardTab />;
            case 'invoices': return <InvoiceLedgerTab />;
            case 'reports': return <MonthlyReportsTab />;
            default: return <FinanceDashboardTab />;
        }
    };

    return (
        <div className="space-y-4">
            {/* Sub-tab Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {subTabs.map(tab => (
                    <SubTab
                        key={tab.id}
                        id={tab.id}
                        label={tab.label}
                        icon={tab.icon}
                        active={activeSubTab === tab.id}
                        onClick={setActiveSubTab}
                    />
                ))}
            </div>

            {/* Sub-tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeSubTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                >
                    {renderSubTab()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default FinanceTab;
