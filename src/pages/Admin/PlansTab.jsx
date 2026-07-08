import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Clock, CreditCard } from 'lucide-react';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';
import DeleteConfirmModal from '../../Components/DeleteConfirmModal';
import { LoadingSpinner } from './AdminCommon';

// Helper function to format feature checklist descriptions dynamically matching DB limits
const formatFeatureString = (feature, plan) => {
    if (!feature || !plan) return feature;
    let result = feature;

    // 1. Total AI messages / chat limit / Unlimited Chat
    if (/total AI messages/i.test(result) || /total messages/i.test(result) || /AI messages/i.test(result)) {
        if (plan.chatLimit === -1 || plan.chatScope === 'unlimited') {
            return "Unlimited AI Chat";
        } else {
            result = result.replace(/\d+/, plan.chatLimit ?? 100);
        }
    }

    // 2. Validity
    if (/months validity/i.test(result) || /month validity/i.test(result) || /days validity/i.test(result)) {
        const months = Math.round((plan.validityDays || 90) / 30);
        result = result.replace(/\d+/, months);
    }

    // 3. Images/day
    if (/Images\/day/i.test(result)) {
        result = result.replace(/\d+/, plan.imageLimit ?? 0);
    }

    // 4. Carousel/day
    if (/Carousel\/day/i.test(result)) {
        result = result.replace(/\d+/, plan.carouselLimit ?? 0);
    }

    // 5. Videos/day
    if (/Videos\/day/i.test(result)) {
        result = result.replace(/\d+/, plan.videoLimit ?? 0);
    }

    return result;
};

const PlansTab = () => {
    const { t } = useLanguage();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [form, setForm] = useState({
        planId: '',
        planName: '',
        priceMonthly: '',
        priceYearly: '',
        validityDays: '',
        features: ''
    });

    const [deleteModal, setDeleteModal] = useState({ isOpen: false, planId: null });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const data = await apiService.getPlans();
            setPlans(Array.isArray(data) ? data : data.plans || []);
        } catch (err) {
            console.error('Failed to fetch plans:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            const body = {
                planId: form.planId,
                planName: form.planName,
                priceMonthly: Number(form.priceMonthly),
                priceYearly: Number(form.priceYearly),
                validityDays: Number(form.validityDays),
                features: form.features.split(',').map(f => f.trim()).filter(Boolean)
            };

            let data;
            if (editingPlan) {
                data = await apiService.updatePlan(editingPlan._id, body);
            } else {
                data = await apiService.createPlan(body);
            }

            if (data.success) {
                toast.success(editingPlan ? 'Plan updated' : 'Plan created');
                resetForm();
                fetchPlans();
            } else {
                toast.error(data.message || 'Failed');
            }
        } catch (err) {
            toast.error('Failed to save plan');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.planId) return;
        try {
            await apiService.deletePlan(deleteModal.planId);
            toast.success('Plan deleted');
            setDeleteModal({ isOpen: false, planId: null });
            fetchPlans();
        } catch (err) {
            toast.error('Failed to delete plan');
            setDeleteModal({ isOpen: false, planId: null });
        }
    };

    const startEdit = (plan) => {
        setEditingPlan(plan);
        setForm({
            planId: plan.planId || '',
            planName: plan.planName || '',
            priceMonthly: plan.priceMonthly?.toString() || '',
            priceYearly: plan.priceYearly?.toString() || '',
            validityDays: plan.validityDays?.toString() ?? '90',
            features: (plan.features || []).map(f => formatFeatureString(f, plan)).join(', ')
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setForm({
            planId: '',
            planName: '',
            priceMonthly: '',
            priceYearly: '',
            validityDays: '',
            features: ''
        });
        setEditingPlan(null);
        setShowForm(false);
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button
                    onClick={() => { resetForm(); setShowForm(!showForm); }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                >
                    <Plus className="w-4 h-4" /> New Plan
                </button>
            </div>

            {/* Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white/30 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-5 space-y-4">
                            <h3 className="font-bold text-maintext">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-subtext">Plan ID</label>
                                    <input placeholder="e.g. starter-plan" value={form.planId} onChange={e => setForm(p => ({ ...p, planId: e.target.value }))}
                                        className="w-full bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 text-maintext" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-subtext">Plan Name</label>
                                    <input placeholder="e.g. Starter" value={form.planName} onChange={e => setForm(p => ({ ...p, planName: e.target.value }))}
                                        className="w-full bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 text-maintext" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-subtext">Monthly Price (₹)</label>
                                    <input placeholder="e.g. 499" type="number" value={form.priceMonthly} onChange={e => setForm(p => ({ ...p, priceMonthly: e.target.value }))}
                                        className="w-full bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 text-maintext no-spinner" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-subtext">Yearly Price (₹)</label>
                                    <input placeholder="e.g. 4990" type="number" value={form.priceYearly} onChange={e => setForm(p => ({ ...p, priceYearly: e.target.value }))}
                                        className="w-full bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 text-maintext no-spinner" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-subtext">Validity (Days)</label>
                                    <input placeholder="e.g. 30" type="number" value={form.validityDays} onChange={e => setForm(p => ({ ...p, validityDays: e.target.value }))}
                                        className="w-full bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 text-maintext no-spinner" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-subtext">Features List (Comma-separated)</label>
                                <input placeholder="e.g. Unlimited AI Chat, CashFlow Explorer, Web & Deep Search" value={form.features} onChange={e => setForm(p => ({ ...p, features: e.target.value }))}
                                    className="w-full bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 text-maintext" />
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button onClick={resetForm} className="px-4 py-2 rounded-xl text-sm font-bold text-subtext hover:text-maintext hover:bg-white/20 transition-all">Cancel</button>
                                <button onClick={handleSubmit} className="px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                                    {editingPlan ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Plan List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map(plan => (
                    <div key={plan._id} className="bg-white/30 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-5 hover:border-primary/20 transition-all">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h4 className="font-bold text-maintext">{plan.planName}</h4>
                                <div className="mt-1 space-y-0.5">
                                    <p className="text-lg font-black text-primary leading-none">₹{plan.priceMonthly}<span className="text-[10px] text-subtext font-normal ml-1">/mo</span></p>
                                    <p className="text-[10px] text-subtext">Yearly: ₹{plan.priceYearly} (₹{Math.round(plan.priceYearly / 12)}/mo)</p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => startEdit(plan)} className="p-2 rounded-lg hover:bg-primary/10 text-subtext hover:text-primary transition-all">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => setDeleteModal({ isOpen: true, planId: plan._id })} className="p-2 rounded-lg hover:bg-red-500/10 text-subtext hover:text-red-500 transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="space-y-1.5 text-xs text-subtext border-t border-white/10 pt-3">
                            <p className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-primary animate-pulse" />
                                Validity: <span className="font-semibold text-maintext">{plan.validityDays} days</span>
                            </p>
                            <p className="flex items-center gap-2 text-[10px] opacity-70">
                                <CreditCard className="w-3.5 h-3.5" />
                                ID: {plan.planId}
                            </p>
                        </div>
                    </div>
                ))}
                {plans.length === 0 && <p className="text-subtext text-sm col-span-full text-center py-8">No plans created yet</p>}
            </div>

            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, planId: null })}
                onConfirm={handleDelete}
                title="Delete Plan?"
                description="Are you sure you want to delete this plan? This action cannot be undone."
            />
        </div>
    );
};

export default PlansTab;
