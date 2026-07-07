import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlans, getCreditPackages, purchasePlan, buyCredits, createSubscriptionOrder, getSubscriptionDetails } from '../services/pricingService';
import './Pricing.css';
import { Check, X, ShieldAlert, Sparkles, Zap, Image as ImageIcon, Video, Search, Users, ChevronRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRecoilState } from 'recoil';
import { userData, updateUser, getUserData } from '../userStore/userData';
import { useLanguage } from '../context/LanguageContext';
import ApplePayButton from '../Components/ApplePayButton';
import PayPalButton from '../Components/PayPalButton';
import useCreditStore from '../userStore/useCreditStore';

// Helper function to format feature checklist descriptions dynamically matching DB limits
const formatFeatureString = (feature, plan) => {
    if (!feature || !plan) return feature;
    let result = feature;

    // 1. Total AI messages / chat limit / Unlimited Chat
    if (/total AI messages/i.test(result) || /total messages/i.test(result) || /AI messages/i.test(result)) {
        if (plan.chatLimit === -1 || plan.chatScope === 'unlimited') {
            return "Unlimited AI Chat";
        } else {
            result = result.replace(/\d+/, plan.chatLimit ?? 100);
        }
    }

    // 2. Validity
    if (/months validity/i.test(result) || /month validity/i.test(result) || /days validity/i.test(result)) {
        const months = Math.round((plan.validityDays || 90) / 30);
        result = result.replace(/\d+/, months);
    }

    // 3. Images/day
    if (/Images\/day/i.test(result)) {
        result = result.replace(/\d+/, plan.imageLimit ?? 0);
    }

    // 4. Carousel/day
    if (/Carousel\/day/i.test(result)) {
        result = result.replace(/\d+/, plan.carouselLimit ?? 0);
    }

    // 5. Videos/day
    if (/Videos\/day/i.test(result)) {
        result = result.replace(/\d+/, plan.videoLimit ?? 0);
    }

    return result;
};

const Pricing = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [packages, setPackages] = useState([]);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [showUpsell, setShowUpsell] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentPlanName, setCurrentPlanName] = useState('');
  const [userState, setUserState] = useRecoilState(userData);
  const [activeCard, setActiveCard] = useState(0);
  const gridRef = useRef(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 1024);
  const [isTabletCarousel, setIsTabletCarousel] = useState(typeof window !== 'undefined' && window.innerWidth > 768 && window.innerWidth <= 1024);
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [billingSubmitted, setBillingSubmitted] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState(null);
  const [billingForm, setBillingForm] = useState({
    billingName: '',
    companyName: '',
    gstin: '',
    addressLine1: '',
    city: '',
    state: 'Maharashtra',
    postalCode: '',
    country: 'IN'
  });

  useEffect(() => {
    if (userState?.user) {
      setBillingForm(prev => ({
        ...prev,
        billingName: userState.user.name || '',
      }));
    }
  }, [userState]);

  useEffect(() => {
    fetchPricingData();
    fetchCurrentPlan();

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
      setIsTabletCarousel(window.innerWidth > 768 && window.innerWidth <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Tablet: track active card via scroll position ──
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || !isTabletCarousel) return;
    const handleScroll = () => {
      const cardWidth = grid.clientWidth * 0.42;
      const idx = Math.round(grid.scrollLeft / (cardWidth + 12));
      setActiveCard(Math.max(0, Math.min(idx, plans.length - 1)));
    };
    grid.addEventListener('scroll', handleScroll, { passive: true });
    return () => grid.removeEventListener('scroll', handleScroll);
  }, [plans.length, isTabletCarousel]);

  const scrollToCard = (idx) => {
    const grid = gridRef.current;
    if (!grid) return;
    const cardWidth = grid.clientWidth * 0.42;
    grid.scrollTo({ left: idx * (cardWidth + 12), behavior: 'smooth' });
  };

  const getActiveToken = () => {
    const userStr = localStorage.getItem("user");
    let token = null;
    if (userStr && userStr !== "undefined" && userStr !== "null") {
      try {
        const userObj = JSON.parse(userStr);
        token = userObj?.token;
      } catch (e) {}
    }
    if (!token || token === "undefined" || token === "null") {
      token = localStorage.getItem("auth_token") || localStorage.getItem("token");
    }
    if (!token || token === "undefined" || token === "null") {
      token = "";
    }
    return token;
  };

  const fetchCurrentPlan = async () => {
    const token = getActiveToken();
    if (!token) {
      setCurrentPlanName('');
      return;
    }
    try {
      const data = await getSubscriptionDetails();
      if (data?.founderStatus) {
        setCurrentPlanName('founder');
      } else if (data?.plan?.planKey) {
        setCurrentPlanName(data.plan.planKey.toLowerCase());
      } else if (data?.subscription?.planId?.planId) {
        setCurrentPlanName(data.subscription.planId.planId.toLowerCase());
      } else if (data?.subscription?.planId?.planName) {
        setCurrentPlanName(data.subscription.planId.planName.toLowerCase());
      } else {
        setCurrentPlanName('plan_0');
      }
    } catch (e) {
      console.error('Failed to fetch current plan:', e);
      setCurrentPlanName('');
    }
  };

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
      toast.error(t('failedToLoadPricingInfo') || 'Failed to load pricing information');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly');
  };

  const renderQuotaSummary = (plan) => {
    const isFree = plan.priceMonthly === 0 && plan.priceYearly === 0;

    if (isFree) {
      return [
        { text: `${plan.chatLimit || 100} total messages cap`, icon: <Zap size={14} /> },
        { text: `${Math.round((plan.validityDays || 90) / 30)} months validity`, icon: <ShieldAlert size={14} /> },
        { text: "Lock CashFlow & media creation", icon: <ImageIcon size={14} />, locked: true }
      ];
    }

    const summary = [
      { text: plan.chatLimit === -1 ? "Unlimited Chats" : `${plan.chatLimit} Messages`, icon: <Zap size={14} /> },
    ];

    if (plan.imageLimit > 0) {
      summary.push({ text: `${plan.imageLimit} Images / Day (HD/Ultra)`, icon: <ImageIcon size={14} /> });
    } else {
      summary.push({ text: plan.editImageAllowed ? "Edit Image (No Gen)" : "No Image Gen/Edit", icon: <ImageIcon size={14} />, locked: !plan.editImageAllowed });
    }

    if (plan.videoLimit > 0) {
      summary.push({ text: `${plan.videoLimit} Videos / Day`, icon: <Video size={14} /> });
    } else if (plan.carouselLimit > 0) {
      summary.push({ text: `${plan.carouselLimit} Carousel / Day`, icon: <Video size={14} /> });
    } else {
      summary.push({ text: "No Carousel/Video Gen", icon: <Video size={14} />, locked: true });
    }

    return summary;
  };

  const executeUpgrade = async (plan, billingDetails) => {
    try {
      setProcessing(true);
      
      const totalAmount = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
      const basePrice = Math.round((totalAmount / 1.18) * 100) / 100;
      const gstAmount = Math.round((totalAmount - basePrice) * 100) / 100;
      
      // Print breakdown in console as requested
      console.log("========================================");
      console.log("[CHECKOUT] GST INVOICE CALCULATION");
      console.log(`Plan Name:   ${plan.planName}`);
      console.log(`Base Price:  ₹${basePrice}`);
      console.log(`GST (18%):   ₹${gstAmount}`);
      console.log(`Total:       ₹${totalAmount}`);
      console.log("Billing Details:", billingDetails);
      console.log("========================================");

      const orderRes = await createSubscriptionOrder({ planId: plan._id, billingCycle });
      if (orderRes.isFree) {
        const res = await purchasePlan(plan._id, billingCycle, null, billingDetails);
        toast.success(`Successfully upgraded to ${plan.planName}!`);
        const updatedUser = updateUser({
          credits: res.credits,
          founderStatus: plan.planName.toLowerCase() === 'founder plan' ? true : userState.user.founderStatus
        });
        setUserState({ user: updatedUser });
        useCreditStore.getState().syncCredits();
        setProcessing(false);
        return;
      }

      const options = {
        key: orderRes.key,
        amount: orderRes.order.amount,
        currency: "INR",
        name: "AISA™",
        description: `Upgrade to ${plan.planName}`,
        order_id: orderRes.order.id,
        handler: async function (response) {
          try {
            const res = await purchasePlan(plan._id, billingCycle, response.razorpay_payment_id, billingDetails);
            toast.success(`Successfully upgraded to ${plan.planName}!`);
            const updatedUser = updateUser({
              credits: res.credits,
              founderStatus: plan.planName.toLowerCase() === 'founder plan' ? true : userState.user.founderStatus
            });
            setUserState({ user: updatedUser });
            useCreditStore.getState().syncCredits();
          } catch (e) {
            toast.error('Failed to complete upgrade after payment.');
          }
        },
        prefill: {
          name: billingDetails?.billingName || userState?.user?.name || "User",
          email: userState?.user?.email || ""
        },
        theme: { color: "var(--color-primary)" }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast.error('Payment failed: ' + response.error.description);
      });
      rzp.open();

    } catch (err) {
      toast.error(err.response?.data?.message || 'Upgrade failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpgrade = async (plan) => {
    const token = getActiveToken();
    if (!token) {
      toast.error(t('pleaseLoginToUpgrade') || 'Please login to upgrade your plan');
      navigate('/login');
      return;
    }
    
    const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
    if (price === 0) {
      executeUpgrade(plan, null);
    } else {
      setSelectedPlanForUpgrade(plan);
      setBillingModalOpen(true);
    }
  };

  const handleBuyCredits = async (pkg) => {
    const token = getActiveToken();
    if (!token) {
      toast.error(t('pleaseLoginToPurchaseCredits') || 'Please login to purchase credits');
      navigate('/login');
      return;
    }
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
        name: "AISA™",
        description: `Buy ${pkg.credits} Credits`,
        order_id: orderRes.order.id,
        handler: async function (response) {
          try {
            const res = await buyCredits(pkg._id);
            toast.success(`Purchased ${pkg.credits} credits!`);
            const updatedUser = updateUser({ credits: res.credits });
            setUserState({ user: updatedUser });
            setShowUpsell(false);
          } catch (e) {
            toast.error('Failed to complete purchase after payment.');
          }
        },
        prefill: {
          name: userState?.user?.name || "User",
          email: userState?.user?.email || ""
        },
        theme: { color: "var(--color-primary)" }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
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

    const getFeatureValue = (featureKey, plan) => {
      const isFree = plan.priceMonthly === 0 && plan.priceYearly === 0;
      const planKey = (plan.planId || '').toLowerCase();

      switch (featureKey) {
        case 'chat':
          if (isFree) {
            return <span className="flex items-center justify-center"><Check size={20} className="check-icon" /></span>;
          }
          return <span className="feature-badge">✓ {t('priority')}</span>;

        case 'generate_image':
          if (plan.imageLimit > 0) {
            return <span className="feature-badge">✓ {t('ultraHD')} ({plan.imageLimit}/day)</span>;
          }
          return <span className="flex items-center justify-center"><X size={20} className="cross-icon" /></span>;

        case 'edit_image':
          if (plan.editImageAllowed) {
            return <span className="flex items-center justify-center"><Check size={20} className="check-icon" /></span>;
          }
          return <span className="flex items-center justify-center"><X size={20} className="cross-icon" /></span>;

        case 'generate_video':
          if (plan.videoLimit > 0) {
            return <span className="feature-badge">✓ {t('fourKUltra')} ({plan.videoLimit}/day)</span>;
          }
          return <span className="flex items-center justify-center"><X size={20} className="cross-icon" /></span>;

        case 'magic_card':
          if (plan.videoLimit > 0 || planKey === 'plan_3') {
            return <span className="flex items-center justify-center"><Check size={20} className="check-icon" /></span>;
          }
          return <span className="flex items-center justify-center"><X size={20} className="cross-icon" /></span>;

        case 'web_search':
        case 'deep_search':
        case 'code_writer':
        case 'convert_audio':
          if (planKey !== 'plan_0' && !isFree) {
            return <span className="flex items-center justify-center"><Check size={20} className="check-icon" /></span>;
          }
          return <span className="flex items-center justify-center"><X size={20} className="cross-icon" /></span>;

        case 'convert_docs':
          if (planKey === 'plan_1') {
            return <span className="feature-badge">{t('advanced')}</span>;
          }
          if (planKey === 'plan_2') {
            return <span className="feature-badge" style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}>{t('expert')}</span>;
          }
          if (planKey === 'plan_3') {
            return <span className="feature-badge" style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)' }}>{t('pro')} + {t('team')}</span>;
          }
          return <span className="flex items-center justify-center"><X size={20} className="cross-icon" /></span>;

        case 'ai_legal':
          if (!isFree) {
            return <span className="flex items-center justify-center"><Check size={20} className="check-icon" /></span>;
          }
          return <span className="flex items-center justify-center"><X size={20} className="cross-icon" /></span>;

        case 'ai_cashflow':
          if (plan.cashflowAllowed) {
            return <span className="flex items-center justify-center"><Check size={20} className="check-icon" /></span>;
          }
          return <span className="flex items-center justify-center"><X size={20} className="cross-icon" /></span>;

        case 'ai_ads':
          if (plan.carouselLimit > 0) {
            return <span className="flex items-center justify-center"><Check size={20} className="check-icon" /></span>;
          }
          return <span className="flex items-center justify-center"><X size={20} className="cross-icon" /></span>;

        default:
          return null;
      }
    };

    const comparisonData = [
      { feature: 'AISA Chat', key: 'chat' },
      { feature: 'AISA Generate Image', key: 'generate_image' },
      { feature: 'AISA Edit Image', key: 'edit_image' },
      { feature: 'AISA Generate Video', key: 'generate_video' },
      { feature: 'AISA Image -> Video Magic Card', key: 'magic_card' },
      { feature: 'AISA Web Search', key: 'web_search' },
      { feature: 'AISA Deep Search', key: 'deep_search' },
      { feature: 'AISA Code Writer', key: 'code_writer' },
      { feature: 'AISA Convert to Audio', key: 'convert_audio' },
      { feature: 'AISA Convert Documents', key: 'convert_docs' },
      { feature: 'AISA AI Legal™', key: 'ai_legal' },
      { feature: 'AISA AI Cashflow™', key: 'ai_cashflow' },
      { feature: 'AISA AI Ads', key: 'ai_ads' }
    ];

    return (
      <div className="comparison-section">
        <h2>Compare Plans Details</h2>
        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>{t('feature')}</th>
                {plans.map(p => (
                  <th key={p._id}>{getDisplayPlanName(p.planName).toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, idx) => (
                <tr key={idx}>
                  <td className="font-bold flex items-center gap-2">
                    <span className="aisa-badge-small">AISA™</span>
                    {row.feature.replace('AISA ', '')}
                  </td>
                  {plans.map(plan => (
                    <td key={`${plan._id}-${row.feature}`}>
                      {getFeatureValue(row.key, plan)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="comparison-swipe-hint">
          ← Swipe to explore plans details →
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-white">Loading incredible pricing...</div>;
  }

  // Map old DB plan names to new display names
  const PLAN_NAME_MAP = {
    'free': 'Free',
    'free plan': 'Free',
    'starter': 'Starter',
    'starter plan': 'Starter',
    'pro': 'Pro',
    'pro plan': 'Pro',
    'business': 'Business',
    'business plan': 'Business',
  };

  const getDisplayPlanName = (planName) => {
    return PLAN_NAME_MAP[planName.toLowerCase()] || planName;
  };

  // Detect the "Startup Pro" (formerly Founder) plan
  const isStartupProPlan = (plan) => {
    const name = plan.planName.toLowerCase();
    return name.includes('founder') || name.includes('startup pro') || name.includes('startup');
  };

  return (
    <div className="pricing-page">
      <button onClick={() => navigate(-1)} className="back-button">
        <ArrowLeft size={18} />
        <span>{t('back')}</span>
      </button>

      <div className="pricing-header">
        <h1>{t('unlockAIPotential')}</h1>
        <p>{t('choosePerfectPlan')}</p>

        <div className="billing-toggle">
          <span className={`billing-label ${billingCycle === 'monthly' ? 'active' : ''}`}>{t('monthly')}</span>
          <div className={`toggle-switch ${billingCycle}`} onClick={handleToggle}></div>
          <span className={`billing-label ${billingCycle === 'yearly' ? 'active' : ''}`}>{t('yearly')}</span>
          {billingCycle === 'yearly' && <span className="save-badge">{t('saveBadge')}</span>}
        </div>
      </div>

      {/* ── Mobile swipe hint ── */}
      {isTabletCarousel && (
        <div className="pricing-swipe-hint" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7" /></svg>
          <span>Swipe to explore plans</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7" /></svg>
        </div>
      )}

      <div className="pricing-grid" ref={gridRef}>
        {plans.map((plan) => {
          const isFounder = plan.planName.toLowerCase().includes('startup pro') || plan.planName.toLowerCase().includes('startup');
          const isFree = plan.priceMonthly === 0 && plan.priceYearly === 0;
          const isCurrentPlan = (() => {
            if (!currentPlanName) return false;
            const pn = plan.planName.toLowerCase().trim();
            const pid = (plan.planId || '').toLowerCase().trim();
            const cName = currentPlanName.toLowerCase().trim();
            if (cName === 'startup pro' || cName === 'startup' || cName === 'plan_2') return pn.includes('startup') || pid === 'plan_2' || pn.includes('pro');
            if (cName === 'free' || cName === 'free tier' || cName === 'plan_0') return isFree;
            if (cName === 'plan_1' || cName === 'creator' || cName === 'starter') return pid === 'plan_1' || pn.includes('starter') || pn.includes('creator');
            if (cName === 'plan_3' || cName === 'business' || cName === 'enterprise') return pid === 'plan_3' || pn.includes('business') || pn.includes('enterprise');
            return pid === cName || pn.includes(cName) || cName.includes(pn.split(' ')[0]);
          })();


          // Fetch ALL values directly from the Database (no frontend math)
          const displayPrice = billingCycle === 'yearly' ? (plan.priceYearlyPerMonth || plan.priceMonthly) : plan.priceMonthly;
          const displayCredits = billingCycle === 'yearly' ? (plan.creditsYearly || plan.credits) : plan.credits;
          const totalYearlyAmount = plan.priceYearly || 0;
          const displayValidity = billingCycle === 'yearly' ? (plan.validityYearly || 12) + ' Months' : (plan.validityMonthly || 1) + ' Month';

          return (
            <div key={plan._id} className={`pricing-card ${plan.isPopular ? 'popular' : ''} ${isFree ? 'free-tier-card' : ''} ${isCurrentPlan ? 'current-plan-card' : ''}`}>
              {isCurrentPlan && (
                <div className="current-plan-badge">
                  ✓ {t('currentPlan')}
                </div>
              )}
              {!isCurrentPlan && plan.badge && (
                <div className={`popular-badge ${isFounder ? 'launch-badge' : ''}`}>
                  {plan.badge}
                </div>
              )}
              {isFree && (
                <div className="free-tier-badge">💬 {t('chatOnly')}</div>
              )}

              <h3 className="plan-name">{getDisplayPlanName(plan.planName)}</h3>

              <div className="plan-price">
                {billingCycle === 'yearly' && !isFree && (
                  <div className="original-price-container">
                    <span className="original-price">₹{plan.priceMonthly}</span>
                    <span className="discount-tag">30% OFF</span>
                  </div>
                )}
                <div className="current-price">
                  <span className="currency">₹</span>
                  {displayPrice}
                  <span className="billing-period">
                    {billingCycle === 'yearly' ? (isFounder ? '/mo (lifetime)' : '/mo') : (isFounder ? '/mo (lifetime)' : '/mo')}
                  </span>
                </div>

                {!isFree && (
                  <div className="validity-badge">
                    <ShieldAlert size={12} /> {t('validityLabel')} {displayValidity}
                  </div>
                )}

                {billingCycle === 'yearly' && !isFree && (
                  <div className="billed-yearly-label">
                    {t('billedYearlyLabel')} ₹{totalYearlyAmount}{t('billedYearlySuffix')}
                  </div>
                )}
              </div>

              <div className="plan-credits">
                <Sparkles size={18} />
                {(() => {
                  const isFree = plan.priceMonthly === 0 && plan.priceYearly === 0;
                  if (isFree) return <span>Free Access Tier</span>;
                  if (plan.imageLimit === 0 && plan.videoLimit === 0) {
                    return <span>Starter Package</span>;
                  }
                  if (plan.videoLimit > 0) {
                    return <span>Business Pack</span>;
                  }
                  return <span>Pro Creator Pack</span>;
                })()}
              </div>

              <div className="credit-details">
                {renderQuotaSummary(plan).map((est, i) => (
                  <p key={i} className={est.locked ? 'locked-estimation' : ''}>
                    <span style={{ opacity: est.locked ? 0.4 : 1 }}>{est.icon}</span>
                    <span style={{ opacity: est.locked ? 0.4 : 1 }}>{est.text}</span>
                    {est.locked && <span className="lock-icon">🔒</span>}
                  </p>
                ))}
              </div>

              <ul className="feature-list">
                {plan.features.map((feature, i) => {
                  const formattedFeature = formatFeatureString(feature, plan);
                  return (
                    <li key={i}>
                      <Check size={16} />
                      <span className="flex items-center gap-1.5">
                        <span className="aisa-badge-small" style={{ fontSize: '0.6rem', padding: '1px 4px', minWidth: '30px' }}>AISA™</span>
                        {formattedFeature.replace(/^AISA\s+/i, '')}
                      </span>
                    </li>
                  );
                })}
              </ul>


              {isCurrentPlan ? (
                <button className="cta-button current-plan-btn" disabled>
                  ✓ {t('currentPlan')}
                </button>
              ) : (
                <button
                  className="cta-button"
                  onClick={() => handleUpgrade(plan)}
                  disabled={processing}
                >
                  {displayPrice === 0
                    ? t('startForFree')
                    : (billingCycle === 'yearly')
                      ? `${t('upgradeFor')} ₹${totalYearlyAmount}${t('billedYearlySuffix')}`
                      : t('upgradeTo') + getDisplayPlanName(plan.planName)}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Mobile dot indicators ── */}
      {plans.length > 0 && isTabletCarousel && (
        <div className="pricing-dots" role="tablist" aria-label="Plan selector">
          {plans.map((_, i) => (
            <button
              key={i}
              className={`pricing-dot${activeCard === i ? ' active' : ''}`}
              onClick={() => scrollToCard(i)}
              role="tab"
              aria-selected={activeCard === i}
              aria-label={`Plan ${i + 1}`}
            />
          ))}
        </div>
      )}

      {renderComparisonTable()}

      {/* ── Billing Information Modal ── */}
      {billingModalOpen && selectedPlanForUpgrade && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#0e1726] border border-white/10 rounded-2xl p-6 shadow-2xl text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
            <button 
              onClick={() => { setBillingModalOpen(false); setBillingSubmitted(false); }}
              className="absolute top-4 right-4 text-white/50 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-black text-white tracking-tight mb-2">
              {billingSubmitted ? 'Choose Payment Method' : 'Billing Information'}
            </h3>
            <p className="text-xs text-white/70 mb-4">
              {billingSubmitted ? 'Select your preferred gateway to complete the transaction.' : 'Please verify your billing details before moving to payment checkout.'}
            </p>

            {/* Plan Price Summary */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-4 mb-4 font-medium text-sm space-y-2">
              <div className="flex justify-between text-white/60">
                <span>Plan:</span>
                <span className="font-bold text-white">{selectedPlanForUpgrade.planName} ({billingCycle})</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10 text-base font-black text-primary">
                <span>Total Amount:</span>
                <span>₹{(billingCycle === 'yearly' ? selectedPlanForUpgrade.priceYearly : selectedPlanForUpgrade.priceMonthly).toFixed(2)}</span>
              </div>
            </div>

            {!billingSubmitted ? (
              /* Step 1: Billing Address Form Fields */
              <form onSubmit={(e) => {
                e.preventDefault();
                setBillingSubmitted(true);
              }} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/55 mb-1">Billing Name</label>
                    <input
                      type="text"
                      required
                      value={billingForm.billingName}
                      onChange={(e) => setBillingForm({ ...billingForm, billingName: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/55 mb-1">Company (Optional)</label>
                    <input
                      type="text"
                      value={billingForm.companyName}
                      onChange={(e) => setBillingForm({ ...billingForm, companyName: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all"
                      placeholder="AISA Inc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/55 mb-1">GSTIN (Optional)</label>
                    <input
                      type="text"
                      value={billingForm.gstin}
                      onChange={(e) => setBillingForm({ ...billingForm, gstin: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all font-mono uppercase"
                      placeholder="27AASCA8481G1Z3"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/55 mb-1">Address Line 1</label>
                    <input
                      type="text"
                      required
                      value={billingForm.addressLine1}
                      onChange={(e) => setBillingForm({ ...billingForm, addressLine1: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all"
                      placeholder="Flat/Office No., Street Name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/55 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={billingForm.city}
                      onChange={(e) => setBillingForm({ ...billingForm, city: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all"
                      placeholder="Mumbai"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/55 mb-1">State</label>
                    <select
                      required
                      value={billingForm.state}
                      onChange={(e) => setBillingForm({ ...billingForm, state: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all"
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                      <option value="Assam">Assam</option>
                      <option value="Bihar">Bihar</option>
                      <option value="Chhattisgarh">Chhattisgarh</option>
                      <option value="Goa">Goa</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Himachal Pradesh">Himachal Pradesh</option>
                      <option value="Jharkhand">Jharkhand</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Manipur">Manipur</option>
                      <option value="Meghalaya">Meghalaya</option>
                      <option value="Mizoram">Mizoram</option>
                      <option value="Nagaland">Nagaland</option>
                      <option value="Odisha">Odisha</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Sikkim">Sikkim</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Tripura">Tripura</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Uttarakhand">Uttarakhand</option>
                      <option value="West Bengal">West Bengal</option>
                      <option value="Delhi">Delhi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/55 mb-1">Postal Code</label>
                    <input
                      type="text"
                      required
                      value={billingForm.postalCode}
                      onChange={(e) => setBillingForm({ ...billingForm, postalCode: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all"
                      placeholder="400001"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => { setBillingModalOpen(false); setBillingSubmitted(false); }}
                    className="flex-1 py-3 border border-white/10 rounded-xl text-xs font-bold text-white/80 hover:bg-white/5 hover:text-white transition-all uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:opacity-95 active:scale-[0.99] transition-all uppercase tracking-wider"
                  >
                    Continue
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2: Payment Gateways Stack */
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs text-white/70 bg-white/5 px-3 py-2 rounded-lg mb-2 border border-white/5">
                  <div>
                    <strong>Billed to:</strong> {billingForm.billingName} ({billingForm.state})
                  </div>
                  <button 
                    onClick={() => setBillingSubmitted(false)}
                    className="text-primary hover:underline font-bold"
                  >
                    Edit
                  </button>
                </div>

                {/* Gateway 1: Razorpay */}
                <button
                  type="button"
                  onClick={() => {
                    setBillingModalOpen(false);
                    setBillingSubmitted(false);
                    executeUpgrade(selectedPlanForUpgrade, billingForm);
                  }}
                  className="w-full py-3 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:opacity-95 active:scale-[0.99] transition-all uppercase tracking-wider"
                  disabled={processing}
                >
                  Pay with Card / UPI / NetBanking
                </button>

                {/* Gateway 2: PayPal */}
                <div className="w-full">
                  <div className="text-[10px] text-center text-white/40 uppercase tracking-widest font-black mb-2">or pay with</div>
                  <PayPalButton
                    planId={selectedPlanForUpgrade._id}
                    billingCycle={billingCycle}
                    billingDetails={billingForm}
                    onSuccess={(data) => {
                      setBillingModalOpen(false);
                      setBillingSubmitted(false);
                      if (data?.isFree) return;
                      toast.success(`✅ PayPal payment successful! ${selectedPlanForUpgrade.planName} activated.`);
                      const updatedUser = updateUser({
                        founderStatus: isStartupProPlan(selectedPlanForUpgrade) ? true : userState.user?.founderStatus
                      });
                      setUserState({ user: updatedUser });
                      useCreditStore.getState().syncCredits();
                    }}
                    onError={(err) => {
                      toast.error(err.message || 'PayPal payment failed.');
                    }}
                    onProcessing={(val) => setProcessing(val)}
                    disabled={processing}
                  />
                </div>

                {/* Gateway 3: Apple Pay (iOS/macOS only) */}
                {(() => {
                  const isIOSDevice = /iPhone|iPad|iPod/.test(navigator.userAgent);
                  if (!isIOSDevice) return null;
                  const basePrice = billingCycle === 'yearly' ? selectedPlanForUpgrade.priceYearly : selectedPlanForUpgrade.priceMonthly;
                  const totalAmount = Math.round(basePrice * 1.18 * 100) / 100;
                  return (
                    <div className="w-full">
                      <ApplePayButton
                        planId={selectedPlanForUpgrade._id}
                        billingCycle={billingCycle}
                        amount={totalAmount}
                        currency="INR"
                        onSuccess={(data) => {
                          setBillingModalOpen(false);
                          setBillingSubmitted(false);
                          if (data.isTest) {
                            toast.success(data.message || "Test Payment Successful.");
                            return;
                          }
                          toast.success(`✅ Apple Pay successful! ${selectedPlanForUpgrade.planName} activated.`);
                          if (data.credits !== undefined) {
                            const updatedUser = updateUser({
                              credits: data.credits,
                              founderStatus: isStartupProPlan(selectedPlanForUpgrade) ? true : userState.user?.founderStatus
                            });
                            setUserState({ user: updatedUser });
                          }
                          useCreditStore.getState().syncCredits();
                        }}
                        onError={(err) => {
                          toast.error(err.message || 'Apple Pay failed.');
                        }}
                        onProcessing={(val) => setProcessing(val)}
                        disabled={processing}
                      />
                    </div>
                  );
                })()}

                <button
                  type="button"
                  onClick={() => { setBillingModalOpen(false); setBillingSubmitted(false); }}
                  className="w-full py-2.5 border border-white/10 rounded-xl text-xs font-bold text-white/50 hover:text-white/80 hover:bg-white/5 transition-all uppercase tracking-wider"
                >
                  Cancel Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upsell modal removed since credits packages are deprecated */}
    </div>
  );
};

export default Pricing;
