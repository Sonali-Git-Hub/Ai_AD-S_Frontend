import React from 'react';
import { X, Scale, FileText, DollarSign, Shield, AlertCircle, UserX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { name } from '../../constants';

const TermsOfServiceModal = ({ isOpen, onClose }) => {
    const sections = [
        {
            icon: FileText,
            title: "1. Acceptance of Terms",
            items: [
                "Agreement: By accessing or using AISA™, you agree to be bound by these Terms and all applicable laws and regulations.",
                "Eligibility: You must be at least 18 years of age to use AISA™.",
                "Account Responsibility: You are responsible for maintaining the confidentiality, accuracy, and security of your account credentials and all activities performed under your account."
            ]
        },
        {
            icon: Scale,
            title: "2. Use of Services",
            items: [
                "Permitted Use: AISA™ may be used for lawful purposes including, but not limited to: Business operations, Research and analysis, Creative work, Productivity, automation, and decision support.",
                "Platform Features: AISA™ provides AI-powered assistance through text, voice, vision, file analysis, search, and other multimodal capabilities.",
                "Intended Use: You agree to use AISA™ only for its intended functionality and in compliance with these Terms.",
                "Prohibited Activities: You must not use AISA™ to: Engage in illegal, fraudulent, or harmful activities; Attempt to hack, reverse engineer, or disrupt the platform; Generate or distribute malicious, abusive, or unlawful content; Violate intellectual property or privacy rights of others."
            ]
        },
        {
            icon: DollarSign,
            title: "3. Subscription & Payment",
            items: [
                "Flexible Plans: AISA™ offers subscription plans that may include individual features, bundled services, or tiered access levels.",
                "Billing: Subscriptions are billed on a monthly or annual basis and renew automatically unless canceled.",
                "Cancellation: You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period.",
                "Refunds: Refunds are provided on a case-by-case basis, in accordance with our refund policy and applicable laws."
            ]
        },
        {
            icon: Shield,
            title: "4. Intellectual Property",
            items: [
                "Platform Ownership: All AISA™ software, features, interfaces, branding, and underlying AI systems are owned by us and protected under applicable intellectual property laws.",
                "User Content: You retain ownership of the content you submit. By using AISA™, you grant us a limited license to process your content solely to provide and improve our services.",
                "AI-Generated Content: AI-generated outputs are provided for your use. Similar or identical outputs may be generated for other users due to the nature of artificial intelligence.",
                "Trademarks: “AISA™” and all associated logos, names, and branding may not be used without prior written permission."
            ]
        },
        {
            icon: AlertCircle,
            title: "5. Disclaimers & Limitations of Liability",
            items: [
                "Service Provided “As Is”: AISA™ is provided without warranties of any kind, express or implied, including uptime, accuracy, or availability.",
                "AI Accuracy: AI-generated responses may be inaccurate or incomplete and should be independently verified before reliance.",
                "No Professional Advice: AISA™ does not provide legal, medical, financial, or other professional advice. Always consult qualified professionals when required.",
                "Limitation of Liability: To the maximum extent permitted by law, our liability is limited for any damages arising from your use of AISA™."
            ]
        },
        {
            icon: UserX,
            title: "6. Termination",
            items: [
                "User Termination: You may terminate your account at any time through your account settings.",
                "Platform Termination: We reserve the right to suspend or terminate access to AISA™ for violations of these Terms, misuse, or legal compliance requirements.",
                "Data Deletion: Upon termination, your data will be handled and deleted according to our data retention and privacy policies.",
                "Survival: Provisions relating to intellectual property, disclaimers, limitation of liability, and governing law shall survive termination."
            ]
        }
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-card dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-border"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-border bg-indigo-500/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                <Scale className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-maintext">Terms of Service</h2>
                                <p className="text-xs text-subtext mt-0.5">Last Updated: January 22, 2026</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-surface rounded-lg transition-colors text-subtext hover:text-maintext"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Introduction */}
                        <div className="bg-surface rounded-xl p-4 border border-border">
                            <p className="text-sm text-maintext leading-relaxed">
                                These Terms of Service govern your access to and use of {name}™.
                                Please read carefully before using our AI-powered platform.
                            </p>
                        </div>

                        {/* Sections */}
                        {sections.map((section, index) => (
                            <div key={index} className="bg-surface rounded-xl p-5 border border-border hover:border-indigo-500/30 transition-all">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                        <section.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-maintext pt-1">{section.title}</h3>
                                </div>
                                <ul className="ml-13 space-y-2">
                                    {section.items.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-subtext">
                                            <span className="text-indigo-600 dark:text-indigo-400 mt-1">•</span>
                                            <span className="flex-1">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        {/* Contact */}
                        <div className="bg-gradient-to-r from-indigo-500/5 to-blue-500/5 rounded-xl p-5 border border-indigo-500/20">
                            <h3 className="text-lg font-bold text-maintext mb-3">Questions About These Terms?</h3>
                            <div className="space-y-1.5 text-sm text-subtext">
                                <p><strong className="text-maintext">Email:</strong> <a href="mailto:admin@uwo24.com" className="text-primary hover:underline">admin@uwo24.com</a></p>
                                <p><strong className="text-maintext">Phone:</strong> <a href="tel:+918358990909" className="text-primary hover:underline">+91 83589 90909</a></p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-border bg-surface flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg shadow-indigo-600/20"
                        >
                            Close
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default TermsOfServiceModal;
