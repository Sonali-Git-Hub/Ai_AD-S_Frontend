import React, { useState, useEffect, Suspense } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3, Users, MessageSquare, PieChart, CreditCard, Shield, FileText, Headphones, BookOpen, Settings, ArrowLeft,
    DollarSign, TrendingUp, Activity, Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../services/apiService';
import { getUserData } from '../userStore/userData';
import { logo } from '../constants.js';
import { ADMIN_EMAIL, LoadingSpinner, TabButton, StatCard, SectionCard } from './Admin/AdminCommon';


// Lazy load Tab Components
const OverviewTab = React.lazy(() => import('./Admin/OverviewTab'));
const UsersTab = React.lazy(() => import('./Admin/UsersTab'));
const PlansTab = React.lazy(() => import('./Admin/PlansTab'));
const ToolLimitTab = React.lazy(() => import('./Admin/ToolLimitTab'));
const SettingsTab = React.lazy(() => import('./Admin/SettingsTab'));
const LegalPagesTab = React.lazy(() => import('./Admin/LegalPagesTab'));
const KnowledgeBaseTab = React.lazy(() => import('./Admin/KnowledgeBaseTab'));
const ChatSessionsTab = React.lazy(() => import('./Admin/ChatSessionsTab'));
const AnalyticsTab = React.lazy(() => import('./Admin/AnalyticsTab'));
const AdminHelpDesk = React.lazy(() => import('../Components/AdminHelpDesk'));

// ═══════════════════════════════
// BILLING MANAGEMENT TAB
// ═══════════════════════════════
const BillingTab = () => {
    const { t } = useLanguage();
    const [stats, setStats] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingInvoices, setLoadingInvoices] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ pages: 1, total: 0 });

    const fetchStats = async () => {
        try {
            setLoadingStats(true);
            const data = await apiService.getAdminBillingStats();
            setStats(data.stats);
        } catch (e) {
            console.error('Failed to fetch billing stats:', e);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchInvoices = async () => {
        try {
            setLoadingInvoices(true);
            const data = await apiService.getAdminInvoices(searchQuery, page);
            setInvoices(data.invoices || []);
            setPagination(data.pagination || { pages: 1, total: 0 });
        } catch (e) {
            console.error('Failed to fetch invoices:', e);
        } finally {
            setLoadingInvoices(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchInvoices();
    }, [searchQuery, page]);

    const handleDownload = async (subId, invNumber) => {
        try {
            toast.loading('Generating invoice PDF...', { id: 'pdf-load' });
            const blob = await apiService.downloadInvoice(subId);
            const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${invNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            toast.success('Invoice downloaded!', { id: 'pdf-load' });
        } catch (e) {
            toast.error('Failed to download invoice.', { id: 'pdf-load' });
        }
    };

    return (
        <div className="space-y-6 text-maintext">
            {/* Stats Summary Card */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                <StatCard icon={DollarSign} label="Total Earnings" value={`₹${stats?.totalRevenue?.toFixed(2) || '0.00'}`} color="primary" />
                <StatCard icon={TrendingUp} label="Taxable Base Amount" value={`₹${stats?.totalBase?.toFixed(2) || '0.00'}`} color="emerald-500" />
                <StatCard icon={PieChart} label="CGST (9%)" value={`₹${stats?.totalCgst?.toFixed(2) || '0.00'}`} color="amber-500" />
                <StatCard icon={PieChart} label="SGST (9%)" value={`₹${stats?.totalSgst?.toFixed(2) || '0.00'}`} color="pink-500" />
                <StatCard icon={Activity} label="IGST (18%)" value={`₹${stats?.totalIgst?.toFixed(2) || '0.00'}`} color="purple-500" />
            </div>

            {/* Invoices List Table */}
            <SectionCard 
                title="Invoice & Transaction Ledger"
                action={
                    <div className="relative w-48 sm:w-64">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-subtext" />
                        <input
                            type="text"
                            placeholder="Search by invoice, name..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            className="w-full pl-9 pr-4 py-1.5 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl text-xs sm:text-sm text-maintext focus:outline-none focus:border-primary transition-all"
                        />
                    </div>
                }
            >
                {loadingInvoices ? (
                    <LoadingSpinner />
                ) : invoices.length === 0 ? (
                    <div className="text-center py-12 text-subtext">No invoices found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs sm:text-sm">
                            <thead>
                                <tr className="border-b border-white/15 dark:border-white/10 text-subtext uppercase tracking-wider font-bold">
                                    <th className="py-3 px-2">Invoice Number</th>
                                    <th className="py-3 px-2">Date</th>
                                    <th className="py-3 px-2">Customer</th>
                                    <th className="py-3 px-2">Plan</th>
                                    <th className="py-3 px-2 text-right">Taxable</th>
                                    <th className="py-3 px-2 text-right">GST</th>
                                    <th className="py-3 px-2 text-right">Total</th>
                                    <th className="py-3 px-2">Gateway / ID</th>
                                    <th className="py-3 px-2 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv) => {
                                    const planName = inv.subscriptionId?.planId?.planName || 'Plan';
                                    const cycle = inv.subscriptionId?.billingCycle || 'mo';
                                    const gstSum = inv.igst > 0 ? inv.igst : (inv.cgst + inv.sgst);
                                    
                                    return (
                                        <tr key={inv._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="py-3.5 px-2 font-mono font-bold text-primary">{inv.invoiceNumber}</td>
                                            <td className="py-3.5 px-2 text-subtext">{new Date(inv.invoiceDate).toLocaleDateString('en-IN')}</td>
                                            <td className="py-3.5 px-2">
                                                <div className="font-bold">{inv.billingDetails?.name}</div>
                                                <div className="text-[10px] text-subtext">{inv.userId?.email || 'N/A'}</div>
                                            </td>
                                            <td className="py-3.5 px-2">
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-primary/20 text-primary border border-primary/10">
                                                    {planName} ({cycle})
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-2 text-right font-medium">₹{inv.baseAmount?.toFixed(2)}</td>
                                            <td className="py-3.5 px-2 text-right text-subtext">
                                                ₹{gstSum?.toFixed(2)}
                                                <div className="text-[9px] opacity-80">
                                                    {inv.igst > 0 ? '18% IGST' : '9%+9% CGST/SGST'}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-2 text-right font-bold text-maintext">₹{inv.totalAmount?.toFixed(2)}</td>
                                            <td className="py-3.5 px-2">
                                                <div className="text-xs uppercase font-bold text-white/70">{inv.paymentGateway}</div>
                                                <div className="text-[10px] text-subtext font-mono truncate max-w-[80px]" title={inv.paymentId}>{inv.paymentId}</div>
                                            </td>
                                            <td className="py-3.5 px-2 text-center">
                                                <button
                                                    onClick={() => handleDownload(inv.subscriptionId?._id || inv.subscriptionId, inv.invoiceNumber)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 dark:bg-white/5 hover:bg-primary hover:text-white rounded-lg transition-all text-xs font-bold border border-white/10"
                                                >
                                                    <FileText size={13} /> PDF
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Pagination controls */}
                        {pagination.pages > 1 && (
                            <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/10 text-xs sm:text-sm">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    className="px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 disabled:opacity-40 transition-all"
                                >
                                    Previous
                                </button>
                                <span className="text-subtext">Page {page} of {pagination.pages}</span>
                                <button
                                    disabled={page === pagination.pages}
                                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                    className="px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 disabled:opacity-40 transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </SectionCard>
        </div>
    );
};


const AdminDashboard = () => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();

    // Verify admin access
    const user = getUserData();
    const isAdmin = user?.token && (user?.email === ADMIN_EMAIL || user?.role === 'admin');

    useEffect(() => {
        if (!isAdmin) {
            navigate('/dashboard/chat', { replace: true });
        }
    }, [isAdmin, navigate]);

    if (!isAdmin) return null;

    const tabs = [
        { id: 'overview', label: t('overview'), icon: BarChart3 },
        { id: 'users', label: t('users'), icon: Users },
        { id: 'chat-sessions', label: 'Chat Sessions', icon: MessageSquare },
        { id: 'analytics', label: 'Analytics', icon: PieChart },
        { id: 'plans', label: t('plans'), icon: CreditCard },
        { id: 'billing', label: 'Billing Management', icon: DollarSign },
        { id: 'tool-limit', label: t('toolLimit') || 'Tool Limit', icon: Shield },
        { id: 'legal', label: t('legalPages'), icon: FileText },
        { id: 'helpdesk', label: t('helpDesk'), icon: Headphones },
        { id: 'knowledge', label: t('knowledge'), icon: BookOpen },
        { id: 'settings', label: t('settings'), icon: Settings },
    ];

    const renderTab = () => {
        switch (activeTab) {
            case 'overview': return <OverviewTab />;
            case 'users': return <UsersTab />;
            case 'chat-sessions': return <ChatSessionsTab />;
            case 'analytics': return <AnalyticsTab />;
            case 'plans': return <PlansTab />;
            case 'billing': return <BillingTab />;
            case 'tool-limit': return <ToolLimitTab />;
            case 'legal': return <LegalPagesTab />;
            case 'helpdesk': return <AdminHelpDesk isOpen={true} isEmbedded={true} />;
            case 'knowledge': return <KnowledgeBaseTab />;
            case 'settings': return <SettingsTab />;
            default: return <OverviewTab />;
        }
    };

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-7xl mx-auto p-3 sm:p-5 lg:p-8 space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/5 backdrop-blur-xl flex items-center justify-center shadow-lg border border-white/10 overflow-hidden shrink-0">
                            <img src={logo} alt="AISA" className="w-7 h-7 sm:w-9 sm:h-9 object-contain" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-maintext tracking-tight">{t('adminDashboard')}</h1>
                            <p className="text-[10px] sm:text-xs text-subtext font-semibold uppercase tracking-wider hidden sm:block">{t('platformManagementConsole')}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/chat')}
                        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-subtext hover:text-maintext hover:bg-white/20 dark:hover:bg-white/10 transition-all border border-white/20 dark:border-white/10 shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4" /> <span className="hidden xs:inline sm:inline">{t('backToChat')}</span>
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2 admin-horizontal-scrollbar scrollbar-hide">
                    {tabs.map(tab => (
                        <TabButton
                            key={tab.id}
                            active={activeTab === tab.id}
                            icon={tab.icon}
                            label={tab.label}
                            onClick={() => setActiveTab(tab.id)}
                        />
                    ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Suspense fallback={<LoadingSpinner />}>
                            {renderTab()}
                        </Suspense>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminDashboard;
