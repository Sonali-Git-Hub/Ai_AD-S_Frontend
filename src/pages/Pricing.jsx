import React, { useState, useEffect } from 'react';
import { getPlans, getCreditPackages, purchasePlan, buyCredits, createSubscriptionOrder } from '../services/pricingService';
import './Pricing.css';
import { Check, X, ShieldAlert, Sparkles, Zap, Image as ImageIcon, Video, Search, Users, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRecoilState } from 'recoil';
import { userData, updateUser } from '../userStore/userData';

const Pricing = () => {
  const [plans, setPlans] = useState([]);
  const [packages, setPackages] = useState([]);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [showUpsell, setShowUpsell] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [userState, setUserState] = useRecoilState(userData);

  useEffect(() => {
    fetchPricingData();
  }, []);

  const fetchPricingData = async () => {
    try {
      setLoading(true);
      const [plansData, packagesData] = await Promise.all([
        getPlans(),
        getCreditPackages()
      ]);
      setPlans(plansData.plans || []);
      setPackages(packagesData.packages || []);
    } catch (error) {
      toast.error('Failed to load pricing information');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly');
  };

  const calculateEstimations = (credits) => {
    // 1600 credits = 1600 chats OR 80 images OR 64 videos
    return [
      { text: `≈ ${credits} chats`, icon: <Zap size={14} /> },
      { text: `≈ ${Math.floor(credits / 20)} images`, icon: <ImageIcon size={14} /> },
      { text: `≈ ${Math.floor(credits / 25)} videos`, icon: <Video size={14} /> }
    ];
  };

  const handleUpgrade = async (plan) => {
    try {
      setProcessing(true);
      const orderRes = await createSubscriptionOrder({ planId: plan._id, billingCycle });

      if (orderRes.isFree) {
          const res = await purchasePlan(plan._id, billingCycle);
          toast.success(`Successfully upgraded to ${plan.planName}!`);
          const updatedUser = updateUser({ 
            credits: res.credits,
            founderStatus: plan.planName.toLowerCase() === 'founder plan' ? true : userState.user.founderStatus
          });
          setUserState({ user: updatedUser });
          setProcessing(false);
          return;
      }

      const options = {
        key: orderRes.key,
        amount: orderRes.order.amount,
        currency: "INR",
        name: "AISA",
        description: `Upgrade to ${plan.planName}`,
        order_id: orderRes.order.id,
        handler: async function (response) {
            try {
                const res = await purchasePlan(plan._id, billingCycle);
                toast.success(`Successfully upgraded to ${plan.planName}!`);
                const updatedUser = updateUser({ 
                  credits: res.credits,
                  founderStatus: plan.planName.toLowerCase() === 'founder plan' ? true : userState.user.founderStatus
                });
                setUserState({ user: updatedUser });
            } catch(e) {
                toast.error('Failed to complete upgrade after payment.');
            }
        },
        prefill: {
            name: userState?.user?.name || "User",
            email: userState?.user?.email || ""
        },
        theme: { color: "#6366f1" }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        toast.error('Payment failed: ' + response.error.description);
      });
      rzp.open();

    } catch (err) {
      toast.error(err.response?.data?.message || 'Upgrade failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleBuyCredits = async (pkg) => {
    try {
      setProcessing(true);
      const orderRes = await createSubscriptionOrder({ packageId: pkg._id });
      
      if (orderRes.isFree) {
          const res = await buyCredits(pkg._id);
          toast.success(`Purchased ${pkg.credits} credits!`);
          const updatedUser = updateUser({ credits: res.credits });
          setUserState({ user: updatedUser });
          setShowUpsell(false);
          setProcessing(false);
          return;
      }

      const options = {
        key: orderRes.key,
        amount: orderRes.order.amount,
        currency: "INR",
        name: "AISA",
        description: `Buy ${pkg.credits} Credits`,
        order_id: orderRes.order.id,
        handler: async function (response) {
            try {
                const res = await buyCredits(pkg._id);
                toast.success(`Purchased ${pkg.credits} credits!`);
                const updatedUser = updateUser({ credits: res.credits });
                setUserState({ user: updatedUser });
                setShowUpsell(false);
            } catch(e) {
                toast.error('Failed to complete purchase after payment.');
            }
        },
        prefill: {
            name: userState?.user?.name || "User",
            email: userState?.user?.email || ""
        },
        theme: { color: "#6366f1" }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        toast.error('Payment failed: ' + response.error.description);
      });
      rzp.open();

    } catch (err) {
      toast.error('Purchase failed.');
    } finally {
      setProcessing(false);
    }
  };

  const renderComparisonTable = () => {
    if (!plans.length) return null;
    
    // Collect all unique features across all active plans
    const allFeaturesSet = new Set();
    plans.forEach(p => {
      p.features.forEach(f => allFeaturesSet.add(f));
    });
    const allFeatures = Array.from(allFeaturesSet);

    return (
      <div className="comparison-section">
        <h2>Compare Plans Details</h2>
        <div className="comparison-table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Features</th>
                {plans.map(p => (
                  <th key={p._id}>{p.planName}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allFeatures.map(feature => (
                <tr key={feature}>
                  <td>{feature}</td>
                  {plans.map(plan => {
                    const hasFeature = plan.features.includes(feature);
                    return (
                      <td key={`${plan._id}-${feature}`}>
                        {hasFeature ? (
                          <Check size={20} className="check-icon mx-auto" />
                        ) : (
                          <X size={20} className="cross-icon mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-white">Loading incredible pricing...</div>;
  }

  return (
    <div className="pricing-page">
      <div className="pricing-header">
        <h1>Unlock Your AI Potential</h1>
        <p>Choose the perfect plan for you or your team. Upgrade anytime.</p>
        
        <div className="billing-toggle">
          <span className={`billing-label ${billingCycle === 'monthly' ? 'active' : ''}`}>Monthly</span>
          <div className={`toggle-switch ${billingCycle}`} onClick={handleToggle}></div>
          <span className={`billing-label ${billingCycle === 'yearly' ? 'active' : ''}`}>Yearly</span>
          <span className="save-badge">Save ~30%</span>
        </div>
      </div>

      <div className="pricing-grid">
        {plans.map((plan) => {
          const isFounder = plan.planName.toLowerCase() === 'founder plan';
          const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
          
          return (
            <div key={plan._id} className={`pricing-card ${plan.isPopular ? 'popular' : ''}`}>
              {plan.badge && (
                <div className={`popular-badge ${isFounder ? 'launch-badge' : ''}`}>
                  {plan.badge}
                </div>
              )}
              
              <h3 className="plan-name">{plan.planName}</h3>
              
              <div className="plan-price">
                <span className="currency">₹</span>
                {price}
                <span className="billing-period">
                  {isFounder ? '/mo (lifetime)' : billingCycle === 'yearly' ? '/mo (billed yearly)' : '/mo'}
                </span>
              </div>
              
              <div className="plan-credits">
                <Sparkles size={18} /> {plan.credits} Credits
              </div>

              <div className="credit-details">
                {calculateEstimations(plan.credits).map((est, i) => (
                  <p key={i}>
                    <span>{est.icon}</span>
                    <span>{est.text}</span>
                  </p>
                ))}
              </div>

              <ul className="feature-list">
                {plan.features.map((feature, i) => (
                  <li key={i}>
                    <Check size={16} />
                    {feature}
                  </li>
                ))}
              </ul>

              <button 
                className="cta-button" 
                onClick={() => handleUpgrade(plan)}
                disabled={processing}
              >
                {price === 0 ? 'Start for Free' : 'Upgrade to ' + plan.planName}
              </button>
            </div>
          );
        })}
      </div>

      {renderComparisonTable()}

      {/* Development Utility button to trigger UpSell popup test */}
      <div className="text-center mt-20 opacity-30 hover:opacity-100 transition-opacity">
        <button 
          onClick={() => setShowUpsell(true)}
          className="bg-slate-800 text-slate-300 px-4 py-2 rounded-lg text-sm"
        >
          [Dev] Test Micro Upsell Popup
        </button>
      </div>

      {showUpsell && (
        <div className="credit-modal-overlay">
          <div className="credit-modal">
            <div className="modal-header">
              <h3>Out of Credits?</h3>
              <p className="text-slate-400">Add an extra boost to your account instantly.</p>
            </div>
            
            <div className="package-list">
              {packages.map((pkg) => (
                <div key={pkg._id} className="package-item" onClick={() => handleBuyCredits(pkg)}>
                  <span className="package-credits">+{pkg.credits} Credits</span>
                  <span className="package-price">₹{pkg.price} <ChevronRight size={16} className="inline ml-2 opacity-50"/></span>
                </div>
              ))}
            </div>
            
            <button className="close-modal" onClick={() => setShowUpsell(false)}>
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricing;
