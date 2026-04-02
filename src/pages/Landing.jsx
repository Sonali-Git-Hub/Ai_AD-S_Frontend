import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight, Bot, Zap, Shield, CircleUser,
    Github, Twitter,
    Linkedin, Mail, MapPin, Phone, Facebook, Instagram, Youtube, MessageSquare, MessageCircle,
    Sun, Moon, X, ChevronDown, ChevronUp, HelpCircle, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logo, name, faqs } from '../constants';
import { getUserData } from '../userStore/userData';
import { AppRoute, apis } from '../types';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

import PrivacyPolicyModal from '../Components/PolicyModals/PrivacyPolicyModal';
import TermsOfServiceModal from '../Components/PolicyModals/TermsOfServiceModal';
import CookiePolicyModal from '../Components/PolicyModals/CookiePolicyModal';
import AboutAISA from '../Components/AboutAISA';
import Hero from '../Components/Hero';
import StackedFeatures from '../Components/StackedFeatures';
import DemoSection from '../Components/DemoSection';
import StackedCards from '../Components/StackedCards';
import FlowingAICreature from '../Components/FlowingAICreature';
import { useLanguage } from '../context/LanguageContext';
import ErrorBoundary from '../Components/ErrorBoundary';

/**
 * Landing Page - Principal entry point for AISA.
 * Manages the immersive 3D creature journey, section transitions, 
 * and the final bloom reveal in the footer.
 */
const Landing = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const user = getUserData();
    const { theme } = useTheme();
    const normalizedTheme = typeof theme === 'string' ? theme.toLowerCase() : 'system';
    const isDarkMode = normalizedTheme === 'dark' || (normalizedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    const [isFaqOpen, setIsFaqOpen] = useState(false);
    const [openFaqIndex, setOpenFaqIndex] = useState(null);
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
    const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
    const [isBloomExploded, setIsBloomExploded] = useState(false);

    // ── Listen for the Bloom Explosion Event from FlowingAICreature ──
    useEffect(() => {
        const handleBloom = () => {
            setIsBloomExploded(true);
            // Dynamic glow interaction for the footer reveal
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(".footer-reveal-bg", 
                    { filter: "brightness(2)" },
                    { filter: "brightness(1)", duration: 2, ease: "sine.inOut" }
                );
            }
        };

        window.addEventListener('aisa-bloom-explosion', handleBloom);
        return () => window.removeEventListener('aisa-bloom-explosion', handleBloom);
    }, []);

    // ── Animation Variants ──
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
    };

    return (
        <div style={{ background: isDarkMode ? '#04040e' : '#EEF2FF' }} className="min-h-screen flex flex-col relative overflow-hidden aisa-scalable-text">
            

            {/* ── 3D Immersive Adventure Element ── */}
            <ErrorBoundary>
                <Suspense fallback={<div className="fixed inset-0 bg-black/5 z-0" />}>
                    <FlowingAICreature />
                </Suspense>
            </ErrorBoundary>

            {/* ── Hero / Entry Points ── */}
            <Hero />

            {/* ── Functional Feature Blocks ── */}
            <StackedFeatures />

            {/* ── Practical Demonstrations ── */}
            <DemoSection />

            {/* ── Value Pillars Card Stack ── */}
            <StackedCards />

            {/* ── Main Conversion Section (Glassmorphism) ── */}
            <motion.main
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                style={{
                  background: isDarkMode 
                    ? 'linear-gradient(180deg,rgba(4,4,14,0) 0%,rgba(6,6,20,0) 100%)'
                    : 'linear-gradient(180deg, #EEF2FF 0%, rgba(224, 231, 255, 0.4) 100%)',
                }}
                className="flex flex-col items-center text-center px-4 relative z-10 py-32"
            >
                {/* Secondary CTA Area */}
                <motion.div variants={itemVariants} className="max-w-4xl w-full">
                    <h2 className="text-4xl md:text-7xl font-black mb-6 text-[#0F172A] dark:text-white tracking-tight leading-[1.05]">
                        Choose Your <br/> <span className="text-primary italic">Power Level</span>
                    </h2>
                    <p className="text-xl text-[#64748B] dark:text-gray-400 mb-16 max-w-2xl mx-auto opacity-80">
                        Unlock frontier AI capabilities with precision plans designed for visionary individuals and rapidly scaling teams.
                    </p>
                    
                    <motion.div
                        whileHover={{ y: -12, scale: 1.02 }}
                        onClick={() => navigate("/pricing")}
                        style={{
                          background: isDarkMode 
                            ? 'rgba(255,255,255,0.03)' 
                            : 'rgba(255, 255, 255, 0.6)',
                          backdropFilter: 'blur(3xl)',
                          boxShadow: isDarkMode 
                            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
                            : '0 20px 50px rgba(99, 102, 241, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
                        }}
                        className="backdrop-blur-3xl rounded-[4rem] p-16 border border-indigo-500/10 dark:border-white/5 cursor-pointer group transition-all"
                    >
                        <div className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full bg-primary/10 text-primary text-[0.65rem] font-black uppercase tracking-[0.2em] border border-primary/20">
                            <Sparkles size={14} />
                            pricing
                        </div>
                        <h3 className="text-4xl font-black text-[#0F172A] dark:text-white mb-6 group-hover:text-primary transition-colors">
                            Explore Pricing Plans
                        </h3>
                        <div className="flex items-center justify-center gap-3 text-primary font-black text-xl">
                            See All Options <ArrowRight className="group-hover:translate-x-3 transition-all duration-500" />
                        </div>
                    </motion.div>
                </motion.div>
            </motion.main>

            {/* ── Footer Reveal System ── */}
            <motion.footer
                initial={{ opacity: 0, y: 150 }}
                animate={isBloomExploded ? { opacity: 1, y: 0 } : { opacity: 0, y: 150 }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                className={`w-full bg-white/60 dark:bg-[#0B0F19]/90 border-t border-black/5 dark:border-white/10 mt-16 relative z-10 backdrop-blur-3xl rounded-t-[4rem] shadow-2xl overflow-hidden footer-reveal-bg transition-shadow duration-1500 ${isBloomExploded ? 'shadow-primary/40' : ''}`}
            >
                {/* Internal Glow for Reveal Effect */}
                <div className={`absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent transition-opacity duration-1500 ${isBloomExploded ? 'opacity-100' : 'opacity-0'}`} />
                
                <div className="max-w-7xl mx-auto px-8 lg:px-12 pt-10 pb-8 relative z-10">
                    <motion.div 
                        initial="hidden"
                        animate={isBloomExploded ? "show" : "hidden"}
                        variants={containerVariants}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-12"
                    >
                        {/* Brand Pillar */}
                        <motion.div variants={itemVariants} className="space-y-10">
                            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <img src={logo} alt="AISA" className="w-16 h-16 relative transform group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <span className="text-3xl font-black text-primary tracking-tighter">AISA</span>
                            </div>
                            <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                                We are defining the next generation of human-AI collaboration through immersive, frontier conversational intelligence.
                            </p>
                            <div className="flex items-center gap-5 flex-wrap">
                                {[
                                    { img: "/social-media-icons/Linkedin.svg", href: "https://www.linkedin.com/in/aimall-global/" },
                                    { img: "/social-media-icons/X.svg", href: "https://x.com/aimallglobal" },
                                    { img: "/social-media-icons/FB.svg", href: "https://www.facebook.com/aimallglobal/" },
                                    { img: "/social-media-icons/Insta.svg", href: "https://www.instagram.com/aimall.global/" },
                                ].map((s, i) => (
                                    <a key={i} href={s.href} target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 hover:bg-primary/20 transition-all duration-300 group">
                                        <img src={s.img} alt="social" className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity dark:invert" />
                                    </a>
                                ))}
                            </div>
                        </motion.div>

                        {/* Resource Pillar */}
                        <motion.div variants={itemVariants} className="space-y-8">
                            <h4 className="text-xs font-black text-primary uppercase tracking-[0.25em] pl-1 footer-link-sparkle w-fit cursor-pointer">Knowledge Hub</h4>
                            <ul className="space-y-5">
                                <li><button onClick={() => setIsFaqOpen(true)} className="text-gray-600 dark:text-gray-400 hover:text-primary transition-all font-bold text-sm tracking-wide footer-link-sparkle">{t('helpCenter')}</button></li>
                                <li><button onClick={() => setIsAboutModalOpen(true)} className="text-gray-600 dark:text-gray-400 hover:text-primary transition-all font-bold text-sm tracking-wide footer-link-sparkle">{t('aboutAisa')}</button></li>
                            </ul>
                        </motion.div>

                        {/* Communication Pillar */}
                        <motion.div variants={itemVariants} className="space-y-8">
                            <h4 className="text-xs font-black text-primary uppercase tracking-[0.25em] pl-1 footer-link-sparkle w-fit cursor-pointer">{t('contact')}</h4>
                            <ul className="space-y-6 text-gray-600 dark:text-gray-400 text-[0.95rem] font-medium">
                                <li className="flex items-center gap-4 group cursor-default">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white"><MapPin size={18} /></div>
                                    <span className="transition-colors group-hover:text-primary">{t('city')}</span>
                                </li>
                                <li className="flex items-center gap-4 group cursor-pointer">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white"><Mail size={18} /></div>
                                    <a href="mailto:admin@uwo24.com" className="footer-link-sparkle">admin@uwo24.com</a>
                                </li>
                                <li className="flex items-center gap-4 group cursor-pointer">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white"><Phone size={18} /></div>
                                    <a href="tel:+918358990909" className="footer-link-sparkle">+91 83589 90909</a>
                                </li>
                            </ul>
                        </motion.div>

                        {/* Governance Pillar */}
                        <motion.div variants={itemVariants} className="space-y-8">
                            <h4 className="text-xs font-black text-primary uppercase tracking-[0.25em] pl-1 footer-link-sparkle w-fit cursor-pointer">Governance</h4>
                            <ul className="space-y-5">
                                <li><button onClick={() => setIsPrivacyModalOpen(true)} className="text-gray-600 dark:text-gray-400 hover:text-primary transition-all font-bold text-sm tracking-wide footer-link-sparkle">{t('privacyPolicy')}</button></li>
                                <li><button onClick={() => setIsTermsModalOpen(true)} className="text-gray-600 dark:text-gray-400 hover:text-primary transition-all font-bold text-sm tracking-wide footer-link-sparkle">{t('termsOfService')}</button></li>
                                <li><button onClick={() => setIsCookieModalOpen(true)} className="text-gray-600 dark:text-gray-400 hover:text-primary transition-all font-bold text-sm tracking-wide footer-link-sparkle">Cookie Policy</button></li>
                            </ul>
                        </motion.div>
                    </motion.div>

                    {/* Centered Legal Bottom */}
                    <motion.div variants={itemVariants} className="pt-8 border-t border-black/5 dark:border-white/5 flex justify-center">
                        <p className="text-[0.65rem] text-primary font-black uppercase tracking-[0.4em] text-center">
                            © {new Date().getFullYear()} {name} CORP. {t('allRightsReserved')}
                        </p>
                    </motion.div>
                </div>
            </motion.footer>

            {/* ── Dynamic Overlays (Modals) ── */}
            <AnimatePresence>
                {isFaqOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/70 backdrop-blur-xl">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 30 }}
                            className="bg-white dark:bg-[#0c0c28] rounded-[2.5rem] w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col border border-black/5 dark:border-white/10 shadow-2xl"
                        >
                            <div className="px-10 py-8 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{t('faq')}</h2>
                                    <p className="text-xs font-bold text-primary tracking-widest uppercase mt-1">Resource Center</p>
                                </div>
                                <button onClick={() => setIsFaqOpen(false)} className="p-3 hover:bg-black/5 dark:hover:bg-white/10 rounded-2xl transition-all"><X size={20} className="dark:text-white" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar">
                                {faqs.map((faq, idx) => (
                                    <div key={idx} className="border border-black/5 dark:border-white/5 rounded-3xl bg-gray-50/50 dark:bg-white/5 p-6 hover:border-primary/30 transition-all cursor-default group">
                                        <button onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)} className="w-full text-left font-black flex justify-between items-center text-gray-900 dark:text-white text-lg">
                                            {faq.question}
                                            <div className={`p-1.5 rounded-lg bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 transition-transform duration-500 ${openFaqIndex === idx ? 'rotate-180' : ''}`}>
                                                <ChevronDown size={18} />
                                            </div>
                                        </button>
                                        <AnimatePresence>
                                            {openFaqIndex === idx && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <p className="mt-6 text-gray-600 dark:text-gray-400 leading-relaxed font-medium text-[0.95rem]">
                                                        {faq.answer}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <PrivacyPolicyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />
            <TermsOfServiceModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
            <CookiePolicyModal isOpen={isCookieModalOpen} onClose={() => setIsCookieModalOpen(false)} />
            <AboutAISA isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />
        </div>
    );
};

export default Landing;
