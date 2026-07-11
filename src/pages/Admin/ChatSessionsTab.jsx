import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';
import {
    MessageSquare, Activity, Check, AlertCircle, Ban, Layers, TrendingUp, Clock,
    Users, Search, Mail, ChevronLeft, ChevronRight, X, Bot, User as UserIcon, RefreshCw
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const STATUS_META = {
    active: { label: 'Active', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    completed: { label: 'Completed', color: 'bg-green-500/15 text-green-400 border-green-500/30' },
    abandoned: { label: 'Abandoned', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    failed: { label: 'Failed', color: 'bg-red-500/15 text-red-400 border-red-500/30' },
};

const MODE_LABELS = {
    NORMAL_CHAT: 'Normal Chat',
    chat: 'Normal Chat',
    CHAT: 'Normal Chat',
    web_search: 'Web Search',
    DEEP_SEARCH: 'Deep Search',
    CODE_WRITER: 'Code Writer',
    CODING_HELP: 'Code Writer',
    code: 'Code Writer',
    LEGAL_TOOLKIT: 'AI Legal',
    legal: 'AI Legal',
    IMAGE_GENERATION: 'Generate Image',
    imageGen: 'Generate Image',
    image: 'Generate Image',
    VIDEO_GENERATION: 'Generate Video',
    videoGen: 'Generate Video',
    video: 'Generate Video',
    AUDIO_CONVERT: 'Convert to Audio',
    audioGen: 'Convert to Audio',
    audio: 'Convert to Audio',
    DOCUMENT_CONVERT: 'Convert Documents',
    document: 'Convert Documents',
    IMAGE_EDIT: 'Edit Image',
    editImage: 'Edit Image',
    edit_image: 'Edit Image',
    CASHFLOW: 'AI CashFlow',
    ai_cashflow: 'AI CashFlow',
};

const SessionStatusBadge = ({ status }) => {
    const meta = STATUS_META[status] || { label: status, color: 'bg-gray-500/15 text-gray-400 border-gray-500/30' };
    return (
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border whitespace-nowrap ${meta.color}`}>
            {meta.label}
        </span>
    );
};

const ChatSessionsTab = () => {
    const { t } = useLanguage();

    // ── State ──────────────────────────────────────────────────────────────────
    const [stats, setStats] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
    const [selectedSession, setSelectedSession] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [mailModal, setMailModal] = useState({ isOpen: false, email: '', subject: '', message: '', sending: false });

    const handleOpenMailModal = (email) => {
        setMailModal({
            isOpen: true,
            email: email || '',
            subject: 'Notification from AISA Admin',
            message: '',
            sending: false
        });
    };

    const handleSendMail = async (e) => {
        e.preventDefault();
        if (!mailModal.email || !mailModal.message) {
            toast.error('Recipient email and message are required.');
            return;
        }
        setMailModal(prev => ({ ...prev, sending: true }));
        try {
            const res = await apiService.sendEmailToUser({
                toEmail: mailModal.email,
                subject: mailModal.subject || 'Message from AISA Admin',
                message: mailModal.message
            });
            if (res.success) {
                toast.success('Email sent successfully!');
                setMailModal({ isOpen: false, email: '', subject: '', message: '', sending: false });
            } else {
                toast.error(res.message || 'Failed to send email.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send email.');
        } finally {
            setMailModal(prev => ({ ...prev, sending: false }));
        }
    };

    // ── Filters ────────────────────────────────────────────────────────────────
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterMode, setFilterMode] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // ── Fetch Stats ────────────────────────────────────────────────────────────
    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const data = await apiService.getAdminChatSessionStats();
            if (data.success) setStats(data.stats);
        } catch (err) {
            console.error('Chat session stats error:', err);
        } finally {
            setStatsLoading(false);
        }
    };

    // ── Fetch Sessions List ────────────────────────────────────────────────────
    const fetchSessions = async (page = 1) => {
        setLoading(true);
        try {
            const data = await apiService.getAdminChatSessions({
                page,
                limit: pagination.limit,
                search,
                status: filterStatus,
                mode: filterMode,
                dateFrom,
                dateTo,
            });
            if (data.success) {
                setSessions(data.sessions || []);
                setPagination(data.pagination || { total: 0, page: 1, limit: 15, totalPages: 1 });
            }
        } catch (err) {
            console.error('Chat sessions list error:', err);
        } finally {
            setLoading(false);
        }
    };

    // ── Fetch Detail ───────────────────────────────────────────────────────────
    const fetchDetail = async (sessionId) => {
        setDetailLoading(true);
        try {
            const data = await apiService.getAdminChatSessionDetail(sessionId);
            if (data.success) setSelectedSession(data.session);
        } catch (err) {
            console.error('Chat session detail error:', err);
        } finally {
            setDetailLoading(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);
    useEffect(() => { fetchSessions(1); }, [search, filterStatus, filterMode, dateFrom, dateTo]);

    const formatDate = (val) => {
        if (!val) return '—';
        return new Date(typeof val === 'number' ? val : val).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // ── Summary Cards ──────────────────────────────────────────────────────────
    const statCards = [
        { label: 'Total Sessions', value: stats?.totalSessions ?? '—', icon: MessageSquare, color: 'text-primary' },
        { label: 'Active Now', value: stats?.statusCounts?.active ?? '—', icon: Activity, color: 'text-blue-400' },
        { label: 'Completed', value: stats?.statusCounts?.completed ?? '—', icon: Check, color: 'text-green-400' },
        { label: 'Abandoned', value: stats?.statusCounts?.abandoned ?? '—', icon: AlertCircle, color: 'text-amber-400' },
        { label: 'Failed', value: stats?.statusCounts?.failed ?? '—', icon: Ban, color: 'text-red-400' },
        { label: 'Total Messages', value: stats?.totalMessages ?? '—', icon: Layers, color: 'text-purple-400' },
        { label: 'Avg Messages/Session', value: stats?.avgMessages ?? '—', icon: TrendingUp, color: 'text-cyan-400' },
        { label: 'Avg Duration', value: stats?.avgDuration ?? '—', icon: Clock, color: 'text-pink-400' },
        { label: 'Guest Sessions', value: stats?.totalGuestSessions ?? '—', icon: Users, color: 'text-orange-400' },
    ];

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-2 sm:gap-3">
                {statCards.map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex flex-col gap-1.5 sm:gap-2 hover:border-primary/30 transition-all group"
                    >
                        <card.icon className={`w-4 h-4 ${card.color}`} />
                        <p className={`text-xl font-black ${statsLoading ? 'opacity-30 animate-pulse' : ''} text-maintext`}>
                            {statsLoading ? '…' : card.value}
                        </p>
                        <p className="text-[10px] font-semibold text-subtext uppercase tracking-wider leading-tight">{card.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 items-stretch sm:items-end">
                    {/* Search */}
                    <div className="relative w-full sm:flex-1 sm:min-w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtext" />
                        <input
                            type="text"
                            placeholder="Search by name, email or session ID…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary/50 transition-all placeholder:text-subtext/40 text-maintext"
                        />
                    </div>
                    {/* Filters row - wraps on mobile */}
                    <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto items-end">
                        {/* Status */}
                        <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
                            <label className="text-[10px] font-bold text-subtext uppercase tracking-wider">Status</label>
                            <select
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                                className="bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-maintext outline-none focus:border-primary/50 transition-all"
                            >
                                <option value="">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="abandoned">Abandoned</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>

                        {/* Mode */}
                        <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
                            <label className="text-[10px] font-bold text-subtext uppercase tracking-wider">Mode</label>
                            <select
                                value={filterMode}
                                onChange={e => setFilterMode(e.target.value)}
                                className="bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-maintext outline-none focus:border-primary/50 transition-all"
                            >
                                <option value="">All Modes</option>
                                <option value="NORMAL_CHAT">Normal Chat</option>
                                <option value="web_search">Web Search</option>
                                <option value="DEEP_SEARCH">Deep Search</option>
                                <option value="CODE_WRITER">Code Writer</option>
                                <option value="LEGAL_TOOLKIT">AI Legal</option>
                                <option value="IMAGE_GENERATION">Generate Image</option>
                                <option value="VIDEO_GENERATION">Generate Video</option>
                                <option value="AUDIO_CONVERT">Convert to Audio</option>
                                <option value="DOCUMENT_CONVERT">Convert Documents</option>
                                <option value="IMAGE_EDIT">Edit Image</option>
                                <option value="CASHFLOW">AI CashFlow</option>
                            </select>
                        </div>

                        {/* Date From */}
                        <div className="flex flex-col gap-1 flex-1 min-w-[110px]">
                            <label className="text-[10px] font-bold text-subtext uppercase tracking-wider">From</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                className="bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-maintext outline-none focus:border-primary/50 transition-all"
                            />
                        </div>

                        {/* Date To */}
                        <div className="flex flex-col gap-1 flex-1 min-w-[110px]">
                            <label className="text-[10px] font-bold text-subtext uppercase tracking-wider">To</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={e => setDateTo(e.target.value)}
                                className="bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-maintext outline-none focus:border-primary/50 transition-all"
                            />
                        </div>
                    </div>
                    {(search || filterStatus || filterMode || dateFrom || dateTo) && (
                        <button
                            onClick={() => { setSearch(''); setFilterStatus(''); setFilterMode(''); setDateFrom(''); setDateTo(''); }}
                            className="px-4 py-2.5 rounded-xl text-sm font-bold text-subtext hover:text-red-400 hover:bg-red-500/10 transition-all border border-white/10"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/20 dark:border-white/10">
                    <h3 className="font-bold text-maintext text-base flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        Chat Sessions
                        {!loading && <span className="text-xs text-subtext font-normal ml-1">({pagination.total} total)</span>}
                    </h3>
                    <button onClick={() => { fetchStats(); fetchSessions(pagination.page); }} className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-all" title="Refresh">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="overflow-x-auto -mx-px">
                    <table className="w-full min-w-[720px] text-sm">
                        <thead>
                            <tr className="border-b border-white/10">
                                {['Session ID', 'User', 'Email', 'Mode', 'Start Time', 'Duration', 'Total', 'User', 'AI', 'Status'].map((h, i) => (
                                    <th key={i} className="px-4 py-3 text-left text-[10px] font-bold text-subtext uppercase tracking-wider whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i} className="border-b border-white/5">
                                        {Array.from({ length: 10 }).map((_, j) => (
                                            <td key={j} className="px-4 py-3">
                                                <div className="h-3 bg-white/10 rounded-full animate-pulse" style={{ width: `${40 + Math.random() * 40}%` }} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : sessions.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="text-center py-12 text-subtext text-sm">
                                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                        No sessions found
                                    </td>
                                </tr>
                            ) : (
                                sessions.map((s, i) => (
                                    <motion.tr
                                        key={s.sessionId || i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.02 }}
                                        onClick={() => fetchDetail(s.sessionId)}
                                    className="border-b border-white/5 hover:bg-primary/5 cursor-pointer transition-all group"
                                    >
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-[11px] text-primary/80 group-hover:text-primary transition-colors whitespace-nowrap">
                                                {s.sessionId?.slice(0, 12)}…
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-semibold text-maintext text-xs whitespace-nowrap">{s.userName || 'Guest'}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-subtext text-xs whitespace-nowrap">{s.userEmail || '—'}</span>
                                                {s.userEmail && s.userEmail !== '—' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenMailModal(s.userEmail);
                                                        }}
                                                        className="p-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                        title="Send Email to User"
                                                    >
                                                        <Mail className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs text-subtext whitespace-nowrap">{MODE_LABELS[s.detectedMode] || s.detectedMode || '—'}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs text-subtext whitespace-nowrap">{formatDate(s.createdAt)}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs font-mono text-subtext whitespace-nowrap">{s.duration || '—'}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-xs font-bold text-maintext whitespace-nowrap">{s.totalMessages ?? 0}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-xs text-blue-400 font-semibold whitespace-nowrap">{s.userMessages ?? 0}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-xs text-emerald-400 font-semibold whitespace-nowrap">{s.aiMessages ?? 0}</span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <SessionStatusBadge status={s.sessionStatus} />
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-4 border-t border-white/10">
                        <span className="text-xs text-subtext">
                            Page {pagination.page} of {pagination.totalPages} &nbsp;·&nbsp; {pagination.total} sessions
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={pagination.page <= 1 || loading}
                                onClick={() => fetchSessions(pagination.page - 1)}
                                className="p-2 rounded-lg hover:bg-primary/10 text-subtext hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-xs font-bold text-maintext px-2">{pagination.page}</span>
                            <button
                                disabled={pagination.page >= pagination.totalPages || loading}
                                onClick={() => fetchSessions(pagination.page + 1)}
                                className="p-2 rounded-lg hover:bg-primary/10 text-subtext hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Drawer */}
            <AnimatePresence>
                {(selectedSession || detailLoading) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[2050] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        onClick={(e) => { if (e.target === e.currentTarget) setSelectedSession(null); }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 40 }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            className="bg-white dark:bg-[#12141a] border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
                        >
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <MessageSquare className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-maintext text-sm">Session Detail</p>
                                        {selectedSession && (
                                            <p className="text-xs font-mono text-subtext">{selectedSession.sessionId}</p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedSession(null)}
                                    className="p-2 rounded-xl hover:bg-white/10 text-subtext hover:text-maintext transition-all"
                               >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {detailLoading ? (
                                <div className="flex items-center justify-center flex-1 py-12">
                                    <RefreshCw className="w-6 h-6 text-primary animate-spin" />
                                </div>
                            ) : selectedSession && (
                                <div className="flex flex-col flex-1 overflow-hidden">
                                    {/* Session Meta */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-5 border-b border-white/10">
                                        {[
                                            { label: 'User', value: selectedSession.userName || 'Guest' },
                                            {
                                                label: 'Email', value: selectedSession.userEmail ? (
                                                    <div className="flex items-center justify-between gap-1">
                                                        <span>{selectedSession.userEmail}</span>
                                                        <button
                                                            onClick={() => handleOpenMailModal(selectedSession.userEmail)}
                                                            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/20 hover:bg-primary/30 text-primary text-[9px] font-bold uppercase transition-all"
                                                        >
                                                            <Mail className="w-2.5 h-2.5" /> Send
                                                        </button>
                                                    </div>
                                                ) : '—'
                                            },
                                            { label: 'Status', value: <SessionStatusBadge status={selectedSession.sessionStatus} /> },
                                            { label: 'Mode', value: MODE_LABELS[selectedSession.detectedMode] || selectedSession.detectedMode || '—' },
                                            { label: 'Duration', value: selectedSession.duration || '—' },
                                            { label: 'Start Time', value: formatDate(selectedSession.createdAt) },
                                            { label: 'Last Activity', value: formatDate(selectedSession.lastModified) },
                                            { label: 'Total Messages', value: selectedSession.totalMessages ?? 0 },
                                            { label: 'User / AI', value: `${selectedSession.userMessages ?? 0} / ${selectedSession.aiMessages ?? 0}` },
                                        ].map((item, i) => (
                                            <div key={i} className="bg-white/20 dark:bg-white/5 rounded-xl p-3">
                                                <p className="text-[10px] font-bold text-subtext uppercase tracking-wider mb-1">{item.label}</p>
                                                <p className="text-xs font-semibold text-maintext">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Conversation */}
                                    <div className="flex-1 overflow-y-auto p-5 space-y-3">
                                        <p className="text-[10px] font-bold text-subtext uppercase tracking-wider mb-3">Conversation History</p>
                                        {(!selectedSession.messages || selectedSession.messages.length === 0) ? (
                                            <p className="text-center text-subtext text-sm py-6">No messages in this session</p>
                                        ) : (
                                            selectedSession.messages.map((msg, idx) => (
                                                <div
                                                    key={msg.id || idx}
                                                    className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    {msg.role !== 'user' && (
                                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                                                            <Bot className="w-3 h-3 text-primary" />
                                                        </div>
                                                    )}
                                                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${msg.role === 'user'
                                                            ? 'bg-primary/20 text-maintext rounded-br-sm'
                                                            : 'bg-white/20 dark:bg-white/5 text-maintext rounded-bl-sm'
                                                        }`}>
                                                        <p className="leading-relaxed whitespace-pre-wrap break-words line-clamp-6">{msg.content}</p>
                                                        {msg.imageUrl && <p className="text-[10px] text-primary mt-1">📸 Image attached</p>}
                                                        {msg.videoUrl && <p className="text-[10px] text-primary mt-1">🎬 Video attached</p>}
                                                        <p className="text-[10px] text-subtext/60 mt-1 text-right">
                                                            {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                        </p>
                                                    </div>
                                                    {msg.role === 'user' && (
                                                        <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-1">
                                                            <UserIcon className="w-3 h-3 text-blue-400" />
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Send Email Modal */}
            <AnimatePresence>
                {mailModal.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setMailModal(prev => ({ ...prev, isOpen: false }))}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-[#12141a] border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-lg p-6 relative overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-maintext text-lg font-bold">Send Email to User</h3>
                                        <p className="text-xs text-subtext">Direct communication from AISA™ Admin</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setMailModal(prev => ({ ...prev, isOpen: false }))}
                                    className="p-2 rounded-xl hover:bg-white/10 text-subtext hover:text-maintext transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSendMail} className="space-y-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-subtext uppercase tracking-wider">To</label>
                                    <input
                                        type="email"
                                        readOnly
                                        disabled
                                        value={mailModal.email}
                                        className="w-full bg-white/20 dark:bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-subtext outline-none cursor-not-allowed"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-subtext uppercase tracking-wider font-semibold font-bold">Subject</label>
                                    <input
                                        type="text"
                                        required
                                        value={mailModal.subject}
                                        onChange={e => setMailModal(prev => ({ ...prev, subject: e.target.value }))}
                                        className="w-full bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl py-2.5 px-4 text-sm text-maintext outline-none focus:border-primary/50 transition-all"
                                        placeholder="Enter email subject..."
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-subtext uppercase tracking-wider font-semibold font-bold">Message</label>
                                    <textarea
                                        required
                                        rows={6}
                                        value={mailModal.message}
                                        onChange={e => setMailModal(prev => ({ ...prev, message: e.target.value }))}
                                        className="w-full bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl py-2.5 px-4 text-sm text-maintext outline-none focus:border-primary/50 transition-all resize-none"
                                        placeholder="Write your email message here..."
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setMailModal(prev => ({ ...prev, isOpen: false }))}
                                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-subtext hover:text-maintext transition-all hover:bg-white/5"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={mailModal.sending}
                                        className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {mailModal.sending ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Mail className="w-4 h-4" />
                                                Send Email
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChatSessionsTab;
