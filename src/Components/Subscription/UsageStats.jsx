import React from 'react';
import { motion } from 'framer-motion';
import { useSubscription } from '../../context/SubscriptionContext';
import { Image, Video, Search, MessageSquare, FileText, Code } from 'lucide-react';

const UsageStats = () => {
    const { usage, planLimits, plan, loading } = useSubscription();

    if (loading) return null;

    const stats = [
        { label: 'Images', current: usage?.imageCount || 0, limit: planLimits?.imageCount || 5, icon: <Image size={14} /> },
        { label: 'Videos', current: usage?.videoCount || 0, limit: planLimits?.videoCount || 5, icon: <Video size={14} /> },
        { label: 'Deep Search', current: usage?.deepSearchCount || 0, limit: planLimits?.deepSearchCount || 20, icon: <Search size={14} /> },
        { label: 'Documents', current: usage?.documentConvertCount || 0, limit: planLimits?.documentConvertCount || 15, icon: <FileText size={14} /> },
        { label: 'Code', current: usage?.codeWriterCount || 0, limit: planLimits?.codeWriterCount || 50, icon: <Code size={14} /> },
    ];

    const getPercentage = (curr, lim) => {
        if (lim === Infinity) return 0;
        return Math.min(100, (curr / lim) * 100);
    };

    return (
        <div className="p-4 bg-surface/30 rounded-2xl border border-border mt-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-maintext uppercase tracking-wider">Your Usage ({plan})</h3>
                <span className="text-[10px] text-primary font-medium px-2 py-0.5 bg-primary/10 rounded-full cursor-pointer hover:bg-primary/20 transition-colors">
                    Upgrade
                </span>
            </div>
            
            <div className="space-y-4">
                {stats.map((s, i) => (
                    <div key={i}>
                        <div className="flex justify-between items-center text-[11px] mb-1">
                            <div className="flex items-center gap-1.5 text-subtext">
                                {s.icon}
                                <span>{s.label}</span>
                            </div>
                            <span className="text-maintext font-medium">
                                {s.current} / {s.limit === Infinity ? '∞' : s.limit}
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-border/50 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${getPercentage(s.current, s.limit)}%` }}
                                className={`h-full rounded-full ${
                                    getPercentage(s.current, s.limit) > 90 ? 'bg-red-500' : 
                                    getPercentage(s.current, s.limit) > 70 ? 'bg-amber-500' : 'bg-primary'
                                }`}
                            />
                        </div>
                        {s.limit !== Infinity && s.limit - s.current === 1 && (
                            <p className="text-[9px] text-amber-600 mt-1 animate-pulse">
                                Only 1 left this month!
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UsageStats;
