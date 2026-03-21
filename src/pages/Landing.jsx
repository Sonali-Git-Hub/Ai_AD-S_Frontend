import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight, Bot, Zap, Shield, CircleUser,
    Github, Twitter,
    Linkedin, Mail, MapPin, Phone, Facebook, Instagram, Youtube, MessageSquare, MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logo, name, faqs } from '../constants';
import { getUserData } from '../userStore/userData';
import { AppRoute } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, X, ChevronDown, ChevronUp, HelpCircle, Search, Send, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { apis } from '../types';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import PrivacyPolicyModal from '../Components/PolicyModals/PrivacyPolicyModal';
import TermsOfServiceModal from '../Components/PolicyModals/TermsOfServiceModal';
import CookiePolicyModal from '../Components/PolicyModals/CookiePolicyModal';
import AboutAISA from '../Components/AboutAISA';
import { useLanguage } from '../context/LanguageContext';

import ProfileSettingsDropdown from '../Components/ProfileSettingsDropdown/ProfileSettingsDropdown';
import ThemeToggle from '../Components/ThemeToggle';
import Ballpit from '../Components/Ballpit';

const Landing = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const user = getUserData();
    const [isBrandHovered, setIsBrandHovered] = useState(false);
    const [isFaqOpen, setIsFaqOpen] = useState(false);
    const [openFaqIndex, setOpenFaqIndex] = useState(null);
    const [selectedFaqCategory, setSelectedFaqCategory] = useState(0);
    const [faqSearchQuery, setFaqSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('faq');
    const [issueType, setIssueType] = useState('General Inquiry');
    const [isIssueDropdownOpen, setIsIssueDropdownOpen] = useState(false);
    const [issueText, setIssueText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sendStatus, setSendStatus] = useState(null);
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
    const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
    const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);

    const toolCosts = [
        { label: "Normal Chat", cost: "1" },
        { label: "Deep Search", cost: "10" },
        { label: "Real-Time Search", cost: "10" },
        { label: "Generate Image", cost: "20" },
        { label: "Generate Video", cost: "70" },
        { label: "Convert Audio", cost: "10" },
        { label: "Convert Document", cost: "10" },
        { label: "Code Writer", cost: "5" }
    ];

    useEffect(() => {
        if (isFaqOpen || isAboutModalOpen || isPrivacyModalOpen || isTermsModalOpen || isCookieModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isFaqOpen, isAboutModalOpen, isPrivacyModalOpen, isTermsModalOpen, isCookieModalOpen]);

    const handleLogout = () => {
        localStorage.clear();
        window.location.reload(); // Simple reload to clear user state which comes from LS
    };

    const issueOptions = [
        "General Inquiry",
        "Payment Issue",
        "Refund Request",
        "Technical Support",
        "Account Access",
        "Other"
    ];

    const handleSupportSubmit = async () => {
        if (!issueText.trim()) return;
        setIsSending(true);
        setSendStatus(null);
        try {
            await axios.post(apis.support, {
                name: user?.name || "AISA User",
                email: user?.email || "guest@uwo24.com",
                issueType,
                message: issueText,
                userId: user?.id || null
            });
            setSendStatus('success');
            setIssueText('');
            setTimeout(() => setSendStatus(null), 3000);
        } catch (error) {
            console.error("Support submission failed", error);
            setSendStatus('error');
        } finally {
            setIsSending(false);
        }
    };
    const { theme, setTheme } = useTheme();
    const btnClass = "px-8 py-4 bg-surface border border-border rounded-2xl font-bold text-lg text-maintext hover:bg-secondary transition-all duration-300 flex items-center justify-center gap-2";

    // Animation Variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden bg-white dark:bg-slate-950 aisa-scalable-text">
            {/* Background Image Layer with reduced opacity */}
            <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: 1.1 }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "linear"
                }}
                className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 z-0"
                style={{
                    backgroundImage: "url('/hero-bg.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />

            {/* Background Overlay - Balanced Gradient (Top & Bottom) */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-primary/10 dark:from-slate-950/80 dark:via-transparent dark:to-slate-950/80 pointer-events-none z-0" />

            {/* Ballpit Background */}
            <div className="absolute inset-0 pointer-events-auto z-0 opacity-70 dark:opacity-40">
                <Ballpit 
                    count={40}
                    gravity={0.1}
                    friction={0.998}
                    wallBounce={0.95}
                    followCursor={true}
                    colors={[0x8b5cf6, 0x6366f1, 0xec4899]}
                />
            </div>

            {/* Header */}
            <header className="relative z-10 px-4 py-4 md:px-6 md:py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative flex items-center gap-2 md:gap-3 cursor-pointer group"
                >
                    <img src="/logo/Logo.svg" alt="AISA Logo" className="w-12 h-12 md:w-20 md:h-20 object-contain hover:rotate-12 transition-transform duration-300" />

                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 md:gap-4 relative"
                >
                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {user ? (
                        <div className="relative">
                            <motion.button
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsProfileSettingsOpen(!isProfileSettingsOpen)}
                                className="relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full transition-all group"
                            >
                                <CircleUser className='h-6 w-6 md:h-7 md:w-7 text-primary/80 group-hover:text-primary transition-colors' />
                            </motion.button>
                            <AnimatePresence>
                                {isProfileSettingsOpen && (
                                    <ProfileSettingsDropdown
                                        onClose={() => setIsProfileSettingsOpen(false)}
                                        onLogout={() => {
                                            handleLogout();
                                            setIsProfileSettingsOpen(false);
                                        }}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex gap-4 items-center">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate("/login")}
                                className="flex items-center gap-2 text-sm md:text-base text-slate-700 dark:text-slate-200 font-bold px-3 py-1.5 rounded-xl hover:bg-primary/5 transition-all"
                            >
                                <span>{t('logIn')}</span>
                                <div className="flex items-center justify-center">
                                    <CircleUser className="w-5 h-5 md:w-6 md:h-6 text-primary/70 group-hover:text-primary" />
                                </div>
                            </motion.button>
                        </div>
                    )}
                </motion.div>
            </header>

            {/* Hero Section */}
            <motion.main
                variants={container}
                initial="hidden"
                animate="show"
                className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 py-20"
            >
                <motion.div
                    variants={item}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/40 dark:bg-black/40 border border-primary/20 text-sm text-black dark:text-white mb-8 backdrop-blur-md"
                >
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    {t('poweredByUWO')}
                </motion.div>

                <motion.h1
                    variants={item}
                    className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight text-black dark:text-gray-100"
                >
                    {t('heroTitle')}
                </motion.h1>

                <motion.p
                    variants={item}
                    className="text-lg text-black dark:text-gray-400 max-w-2xl mb-10 leading-relaxed font-medium"
                >
                    {t('heroSubtitle')}
                </motion.p>

                <motion.div
                    variants={item}
                    className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-2xl"
                >
                    <motion.button
                        whileHover={{ y: -5, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate("/dashboard/chat/new")}
                        className="px-8 py-4 bg-primary rounded-2xl font-bold text-lg text-white shadow-xl shadow-primary/30 transition-all duration-300 flex items-center justify-center gap-2 group"
                    >
                        {t('exploreAisa')}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.button >

                    {!user && (
                        <motion.button
                            whileHover={{ y: -5, scale: 1.02, backgroundColor: "rgba(255,255,255,0.8)" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate("/login")}
                            className="px-8 py-4 bg-white/40 dark:bg-slate-900/40 border border-border rounded-2xl font-bold text-lg text-maintext transition-all duration-300 backdrop-blur-md"
                        >
                            {t('existingUser')}
                        </motion.button>
                    )}
                </motion.div >

                {/* Features Preview */}
                <motion.div
                    variants={container}
                    className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full text-left"
                >
                    {
                        [
                            {
                                title: t('intelligenceTitle'),
                                desc: t('intelligenceDesc'),
                                img: "/logo/Intelligence.svg",
                                delay: 0
                            },
                            {
                                title: t('interactionTitle'),
                                desc: t('interactionDesc'),
                                img: "/logo/Interaction.svg",
                                delay: 0.2
                            },
                            {
                                title: t('privacyTitle'),
                                desc: t('privacyDesc'),
                                img: "/logo/Privacy.svg",
                                delay: 0.4
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                variants={item}
                                whileHover={{ y: -10, scale: 1.02, borderColor: "var(--primary)" }}
                                className="p-6 rounded-3xl bg-white/20 dark:bg-[#161B2E]/60 border border-white/40 dark:border-white/5 shadow-sm hover:shadow-xl transition-all group backdrop-blur-md cursor-default"
                            >
                                <motion.div
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: feature.delay }}
                                    className="w-16 h-16 mb-4 group-hover:scale-110 transition-transform"
                                >
                                    <img src={feature.img} alt={feature.title} className="w-full h-full object-contain drop-shadow-md" />
                                </motion.div>
                                <h3 className="text-xl font-bold mb-2 text-black dark:text-white group-hover:text-primary transition-colors flex items-center gap-2">
                                   <span className="aisa-badge-small">AISA ™</span>
                                   {feature.title}
                                 </h3>
                                <p className="text-black dark:text-white leading-relaxed">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))
                    }
                </motion.div >

                {/* Pricing Section */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="mt-24 md:mt-32 max-w-5xl w-full px-4 text-center z-10 mx-auto"
                >
                    <motion.h2
                        variants={item}
                        className="text-3xl md:text-5xl font-extrabold mb-4 text-black dark:text-white"
                    >
                        Choose Your AISA ™ Power Level
                    </motion.h2>
                    <motion.p
                        variants={item}
                        className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto"
                    >
                        Pick the plan that fits your AI needs. From casual usage to full-blown enterprise power.
                    </motion.p>

                    <div className="flex justify-center mt-10">
                        <motion.div
                            variants={item}
                            whileHover={{ y: -5, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate("/pricing")}
                            className="bg-white/5 dark:bg-white/[0.03] backdrop-blur-[50px] backdrop-saturate-[180%] rounded-[2.5rem] p-8 md:p-12 border border-white/30 dark:border-white/[0.08] shadow-2xl relative text-center flex flex-col cursor-pointer w-full max-w-2xl group transition-all ring-1 ring-black/5 dark:ring-white/[0.05]"
                        >
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-blue-600 text-white text-[11px] font-extrabold px-6 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                                Unlock AI Powers
                            </div>
                            <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-4 group-hover:text-primary transition-colors">
                                View AISA ™ Subscriptions
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed">
                                Get access to advanced AI models, higher rate limits, priority support, and powerful collaboration tools.
                            </p>
                            
                            <div className="flex items-center justify-center gap-2 text-primary font-bold text-lg bg-primary/10 backdrop-blur-md border border-primary/10 w-max mx-auto px-6 py-3 rounded-xl group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm hover:shadow-primary/20">
                                See Pricing Plans
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                            </div>
                        </motion.div>
                    </div>

                </motion.div>


            </motion.main >

            {/* Footer Section */}
            < motion.footer
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="w-full bg-white/40 dark:bg-[#0B0F19] border-t border-white/20 dark:border-white/5 mt-20 relative z-10 backdrop-blur-xl rounded-t-[3rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent dark:from-slate-900/40 pointer-events-none" />
                <div className="max-w-6xl mx-auto px-6 pt-20 pb-10 relative z-10">
                    <div className="flex flex-col lg:flex-row justify-center gap-10 lg:gap-20 mb-12">
                        {/* Brand Column */}
                        <div className="space-y-6 max-w-sm">
                            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                                <img src="/logo/Logo.svg" alt="AISA Logo" className="w-12 h-12 object-contain group-hover:rotate-12 transition-transform duration-300" />
                                <span className="text-xl font-bold text-primary tracking-tighter">AISA ™</span>
                            </div>

                            <div className="flex items-center gap-3 flex-wrap">
                                {[
                                    { img: "/social-media-icons/Linkedin.svg", href: "https://www.linkedin.com/in/aimall-global/", label: "LinkedIn" },
                                    { img: "/social-media-icons/X.svg", href: "https://x.com/aimallglobal", label: "Twiter" },
                                    { img: "/social-media-icons/FB.svg", href: "https://www.facebook.com/aimallglobal/", label: "Facebook" },
                                    { img: "/social-media-icons/Threads.svg", href: "https://www.threads.net/@aimall.global", label: "Threads" },
                                    { img: "/social-media-icons/Insta.svg", href: "https://www.instagram.com/aimall.global/", label: "Instagram" },
                                    { img: "/social-media-icons/YT.svg", href: "https://www.youtube.com/@aimallglobal", label: "YouTube" },
                                    { img: "/social-media-icons/Whatsapp.svg", href: "https://api.whatsapp.com/send?phone=918359890909", label: "WhatsApp" }
                                ].map((social, i) => (
                                    <a
                                        key={i}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-8 h-8 rounded-md overflow-hidden hover:scale-110 transition-all duration-300"
                                        aria-label={social.label}
                                    >
                                        <img
                                            src={social.img}
                                            alt={social.label}
                                            className={`w-full h-full object-cover ${['Twiter', 'Threads'].includes(social.label) ? 'dark:invert' : ''}`}
                                        />
                                    </a>
                                ))}
                            </div>
                        </div>



                        {/* Support Column */}
                        <div>
                            <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-6">{t('support')}</h4>
                            <ul className="space-y-4">
                                {[
                                    { label: t('helpCenter'), onClick: () => setIsFaqOpen(true) },
                                    { label: t('aboutAisa'), onClick: () => setIsAboutModalOpen(true) },
                                ].map((link, i) => (
                                    <li key={i}>
                                        {link.onClick ? (
                                            <button
                                                onClick={link.onClick}
                                                className="text-sm text-maintext hover:text-primary hover:underline decoration-primary underline-offset-4 transition-all font-medium opacity-80 hover:opacity-100"
                                            >
                                                {link.label}
                                            </button>
                                        ) : (
                                            <a
                                                href={link.path}
                                                className="text-sm text-subtext hover:text-primary hover:underline decoration-primary underline-offset-4 transition-all font-medium"
                                            >
                                                {link.label}
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact Column */}
                        <div className="space-y-6">
                            <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-6">{t('contact')}</h4>
                            <div className="space-y-4">
                                <a
                                    href="https://www.google.com/maps/search/?api=1&query=Jabalpur+Madhya+Pradesh"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-start gap-3 group"
                                >
                                    <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                                    <p className="text-sm text-maintext leading-relaxed group-hover:text-primary transition-colors opacity-80">
                                        {t('city')}
                                    </p>
                                </a>
                                <a
                                    href="mailto:admin@uwo24.com"
                                    className="flex items-center gap-3 group"
                                >
                                    <Mail className="w-5 h-5 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm text-maintext group-hover:text-primary group-hover:underline decoration-primary underline-offset-4 transition-all font-medium opacity-80">
                                        admin@uwo24.com
                                    </span>
                                </a>
                                <a
                                    href="tel:+918358990909"
                                    className="flex items-center gap-3 group"
                                >
                                    <Phone className="w-5 h-5 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm text-maintext group-hover:text-primary transition-colors font-medium opacity-80">
                                        +91 83589 90909
                                    </span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-10 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
                        <p className="text-xs text-maintext font-medium opacity-80">
                            © {new Date().getFullYear()} {name} ™. {t('allRightsReserved')}
                        </p>
                        <div className="flex items-center gap-8">
                            <button onClick={() => setIsPrivacyModalOpen(true)} className="text-xs text-maintext hover:text-primary hover:underline decoration-primary underline-offset-4 transition-all font-medium opacity-80 hover:opacity-100">{t('privacyPolicy')}</button>
                            <button onClick={() => setIsTermsModalOpen(true)} className="text-xs text-maintext hover:text-primary hover:underline decoration-primary underline-offset-4 transition-all font-medium opacity-80 hover:opacity-100">{t('termsOfService')}</button>
                            <button onClick={() => setIsCookieModalOpen(true)} className="text-xs text-maintext hover:text-primary hover:underline decoration-primary underline-offset-4 transition-all font-medium opacity-80 hover:opacity-100">{t('cookiePolicy')}</button>
                        </div>
                    </div>
                </div>
            </motion.footer >

            {/* FAQ Modal - Improved ChatGPT Style */}
            {
                isFaqOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="bg-white dark:bg-[#0F111A] rounded-[2.5rem] w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 dark:border-white/10"
                        >
                            {/* Modal Header */}
                            <div className="px-10 py-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0E1220]">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                                        <HelpCircle className="w-6 h-6 text-primary" />
                                        {t('helpCenter') || 'Help Center'}
                                    </h2>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest opacity-70">Knowledge Base & FAQ</p>
                                </div>
                                <button
                                    onClick={() => setIsFaqOpen(false)}
                                    className="p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-full text-slate-400 transition-all hover:rotate-90"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 flex overflow-hidden">
                                {/* Side Navigation - Categories */}
                                <div className="w-72 border-r border-gray-100 dark:border-white/5 bg-[#FBFCFE] dark:bg-[#0E1220]/50 p-6 space-y-2 overflow-y-auto hidden md:block">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-4">Categories</div>
                                    {faqs.map((cat, idx) => (
                                        <button
                                            key={cat.category}
                                            onClick={() => {
                                                setSelectedFaqCategory(idx);
                                                setOpenFaqIndex(null);
                                            }}
                                            className={`w-full text-left px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-between group ${
                                                selectedFaqCategory === idx 
                                                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                                : 'text-slate-500 hover:bg-primary/5 dark:hover:bg-white/5'
                                            }`}
                                        >
                                            {cat.category}
                                            <ChevronRight className={`w-4 h-4 transition-transform ${selectedFaqCategory === idx ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                                        </button>
                                    ))}
                                    
                                    <div className="pt-10">
                                        <button
                                            onClick={() => setActiveTab('help')}
                                            className={`w-full text-left px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-3 ${
                                                activeTab === 'help' 
                                                ? 'text-primary' 
                                                : 'text-slate-400'
                                            }`}
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                            Submit Ticket
                                        </button>
                                    </div>
                                </div>

                                {/* Main Content Area */}
                                <div className="flex-1 flex flex-col bg-white dark:bg-[#0F111A]">
                                    {/* Search Bar */}
                                    <div className="p-8 border-b border-gray-50 dark:border-white/5">
                                        <div className="relative group">
                                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                            <input 
                                                type="text"
                                                placeholder="Search for questions..."
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-5 pl-14 rounded-2xl outline-none focus:border-primary/50 text-sm font-semibold transition-all"
                                                onChange={(e) => setFaqSearchQuery(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                                        {activeTab === 'faq' ? (
                                            <div className="max-w-3xl mx-auto space-y-12">
                                                {/* Category Title for Mobile */}
                                                <div className="md:hidden mb-8">
                                                    <select 
                                                        className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                                                        value={selectedFaqCategory}
                                                        onChange={(e) => setSelectedFaqCategory(Number(e.target.value))}
                                                    >
                                                        {faqs.map((cat, i) => (
                                                            <option key={i} value={i}>{cat.category}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="space-y-4">
                                                    <h3 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-8">{faqs[selectedFaqCategory].category} Questions</h3>
                                                    {faqs[selectedFaqCategory].questions
                                                        .filter(q => !faqSearchQuery || q.question.toLowerCase().includes(faqSearchQuery.toLowerCase()))
                                                        .map((faq, index) => (
                                                        <div key={index} className="border-b border-gray-100 dark:border-white/5 last:border-0">
                                                            <button
                                                                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                                                                className="w-full flex justify-between items-center py-6 text-left focus:outline-none group"
                                                            >
                                                                <span className="font-bold text-slate-800 dark:text-white text-[15px] group-hover:text-primary transition-colors">{faq.question}</span>
                                                                <div className={`p-2 rounded-lg transition-all ${openFaqIndex === index ? 'bg-primary/10 text-primary rotate-180' : 'bg-slate-50 dark:bg-white/5 text-slate-400 group-hover:text-primary'}`}>
                                                                    <ChevronDown className="w-4 h-4" />
                                                                </div>
                                                            </button>
                                                            <motion.div
                                                                initial={false}
                                                                animate={{ height: openFaqIndex === index ? "auto" : 0, opacity: openFaqIndex === index ? 1 : 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="pb-8 text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-semibold">
                                                                    {faq.answer}
                                                                </div>
                                                            </motion.div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="max-w-xl mx-auto py-10 space-y-8">
                                                <div className="text-center space-y-3 mb-10">
                                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Submit a Request</h3>
                                                    <p className="text-sm text-slate-500 font-semibold italic">Our team typically responds within 24 hours.</p>
                                                </div>
                                                
                                                <div className="space-y-6">
                                                    <div>
                                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Category</label>
                                                        <div className="relative">
                                                            <button
                                                                onClick={() => setIsIssueDropdownOpen(!isIssueDropdownOpen)}
                                                                className="w-full p-5 pr-12 rounded-[1.5rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 outline-none flex items-center justify-between text-slate-900 dark:text-white font-bold hover:border-primary/50 transition-all shadow-sm"
                                                            >
                                                                <span className="truncate">{issueType}</span>
                                                                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isIssueDropdownOpen ? 'rotate-180' : ''}`} />
                                                            </button>

                                                            <AnimatePresence>
                                                                {isIssueDropdownOpen && (
                                                                    <>
                                                                        <div 
                                                                            className="fixed inset-0 z-[120]" 
                                                                            onClick={() => setIsIssueDropdownOpen(false)} 
                                                                        />
                                                                        <motion.div
                                                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                            className="absolute top-full left-0 right-0 mt-3 z-[130] bg-white dark:bg-[#1A1F33] border border-slate-100 dark:border-white/10 rounded-[2rem] shadow-2xl overflow-hidden py-3"
                                                                        >
                                                                            {issueOptions.map((opt) => (
                                                                                <button
                                                                                    key={opt}
                                                                                    onClick={() => {
                                                                                        setIssueType(opt);
                                                                                        setIsIssueDropdownOpen(false);
                                                                                    }}
                                                                                    className={`w-full text-left px-6 py-4 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-between ${
                                                                                        issueType === opt 
                                                                                        ? 'bg-primary text-white' 
                                                                                        : 'text-slate-500 hover:bg-primary/5 dark:hover:bg-white/5'
                                                                                    }`}
                                                                                >
                                                                                    {opt}
                                                                                    {issueType === opt && <Zap className="w-3 h-3 fill-current" />}
                                                                                </button>
                                                                            ))}
                                                                        </motion.div>
                                                                    </>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Message</label>
                                                        <textarea
                                                            className="w-full p-5 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 outline-none focus:border-primary/50 resize-none text-slate-800 dark:text-white min-h-[180px] font-semibold"
                                                            placeholder="How can we help you today?"
                                                            value={issueText}
                                                            onChange={(e) => setIssueText(e.target.value)}
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={handleSupportSubmit}
                                                        disabled={isSending || !issueText.trim()}
                                                        className={`w-full flex items-center justify-center gap-3 bg-primary text-white py-5 rounded-[2rem] font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20 ${isSending || !issueText.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'}`}
                                                    >
                                                        {isSending ? (
                                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Send className="w-5 h-5" />
                                                                Send Message
                                                            </>
                                                        )}
                                                    </button>
                                                    
                                                    {sendStatus === 'success' && (
                                                        <div className="p-4 bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl text-center font-bold border border-green-500/10">
                                                            Message sent successfully!
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="pt-10 border-t border-gray-50 dark:border-white/5 text-center">
                                                    <p className="text-xs text-slate-400 font-bold">
                                                        Direct Email: <a href="mailto:admin@uwo24.com" className="text-primary hover:underline">admin@uwo24.com</a>
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Sticky Footer */}
                            <div className="p-8 border-t border-gray-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#0E1220] flex justify-between items-center">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    AISA Platform Documentation v2.0
                                </div>
                                <div className="flex gap-4">
                                    {activeTab === 'help' && (
                                        <button
                                            onClick={() => setActiveTab('faq')}
                                            className="px-8 py-3 bg-white dark:bg-white/5 text-slate-600 dark:text-white rounded-xl font-bold border border-slate-200 dark:border-white/10"
                                        >
                                            Back to FAQ
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsFaqOpen(false)}
                                        className="px-10 py-3 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
                                    >
                                        {t('close')}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )
            }

            <PrivacyPolicyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />
            <TermsOfServiceModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
            <CookiePolicyModal isOpen={isCookieModalOpen} onClose={() => setIsCookieModalOpen(false)} />
            <AboutAISA isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />

        </div >
    );
};

export default Landing;
