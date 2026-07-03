/**
 * PayPalButton.jsx
 * ─────────────────
 * PayPal payment button for React — works on all browsers and devices.
 * Mirrors the ApplePayButton.jsx pattern.
 *
 * USAGE:
 * <PayPalButton
 *   planId="abc123"
 *   billingCycle="monthly"
 *   onSuccess={(data) => console.log('Activated!', data)}
 *   onError={(err) => console.error(err)}
 *   onProcessing={(val) => setProcessing(val)}
 *   disabled={false}
 * />
 */

import React, { useState } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';

// ─── Helper: Auth Headers ────────────────────────────────────────────────────
function getAuthHeaders() {
    const userStr = localStorage.getItem("user");
    let token = null;
    if (userStr && userStr !== "undefined" && userStr !== "null") {
        try {
            const userObj = JSON.parse(userStr);
            token = userObj?.token;
        } catch (e) {}
    }
    if (!token || token === "undefined" || token === "null") {
        token = localStorage.getItem("auth_token") || localStorage.getItem("token") || "";
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ""
    };
}

const API_BASE = window._env_?.VITE_AISA_BACKEND_API || import.meta.env.VITE_AISA_BACKEND_API || 'http://localhost:8080/api';

// ─── PayPalButton Component ──────────────────────────────────────────────────
const PayPalButton = ({ planId, billingCycle, onSuccess, onError, onProcessing, disabled }) => {
    const [{ isPending, isResolved, isRejected }] = usePayPalScriptReducer();
    const [orderDetails, setOrderDetails] = useState(null);

    if (isRejected) {
        return (
            <div className="text-xs text-red-400 text-center py-2">
                PayPal failed to load. Please refresh the page.
            </div>
        );
    }

    if (isPending) {
        return (
            <div className="flex items-center justify-center py-2">
                <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mr-2" />
                <span className="text-xs text-slate-400">Loading PayPal...</span>
            </div>
        );
    }

    return (
        <PayPalButtons
            style={{
                layout: 'horizontal',
                color: 'blue',
                shape: 'pill',
                label: 'paypal',
                height: 40,
                tagline: false,
            }}
            disabled={disabled}
            forceReRender={[planId, billingCycle]}

            // ── Step 1: Create PayPal Order on Backend ──────────────────────
            createOrder={async () => {
                try {
                    onProcessing?.(true);

                    const response = await fetch(`${API_BASE}/payment/paypal/create-order`, {
                        method: 'POST',
                        headers: getAuthHeaders(),
                        body: JSON.stringify({ planId, billingCycle }),
                    });

                    const data = await response.json();

                    if (!response.ok || !data.success) {
                        throw new Error(data.message || 'Failed to create PayPal order');
                    }

                    // Handle free plan
                    if (data.isFree) {
                        onSuccess?.({ isFree: true });
                        return null;
                    }

                    // Store order details for the capture step
                    setOrderDetails(data);
                    return data.orderID;

                } catch (err) {
                    onProcessing?.(false);
                    onError?.(err);
                    throw err;
                }
            }}

            // ── Step 2: Capture PayPal Order on Backend ─────────────────────
            onApprove={async (data) => {
                try {
                    const response = await fetch(`${API_BASE}/payment/paypal/capture`, {
                        method: 'POST',
                        headers: getAuthHeaders(),
                        body: JSON.stringify({
                            orderID: data.orderID,
                            planId,
                            billingCycle,
                        }),
                    });

                    const result = await response.json();

                    if (!response.ok || !result.success) {
                        throw new Error(result.message || 'Failed to activate plan after PayPal payment');
                    }

                    onSuccess?.(result);

                } catch (err) {
                    onError?.(err);
                } finally {
                    onProcessing?.(false);
                }
            }}

            // ── Payment Cancelled ────────────────────────────────────────────
            onCancel={() => {
                onProcessing?.(false);
                console.log('[PayPal] Payment cancelled by user');
            }}

            // ── Payment Error ────────────────────────────────────────────────
            onError={(err) => {
                onProcessing?.(false);
                console.error('[PayPal] Payment error:', err);
                onError?.(new Error('PayPal payment failed. Please try again.'));
            }}
        />
    );
};

export default PayPalButton;
