import React from 'react';
import { Shield, Mail, Lock, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const GoogleDisclosure = () => {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const normalizedTheme = typeof theme === 'string' ? theme.toLowerCase() : 'system';
    const isDarkMode = normalizedTheme === 'dark' || (normalizedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return (
        <section 
            id="google-oauth-disclosure"
            className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-20 relative z-10"
        >
            <div 
                className="rounded-[3rem] p-8 md:p-16 border transition-all relative overflow-hidden"
                style={{
                    background: isDarkMode 
                        ? 'rgba(15, 15, 30, 0.65)' 
                        : 'rgba(255, 255, 255, 0.75)',
                    borderColor: isDarkMode 
                        ? 'rgba(255, 255, 255, 0.08)' 
                        : 'rgba(99, 102, 241, 0.15)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: isDarkMode 
                        ? '0 30px 60px -15px rgba(0, 0, 0, 0.8)' 
                        : '0 30px 60px -15px rgba(99, 102, 241, 0.05)',
                }}
            >
                {/* Visual Accent Glows */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[0.65rem] font-black uppercase tracking-[0.2em] border border-primary/20">
                            <Shield size={12} className="animate-pulse" />
                            Security & Trust
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-[#0F172A] dark:text-white tracking-tight mb-4">
                            Google Integration &amp; <span className="text-primary">OAuth Disclosure</span>
                        </h2>
                        <p className="text-base text-gray-500 dark:text-gray-400 font-medium">
                            AISA™ integrates with Google APIs to securely authenticate accounts and provide optional productivity automation. Learn how we handle your Google account data below.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                        {/* Google Sign In Card */}
                        <div 
                            className="p-8 rounded-3xl border flex flex-col"
                            style={{
                                background: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(99, 102, 241, 0.02)',
                                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(99, 102, 241, 0.08)',
                            }}
                        >
                            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 mb-6">
                                <Lock size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-3">
                                Google Sign-In (Authentication)
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                                We request basic profile scopes (<code className="bg-black/5 dark:bg-white/5 px-1 py-0.5 rounded text-primary">email</code>, <code className="bg-black/5 dark:bg-white/5 px-1 py-0.5 rounded text-primary">profile</code>, and <code className="bg-black/5 dark:bg-white/5 px-1 py-0.5 rounded text-primary">openid</code>) to securely authenticate your session, create your AISA™ account, customize your profile avatar, and sync workspace settings across your devices.
                            </p>
                        </div>

                        {/* Gmail Assistant Card */}
                        <div 
                            className="p-8 rounded-3xl border flex flex-col"
                            style={{
                                background: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(99, 102, 241, 0.02)',
                                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(99, 102, 241, 0.08)',
                            }}
                        >
                            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-500/10 text-red-500 mb-6">
                                <Mail size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-3">
                                Gmail Assistant (Restricted Scopes)
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                                To enable the optional AI Gmail tool, you can authorize access to <code className="bg-black/5 dark:bg-white/5 px-1 py-0.5 rounded text-primary">gmail.readonly</code> and <code className="bg-black/5 dark:bg-white/5 px-1 py-0.5 rounded text-primary">gmail.send</code>. This allows the AI assistant to read/search email logs to compile summaries or draft/send messages directly upon your instructions.
                            </p>
                        </div>
                    </div>

                    {/* Limited Use / Compliance Alert */}
                    <div 
                        className="p-6 md:p-8 rounded-3xl border mb-12"
                        style={{
                            background: isDarkMode ? 'rgba(99, 102, 241, 0.05)' : 'rgba(99, 102, 241, 0.04)',
                            borderColor: 'rgba(99, 102, 241, 0.2)',
                        }}
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary flex-shrink-0 mt-1">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-[#0F172A] dark:text-white mb-2">
                                    Google Limited Use Compliance Policy
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                                    AISA™’s use and transfer of information received from Google APIs to any other app will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold inline-flex items-center gap-1">Google API Services User Data Policy <ExternalLink size={12} /></a>, including the <strong>Limited Use</strong> requirements. 
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium mt-3">
                                    We do not share, sell, or transfer your Google user data to third parties, advertising networks, or data brokers. All data processed by our AI algorithms remains locked to your user session and is never used to train generalized AI models.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Policy Links */}
                    <div className="flex flex-wrap justify-center gap-6 text-sm font-bold text-gray-500 dark:text-gray-400">
                        <a href="/privacy-policy" className="hover:text-primary transition-colors inline-flex items-center gap-1.5 border-b border-dashed border-gray-400 hover:border-primary pb-0.5">
                            <LinkIcon size={14} />
                            Privacy Policy
                        </a>
                        <a href="/terms" className="hover:text-primary transition-colors inline-flex items-center gap-1.5 border-b border-dashed border-gray-400 hover:border-primary pb-0.5">
                            <LinkIcon size={14} />
                            Terms of Service
                        </a>
                        <a href="/cookie-policy" className="hover:text-primary transition-colors inline-flex items-center gap-1.5 border-b border-dashed border-gray-400 hover:border-primary pb-0.5">
                            <LinkIcon size={14} />
                            Cookie Policy
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GoogleDisclosure;
