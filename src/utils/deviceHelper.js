export const getDeviceFingerprint = () => {
    try {
        const navigator_info = window.navigator || {};
        const screen_info = window.screen || {};

        let fingerprint = navigator_info.userAgent || '';
        fingerprint += navigator_info.language || '';
        fingerprint += screen_info.colorDepth || '';
        fingerprint += (screen_info.width || 0) + "x" + (screen_info.height || 0);
        fingerprint += new Date().getTimezoneOffset();
        fingerprint += navigator_info.hardwareConcurrency || '';

        // Use a simple hash function
        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
            const char = fingerprint.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(16);
    } catch (error) {
        console.error("Failed to generate device identifier, using fallback:", error);
        // Fallback: Try to retrieve or generate a persistent random UUID from localStorage
        try {
            let fallbackId = localStorage.getItem("aisa_device_fallback_id");
            if (!fallbackId) {
                fallbackId = 'fallback-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                localStorage.setItem("aisa_device_fallback_id", fallbackId);
            }
            return fallbackId;
        } catch (storageError) {
            // Extreme fallback if localStorage is blocked too
            return 'fallback-static-id';
        }
    }
};
