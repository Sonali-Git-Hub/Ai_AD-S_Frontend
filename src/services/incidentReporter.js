import axios from 'axios';
import { API } from '../types.js';

let breadcrumbs = [];
const maxBreadcrumbs = 30;

// Add a breadcrumb to the sliding buffer
export const addBreadcrumb = (category, message, data = {}) => {
    breadcrumbs.push({
        type: 'log',
        category,
        message,
        data,
        timestamp: new Date().toISOString()
    });
    if (breadcrumbs.length > maxBreadcrumbs) {
        breadcrumbs.shift();
    }
};

// Heuristic browser/OS/device parser
const getBrowserDetails = () => {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let os = 'Unknown';
    let device = 'Desktop';

    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edge')) browser = 'Edge';

    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) { os = 'Android'; device = 'Mobile'; }
    else if (ua.includes('iPhone') || ua.includes('iPad')) { os = 'iOS'; device = 'Mobile'; }

    if (/mobile|tablet|phone/i.test(ua)) {
        device = 'Mobile';
    }

    return { browser, os, device };
};

// Report the error to the backend
export const reportErrorToBackend = async (errorMessage, stackTrace, details = {}) => {
    try {
        const { browser, os, device } = getBrowserDetails();
        
        let userId = null;
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const parsed = JSON.parse(userStr);
                userId = parsed?.id || parsed?._id;
            }
        } catch (e) {}

        // Grab current session ID from URL path if possible
        let sessionId = null;
        const chatMatch = window.location.pathname.match(/\/dashboard\/chat\/([a-zA-Z0-9_\-]+)/);
        if (chatMatch && chatMatch[1]) {
            sessionId = chatMatch[1];
        }

        // Detect current tool module based on route path
        let toolModule = 'General';
        const path = window.location.pathname;
        if (path.includes('/dashboard/legal')) toolModule = 'LEGAL_TOOLKIT';
        else if (path.includes('/dashboard/social-agent')) toolModule = 'AI_SOCIAL_MEDIA';
        else if (path.includes('/dashboard/ai-personal-assistant')) toolModule = 'AI_PERSONAL_ASSISTANT';
        else if (path.includes('/dashboard/ai-base')) toolModule = 'AI_BASE';

        const token = localStorage.getItem('token') || localStorage.getItem('auth_token');

        const payload = {
            errorMessage: errorMessage || 'Unhandled Client Exception',
            stackTrace: stackTrace || '',
            component: 'Frontend',
            apiRoute: details.apiRoute || path,
            apiMethod: details.apiMethod || 'CLIENT',
            toolModule: details.toolModule || toolModule,
            cardName: details.cardName || undefined,
            actionName: details.actionName || undefined,
            errorCode: details.errorCode || 'CLIENT_ERROR',
            statusCode: details.statusCode || 0,
            userId: userId ? String(userId) : undefined,
            sessionId: details.sessionId || sessionId,
            environment: import.meta.env.MODE || 'Production',
            browser,
            os,
            device,
            payload: details.requestPayload || {},
            responsePayload: details.responsePayload || {},
            breadcrumbs,
            logs: [
                `Page URL: ${window.location.href}`, 
                `History Stack Length: ${window.history.length}`,
                ...(details.logs || [])
            ]
        };

        const config = {};
        if (token) {
            config.headers = { Authorization: `Bearer ${token}` };
        }

        await axios.post(`${API}/incidents/report`, payload, config);
    } catch (e) {
        console.error('[Telemetry failed to report error]', e);
    }
};

// Initialize listeners
export const initIncidentReporter = () => {
    console.log('📡 AISA Telemetry Error Monitoring System Initialized.');

    // 1. Listen to Javascript exceptions
    window.addEventListener('error', (event) => {
        const error = event.error || {};
        const msg = event.message || error.message || 'Script Error';
        const stack = error.stack || `${event.filename}:${event.lineno}:${event.colno}`;
        
        addBreadcrumb('error', `Script Error: ${msg}`, { stack });
        reportErrorToBackend(msg, stack);
    });

    // 2. Listen to unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason || {};
        const msg = reason.message || String(reason) || 'Unhandled Promise Rejection';
        const stack = reason.stack || 'No stack trace available';
        
        addBreadcrumb('error', `Unhandled Rejection: ${msg}`, { stack });
        reportErrorToBackend(msg, stack);
    });

    // 3. Intercept user click events
    window.addEventListener('click', (event) => {
        const target = event.target;
        if (!target) return;
        const tag = target.tagName?.toLowerCase();
        const id = target.id ? `#${target.id}` : '';
        const cls = target.className && typeof target.className === 'string' 
            ? `.${target.className.split(' ').slice(0, 3).join('.')}` 
            : '';
        const text = target.innerText?.trim().substring(0, 30) || '';

        if (['button', 'a', 'input', 'select', 'textarea'].includes(tag) || target.onclick || target.closest('[role="button"]')) {
            addBreadcrumb('ui', `User clicked ${tag}${id}${cls} [text: "${text}"]`);
        }
    }, true);

    // 4. Intercept route updates (history state pushes)
    const originalPushState = window.history.pushState;
    window.history.pushState = function(...args) {
        const url = args[2] || '';
        addBreadcrumb('navigation', `Route transition to: ${url}`);
        return originalPushState.apply(this, args);
    };

    const originalReplaceState = window.history.replaceState;
    window.history.replaceState = function(...args) {
        const url = args[2] || '';
        addBreadcrumb('navigation', `Route replaced with: ${url}`);
        return originalReplaceState.apply(this, args);
    };

    window.addEventListener('popstate', () => {
        addBreadcrumb('navigation', `Browser history popstate: ${window.location.pathname}`);
    });
};
