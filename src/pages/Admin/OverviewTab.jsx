import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { apiService } from '../../services/apiService';
import { Activity, RefreshCw, Users, DollarSign, Headphones } from 'lucide-react';
import { StatCard, SectionCard } from './AdminCommon';

const OverviewTab = () => {
    const { t } = useLanguage();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async (isManual = false) => {
        if (isManual) setRefreshing(true);
        try {
            const data = await apiService.getAdminOverviewStats();
            setStats(data.stats || data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
        // Polling for real-time updates every 10 seconds
        const interval = setInterval(() => fetchStats(), 10000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            <p className="text-subtext text-sm">{t('loadingRealTimeOverview')}</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-subtext uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" /> {t('livePlatformActivity')}
                </h2>
                <button
                    onClick={() => fetchStats(true)}
                    disabled={refreshing}
                    className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-all disabled:opacity-50"
                    title="Manual Refresh"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard icon={Users} label={t('totalUsers')} value={stats?.totalUsers ?? 0} />
                <StatCard icon={Activity} label={t('activeSubscriptions')} value={stats?.activeSubscriptions ?? 0} color="emerald-500" />
                <StatCard icon={DollarSign} label={t('totalRevenue')} value={`₹${stats?.totalRevenue ?? 0}`} color="amber-500" />
                <StatCard icon={Headphones} label={t('support')} value={stats?.pendingTickets ?? 0} color="primary" trend={stats?.pendingTickets > 0 ? "Action Required" : "All Clear"} />
            </div>

            {stats?.toolUsage && stats.toolUsage.length > 0 && (
                <SectionCard title={t('toolUsageAnalytics')}>
                    <div className="space-y-3">
                        {stats.toolUsage.map((tool, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white/20 dark:bg-white/5 rounded-xl border border-white/10">
                                <span className="font-semibold text-maintext text-sm">{tool._id || 'Unknown'}</span>
                                <div className="flex items-center gap-4 text-xs text-subtext">
                                    <span className="font-bold text-primary">{tool.count} uses</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            )}
        </div>
    );
};

export default OverviewTab;
