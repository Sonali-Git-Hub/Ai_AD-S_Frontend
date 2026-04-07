import axios from "axios";
import { apis } from "../types";
import { getUserData } from "../userStore/userData";
import { getDeviceFingerprint } from "../utils/fingerprint";

export const generateChatResponse = async (history, currentMessage, systemInstruction, attachments, language, abortSignal = null, mode = null, sessionId = null, projectId = null) => {
    try {
        const token = getUserData()?.token;
        const headers = {
            'X-Device-Fingerprint': getDeviceFingerprint()
        };
        if (token && token !== 'undefined' && token !== 'null') {
            headers.Authorization = `Bearer ${token}`;
        }

        // Language handling is now performed centrally in the backend ai.service.js
        const combinedSystemInstruction = (systemInstruction || '').trim();

        let images = [];
        let documents = [];
        let finalMessage = currentMessage;

        if (attachments && Array.isArray(attachments)) {
            attachments.forEach(attachment => {
                if (attachment.url && attachment.url.startsWith('data:')) {
                    const base64Data = attachment.url.split(',')[1];
                    const mimeType = attachment.url.substring(attachment.url.indexOf(':') + 1, attachment.url.indexOf(';'));

                    if (attachment.type === 'image' || mimeType.startsWith('image/')) {
                        images.push({ mimeType, base64Data });
                    } else {
                        documents.push({ mimeType: mimeType || 'application/pdf', base64Data, name: attachment.name });
                    }
                } else if (attachment.url) {
                    // Include URL in images array if it's an image type
                    const isImage = attachment.type === 'image' || 
                                   (attachment.name && /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(attachment.name)) ||
                                   (attachment.mimeType && attachment.mimeType.startsWith('image/'));
                    
                    if (isImage) {
                        images.push({ url: attachment.url, name: attachment.name, mimeType: attachment.mimeType });
                    }
                    
                    finalMessage += `\n[Shared File: ${attachment.name || 'Link'} - ${attachment.url}]`;
                }
            });
        }

        // Limit history to last 50 messages to prevent token overflow in unlimited chats
        const recentHistory = history.length > 50 ? history.slice(-50) : history;

        const payload = {
            content: finalMessage,
            history: recentHistory,
            systemInstruction: combinedSystemInstruction,
            image: images,
            document: documents,
            language: language || 'English',
            mode: mode,
            sessionId: sessionId,
            projectId: projectId
        };

        const result = await axios.post(apis.chatAgent, payload, {
            headers: headers,
            signal: abortSignal,
            withCredentials: true,
            timeout: 60000 // 60s timeout to match backend
        });

        // Return full response data (includes reply and potentially conversion data)
        return result.data;

    } catch (error) {
        console.error("Gemini API Error:", error);

        // Handle credit / plan errors
        if (error.response?.status === 403) {
            const code = error.response?.data?.code;
            const message = error.response?.data?.message;

            if (code === 'OUT_OF_CREDITS') {
                // Fire event to show CreditUpsellPopup
                window.dispatchEvent(new Event('out_of_credits'));
                return { error: 'OUT_OF_CREDITS', message };
            }
            if (code === 'PREMIUM_ONLY') {
                // Fire event to show PremiumUpsellModal
                window.dispatchEvent(new CustomEvent('premium_required', { detail: { toolName: 'this feature' } }));
                return { error: 'PREMIUM_ONLY', message };
            }
        }

        if (error.response?.status === 429) {
            const detail = error.response?.data?.details || error.response?.data?.error;
            if (detail) return `System Busy (429): ${detail}`;
            return "The A-Series system is currently busy (Quota limit reached). Please wait 60 seconds and try again.";
        }
        if (error.response?.status === 401) {
            return "Please [Log In](/login) to your AISA™ account to continue chatting.";
        }
        if (error.response?.data?.error === "LIMIT_REACHED") {
            return { error: "LIMIT_REACHED", reason: error.response.data.reason };
        }
        // Return backend error message if available
        if (error.response?.data?.error) {
            const details = error.response.data.details ? ` - ${error.response.data.details}` : '';
            return `System Message: ${error.response.data.error}${details}`;
        }
        if (error.response?.data?.details) {
            return `System Error: ${error.response.data.details}`;
        }
        return "Sorry, I am having trouble connecting to the A-Series network right now. Please check your connection.";
    }
};

/**
 * Generates context-aware follow-up prompts for a given user query.
 * Useful for "Smart Suggestions" after image generation or chat.
 * @param {string} prompt - The original prompt
 * @param {string} type - 'image', 'video', or 'chat'
 * @returns {Promise<string[]>} List of 3 suggested prompts
 */
export const generateFollowUpPrompts = async (prompt, type = 'image') => {
    try {
        const systemInstruction = `You are AISA™ Prompt Engineer.
Based on this ${type} request: "${prompt}", generate exactly 3 highly relevant, creative, and varied follow-up prompts.
- Prompts must be concise (max 10 words).
- Format: A simple numbered or bulleted list.
- Do NOT include any intro or outro text.
- Match the language of the original prompt if possible.`;

        const response = await generateChatResponse([], prompt, systemInstruction, [], 'English');
        
        // Handle both object {reply: "..."} and direct string responses
        const replyText = response?.reply || (typeof response === 'string' ? response : null);
        
        if (replyText && !replyText.includes('Log In') && !replyText.includes('System Message')) {
            // Split by newline or standard bullet patterns (1., -, *, •)
            return replyText
                .split(/\n|(?=\b\d+\.)|(?=\b[-*•]\s)/)
                .map(line => line.replace(/^\s*[-*•\d+.]\s*/, '').trim())
                .filter(line => line.length > 3 && line.length < 150)
                .slice(0, 3);
        }
        return [];
    } catch (error) {
        console.error("Error generating suggestions:", error);
        return [];
    }
};

