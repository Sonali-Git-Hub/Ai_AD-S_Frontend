import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { apis } from '../types';
import { getUserData } from '../userStore/userData';
import toast from 'react-hot-toast';

const PersonalizationContext = createContext();

const DEFAULT_PREFERENCES = {
    general: {
        language: import.meta.env.VITE_DEFAULT_LANGUAGE || 'English',
        region: 'India',
        theme: 'System',
        responseSpeed: 'Balanced',
        screenReader: false,
        highContrast: false
    },
    notifications: {
        responses: 'Push',
        groupChats: 'Push',
        tasks: 'Push, Email',
        projects: 'Email',
        recommendations: 'Push, Email'
    },
    personalization: {
        fontSize: 'Medium',
        fontStyle: 'Default',
        enthusiasm: 'Medium',
        formality: 'Medium',
        creativity: 'Medium',
        structuredResponses: false,
        bulletPoints: false,
        customInstructions: '',
        emojiUsage: 'Moderate'
    },
    apps: {},
    dataControls: {
        chatHistory: 'On',
        trainingDataUsage: true
    },
    security: {
        twoFactor: false
    },
    parentalControls: {
        enabled: false,
        ageCategory: 'Adult',
        contentFilter: false,
        timeLimits: false
    },
    account: {
        nickname: ''
    },
    voice: {
        languageCode: 'en-US',
        voiceName: 'en-US-Chirp3-HD-Autonoe',
        pitch: 0,
        speed: 1.0
    }
};

export const PersonalizationProvider = ({ children }) => {
    const [personalizations, setPersonalizationsState] = useState(() => {
        const saved = localStorage.getItem('personalizations');
        const prefs = saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
        // Migration: Small is now Medium
        if (prefs?.personalization?.fontSize === 'Small') {
            prefs.personalization.fontSize = 'Medium';
        }
        return prefs;
    });
    const [notifications, setNotifications] = useState([]);
    const [chatSessions, setChatSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const reminderAudioRef = useRef(null);
    const recentNotificationsRef = useRef(new Set());

    const user = getUserData();

    const fetchChatSessions = async () => {
        if (!user?.token) return;
        try {
            const res = await axios.get(apis.chatAgent, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            setChatSessions(res.data || []);
        } catch (error) {
            console.error('Failed to fetch chat sessions', error);
        }
    };

    const fetchNotifications = async () => {
        if (!user?.token) return;
        try {
            const res = await axios.get(apis.user + '/notifications', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            setNotifications(res.data);
        } catch (error) {
            console.error('Failed to fetch notifications', error.response?.data || error.message);
        }
    };

    const deleteNotification = async (notifId) => {
        setNotifications(prev => prev.filter(n => n.id !== notifId));
        try {
            if (user?.token) {
                await axios.delete(`${apis.user}/notifications/${notifId}`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
            }
        } catch (error) {
            console.error('Failed to delete notification', error);
            fetchNotifications();
        }
    };

    const clearAllNotifications = async () => {
        setNotifications([]);
        try {
            if (user?.token) {
                await axios.delete(`${apis.user}/notifications`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
            }
        } catch (error) {
            console.error('Failed to clear notifications', error);
            fetchNotifications();
        }
    };

    const fetchPersonalizations = async () => {
        if (!user?.token) return;
        setIsLoading(true);
        try {
            const res = await axios.get(apis.user, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (res.data.personalizations) {
                const merged = { ...DEFAULT_PREFERENCES, ...res.data.personalizations };
                // Migration: Small is now Medium
                if (merged.personalization?.fontSize === 'Small') {
                    merged.personalization.fontSize = 'Medium';
                }
                setPersonalizationsState(merged);
                localStorage.setItem('personalizations', JSON.stringify(merged));
                applyDynamicStyles(merged);
            } else {
                setPersonalizationsState(prev => prev || DEFAULT_PREFERENCES);
            }
        } catch (error) {
            console.error('Failed to fetch personalizations', error);
            setPersonalizationsState(prev => prev || DEFAULT_PREFERENCES);
        } finally {
            setIsLoading(false);
        }
    };

    const applyDynamicStyles = (prefs) => {
        const p = prefs || personalizations;
        if (!p?.personalization) return;

        // Font Size
        const fontSize = p.personalization.fontSize || 'Medium';
        const fontSizeMap = {
            'Small': '14px',
            'Medium': '16px',
            'Large': '20px',
            'Extra Large': '24px'
        };

        const scaleMap = {
            'Small': '0.9',
            'Medium': '1',
            'Large': '1.2',
            'Extra Large': '1.4'
        };

        document.documentElement.style.setProperty('--aisa-font-size', fontSizeMap[fontSize] || '15px');
        document.documentElement.style.setProperty('--aisa-scale', scaleMap[fontSize] || '1');

        // Font Style
        const fontStyle = p.personalization.fontStyle || 'Default';
        const fontClasses = ['font-serif', 'font-mono', 'font-rounded', 'font-sans'];
        document.body.classList.remove(...fontClasses);
        const fontClassName = fontStyle === 'Serif' ? 'font-serif' : fontStyle === 'Mono' ? 'font-mono' : fontStyle === 'Rounded' ? 'font-rounded' : 'font-sans';
        document.body.classList.add(fontClassName);

        document.body.classList.add('aisa-scalable-text');
    };

    useEffect(() => {
        if (user?.token) {
            fetchPersonalizations();
            fetchNotifications();
            fetchChatSessions();

            // Set up interval for polling notifications to detect new reminders/alerts
            const interval = setInterval(() => {
                const fetchSilently = async () => {
                    try {
                        const res = await axios.get(apis.user + '/notifications', {
                            headers: { 'Authorization': `Bearer ${user.token}` }
                        });
                        
                        setNotifications(prev => {
                            if (res.data.length === 0) return prev;
                            
                            // Improved notification detection mapping
                            const newReminders = res.data.filter(n => n.id?.startsWith('reminder_') && !prev.some(p => p.id === n.id));
                            
                            newReminders.forEach(reminder => {
                                // Extract the core task ID from something like "reminder_6619a9..."
                                const taskId = reminder.id.replace('reminder_', '');

                                // Background Notification Toast with Stop Button
                                toast.custom((tObj) => (
                                    <div className={`${tObj.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white dark:bg-[#1E1E1E] shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-primary/20 overflow-hidden`}>
                                        <div className="flex-1 w-0 p-4">
                                            <div className="flex items-start">
                                                <div className="ml-0 flex-1">
                                                    <p className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                        <span>⏰</span> Reminder: {reminder.title}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex border-l border-gray-100 dark:border-white/5">
                                            <button
                                                onClick={() => {
                                                    stopReminderVoice();
                                                    toast.dismiss(tObj.id);
                                                }}
                                                className="w-full border border-transparent rounded-none rounded-r-2xl px-4 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 focus:outline-none"
                                            >
                                                Stop
                                            </button>
                                        </div>
                                    </div>
                                ), { duration: 60000 });

                                if (reminder.voice && reminder.voice !== 'none') {
                                    speakReminder(reminder.title, reminder.voice, taskId);
                                }
                            });
                            
                            // Prevent re-rendering if content is identical
                            if (prev.length === res.data.length && prev[0]?.id === res.data[0]?.id) {
                                return prev;
                            }
                            return res.data;
                        });
                    } catch (err) {}
                };
                fetchSilently();
            }, 10000); // Poll every 10s for better responsiveness
            
            return () => clearInterval(interval);
        }
        applyDynamicStyles();
        /* Migration check removed to allow localization */
    }, [user?.token]);

    const stopReminderVoice = () => {
        // 1. Stop Browser Native Speech (Crucial for fallback)
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }

        // 2. Stop Chirp-3 HD Looping Audio
        if (reminderAudioRef.current) {
            reminderAudioRef.current.pause();
            reminderAudioRef.current.currentTime = 0;
            if (reminderAudioRef.current.src) {
                URL.revokeObjectURL(reminderAudioRef.current.src);
            }
            reminderAudioRef.current = null;
        }
    };

    const speakReminder = async (text, voiceConfig, taskId) => {
        if (!user?.token) return;

        // Throttling: Prevent the same task from shouting multiple times within a minute
        if (taskId) {
            if (recentNotificationsRef.current.has(taskId)) return;
            recentNotificationsRef.current.add(taskId);
            setTimeout(() => {
                recentNotificationsRef.current.delete(taskId);
            }, 60000); // 1 minute cooldown per task
        }

        try {
            // Priority: Explicit voiceConfig (from task) > Global voice setting
            const v = personalizations?.voice || DEFAULT_PREFERENCES.voice;
            
            let finalVoice = v.voiceName;
            let langCode = v.languageCode;
            let pitch = v.pitch;
            let speed = v.speed;

            if (voiceConfig && voiceConfig !== 'none') {
                if (voiceConfig.includes('-Chirp3-HD-')) {
                    finalVoice = voiceConfig;
                    langCode = voiceConfig.split('-Chirp3-HD-')[0];
                } else {
                    const parts = voiceConfig.split('-');
                    langCode = parts.slice(0, 2).join('-');
                    const persona = parts[2] === 'male' ? 'Algieba' : 'Autonoe';
                    finalVoice = `${langCode}-Chirp3-HD-${persona}`;
                }
            }

            stopReminderVoice(); // Stop any overlapping audio

            const res = await axios.post(apis.synthesizeFile, {
                introText: `🔔 ${text}`,
                languageCode: langCode,
                voiceName: finalVoice,
                pitch: pitch,
                speakingRate: speed
            }, {
                headers: { 'Authorization': `Bearer ${user.token}` },
                responseType: 'blob'
            });

            const url = URL.createObjectURL(res.data);
            const audio = new Audio(url);
            audio.loop = true;
            reminderAudioRef.current = audio;
            audio.play();
        } catch (error) {
            console.error('Premium TTS failed, falling back...', error);
            try {
                const utterance = new SpeechSynthesisUtterance(text);
                window.speechSynthesis.speak(utterance);
            } catch (inner) {}
        }
    };

    const updatePersonalization = async (section, data) => {
        const next = {
            ...personalizations,
            [section]: { ...(personalizations?.[section] || {}), ...data }
        };
        setPersonalizationsState(next);
        localStorage.setItem('personalizations', JSON.stringify(next));
        applyDynamicStyles(next);
        syncWithBackend(section, next[section]);
    };

    const syncWithBackend = async (section, fullSectionData) => {
        try {
            if (user?.token) {
                await axios.put(apis.user + '/personalizations',
                    { personalizations: { [section]: fullSectionData } },
                    { headers: { 'Authorization': `Bearer ${user.token}` } }
                );
            }
        } catch (error) {
            console.warn('Sync failed:', error.message);
        }
    };

    const resetPersonalizations = async () => {
        try {
            if (user?.token) {
                await axios.post(apis.user + '/personalizations/reset', {}, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                setPersonalizationsState(DEFAULT_PREFERENCES);
                localStorage.setItem('personalizations', JSON.stringify(DEFAULT_PREFERENCES));
                applyDynamicStyles(DEFAULT_PREFERENCES);
                toast.success('Settings reset');
            }
        } catch (error) {}
    };

    const getSystemPromptExtensions = () => {
        const p = personalizations?.personalization || {};
        let prompt = "";
        if (p.emojiUsage) {
            const map = { 'None': "Do NOT use emojis.", 'Minimal': "Use emojis sparingly.", 'Moderate': "Use emojis moderately.", 'Expressive': "Use emojis frequently." };
            prompt += `\nEmoji Guideline: ${map[p.emojiUsage] || map['Moderate']}`;
        }
        if (p.customInstructions) prompt += `\nCustom Instructions: ${p.customInstructions}`;
        return prompt;
    };

    return (
        <PersonalizationContext.Provider value={{
            personalizations,
            updatePersonalization,
            resetPersonalizations,
            isLoading,
            notifications,
            deleteNotification,
            clearAllNotifications,
            chatSessions,
            refreshChatSessions: fetchChatSessions,
            getSystemPromptExtensions,
            speakReminder,
            stopReminderVoice
        }}>
            {children}
        </PersonalizationContext.Provider>
    );
};

export const usePersonalization = () => {
    const context = useContext(PersonalizationContext);
    if (!context) throw new Error('usePersonalization must be used within a PersonalizationProvider');
    return context;
};
