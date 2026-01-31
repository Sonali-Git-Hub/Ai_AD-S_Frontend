import { useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { apis } from '../types';

const usePayment = () => {
    const [loading, setLoading] = useState(false);

    // Load Razorpay SDK
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = useCallback(async (plan, user, onSuccess) => {
        setLoading(true);
        try {
            // 1. Create Order on Backend
            const { data: orderData } = await axios.post(apis.createOrder, {
                plan: plan.name || plan.id
            }, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });

            // Handle Free Plan (Basic) - direct update
            if (orderData.amount === 0) {
                toast.success('Plan updated to Basic successfully!');
                if (onSuccess) onSuccess(orderData.user);
                setLoading(false);
                return;
            }

            // 2. Load Razorpay SDK
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                toast.error('Failed to load payment gateway. Please try again.');
                setLoading(false);
                return;
            }

            // 3. Configure Razorpay Checkout
            const options = {
                key: orderData.key, // Razorpay Key ID from backend
                amount: orderData.amount, // Amount in paise
                currency: orderData.currency,
                name: 'AI-MALL',
                description: `${plan.name} Plan Subscription`,
                order_id: orderData.id,
                handler: async function (response) {
                    // 4. Payment Success - Verify on Backend
                    try {
                        const verifyResult = await axios.post(apis.verifyPayment, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            plan: plan.name,
                            amount: orderData.amount
                        }, {
                            headers: { 'Authorization': `Bearer ${user.token}` }
                        });

                        toast.success('🎉 Payment Successful! Plan Upgraded.');
                        if (onSuccess) onSuccess(verifyResult.data.user);
                    } catch (error) {
                        console.error('Payment verification error:', error);
                        toast.error('Payment verification failed. Please contact support.');
                    } finally {
                        setLoading(false);
                    }
                },
                prefill: {
                    name: user.name || '',
                    email: user.email || '',
                },
                theme: {
                    color: '#6366f1' // Indigo color matching your app theme
                },
                modal: {
                    ondismiss: function () {
                        toast.error('Payment cancelled');
                        setLoading(false);
                    }
                }
            };

            // 5. Open Razorpay Checkout
            const razorpayInstance = new window.Razorpay(options);

            razorpayInstance.on('payment.failed', function (response) {
                console.error('Payment failed:', response.error);
                toast.error(`Payment failed: ${response.error.description}`);
                setLoading(false);
            });

            razorpayInstance.open();

        } catch (error) {
            console.error('Payment error:', error);
            toast.error(error.response?.data?.error || 'Something went wrong with payment');
            setLoading(false);
        }
    }, []);

    return { handlePayment, loading };
};

export default usePayment;
