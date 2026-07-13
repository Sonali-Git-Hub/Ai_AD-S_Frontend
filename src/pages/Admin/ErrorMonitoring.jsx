import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle, CheckCircle, TrendingUp, Clock, User, RefreshCw, Search,
    Filter, ArrowUpRight, Activity, Code, Copy, ExternalLink, Info, Check,
    X, ChevronRight, Play, Eye, BookOpen, AlertCircle, Database, ShieldAlert,
    Cpu, Laptop, Mail, Calendar, GitPullRequest, GitCommit, Settings2, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../../services/apiService';

// Custom Badge components for cleaner UI
const SeverityBadge = ({ severity }) => {
    let style = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    if (severity === 'Critical') style = 'bg-red-500/15 text-red-400 border-red-500/30';
    else if (severity === 'High') style = 'bg-orange-500/15 text-orange-400 border-orange-500/30';
    else if (severity === 'Medium') style = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    else if (severity === 'Low') style = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    else if (severity === 'Info') style = 'bg-slate-500/10 text-slate-300 border-slate-500/20';

    return (
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border whitespace-nowrap ${style}`}>
            {severity}
        </span>
    );
};

const StatusBadge = ({ status }) => {
    let style = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    if (status === 'New') style = 'bg-red-500/10 text-red-400 border-red-500/20';
    else if (status === 'Open') style = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    else if (status === 'Assigned') style = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    else if (status === 'In Progress') style = 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    else if (status === 'Monitoring') style = 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    else if (status === 'Resolved') style = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    else if (status === 'Closed') style = 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    else if (status === 'Ignored') style = 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';

    return (
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border whitespace-nowrap ${style}`}>
            {status}
        </span>
    );
};

const ComponentBadge = ({ component }) => {
    let style = 'bg-slate-500/10 text-slate-300 border-slate-500/10';
    if (component === 'Database') style = 'bg-amber-500/10 text-amber-300 border-amber-500/10';
    else if (component === 'Auth') style = 'bg-indigo-500/10 text-indigo-300 border-indigo-500/10';
    else if (component === 'Payment') style = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/10';
    else if (component === 'Frontend') style = 'bg-blue-500/10 text-blue-300 border-blue-500/10';

    return (
        <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${style}`}>
            {component}
        </span>
    );
};

const ErrorMonitoring = () => {
    // List state
    const [incidents, setIncidents] = useState([]);
    const [kpis, setKpis] = useState(null);
    const [charts, setCharts] = useState(null);
    const [loading, setLoading] = useState(true);
    const [kpisLoading, setKpisLoading] = useState(true);
    const [kpiError, setKpiError] = useState(null);
    const [listError, setListError] = useState(null);
    
    // Config states
    const [activeSection, setActiveSection] = useState('active'); // 'active' or 'history'
    const [search, setSearch] = useState('');
    const [filterSeverity, setFilterSeverity] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterModule, setFilterModule] = useState('');
    const [filterEnvironment, setFilterEnvironment] = useState('');
    const [range, setRange] = useState('7d');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });

    // Drawer state
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [selectedIncidentDetail, setSelectedIncidentDetail] = useState(null);
    const [occurrences, setOccurrences] = useState([]);
    const [drawerTab, setDrawerTab] = useState('overview'); // 'overview', 'timeline', 'replay'

    // Replay state
    const [activeReplaySession, setActiveReplaySession] = useState(null);
    const [replayData, setReplayData] = useState(null);
    const [replayLoading, setReplayLoading] = useState(false);

    // Dialog state
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [resolveModalOpen, setResolveModalOpen] = useState(false);
    const [assigneeName, setAssigneeName] = useState('');
    
    // Resolve Form state
    const [resolveForm, setResolveForm] = useState({
        rootCause: '',
        resolutionSummary: '',
        commitHash: '',
        pullRequest: '',
        releaseVersion: '1.0.1',
        notes: ''
    });

    const fetchKPIs = async () => {
        setKpisLoading(true);
        setKpiError(null);
        try {
            const res = await apiService.getIncidentKPIs({ range });
            if (res.success) {
                setKpis(res.kpis);
                setCharts(res.charts);
            } else {
                setKpiError(res.message || 'Failed to fetch KPIs');
            }
        } catch (err) {
            console.error('Failed to load KPIs:', err);
            const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Connection failed';
            setKpiError(errMsg);
        } finally {
            setKpisLoading(false);
        }
    };

    const fetchIncidentsList = async (targetPage = 1) => {
        setLoading(true);
        setListError(null);
        try {
            const res = await apiService.getIncidents({
                statusType: activeSection,
                severity: filterSeverity,
                status: filterStatus,
                module: filterModule,
                environment: filterEnvironment,
                search,
                range,
                page: targetPage,
                limit: 10
            });
            if (res.success) {
                setIncidents(res.incidents);
                setPagination(res.pagination);
                setPage(targetPage);
            } else {
                setListError(res.message || 'Failed to fetch incidents list');
            }
        } catch (err) {
            console.error('Failed to fetch incidents:', err);
            const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Connection failed';
            setListError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    const fetchIncidentDetail = async (incidentId) => {
        setDetailLoading(true);
        setDrawerTab('overview');
        setActiveReplaySession(null);
        setReplayData(null);
        try {
            const res = await apiService.getIncidentDetails(incidentId);
            if (res.success) {
                setSelectedIncidentDetail(res.incident);
                setOccurrences(res.occurrences);
            }
        } catch (err) {
            console.error('Failed to fetch details:', err);
            toast.error('Failed to load details');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!assigneeName.trim()) {
            toast.error('Please input developer name');
            return;
        }
        try {
            const res = await apiService.assignIncident(selectedIncidentDetail._id, null, assigneeName.trim());
            if (res.success) {
                toast.success(`Assigned to ${assigneeName}`);
                setSelectedIncidentDetail(res.incident);
                fetchIncidentsList(page);
                setAssignModalOpen(false);
                setAssigneeName('');
            }
        } catch (err) {
            toast.error('Assignment failed');
        }
    };

    const handleResolve = async () => {
        if (!resolveForm.rootCause.trim() || !resolveForm.resolutionSummary.trim()) {
            toast.error('Root Cause and Resolution Summary are required');
            return;
        }
        try {
            const res = await apiService.resolveIncident(selectedIncidentDetail._id, {
                rootCause: resolveForm.rootCause,
                resolutionSummary: resolveForm.resolutionSummary,
                commitHash: resolveForm.commitHash,
                pullRequest: resolveForm.pullRequest,
                releaseVersion: resolveForm.releaseVersion,
                notes: resolveForm.notes
            });
            if (res.success) {
                toast.success('Incident resolved successfully!');
                setSelectedIncidentDetail(res.incident);
                fetchIncidentsList(page);
                fetchKPIs();
                setResolveModalOpen(false);
                // If it resolves, it will move from active list, so close drawer
                setSelectedIncident(null);
            }
        } catch (err) {
            toast.error('Failed to resolve incident');
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            const notes = prompt(`Enter notes for changing status to ${newStatus}:`);
            const res = await apiService.updateIncidentStatus(selectedIncidentDetail._id, newStatus, notes || '');
            if (res.success) {
                toast.success(`Status updated to ${newStatus}`);
                setSelectedIncidentDetail(res.incident);
                fetchIncidentsList(page);
                fetchKPIs();
            }
        } catch (err) {
            toast.error('Status update failed');
        }
    };

    const loadSessionReplay = async (sessionId) => {
        setActiveReplaySession(sessionId);
        setReplayLoading(true);
        try {
            const res = await apiService.getSessionReplayDetails(sessionId);
            if (res.success) {
                setReplayData(res);
            }
        } catch (err) {
            console.error('Replay error:', err);
            toast.error('Failed to load session history');
        } finally {
            setReplayLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Stack trace copied!');
    };

    useEffect(() => {
        fetchKPIs();
    }, [range]);

    useEffect(() => {
        fetchIncidentsList(1);
    }, [activeSection, filterSeverity, filterStatus, filterModule, filterEnvironment, search, range]);

    // Format Dates nicely
    const formatTime = (val) => {
        if (!val) return '—';
        return new Date(val).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };

    return (
        <div className="space-y-6 text-maintext">
            {/* KPI Metrics Dashboard Panel */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                    {
                        label: 'Platform Health',
                        value: kpisLoading ? '…' : kpiError ? 'N/A' : `${kpis?.platformHealth ?? 100}%`,
                        icon: Activity,
                        color: kpiError ? 'text-slate-400 border-white/10 bg-white/5' : (kpis?.platformHealth > 90 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : kpis?.platformHealth > 75 ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'),
                        desc: 'Session success score'
                    },
                    {
                        label: 'Active Incidents',
                        value: kpisLoading ? '…' : kpiError ? 'N/A' : (kpis?.activeIncidents ?? 0),
                        icon: AlertTriangle,
                        color: kpiError ? 'text-slate-400 border-white/10 bg-white/5' : (kpis?.activeIncidents > 0 ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'),
                        desc: 'Requires engineering attention'
                    },
                    {
                        label: 'Critical / High',
                        value: kpisLoading ? '…' : kpiError ? 'N/A' : (kpis?.criticalIncidents ?? 0),
                        icon: ShieldAlert,
                        color: kpiError ? 'text-slate-400 border-white/10 bg-white/5' : (kpis?.criticalIncidents > 0 ? 'text-red-400 bg-red-500/10 border-red-500/20 animate-pulse' : 'text-slate-400 bg-slate-500/5 border-slate-500/10'),
                        desc: 'High severity active groups'
                    },
                    {
                        label: 'Resolution Rate',
                        value: kpisLoading ? '…' : kpiError ? 'N/A' : `${kpis?.resolutionRate ?? 100}%`,
                        icon: CheckCircle,
                        color: kpiError ? 'text-slate-400 border-white/10 bg-white/5' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                        desc: 'Incident fix ratio'
                    },
                    {
                        label: 'Avg Detect Time (MTTD)',
                        value: kpisLoading ? '…' : kpiError ? 'N/A' : (kpis?.mttd || '—'),
                        icon: Clock,
                        color: kpiError ? 'text-slate-400 border-white/10 bg-white/5' : 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                        desc: 'Heuristic discovery speed'
                    },
                    {
                        label: 'Avg Resolve Time (MTTR)',
                        value: kpisLoading ? '…' : kpiError ? 'N/A' : (kpis?.mttr || '—'),
                        icon: Clock,
                        color: kpiError ? 'text-slate-400 border-white/10 bg-white/5' : 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
                        desc: 'Mean engineering fix rate'
                    }
                ].map((item, i) => (
                    <div key={i} className="bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-primary/20 transition-all group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center justify-between relative z-10">
                            <span className="text-[10px] font-extrabold text-subtext uppercase tracking-widest leading-none">{item.label}</span>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${item.color}`}>
                                <item.icon className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-maintext tracking-tight mt-4 relative z-10 leading-none">{item.value}</p>
                        <p className="text-[9px] text-subtext/70 mt-1 relative z-10 leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>

            {/* Layout Split: Search, Filters, and Table on left; Charts on right (collapsible on mobile) */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Incidents Card Container (Left/Main Column) */}
                <div className="xl:col-span-2 bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-2xl p-4 flex flex-col space-y-4">
                    {/* Header: Section Tabs + Range + Reset */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                        <div className="flex bg-white/10 dark:bg-black/20 p-1 rounded-xl border border-white/10 self-start">
                            <button
                                onClick={() => setActiveSection('active')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    activeSection === 'active' 
                                        ? 'bg-primary text-white shadow-md' 
                                        : 'text-subtext hover:text-maintext'
                                }`}
                            >
                                Active Incidents
                                <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${activeSection === 'active' ? 'bg-white/20 text-white' : 'bg-white/10 text-subtext'}`}>
                                    {incidents.length}
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveSection('history')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    activeSection === 'history' 
                                        ? 'bg-primary text-white shadow-md' 
                                        : 'text-subtext hover:text-maintext'
                                }`}
                            >
                                Resolved & History
                            </button>
                        </div>

                        {/* Top Range Selector */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                            <div className="flex bg-white/10 dark:bg-black/20 p-0.5 rounded-lg border border-white/5">
                                {[
                                    { id: '24h', label: '24h' },
                                    { id: '7d', label: '7d' },
                                    { id: '30d', label: '30d' },
                                    { id: 'all', label: 'All Time' }
                                ].map(r => (
                                    <button
                                        key={r.id}
                                        onClick={() => setRange(r.id)}
                                        className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                                            range === r.id ? 'bg-primary/20 text-primary border border-primary/20' : 'text-subtext hover:text-maintext'
                                        }`}
                                    >
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                            <button 
                                onClick={() => { fetchIncidentsList(page); fetchKPIs(); }} 
                                className="p-1.5 rounded bg-white/10 dark:bg-white/5 border border-white/10 hover:bg-primary/10 text-primary transition-all"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Search & Filter Rows */}
                    <div className="flex flex-col md:flex-row gap-2">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-subtext" />
                            <input
                                type="text"
                                placeholder="Search by Message, ID, Session, User or API route..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-white/10 dark:bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:border-primary/50 transition-all placeholder:text-subtext/40"
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-subtext hover:text-maintext text-[10px] font-black uppercase">Clear</button>
                            )}
                        </div>
                        
                        {/* Filter Selectors */}
                        <div className="flex flex-wrap gap-2">
                            {/* Severity */}
                            <select
                                value={filterSeverity}
                                onChange={e => setFilterSeverity(e.target.value)}
                                className="bg-white/10 dark:bg-black/20 border border-white/10 rounded-xl px-2 py-2 text-[11px] font-semibold focus:border-primary/50 outline-none text-maintext"
                            >
                                <option value="" className="dark:bg-zinc-900">All Severity</option>
                                <option value="Critical" className="dark:bg-zinc-900 text-red-400">Critical</option>
                                <option value="High" className="dark:bg-zinc-900 text-orange-400">High</option>
                                <option value="Medium" className="dark:bg-zinc-900 text-amber-400">Medium</option>
                                <option value="Low" className="dark:bg-zinc-900 text-blue-400">Low</option>
                                <option value="Info" className="dark:bg-zinc-900 text-slate-300">Info</option>
                            </select>

                            {/* Status */}
                            <select
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                                className="bg-white/10 dark:bg-black/20 border border-white/10 rounded-xl px-2 py-2 text-[11px] font-semibold focus:border-primary/50 outline-none text-maintext"
                            >
                                <option value="" className="dark:bg-zinc-900">All Status</option>
                                {activeSection === 'active' ? (
                                    <>
                                        <option value="New" className="dark:bg-zinc-900">New</option>
                                        <option value="Open" className="dark:bg-zinc-900">Open</option>
                                        <option value="Assigned" className="dark:bg-zinc-900">Assigned</option>
                                        <option value="In Progress" className="dark:bg-zinc-900">In Progress</option>
                                        <option value="Monitoring" className="dark:bg-zinc-900">Monitoring</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="Resolved" className="dark:bg-zinc-900">Resolved</option>
                                        <option value="Closed" className="dark:bg-zinc-900">Closed</option>
                                        <option value="Ignored" className="dark:bg-zinc-900">Ignored</option>
                                    </>
                                )}
                            </select>

                            {/* Module */}
                            <select
                                value={filterModule}
                                onChange={e => setFilterModule(e.target.value)}
                                className="bg-white/10 dark:bg-black/20 border border-white/10 rounded-xl px-2 py-2 text-[11px] font-semibold focus:border-primary/50 outline-none text-maintext"
                            >
                                <option value="" className="dark:bg-zinc-900">All Modules</option>
                                <option value="General" className="dark:bg-zinc-900">General</option>
                                <option value="LEGAL_TOOLKIT" className="dark:bg-zinc-900">AI Legal</option>
                                <option value="AI_SOCIAL_MEDIA" className="dark:bg-zinc-900">Social Media</option>
                                <option value="AI_PERSONAL_ASSISTANT" className="dark:bg-zinc-900">Personal Assistant</option>
                                <option value="AI_BASE" className="dark:bg-zinc-900">AI Base</option>
                            </select>
                        </div>
                    </div>

                    {/* Incidents Table / List View */}
                    <div className="overflow-x-auto rounded-xl border border-white/10">
                        <table className="w-full text-left border-collapse text-xs min-w-[900px]">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5 text-subtext uppercase tracking-wider text-[10px] font-bold">
                                    <th className="py-2.5 px-3 w-[85px] whitespace-nowrap">Severity</th>
                                    <th className="py-2.5 px-3 whitespace-nowrap">Incident / Error Message</th>
                                    <th className="py-2.5 px-3 w-[100px] whitespace-nowrap">Component</th>
                                    <th className="py-2.5 px-3 w-[120px] whitespace-nowrap">Module/Route</th>
                                    <th className="py-2.5 px-3 text-center w-[80px] whitespace-nowrap">Events</th>
                                    <th className="py-2.5 px-3 text-center w-[85px] whitespace-nowrap">Sessions</th>
                                    <th className="py-2.5 px-3 w-[120px] whitespace-nowrap">Last Seen</th>
                                    <th className="py-2.5 px-3 w-[90px] whitespace-nowrap">Status</th>
                                    <th className="py-2.5 px-3 w-[110px] whitespace-nowrap">Assignee</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="border-b border-white/5 animate-pulse">
                                            {Array.from({ length: 9 }).map((_, j) => (
                                                <td key={j} className="py-4 px-3"><div className="h-2.5 bg-white/10 rounded w-full" /></td>
                                            ))}
                                        </tr>
                                    ))
                                ) : listError ? (
                                    <tr>
                                        <td colSpan={9} className="py-12 text-center text-red-400 font-bold">
                                            Failed to load active incidents: {listError}
                                        </td>
                                    </tr>
                                ) : incidents.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="py-12 text-center text-subtext italic">
                                            No incidents found matching current filters. Uptime is healthy 🟢
                                        </td>
                                    </tr>
                                ) : (
                                    incidents.map((inc) => {
                                        // Only Critical and High titles/messages should look alarming
                                        const isHighAlert = inc.severity === 'Critical' || inc.severity === 'High';
                                        
                                        return (
                                            <tr 
                                                key={inc._id} 
                                                onClick={() => { setSelectedIncident(inc._id); fetchIncidentDetail(inc._id); }}
                                                className="border-b border-white/5 hover:bg-primary/5 cursor-pointer transition-colors"
                                            >
                                                <td className="py-3 px-3">
                                                    <SeverityBadge severity={inc.severity} />
                                                </td>
                                                <td className="py-3 px-3 min-w-[200px]">
                                                    <div className={`font-bold text-xs truncate max-w-[250px] ${isHighAlert ? 'text-red-400/90' : 'text-maintext'}`} title={inc.title}>
                                                        {inc.title}
                                                    </div>
                                                    <div className="text-[10px] text-subtext/70 truncate max-w-[250px] font-mono mt-0.5" title={inc.errorMessage}>
                                                        {inc.errorMessage}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <ComponentBadge component={inc.component} />
                                                </td>
                                                <td className="py-3 px-3">
                                                    <div className="text-[10px] text-maintext truncate font-semibold max-w-[100px]">{inc.toolModule}</div>
                                                    {inc.apiRoute && (
                                                        <div className="text-[9px] text-subtext/60 truncate max-w-[100px] font-mono mt-0.5" title={`${inc.apiMethod} ${inc.apiRoute}`}>
                                                            {inc.apiMethod} {inc.apiRoute}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3 px-3 text-center font-mono font-bold text-maintext">{inc.totalOccurrences}</td>
                                                <td className="py-3 px-3 text-center font-mono text-subtext">{inc.affectedSessions?.length || 0}</td>
                                                <td className="py-3 px-3 text-subtext font-mono text-[10px]">
                                                    {new Date(inc.lastSeen).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                    <div className="text-[9px] opacity-60">
                                                        {new Date(inc.lastSeen).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <StatusBadge status={inc.status} />
                                                </td>
                                                <td className="py-3 px-3 text-subtext truncate max-w-[100px] font-medium">
                                                    {inc.assignedToName || 'Unassigned'}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Strip */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between text-[11px] text-subtext border-t border-white/5 pt-3 mt-1">
                            <span>Page {pagination.page} of {pagination.totalPages} · {pagination.total} groups</span>
                            <div className="flex items-center gap-1.5">
                                <button
                                    disabled={pagination.page <= 1 || loading}
                                    onClick={() => fetchIncidentsList(pagination.page - 1)}
                                    className="p-1 px-2.5 rounded bg-white/5 hover:bg-primary/10 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    Prev
                                </button>
                                <span className="font-bold text-maintext px-1">{pagination.page}</span>
                                <button
                                    disabled={pagination.page >= pagination.totalPages || loading}
                                    onClick={() => fetchIncidentsList(pagination.page + 1)}
                                    className="p-1 px-2.5 rounded bg-white/5 hover:bg-primary/10 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right DevOps Graphics/Charts Panel */}
                <div className="bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-2xl p-4 flex flex-col space-y-5">
                    <h3 className="font-bold text-sm text-maintext border-b border-white/10 pb-2.5 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" /> DevOps Metrics & Telemetry
                    </h3>

                    {kpiError ? (
                        <div className="py-16 text-center text-xs text-red-400/90 flex flex-col items-center gap-2 bg-white/5 border border-white/5 rounded-xl p-4">
                            <AlertCircle className="w-6 h-6 text-red-400" />
                            <p className="font-bold text-[11px]">Failed to load telemetry</p>
                            <span className="text-[9px] text-subtext/60 font-mono break-all">{kpiError}</span>
                        </div>
                    ) : charts ? (
                        <>
                            {/* Chart 1: Errors by Module */}
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold text-subtext uppercase tracking-widest">Incidents by Module</span>
                                <div className="space-y-1.5 bg-black/10 dark:bg-black/35 p-3 rounded-xl border border-white/5">
                                    {charts.errorsByModule.length === 0 ? (
                                        <p className="text-[10px] text-subtext italic">No data logged</p>
                                    ) : (
                                        charts.errorsByModule.slice(0, 4).map((mod, i) => {
                                            const total = charts.errorsByModule.reduce((acc, c) => acc + c.value, 0);
                                            const percent = total > 0 ? (mod.value / total) * 100 : 0;
                                            return (
                                                <div key={i} className="space-y-1">
                                                    <div className="flex justify-between text-[10px] font-semibold text-maintext">
                                                        <span className="truncate max-w-[150px]">{mod.label === 'LEGAL_TOOLKIT' ? 'AI Legal' : mod.label === 'AI_SOCIAL_MEDIA' ? 'Social Agent' : mod.label}</span>
                                                        <span className="font-mono text-subtext">{mod.value} ({Math.round(percent)}%)</span>
                                                    </div>
                                                    <div className="w-full bg-white/5 rounded-full h-1">
                                                        <div className="bg-primary h-full rounded-full" style={{ width: `${percent}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Chart 2: Errors by API Route */}
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold text-subtext uppercase tracking-widest">Top Affected API Routes</span>
                                <div className="space-y-1.5 bg-black/10 dark:bg-black/35 p-3 rounded-xl border border-white/5 font-mono text-[10px]">
                                    {charts.errorsByApi.length === 0 ? (
                                        <p className="text-[10px] text-subtext italic">No API errors logged</p>
                                    ) : (
                                        charts.errorsByApi.slice(0, 4).map((api, i) => (
                                            <div key={i} className="flex items-center justify-between gap-3 text-subtext">
                                                <span className="truncate text-maintext" title={api.label}>{api.label}</span>
                                                <span className="font-bold text-orange-400 shrink-0">{api.value}×</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Chart 3: Browser & Device Breakdown */}
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold text-subtext uppercase tracking-widest">Environment Analytics</span>
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Browser */}
                                    <div className="bg-black/10 dark:bg-black/35 p-3 rounded-xl border border-white/5 space-y-1">
                                        <p className="text-[9px] font-extrabold text-subtext uppercase pb-1 border-b border-white/5">Browser</p>
                                        {charts.errorsByBrowser.slice(0, 3).map((item, i) => (
                                            <div key={i} className="flex justify-between text-[9px]">
                                                <span className="text-maintext truncate max-w-[60px] font-semibold">{item.label}</span>
                                                <span className="font-mono text-subtext">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Device */}
                                    <div className="bg-black/10 dark:bg-black/35 p-3 rounded-xl border border-white/5 space-y-1">
                                        <p className="text-[9px] font-extrabold text-subtext uppercase pb-1 border-b border-white/5">Device</p>
                                        {charts.errorsByDevice.slice(0, 3).map((item, i) => (
                                            <div key={i} className="flex justify-between text-[9px]">
                                                <span className="text-maintext font-semibold">{item.label}</span>
                                                <span className="font-mono text-subtext">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Simulated Availability metrics card */}
                            <div className="p-4 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-xl flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <h4 className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">System Status</h4>
                                    <p className="text-xs text-subtext mt-1">API Availability: <strong className="text-emerald-400">{kpis?.apiAvailability}</strong></p>
                                    <p className="text-xs text-subtext">Verified Uptime: <strong className="text-emerald-400">{kpis?.systemUptime}</strong></p>
                                </div>
                                <Activity className="w-8 h-8 text-primary/30" />
                            </div>
                        </>
                    ) : (
                        <div className="py-24 text-center text-xs text-subtext">Loading dashboard telemetry...</div>
                    )}
                </div>
            </div>

            {/* Sentry-style Detailed Drawer (Slide over overlay) */}
            <AnimatePresence>
                {selectedIncident && (
                    <>
                        {/* Overlay backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedIncident(null)}
                            className="fixed inset-0 z-[2030] bg-black/60 backdrop-blur-sm"
                        />
                        
                        {/* Drawer body */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 26, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 z-[2040] w-full max-w-3xl bg-[#0b0e14] border-l border-white/10 shadow-2xl flex flex-col overflow-hidden text-xs"
                        >
                            {detailLoading ? (
                                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                                    <RefreshCw className="w-6 h-6 text-primary animate-spin" />
                                    <p className="text-subtext">Fetching incident details & timeline data...</p>
                                </div>
                            ) : selectedIncidentDetail ? (
                                <>
                                    {/* Header block */}
                                    <div className="p-5 border-b border-white/10 bg-white/5 space-y-3">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <div className="flex items-center gap-2">
                                                <SeverityBadge severity={selectedIncidentDetail.severity} />
                                                <StatusBadge status={selectedIncidentDetail.status} />
                                                <ComponentBadge component={selectedIncidentDetail.component} />
                                            </div>
                                            <button 
                                                onClick={() => setSelectedIncident(null)} 
                                                className="p-1.5 rounded-lg hover:bg-white/10 text-subtext hover:text-maintext transition-all"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="space-y-1">
                                            <h2 className="text-base font-black text-maintext leading-tight">{selectedIncidentDetail.title}</h2>
                                            <p className="text-[10px] text-subtext/60 truncate font-mono">Incident ID: {selectedIncidentDetail._id}</p>
                                        </div>

                                        {/* Action buttons bar */}
                                        <div className="flex flex-wrap items-center gap-2 pt-2">
                                            <button
                                                onClick={() => setAssignModalOpen(true)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-xl font-bold transition-all text-[11px]"
                                            >
                                                <User className="w-3.5 h-3.5" />
                                                {selectedIncidentDetail.assignedToName ? `Re-assign (${selectedIncidentDetail.assignedToName})` : 'Assign to Dev'}
                                            </button>

                                            {selectedIncidentDetail.status !== 'Resolved' ? (
                                                <button
                                                    onClick={() => {
                                                        setResolveForm({
                                                            rootCause: selectedIncidentDetail.rootCause || '',
                                                            resolutionSummary: selectedIncidentDetail.resolutionSummary || '',
                                                            commitHash: selectedIncidentDetail.commitHash || '',
                                                            pullRequest: selectedIncidentDetail.pullRequest || '',
                                                            releaseVersion: selectedIncidentDetail.releaseVersion || '1.0.1',
                                                            notes: selectedIncidentDetail.notes || ''
                                                        });
                                                        setResolveModalOpen(true);
                                                    }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl font-bold transition-all text-[11px]"
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                    Resolve Incident
                                                </button>
                                            ) : (
                                                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 flex items-center gap-1.5 text-[11px]">
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    Resolved by {selectedIncidentDetail.fixedByName}
                                                </span>
                                            )}

                                            <select
                                                value={selectedIncidentDetail.status}
                                                onChange={e => handleStatusUpdate(e.target.value)}
                                                className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-subtext focus:border-primary/50 outline-none"
                                            >
                                                <option value="" disabled>Change Status</option>
                                                <option value="Open" className="dark:bg-zinc-900">Open</option>
                                                <option value="In Progress" className="dark:bg-zinc-900">In Progress</option>
                                                <option value="Monitoring" className="dark:bg-zinc-900">Monitoring</option>
                                                <option value="Closed" className="dark:bg-zinc-900">Closed</option>
                                                <option value="Ignored" className="dark:bg-zinc-900">Ignored</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Tabs bar */}
                                    <div className="flex bg-white/5 border-b border-white/10 px-5 gap-4">
                                        {[
                                            { id: 'overview', label: 'Error details' },
                                            { id: 'timeline', label: 'Timeline & History' },
                                            { id: 'replay', label: 'Session Replay' }
                                        ].map(tab => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setDrawerTab(tab.id)}
                                                className={`py-3 font-bold text-xs border-b-2 transition-all relative ${
                                                    drawerTab === tab.id 
                                                        ? 'text-primary border-primary' 
                                                        : 'text-subtext border-transparent hover:text-maintext'
                                                }`}
                                            >
                                                {tab.label}
                                                {tab.id === 'replay' && selectedIncidentDetail.affectedSessions?.length > 0 && (
                                                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] bg-primary/20 text-primary font-mono">
                                                        {selectedIncidentDetail.affectedSessions.length}
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Tabs Content */}
                                    <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                                        {drawerTab === 'overview' && (
                                            <div className="space-y-5">
                                                {/* Error Message Box */}
                                                <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 space-y-1.5">
                                                    <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest">Error Message</h4>
                                                    <p className="text-xs text-maintext font-mono whitespace-pre-wrap leading-relaxed select-all">
                                                        {selectedIncidentDetail.errorMessage}
                                                    </p>
                                                </div>

                                                {/* Stack Trace */}
                                                {selectedIncidentDetail.stackTrace && (
                                                    <div className="space-y-1.5 relative group/stack">
                                                        <div className="flex justify-between items-center">
                                                            <h4 className="text-[10px] font-black text-subtext uppercase tracking-widest">Stack Trace</h4>
                                                            <button 
                                                                onClick={() => copyToClipboard(selectedIncidentDetail.stackTrace)}
                                                                className="flex items-center gap-1 text-[10px] text-primary hover:underline font-bold"
                                                            >
                                                                <Copy className="w-3 h-3" /> Copy trace
                                                            </button>
                                                        </div>
                                                        <pre className="p-4 bg-[#05070a] border border-white/5 rounded-xl font-mono text-[10.5px] leading-relaxed text-subtext/90 overflow-x-auto select-text whitespace-pre max-h-[300px]">
                                                            {selectedIncidentDetail.stackTrace}
                                                        </pre>
                                                    </div>
                                                )}

                                                {/* Device / Client metadata grid */}
                                                <div className="space-y-2">
                                                    <h4 className="text-[10px] font-black text-subtext uppercase tracking-widest">Telemetry & Metadata</h4>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                        {[
                                                            { label: 'OS', value: selectedIncidentDetail.latestOccurrence?.os || 'Unknown', icon: Laptop },
                                                            { label: 'Browser', value: selectedIncidentDetail.latestOccurrence?.browser || 'Unknown', icon: Cpu },
                                                            { label: 'Device', value: selectedIncidentDetail.latestOccurrence?.device || 'Desktop', icon: Laptop },
                                                            { label: 'Environment', value: selectedIncidentDetail.environment || 'Production', icon: Info },
                                                            { label: 'API Route', value: selectedIncidentDetail.apiRoute || 'N/A', icon: Code },
                                                            { label: 'API Method', value: selectedIncidentDetail.apiMethod || 'N/A', icon: Code },
                                                            { label: 'Error Code', value: selectedIncidentDetail.errorCode || 'N/A', icon: AlertCircle },
                                                            { label: 'Total Events', value: selectedIncidentDetail.totalOccurrences, icon: Activity }
                                                        ].map((item, index) => (
                                                            <div key={index} className="bg-white/5 rounded-xl p-3 border border-white/5 space-y-1">
                                                                <span className="text-[9px] text-subtext/60 uppercase font-extrabold tracking-wider leading-none flex items-center gap-1.5">
                                                                    <item.icon className="w-3 h-3 text-primary/60" /> {item.label}
                                                                </span>
                                                                <p className="text-xs text-maintext font-bold leading-tight break-all">{item.value}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Affected Users Summary */}
                                                {selectedIncidentDetail.affectedUsersDetails && selectedIncidentDetail.affectedUsersDetails.length > 0 && (
                                                    <div className="space-y-2">
                                                        <h4 className="text-[10px] font-black text-subtext uppercase tracking-widest">Affected Users ({selectedIncidentDetail.affectedUsersDetails.length})</h4>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {selectedIncidentDetail.affectedUsersDetails.map((user, idx) => (
                                                                <div key={idx} className="flex items-center gap-2.5 p-2.5 bg-white/5 border border-white/5 rounded-xl">
                                                                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                                                                        {user.avatar ? (
                                                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/account.png'; }} />
                                                                        ) : (
                                                                            <span className="font-bold text-primary text-[10px]">
                                                                                {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="font-bold text-maintext text-xs truncate leading-tight">{user.name}</p>
                                                                        <p className="text-[9px] text-subtext truncate mt-0.5">{user.email}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Recent Event Log with User Info */}
                                                {occurrences && occurrences.length > 0 && (
                                                    <div className="space-y-2">
                                                        <h4 className="text-[10px] font-black text-subtext uppercase tracking-widest">Recent Event Occurrences</h4>
                                                        <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar border border-white/5 rounded-xl p-2.5 bg-white/[0.01]">
                                                            {occurrences.map((occ, idx) => (
                                                                <div key={occ._id || idx} className="p-2.5 bg-white/5 border border-white/5 rounded-xl space-y-1.5 text-xs">
                                                                    <div className="flex justify-between items-center flex-wrap gap-1 text-[10px] text-subtext/60">
                                                                        <span className="font-mono text-primary font-bold">#{occurrences.length - idx} • {formatTime(occ.timestamp || occ.createdAt)}</span>
                                                                        <span>{occ.browser} • {occ.os}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-5.5 h-5.5 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                                                                            {occ.userInfo?.avatar ? (
                                                                                <img src={occ.userInfo.avatar} alt="U" className="w-full h-full object-cover" />
                                                                            ) : (
                                                                                <User className="w-3 h-3 text-subtext/80" />
                                                                            )}
                                                                        </div>
                                                                        <div className="min-w-0 flex-1">
                                                                            {occ.userInfo ? (
                                                                                <p className="text-xs font-bold text-maintext truncate leading-none">
                                                                                    {occ.userInfo.name} <span className="text-[10px] font-normal text-subtext">({occ.userInfo.email})</span>
                                                                                </p>
                                                                            ) : (
                                                                                <p className="text-xs text-subtext/70 italic leading-none">Anonymous / Guest User</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    {occ.sessionId && (
                                                                        <p className="text-[9px] font-mono text-subtext/40 truncate">Session ID: {occ.sessionId}</p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Latest request payloads details */}
                                                {selectedIncidentDetail.latestOccurrence?.payload && Object.keys(selectedIncidentDetail.latestOccurrence.payload).length > 0 && (
                                                    <div className="space-y-1.5">
                                                        <h4 className="text-[10px] font-black text-subtext uppercase tracking-widest">Request Payload</h4>
                                                        <pre className="p-3 bg-white/5 border border-white/5 rounded-xl font-mono text-[10.5px] text-subtext overflow-x-auto">
                                                            {JSON.stringify(selectedIncidentDetail.latestOccurrence.payload, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                                
                                                {/* Resolution summary details if resolved */}
                                                {selectedIncidentDetail.status === 'Resolved' && (
                                                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 space-y-3">
                                                        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                                                            <CheckCircle className="w-4 h-4" /> Resolution Details
                                                        </h4>
                                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                                            <div>
                                                                <span className="text-subtext font-semibold">Root Cause:</span>
                                                                <p className="text-maintext font-bold mt-0.5">{selectedIncidentDetail.rootCause}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-subtext font-semibold">Fix Summary:</span>
                                                                <p className="text-maintext font-bold mt-0.5">{selectedIncidentDetail.resolutionSummary}</p>
                                                            </div>
                                                            {selectedIncidentDetail.commitHash && (
                                                                <div>
                                                                    <span className="text-subtext font-semibold">Commit Hash:</span>
                                                                    <p className="text-maintext font-mono mt-0.5 flex items-center gap-1"><GitCommit className="w-3 h-3 text-primary" /> {selectedIncidentDetail.commitHash.substring(0, 8)}</p>
                                                                </div>
                                                            )}
                                                            {selectedIncidentDetail.pullRequest && (
                                                                <div>
                                                                    <span className="text-subtext font-semibold">Pull Request:</span>
                                                                    <p className="text-maintext font-mono mt-0.5 flex items-center gap-1"><GitPullRequest className="w-3 h-3 text-primary" /> {selectedIncidentDetail.pullRequest}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Timeline Tab */}
                                        {drawerTab === 'timeline' && (
                                            <div className="space-y-6">
                                                {/* Timeline Trail */}
                                                <div className="space-y-4">
                                                    <h4 className="text-[10px] font-black text-subtext uppercase tracking-widest">Incident Event Timeline</h4>
                                                    <div className="relative border-l border-white/10 pl-5 ml-2.5 space-y-6">
                                                        {selectedIncidentDetail.timeline?.map((item, i) => (
                                                            <div key={i} className="relative">
                                                                {/* Bullet dot */}
                                                                <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-[#0b0e14] border-2 border-primary flex items-center justify-center" />
                                                                
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <span className="text-xs font-bold text-maintext">{item.state}</span>
                                                                        <span className="text-[10px] text-subtext font-mono">{formatTime(item.timestamp)}</span>
                                                                    </div>
                                                                    <p className="text-xs text-subtext/75">{item.notes}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Audit Logs */}
                                                <div className="space-y-3 pt-4 border-t border-white/5">
                                                    <h4 className="text-[10px] font-black text-subtext uppercase tracking-widest">Activity Audit Log</h4>
                                                    <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar">
                                                        {selectedIncidentDetail.auditLog?.map((log, i) => (
                                                            <div key={i} className="bg-white/5 rounded-lg p-2.5 border border-white/5 text-[11px] space-y-1">
                                                                <div className="flex justify-between items-center text-[10px] text-subtext font-mono">
                                                                    <span className="font-bold text-primary">{log.action}</span>
                                                                    <span>{formatTime(log.timestamp)}</span>
                                                                </div>
                                                                <p className="text-maintext font-semibold">{log.details}</p>
                                                                <p className="text-[9px] text-subtext/60">Updated by: {log.user}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Replay Tab: Replaying User Journey & Conversation */}
                                        {drawerTab === 'replay' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                                                {/* Affected sessions list */}
                                                <div className="space-y-3 border-r border-white/5 pr-4">
                                                    <h4 className="text-[10px] font-black text-subtext uppercase tracking-widest">Select Affected Session</h4>
                                                    <div className="space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar">
                                                        {selectedIncidentDetail.affectedSessions?.length === 0 ? (
                                                            <p className="text-xs text-subtext italic">No user session ID tracked.</p>
                                                        ) : (
                                                            selectedIncidentDetail.affectedSessions.map((sid, idx) => (
                                                                <button
                                                                    key={idx}
                                                                    onClick={() => loadSessionReplay(sid)}
                                                                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                                                                        activeReplaySession === sid 
                                                                            ? 'bg-primary/10 border-primary/40 text-primary' 
                                                                            : 'bg-white/5 border-white/10 text-subtext hover:border-white/20 hover:text-maintext'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center justify-between text-[10px] mb-1 font-mono font-bold">
                                                                        <span>Session {idx + 1}</span>
                                                                        <span className="flex items-center gap-1 text-primary"><Play className="w-3 h-3" /> Replay</span>
                                                                    </div>
                                                                    <p className="truncate text-xs font-semibold select-all">{sid}</p>
                                                                </button>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Replay sequence viewer */}
                                                <div className="space-y-4">
                                                    {replayLoading ? (
                                                        <div className="flex flex-col items-center justify-center py-20 gap-2">
                                                            <RefreshCw className="w-6 h-6 text-primary animate-spin" />
                                                            <p className="text-subtext">Loading replay logs & conversation records...</p>
                                                        </div>
                                                    ) : replayData ? (
                                                        <div className="space-y-4 flex flex-col h-full">
                                                            {/* User Info Banner */}
                                                            {replayData.userInfo && (
                                                                <div className="flex items-center gap-2.5 p-3 bg-primary/10 border border-primary/20 rounded-xl">
                                                                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30 shrink-0">
                                                                        {replayData.userInfo.avatar ? (
                                                                            <img src={replayData.userInfo.avatar} alt="U" className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <User className="w-4 h-4 text-primary" />
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="font-bold text-maintext text-xs leading-none">{replayData.userInfo.name}</p>
                                                                        <p className="text-[10px] text-subtext leading-none mt-1.5">{replayData.userInfo.email}</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {/* Complete Conversation overlay */}
                                                            <div className="space-y-2 flex-1 flex flex-col min-h-[220px]">
                                                                <h4 className="text-[10px] font-black text-subtext uppercase tracking-widest flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Replay: Chat Conversation</h4>
                                                                <div className="bg-black/20 border border-white/10 rounded-xl p-3 flex-1 overflow-y-auto max-h-[220px] custom-scrollbar space-y-2">
                                                                    {replayData.conversation.length === 0 ? (
                                                                        <p className="text-xs text-subtext italic text-center py-8">No chat messages in this session (API/Guest call only).</p>
                                                                    ) : (
                                                                        replayData.conversation.map((msg, mid) => {
                                                                            const isModel = msg.role === 'model' || msg.role === 'assistant';
                                                                            return (
                                                                                <div key={mid} className={`flex flex-col max-w-[85%] ${isModel ? 'self-start' : 'self-end ml-auto'}`}>
                                                                                    <span className={`text-[9px] uppercase font-bold tracking-wider mb-0.5 ${isModel ? 'text-primary/70' : 'text-subtext/70'}`}>
                                                                                        {isModel ? 'AISA AI' : 'User'}
                                                                                    </span>
                                                                                    <div className={`p-2 rounded-xl text-[11px] ${
                                                                                        isModel 
                                                                                            ? 'bg-white/5 border border-white/5 text-maintext' 
                                                                                            : 'bg-primary text-white'
                                                                                    }`}>
                                                                                        {msg.content}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* User Journey Breadcrumbs (API sequence) */}
                                                            {replayData.occurrences?.[0]?.breadcrumbs && replayData.occurrences[0].breadcrumbs.length > 0 && (
                                                                <div className="space-y-2">
                                                                    <h4 className="text-[10px] font-black text-subtext uppercase tracking-widest">User Journey Sequence</h4>
                                                                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar font-mono text-[9.5px]">
                                                                        {replayData.occurrences[0].breadcrumbs.map((crumb, cid) => (
                                                                            <div key={cid} className="flex items-start gap-2 bg-white/5 p-2 rounded-lg border border-white/5 text-subtext">
                                                                                <span className="font-bold text-primary text-[8px] uppercase tracking-wider">{crumb.category}</span>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className="text-maintext font-semibold truncate">{crumb.message}</p>
                                                                                    {crumb.data && Object.keys(crumb.data).length > 0 && (
                                                                                        <p className="text-[8px] opacity-60 truncate">{JSON.stringify(crumb.data)}</p>
                                                                                    )}
                                                                                </div>
                                                                                <span className="opacity-45 text-[8px] font-light">{new Date(crumb.timestamp).toLocaleTimeString()}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="h-full border border-dashed border-white/10 rounded-xl flex items-center justify-center p-8 text-center text-subtext italic">
                                                            Select a session on the left to inspect conversation history and journey breadcrumbs.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : null}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Assign Dev Dialog Modal */}
            <AnimatePresence>
                {assignModalOpen && (
                    <div className="fixed inset-0 z-[2060] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-xs"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-maintext flex items-center gap-1.5"><User className="w-4 h-4 text-primary" /> Assign Developer</h3>
                                <button onClick={() => setAssignModalOpen(false)} className="text-subtext hover:text-maintext"><X size={16} /></button>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-subtext uppercase tracking-wider">Developer Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Saksham (Lead Dev)"
                                    value={assigneeName}
                                    onChange={e => setAssigneeName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary/50 text-maintext"
                                />
                            </div>
                            <div className="flex gap-2 justify-end pt-2">
                                <button onClick={() => setAssignModalOpen(false)} className="px-4 py-2 text-subtext hover:text-maintext font-bold">Cancel</button>
                                <button onClick={handleAssign} className="px-5 py-2 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20">Assign</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Resolve Incident Checklist Dialog Modal */}
            <AnimatePresence>
                {resolveModalOpen && (
                    <div className="fixed inset-0 z-[2060] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl text-xs overflow-y-auto max-h-[85vh] custom-scrollbar"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-maintext flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-400" /> Resolve Workflow Checklist</h3>
                                <button onClick={() => setResolveModalOpen(false)} className="text-subtext hover:text-maintext"><X size={16} /></button>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-subtext uppercase tracking-wider">Root Cause *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Unhandled Null Pointer Exception"
                                        value={resolveForm.rootCause}
                                        onChange={e => setResolveForm({ ...resolveForm, rootCause: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary/50 text-maintext"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-subtext uppercase tracking-wider">Resolution Summary *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Added optional chaining check"
                                        value={resolveForm.resolutionSummary}
                                        onChange={e => setResolveForm({ ...resolveForm, resolutionSummary: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary/50 text-maintext"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-subtext uppercase tracking-wider flex items-center gap-1"><GitCommit className="w-3.5 h-3.5" /> Commit Hash</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. a7f3b58c"
                                        value={resolveForm.commitHash}
                                        onChange={e => setResolveForm({ ...resolveForm, commitHash: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary/50 text-maintext font-mono"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-subtext uppercase tracking-wider flex items-center gap-1"><GitPullRequest className="w-3.5 h-3.5" /> Pull Request</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. #318"
                                        value={resolveForm.pullRequest}
                                        onChange={e => setResolveForm({ ...resolveForm, pullRequest: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary/50 text-maintext font-mono"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-subtext uppercase tracking-wider">Release Version</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 1.0.2"
                                        value={resolveForm.releaseVersion}
                                        onChange={e => setResolveForm({ ...resolveForm, releaseVersion: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary/50 text-maintext"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-subtext uppercase tracking-wider">Resolution Notes & Extra Info</label>
                                <textarea
                                    rows={3}
                                    placeholder="Write extra debugging notes or resolution details here..."
                                    value={resolveForm.notes}
                                    onChange={e => setResolveForm({ ...resolveForm, notes: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary/50 text-maintext resize-none"
                                />
                            </div>

                            <div className="flex gap-2 justify-end pt-2">
                                <button onClick={() => setResolveModalOpen(false)} className="px-4 py-2 text-subtext hover:text-maintext font-bold">Cancel</button>
                                <button onClick={handleResolve} className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20">Mark Resolved</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ErrorMonitoring;
