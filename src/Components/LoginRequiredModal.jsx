import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, X, UserPlus, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginRequiredModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [toolName, setToolName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const handleLoginRequired = (e) => {
            setToolName(e.detail?.toolName || 'AISA™ Magic Tools');
            setIsOpen(true);
        };
        window.addEventListener('login_required', handleLoginRequired);
        return () => window.removeEventListener('login_required', handleLoginRequired);
    }, []);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-md flex justify-center items-center p-4"
                    onClick={() => setIsOpen(false)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative bg-zinc-900 border border-white/10 rounded-[32px] p-8 max-w-sm w-full shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Elegant background glows */}
                        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

                        {/* Header with Close */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                                <Lock className="w-7 h-7 text-white" />
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-full transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Text */}
                        <h3 className="text-2xl font-black text-white mb-2 tracking-tight">
                            Login Required
                        </h3>
                        <p className="text-white/60 text-sm mb-8 leading-relaxed">
                            Sign in to your <span className="text-white font-bold">AISA™</span> account to unlock <span className="text-primary font-bold">{toolName}</span> and other powerful AI magic tools.
                        </p>

                        {/* CTAs */}
                        <div className="space-y-3">
                            <button
                                onClick={() => { setIsOpen(false); navigate('/login'); }}
                                className="w-full py-4 rounded-2xl bg-white text-black font-black text-sm hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2.5 shadow-xl shadow-white/5"
                            >
                                <LogIn className="w-4.5 h-4.5" />
                                Log In Now
                            </button>
                            <button
                                onClick={() => { setIsOpen(false); navigate('/signup'); }}
                                className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-sm hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center gap-2.5"
                            >
                                <UserPlus className="w-4.5 h-4.5" />
                                Create Account
                            </button>
                        </div>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full mt-6 py-2 text-xs font-bold text-white/20 hover:text-white/50 transition-colors uppercase tracking-widest"
                        >
                            Maybe Later
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoginRequiredModal;
