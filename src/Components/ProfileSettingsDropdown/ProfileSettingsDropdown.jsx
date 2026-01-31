import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, Bell, Sparkles, LayoutGrid,
    Database, Shield, Lock, User,
    X, ChevronDown, Play, Globe,
    LogOut, Monitor, Mic, Check,
    ChevronLeft, Trash2, ShieldCheck, Mail, Volume2, Plus,
    Palette, Type, RefreshCcw, Languages, Crown, History, Calendar, CreditCard, Download
} from 'lucide-react';
import { jsPDF } from "jspdf";
import { usePersonalization } from '../../context/PersonalizationContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { getUserData, getAccounts, removeAccount, setUserData, updateUser, userData } from '../../userStore/userData';
import { useRecoilState } from 'recoil';
import toast from 'react-hot-toast';
import axios from 'axios';
import { apis } from '../../types';
import CustomSelect from '../CustomSelect/CustomSelect';
import PricingModal from '../Pricing/PricingModal';
import usePayment from '../../hooks/usePayment';

const ProfileSettingsDropdown = ({ onClose, onLogout }) => {
    const [currentUserData, setUserRecoil] = useRecoilState(userData);
    const user = currentUserData.user || getUserData();
    const {
        personalizations,
        updatePersonalization,
        resetPersonalizations,
        notifications,
        deleteNotification,
        clearAllNotifications,
        chatSessions
    } = usePersonalization();
    const { theme, setTheme, accentColor, setAccentColor, ACCENT_COLORS } = useTheme();
    const { language, setLanguage, languages, t } = useLanguage();
    const [activeTab, setActiveTab] = useState('general');
    const [view, setView] = useState('sidebar'); // 'sidebar' or 'detail' for mobile
    const [isPlayingVoice, setIsPlayingVoice] = useState(false);
    const [accounts, setAccounts] = useState(getAccounts());
    const [nicknameInput, setNicknameInput] = useState('');
    const [showPricingModal, setShowPricingModal] = useState(false);
    const { handlePayment, loading: paymentLoading } = usePayment();
    const [transactions, setTransactions] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        setNicknameInput(personalizations.account?.nickname || '');
    }, [personalizations.account?.nickname]);

    useEffect(() => {
        if (activeTab === 'account' && user?.token) {
            fetchTransactions();
        }
    }, [activeTab]);

    const generateInvoice = (tx) => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(63, 81, 181); // Primary Color
        doc.text("INVOICE", 105, 20, { align: "center" });

        // Brand / Company Info
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text("AISA AI Platforms", 20, 40);
        doc.setFontSize(10);
        doc.text("admin@uwo24.com", 20, 45);

        // Invoice Details
        doc.text(`Invoice No: ${tx._id.substring(0, 8).toUpperCase()}`, 140, 40);
        doc.text(`Date: ${new Date(tx.createdAt).toLocaleDateString()}`, 140, 45);
        doc.text(`Order ID: ${tx.orderId || 'N/A'}`, 140, 50);

        // Divider
        doc.setLineWidth(0.5);
        doc.line(20, 55, 190, 55);

        // Bill To
        doc.setFontSize(12);
        doc.text("Bill To:", 20, 70);
        doc.setFontSize(10);
        doc.text(user.name || "Customer", 20, 75);
        doc.text(user.email || "", 20, 80);

        // Table Header
        doc.setFillColor(245, 245, 245);
        doc.rect(20, 90, 170, 10, 'F');
        doc.setFont("helvetica", "bold");
        doc.text("Description", 25, 96);
        doc.text("Amount", 170, 96, { align: "right" });

        // Table Content
        doc.setFont("helvetica", "normal");
        doc.text(`${tx.plan || 'Subscription'} Plan`, 25, 110);
        doc.text(`INR ${tx.amount}`, 170, 110, { align: "right" }); // Amount is already formatting in history? No, history divides by 100 usually if paise

        // Divider
        doc.line(20, 120, 190, 120);

        // Total
        doc.setFont("helvetica", "bold");
        doc.text("Total", 140, 130);
        doc.text(`INR ${tx.amount}`, 170, 130, { align: "right" });

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("Thank you for your business!", 105, 160, { align: "center" });

        doc.save(`Invoice_${tx.orderId || tx._id}.pdf`);
    };

    const fetchTransactions = async () => {
        try {
            setLoadingHistory(true);
            const res = await axios.get(apis.getPaymentHistory, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            setTransactions(res.data.filter(tx => tx.amount > 0));
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleAccountLogout = (email) => {
        removeAccount(email);
        const updated = getAccounts();
        setAccounts(updated);
        if (updated.length === 0) {
            onLogout();
            onClose();
        } else if (user.email === email) {
            // If logging out current user, active user changed in storage, reload or refresh
            window.location.reload();
        }
    };

    const handleSwitchAccount = (acc) => {
        setUserData(acc);
        window.location.reload();
    };

    const handleSaveNickname = async () => {
        if (nicknameInput) {
            // 1. Optimistic Update: Update Local immediately
            const updatedUser = updateUser({ name: nicknameInput });
            setUserRecoil({ user: updatedUser });
            updatePersonalization('account', { nickname: nicknameInput });

            // 2. Try Backend Sync
            try {
                if (user?.token) {
                    await axios.put(apis.profile, { name: nicknameInput }, {
                        headers: { 'Authorization': `Bearer ${user.token}` }
                    });
                }
                toast.success('Profile updated successfully');
            } catch (error) {
                console.warn('Backend sync failed, but local profile updated', error);
                // If it's a 401/Demo user, we still consider it "success" for the session
                if (error.response?.status === 401 || !user?.token) {
                    toast.success('Profile updated (Offline/Demo Mode)');
                } else {
                    toast.success('Profile updated locally');
                }
            }
        }
    };

    const tabs = [
        { id: 'general', label: t('general'), icon: Settings },
        { id: 'notifications', label: t('notifications'), icon: Bell },
        { id: 'personalization', label: t('personalization'), icon: Sparkles },
        { id: 'data', label: t('dataControls'), icon: Database },
        { id: 'security', label: t('security'), icon: Shield },
        { id: 'account', label: t('account'), icon: User },
    ];

    // Load voices on mount
    useEffect(() => {
        const loadVoices = () => {
            window.speechSynthesis.getVoices();
        };
        if ('speechSynthesis' in window) {
            loadVoices();
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const handleVoicePreview = () => {
        if ('speechSynthesis' in window) {
            if (isPlayingVoice) {
                window.speechSynthesis.cancel();
                setIsPlayingVoice(false);
                return;
            }

            const utterance = new SpeechSynthesisUtterance("Hi there! I'm your AI assistant. This is what I sound like.");
            const voices = window.speechSynthesis.getVoices();

            const selectedVoiceName = personalizations.general?.voice || 'Arbor';
            const matchedVoice = voices.find(v =>
                v.name.toLowerCase().includes(selectedVoiceName.toLowerCase())
            ) || voices.find(v => v.lang.startsWith('en') && v.name.includes('Premium')) || voices[0];

            if (matchedVoice) {
                utterance.voice = matchedVoice;
            }

            utterance.onend = () => setIsPlayingVoice(false);
            utterance.onerror = () => setIsPlayingVoice(false);

            setIsPlayingVoice(true);
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleTabClick = (id) => {
        setActiveTab(id);
        setView('detail');
    };

    // Helper for rendering dropdowns
    const renderDropdown = (value, options, onChange, icon) => (
        <div className="w-[160px] sm:w-[200px]">
            <CustomSelect
                value={value}
                options={options}
                onChange={onChange}
                icon={icon}
            />
        </div>
    );

    const renderToggle = (section, field, value) => (
        <button
            onClick={() => updatePersonalization(section, { [field]: !value })}
            className={`w-11 h-6 rounded-full p-1 transition-all duration-300 shrink-0 ${value ? 'bg-primary' : 'bg-gray-200 dark:bg-zinc-700'}`}
        >
            <div className={`w-4 h-4 rounded-full transition-transform duration-300 shadow-sm bg-white ${value ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    );

    const renderSettingRow = (label, description, control) => (
        <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-white/5 last:border-0">
            <div className="flex flex-col gap-1 pr-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
                {description && <span className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">{description}</span>}
            </div>
            {control}
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="space-y-2 animate-in fade-in duration-300">
                        {renderSettingRow(t('appearance'), t('appearanceDesc'), renderDropdown(
                            t(theme),
                            [t('system'), t('dark'), t('light')],
                            (e) => setTheme(e.target.value === t('system') ? 'system' : e.target.value === t('dark') ? 'dark' : 'light'),
                            Monitor
                        ))}



                        {renderSettingRow(t('accentColor'), t('accentColorDesc'), (
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-4 h-4 rounded-full shadow-sm transition-all duration-300 ring-2 ring-offset-2 ring-primary/20"
                                    style={{ backgroundColor: `hsl(${ACCENT_COLORS[accentColor] || ACCENT_COLORS['Default']})` }}
                                />
                                {renderDropdown(
                                    accentColor,
                                    Object.keys(ACCENT_COLORS || {}),
                                    (e) => setAccentColor(e.target.value),
                                    Palette
                                )}
                            </div>
                        ))}

                        {renderSettingRow(t('language'), t('languageDesc'), renderDropdown(
                            language,
                            languages || ['English'],
                            (e) => setLanguage(e.target.value),
                            Languages
                        ))}


                    </div>
                );
            case 'notifications':
                return (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between pb-2">
                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('inbox')} ({notifications.length})</h3>
                            {notifications.length > 0 && (
                                <button
                                    onClick={clearAllNotifications}
                                    className="text-xs font-semibold text-primary hover:underline transition-all"
                                >
                                    {t('clearAllNotifications')}
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            {notifications.length > 0 ? (
                                notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className="group p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-white/5 relative hover:border-primary/20 transition-all shadow-sm"
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex flex-col gap-1 pr-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${notif.type === 'alert' ? 'bg-red-500' : notif.type === 'update' ? 'bg-blue-500' : 'bg-primary'}`} />
                                                    <h4 className="text-[15px] font-bold text-gray-900 dark:text-white leading-tight">{notif.title}</h4>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mt-1">
                                                    {notif.desc}
                                                </p>
                                                <span className="text-[11px] text-gray-400 mt-2 font-medium">
                                                    {new Date(notif.time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => deleteNotification(notif.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors bg-white dark:bg-zinc-800 rounded-lg border border-gray-100 dark:border-white/10 shrink-0"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 px-8 text-center grayscale opacity-60">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                        <Bell className="w-8 h-8" />
                                    </div>
                                    <h4 className="text-gray-900 dark:text-white font-bold">{t('youreAllCaughtUp')}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-[200px]">{t('checkBackLater')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'personalization':
                return (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="space-y-2">
                            {renderSettingRow(t('fontSize'), t('fontSizeDesc'), renderDropdown(
                                t(personalizations.personalization?.fontSize?.toLowerCase() || 'medium'),
                                [t('small'), t('medium'), t('large'), t('extraLarge')],
                                (e) => {
                                    const sizeMap = { [t('small')]: 'Small', [t('medium')]: 'Medium', [t('large')]: 'Large', [t('extraLarge')]: 'Extra Large' };
                                    updatePersonalization('personalization', { fontSize: sizeMap[e.target.value] });
                                },
                                Type
                            ))}
                            {renderSettingRow(t('fontStyle'), t('fontStyleDesc'), renderDropdown(
                                t(personalizations.personalization?.fontStyle?.toLowerCase() || 'default'),
                                [t('default'), t('serif'), t('mono'), t('sans'), t('rounded')],
                                (e) => {
                                    const styleMap = { [t('default')]: 'Default', [t('serif')]: 'Serif', [t('mono')]: 'Mono', [t('sans')]: 'Sans', [t('rounded')]: 'Rounded' };
                                    updatePersonalization('personalization', { fontStyle: styleMap[e.target.value] });
                                },
                                RefreshCcw
                            ))}
                            {renderSettingRow(t('emojiUsage'), t('emojiUsageDesc'), renderDropdown(
                                t(personalizations.personalization?.emojiUsage?.toLowerCase() || 'moderate'),
                                [t('none'), t('minimal'), t('moderate'), t('expressive')],
                                (e) => {
                                    const usageMap = { [t('none')]: 'None', [t('minimal')]: 'Minimal', [t('moderate')]: 'Moderate', [t('expressive')]: 'Expressive' };
                                    updatePersonalization('personalization', { emojiUsage: usageMap[e.target.value] });
                                },
                                Sparkles
                            ))}
                        </div>
                    </div>
                );

            case 'data':
                return (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="space-y-2">
                            {renderSettingRow(t('chatHistory'), t('chatHistoryDesc'), renderToggle('dataControls', 'chatHistory', personalizations.dataControls?.chatHistory === 'On'))}
                        </div>

                        <div className="pt-4">
                            <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">{t('recentChatHistory')}</h4>
                            <div className="max-h-[220px] overflow-y-auto space-y-2 pr-2 custom-scrollbar-light">
                                {chatSessions && chatSessions.length > 0 ? (
                                    chatSessions.map((session) => (
                                        <div
                                            key={session.sessionId}
                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-white/5 group hover:border-primary/30 transition-all shadow-sm"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                    {session.title || "New Chat"}
                                                </p>
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {new Date(session.lastModified).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    window.location.href = `/dashboard/chat/${session.sessionId}`;
                                                    onClose();
                                                }}
                                                className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary text-[10px] font-bold rounded-lg transition-all hover:text-white"
                                            >
                                                {t('view')}
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-10 text-center bg-gray-50 dark:bg-zinc-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">{t('noRecentChats')}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="py-6 mt-4 p-4 bg-red-50 dark:bg-red-500/5 rounded-xl border border-red-100 dark:border-red-500/10">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-red-900 dark:text-red-400">{t('deleteAllChats')}</p>
                                    <p className="text-xs text-red-700 dark:text-red-500/70">{t('thisActionCannotBeUndone')}</p>
                                </div>
                                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shrink-0">
                                    <Trash2 className="w-4 h-4" /> {t('clearAll')}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'security':
                return (
                    <div className="space-y-4 animate-in fade-in duration-300">

                        <div className="flex flex-col gap-4 mt-6">
                            <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">{t('activeSessions')} ({accounts.length})</h4>

                            <div className="space-y-3">
                                {accounts.map((acc) => (
                                    <div key={acc.email} className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-white/5 hover:border-primary/20 transition-all shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                                    {acc.avatar ? <img src={acc.avatar} alt="" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-primary" />}
                                                </div>
                                                {acc.email === user?.email && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-[#1f1f1f] rounded-full" title="Current Session" />}
                                            </div>
                                            <div>
                                                <p className="text-[14px] font-bold text-gray-900 dark:text-white leading-tight">{acc.name || 'User'}</p>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{acc.email}</p>
                                                {acc.email === user?.email && <p className="text-[10px] text-green-600 dark:text-green-400 font-bold uppercase tracking-tighter mt-0.5">{t('currentSession')}</p>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {acc.email !== user?.email && (
                                                <button
                                                    onClick={() => handleSwitchAccount(acc)}
                                                    className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white text-[10px] font-bold rounded-lg transition-all"
                                                >
                                                    {t('switch')}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleAccountLogout(acc.email)}
                                                className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors bg-white dark:bg-zinc-800 rounded-lg border border-gray-100 dark:border-white/10"
                                                title="Logout this session"
                                            >
                                                <LogOut className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'account':
                return (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="space-y-4">
                            <div className="flex flex-col gap-2 relative group">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{t('displayName')}</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={nicknameInput}
                                        onChange={(e) => setNicknameInput(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-xl p-3 pr-16 text-sm text-gray-900 dark:text-white focus:border-primary outline-none transition-colors"
                                        placeholder={t('yourNickname')}
                                    />
                                    <button
                                        onClick={handleSaveNickname}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-lg hover:opacity-90 transition-all shadow-sm"
                                    >
                                        {t('save')}
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 py-1">
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{t('loginId')}</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" /> {user?.email || 'user@example.com'}
                                </span>
                            </div>

                            <div className="flex flex-col gap-2 pt-2">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{t('currentPlan')}</label>
                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                            <Crown className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-base font-bold text-gray-900 dark:text-white capitalize">
                                                {t((user?.plan || 'basic').toLowerCase() + 'Plan')} {t('currentPlan')}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {user?.plan === 'King' ? t('unlimitedAccess') : user?.plan === 'Pro' ? t('advancedFeatures') : t('standardAccess')}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowPricingModal(true)}
                                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-lg transition-all shadow-sm shadow-primary/20"
                                    >
                                        {t('upgrade')}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Transaction History Section */}
                        <div className="pt-6 border-t border-gray-100 dark:border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <History className="w-4 h-4" /> {t('transactionHistory')}
                                </h4>
                                <button
                                    onClick={() => setShowHistory(!showHistory)}
                                    className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                                >
                                    {showHistory ? t('hideHistory') : t('viewHistory')}
                                </button>
                            </div>

                            {showHistory && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    {
                                        loadingHistory ? (
                                            <div className="text-center py-8 text-sm text-gray-400">{t('loadingHistory')}</div>
                                        ) : transactions.length > 0 ? (
                                            <div className="space-y-3">
                                                {transactions.map((tx) => (
                                                    <div key={tx._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-white/5">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.status === 'success' || tx.status === 'Success' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-600'}`}>
                                                                <CreditCard className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">{tx.plan || t('subscription')}</p>
                                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" />
                                                                    {new Date(tx.createdAt).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right flex flex-col items-end gap-1">
                                                            <p className="text-sm font-bold text-gray-900 dark:text-white">₹{tx.amount}</p>
                                                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${tx.status === 'success' || tx.status === 'Success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700'}`}>
                                                                {tx.status}
                                                            </span>
                                                            <button
                                                                onClick={() => generateInvoice(tx)}
                                                                className="mt-1 flex items-center gap-1 text-[10px] font-medium text-gray-500 hover:text-primary transition-colors"
                                                                title="Download Invoice"
                                                            >
                                                                <Download className="w-3 h-3" /> {t('invoice')}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 bg-gray-50 dark:bg-zinc-800/30 rounded-xl border border-dashed border-gray-200 dark:border-white/10">
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('noTransactionHistory')}</p>
                                            </div>
                                        )
                                    }
                                </div>
                            )}
                        </div >

                        <div className="pt-6 border-t border-gray-100 dark:border-white/5 flex flex-col gap-3">
                            <button onClick={() => { onLogout(); onClose(); }} className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors text-left flex items-center gap-2">
                                <Plus className="w-4 h-4" /> {t('addOrSwitchAccount')}
                            </button>
                            <button onClick={resetPersonalizations} className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-primary transition-colors text-left flex items-center gap-2">
                                <Database className="w-4 h-4" /> {t('resetAllSettings')}
                            </button>
                            <button className="text-sm font-semibold text-red-600 dark:text-red-500 hover:text-red-700 transition-colors text-left flex items-center gap-2">
                                <Trash2 className="w-4 h-4" /> {t('permanentDeleteAccount')}
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return createPortal(
        <AnimatePresence>
            {!showPricingModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-[2px] p-0 sm:p-4" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="w-full sm:max-w-[850px] h-full sm:h-[600px] bg-white dark:bg-[#161B2E] sm:rounded-[2rem] flex flex-col sm:flex-row shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] font-sans ring-1 ring-black/5 dark:ring-white/5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Sidebar / List View */}
                        <div className={`
                        w-full sm:w-[240px] bg-[#F9F9F9] dark:bg-[#0E1220] flex flex-col shrink-0 border-r border-gray-100 dark:border-white/5
                        ${view === 'detail' ? 'hidden sm:flex' : 'flex'}
                    `}>
                            <div className="p-4 sm:p-5 flex items-center justify-between sm:justify-start">
                                <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors sm:hidden">
                                    <X className="w-6 h-6" />
                                </button>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white sm:ml-2">{t('settings')}</h2>
                                <button onClick={onClose} className="hidden sm:block ml-auto p-1 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <nav className="flex-1 overflow-y-auto px-2 pb-4">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabClick(tab.id)}
                                        className={`w-full flex items-center justify-between sm:justify-start gap-3 px-4 py-3 sm:py-2.5 rounded-xl text-[15px] sm:text-sm text-left transition-colors font-medium ${activeTab === tab.id
                                            ? 'bg-white dark:bg-[#1E2438] text-gray-900 dark:text-white shadow-sm'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-gray-200'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <tab.icon className={`w-5 h-5 sm:w-4 sm:h-4 ${activeTab === tab.id ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-500'}`} />
                                            {tab.label}
                                        </div>
                                        <ChevronDown className="w-4 h-4 text-gray-300 dark:text-gray-600 sm:hidden -rotate-90" />
                                    </button>
                                ))}
                            </nav>

                            <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-[#F9F9F9] dark:bg-[#0E1220]">
                                <button
                                    onClick={onLogout}
                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-left text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                >
                                    <LogOut className="w-5 h-5 sm:w-4 sm:h-4" />
                                    {t('logOut')}
                                </button>
                            </div>
                        </div>

                        {/* Content Area / Detail View */}
                        <div className={`
                        flex-1 flex flex-col min-w-0 bg-white dark:bg-[#161B2E]
                        ${view === 'sidebar' ? 'hidden sm:flex' : 'flex'}
                    `}>
                            {/* Mobile Header */}
                            <div className="sm:hidden flex items-center justify-between p-4 border-b border-gray-50 dark:border-white/5">
                                <button onClick={() => setView('sidebar')} className="p-1 text-gray-900 dark:text-white">
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                                    {tabs.find(t => t.id === activeTab)?.label}
                                </h2>
                                <div className="w-6" /> {/* Balance */}
                            </div>

                            {/* Desktop Header */}
                            <div className="hidden sm:block px-8 py-6 pb-2">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {tabs.find(t => t.id === activeTab)?.label}
                                </h2>
                            </div>

                            <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-8 custom-scrollbar-light">
                                <div className="max-w-2xl mx-auto py-2">
                                    {renderContent()}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
            {showPricingModal && (
                <PricingModal
                    currentPlan={user?.plan || 'Basic'}
                    onClose={() => setShowPricingModal(false)}
                    onUpgrade={async (plan) => {
                        await handlePayment(plan, user, (updatedUser) => {
                            // Update local state deeply to reflect plan change immediately
                            setUserRecoil(prev => ({ ...prev, user: { ...prev.user, plan: updatedUser.plan } }));
                            setUserData({ ...getUserData(), plan: updatedUser.plan });
                            setShowPricingModal(false);
                            toast.success(`Welcome to ${plan.name} Plan!`);
                        });
                    }}
                />
            )}
        </AnimatePresence>,
        document.body
    );
};

export default ProfileSettingsDropdown;
