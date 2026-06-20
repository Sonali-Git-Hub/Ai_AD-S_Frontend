import axios from 'axios';
import { API } from '../../../types.js';

const STORAGE_KEYS = {
    CASES: 'aisa_legal_cases',
    HEARINGS: 'aisa_legal_hearings',
    COMPLIANCE: 'aisa_legal_compliance',
    ACTIVITY: 'aisa_legal_activity',
    CHATS: 'aisa_legal_chats',
    REMINDERS: 'aisa_legal_reminders',
    EVIDENCE: 'aisa_legal_evidence_history',
    ARGUMENTS: 'aisa_legal_argument_history',
    TIMELINE: 'aisa_legal_timeline',
    HEARING_DOCS: 'aisa_legal_hearing_docs',
    HEARING_REMINDERS: 'aisa_legal_hearing_reminders',
    NOTIFICATIONS: 'aisa_legal_notifications'
};

export const legalService = {
    // --- Generic Persistence Helpers ---
    async _getData(key, fallback) {
        try {
            const data = localStorage.getItem(key);
            if (data !== null) return JSON.parse(data);
            return fallback;
        } catch (e) {
            console.error(`[LegalService] Error getting ${key}`, e);
            return fallback;
        }
    },

    async _saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error(`[LegalService] Error saving ${key}`, e);
            return false;
        }
    },

    // --- Case Management ---
    _listeners: [],

    subscribe(callback) {
        if (typeof callback === 'function') {
            this._listeners.push(callback);
        }
        return () => {
            this._listeners = this._listeners.filter(cb => cb !== callback);
        };
    },

    notifyListeners() {
        this.getCases().then(cases => {
            this._listeners.forEach(cb => {
                try {
                    cb(cases);
                } catch (e) {
                    console.error("[LegalService] Listener notification failed", e);
                }
            });
        }).catch(err => console.error("[LegalService] Error notifying listeners", err));
    },

    async getCases() {
        return await this._getData(STORAGE_KEYS.CASES, []);
    },

    async createCase(caseData) {
        const cases = await this.getCases();
        const newCase = { ...caseData, id: Date.now().toString(), status: 'Active' };
        const updated = [newCase, ...cases];
        await this._saveData(STORAGE_KEYS.CASES, updated);
        await this.addActivity(`Created case: ${caseData.title}`, 'case');
        this.notifyListeners();
        return newCase;
    },

    async updateCase(id, updates) {
        const cases = await this.getCases();
        const updated = cases.map(c => c.id === id ? { ...c, ...updates } : c);
        await this._saveData(STORAGE_KEYS.CASES, updated);
        this.notifyListeners();
        return true;
    },

    async deleteCase(id) {
        const cases = await this.getCases();
        const updated = cases.filter(c => c.id !== id);
        const res = await this._saveData(STORAGE_KEYS.CASES, updated);
        this.notifyListeners();
        return res;
    },

    // --- Hearing Management ---
    async getHearings() {
        return await this._getData(STORAGE_KEYS.HEARINGS, []);
    },

    async getHistoryHearings() {
        const hearings = await this.getHearings();
        return hearings.filter(h => h.status?.toLowerCase() === 'completed' || h.status?.toLowerCase() === 'adjourned');
    },

    async addHearing(hearingData) {
        const hearings = await this.getHearings();
        const newHearing = { ...hearingData, id: Date.now().toString(), status: 'scheduled', aiPrep: Math.floor(Math.random() * 50) + 50 };
        const updated = [newHearing, ...hearings];
        await this._saveData(STORAGE_KEYS.HEARINGS, updated);
        await this.addActivity(`Scheduled hearing for: ${hearingData.caseTitle}`, 'hearing');
        return newHearing;
    },

    async updateHearing(id, updates) {
        const hearings = await this.getHearings();
        const now = new Date().toISOString();
        const updated = hearings.map(h => {
            if (h.id === id) {
                const normalizedStatus = updates.status ? updates.status.toLowerCase() : h.status;
                return { 
                    ...h, 
                    ...updates,
                    status: normalizedStatus,
                    updatedAt: now,
                    completedAt: normalizedStatus === 'completed' ? (h.completedAt || now) : null
                };
            }
            return h;
        });
        return await this._saveData(STORAGE_KEYS.HEARINGS, updated);
    },

    async deleteHearing(id) {
        const hearings = await this.getHearings();
        const updated = hearings.filter(h => h.id !== id);
        return await this._saveData(STORAGE_KEYS.HEARINGS, updated);
    },

    async syncHearingStatus(title, status) {
        if (!title) return false;
        const hearings = await this.getHearings();
        let changed = false;
        const normalizedStatus = status.toLowerCase() === 'completed' ? 'completed' : 'scheduled';
        const now = new Date().toISOString();
        const updated = hearings.map(h => {
            if (h.caseTitle?.trim().toLowerCase() === title.trim().toLowerCase()) {
                changed = true;
                return { 
                    ...h, 
                    status: normalizedStatus,
                    completedAt: normalizedStatus === 'completed' ? now : null,
                    updatedAt: now
                };
            }
            return h;
        });
        if (changed) {
            await this._saveData(STORAGE_KEYS.HEARINGS, updated);
        }
        return changed;
    },

    // --- Reminders ---
    async getReminders() {
        return await this._getData(STORAGE_KEYS.REMINDERS, []);
    },

    async getRemindersForCase(caseId) {
        const reminders = await this.getReminders();
        return reminders.filter(r => r.case_id === caseId);
    },

    async addReminder(reminder) {
        const reminders = await this.getReminders();
        const newReminder = { ...reminder, id: Date.now().toString(), createdAt: new Date().toISOString() };
        const updated = [newReminder, ...reminders];
        await this._saveData(STORAGE_KEYS.REMINDERS, updated);
        return newReminder;
    },

    async updateReminder(id, updates) {
        const reminders = await this.getReminders();
        const updated = reminders.map(r => r.id === id ? { ...r, ...updates } : r);
        await this._saveData(STORAGE_KEYS.REMINDERS, updated);
        return true;
    },

    async deleteReminder(id) {
        const reminders = await this.getReminders();
        const updated = reminders.filter(r => r.id !== id);
        await this._saveData(STORAGE_KEYS.REMINDERS, updated);
        return true;
    },

    // --- Compliance Center ---
    async getComplianceData() {
        return await this._getData(STORAGE_KEYS.COMPLIANCE, { score: null, riskLevel: null, lastAudit: null, alerts: [], requirements: [] });
    },

    async updateComplianceScore(score) {
        const data = await this.getComplianceData();
        data.score = score;
        return await this._saveData(STORAGE_KEYS.COMPLIANCE, data);
    },

    // --- Activity Logs ---
    async getRecentActivity() {
        return await this._getData(STORAGE_KEYS.ACTIVITY, []);
    },

    async addActivity(title, type) {
        const activity = await this.getRecentActivity();
        const newItem = { id: Date.now().toString(), title, time: 'Just now', type };
        const updated = [newItem, ...activity.slice(0, 19)];
        await this._saveData(STORAGE_KEYS.ACTIVITY, updated);
        return updated;
    },

    // --- Timeline Events ---
    async getTimelineEvents(caseId) {
        const events = await this._getData(STORAGE_KEYS.TIMELINE, []);
        return caseId ? events.filter(e => e.caseId === caseId) : events;
    },

    async saveTimelineEvent(event) {
        const events = await this._getData(STORAGE_KEYS.TIMELINE, []);
        const now = new Date().toISOString();
        const normalizedStatus = event.status ? event.status.toLowerCase() : 'scheduled';
        const newEvent = {
            ...event,
            status: normalizedStatus,
            id: event.id || Date.now().toString(),
            timestamp: event.id ? (event.timestamp || now) : now,
            updatedAt: now,
            completedAt: normalizedStatus === 'completed' ? now : null
        };
        const updated = event.id ? events.map(e => e.id === event.id ? newEvent : e) : [newEvent, ...events];
        await this._saveData(STORAGE_KEYS.TIMELINE, updated);
        await this.addActivity(`Timeline Event: ${event.title}`, 'timeline');
        return newEvent;
    },

    async deleteTimelineEvent(id) {
        const events = await this._getData(STORAGE_KEYS.TIMELINE, []);
        const updated = events.filter(e => e.id !== id);
        return await this._saveData(STORAGE_KEYS.TIMELINE, updated);
    },

    // --- Hearing Documents ---
    async getHearingDocuments(hearingId) {
        const docs = await this._getData(STORAGE_KEYS.HEARING_DOCS, []);
        return hearingId ? docs.filter(d => d.hearingId === hearingId) : docs;
    },

    async saveHearingDocument(doc) {
        const docs = await this._getData(STORAGE_KEYS.HEARING_DOCS, []);
        const newDoc = {
            ...doc,
            id: doc.id || Date.now().toString(),
            uploadDate: new Date().toISOString()
        };
        const updated = doc.id ? docs.map(d => d.id === doc.id ? newDoc : d) : [newDoc, ...docs];
        await this._saveData(STORAGE_KEYS.HEARING_DOCS, updated);
        await this.addActivity(`Document Uploaded: ${newDoc.name}`, 'document');
        return newDoc;
    },

    async deleteHearingDocument(id) {
        const docs = await this._getData(STORAGE_KEYS.HEARING_DOCS, []);
        const updated = docs.filter(d => d.id !== id);
        return await this._saveData(STORAGE_KEYS.HEARING_DOCS, updated);
    },

    // --- Hearing Reminders ---
    async getHearingReminder(hearingId) {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                const token = user?.token;
                if (token) {
                    const response = await axios.get(`${API}/legal/reminders/${hearingId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.data && response.data.success) {
                        return response.data.reminder;
                    }
                }
            }
        } catch (error) {
            console.log('[legalService] getHearingReminder API failed, falling back to local.', error?.response?.data || error.message);
        }

        const reminders = await this._getData(STORAGE_KEYS.HEARING_REMINDERS, []);
        return reminders.find(r => r.hearingId === hearingId) || null;
    },

    async saveHearingReminder(reminder) {
        let savedReminder = null;
        let isOnlineSuccess = false;
        let authError = false;

        try {
            const userStr = localStorage.getItem('user');
            let token = null;
            if (userStr) {
                const user = JSON.parse(userStr);
                token = user?.token;
            }

            console.log('[legalService] Syncing reminder to backend. Payload:', reminder);

            if (token) {
                const response = await axios.post(`${API}/legal/reminders`, reminder, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('[legalService] Sync response success:', response.data);
                if (response.data && response.data.success) {
                    savedReminder = response.data.reminder;
                    isOnlineSuccess = true;
                }
            } else {
                console.log('[legalService] Sync failed: No authentication token available.');
                authError = true;
            }
        } catch (error) {
            console.log('[legalService] saveHearingReminder API failed.', {
                endpoint: `${API}/legal/reminders`,
                method: 'POST',
                status: error?.response?.status,
                data: error?.response?.data,
                message: error.message
            });
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                authError = true;
            }
        }

        if (!savedReminder) {
            savedReminder = {
                ...reminder,
                id: reminder.id || Date.now().toString(),
                userId: 'current_user_fallback'
            };
        }

        const reminders = await this._getData(STORAGE_KEYS.HEARING_REMINDERS, []);
        const updated = reminders.filter(r => r.hearingId !== reminder.hearingId);
        updated.push(savedReminder);
        await this._saveData(STORAGE_KEYS.HEARING_REMINDERS, updated);

        if (authError) {
            throw new Error('Authentication error. Saved offline. Please log in again to sync.');
        }

        if (!isOnlineSuccess) {
            throw new Error('Network error. Saved offline but may not sync to backend.');
        }

        return savedReminder;
    },

    async deleteHearingReminder(hearingId) {
        let isOnlineSuccess = false;
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                const token = user?.token;
                if (token) {
                    const response = await axios.delete(`${API}/legal/reminders/${hearingId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.data && response.data.success) {
                        isOnlineSuccess = true;
                    }
                }
            }
        } catch (error) {
            console.log('[legalService] deleteHearingReminder API failed, falling back to local.', error?.response?.data || error.message);
        }

        const reminders = await this._getData(STORAGE_KEYS.HEARING_REMINDERS, []);
        const updated = reminders.filter(r => r.hearingId !== hearingId);
        await this._saveData(STORAGE_KEYS.HEARING_REMINDERS, updated);

        if (!isOnlineSuccess) {
            throw new Error('Network error. Deleted offline but may not sync to backend.');
        }

        return true;
    },

    // --- Notifications ---
    async getNotifications() {
        return await this._getData(STORAGE_KEYS.NOTIFICATIONS, []);
    },

    async saveNotification(notif) {
        const notifications = await this._getData(STORAGE_KEYS.NOTIFICATIONS, []);
        const newNotif = {
            ...notif,
            id: Date.now().toString(),
            isRead: false,
            createdAt: new Date().toISOString()
        };
        const updated = [newNotif, ...notifications];
        await this._saveData(STORAGE_KEYS.NOTIFICATIONS, updated);
        return newNotif;
    },

    async markNotificationAsRead(id) {
        const notifications = await this._getData(STORAGE_KEYS.NOTIFICATIONS, []);
        const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
        return await this._saveData(STORAGE_KEYS.NOTIFICATIONS, updated);
    },

    async markAllNotificationsAsRead() {
        const notifications = await this._getData(STORAGE_KEYS.NOTIFICATIONS, []);
        const updated = notifications.map(n => ({ ...n, isRead: true }));
        return await this._saveData(STORAGE_KEYS.NOTIFICATIONS, updated);
    },

    // --- Evidence Analysis History ---
    async getEvidenceHistory() {
        return await this._getData(STORAGE_KEYS.EVIDENCE, []);
    },

    async saveEvidenceSession(session) {
        const history = await this.getEvidenceHistory();
        const newSession = { 
            ...session, 
            id: Date.now().toString(), 
            timestamp: new Date().toISOString(),
            displayTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            displayDate: new Date().toLocaleDateString()
        };
        const updated = [newSession, ...history];
        await this._saveData(STORAGE_KEYS.EVIDENCE, updated);
        await this.addActivity(`Evidence Analyzed: ${session.fileName || 'Document'}`, 'evidence');
        return newSession;
    },

    async deleteEvidenceSession(id) {
        const history = await this.getEvidenceHistory();
        const updated = history.filter(s => s.id !== id);
        return await this._saveData(STORAGE_KEYS.EVIDENCE, updated);
    },

    // --- Argument Builder History ---
    async getArgumentHistory() {
        return await this._getData(STORAGE_KEYS.ARGUMENTS, []);
    },

    async saveArgumentSession(session) {
        const history = await this.getArgumentHistory();
        const newSession = { 
            ...session, 
            id: Date.now().toString(), 
            timestamp: new Date().toISOString(),
            displayTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            displayDate: new Date().toLocaleDateString()
        };
        const updated = [newSession, ...history];
        await this._saveData(STORAGE_KEYS.ARGUMENTS, updated);
        await this.addActivity(`Argument Built: ${session.title}`, 'argument');
        return newSession;
    },

    async deleteArgumentSession(id) {
        const history = await this.getArgumentHistory();
        const updated = history.filter(s => s.id !== id);
        return await this._saveData(STORAGE_KEYS.ARGUMENTS, updated);
    },

    // --- Chat History ---
    async getChatHistory(toolId) {
        const allChats = await this._getData(STORAGE_KEYS.CHATS, {});
        return allChats[toolId] || [];
    },

    async saveChatMessage(toolId, message) {
        const allChats = await this._getData(STORAGE_KEYS.CHATS, {});
        if (!allChats[toolId]) allChats[toolId] = [];
        allChats[toolId].push({ ...message, id: Date.now().toString(), timestamp: new Date().toISOString() });
        return await this._saveData(STORAGE_KEYS.CHATS, allChats);
    },

    async clearChatHistory(toolId) {
        const allChats = await this._getData(STORAGE_KEYS.CHATS, {});
        allChats[toolId] = [];
        return await this._saveData(STORAGE_KEYS.CHATS, allChats);
    },

    // --- Stats & Analytics ---
    async getDashboardStats() {
        const cases = await this.getCases();
        const hearings = await this.getHearings();
        const compliance = await this.getComplianceData();
        const evidence = await this.getEvidenceHistory();
        const arguments_ = await this.getArgumentHistory();

        const activeCases = cases.filter(c => c.status === 'Active').length;
        const upcomingHearings = hearings.filter(h => h.status?.toLowerCase() !== 'completed' && h.status?.toLowerCase() !== 'adjourned').length;
        const totalInsights = evidence.length + arguments_.length;

        const hasAnyData = cases.length > 0 || hearings.length > 0 || compliance.score !== null;
        if (!hasAnyData) return null;

        return {
            activeCases: activeCases.toString(),
            hearingsCount: upcomingHearings.toString(),
            complianceScore: compliance.score !== null ? `${compliance.score}%` : null,
            riskScore: compliance.riskLevel || null,
            aiInsights: totalInsights > 0 ? totalInsights.toString() : null,
        };
    }
};
