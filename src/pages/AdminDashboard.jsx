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
const FinanceTab = React.lazy(() => import('./Admin/FinanceTab'));



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
        { id: 'finance', label: 'Finance', icon: TrendingUp },
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
            case 'finance': return <FinanceTab />;
            case 'tool-limit': return <ToolLimitTab />;
            case 'legal': return <LegalPagesTab />;
            case 'helpdesk': return <AdminHelpDesk isOpen={true} isEmbedded={true} />;
            case 'knowledge': return <KnowledgeBaseTab />;
            case 'settings': return <SettingsTab />;
            default: return <OverviewTab />;
        }
    };

    return (
        <div className="w-full min-h-full">
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
