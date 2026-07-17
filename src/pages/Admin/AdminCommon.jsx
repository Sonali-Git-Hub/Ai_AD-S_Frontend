import React from 'react';
import { motion } from 'framer-motion';

export const ADMIN_EMAIL = 'admin@uwo24.com';

export const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
);

// ─── Tab Button ───
export const TabButton = ({ active, icon: Icon, label, onClick }) => (
    <button
        onClick={onClick}
        title={label}
        className={`flex items-center gap-2 px-3 py-2.5 sm:px-5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${active
            ? 'bg-primary text-white shadow-lg shadow-primary/30'
            : 'text-subtext hover:bg-white/20 dark:hover:bg-white/10 hover:text-maintext'
            }`}
    >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="text-[11px] sm:text-xs md:text-sm font-semibold">{label}</span>
    </button>
);

// ─── Stat Card ───
export const StatCard = ({ icon: Icon, label, value, color = 'primary', trend }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-primary/30 transition-all"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-${color}/10 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${color}`} />
                </div>
                {trend && (
                    <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">
                        {trend}
                    </span>
                )}
            </div>
            <p className="text-2xl font-black text-maintext">{value}</p>
            <p className="text-xs font-semibold text-subtext uppercase tracking-wider mt-1">{label}</p>
        </div>
    </motion.div>
);

// ─── Section Card ───
export const SectionCard = ({ title, children, action }) => (
    <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/20 dark:border-white/10">
            <h3 className="font-bold text-maintext text-lg">{title}</h3>
            {action}
        </div>
        <div className="p-5">{children}</div>
    </div>
);
