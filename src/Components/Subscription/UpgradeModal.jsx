import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, Crown, Rocket, Loader } from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import usePayment from '../../hooks/usePayment';
import { getUserData } from '../../userStore/userData';
import { useNavigate } from 'react-router-dom';

const UpgradeModal = () => {
    const { isUpgradeModalOpen, setIsUpgradeModalOpen, plan } = useSubscription();
    const { handlePayment, loading } = usePayment();
    const navigate = useNavigate();
    const user = getUserData();
    const [processingPlanId, setProcessingPlanId] = React.useState(null);

    React.useEffect(() => {
        if (!loading) setProcessingPlanId(null);
    }, [loading]);

    if (!isUpgradeModalOpen) return null;

    const plans = [
        {
            name: "Pro",
            price: "₹499",
            period: "/month",
            icon: <Zap className="w-6 h-6 text-blue-500" />,
            features: [
                "200 Images",
                "20 Videos",
                "200 Deep Searches",
                "100 Audio Conversions",
                "200 Doc Conversions",
                "Unlimited Code Writer",
                "3000 Chat messages"
            ],
            color: "from-blue-600 to-indigo-600",
            bestFor: "Individual creators"
        },
        {
            name: "King",
            price: "₹2499",
            period: "/month",
            icon: <Crown className="w-6 h-6 text-amber-500" />,
            features: [
                "Unlimited Images",
                "200 Videos",
                "Unlimited Deep Search",
                "Unlimited Audio & Docs",
                "Unlimited Chat",
                "API Access Enabled",
                "Priority Support"
            ],
            color: "from-amber-500 to-orange-600",
            featured: true,
            bestFor: "Power users & Developers"
        }
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsUpgradeModalOpen(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-4xl bg-secondary border border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
                >
                    {/* Close Button */}
                    <button
                        onClick={() => setIsUpgradeModalOpen(false)}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface transition-colors z-10"
                    >
                        <X className="w-5 h-5 text-subtext" />
                    </button>

                    {/* Left Side: Illustration / Branding */}
                    <div className="w-full md:w-1/3 bg-gradient-to-br from-primary/10 to-primary/5 p-8 flex flex-col justify-center items-center text-center">
                        <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                            <Rocket className="w-10 h-10 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-maintext mb-2">Upgrade Your Plan</h2>
                        <p className="text-subtext text-sm">
                            You've used all your free credits. Unlock more power and speed with our premium plans.
                        </p>

                        <div className="mt-8 space-y-4 w-full">
                            <div className="p-3 bg-surface/50 rounded-xl border border-border flex items-center gap-3">
                                <Check className="w-4 h-4 text-green-500" />
                                <span className="text-xs text-subtext">Faster Response Speed</span>
                            </div>
                            <div className="p-3 bg-surface/50 rounded-xl border border-border flex items-center gap-3">
                                <Check className="w-4 h-4 text-green-500" />
                                <span className="text-xs text-subtext">Priority Support</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Plans */}
                    <div className="flex-1 p-6 pt-12 md:p-8 md:pt-14 grid grid-cols-1 md:grid-cols-2 gap-6 bg-secondary">
                        {plans.map((p, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -5 }}
                                className={`relative p-6 rounded-2xl border-2 flex flex-col ${p.featured ? 'border-amber-500 bg-amber-500/5' : 'border-border bg-surface/30'}`}
                            >
                                {p.featured && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                        Most Popular
                                    </div>
                                )}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 rounded-lg bg-surface">{p.icon}</div>
                                    <span className="text-xs text-subtext font-medium">{p.bestFor}</span>
                                </div>
                                <h3 className="text-xl font-bold text-maintext mb-1">{p.name}</h3>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-2xl font-bold text-maintext">{p.price}</span>
                                    <span className="text-subtext text-sm">{p.period}</span>
                                </div>

                                <ul className="space-y-3 mb-8 flex-1">
                                    {p.features.map((f, fIdx) => (
                                        <li key={fIdx} className="flex items-start gap-2 text-sm text-subtext">
                                            <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    disabled={loading}
                                    onClick={() => {
                                        if (!user) {
                                            navigate('/login');
                                            setIsUpgradeModalOpen(false);
                                            return;
                                        }
                                        setProcessingPlanId(p.name);
                                        handlePayment(p, user, () => {
                                            setIsUpgradeModalOpen(false);
                                            setProcessingPlanId(null);
                                            window.location.reload();
                                        });
                                    }}
                                    className={`w-full py-3 rounded-xl font-bold text-white transition-all transform active:scale-95 bg-gradient-to-r ${p.color} shadow-lg hover:shadow-xl flex items-center justify-center gap-2`}
                                >
                                    {(loading && processingPlanId === p.name) ? <Loader className="w-5 h-5 animate-spin" /> : `Choose ${p.name}`}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default UpgradeModal;
