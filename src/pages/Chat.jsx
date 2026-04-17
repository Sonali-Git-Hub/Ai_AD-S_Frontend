import React, { useState, useRef, useEffect, Fragment } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, SendHorizontal, Bot, User, Sparkles, Plus, Monitor, ChevronDown, History, Paperclip, X, FileText, Image as ImageIcon, Cloud, HardDrive, Edit2, Download, Mic, Wand2, Eye, FileSpreadsheet, Presentation, File as FileIcon, MoreVertical, Trash2, Check, Camera, Video, Copy, ThumbsUp, ThumbsDown, Share, Search, Undo2, Menu as MenuIcon, Volume2, Pause, Headphones, MessageCircle, ExternalLink, ZoomIn, ZoomOut, RotateCcw, Minus, Code, Globe, Sliders, PlayCircle, Brain, ImagePlus, PlaySquare, RefreshCcw, TrendingUp, Zap, Scale, Navigation, Rocket, Megaphone } from 'lucide-react';
import { renderAsync } from 'docx-preview';
import * as XLSX from 'xlsx';
import { Menu, Transition, Dialog, Listbox, Portal } from '@headlessui/react';
import { generateChatResponse, generateFollowUpPrompts } from '../services/geminiService';
import { chatStorageService } from '../services/chatStorageService';
import { useLanguage } from '../context/LanguageContext';
import { useRecoilState } from 'recoil';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus as highlighterTheme } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Loader from '../Components/Loader/Loader';
import toast from 'react-hot-toast';
import LiveAI from '../Components/LiveAI';
import { apiService } from '../services/apiService';

import ImageEditor from '../Components/ImageEditor';
import CustomVideoPlayer from '../Components/CustomVideoPlayer';
import ModelSelector from '../Components/ModelSelector';
import MagicToolSettingsCard from '../Components/MagicToolSettingsCard';
import CashFlowStockModal from '../Components/CashFlowStockModal';
import CashFlowChartWidget from '../Components/CashFlowChartWidget';
import LegalToolkitCard from '../Components/LegalToolkitCard';
import axios from 'axios';
import { apis, API } from '../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { detectMode, getModeName, getModeIcon, getModeColor, MODES } from '../utils/modeDetection';
import { userData, getUserData, sessionsData, toggleState, memoryData, activeProjectIdData } from '../userStore/userData';
import { usePersonalization } from '../context/PersonalizationContext';
import OnboardingModal from '../Components/OnboardingModal';
import PremiumUpsellModal from '../Components/PremiumUpsellModal';
import MagicVideoGenModal from '../Components/MagicVideoGenModal';
import DeleteConfirmModal from '../Components/DeleteConfirmModal';
import { getSubscriptionDetails } from '../services/pricingService';
import IntentSuggestionBanner from '../Components/IntentSuggestionBanner';
import { detectIntent, mapModeToToolState } from '../services/intentService';
import LoginRequiredModal from '../Components/LoginRequiredModal';
import AiSocialMediaDashboard from '../Components/AiSocialMediaDashboard';
import FuturisticToolCards from '../Components/FuturisticToolCards';
import AisaTypingIndicator from '../Components/AisaTypingIndicator';
import GmailConnectedModal from '../Components/GmailConnectedModal';
import AISnapshot from '../Components/AISnapshot';
import ShareModal from '../Components/ShareModal';


const SendRipple = ({ onComplete }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <motion.div
        initial={{ scale: 1, opacity: 0.8 }}
        animate={{ scale: 3.5, opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        onAnimationComplete={onComplete}
        className="absolute inset-0 rounded-full border-2 border-primary/40 bg-primary/5"
      />
      {/* Mini Sparkle Burst for Send */}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const dist = 60 + Math.random() * 40;
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            animate={{
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist,
              scale: [0, 1.5, 0],
              opacity: [0, 1, 0]
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <Sparkles size={10} className="text-primary fill-current" />
          </motion.div>
        );
      })}
    </div>
  );
};

const MagicShowEffect = ({ isMobileIdle = false }) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const particleCount = isMobileIdle ? 4 : (isMobile ? 8 : 28);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-visible z-0 ${isMobileIdle ? 'opacity-40' : 'opacity-100'}`}>
      {/* 1. Pulsing Expansion Halos */}
      <motion.div
        animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
        transition={{ duration: isMobileIdle ? 3 : 1.5, repeat: Infinity, ease: "easeOut" }}
        className="absolute inset-[-4px] border-[1.5px] border-primary/40 rounded-full blur-[1px]"
      />

      {!isMobileIdle && (
        <motion.div
          animate={{ scale: [0.8, 1.8], opacity: [0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
          className="absolute inset-[-4px] border-[1px] border-blue-400/20 rounded-full blur-[2px]"
        />
      )}

      {/* 2. Sweeping Lens Glint across the button */}
      <div className="absolute inset-0 rounded-full overflow-hidden z-20">
        <motion.div
          animate={{ x: [-60, 60], opacity: [0, 0.8, 0] }}
          transition={{ duration: isMobileIdle ? 3 : 1.2, repeat: Infinity, repeatDelay: isMobileIdle ? 2 : 0.8 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-30deg]"
        />
      </div>

      {/* 3. Theatrical Magic Sparkles */}
      {[...Array(particleCount)].map((_, i) => {
        const randomX = (Math.random() - 0.5) * (isMobileIdle ? 100 : 280);
        const randomY = (Math.random() - 0.5) * (isMobileIdle ? 100 : 240) - (isMobileIdle ? 0 : 50);
        const randomScale = Math.random() * 1.4 + 0.5;
        const randomRotation = Math.random() * 360;
        const randomDuration = isMobileIdle ? 1.5 + Math.random() * 2 : 0.5 + Math.random() * 1.0;
        const randomDelay = Math.random() * (isMobileIdle ? 1.5 : 0.15);

        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{
              x: randomX,
              y: randomY,
              opacity: [0, 1, 0.8, 0],
              scale: [0, randomScale, 1.2, 0],
              rotate: [0, randomRotation],
            }}
            transition={{
              duration: randomDuration,
              repeat: Infinity,
              delay: randomDelay,
              ease: [0.23, 1, 0.32, 1]
            }}
            className="absolute flex items-center justify-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          >
            <Sparkles
              size={Math.random() * 14 + 10}
              className={i % 3 === 0 ? "text-indigo-400" : (i % 2 === 0 ? "text-primary" : "text-white")}
              fill="currentColor"
              style={isMobile ? {} : { filter: `drop-shadow(0 0 12px ${i % 2 === 0 ? '#8b5cf6' : '#fff'})` }}
            />
          </motion.div>
        );
      })}

      {/* 4. Underlying Glow Bloom (Hidden on mobile to heavily save GPU rendering) */}
      {!isMobile && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.7, scale: 1.25 }}
          className="absolute inset-[-40px] rounded-full blur-[50px] mix-blend-screen pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, transparent 70%)' }}
        />
      )}
    </div>
  );
};

const NeuralExplosion = ({ x, y, onComplete }) => {
  const particles = Array.from({ length: 24 });
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{ x, y, opacity: 1, scale: 0.2 }}
          animate={{
            x: x + (Math.random() - 0.5) * 250,
            y: y + (Math.random() - 0.5) * 250,
            opacity: 0.8,
            scale: 1,
            transition: {
              duration: 0.4,
              ease: "easeOut"
            }
          }}
          onAnimationComplete={i === 0 ? onComplete : undefined}
        >
          <motion.div
            animate={{ opacity: 0, scale: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full"
            style={{
              background: i % 2 === 0 ? '#8b5cf6' : '#3b82f6',
              boxShadow: `0 0 15px ${i % 2 === 0 ? '#8b5cf6' : '#3b82f6'}`
            }}
          />
        </motion.div>
      ))}
    </div>
  );
};




const FEEDBACK_PROMPTS = {
  en: [
    "Was this helpful?",
    "How did I do?",
    "Is this answer detailed enough?",
    "Did I answer your question?",
    "Need anything else?",
    "Is this what you were looking for?",
    "Happy to help!",
    "Let me know if you need more info",
    "Any other questions?",
    "Hope this clears things up!"
  ],
  hi: [
    "क्या यह मददगार था?",
    "मैंने कैसा किया?",
    "क्या यह जवाब पर्याप्त है?",
    "क्या मैंने आपके सवाल का जवाब दिया?",
    "कुछ और चाहिए?",
    "क्या आप यही खोज रहे थे?",
    "मदद करके खुशी हुई!",
    "अगर और जानकारी चाहिए तो बताएं",
    "कोई और सवाल?",
    "उम्मीद है यह समझ आया!"
  ]
};

const TOOL_PRICING = {
  chat: {
    models: [
      { id: 'gemini-flash', name: 'AISA™ Flash', price: 0, speed: 'Fast', description: 'Free chat model' }
    ]
  },
  image: {
    models: [
      { id: 'gemini-3.1-flash-image-preview', name: 'AISA™ Gemini 3.1 Flash', price: 45, speed: 'Fast', description: 'Latest preview — fastest Gemini image generation' },
      { id: 'gemini-3-pro-image-preview', name: 'AISA™ Gemini 3 Pro', price: 75, speed: 'Pro', description: 'Pro-grade scene understanding & generation' },
      { id: 'gemini-2.5-flash-image', name: 'AISA™ Gemini 2.5 Flash', price: 30, speed: 'Stable', description: 'Stable & reliable production image generation' }
    ],
    editModels: [
      { id: 'gemini-3.1-flash-image-preview', name: 'AISA™ Gemini 3.1 Flash', price: 45, speed: 'Fast', description: 'Latest preview model — fastest AI image editing' },
      { id: 'gemini-3-pro-image-preview', name: 'AISA™ Gemini 3 Pro', price: 75, speed: 'Pro', description: 'Pro-grade image editing with rich scene understanding' },
      { id: 'gemini-2.5-flash-image', name: 'AISA™ Gemini 2.5 Flash', price: 30, speed: 'Stable', description: 'Stable & reliable — production-ready image edits' }
    ]
  },
  video: {
    models: [
      { id: 'veo-3.1-fast-generate-001', name: 'AISA™ Video Fast', price: '225/5S', speed: 'Fast', description: 'Quick high-quality video generation' },
      { id: 'veo-3.1-generate-001', name: 'AISA™ Video Pro', price: '600/5S', speed: 'Cinema', description: 'Next-gen cinematic video synthesis' }
    ]
  },
  document: {
    models: [
      { id: 'gemini-flash', name: 'AISA™ Flash', price: 0, speed: 'Fast', description: 'Basic document analysis' },
      { id: 'gemini-pro', name: 'AISA™ Pro', price: 20, speed: 'Medium', description: 'Advanced document processing' },
      { id: 'gpt4', name: 'AISA™ Premium', price: 30, speed: 'Medium', description: 'Premium document analysis' }
    ]
  },
  voice: {
    models: [
      { id: 'gemini-flash', name: 'AISA™ Flash', price: 0, speed: 'Fast', description: 'Standard voice recognition' }
    ]
  }
};


const ImageViewer = ({ src, alt }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(null);
  const imgRef = useRef(null);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.5, 5));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.5, 1));
  const handleReset = () => { setScale(1); setPosition({ x: 0, y: 0 }); };

  const handleWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setScale(s => Math.min(Math.max(1, s + delta), 5));
  };

  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      e.preventDefault();
      setPosition({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch Handlers for Mobile/iOS
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Pinch start
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      setLastTouchDistance(dist);
    } else if (e.touches.length === 1 && scale > 1) {
      // Drag start
      setIsDragging(true);
      setStartPos({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && lastTouchDistance) {
      // Pinch Zoom
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      const delta = dist / lastTouchDistance;
      setScale(s => Math.min(Math.max(1, s * delta), 5));
      setLastTouchDistance(dist);
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      // Pan
      e.preventDefault(); // Prevent scroll
      setPosition({
        x: e.touches[0].clientX - startPos.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setLastTouchDistance(null);
  };

  // Reset position if zoomed out to 1
  useEffect(() => {
    if (scale === 1) setPosition({ x: 0, y: 0 });
  }, [scale]);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-black/90 select-none">
      {/* Zoom Controls */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-black/60 backdrop-blur-md rounded-full px-6 py-3 border border-white/10 shadow-xl"
        onClick={(e) => e.stopPropagation()} // Prevent closing modal
      >
        <button onClick={handleZoomOut} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"><Minus className="w-5 h-5" /></button>
        <span className="text-white text-sm font-bold font-mono min-w-[3rem] text-center">{Math.round(scale * 100)}%</span>
        <button onClick={handleZoomIn} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"><Plus className="w-5 h-5" /></button>
        <div className="w-px h-6 bg-white/20 mx-2"></div>
        <button onClick={handleReset} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors" title="Reset"><RotateCcw className="w-4 h-4" /></button>
      </div>

      <div
        className="flex-1 w-full h-full flex items-center justify-center overflow-hidden touch-none"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
          }}
          className="max-w-full max-h-full object-contain pointer-events-auto"
          draggable={false}
          onLoad={() => console.log("Viewer image loaded successfully:", src)}
          onError={(e) => {
            console.error("Viewer image load failed:", src);
            if (src && !e.target.dataset.retried) {
              e.target.dataset.retried = "true";
              const isSignedUrl = src?.includes('X-Goog-Signature');
              const retryUrl = isSignedUrl
                ? src
                : src + (src.includes('?') ? '&' : '?') + 'retry=' + Date.now();
              console.log("Retrying viewer image:", retryUrl);
              e.target.src = retryUrl;
            } else {
              e.target.src = `https://placehold.co/800x600/333/eee?text=Image+Loading+Failed%0AClick+to+Retry`;
              e.target.style.cursor = 'pointer';
              e.target.onclick = (event) => {
                event.stopPropagation();
                const isSignedUrl = src?.includes('X-Goog-Signature');
                e.target.src = isSignedUrl ? src : src + (src.includes('?') ? '&' : '?') + 'reload=' + Date.now();
              };
            }
          }}
        />
      </div>


    </div>
  );
};

// Global messaging lock to prevent duplicate sends during navigation re-mounts
let isGlobalSending = false;
let lastMessageSentTime = 0;

const Chat = () => {
  const checkLimitLocally = () => true;
  const refreshSubscription = () => { };

  // Premium access check: fires event for upsell modal if user is on free plan
  const [isPremiumUser, setIsPremiumUser] = React.useState(null);
  const [userPlanName, setUserPlanName] = React.useState('');
  const [isAdminUser, setIsAdminUser] = React.useState(false);

  useEffect(() => {
    const user = getUserData();
    if (!user?.token) {
      setIsPremiumUser(false);
      setIsAdminUser(false);
      return;
    }

    // Admin Access Rule
    if ((user.email && user.email.toLowerCase() === 'admin@uwo24.com') || (user.role === 'admin')) {
      setIsAdminUser(true);
      setIsPremiumUser(true);
      setUserPlanName('AISA Admin');
      return; // Skip server subscription check for admin
    }

    getSubscriptionDetails()
      .then(data => {
        const hasSub = data?.subscription && data.subscription?.planId;
        const hasPaidPlan = hasSub && (data.subscription?.planId?.priceMonthly > 0 || data.subscription?.planId?.priceYearly > 0);
        setIsPremiumUser(hasPaidPlan || data?.founderStatus || false);
        setUserPlanName(data?.subscription?.planId?.planName || '');
      })
      .catch(() => setIsPremiumUser(false));
  }, []);

  const user = getUserData();
  const isAdmin = user?.token && (user?.role === 'admin' || user?.email === 'admin@uwo24.com');

  const checkPremiumTool = (toolName) => {
    // Whitelist AI Legal for all users
    if (toolName === 'AI Legal') return true;

    if (!user?.token) {
      window.dispatchEvent(new CustomEvent('login_required', { detail: { toolName } }));
      return false;
    }

    // Whitelist AI CashFlow for all LOGGED IN users
    if (toolName === 'AI CashFlow') return true;

    // Admin Access Rule: Treat all tools as unlocked
    if (user.email === 'admin@uwo24.com' || isAdminUser) return true;

    if (isPremiumUser === null) return true; // still loading, allow optimistically

    // Check if tool is video and plan is starter/founder
    if (['Generate Video', 'Image to Video', 'Image to Video Magic'].includes(toolName)) {
      const plan = (userPlanName || '').toLowerCase();
      if (plan.includes('starter') || plan.includes('founder')) {
        window.dispatchEvent(new CustomEvent('premium_required', {
          detail: {
            toolName,
            customMessage: `Text to Video features are not available on the ${userPlanName || 'current'} plan. Please upgrade to Pro or Business to generate videos.`
          }
        }));
        return false;
      }
    }

    if (isPremiumUser) return true;
    window.dispatchEvent(new CustomEvent('premium_required', { detail: { toolName } }));
    return false;
  };

  const handleCopyImage = async (imageUrl) => {
    if (!imageUrl) return;
    const t = toast.loading('Attempting to copy...');

    // Use our backend proxy to bypass CORS
    const proxiedUrl = `${apis.imageProxy}?url=${encodeURIComponent(imageUrl)}`;

    try {
      const imagePromise = (async () => {
        try {
          // Use proxied URL for canvas method
          return await new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((b) => b ? resolve(b) : reject(new Error('Canvas failed')), 'image/png');
              } catch (e) { reject(e); }
            };
            img.onerror = () => reject(new Error('Load failed'));
            img.src = proxiedUrl;
          });
        } catch (err) {
          // Fallback to direct fetch via proxy
          const response = await fetch(proxiedUrl);
          const blob = await response.blob();
          if (blob.type === 'image/png') return blob;

          // If fetched but not PNG, we must use canvas (redundant but safe)
          throw new Error('Conversion required but proxy-canvas failed');
        }
      })();

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': imagePromise })
      ]);

      toast.dismiss(t);
      toast.success('Image copied! ✨');
    } catch (err) {
      console.error('Copy failure (even with proxy):', err);
      toast.dismiss(t);
      toast.error(
        (t) => (
          <span className="flex flex-col gap-1">
            <span className="font-bold text-xs">Copy failed (System)</span>
            <span className="text-[10px] opacity-80 leading-tight">Your browser security blocked the action even through the master proxy. Please **right-click** and **"Copy Image"** instead.</span>
          </span>
        ),
        { duration: 6000 }
      );
    }
  };
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { personalizations, getSystemPromptExtensions, updatePersonalization } = usePersonalization();
  const isDarkMode = personalizations?.general?.theme === 'Dark' ||
    (personalizations?.general?.theme !== 'Light' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [excelHTML, setExcelHTML] = useState(null);
  const [textPreview, setTextPreview] = useState(null);
  const [sessions, setSessions] = useRecoilState(sessionsData);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const [currentSessionId, setCurrentSessionId] = useState(sessionId || 'new');
  const [tglState, setTglState] = useRecoilState(toggleState);
  const [memory, setMemoryRecoil] = useRecoilState(memoryData);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState(null);

  // File Upload State
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [pdfLoadingId, setPdfLoadingId] = useState(null);
  const [pregeneratedPdfs, setPregeneratedPdfs] = useState({}); // Stores { msgId: FileObject }
  // WhatsApp Share Modal State
  const [waShareModal, setWaShareModal] = useState(false);
  const [waPhone, setWaPhone] = useState('');
  const [waPdfUrl, setWaPdfUrl] = useState('');
  const [waUploading, setWaUploading] = useState(false);
  const [waMsgContent, setWaMsgContent] = useState('');
  const [isMagicEditing, setIsMagicEditing] = useState(false);
  const [editRefImage, setEditRefImage] = useState(null);
  const [isMagicVideoModalOpen, setIsMagicVideoModalOpen] = useState(false);
  const [isSocialMediaDashboardOpen, setIsSocialMediaDashboardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [explosions, setExplosions] = useState([]);
  const [isBrainHovered, setIsBrainHovered] = useState(false);
  const [isMicHovered, setIsMicHovered] = useState(false);
  const [isSendHovered, setIsSendHovered] = useState(false);
  const [isAttachHovered, setIsAttachHovered] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isHoveredMenu, setIsHoveredMenu] = useState(false);
  const [isBrainTapped, setIsBrainTapped] = useState(false);
  const [isMicTapped, setIsMicTapped] = useState(false);
  const [isSendTapped, setIsSendTapped] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [ripples, setRipples] = useState([]);
  const DISCOVERY_PROMPTS = [
    "Analyze complex legal documents...",
    "Generate cinematic 8k images in space...",
    "Search for real-time market updates...",
    "Animate static scenes into cinematic video...",
    "Summarize 50-page PDF reports...",
    "Write production-ready Python code...",
    "Convert documents into human-like audio..."
  ];
  const [typedPlaceholder, setTypedPlaceholder] = useState("");
  const [discoveryIndex, setDiscoveryIndex] = useState(0);

  useEffect(() => {
    let charIndex = 0;
    let isDeleting = false;
    let timeoutId;

    const type = () => {
      const currentPrompt = DISCOVERY_PROMPTS[discoveryIndex];

      if (isDeleting) {
        setTypedPlaceholder(currentPrompt.substring(0, charIndex - 1));
        charIndex--;
      } else {
        setTypedPlaceholder(currentPrompt.substring(0, charIndex + 1));
        charIndex++;
      }

      let typingSpeed = isDeleting ? 30 : 50;

      if (!isDeleting && charIndex === currentPrompt.length) {
        isDeleting = true;
        typingSpeed = 3000; // Pause at end before deleting
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        setDiscoveryIndex((prev) => (prev + 1) % DISCOVERY_PROMPTS.length);
        return; // Hand over to the next effect run
      }

      timeoutId = setTimeout(type, typingSpeed);
    };

    timeoutId = setTimeout(type, 500); // Initial pause before typing starts for this word
    return () => clearTimeout(timeoutId);
  }, [discoveryIndex]);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);

  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [filePreviews, setFilePreviews] = useState([]);
  const [activeAgent, setActiveAgent] = useState({ agentName: 'AI Ads', category: 'General' });
  const [userAgents, setUserAgents] = useState([]);
  const [toolModels, setToolModels] = useState({
    chat: 'gemini-flash',
    image: 'gemini-flash',
    document: 'gemini-flash',
    voice: 'gemini-flash'
  });
  const uploadInputRef = useRef(null);
  const driveInputRef = useRef(null);
  const photosInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Attachment Menu State
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [listeningTime, setListeningTime] = useState(0);
  const timerRef = useRef(null);
  const attachBtnRef = useRef(null);
  const menuRef = useRef(null);
  const recognitionRef = useRef(null);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [selectedToolType, setSelectedToolType] = useState(null);
  const [currentMode, setCurrentMode] = useState('NORMAL_CHAT');
  const [isDeepSearch, setIsDeepSearch] = useState(false);
  const [isWebSearch, setIsWebSearch] = useState(false);
  const [isImageGeneration, setIsImageGeneration] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isAudioConvertMode, setIsAudioConvertMode] = useState(false);
  const [isDocumentConvert, setIsDocumentConvert] = useState(false);
  const [isCodeWriter, setIsCodeWriter] = useState(false);
  const [isFileAnalysis, setIsFileAnalysis] = useState(false);
  const [isCashFlowMode, setIsCashFlowMode] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockSearchResults, setStockSearchResults] = useState([]);
  const [isSearchingStocks, setIsSearchingStocks] = useState(false);
  const [isVideoGeneration, setIsVideoGeneration] = useState(false);
  const [activeLegalToolkit, setActiveLegalToolkit] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [unlockedTools, setUnlockedTools] = useState([]);
  const [selectedLegalTool, setSelectedLegalTool] = useState(null);
  const [videoAspectRatio, setVideoAspectRatio] = useState('');
  const [videoModelId, setVideoModelId] = useState('veo-3.1-fast-generate-001');
  const [editModelId, setEditModelId] = useState('gemini-3.1-flash-image-preview');
  const [videoResolution, setVideoResolution] = useState('1080p');
  const v = personalizations?.voice || { languageCode: 'en-US', voiceName: 'en-US-Chirp3-HD-Autonoe', pitch: 0, speed: 1.0 };
  const [audioLangCode, setAudioLangCode] = useState(v.languageCode);
  const [audioVoiceName, setAudioVoiceName] = useState(v.voiceName);
  const [audioPitch, setAudioPitch] = useState(v.pitch);
  const [audioSpeed, setAudioSpeed] = useState(v.speed);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);
  const [isPlayingSample, setIsPlayingSample] = useState(false);
  const sampleAudioRef = useRef(null);
  const [imageAspectRatio, setImageAspectRatio] = useState('1:1');
  const [imageModelId, setImageModelId] = useState('gemini-3.1-flash-image-preview');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentShareId, setCurrentShareId] = useState('');
  const [isMagicSettingsOpen, setIsMagicSettingsOpen] = useState(false);
  const abortControllerRef = useRef(null);
  const voiceUsedRef = useRef(false); // Track if voice input was used

  const [showGmailModal, setShowGmailModal] = useState(false);

  // ─── Connector OAuth Callback Handler ───
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const connectorSuccess = params.get('connector_success');
    const connectorError = params.get('connector_error');

    if (connectorSuccess === 'true') {
      // Show the feature showcase modal
      setShowGmailModal(true);
      // Clean the URL so modal doesn't re-fire on refresh
      navigate(location.pathname, { replace: true });
    } else if (connectorError) {
      toast.error('Failed to connect Gmail. Please try again from Settings > Connectors.', { duration: 5000 });
      navigate(location.pathname, { replace: true });
    }
  }, [location.search]);

  // ─── Direct Feature Link Handling ───
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const modeParam = params.get('mode')?.toLowerCase();
    const toolParam = params.get('tool')?.toLowerCase();

    if (modeParam || toolParam) {
      // Deactivate all first
      setIsDeepSearch(false); setIsWebSearch(false); setIsImageGeneration(false);
      setIsVideoGeneration(false); setIsCodeWriter(false); setIsFileAnalysis(false);
      setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsMagicEditing(false);
      setActiveLegalToolkit(false);

      // Map params to states
      if (modeParam === 'deepsearch' || toolParam === 'deepsearch') setIsDeepSearch(true);
      else if (modeParam === 'websearch' || modeParam === 'webbrowse' || toolParam === 'websearch') setIsWebSearch(true);
      else if (modeParam === 'imagegen' || modeParam === 'image' || toolParam === 'imagegen') { setIsImageGeneration(true); setIsMagicSettingsOpen(true); }
      else if (modeParam === 'videogen' || modeParam === 'video' || toolParam === 'videogen') { setIsVideoGeneration(true); setIsMagicSettingsOpen(true); }
      else if (modeParam === 'coding' || modeParam === 'code' || toolParam === 'coding') setIsCodeWriter(true);
      else if (modeParam === 'ailegal' || modeParam === 'legal' || toolParam === 'ailegal') { setActiveLegalToolkit(true); setCurrentMode('LEGAL_TOOLKIT'); }
      else if (modeParam === 'aicashflow' || modeParam === 'finance' || toolParam === 'aicashflow') { setIsFileAnalysis(true); alert("AICASHFLOW analysis mode active. Please upload your ledger/data file."); } // Heuristic for now

      // Clear params to avoid re-triggering if user refreshes but wants to keep state manually? 
      // Actually usually better to keep them or clear them. 
      // navigate(location.pathname, { replace: true });
    }
  }, [location.search]);

  // Tool Persistence
  useEffect(() => {
    const savedTool = localStorage.getItem('aisa_active_legal_tool');
    if (savedTool && currentMode === 'LEGAL_TOOLKIT') {
      setActiveTool(savedTool);
    }
  }, [currentMode]);

  useEffect(() => {
    if (activeTool) {
      localStorage.setItem('aisa_active_legal_tool', activeTool);
    } else {
      localStorage.removeItem('aisa_active_legal_tool');
    }
  }, [activeTool]);

  useEffect(() => {
    if (currentMode !== 'LEGAL_TOOLKIT') {
      setActiveTool(null);
    }
  }, [currentMode]);
  const inputRef = useRef(null); // Ref for textarea input
  const welcomeSearchRef = useRef(null); // Ref for welcome screen search bar
  const [welcomeInputValue, setWelcomeInputValue] = useState('');
  const transcriptRef = useRef(''); // Ref for speech transcript
  const isManualStopRef = useRef(false); // Track manual stop to avoid recursive loops
  const isDetectionPausedRef = useRef(false); // Pause detection after explicit dismissal
  const [currentProjectId, setCurrentProjectId] = useRecoilState(activeProjectIdData);
  const [intentSuggestion, setIntentSuggestion] = useState(null);
  const [isIntentLoading, setIsIntentLoading] = useState(false);
  const [expandedMessageIds, setExpandedMessageIds] = useState(new Set());

  const toggleExpandMessage = (id) => {
    setExpandedMessageIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };
  const lastDetectedTextRef = useRef('');

  // Projects Feature State
  const [projects, setProjects] = useState([]);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isDownloadingUrl, setIsDownloadingUrl] = useState(null);
  const [expandedMessages, setExpandedMessages] = useState({}); // { [msgId]: true/false }
  const USER_MSG_COLLAPSE_CHARS = 200; // Collapse threshold

  const [deleteConfig, setDeleteConfig] = useState({
    isOpen: false,
    title: "Delete Message?",
    description: "Are you sure you want to delete this message? This action cannot be undone.",
    onConfirm: () => { }
  });

  const toolsBtnRef = useRef(null);
  const toolsMenuRef = useRef(null);

  useEffect(() => {
    if (isImageGeneration) { setIsDeepSearch(false); setIsWebSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(false); setIsMagicEditing(false); setIsFileAnalysis(false); setIsMagicVideoModalOpen(false); }
  }, [isImageGeneration]);
  useEffect(() => {
    if (isVideoGeneration) { setIsDeepSearch(false); setIsWebSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsImageGeneration(false); setIsMagicEditing(false); setIsFileAnalysis(false); setIsMagicVideoModalOpen(false); }
  }, [isVideoGeneration]);
  useEffect(() => {
    if (isDeepSearch) { setIsImageGeneration(false); setIsWebSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(false); setIsMagicEditing(false); setIsFileAnalysis(false); setIsMagicVideoModalOpen(false); }
  }, [isDeepSearch]);
  useEffect(() => {
    if (isWebSearch) { setIsImageGeneration(false); setIsDeepSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(false); setIsMagicEditing(false); setIsFileAnalysis(false); setIsMagicVideoModalOpen(false); }
  }, [isWebSearch]);
  useEffect(() => {
    if (isAudioConvertMode) { setIsImageGeneration(false); setIsDeepSearch(false); setIsWebSearch(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(false); setIsMagicEditing(false); setIsFileAnalysis(false); setIsMagicVideoModalOpen(false); }
  }, [isAudioConvertMode]);
  useEffect(() => {
    if (isDocumentConvert) { setIsImageGeneration(false); setIsDeepSearch(false); setIsWebSearch(false); setIsAudioConvertMode(false); setIsCodeWriter(false); setIsVideoGeneration(false); setIsMagicEditing(false); setIsFileAnalysis(false); setIsMagicVideoModalOpen(false); }
  }, [isDocumentConvert]);
  useEffect(() => {
    if (isCodeWriter) { setIsImageGeneration(false); setIsDeepSearch(false); setIsWebSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsVideoGeneration(false); setIsMagicEditing(false); setIsFileAnalysis(false); setIsMagicVideoModalOpen(false); }
  }, [isCodeWriter]);
  useEffect(() => {
    if (isMagicEditing) { setIsImageGeneration(false); setIsDeepSearch(false); setIsWebSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(false); setIsFileAnalysis(false); setIsMagicVideoModalOpen(false); }
  }, [isMagicEditing]);
  useEffect(() => {
    if (isFileAnalysis) { setIsImageGeneration(false); setIsDeepSearch(false); setIsWebSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(false); setIsMagicEditing(false); setIsMagicVideoModalOpen(false); }
  }, [isFileAnalysis]);
  useEffect(() => {
    if (isMagicVideoModalOpen) { setIsImageGeneration(false); setIsDeepSearch(false); setIsWebSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(false); setIsMagicEditing(false); setIsFileAnalysis(false); setIsCashFlowMode(false); setActiveLegalToolkit(false); }
  }, [isMagicVideoModalOpen]);
  useEffect(() => {
    if (isCashFlowMode) { setIsImageGeneration(false); setIsDeepSearch(false); setIsWebSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(false); setIsMagicEditing(false); setIsFileAnalysis(false); setIsMagicVideoModalOpen(false); setActiveLegalToolkit(false); }
  }, [isCashFlowMode]);
  useEffect(() => {
    if (activeLegalToolkit) { setIsImageGeneration(false); setIsDeepSearch(false); setIsWebSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(false); setIsMagicEditing(false); setIsFileAnalysis(false); setIsMagicVideoModalOpen(false); setIsCashFlowMode(false); }
  }, [activeLegalToolkit]);

  // ─── Intent Detection Logic (Routing System) ──────────────────────────────
  useEffect(() => {
    // Only detect if input is long enough and not already loading/paused
    const text = inputValue.trim();
    if (text.length < 12 || isIntentLoading || isDetectionPausedRef.current) {
      if (text.length < 8) setIntentSuggestion(null); // Clear once they delete text
      return;
    }

    // Check if we've already detected for this EXACT text prefix to avoid spam
    if (text.startsWith(lastDetectedTextRef.current) && lastDetectedTextRef.current.length > 0 && text.length - lastDetectedTextRef.current.length < 5) {
      return;
    }

    // Heuristic: Check for action keywords before calling expensive LLM
    const actionKeywords = ['make', 'create', 'search', 'find', 'convert', 'write', 'draw', 'video', 'music', 'banao', 'dalo', 'edit', 'animate', 'code', 'optimize', 'debug', 'refactor', 'script'];
    const hasKeyword = actionKeywords.some(k => text.toLowerCase().includes(k));
    if (!hasKeyword) return;

    const debounceTimer = setTimeout(async () => {
      setIsIntentLoading(true);
      lastDetectedTextRef.current = text;

      try {
        const result = await detectIntent(text, filePreviews, messages);
        if (result && result.success && result.intent !== 'normal_chat' && result.confidence > 0.6) {
          setIntentSuggestion(result);
        } else {
          setIntentSuggestion(null);
        }
      } catch (err) {
        console.error("Intent detection failed:", err);
      } finally {
        setIsIntentLoading(false);
      }
    }, 700);

    return () => clearTimeout(debounceTimer);
  }, [inputValue, filePreviews.length]);

  const handleAcceptSuggestion = (suggestion) => {
    const user = getUserData();
    if (!user?.token) {
      window.dispatchEvent(new CustomEvent('login_required', { detail: { toolName: suggestion.intent.replace('_', ' ') } }));
      return;
    }
    const toolUpdates = mapModeToToolState(suggestion.frontend_mode);

    // Deactivate all first (safety)
    setIsImageGeneration(false); setIsVideoGeneration(false); setIsDeepSearch(false);
    setIsWebSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false);
    setIsCodeWriter(false); setIsMagicEditing(false); setIsFileAnalysis(false);
    setIsCashFlowMode(false);
    setActiveLegalToolkit(false);

    // Dynamic activation based on map
    if (toolUpdates.activeImageGen) { setIsImageGeneration(true); setIsMagicSettingsOpen(true); }
    if (toolUpdates.activeVideoGen) {
      if (toolUpdates.videoMode === 'image_to_video') {
        setIsMagicVideoModalOpen(true);
      } else {
        setIsVideoGeneration(true);
        setIsMagicSettingsOpen(true);
      }
    }
    if (toolUpdates.activeMagicEdit) setIsMagicEditing(true);
    if (toolUpdates.activeAudioTalk) setIsAudioConvertMode(true);
    if (toolUpdates.webSearchMode) setIsWebSearch(true);
    if (toolUpdates.deepSearchMode) setIsDeepSearch(true);
    if (toolUpdates.activeFileAnalysis) setIsFileAnalysis(true);
    if (toolUpdates.activeCodeWriter) setIsCodeWriter(true);

    if (toolUpdates.activeLegalToolkit) {
      setActiveLegalToolkit(true);
      // Auto-select tool if intent matches a specific legal tool
      if (suggestion.intent && suggestion.intent.startsWith('legal_')) {
        const toolId = suggestion.intent;
        const toolMap = {
          'legal_free_chat': 'Legal Assistant',
          'legal_draft_maker': 'Draft Maker',
          'legal_nda_generator': 'NDA Generator',
          'legal_contract_analyzer': 'Contract Analyzer',
          'legal_case_predictor': 'Case Predictor',
          'legal_evidence_checker': 'Evidence Checker',
          'legal_notice_generator': 'Legal Notice',
          'legal_affidavit_generator': 'Affidavit Gen',
          'legal_clause_scanner': 'Clause Scanner',
          'legal_clause_rewriter': 'Clause Rewriter',
          'legal_strategy_engine': 'Strategy Engine',
          'legal_research_assistant': 'Research Assistant',
          'legal_timeline_generator': 'Timeline Generator',
          'legal_compliance_checker': 'Compliance Checker',
          'legal_law_comparator': 'Law Comparator'
        };
        const activeToolName = toolMap[toolId] || toolId;
        setSelectedLegalTool({ id: toolId, name: activeToolName });
        setActiveTool(activeToolName);
      }
    }

    if (toolUpdates.mode) setCurrentMode(toolUpdates.mode);

    toast.success(`AISA switched to ${suggestion.intent.replace('legal_', '').replace('_', ' ')}! ✨`);

    setIntentSuggestion(null);
    isDetectionPausedRef.current = true; // Don't re-detect immediately after switch
  };

  const handleSelectLegalSuggestion = (toolId, toolName) => {
    const user = getUserData();
    if (!user?.token) {
      window.dispatchEvent(new CustomEvent('login_required', { detail: { toolName } }));
      return;
    }

    // AI Legal is now available for ALL users (Free Tier)
    const isUnlocked = true; // isAdminUser || unlockedTools.includes(toolId);

    if (!isUnlocked) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'user',
        content: `Use ${toolName}`,
        timestamp: Date.now()
      }, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: `**Premium Mode Restricted**\n\nThe **${toolName}** tool is part of our Premium AI Legal archive.\n\n**To access this tool:**\n1. Select "Unlock All" to get full access.\n2. Or upgrade your subscription to the **FOUNDER PLAN**.`,
        isPremiumRestricted: true,
        timestamp: Date.now()
      }]);
      return;
    }

    setSelectedLegalTool({ id: toolId, name: toolName });
    setActiveTool(toolName); // Set dynamic tool name
    setActiveLegalToolkit(false); // Close toolkit if open
    setCurrentMode('LEGAL_TOOLKIT');

    if (inputRef.current) inputRef.current.focus();

    toast.success(`✅ AI Legal Activated: ${toolName} ✨`, {
      style: {
        background: '#F0FDF4',
        color: '#166534',
        borderRadius: '16px',
        fontWeight: 'bold',
        border: '1px solid #BBF7D0',
      }
    });
  };

  const handleDismissSuggestion = () => {
    setIntentSuggestion(null);
    isDetectionPausedRef.current = true;
    setTimeout(() => { isDetectionPausedRef.current = false; }, 30000); // 30s pause
  };

  // ─── AI CashFlow Search Logic ─────────────────────────────────────────────
  useEffect(() => {
    if (!isCashFlowMode || inputValue.length < 2) {
      setStockSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingStocks(true);
      try {
        const user = getUserData();
        const baseURL = window._env_?.VITE_AISA_BACKEND_API || import.meta.env.VITE_AISA_BACKEND_API || "http://localhost:8080/api";
        const response = await axios.get(`${baseURL}/cashflow/search`, {
          params: { keywords: inputValue },
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const data = response.data;
        setStockSearchResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Stock search failed:", err);
      } finally {
        setIsSearchingStocks(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [inputValue, isCashFlowMode]);


  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close Attach Menu
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        attachBtnRef.current &&
        !attachBtnRef.current.contains(event.target)
      ) {
        setIsAttachMenuOpen(false);
      }

      // Close Tools Menu
      if (
        toolsMenuRef.current &&
        !toolsMenuRef.current.contains(event.target) &&
        toolsBtnRef.current &&
        !toolsBtnRef.current.contains(event.target)
      ) {
        setIsToolsMenuOpen(false);
      }
    };

    if (isAttachMenuOpen || isToolsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    const handleGlobalPaste = (e) => {
      // Avoid intercepting if user is in an input/textarea other than our chat input
      const target = e.target;
      if (target.tagName === 'INPUT' || (target.tagName === 'TEXTAREA' && target !== inputRef.current)) {
        return;
      }
      handlePaste(e);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('paste', handleGlobalPaste);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('paste', handleGlobalPaste);
    };
  }, [isAttachMenuOpen, isToolsMenuOpen, messages.length, isLoading]);

  const processFile = (file) => {
    if (!file) return;

    let fileName = file.name || `file_${Date.now()}`;
    let fileType = file.type;

    // Browser might fail to detect type for some pasted/dragged files
    if (!fileType && fileName.includes('.')) {
      const ext = fileName.split('.').pop().toLowerCase();
      const mimeMap = {
        'pdf': 'application/pdf',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'doc': 'application/msword',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'xls': 'application/vnd.ms-excel',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'ppt': 'application/vnd.ms-powerpoint',
        'txt': 'text/plain',
        'csv': 'text/csv',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'webp': 'image/webp'
      };
      if (mimeMap[ext]) fileType = mimeMap[ext];
    }

    // List of allowed types for the AI to process (extendable)
    const validMimes = [
      'image/',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv'
    ];

    const isAllowed = validMimes.some(mime => fileType?.startsWith(mime) || fileType === mime);

    // Even if not in list, let's allow it but maybe warn? 
    // Actually, AI Ads can handle most text/data files.

    const fileWithMetadata = new File([file], fileName, { type: fileType || 'application/octet-stream' });
    setSelectedFiles(prev => [...prev, fileWithMetadata]);

    // Generate Preview using DataURL (more persistent for chat messages)
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreviews(prev => [...prev, {
        url: reader.result,
        name: fileName,
        type: fileType || 'application/octet-stream',
        size: file.size,
        id: Math.random().toString(36).substr(2, 9)
      }]);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach(file => processFile(file));
    setIsAttachMenuOpen(false); // Close menu after selection

    // [PROACTIVE FEATURE]: If this is a new chat (no messages), automatically trigger analysis
    if (messages.length === 0 && !isLoading) {
      setTimeout(() => {
        handleSendMessage();
      }, 1000); // 1s delay to ensure FileReader (in processFile) has finished
    }
  };

  const handlePaste = (e) => {
    // Only handle if there are files (blobs) or items in clipboard
    const items = e.clipboardData?.items;
    const files = e.clipboardData?.files;
    let handled = false;

    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file') {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            handled = true;
          }
        }
      }
    }

    // Fallback for older browsers or specific mobile behaviors
    if (!handled && files && files.length > 0) {
      Array.from(files).forEach(file => {
        processFile(file);
        handled = true;
      });
    }

    if (handled) {
      e.preventDefault(); // Don't paste the filename as text if we handled the file
      toast.success("File pasted! 📎");
    }
  };

  const handleRemoveFile = (id) => {
    if (id) {
      // Find the file name to remove from selectedFiles
      const previewToRemove = filePreviews.find(p => p.id === id);
      if (previewToRemove) {
        setSelectedFiles(prev => prev.filter(f => f.name !== previewToRemove.name));
        setFilePreviews(prev => prev.filter(p => p.id !== id));
      }
    } else {
      // Clear all
      setSelectedFiles([]);
      setFilePreviews([]);
    }
    if (uploadInputRef.current) uploadInputRef.current.value = '';
    if (driveInputRef.current) driveInputRef.current.value = '';
    if (photosInputRef.current) photosInputRef.current.value = '';
  };

  const handleAttachmentSelect = (type) => {
    setIsAttachMenuOpen(false);
    if (type === 'upload') {
      uploadInputRef.current?.click();
    } else if (type === 'photos') {
      photosInputRef.current?.click();
    } else if (type === 'drive') {
      driveInputRef.current?.click();
    } else if (type === 'doc-voice') {
      document.getElementById('doc-voice-upload')?.click();
    }
  };

  const handleDocToVoiceSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!checkLimitLocally('audio')) {
      e.target.value = '';
      return;
    }

    setIsAttachMenuOpen(false);

    // 1. Show User Message immediately with the file
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Content = reader.result; // Full Data URL for display
      const base64Data = base64Content.split(',')[1]; // Raw base64 for backend

      let activeSessionId = currentSessionId;
      if (activeSessionId === 'new') {
        activeSessionId = await chatStorageService.createSession(currentProjectId);
        setCurrentSessionId(activeSessionId);
        isNavigatingRef.current = true;
        navigate(`/dashboard/chat/${activeSessionId}`, { replace: true });
      }

      // Add User Message
      const userMsgId = Date.now().toString();
      const userMsg = {
        id: userMsgId,
        role: 'user',
        content: `Please convert this document to audio: **${file.name}**`,
        timestamp: new Date(),
        projectId: currentProjectId,
        attachments: [{
          url: base64Content,
          name: file.name,
          type: file.type
        }]
      };
      setMessages(prev => [...prev, userMsg]);
      chatStorageService.saveMessage(activeSessionId, userMsg, `Audio: ${file.name}`, currentProjectId).catch(e => console.error(e));

      // 2. Add Processing Message from AI Ads
      const aiMsgId = (Date.now() + 1).toString();
      const processingMsg = {
        id: aiMsgId,
        role: 'assistant',
        content: `⚡ **EXTRACTING CONTENT...**\nReading text from **${file.name}**...`,
        timestamp: new Date(),
        isProcessing: true
      };
      setMessages(prev => [...prev, processingMsg]);
      scrollToBottom();

      // Update UI slightly after extraction
      setTimeout(() => {
        setMessages(prev => prev.map(msg => msg.id === aiMsgId && msg.isProcessing ? {
          ...msg,
          content: `🎧 **CONVERTING TO VOICE...**\nSynthesizing natural audio for **${file.name}**. This won't take long!`
        } : msg));
      }, 1500);
      scrollToBottom();

      // 3. Start Conversion - Added high timeout for long docs
      try {
        const response = await axios.post(apis.synthesizeFile, {
          fileData: base64Data,
          mimeType: file.type || 'application/pdf',
          languageCode: audioLangCode,
          voiceName: audioVoiceName,
          pitch: audioPitch,
          speakingRate: audioSpeed
        }, {
          responseType: 'arraybuffer',
          timeout: 0,
          headers: { Authorization: `Bearer ${getUserData()?.token}` }
        });

        // 4. Success - Update AI Message with Player and Download
        const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);

        const reader2 = new FileReader();
        reader2.readAsDataURL(audioBlob);
        reader2.onloadend = () => {
          const mp3Base64 = reader2.result.split(',')[1];
          const rawBytes = response.data.byteLength;
          const charCount = response.headers['x-text-length'] || 0;
          const formattedFileSize = rawBytes > 1024 * 1024
            ? (rawBytes / (1024 * 1024)).toFixed(1) + ' MB'
            : (rawBytes / 1024).toFixed(1) + ' KB';

          const aiResponse = {
            id: aiMsgId,
            role: 'model',
            isProcessing: false,
            content: `✅ I have successfully converted **${file.name}** into a full audio voice.`,
            conversion: {
              file: mp3Base64,
              blobUrl: audioUrl,
              fileName: `${file.name.split('.')[0]}_Audio.mp3`,
              mimeType: 'audio/mpeg',
              fileSize: formattedFileSize,
              rawSize: rawBytes,
              charCount: charCount
            },
            timestamp: new Date(),
            projectId: currentProjectId
          };

          setMessages(prev => prev.map(msg => msg.id === aiMsgId ? aiResponse : msg));
          chatStorageService.saveMessage(activeSessionId, aiResponse, null, currentProjectId).catch(e => console.error(e));

          toast.success("Conversion complete! 🎶");
          refreshSubscription();
          scrollToBottom();
        };

      } catch (err) {
        console.error('[DocToVoice Error]:', err);
        let errorMsg = "Extraction Failed";
        let errorDetail = err.message;

        if (err.response?.data) {
          try {
            // Buffer result handling
            const errorData = err.response.data instanceof ArrayBuffer
              ? JSON.parse(new TextDecoder().decode(err.response.data))
              : err.response.data;

            errorMsg = errorData.error || errorMsg;
            errorDetail = errorData.details || errorDetail;
          } catch (e) {
            console.error("Failed to parse error response:", e);
          }
        }

        const serverError = errorMsg + (errorDetail ? `: ${errorDetail}` : "");
        const errorResponse = {
          id: aiMsgId,
          role: 'model',
          isProcessing: false,
          content: `❌ **Conversion Failed**\n${serverError}`,
          timestamp: new Date(),
          projectId: currentProjectId
        };

        setMessages(prev => prev.map(msg => msg.id === aiMsgId ? errorResponse : msg));
        chatStorageService.saveMessage(activeSessionId, errorResponse, null, currentProjectId).catch(e => console.error(e));

      }
    };
    reader.readAsDataURL(file);

    e.target.value = ''; // Always reset so user can click/upload same file again
  };

  const manualFileToAudioConversion = async (file, activeSessionId) => {
    if (!file) return;

    if (!checkLimitLocally('audio')) {
      return;
    }

    // 1. Show User Message immediately with the file
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Content = reader.result;
      const base64Data = base64Content.split(',')[1];
      console.log(`[DEBUG] manualFileToAudioConversion: file=${file.name}, type=${file.type}, size=${file.size}`);

      const userMsgId = Date.now().toString();
      const userMsg = {
        id: userMsgId,
        role: 'user',
        content: `Convert this document to audio: **${file.name}**`,
        timestamp: new Date(),
        projectId: currentProjectId,
        attachments: [{ url: base64Content, name: file.name, type: file.type }]
      };
      setMessages(prev => [...prev, userMsg]);
      chatStorageService.saveMessage(activeSessionId, userMsg, `Audio: ${file.name}`, currentProjectId).catch(e => console.error(e));

      const aiMsgId = (Date.now() + 1).toString();
      const processingMsg = {
        id: aiMsgId,
        role: 'assistant',
        content: `⚡ **EXTRACTING CONTENT...**\nReading **${file.name}**...`,
        timestamp: new Date(),
        isProcessing: true
      };
      setMessages(prev => [...prev, processingMsg]);
      scrollToBottom();

      // Second stage update
      setTimeout(() => {
        setMessages(prev => prev.map(msg => msg.id === aiMsgId && msg.isProcessing ? {
          ...msg,
          content: `🎧 **CONVERTING TO VOICE...**\nAlmost there! Preparing your audio for **${file.name}**...`
        } : msg));
      }, 1200);

      try {
        console.log(`[VoiceConversion] Sending request to: ${apis.synthesizeFile}`);
        const response = await axios.post(apis.synthesizeFile, {
          fileData: base64Data,
          mimeType: file.type || 'application/pdf',
          languageCode: audioLangCode,
          voiceName: audioVoiceName,
          pitch: audioPitch,
          speakingRate: audioSpeed
        }, {
          responseType: 'arraybuffer',
          timeout: 300000, // 5 minute timeout for large files on live servers
          headers: { Authorization: `Bearer ${getUserData()?.token}` }
        });

        const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const reader2 = new FileReader();
        reader2.readAsDataURL(audioBlob);
        reader2.onloadend = () => {
          const mp3Base64 = reader2.result.split(',')[1];
          const rawBytes = response.data.byteLength;
          const charCount = response.headers['x-text-length'] || 0;
          const formattedSize = rawBytes > 1024 * 1024 ? (rawBytes / (1024 * 1024)).toFixed(1) + ' MB' : (rawBytes / 1024).toFixed(1) + ' KB';

          const aiResponse = {
            id: aiMsgId,
            role: 'model',
            isProcessing: false,
            content: `✅ Audio conversion complete for **${file.name}**.`,
            conversion: {
              file: mp3Base64,
              blobUrl: audioUrl,
              fileName: `${file.name.split('.')[0]}_Audio.mp3`,
              mimeType: 'audio/mpeg',
              fileSize: formattedSize,
              rawSize: rawBytes,
              charCount: charCount
            },
            timestamp: new Date(),
            projectId: currentProjectId
          };

          setMessages(prev => prev.map(msg => msg.id === aiMsgId ? aiResponse : msg));
          chatStorageService.saveMessage(activeSessionId, aiResponse, null, currentProjectId).catch(e => console.error(e));
          toast.success("File converted successfully!");
          refreshSubscription();
          scrollToBottom();
        };
      } catch (err) {
        console.error('[ManualConversion Error]:', err);
        let errorMsg = "Conversion Failed";
        let errorDetail = err.message;

        if (err.response?.data) {
          try {
            // Buffer result handling
            const errorData = err.response.data instanceof ArrayBuffer
              ? JSON.parse(new TextDecoder().decode(err.response.data))
              : err.response.data;

            errorMsg = errorData.error || errorMsg;
            errorDetail = errorData.details || errorDetail || err.message;
          } catch (e) {
            console.error("Failed to parse error response:", e);
          }
        }
        const serverError = errorMsg + (errorDetail ? `: ${errorDetail}` : "");
        const errorResponse = {
          id: aiMsgId,
          role: 'model',
          isProcessing: false,
          content: `❌ **Conversion Failed**\n${serverError}`,
          timestamp: new Date()
        };
        setMessages(prev => prev.map(msg => msg.id === aiMsgId ? errorResponse : msg));
        chatStorageService.saveMessage(activeSessionId, errorResponse, null, currentProjectId).catch(e => console.error(e));
        toast.error("Conversion failed");
      }
    };
    reader.readAsDataURL(file);
  };

  const manualTextToAudioConversion = async (text, activeSessionId, replaceAssistantMsgId = null) => {
    if (!text || !text.trim()) return;

    if (!checkLimitLocally('audio')) {
      return;
    }

    if (!replaceAssistantMsgId) {
      const userMsg = {
        id: Date.now().toString(),
        role: 'user',
        content: `Convert this text to audio: "${text}"`,
        timestamp: new Date(),
        projectId: currentProjectId
      };
      setMessages(prev => [...prev, userMsg]);
      const talkTitle = text.length > 20 ? text.substring(0, 20) + '...' : text;
      chatStorageService.saveMessage(activeSessionId, userMsg, `Audio Talk: ${talkTitle}`, currentProjectId).catch(e => console.error(e));
    }

    const aiMsgId = replaceAssistantMsgId || (Date.now() + 1).toString();
    const generatingMsg = {
      id: aiMsgId,
      role: 'model',
      content: `🎧 **Generating voice for your text...**`,
      timestamp: new Date(),
      isProcessing: true
    };

    if (replaceAssistantMsgId) {
      setMessages(prev => prev.map(msg => msg.id === aiMsgId ? generatingMsg : msg));
    } else {
      setMessages(prev => [...prev, generatingMsg]);
    }

    scrollToBottom();

    try {
      const response = await axios.post(apis.synthesizeFile, {
        introText: text,
        languageCode: audioLangCode,
        voiceName: audioVoiceName,
        pitch: audioPitch,
        speakingRate: audioSpeed
      }, { responseType: 'arraybuffer', timeout: 0, headers: { Authorization: `Bearer ${getUserData()?.token}` } });

      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const reader2 = new FileReader();
      reader2.readAsDataURL(audioBlob);
      reader2.onloadend = () => {
        const mp3Base64 = reader2.result.split(',')[1];
        const rawBytes = response.data.byteLength;
        const charCount = response.headers['x-text-length'] || 0;
        const formattedSize = rawBytes > 1024 * 1024 ? (rawBytes / (1024 * 1024)).toFixed(1) + ' MB' : (rawBytes / 1024).toFixed(1) + ' KB';

        const aiResponse = {
          id: aiMsgId,
          role: 'model',
          isProcessing: false,
          content: `✅ Your text has been converted to voice audio.`,
          conversion: {
            file: mp3Base64,
            blobUrl: audioUrl,
            fileName: `AI Ads_Voice_${Date.now()}.mp3`,
            mimeType: 'audio/mpeg',
            fileSize: formattedSize,
            rawSize: rawBytes,
            charCount: charCount
          },
          timestamp: new Date(),
          projectId: currentProjectId
        };

        setMessages(prev => prev.map(msg => msg.id === aiMsgId ? aiResponse : msg));

        if (replaceAssistantMsgId) {
          chatStorageService.updateMessage(activeSessionId, aiResponse, currentProjectId).catch(e => console.error(e));
        } else {
          chatStorageService.saveMessage(activeSessionId, aiResponse, null, currentProjectId).catch(e => console.error(e));
        }

        toast.success("Text converted successfully!");
        refreshSubscription();
        scrollToBottom();
      };
    } catch (err) {
      console.error('[ManualTextConversion Error]:', err);
      let serverError = err.message;
      if (err.response?.data) {
        try {
          const errorData = err.response.data instanceof ArrayBuffer
            ? JSON.parse(new TextDecoder().decode(err.response.data))
            : err.response.data;
          serverError = errorData.details || errorData.error || err.message;
        } catch (e) {
          console.error("Failed to parse", e);
        }
      }
      const errorResponse = {
        id: aiMsgId,
        role: 'model',
        isProcessing: false,
        content: `❌ **Conversion Failed**\n${serverError}`,
        timestamp: new Date()
      };
      setMessages(prev => prev.map(msg => msg.id === aiMsgId ? errorResponse : msg));
      chatStorageService.saveMessage(activeSessionId, errorResponse, null, currentProjectId).catch(e => console.error(e));
      toast.error("Conversion failed");
    }
  };

  const handleGenerateVideo = async (overridePrompt, activeSessionId = currentSessionId) => {
    if (!checkLimitLocally('video')) {
      return;
    }
    try {
      if (!inputRef.current?.value.trim() && !overridePrompt && selectedFiles.length === 0) {
        // toast.error('Please enter a prompt or select a file');
        // Let it slide if it's voice input (handled elsewhere)
        if (!voiceUsedRef.current) return;
      }

      const prompt = overridePrompt || inputRef.current?.value || "";
      // const filesToSend = [...selectedFiles]; // Snapshot // This variable is not used

      // Voice Reader Mode Logic
      if (isVoiceMode) {
        try {
          // 1. Add User Message to UI
          const userMsgId = Date.now().toString();
          const newUserMsg = {
            id: userMsgId,
            role: 'user', // Ensure role user
            content: prompt, // Use content
            timestamp: new Date(),
            projectId: currentProjectId,
            attachments: filePreviews.map(fp => ({
              url: fp.url,
              name: fp.name,
              type: fp.type
            }))
          };
          setMessages(prev => [...prev, newUserMsg]);

          // Clear Inputs
          setInputValue('');
          setSelectedFiles([]);
          setFilePreviews([]);
          if (inputRef.current) inputRef.current.style.height = 'auto';

          // Save to backend
          if (activeSessionId && activeSessionId !== 'new') {
            chatStorageService.saveMessage(activeSessionId, newUserMsg, null, currentProjectId).catch(err => console.error("Error saving voice message:", err));
          }

          // 2. Trigger Voice Reading Directly
          setIsLoading(true);

          // Show a "Reading..." AI bubble
          const aiMsgId = (Date.now() + 1).toString();
          const readingMsg = {
            id: aiMsgId,
            role: 'model', // Ensure role assistant
            content: "🎧 Reading content aloud...", // Use content
            timestamp: new Date(),
            projectId: currentProjectId
          };
          setMessages(prev => [...prev, readingMsg]);

          if (activeSessionId && activeSessionId !== 'new') {
            chatStorageService.saveMessage(activeSessionId, readingMsg, null, currentProjectId).catch(err => console.error("Error saving reading bubble:", err));
          }

          setTimeout(() => {
            speakResponse(prompt, audioLangCode, aiMsgId, newUserMsg.attachments);
            setIsLoading(false);
          }, 500);

          return; // STOP HERE (Do not call AI API)
        } catch (err) {
          console.error("Voice mode handler failed:", err);
        }
      }

      setIsLoading(true);
      // isSendingRef.current = true; // Mark as sending // This variable is not defined in the provided context

      // 1. Add User Message to UI
      const userMsgId = Date.now().toString();
      const userMsg = {
        id: userMsgId,
        role: 'user',
        content: prompt,
        timestamp: new Date(),
        projectId: currentProjectId,
        attachments: filePreviews.map(fp => ({
          url: fp.url,
          name: fp.name,
          type: fp.type
        }))
      };

      // Show a message that video generation is in progress
      const tempId = (Date.now() + 1).toString();
      const newMessage = {
        id: tempId,
        role: 'model',
        isGenerating: true,
        content: `🎬 Generating video from prompt: "${prompt}"\n\nPlease wait, this may take a moment...`, // Use content
        timestamp: new Date(),
        projectId: currentProjectId
      };

      setMessages(prev => [...prev, userMsg, newMessage]);
      if (inputRef.current) inputRef.current.value = '';
      setInputValue('');
      handleRemoveFile();

      // Ensure the prompt and loading state are visible
      setTimeout(() => scrollToBottom(true), 50);

      // Save user message to backend
      if (activeSessionId && activeSessionId !== 'new') {
        chatStorageService.saveMessage(activeSessionId, userMsg, null, currentProjectId).catch(err => console.error("Error saving video user message:", err));
      }

      try {
        // Use apiService
        const data = await apiService.generateVideo(prompt, 5, 'medium', videoAspectRatio, videoModelId, videoResolution);

        if (data.videoUrl) {
          // Add the generated video to the message
          const videoMessage = {
            id: tempId, // Keep same ID
            role: 'model',
            isGenerating: false,
            content: `🎥 Video generated successfully!`, // Use content
            videoUrl: data.videoUrl,
            timestamp: new Date(),
            projectId: currentProjectId
          };

          setMessages(prev => prev.map(msg => msg.id === tempId ? videoMessage : msg));
          toast.success('Video generated successfully!');
          refreshSubscription();

          // Save AI response to backend
          if (activeSessionId && activeSessionId !== 'new') {
            chatStorageService.saveMessage(activeSessionId, videoMessage, null, currentProjectId).catch(err => console.error("Error saving video results:", err));
          }

        } else if (data.imageUrl) {
          // Add image fallback
          const imageMessage = {
            id: tempId, // Keep same ID
            role: 'model',
            content: `🖼️ ${data.message || 'Video generation limit reached. Generated a preview image instead.'}`,
            imageUrl: data.imageUrl,
            timestamp: new Date(),
          };

          setMessages(prev => prev.map(msg => msg.id === tempId ? imageMessage : msg));
          toast.success('Generated preview image');

          // Save AI fallback image to backend
          if (activeSessionId && activeSessionId !== 'new') {
            chatStorageService.saveMessage(activeSessionId, imageMessage, null, currentProjectId).catch(err => console.error("Error saving video fallback image:", err));
          }
        }
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to generate video';

        // If we got an image URL even with error (sometimes happens with 200 fallback but let's be safe)
        if (error.response?.data?.imageUrl) {
          const imageMessage = {
            id: tempId,
            role: 'model',
            content: `🖼️ ${error.response.data.message || 'Video generation failed. Generated preview.'}`,
            imageUrl: error.response.data.imageUrl,
            timestamp: new Date(),
          };
          setMessages(prev => prev.map(msg => msg.id === tempId ? imageMessage : msg));

          // Save AI error fallback image to backend
          if (activeSessionId && activeSessionId !== 'new') {
            chatStorageService.saveMessage(activeSessionId, imageMessage, null, currentProjectId).catch(err => console.error("Error saving video error fallback image:", err));
          }
          return;
        }

        setMessages(prev => prev.map(msg => msg.id === tempId ? { ...msg, isGenerating: false, content: `❌ ${errorMsg}` } : msg));
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Video generation error:', error);
      toast.error('Error initiating video generation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async (overridePrompt, activeSessionId = currentSessionId) => {
    if (!checkLimitLocally('image')) {
      return;
    }
    try {
      if (!inputRef.current?.value.trim() && !overridePrompt) {
        toast.error('Please enter a prompt for image generation');
        return;
      }

      const prompt = overridePrompt || inputRef.current.value;
      setIsLoading(true);

      // 1. Add User Message to UI
      const userMsgId = Date.now().toString();
      const userMsg = {
        id: userMsgId,
        role: 'user',
        content: prompt,
        timestamp: new Date(),
        projectId: currentProjectId,
        attachments: filePreviews.map(fp => ({
          url: fp.url,
          name: fp.name,
          type: fp.type.startsWith('image/') ? 'image' :
            fp.type.includes('pdf') ? 'pdf' :
              fp.type.includes('word') || fp.type.includes('document') ? 'docx' : 'file'
        }))
      };

      // Show a message that image generation is in progress
      const tempId = (Date.now() + 1).toString();
      const newMessage = {
        id: tempId,
        role: 'model',
        isGenerating: true,
        content: `✨ **AISA generating...**\n🎨 Generating high-quality poster from your prompt: "${prompt}"\n\nIntelligently refining text detection, placement, and cinematic styling...`, // Use content
        timestamp: new Date(),
        projectId: currentProjectId
      };

      setMessages(prev => [...prev, userMsg, newMessage]);
      if (inputRef.current) inputRef.current.value = '';
      setInputValue('');
      handleRemoveFile();

      // Ensure the prompt and loading state are visible
      setTimeout(() => scrollToBottom(true), 50);

      // Save user message to backend
      if (activeSessionId && activeSessionId !== 'new') {
        chatStorageService.saveMessage(activeSessionId, userMsg, null, currentProjectId).catch(err => console.error("Error saving image user message:", err));
      }

      try {
        // Use apiService
        const data = await apiService.generateImage(prompt, imageAspectRatio, imageModelId);

        if (data && (data.imageUrl || data.data)) {
          const finalUrl = data.imageUrl || data.data; // Handle different response structures

          // --- Non-blocking Smart Prompts ---
          const initialSuggestions = data.suggestions || [];
          const imageMessage = {
            id: tempId,
            role: 'model',
            isGenerating: false,
            content: `🖼️ Image generated successfully!`,
            imageUrl: finalUrl,
            suggestions: initialSuggestions,
            timestamp: new Date(),
            projectId: currentProjectId
          };

          // 1. Show the image IMMEDIATELY
          setMessages(prev => prev.map(msg => msg.id === tempId ? imageMessage : msg));
          scrollToBottom(true);

          // 2. Fetch related prompts in background if not provided by the API
          if (initialSuggestions.length === 0) {
            generateFollowUpPrompts(prompt, 'image').then(smartPrompts => {
              if (smartPrompts && smartPrompts.length > 0) {
                setMessages(prev => prev.map(msg =>
                  msg.id === tempId ? { ...msg, suggestions: smartPrompts } : msg
                ));
                // Update persistent storage with the new suggestions
                if (activeSessionId && activeSessionId !== 'new') {
                  chatStorageService.saveMessage(activeSessionId, { ...imageMessage, suggestions: smartPrompts }, null, currentProjectId);
                }
              }
            }).catch(e => console.warn("Background suggestion fetch failed:", e));
          }

          toast.success('Image generated successfully!');
          refreshSubscription();

          // Save AI response to backend
          if (activeSessionId && activeSessionId !== 'new') {
            chatStorageService.saveMessage(activeSessionId, imageMessage, null, currentProjectId).catch(err => console.error("Error saving image generation results:", err));
          }
        }
      } catch (error) {
        console.error("Image Gen Error Details:", error);
        const errorMsg = error.response?.data?.message || error.message || 'Failed to generate image';
        setMessages(prev => prev.map(msg => msg.id === tempId ? { ...msg, content: `❌ ${errorMsg}` } : msg)); // Use content
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Image generation error:', error);
      toast.error('Error initiating image generation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditImage = async (overridePrompt, activeSessionId = currentSessionId) => {
    if (!checkLimitLocally('image')) {
      return;
    }
    try {
      const prompt = overridePrompt || inputRef.current?.value || "";
      if (!prompt) {
        toast.error('Please enter instructions for image editing');
        return;
      }

      // Check for attached image or find the most recent image in chat
      let imageFile = filePreviews.find(f => f.type.startsWith('image/'));

      if (!imageFile) {
        // 1. Check if we have a specific reference set from an "Edit" button click
        if (editRefImage) {
          imageFile = editRefImage;
        }
        // 2. Fallback: find the most recent image message in the session
        else {
          const lastImageMsg = [...messages].reverse().find(msg => msg.imageUrl);
          if (lastImageMsg) {
            imageFile = {
              url: lastImageMsg.imageUrl,
              name: 'Reference Image',
              type: 'image/png'
            };
          }
        }
      }

      if (!imageFile) {
        toast.error('Please upload an image or generate one first to edit');
        return;
      }

      setIsLoading(true);

      // 1. Add User Message to UI
      const userMsgId = Date.now().toString();
      const userMsg = {
        id: userMsgId,
        role: 'user',
        content: prompt,
        timestamp: new Date(),
        projectId: currentProjectId,
        attachments: imageFile.id ? filePreviews.map(fp => ({
          url: fp.url,
          name: fp.name,
          type: fp.type.startsWith('image/') ? 'image' : 'file'
        })) : [{
          url: imageFile.url,
          name: imageFile.name,
          type: 'image'
        }]
      };

      // Show a message that image editing is in progress
      const tempId = (Date.now() + 1).toString();
      const newMessage = {
        id: tempId,
        role: 'model',
        isGenerating: true,
        content: `🪄 **Advanced Precision Editor Active**\n🔧 Executing Photoshop-level modifications for: "${prompt}"\n\nPreserving original composition, art style, and character-perfect text rendering...`,
        timestamp: new Date(),
        projectId: currentProjectId,
      };

      setMessages(prev => [...prev, userMsg, newMessage]);
      if (inputRef.current) inputRef.current.value = '';
      setInputValue('');

      // ✅ Clear the attachment immediately when send is pressed
      handleRemoveFile();
      setEditRefImage(null);
      if (inputRef.current) inputRef.current.style.height = 'auto';

      // Ensure the prompt and loading state are visible
      setTimeout(() => scrollToBottom(true), 50);

      // Save user message to backend
      if (activeSessionId && activeSessionId !== 'new') {
        chatStorageService.saveMessage(activeSessionId, userMsg, null, currentProjectId).catch(err => console.error("Error saving image edit user message:", err));
      }

      try {
        console.log("[Image Edit] Starting edit request for:", prompt);

        let rawImageBlob = null;

        try {
          if (imageFile.url.startsWith('data:')) {
            const res = await fetch(imageFile.url);
            rawImageBlob = await res.blob();
          } else {
            const matchedFile = selectedFiles.find(f => f.name === imageFile.name);
            if (matchedFile) {
              rawImageBlob = matchedFile;
            } else if (imageFile.url.startsWith('blob:')) {
              const res = await fetch(imageFile.url);
              rawImageBlob = await res.blob();
            } else {
              // Remote URLs: securely fetch through backend proxy to bypass browser CORS blocks
              const proxiedUrl = `${apis.imageProxy}?url=${encodeURIComponent(imageFile.url)}`;
              const res = await fetch(proxiedUrl);
              rawImageBlob = await res.blob();
            }
          }
        } catch (err) {
          console.error("[Image Edit] Blob conversion failed:", err);
          throw new Error("Failed to process the reference image.");
        }

        const formData = new FormData();
        formData.append('prompt', prompt);
        formData.append('model', editModelId);
        if (rawImageBlob) {
          formData.append('image', rawImageBlob, 'reference.png');
        }

        const token = JSON.parse(localStorage.getItem('user') || '{}').token;
        const fetchRes = await fetch(`${API}/edit-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!fetchRes.ok) {
          const errorText = await fetchRes.text();
          throw new Error(`Server returned ${fetchRes.status}: ${errorText}`);
        }

        const responseData = await fetchRes.json();

        if (responseData && responseData.data) {
          const finalUrl = responseData.data;

          const initialSuggestions = responseData.suggestions || [];
          const editMessage = {
            id: tempId,
            role: 'model',
            content: `✨ Your image has been edited!`,
            imageUrl: finalUrl,
            suggestions: initialSuggestions,
            timestamp: new Date(),
            projectId: currentProjectId
          };

          // 1. Show edited image IMMEDIATELY
          setMessages(prev => prev.map(msg => msg.id === tempId ? editMessage : msg));
          scrollToBottom(true);

          // 2. Fetch related prompts in background
          if (initialSuggestions.length === 0) {
            generateFollowUpPrompts(prompt, 'image edit').then(smartPrompts => {
              if (smartPrompts && smartPrompts.length > 0) {
                setMessages(prev => prev.map(msg =>
                  msg.id === tempId ? { ...msg, suggestions: smartPrompts } : msg
                ));
                if (activeSessionId && activeSessionId !== 'new') {
                  chatStorageService.saveMessage(activeSessionId, { ...editMessage, suggestions: smartPrompts }, null, currentProjectId);
                }
              }
            }).catch(e => console.warn("Background suggestion fetch failed for edit:", e));
          }

          toast.success('Image edited successfully!');
          refreshSubscription();


          // Save AI response to backend
          if (activeSessionId && activeSessionId !== 'new') {
            chatStorageService.saveMessage(activeSessionId, editMessage, null, currentProjectId).catch(err => console.error("Error saving edited image results:", err));
          }
        }
      } catch (error) {
        console.error("Image Edit Error:", error);
        const errorMsg = error.response?.data?.message || error.message || 'Failed to edit image';
        setMessages(prev => prev.map(msg => msg.id === tempId ? { ...msg, isGenerating: false, content: `❌ ${errorMsg}` } : msg));
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Image editing error:', error);
      toast.error('Error initiating image editing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeepSearch = async () => {
    if (!checkLimitLocally('deepSearch')) {
      return;
    }
    try {
      if (!inputRef.current?.value.trim()) {
        toast.error('Please enter a topic for deep search');
        return;
      }

      const query = inputRef.current.value;
      setIsLoading(true);

      // Show a message that deep search is in progress
      const newMessage = {
        id: Date.now().toString(),
        role: 'model',
        isGenerating: true,
        content: `🔍 Performing deep search for: "${query}"\n\nSearching the web and analyzing results... This may take a moment...`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, newMessage]);
      inputRef.current.value = '';

      try {
        // Send message with deep search context
        const responseData = await generateChatResponse(
          messages,
          query,
          "DEEP SEARCH MODE ENABLED: Analyze the web search results comprehensively.",
          [],
          currentLang,
          null,
          MODES.DEEP_SEARCH,
          currentProjectId
        );

        if (responseData && responseData.reply) {
          // Add the deep search result
          const searchMessage = {
            id: Date.now().toString(),
            type: 'ai',
            text: responseData.reply,
            content: responseData.reply,
            timestamp: new Date(),
          };

          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = searchMessage;
            return updated;
          });

          toast.success('Deep search completed!');
          refreshSubscription();
        }
      } catch (error) {
        const errorMsg = error.message || 'Failed to perform deep search';
        setMessages(prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          updated[updated.length - 1] = {
            ...lastMsg,
            isGenerating: false,
            content: `❌ ${errorMsg}`
          };
          return updated;
        });
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Deep search error:', error);
      toast.error('Error initiating deep search');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStockAnalysis = async (stock, activeSessionId = currentSessionId) => {
    try {
      if (!stock) {
        toast.error('Please select a stock first');
        return;
      }

      setIsLoading(true);
      const user = getUserData();

      // 1. Add User Message to UI
      const userMsgId = Date.now().toString();
      const userMsg = {
        id: userMsgId,
        role: 'user',
        content: `Analyze stock performance and potential for: ${stock.name || stock.symbol}`,
        timestamp: new Date(),
        projectId: currentProjectId
      };

      // Show a message that analysis is in progress
      const tempId = (Date.now() + 1).toString();
      const readingMsg = {
        id: tempId,
        role: 'model',
        isGenerating: true,
        content: `📉 Fetching real-time market data for **${stock.symbol}**...\n\nAggregating the latest news and historical trends for AI depth analysis...`,
        timestamp: new Date(),
        projectId: currentProjectId
      };

      setMessages(prev => [...prev, userMsg, readingMsg]);
      setInputValue('');
      setStockSearchResults([]);
      setSelectedStock(null);

      // Save user message to backend
      if (activeSessionId && activeSessionId !== 'new') {
        chatStorageService.saveMessage(activeSessionId, userMsg, null, currentProjectId).catch(e => console.error(e));
      }

      try {
        const baseURL = window._env_?.VITE_AISA_BACKEND_API || import.meta.env.VITE_AISA_BACKEND_API || "http://localhost:8080/api";
        const response = await axios.post(`${baseURL}/cashflow/analyze`, {
          symbol: stock.symbol,
          name: stock.name
        }, {
          headers: { Authorization: `Bearer ${user.token}` }
        });

        const { summary, emailSent } = response.data;

        // 2. Add AI full report to UI
        const finalMsg = {
          id: tempId,
          role: 'model',
          isGenerating: false,
          content: summary.fullAnalysis,
          cashflowData: summary,
          timestamp: new Date(),
          projectId: currentProjectId
        };

        setMessages(prev => prev.map(m => m.id === tempId ? finalMsg : m));
        toast.success(`Research Report for ${summary.symbol} complete!`);

        // Save AI response
        if (activeSessionId && activeSessionId !== 'new') {
          chatStorageService.saveMessage(activeSessionId, finalMsg, null, currentProjectId).catch(e => console.error(e));
        }

        setIsCashFlowMode(false); // Return to normal chat
        refreshSubscription();

      } catch (err) {
        console.error("Stock analysis request failed:", err);
        const errorMsg = err.response?.data?.error || "Failed to complete financial analysis";
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, isGenerating: false, content: `❌ ${errorMsg}` } : m));
        toast.error(errorMsg);
      }

    } catch (err) {
      console.error("handleStockAnalysis error:", err);
      toast.error("Error initiating analysis");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelSelect = (modelId) => {
    if (selectedToolType) {
      setToolModels(prev => ({
        ...prev,
        [selectedToolType]: modelId
      }));
      const selectedModel = TOOL_PRICING[selectedToolType].models.find(m => m.id === modelId);
      toast.success(`Switched to ${selectedModel?.name}`);
      setIsModelSelectorOpen(false);
    }
  };

  // Voice Input Handler
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Voice input not supported in this browser');
      return;
    }

    if (isListening) {
      isManualStopRef.current = true;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    // Start New Listening session
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    isManualStopRef.current = false;
    transcriptRef.current = '';

    const langMap = {
      'Hindi': 'hi-IN',
      'English': 'en-US',
      'Spanish': 'es-ES',
      'French': 'fr-FR',
      'German': 'de-DE',
      'Japanese': 'ja-JP'
    };
    recognition.lang = langMap[currentLang] || 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setInputValue(transcript);
      transcriptRef.current = transcript;
    };

    recognition.onend = () => {
      setIsListening(false);

      const text = transcriptRef.current.trim();
      if (!isManualStopRef.current && text) {
        voiceUsedRef.current = true;
        handleSendMessage(null, text);
      }
      isManualStopRef.current = false;
    };

    recognition.onerror = (event) => {
      console.error('Speech error:', event.error);
      setIsListening(false);
      isManualStopRef.current = true;
      if (event.error === 'not-allowed') toast.error('Microphone access denied');
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
    }
  };

  // Ensure Chat Mic stops when Live Mode starts
  useEffect(() => {
    if (isLiveMode && isListening && recognitionRef.current) {
      console.log("[Chat] Stopping Mic for Live Mode");
      isManualStopRef.current = true;
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isLiveMode, isListening]);

  // Helper to clean markdown for TTS
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const audioRef = useRef(null);
  const audioCacheRef = useRef({});

  // Helper to clean markdown for TTS — narrative mode with natural pauses for Chirp 3 HD
  const cleanTextForTTS = (text) => {
    if (!text) return "";
    return text
      // ── Emojis out
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F0F5}\u{1F200}-\u{1F270}]/gu, '')
      // ── Headers → spoken as a sentence with a pause after (period adds natural pause)
      .replace(/^#{1,2}\s+(.+)$/gm, '$1. ')
      .replace(/^#{3,}\s+(.+)$/gm, '$1. ')
      // ── Bold → keep text, no markup
      .replace(/\*\*(.*?)\*\*/g, '$1')
      // ── Italic
      .replace(/\*(.*?)\*/g, '$1')
      // ── Underline / strikethrough
      .replace(/__(.*?)__/g, '$1')
      .replace(/~~(.*?)~~/g, '$1')
      // ── Links → just the label
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // ── Images → omit entirely
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
      // ── Code blocks → brief spoken note with pause
      .replace(/`{3}[\s\S]*?`{3}/g, ' Code snippet. ')
      // ── Inline code → just the text
      .replace(/`(.+?)`/g, '$1')
      // ── Bullet / numbered list items → each becomes a sentence for natural pause
      .replace(/^\s*[-*+]\s+(.+)$/gm, '$1. ')
      .replace(/^\s*\d+\.\s+(.+)$/gm, '$1. ')
      // ── Blockquote → keep content
      .replace(/^\s*>\s+/gm, '')
      // ── Tables → remove
      .replace(/\|.*?\|/g, '')
      // ── Horizontal rules → pause
      .replace(/^---+$/gm, '. ')
      // ── Special chars
      .replace(/™|&trade;/g, ' T M ')
      .replace(/©/g, '')
      .replace(/&amp;/g, 'and')
      .replace(/&lt;/g, '').replace(/&gt;/g, '')
      // ── Abbreviations → spoken form
      .replace(/\btm\b/gi, 'tum')
      .replace(/\bkkrh\b/gi, 'kya kar rahe ho')
      .replace(/\bclg\b/gi, 'college')
      .replace(/\bplz\b/gi, 'please')
      .replace(/\bbtw\b/gi, 'by the way')
      .replace(/\bidk\b/gi, 'I do not know')
      .replace(/\bAI\b/g, 'A I')
      // ── Keep commas, periods, question marks for natural prosody — remove only noise chars
      .replace(/[;:\"\\@\[\]\(\)\|]/g, ' ')
      // ── Multiple punctuation → single
      .replace(/\.{2,}/g, '. ')
      .replace(/!{2,}/g, '! ')
      .replace(/\?{2,}/g, '? ')
      // ── Collapse whitespace
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Voice Queue Ref
  const speechQueueRef = useRef([]);
  const isSpeakingRef = useRef(false);
  const currentSpeechResolverRef = useRef(null);

  // Internal function to execute speech
  const executeSpeak = async (text, language, msgId, attachments = []) => {
    return new Promise(async (resolve) => {
      // Store resolve to allow external cancellation
      currentSpeechResolverRef.current = resolve;

      // Reset State Logic used to be here, now handled by queue manager

      try {
        let audioBlob = null;
        let targetLang = 'en-US';

        const readableAttachment = attachments && attachments.length > 0
          ? attachments.find(a =>
          (a.type && (
            a.type.includes('pdf') ||
            a.type.includes('word') ||
            a.type.includes('document') ||
            a.type.includes('text') ||
            a.type.startsWith('image/')
          ))
          ) : null;

        // Check Cache
        if (msgId && audioCacheRef.current[msgId]) {
          console.log(`[VOICE] Using cached audio for: ${msgId}`);
          audioBlob = audioCacheRef.current[msgId];
        } else {
          // Not cached, fetch
          if (readableAttachment) {
            toast.loading("Processing file & text...", { id: 'voice-loading' });
            console.log(`[VOICE] Reading attachment: ${readableAttachment.name}`);

            const fileRes = await fetch(readableAttachment.url);
            const fileBlob = await fileRes.blob();

            const base64Data = await new Promise((res) => {
              const reader = new FileReader();
              reader.onloadend = () => res(reader.result.split(',')[1]);
              reader.readAsDataURL(fileBlob);
            });

            const headerText = text ? cleanTextForTTS(text) : "";

            const response = await axios.post(apis.synthesizeFile, {
              fileData: base64Data,
              mimeType: readableAttachment.type || 'application/pdf',
              languageCode: null,
              gender: 'FEMALE',
              introText: headerText
            }, {
              responseType: 'arraybuffer',
              headers: { Authorization: `Bearer ${getUserData()?.token}` }
            });

            audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
            toast.dismiss('voice-loading');

          } else {
            if (!text) {
              resolve();
              return;
            }

            const cleanText = cleanTextForTTS(text);
            if (!cleanText) {
              resolve();
              return;
            }

            // ── Comprehensive Language Auto-Detector ──────────────────────────────
            // PHASE 1: Unicode script block detection (non-Latin scripts)
            // PHASE 2: Romanized language word-frequency scoring (Latin scripts)
            const detectLanguageFromText = (text) => {
              const lowerText = text.toLowerCase();

              // ── PHASE 1: Unicode Script Block Detection ─────────────────────────
              const scriptCounts = {
                devanagari: (text.match(/[\u0900-\u097F]/g) || []).length,
                arabic: (text.match(/[\u0600-\u06FF\u0750-\u077F]/g) || []).length,
                urdu: (text.match(/[\uFB50-\uFEFF]/g) || []).length,
                cyrillic: (text.match(/[\u0400-\u04FF]/g) || []).length,
                cjkChinese: (text.match(/[\u4E00-\u9FFF\u3400-\u4DBF]/g) || []).length,
                hiragana: (text.match(/[\u3041-\u3096]/g) || []).length,
                katakana: (text.match(/[\u30A1-\u30FA]/g) || []).length,
                hangul: (text.match(/[\uAC00-\uD7AF\u1100-\u11FF]/g) || []).length,
                tamil: (text.match(/[\u0B80-\u0BFF]/g) || []).length,
                telugu: (text.match(/[\u0C00-\u0C7F]/g) || []).length,
                kannada: (text.match(/[\u0C80-\u0CFF]/g) || []).length,
                malayalam: (text.match(/[\u0D00-\u0D7F]/g) || []).length,
                bengali: (text.match(/[\u0980-\u09FF]/g) || []).length,
                gujarati: (text.match(/[\u0A80-\u0AFF]/g) || []).length,
                gurmukhi: (text.match(/[\u0A00-\u0A7F]/g) || []).length,
                thai: (text.match(/[\u0E00-\u0E7F]/g) || []).length,
                greek: (text.match(/[\u0370-\u03FF]/g) || []).length,
                hebrew: (text.match(/[\u05D0-\u05EA]/g) || []).length,
                latin: (text.match(/[a-zA-ZÀ-ÖØ-öø-ÿ]/g) || []).length,
              };

              const totalChars = text.replace(/\s/g, '').length || 1;
              const dominant = Object.entries(scriptCounts).sort((a, b) => b[1] - a[1])[0];
              const [dominantScript, dominantCount] = dominant;
              const dominantRatio = dominantCount / totalChars;

              const scriptToLang = {
                devanagari: 'hi-IN', arabic: 'ar-XA', urdu: 'ur-IN',
                cyrillic: 'ru-RU', hiragana: 'ja-JP', katakana: 'ja-JP',
                hangul: 'ko-KR', tamil: 'ta-IN', telugu: 'te-IN',
                kannada: 'kn-IN', malayalam: 'ml-IN', bengali: 'bn-IN',
                gujarati: 'gu-IN', gurmukhi: 'pa-IN', thai: 'th-TH',
                greek: 'el-GR', hebrew: 'he-IL',
              };

              if (dominantScript !== 'latin' && dominantRatio > 0.05 && scriptToLang[dominantScript]) {
                return scriptToLang[dominantScript];
              }
              if (dominantScript === 'cjkChinese' && dominantRatio > 0.05) {
                return (scriptCounts.hiragana + scriptCounts.katakana) > 3 ? 'ja-JP' : 'cmn-CN';
              }
              if (dominantScript === 'cyrillic' && dominantRatio > 0.05) {
                return (text.match(/[їієґ]/gi) || []).length > 2 ? 'uk-UA' : 'ru-RU';
              }

              // ── PHASE 2: Romanized Language Word-Frequency Scoring ───────────────
              // For Latin-script text, score against curated word lists.
              // This handles Hinglish, romanized Urdu, and other transliterated langs.
              const words = lowerText.match(/\b[a-z]{2,}\b/g) || [];
              if (words.length === 0) return audioLangCode || 'en-US';

              // Word sets for each romanized language — high-frequency, unambiguous words
              const romanizedWordSets = {
                'hi-IN': new Set([
                  // Verbs & conjugations
                  'hai', 'hain', 'tha', 'thi', 'the', 'hoga', 'hogi', 'raha', 'rahi', 'rahe',
                  'karna', 'karo', 'karo', 'kiya', 'ki', 'kar', 'karta', 'karti', 'karte',
                  'hota', 'hoti', 'hote', 'hona', 'jata', 'jati', 'jate', 'jana', 'aana',
                  'aata', 'aati', 'dena', 'deta', 'deti', 'lena', 'leta', 'leti', 'milna',
                  'chahiye', 'chahte', 'chahta', 'chahti', 'sochna', 'bolta', 'bolti',
                  'dekho', 'dekh', 'dekha', 'suno', 'sun', 'sunna', 'batao', 'bata',
                  // Pronouns & particles
                  'mein', 'main', 'hum', 'aap', 'tum', 'woh', 'yeh', 'ye', 'jo', 'wo',
                  'mujhe', 'mujhko', 'tumhe', 'unhe', 'use', 'ise', 'kuch', 'sab', 'koi',
                  // Question words
                  'kya', 'kyun', 'kaise', 'kaun', 'kahan', 'kab', 'kitna', 'kitni', 'kitne',
                  // Common connectors & misc
                  'aur', 'ya', 'lekin', 'par', 'magar', 'toh', 'toh', 'agar', 'jab', 'tab',
                  'phir', 'bhi', 'nahi', 'nhi', 'nahin', 'bilkul', 'bahut', 'bohot', 'thoda',
                  'bahot', 'zyada', 'kam', 'accha', 'achha', 'theek', 'sahi', 'galat',
                  'abhi', 'aaj', 'kal', 'sirf', 'bas', 'matlab', 'matlab', 'yaar', 'bhai',
                  'dost', 'pyaar', 'zindagi', 'duniya', 'waqt', 'time', 'kaam', 'kab',
                  // Responses
                  'haan', 'han', 'nahi', 'okay', 'achha', 'bilkul', 'zaroor', 'shukriya',
                  'dhanyavad', 'namaste', 'alag', 'saath', 'sath', 'pehle', 'baad',
                ]),
                'ur-IN': new Set([
                  'hai', 'hain', 'tha', 'thi', 'aur', 'ya', 'lekin', 'kyun', 'kya', 'kaise',
                  'mein', 'hum', 'aap', 'tum', 'woh', 'yeh', 'nahi', 'bilkul', 'bahut',
                  'agar', 'phir', 'bhi', 'abhi', 'aaj', 'kal', 'theek', 'shukriya',
                  'khuda', 'hafiz', 'inshallah', 'mashallah', 'subhanallah', 'alhamdulillah',
                  'janab', 'sahib', 'baat', 'baten', 'dil', 'ishq', 'mohabbat', 'aman',
                  'zindagi', 'duniya', 'log', 'waqt', 'khayal', 'zaroor', 'mehrbani',
                ]),
                'de-DE': new Set([
                  'ist', 'sind', 'war', 'waren', 'werden', 'wurde', 'haben', 'hat', 'hatte',
                  'ich', 'du', 'er', 'sie', 'wir', 'ihr', 'nicht', 'kein', 'aber', 'oder',
                  'und', 'auch', 'mit', 'von', 'zu', 'bei', 'nach', 'aus', 'als', 'wie',
                  'dass', 'wenn', 'dann', 'noch', 'schon', 'eine', 'einer', 'eines', 'dem',
                  'den', 'des', 'die', 'der', 'das', 'ein', 'auf', 'an', 'im', 'am',
                  'sehr', 'gut', 'mehr', 'sein', 'ihre', 'ihrer', 'unser', 'bitte', 'danke',
                ]),
                'fr-FR': new Set([
                  'est', 'sont', 'était', 'avoir', 'a', 'ont', 'vous', 'nous', 'ils', 'elles',
                  'je', 'tu', 'il', 'elle', 'pas', 'non', 'mais', 'ou', 'et', 'aussi',
                  'avec', 'de', 'du', 'des', 'les', 'une', 'un', 'le', 'la', 'dans',
                  'pour', 'sur', 'par', 'que', 'qui', 'quoi', 'comment', 'pourquoi', 'quand',
                  'très', 'bien', 'plus', 'mon', 'ma', 'mes', 'ton', 'ce', 'cet', 'cette',
                  'merci', 'oui', 'bonjour', 'au', 'aux', 'être', 'faire', 'aller',
                ]),
                'es-ES': new Set([
                  'es', 'son', 'está', 'están', 'era', 'fue', 'ser', 'estar', 'tener', 'tiene',
                  'yo', 'tú', 'él', 'ella', 'nosotros', 'vosotros', 'ellos', 'no', 'pero',
                  'que', 'qué', 'cómo', 'cuándo', 'dónde', 'quién', 'porque', 'para',
                  'con', 'sin', 'por', 'del', 'los', 'las', 'una', 'unos', 'unas',
                  'muy', 'más', 'bien', 'gracias', 'hola', 'sí', 'también', 'siempre',
                ]),
                'it-IT': new Set([
                  'è', 'sono', 'era', 'essere', 'avere', 'ha', 'hanno', 'ho', 'hai', 'siamo',
                  'io', 'tu', 'lui', 'lei', 'noi', 'voi', 'loro', 'non', 'ma', 'o', 'e',
                  'che', 'chi', 'come', 'quando', 'dove', 'perché', 'anche', 'con', 'per',
                  'una', 'uno', 'del', 'della', 'dei', 'degli', 'il', 'la', 'le', 'gli',
                  'molto', 'bene', 'grazie', 'ciao', 'sì', 'prego', 'sempre', 'ancora',
                ]),
                'pt-BR': new Set([
                  'é', 'são', 'está', 'estão', 'era', 'ser', 'estar', 'ter', 'tem', 'têm',
                  'eu', 'tu', 'ele', 'ela', 'nós', 'vocês', 'eles', 'não', 'mas', 'ou', 'e',
                  'que', 'quê', 'como', 'quando', 'onde', 'quem', 'porque', 'para', 'com',
                  'uma', 'um', 'dos', 'das', 'do', 'da', 'os', 'as', 'no', 'na',
                  'muito', 'bem', 'obrigado', 'olá', 'sim', 'também', 'sempre', 'ainda',
                ]),
                'tr-TR': new Set([
                  'bir', 'bu', 'da', 'de', 'den', 'dir', 'dır', 'dür', 'dùr', 'için', 'ile',
                  'mi', 'mu', 'mü', 'mı', 'ne', 'nin', 'nın', 'nun', 'nün', 'var', 'yok',
                  'ben', 'sen', 'o', 'biz', 'siz', 'onlar', 'ama', 've', 'veya', 'çok',
                  'iyi', 'evet', 'hayır', 'tamam', 'nasıl', 'neden', 'nerede', 'ne zaman',
                  'teşekkür', 'merhaba', 'güzel', 'büyük', 'küçük', 'şimdi', 'zaman',
                ]),
                'vi-VN': new Set([
                  'là', 'có', 'không', 'và', 'của', 'trong', 'với', 'các', 'một', 'những',
                  'được', 'cho', 'người', 'tôi', 'bạn', 'anh', 'chị', 'em', 'họ', 'chúng',
                  'này', 'đó', 'gì', 'nào', 'sao', 'khi', 'vì', 'để', 'đã', 'đang',
                  'rất', 'thì', 'mà', 'nhưng', 'hoặc', 'còn', 'cũng', 'nếu', 'thế', 'cần',
                ]),
                'id-ID': new Set([
                  'adalah', 'ada', 'dan', 'atau', 'tidak', 'bukan', 'dengan', 'untuk', 'dari',
                  'yang', 'ini', 'itu', 'di', 'ke', 'pada', 'oleh', 'akan', 'sudah', 'belum',
                  'saya', 'anda', 'kamu', 'dia', 'kami', 'kita', 'mereka', 'bisa', 'harus',
                  'sangat', 'juga', 'lagi', 'sudah', 'masih', 'pernah', 'selalu', 'kadang',
                  'bagaimana', 'mengapa', 'kapan', 'dimana', 'siapa', 'berapa', 'apa',
                  'terima', 'kasih', 'selamat', 'baik', 'senang', 'maaf', 'tolong',
                ]),
                'ms-MY': new Set([
                  'adalah', 'ada', 'dan', 'atau', 'tidak', 'bukan', 'dengan', 'untuk', 'dari',
                  'yang', 'ini', 'itu', 'di', 'ke', 'pada', 'oleh', 'akan', 'sudah', 'belum',
                  'saya', 'awak', 'kamu', 'dia', 'kami', 'kita', 'mereka', 'boleh', 'perlu',
                  'sangat', 'juga', 'lagi', 'masih', 'pernah', 'selalu', 'kadang',
                  'terima', 'kasih', 'selamat', 'baik', 'bagus', 'maaf', 'tolong', 'lah', 'la',
                ]),
                'fil-PH': new Set([
                  'ang', 'ng', 'mga', 'sa', 'na', 'at', 'ay', 'para', 'si', 'siya',
                  'ko', 'mo', 'niya', 'tayo', 'kami', 'kayo', 'sila', 'hindi', 'oo', 'ito',
                  'iyan', 'iyon', 'dito', 'diyan', 'doon', 'bakit', 'paano', 'sino', 'kailan',
                  'sobra', 'masaya', 'malaki', 'maliit', 'salamat', 'kumusta', 'maganda',
                ]),
                'nl-NL': new Set([
                  'is', 'zijn', 'was', 'waren', 'worden', 'heeft', 'hebben', 'had', 'kunnen',
                  'ik', 'jij', 'hij', 'zij', 'wij', 'jullie', 'niet', 'geen', 'maar', 'of', 'en',
                  'ook', 'met', 'van', 'te', 'bij', 'na', 'uit', 'als', 'hoe', 'wat', 'wie',
                  'dat', 'dit', 'die', 'de', 'het', 'een', 'meer', 'heel', 'goed', 'dank',
                ]),
                'pl-PL': new Set([
                  'jest', 'są', 'był', 'była', 'być', 'mam', 'masz', 'ma', 'mamy', 'mają',
                  'ja', 'ty', 'on', 'ona', 'my', 'wy', 'oni', 'nie', 'ale', 'lub', 'i', 'też',
                  'co', 'jak', 'kiedy', 'gdzie', 'kto', 'dlaczego', 'tu', 'tam', 'już', 'to',
                  'bardzo', 'dobrze', 'dziękuję', 'cześć', 'tak', 'też', 'zawsze', 'jeszcze',
                ]),
                'ko-KR': new Set([
                  // Romanized Korean (konglish / casual roman)
                  'annyeong', 'gamsahamnida', 'nae', 'ne', 'anieyo', 'iseo', 'isseo',
                  'hamnida', 'haeseo', 'gayo', 'wayo', 'juseyo', 'kamsahamnida', 'saranghae',
                  'oppa', 'unni', 'hyung', 'noona', 'aigoo', 'daebak', 'heol', 'mwo',
                ]),
              };

              // Score each language by counting matched words
              const scores = {};
              for (const [langCode, wordSet] of Object.entries(romanizedWordSets)) {
                let score = 0;
                for (const w of words) {
                  if (wordSet.has(w)) score++;
                }
                scores[langCode] = score;
              }

              // Find winner — must have at least 2 word hits and beat runner-up by 1
              const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
              const [topLang, topScore] = sorted[0];
              const runnerScore = sorted[1]?.[1] || 0;

              if (topScore >= 2 && topScore > runnerScore) {
                console.log(`[LANG] Romanized detection → ${topLang} (score:${topScore})`);
                return topLang;
              }

              // ── PHASE 3: User's Voice Settings → then English fallback ──────────
              return audioLangCode || 'en-US';
            };

            targetLang = detectLanguageFromText(cleanText);

            // Show loading with detected language
            const langLabels = {
              'hi-IN': 'Hindi', 'en-US': 'English (US)', 'en-GB': 'English (UK)',
              'en-AU': 'English (AU)', 'en-IN': 'English (IN)', 'ar-XA': 'Arabic',
              'ur-IN': 'Urdu', 'ru-RU': 'Russian', 'uk-UA': 'Ukrainian',
              'cmn-CN': 'Chinese (CN)', 'cmn-TW': 'Chinese (TW)', 'ja-JP': 'Japanese',
              'ko-KR': 'Korean', 'ta-IN': 'Tamil', 'te-IN': 'Telugu', 'kn-IN': 'Kannada',
              'ml-IN': 'Malayalam', 'bn-IN': 'Bengali', 'gu-IN': 'Gujarati',
              'pa-IN': 'Punjabi', 'mr-IN': 'Marathi', 'th-TH': 'Thai',
              'el-GR': 'Greek', 'he-IL': 'Hebrew', 'de-DE': 'German',
              'fr-FR': 'French', 'es-ES': 'Spanish', 'it-IT': 'Italian',
              'pt-BR': 'Portuguese', 'nl-NL': 'Dutch', 'pl-PL': 'Polish',
              'sv-SE': 'Swedish', 'nb-NO': 'Norwegian', 'da-DK': 'Danish',
              'fi-FI': 'Finnish', 'cs-CZ': 'Czech', 'sk-SK': 'Slovak',
              'ro-RO': 'Romanian', 'hu-HU': 'Hungarian', 'tr-TR': 'Turkish',
              'vi-VN': 'Vietnamese', 'id-ID': 'Indonesian', 'ms-MY': 'Malay',
              'fil-PH': 'Filipino', 'yue-HK': 'Cantonese',
            };
            // ── Integrated Voice Engine ──────────────────────────────────────────
            // Use the user's selected persona (e.g., Autonoe, Charon) but adapt to detected language
            const selectedVoicePersona = audioVoiceName.split('-Chirp3-HD-')[1] || 'Autonoe';
            const finalVoice = `${targetLang}-Chirp3-HD-${selectedVoicePersona}`;

            const response = await axios.post(apis.synthesizeFile, {
              introText: cleanText,
              languageCode: targetLang,
              voiceName: finalVoice,
              pitch: audioPitch,
              speakingRate: audioSpeed
            }, {
              responseType: 'arraybuffer',
              timeout: 60000,
              headers: { Authorization: `Bearer ${getUserData()?.token}` }
            });

            toast.dismiss('voice-loading');
            audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
          }

          // Save to Cache
          if (msgId && audioBlob) {
            audioCacheRef.current[msgId] = audioBlob;
          }
        }

        // Check if user stopped/switched while we were fetching
        if (currentSpeechResolverRef.current && currentSpeechResolverRef.current !== resolve) {
          console.log('[VOICE] Aborted playback - new task started');
          resolve();
          return;
        }

        // DOUBLE CHECK: Stop any existing audio before playing new one
        if (window.currentAudio) {
          window.currentAudio.pause();
          window.currentAudio = null;
        }

        const url = window.URL.createObjectURL(audioBlob);
        const audio = new Audio(url);

        window.currentAudio = audio;
        audioRef.current = audio;

        audio.onended = () => {
          window.URL.revokeObjectURL(url);
          if (window.currentAudio === audio) window.currentAudio = null;
          if (audioRef.current === audio) audioRef.current = null;
          resolve();
        };

        audio.onerror = (e) => {
          console.error(`[VOICE] Audio playback error:`, e);
          if (!readableAttachment) fallbackSpeak(cleanTextForTTS(text), targetLang);
          resolve();
        };

        await audio.play();

      } catch (err) {
        console.error('[VOICE] Synthesis failed:', err);
        toast.dismiss('voice-loading');
        // fallback logic...
        if (!attachments || attachments.length === 0) {
          // simple fallback
          // fallbackSpeak(...)
        }
        resolve();
      }
    });
  };

  const processSpeechQueue = async () => {
    if (isSpeakingRef.current || speechQueueRef.current.length === 0) return;

    isSpeakingRef.current = true;
    const task = speechQueueRef.current[0];

    setSpeakingMessageId(task.msgId);
    setIsPaused(false);

    try {
      await executeSpeak(task.text, task.language, task.msgId, task.attachments);
    } catch (e) {
      console.error(e);
    } finally {
      // Completed (or stopped)
      if (speechQueueRef.current.length > 0 && speechQueueRef.current[0] === task) {
        speechQueueRef.current.shift(); // Remove finished
      }
      isSpeakingRef.current = false;
      currentSpeechResolverRef.current = null;

      if (speechQueueRef.current.length > 0) {
        processSpeechQueue();
      } else {
        setSpeakingMessageId(null);
      }
    }
  };

  const stopCurrentSpeech = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (window.currentAudio) {
      window.currentAudio.pause();
      window.currentAudio = null;
    }
    window.speechSynthesis.cancel();

    // Resolve any pending promise
    if (currentSpeechResolverRef.current) {
      currentSpeechResolverRef.current();
      currentSpeechResolverRef.current = null;
    }
  };

  // Voice Output - Speak AI Response
  const speakResponse = async (text, language, msgId, attachments = [], force = false) => {
    // 1. Handle Toggle on the SAME message (Manual Click)
    // 1. Handle Toggle on the SAME message (Manual Click)
    if (force && speakingMessageId === msgId) {
      const activeAudio = audioRef.current || window.currentAudio;
      if (activeAudio) {
        if (!activeAudio.paused) {
          console.log(`[VOICE] Pausing message: ${msgId}`);
          activeAudio.pause();
          setIsPaused(true);
          return;
        } else {
          console.log(`[VOICE] Resuming message: ${msgId}`);
          await activeAudio.play();
          setIsPaused(false);
          return;
        }
      }
    }

    // 2. Force Mode (Manual Click on DIFFERENT message)
    if (force) {
      console.log(`[VOICE] Force playing new message: ${msgId}`);
      // Stop everything immediately
      stopCurrentSpeech();
      isSpeakingRef.current = false;

      // Clear queue
      speechQueueRef.current = [];

      // Add new task
      speechQueueRef.current.push({ text, language, msgId, attachments });

      // Start processing immediately
      processSpeechQueue();
      return;
    }

    // 3. Normal Enqueue (Auto-play flow)
    speechQueueRef.current.push({ text, language, msgId, attachments });
    if (!isSpeakingRef.current) {
      processSpeechQueue();
    }
  };

  const fallbackSpeak = (text, lang) => {
    console.log(`[VOICE] Using browser fallback for: ${lang}`);
    if (!window.speechSynthesis) {
      console.error('[VOICE] SpeechSynthesis not supported in this browser.');
      return;
    }

    // Cancel any existing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    // Find a better voice if possible
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
      console.log(`[VOICE] Browser fallback using voice: ${matchedVoice.name}`);
    }

    utterance.onstart = () => console.log('[VOICE] Browser speech started.');
    utterance.onend = () => console.log('[VOICE] Browser speech ended.');
    utterance.onerror = (e) => console.error('[VOICE] Browser speech error:', e);

    window.speechSynthesis.speak(utterance);
  };


  useEffect(() => {
    const loadSessions = async () => {
      const data = await chatStorageService.getSessions(currentProjectId);
      setSessions(data);

      // Fetch User Subscribed Agents
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user?.id || user?._id;
        if (userId) {
          try {
            const token = getUserData()?.token || localStorage.getItem("token");
            const res = await axios.post(apis.getUserAgents, { userId }, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const agents = res.data?.agents || [];
            // Add default AI Ads agent if not present
            const processedAgents = [{ agentName: 'AI Ads', category: 'General', avatar: '/AGENTS_IMG/AI Ads_BRAIN_LOGO.png' }, ...agents];
            setUserAgents(processedAgents);
          } catch (agentErr) {
            // Silently use defaults if fetch fails (no console warning)
            setUserAgents([{ agentName: 'AI Ads', category: 'General', avatar: '/AGENTS_IMG/AI Ads_BRAIN_LOGO.png' }]);
          }
        } else {
          // No user logged in, use default
          setUserAgents([{ agentName: 'AI Ads', category: 'General', avatar: '/AGENTS_IMG/AI Ads_BRAIN_LOGO.png' }]);
        }
      } catch (err) {
        // Silently handle errors
        setUserAgents([{ agentName: 'AI Ads', category: 'General', avatar: '/AGENTS_IMG/AI Ads_BRAIN_LOGO.png' }]);
      }
    };
    loadSessions();
  }, [messages, setSessions, currentProjectId]);

  const isNavigatingRef = useRef(false);

  useEffect(() => {
    const initChat = async () => {
      // If we just navigated from 'new' to a real ID in handleSendMessage,
      // don't clear the messages we already have in state.
      if (isNavigatingRef.current) {
        isNavigatingRef.current = false;
        return;
      }

      if (sessionId && sessionId !== 'new') {
        setCurrentSessionId(sessionId);
        console.log(`[DEBUG] Initializing chat for session: ${sessionId}`);
        const sessionData = await chatStorageService.getHistory(sessionId);
        console.log(`[DEBUG] Received history:`, sessionData);

        // --- CONTEXT SYNC ---
        // If the loaded session belongs to a project, ensure the project context is active
        // This solves the issue of chats "disappearing" from the sidebar list when navigating via URL/refresh
        if (sessionData.projectId && sessionData.projectId !== currentProjectId) {
          console.log(`[DEBUG] Syncing project context to: ${sessionData.projectId}`);
          setCurrentProjectId(sessionData.projectId);
        }

        const historyMessages = sessionData.messages || [];

        // Regenerate Blob URLs for audio conversions on load
        const processedHistory = historyMessages.map(msg => {
          // Ensure every message has a valid unique ID (backend might supply _id)
          if (!msg.id) {
            msg.id = (msg._id || Math.random().toString(36).substr(2, 9)).toString();
          }

          if (msg.conversion && msg.conversion.file) {
            try {
              // Only create if we don't have a CURRENT valid blob URL
              // (URLs stored in DB are strings that are invalid on reload)
              const byteChars = atob(msg.conversion.file);
              const byteNums = new Array(byteChars.length);
              for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
              const byteArray = new Uint8Array(byteNums);
              const blob = new Blob([byteArray], { type: msg.conversion.mimeType || 'audio/mpeg' });
              msg.conversion.blobUrl = URL.createObjectURL(blob);
            } catch (e) { console.error("Blob recovery failed:", e); }
          }
          return msg;
        });

        if (processedHistory && processedHistory.length > 0) {
          console.log(`[DEBUG] First message role: ${processedHistory[0].role}, content preview: ${processedHistory[0].content?.substring(0, 20)}`);
        }
        setMessages(processedHistory);

        // Populate suggestions from the last AI message if available
        if (processedHistory.length > 0) {
          const lastMsg = processedHistory[processedHistory.length - 1];
          if ((lastMsg.role === 'model' || lastMsg.role === 'assistant') && lastMsg.suggestions) {
            setSuggestions(lastMsg.suggestions);
          }
        }
      } else {
        setCurrentSessionId('new');

        // --- SMART WELCOME ---
        const user = getUserData();
        if (user && user.token) {
          try {
            const res = await axios.get(`${apis.baseUrl}/api/memory`, {
              headers: { Authorization: `Bearer ${user.token}` }
            });
            const mem = res.data;
            setMemoryRecoil(mem);

            if (mem && mem.isMemoryEnabled) {
              const name = mem.name || user.name || "friend";
              const business = mem.businessType;

              // If critical info is missing, show onboarding
              if (!mem.name && !mem.businessType && sessionId === 'new') {
                setShowOnboarding(true);
              }

              let greeting = `Hello ${name}! 👋 Welcome back. `;
              if (business) greeting += `How is everything going with your ${business} work? `;
              greeting += "I've loaded your context and I'm ready to assist. What can we achieve today?";

              setMessages([{
                id: 'welcome-' + Date.now(),
                role: 'model',
                content: greeting,
                timestamp: new Date()
              }]);
            } else {
              setMessages([]);
            }
          } catch (e) {
            setMessages([]);
          }
        } else {
          setMessages([]);
        }
      }

      setShowHistory(false);
    };
    initChat();
  }, [sessionId]);

  const chatContainerRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);
  const isStreamingRef = useRef(false); // true while AI is typing word-by-word

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      // Increased threshold (250px) to be less sensitive to minor scroll movements or large images
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 350;
      shouldAutoScrollRef.current = isNearBottom;
    }
  };

  const scrollToBottom = (force = false, behavior = 'auto') => {
    if ((force || shouldAutoScrollRef.current) && chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      const maxScrollTop = Math.max(0, scrollHeight - clientHeight);

      if (behavior === 'smooth') {
        chatContainerRef.current.scrollTo({ top: maxScrollTop + 100, behavior: 'smooth' }); // Add a bit of padding to be safe
      } else {
        chatContainerRef.current.scrollTop = maxScrollTop + 500; // Extra buffer to over-scroll
      }
    }
  };

  useEffect(() => {
    // Do NOT auto-scroll while AI is streaming text word-by-word
    if (isStreamingRef.current) return;
    scrollToBottom();
  }, [messages, isLoading]);

  const handleNewChat = async () => {
    navigate('/dashboard/chat/new');
    setShowHistory(false);
  };

  const { language: currentLang, t } = useLanguage();

  const handleDriveClick = () => {
    setIsAttachMenuOpen(false);
    // Simulating Drive Integration via Link
    const link = prompt("Paste your Google Drive File Link:");
    if (link) {
      setFilePreviews(prev => [...prev, {
        url: link,
        name: "Google Drive File",
        type: "application/vnd.google-apps.file",
        size: 0,
        isLink: true,
        id: Math.random().toString(36).substr(2, 9)
      }]);
      setSelectedFiles(prev => [...prev, { name: "Google Drive File", type: "link" }]);
    }
  };

  const isSendingRef = useRef(false);

  const handleSuggestionClick = (text) => {
    handleSendMessage(null, text);
  };

  const handleSendMessage = async (e, overrideContent, toolOverride = null) => {
    if (e) e.preventDefault();
    setSuggestions([]);

    // GLOBAL LOCK & DEBOUNCE (Combined with isSendingRef for maximum protection)
    const now = Date.now();
    if (isGlobalSending || (now - lastMessageSentTime < 800) || isSendingRef.current) {
      console.warn("[AI Ads] Message sending blocked by global lock, debounce, or active send.");
      return;
    }
    if (isLoading) return;

    // Mark as sending IMMEDIATELY to block any simultaneous calls (form submit + Enter key)
    isSendingRef.current = true;

    const contentToSend = typeof overrideContent === 'string' ? overrideContent : inputValue.trim();
    if (!contentToSend && filePreviews.length === 0) {
      isSendingRef.current = false;
      return;
    }

    // LOCK IMMEDIATELY
    isGlobalSending = true;
    lastMessageSentTime = now;
    setIsLoading(true);
    isSendingRef.current = true;

    // --- Proactive Magic Tool Activation Check Removed ---
    // Messages now flow to the backend normally.
    // The backend's adaptive system will handle tool restrictions based on the active mode.

    // --- Subscription Limit Checks ---
    let featureToTrack = 'chat';
    if (isDeepSearch || toolOverride === 'deep_search') featureToTrack = 'deepSearch';
    else if (isWebSearch || toolOverride === 'web_search') featureToTrack = 'webSearch';
    else if (isDocumentConvert || toolOverride === 'file_conversion') featureToTrack = 'document';
    else if (isCodeWriter || toolOverride === 'code_writer') featureToTrack = 'codeWriter';

    if (!checkLimitLocally(featureToTrack)) {
      isSendingRef.current = false;
      isGlobalSending = false;
      setIsLoading(false);
      return;
    }

    // ─── Smart Routing Interceptor (Pipeline System) ─────────────────────────
    // If a tool intent was detected with high confidence but not activated,
    // we route it through the pipeline instead of standard chat.
    if (intentSuggestion && !toolOverride && intentSuggestion.confidence > 0.85 && intentSuggestion.intent !== 'normal_chat') {
      // Check if ANY magic tool mode is already active
      const isCurrentModeChat = !isImageGeneration && !isVideoGeneration && !isDeepSearch && !isWebSearch &&
        !isMagicEditing && !isCodeWriter && !isFileAnalysis && !isAudioConvertMode &&
        !isDocumentConvert && !isVoiceMode;

      if (isCurrentModeChat) {
        console.log(`[IntentRouting] High confidence intent (${intentSuggestion.intent}) detected. Routing to pipeline.`);
        const activeSuggestion = intentSuggestion;
        setIntentSuggestion(null); // Clear state immediately

        handleAcceptSuggestion(activeSuggestion);
        // After switching mode, we recursively call handleSendMessage with the tool override
        setTimeout(() => {
          isSendingRef.current = false;
          isGlobalSending = false;
          setIsLoading(false);
          handleSendMessage(e, contentToSend, activeSuggestion.intent);
        }, 50);
        return;
      }
    }


    // (Removed duplicated routing block that bypassed try-catch locks)


    try {
      if (isAudioConvertMode && !contentToSend && selectedFiles.length === 0) {
        toast.error('Please enter text or upload a file to convert to audio');
        return;
      }

      if (isDocumentConvert && selectedFiles.length === 0) {
        toast.error('Please upload a PDF or DOCX file to convert');
        return;
      }

      // Special case for Audio Convert Mode: Handle files directly if present
      if (isAudioConvertMode && selectedFiles.length > 0) {
        let activeSessionId = currentSessionId;
        if (activeSessionId === 'new') {
          activeSessionId = await chatStorageService.createSession(currentProjectId);
          setCurrentSessionId(activeSessionId);
          isNavigatingRef.current = true;
          navigate(`/dashboard/chat/${activeSessionId}`, { replace: true });
        }
        const fileToConvert = selectedFiles[0];
        await manualFileToAudioConversion(fileToConvert, activeSessionId);
        setSelectedFiles([]);
        setFilePreviews([]);
        return;
      }

      // Special case for Audio Convert Mode: Handle text conversion
      if (isAudioConvertMode && contentToSend) {
        let activeSessionId = currentSessionId;
        if (activeSessionId === 'new') {
          activeSessionId = await chatStorageService.createSession(currentProjectId);
          setCurrentSessionId(activeSessionId);
          isNavigatingRef.current = true;
          navigate(`/dashboard/chat/${activeSessionId}`, { replace: true });
        }
        await manualTextToAudioConversion(contentToSend, activeSessionId);
        setInputValue('');
        return;
      }

      // isSendingRef already true
      setInputValue('');
      transcriptRef.current = '';

      let activeSessionId = currentSessionId;
      let isFirstMessage = false;

      // Stop listening if send is clicked
      if (isListening && recognitionRef.current) {
        isManualStopRef.current = true;
        recognitionRef.current.stop();
        setIsListening(false);
      }

      if (activeSessionId === 'new') {
        try {
          activeSessionId = await chatStorageService.createSession(currentProjectId);
          setCurrentSessionId(activeSessionId);
          isFirstMessage = true;
          isNavigatingRef.current = true;
          navigate(`/dashboard/chat/${activeSessionId}`, { replace: true });
        } catch (err) {
          console.error("Failed to create session:", err);
          toast.error('Failed to start a new chat session');
          return;
        }
      }

      // Handle AI Legal Mode (Specific Tool Execution)
      if (currentMode === 'LEGAL_TOOLKIT' && selectedLegalTool) {
        setLoadingText(`${selectedLegalTool.name}... ⚖️`);
        try {
          const userMsgId = Date.now().toString();
          const newUserMsg = {
            id: userMsgId,
            role: 'user',
            content: contentToSend,
            timestamp: new Date(),
            attachments: filePreviews.map(fp => ({
              url: fp.url,
              name: fp.name,
              type: fp.type.startsWith('image/') ? 'image' :
                fp.type.includes('pdf') ? 'pdf' :
                  fp.type.includes('word') || fp.type.includes('document') ? 'docx' : 'file'
            }))
          };
          setMessages(prev => [...prev, newUserMsg]);
          setInputValue('');
          handleRemoveFile();

          const res = await axios.post(`${API}/legal-toolkit/execute`, {
            message: contentToSend,
            toolName: selectedLegalTool.id,
            sessionId: activeSessionId,
            attachments: newUserMsg.attachments,
            conversationHistory: messages
          }, {
            headers: { Authorization: `Bearer ${getUserData()?.token}` }
          });

          if (res.data.success) {
            const aiMsgId = (Date.now() + 1).toString();
            const aiMsg = {
              id: aiMsgId,
              role: 'model',
              content: res.data.reply,
              timestamp: new Date(),
              toolUsed: res.data.toolUsed || selectedLegalTool.name
            };
            if (res.data.toolUsed) setActiveTool(res.data.toolUsed);
            setMessages(prev => [...prev, aiMsg]);
            await chatStorageService.saveMessage(activeSessionId, newUserMsg);
            await chatStorageService.saveMessage(activeSessionId, aiMsg);
            refreshSubscription();
          } else {
            throw new Error(res.data.error || 'Execution failed');
          }
          return;
        } catch (err) {
          console.error('[LegalToolkit Error]:', err);
          toast.error(err.message || 'Failed to execute legal tool');
          setIsLoading(false);
          isSendingRef.current = false;
          isGlobalSending = false;
          return;
        }
      }

      // Handle Image Generation Mode
      if (isImageGeneration || toolOverride === 'text_to_image') {
        await handleGenerateImage(contentToSend, activeSessionId);
        return;
      }

      // Handle Video Generation Mode
      if (isVideoGeneration || toolOverride === 'text_to_video' || toolOverride === 'image_to_video') {
        await handleGenerateVideo(contentToSend, activeSessionId);
        return;
      }

      // Handle Image Editing Mode
      if (isMagicEditing || toolOverride === 'image_edit') {
        await handleEditImage(contentToSend, activeSessionId);
        return;
      }

      // Handle AI CashFlow Mode
      if (isCashFlowMode || toolOverride === 'cashflow') {
        if (!selectedStock) {
          toast.error("Please select a stock from the search results first.");
          isSendingRef.current = false;
          setIsLoading(false);
          isGlobalSending = false;
          return;
        }
        await handleStockAnalysis(selectedStock, activeSessionId);
        return;
      }

      // Handle Voice Reader Mode - Just read, no AI response
      if (isVoiceMode) {
        try {
          // 1. Add User Message to UI
          const userMsgId = Date.now().toString();
          const newUserMsg = {
            id: userMsgId,
            role: 'user',
            content: contentToSend,
            timestamp: new Date(),
            attachments: filePreviews.map(fp => ({
              url: fp.url,
              name: fp.name,
              type: fp.type.startsWith('image/') ? 'image' :
                fp.type.includes('pdf') ? 'pdf' :
                  fp.type.includes('word') || fp.type.includes('document') ? 'docx' : 'file'
            }))
          };
          setMessages(prev => [...prev, newUserMsg]);

          // 2. Clear inputs
          setInputValue('');
          handleRemoveFile();
          if (inputRef.current) inputRef.current.style.height = 'auto';

          // 3. Trigger voice reading directly (no AI response)
          setTimeout(() => {
            console.log('[Voice Mode] Reading content with attachments:', newUserMsg.attachments);
            speakResponse(contentToSend, audioLangCode, userMsgId, newUserMsg.attachments);
          }, 300);

          return; // STOP - Don't call AI API
        } catch (err) {
          console.error('[Voice Mode Error]:', err);
          toast.error('Failed to read content');
          return;
        }
      }


      // [SMART FORMATTING]: If input is long code, automatically wrap in backticks for structured display
      let displayContent = contentToSend;
      const hasCodeStructure = (contentToSend?.split('\n').length || 0) >= 6 &&
        (/function\s*\(|const\s+\w+\s*=|class\s+\w+|import\s+.*from|<\w+>|{\s*\w+:|\/\/|\/\*/.test(contentToSend));

      if (hasCodeStructure && contentToSend && !contentToSend.trim().startsWith('```')) {
        let detectedLang = 'javascript'; // Default for web-centric AI Ads
        const low = contentToSend.toLowerCase();
        if (low.includes('def ') || low.includes('import os') || low.includes('np.') || low.includes('pd.')) detectedLang = 'python';
        else if (low.includes('<html>') || low.includes('<!doctype html>')) detectedLang = 'html';
        else if (low.includes('select * from') || low.includes('create table')) detectedLang = 'sql';
        else if (low.includes('public static void main')) detectedLang = 'java';

        displayContent = `\`\`\`${detectedLang}\n${contentToSend.trim()}\n\`\`\``;
      }

      const userMsg = {
        id: Date.now().toString(),
        role: 'user',
        content: displayContent || (filePreviews.length > 0 ? (isDocumentConvert ? "Convert this document" : "Analyze these files") : ""),
        timestamp: Date.now(),
        projectId: currentProjectId,
        attachments: filePreviews.map(p => ({
          url: p.url,
          name: p.name,
          type: p.type.startsWith('image/') ? 'image' :
            p.type.includes('pdf') ? 'pdf' :
              p.type.includes('word') || p.type.includes('document') ? 'docx' :
                p.type.includes('excel') || p.type.includes('spreadsheet') ? 'xlsx' :
                  p.type.includes('powerpoint') || p.type.includes('presentation') ? 'pptx' : 'file'
        })),
        agentName: activeAgent.agentName || activeAgent.name,
        agentCategory: activeAgent.category
      };

      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      // Double-attempt auto-scroll for user message to ensure it handles layout changes correctly
      setTimeout(() => scrollToBottom(true, 'smooth'), 50);
      setTimeout(() => scrollToBottom(true, 'smooth'), 400);
      setInputValue('');

      // Capture mode states before resetting
      const deepSearchActive = isDeepSearch;
      const documentConvertActive = isDocumentConvert;
      const webSearchActive = isWebSearch;
      const imageGenActive = isImageGeneration;
      const videoGenActive = isVideoGeneration;
      const magicEditActive = isMagicEditing; // New: capture magic edit state
      const codeWriterActive = isCodeWriter; // Added: capture code writer state
      // Note: We don't reset these state immediately anymore so the tag stays visible in input bar while "Thinking..."

      // Detect mode for UI indicator
      const detectedMode = magicEditActive ? MODES.IMAGE_EDIT :
        (isFileAnalysis ? MODES.FILE_ANALYSIS :
          (deepSearchActive ? MODES.DEEP_SEARCH :
            (documentConvertActive ? MODES.DOCUMENT_CONVERT :
              (webSearchActive ? MODES.WEB_SEARCH :
                (codeWriterActive ? MODES.CODING_HELP :
                  (currentMode === 'LEGAL_TOOLKIT' ? MODES.LEGAL_TOOLKIT :
                    detectMode(contentToSend, userMsg.attachments)))))));

      setCurrentMode(detectedMode);

      // Update user message with the detected mode
      userMsg.mode = detectedMode;

      // Determine loading intent for UI feedback (Strictly based on active mode/card)
      if (imageGenActive) {
        setLoadingText("Generating Image... 🎨");
      } else if (magicEditActive) {
        setLoadingText("Editing Image... ✨");
      } else if (videoGenActive) {
        setLoadingText("Generating Video... 🎥");
      } else if (documentConvertActive) {
        setLoadingText("Converting Document... 🔄");
      } else if (isFileAnalysis) {
        setLoadingText("Analyzing Document... 📄");
      } else if (deepSearchActive || webSearchActive) {
        setLoadingText("Searching the web... 🌐");
      } else if (codeWriterActive) {
        setLoadingText("Writing Code... 💻");
      } else {
        setLoadingText("Thinking...");
      }

      handleRemoveFile(); // Clear file after sending
      setIsLoading(true);

      try {
        // Include projectId in the message object for local storage and sync
        userMsg.projectId = currentProjectId;
        await chatStorageService.saveMessage(activeSessionId, userMsg);

        if (isFirstMessage) {
          // Navigation already handled above

          // REAL-TIME TITLE GENERATION (Parallel - Match ChatGPT behavior)
          chatStorageService.generateSessionTitle(activeSessionId, userMsg.content).then(newTitle => {
            if (newTitle) {
              setSessions(prev => {
                const currentSessions = Array.isArray(prev) ? prev : [];
                const idx = currentSessions.findIndex(s => s.sessionId === activeSessionId);
                if (idx !== -1) {
                  const updated = [...currentSessions];
                  if (updated[idx].title !== newTitle) {
                    updated[idx] = { ...updated[idx], title: newTitle, lastModified: Date.now() };
                    return [...updated].sort((a, b) => b.lastModified - a.lastModified);
                  }
                  return currentSessions;
                } else {
                  return [{ sessionId: activeSessionId, title: newTitle, lastModified: Date.now() }, ...currentSessions];
                }
              });
            }
          });
        }

        // Send to AI for response
        const caps = getAgentCapabilities(activeAgent.agentName, activeAgent.category);

        // Create abort controller for this request
        abortControllerRef.current = new AbortController();

        // ---------------------------------------------------------
        //  CONSTRUCT SYSTEM INSTRUCTION BASED ON PROFILE SETTINGS
        // ---------------------------------------------------------
        const pGeneral = personalizations?.general || {};
        const pStyle = personalizations?.personalization || {};
        const pParental = personalizations?.parentalControls || {};

        let PERSONA_INSTRUCTION = "- FORMAT: Always use Markdown tables and structured formatting thoughtfully whenever presenting comparisons, structured data, or lists of items with multiple attributes.\n";

        // 1. STYLE & FONT (Font is UI only, but we can hint at TONE)
        if (pStyle.fontStyle && pStyle.fontStyle !== 'Default') {
          // No direct AI instruction needed for font family, but we can adjust tone if needed
        }

        // 2. CHARACTERISTICS
        if (pStyle.enthusiasm) PERSONA_INSTRUCTION += `- Enthusiasm Level: ${pStyle.enthusiasm}\n`;
        if (pStyle.formality) PERSONA_INSTRUCTION += `- Formality Level: ${pStyle.formality}\n`;
        if (pStyle.creativity) PERSONA_INSTRUCTION += `- Creativity Level: ${pStyle.creativity}\n`;

        // 3. FORMATTING
        if (pStyle.structuredResponses) PERSONA_INSTRUCTION += "- FORMAT: Use clear Headers, Sections, and structured layouts.\n";
        if (pStyle.bulletPoints) PERSONA_INSTRUCTION += "- FORMAT: Prioritize Bullet Points and Lists over paragraphs.\n";

        // 4. EMOJI USAGE
        if (pStyle.emojiUsage) {
          if (pStyle.emojiUsage === 'None') PERSONA_INSTRUCTION += "- EMOJIS: Do NOT use any emojis or icons.\n";
          else if (pStyle.emojiUsage === 'Minimal') PERSONA_INSTRUCTION += "- EMOJIS: Use very few emojis, only where absolutely necessary.\n";
          else if (pStyle.emojiUsage === 'Moderate') PERSONA_INSTRUCTION += "- EMOJIS: Use a moderate amount of relevant emojis.\n";
          else if (pStyle.emojiUsage === 'Expressive') PERSONA_INSTRUCTION += "- EMOJIS: Use emojis frequently to be engaging and expressive.\n";
        }

        // 5. CUSTOM INSTRUCTIONS override
        if (pStyle.customInstructions) {
          PERSONA_INSTRUCTION += `\n### USER CUSTOM INSTRUCTIONS (HIGHEST PRIORITY):\n${pStyle.customInstructions}\n`;
        }

        // 6. PARENTAL / SAFETY
        if (pParental.contentFilter) {
          PERSONA_INSTRUCTION += `\n### SAFETY MODE: STRICT\n- Absolutely NO mature, violent, or explicit content.\n- If user asks for such, politley decline.\n`;
        }
        if (pParental.ageCategory === 'Child') {
          PERSONA_INSTRUCTION += `- SIMPLIFY language for a Child.\n- Be encouraging and safe.\n`;
        }

        // 7. LANGUAGE
        // We already have language detection, but let's reinforce if set strictly
        if (pGeneral.language && pGeneral.language !== 'Auto-Detect') {
          PERSONA_INSTRUCTION += `\n### REQUIRED LANGUAGE:\n- Respond ONLY in ${pGeneral.language}.\n`;
        }

        // 8. TEXT SIZE / ACCESSIBILITY (Frontend only mostly, but hint AI)
        if (pStyle.fontSize === 'Large' || pStyle.fontSize === 'Extra Large' || pGeneral.highContrast) {
          PERSONA_INSTRUCTION += `- FORMAT: Use shorter sentences and very clear structure for readability.\n`;
        }

        const SYSTEM_INSTRUCTION = `
You are AISA™, the official AI assistant of the AISA™ platform. Powered by A-Series.
${activeAgent.category ? `Your specialization is in ${activeAgent.category}.` : ''}

### CRITICAL BRAND RULE:
Whenever a user mentions "AISA", "AISA AI", "AISA app", "your image", "your video", "AISA image", "AISA video", or refers to AISA in third person, you MUST interpret it as referring to THIS platform (AISA™ brand identity), not a generic artificial intelligence.

### SELF-REFERENCE DETECTION & CONTENT GENERATION:
1. If user says:
   - "Generate AISA image", "Create image of AISA", "Make AISA logo", "AISA ka photo banao", "AISA ka video generate karo", "Your intro video banao", "AISA introduction video"
   → You must generate content representing the official AISA™ brand.

2. AISA Brand Identity:
   - Futuristic AI assistant
   - Glowing blue/purple neural brain logo
   - Modern, premium, intelligent
   - Clean UI dashboard style
   - Advanced AI Super Assistant
   - Indian tech startup vibe (global level) — Note: Always fulfill technical requirements while matching the user's language.

3. If user asks for:
   - Image → Generate/Ask for a brand-based promotional visual
   - Video → Generate/Ask for a cinematic AI intro script for AISA™
   - Logo → Generate/Ask for a modern AI tech logo concept
   - Poster → Promotional marketing poster content
   - Reel → Social media promotional script

4. Never treat “AISA” as a random AI. Always treat it as THIS official platform.

5. If user intent is unclear, ask: "Are you referring to the official AISA™ platform?"

${PERSONA_INSTRUCTION}

### CRITICAL LANGUAGE RULE:
**MANDATORY: ALWAYS respond in the EXACT SAME LANGUAGE as the user's latest message.**
- If user writes in ENGLISH, you MUST respond in ENGLISH. (Highest Priority)
- If user writes in HINDI (Devanagari or Romanized), respond in HINDI (Romanized script).
- Match the user's script and tongue exactly. Do NOT use Hinglish if they ask in pure English.
- If user mixes languages, prioritize the dominant language.

### RESPONSE BEHAVIOR:
- Answer the user's question directly without greeting messages
- Do NOT say "Hello... welcome to AI Ads" or similar greetings
- Focus ONLY on providing the answer to what user asked
- Be helpful, clear, and concise

### STREAMING BEHAVIOR:
- Generate responses in smooth, continuous stream
- Use short paragraphs for readability
- If interrupted, stop immediately without completing sentence
- Do NOT add summaries or closing lines after interruption
- Resume ONLY if user explicitly asks again

${filePreviews.length > 0 ? `### MULTI-FILE ANALYSIS MANDATE (STRICT 1:1 RULE):
You have received exactly ${filePreviews.length} file(s).
You MUST provide exactly ${filePreviews.length} distinct analysis blocks.

CRITICAL RULES:
1.  **NO MERGING**: Do NOT combine files into a single "Chapter" or "Section".
2.  **NO SKIPPING**: If 2 files are uploaded, you MUST output 2 analysis blocks.
3.  **SEPARATE ENTITIES**: Treat each file as a completely independent document requiring its own full answer.
4.  **DELIMITER MANDATORY**: Use the delimiter below to separate EACH file's answer.

REQUIRED OUTPUT FORMAT:
[Optional brief greeting]

---SPLIT_RESPONSE---
**Analysis of: {Filename 1}**
[Full detailed answer/analysis for File 1]

---SPLIT_RESPONSE---
**Analysis of: {Filename 2}**
[Full detailed answer/analysis for File 2]

(Repeat strictly for ALL ${filePreviews.length} files)` : ''}

### RESPONSE FORMATTING RULES (STRICT):
1.  **Structure**: ALWAYS use Markdown headers (# for main, ## for sub-sections) for section titles. Do NOT use bullets for these headers.
2.  **Lists**: Use Bullet Points only for actual lists of multiple points. Avoid putting section titles inside a list.
3.  **Highlights**: Bold key terms and important concepts within sentences.
4.  **Summary**: Include a "One-line summary" or "Simple definition" at the start or end where appropriate.
5.  **Emojis**: Use relevant emojis.

### FINANCIAL & INVOICE ANALYSIS RULES (MANDATORY):
When summarizing or extracting data from Invoices, Receipts, or Financial Documents:
1. **CRITICAL**: You MUST **bold** ALL monetary amounts (e.g., **INR 1,41,954.00**, **$500.00**).
2. **CRITICAL**: You MUST **bold** ALL Entity/Person Names (e.g., **PRAHALAD AHUJA HUF**, **Amazon Inc**).
3. **CRITICAL**: You MUST **bold** ALL Dates, Invoice Numbers, and distinct identifiers (GSTIN/PAN).
4. **Format**: Present extracted data in a clean **Bullet List** or **Table** for immediate readability.

${caps.canUploadImages ? `IMAGE ANALYSIS CAPABILITIES:
- You have the ability to see and analyze images provided by the user.` : ''}

${caps.canUploadDocs ? `DOCUMENT ANALYSIS CAPABILITIES:
- You can process and extract text from PDF, Word (Docx), and Excel files provided as attachments.` : ''}

${activeAgent.instructions ? `SPECIFIC AGENT INSTRUCTIONS:
${activeAgent.instructions}` : ''}

${deepSearchActive ? `### DEEP SEARCH MODE ENABLED (CRITICAL):
- The user has requested an EXHAUSTIVE DEEP SEARCH.
- Your response MUST be extremely long, detailed, and comprehensive.
- Provide in-depth analysis, historical context, current trends, and future implications where applicable.
- YOU MUST perform extensive web searching to gather every relevant detail.
- Do NOT be brief. Expand on every point. Use multiple sections and subsections.
- Clearly structure your findings with professional formatting and cite sources if possible.` : ''}

${documentConvertActive ? `### DOCUMENT CONVERSION MODE ENABLED (CRITICAL):
- The user wants to convert the uploaded document.
- Identify the source file format (PDF/DOCX) and the requested target format.
- IF the user does NOT specify a target format:
  - If source is PDF, suggest converting to DOCX.
  - If source is DOCX, suggest converting to PDF.
- YOU MUST provide the conversion parameters in the following JSON format:
\`\`\`json
{
  "action": "file_conversion",
  "source_format": "pdf",
  "target_format": "docx",
  "file_name": "original_filename.pdf"
}
\`\`\`
- Keep the response text brief, explaining what you are doing.` : ''}
`;
        // Default AI message sending
        // If magic editing is active, ensure the ref image is included in attachments
        let finalAttachments = userMsg.attachments || [];
        if (magicEditActive && editRefImage && !finalAttachments.some(a => a.url === editRefImage.url)) {
          finalAttachments = [...finalAttachments, editRefImage];
        }

        const suggestedAiId = `ai-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

        const aiResponseData = await generateChatResponse(
          messages,
          userMsg.content,
          SYSTEM_INSTRUCTION + getSystemPromptExtensions(),
          finalAttachments,
          currentLang,
          abortControllerRef.current.signal,
          detectedMode,
          activeSessionId,
          currentProjectId,
          userMsg.id,
          suggestedAiId,
          imageAspectRatio,
          imageModelId
        );

        // Store it for usage in the typewriter loop
        const apiResponseId = suggestedAiId;

        // --- REAL-TIME TITLE SYNC ---
        if (aiResponseData && aiResponseData.title) {
          const generatedTitle = aiResponseData.title;

          // 1. Update global recoil state for instant sidebar refresh
          setSessions(prev => {
            const currentSessions = Array.isArray(prev) ? prev : [];
            const exists = currentSessions.findIndex(s => s.sessionId === activeSessionId);

            if (exists !== -1) {
              const updated = [...currentSessions];
              if (updated[exists].title !== generatedTitle) {
                updated[exists] = { ...updated[exists], title: generatedTitle, lastModified: Date.now() };
                return [...updated].sort((a, b) => b.lastModified - a.lastModified);
              }
              return currentSessions;
            } else {
              return [{
                sessionId: activeSessionId,
                title: generatedTitle,
                lastModified: Date.now()
              }, ...currentSessions];
            }
          });

          // 2. Persist to local storage meta
          chatStorageService.updateSessionTitle(activeSessionId, generatedTitle);
        }

        if (aiResponseData && aiResponseData.error === "LIMIT_REACHED") {
          setIsLimitReached(true);
          setIsLoading(false);
          isSendingRef.current = false;
          return;
        }

        // Out of credits — popup already shown by geminiService, just stop gracefully
        if (aiResponseData && (aiResponseData.error === "OUT_OF_CREDITS" || aiResponseData.error === "PREMIUM_ONLY")) {
          setIsLoading(false);
          isSendingRef.current = false;
          // Remove the placeholder loading message if added
          setMessages(prev => prev.filter(m => !m.isProcessing && !m.isLoading));
          return;
        }


        // Handle response - could be string (old format) or object (new format with conversion)
        let aiResponseText = '';
        let conversionData = null;
        let aiVideoUrl = null;
        let aiImageUrl = null;
        let isRealTimeResponse = false;
        let responseSources = [];

        if (typeof aiResponseData === 'string') {
          aiResponseText = aiResponseData;
        } else if (aiResponseData && typeof aiResponseData === 'object') {
          // Compatibility with both 'reply' and 'data' properties from backend
          aiResponseText = aiResponseData.reply || aiResponseData.data || "No response generated.";
          conversionData = aiResponseData.conversion || null;
          isRealTimeResponse = aiResponseData.isRealTime || false;
          responseSources = aiResponseData.sources || [];
          // Extract media URLs if present
          aiVideoUrl = aiResponseData.videoUrl || null;
          aiImageUrl = aiResponseData.imageUrl || null;
          const aiSnapshotData = aiResponseData.snapshot || null;

          // If backend provided specific error details, show them to help user understand why 'brain' is failing
          if (aiResponseData.error && aiResponseData.details) {
            console.error("[AI Ads Backend Error]", aiResponseData.details);
            // Append a small subtle hint for the developer/user
            aiResponseText += `\n\n*(Debug: ${aiResponseData.details})*`;
          }
        } else {
          aiResponseText = "Sorry, I encountered an issue while generating a response. Please try again.";
        }

        if (aiResponseText === "dbDemoModeMessage") {
          aiResponseText = t('dbDemoModeMessage');
        }

        // Check for multiple file analysis headers to split into separate cards
        // IMPORTANT: Only split when 2+ files are attached to prevent double responses
        // on normal chat when AI accidentally includes the delimiter
        const delimiter = '---SPLIT_RESPONSE---';
        let responseParts = [];

        const hasMultipleFiles = filePreviews.length >= 2;
        if (hasMultipleFiles && aiResponseText && aiResponseText.includes(delimiter)) {
          const rawParts = aiResponseText.split(delimiter).filter(p => p && p.trim().length > 0);
          responseParts = rawParts.length > 0 ? rawParts.map(part => part.trim()) : [aiResponseText];
        } else {
          // Single response — strip the delimiter if AI accidentally included it
          const cleanedText = (aiResponseText || "No response generated.").replace(/---SPLIT_RESPONSE---/g, '').trim();
          responseParts = [cleanedText || "No response generated."];
        }

        // Process response parts and add to messages
        for (let i = 0; i < responseParts.length; i++) {
          const partContent = responseParts[i];
          if (!partContent) continue;

          const msgId = (i === 0 && typeof apiResponseId !== 'undefined') ? apiResponseId : (Date.now() + 1 + i).toString();
          const modelMsg = {
            id: msgId,
            role: 'model',
            content: '', // Start empty for typewriter effect
            isRealTime: isRealTimeResponse,
            sources: responseSources,
            error: !!aiResponseData?.error, // Track if this is an error bubble
            timestamp: Date.now() + i * 100,
            projectId: currentProjectId,
            conversion: conversionData,
            imageUrl: aiImageUrl,
            videoUrl: aiVideoUrl
          };

          // Add the empty message structure to UI
          setMessages((prev) => [...prev, modelMsg]);
          setTypingMessageId(msgId); // Mark this message as typing

          // Typewriter effect simulation
          const words = partContent.split(' ');
          let displayedContent = '';

          // Decide speed based on length (shorter = slower, longer = faster)
          const delay = words.length > 200 ? 10 : (words.length > 50 ? 20 : 35);

          // Typewriter effect simulation — lock auto-scroll during streaming
          isStreamingRef.current = true;

          for (let j = 0; j < words.length; j++) {
            // Check if generation was stopped by user
            if (!isSendingRef.current) break;

            displayedContent += (j === 0 ? '' : ' ') + words[j];

            // Update UI with the current chunk
            setMessages((prev) =>
              prev.map(m => m.id === msgId ? { ...m, content: displayedContent } : m)
            );

            // Wait before next word
            await new Promise(resolve => setTimeout(resolve, delay));
          }

          // Streaming done — unlock auto-scroll
          isStreamingRef.current = false;

          if (!isSendingRef.current) {
            setTypingMessageId(null);
            return; // Exit function if stopped
          }

          setTypingMessageId(null); // Clear typing status

          // Add conversion data and media if available
          const finalModelMsg = { ...modelMsg, content: partContent };
          if (i === 0) {
            if (conversionData) finalModelMsg.conversion = conversionData;
            if (aiVideoUrl) finalModelMsg.videoUrl = aiVideoUrl;
            if (aiImageUrl) finalModelMsg.imageUrl = aiImageUrl;
            finalModelMsg.isRealTime = isRealTimeResponse;
            finalModelMsg.sources = responseSources;
            if (aiResponseData.snapshot) finalModelMsg.snapshot = aiResponseData.snapshot;
          }

          // Set Smart Suggestions for the last response part
          if (i === responseParts.length - 1) {
            const hasSmartSuggestions = aiResponseData?.suggestions && Array.isArray(aiResponseData.suggestions) && aiResponseData.suggestions.length > 0;
            const finalSuggestions = hasSmartSuggestions ? aiResponseData.suggestions : [
              "Explain in simple terms",
              "Give examples",
              "Summarize this"
            ];
            const trimmedSuggestions = finalSuggestions.slice(0, 3);
            finalModelMsg.suggestions = trimmedSuggestions;
            setSuggestions(trimmedSuggestions);
          }

          // After typing is complete, save the full message to history
          await chatStorageService.saveMessage(activeSessionId, finalModelMsg);

          // Refresh usage counts after successful generation
          refreshSubscription();

          // CRITICAL: Update the state with the final message including suggestion data
          setMessages((prev) =>
            prev.map(m => m.id === msgId ? finalModelMsg : m)
          );
          scrollToBottom(); // Single scroll after full generation

          // Speak the AI response if user used voice input
          if (i === 0 && voiceUsedRef.current) {
            const detectedLang = aiResponseData?.language || currentLang;
            speakResponse(partContent, detectedLang);
            voiceUsedRef.current = false; // Reset flag
          }
        }
      } catch (innerError) {
        console.error("Storage/API Error:", innerError);
      }
    } catch (error) {
      // Handle abort errors silently (user stopped generation)
      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        console.log('Generation stopped by user');
        // Keep partial response, don't show error
        return;
      }

      console.error("Chat Error:", error);
      toast.error(`Error: ${error.message || "Failed to send message"}`);
    } finally {
      setIsLoading(false);
      isSendingRef.current = false;
      isGlobalSending = false; // RELEASE GLOBAL LOCK
      abortControllerRef.current = null; // Clean up abort controller
    }
  };

  const handleDeleteSession = (e, id) => {
    e.stopPropagation();
    setDeleteConfig({
      isOpen: true,
      title: "Delete Chat History?",
      description: "Are you sure you want to delete this entire chat history? This action cannot be undone and all messages will be lost.",
      onConfirm: async () => {
        await chatStorageService.deleteSession(id);
        const data = await chatStorageService.getSessions(currentProjectId);
        setSessions(data);
        if (currentSessionId === id) {
          navigate('/dashboard/chat/new');
        }
        toast.success("Chat history deleted");
      }
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getAgentCapabilities = (agentName, category) => {
    const name = (agentName || '').toLowerCase();
    const cat = (category || '').toLowerCase();

    // Default: Everything enabled for AI Ads
    if (name === 'AI Ads' || !name) {
      return {
        canUploadImages: true,
        canUploadDocs: true,
        canVoice: true,
        canVideo: true,
        canCamera: true
      };
    }

    const caps = {
      canUploadImages: true,
      canUploadDocs: true,
      canVoice: true,
      canVideo: true,
      canCamera: true
    };

    // Specific logic per category/name
    if (cat.includes('hr') || cat.includes('finance') || name.includes('doc') || name.includes('legal')) {
      caps.canVideo = false;
      caps.canCamera = false;
      caps.canUploadImages = false;
    } else if (cat.includes('design') || cat.includes('creative') || name.includes('photo')) {
      caps.canVoice = false;
      caps.canVideo = false;
      caps.canUploadDocs = false;
    } else if (name.includes('voice') || name.includes('call') || name.includes('bot')) {
      caps.canUploadImages = false;
      caps.canUploadDocs = false;
      caps.canCamera = false;
      caps.canVideo = false;
    } else if (cat.includes('medical') || cat.includes('health')) {
      caps.canVideo = false;
      caps.canUploadImages = true;
    }

    return caps;
  };

  const handleDownload = async (url, filename) => {
    if (isDownloadingUrl === url) return;
    setIsDownloadingUrl(url);
    const downloadToast = toast.loading("Preparing download...");

    // Use proxy for download as well to avoid "No-CORS" blocks during fetch
    const downloadUrl = `${apis.imageProxy}?url=${encodeURIComponent(url)}`;

    try {
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'AI Ads-download.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Download started!", { id: downloadToast });
    } catch (error) {
      console.error('Download failed even with proxy:', error);
      toast.error("Download failed", { id: downloadToast });
      // Ultimate Fallback: Try opening in new tab
      window.open(url, '_blank');
    } finally {
      setIsDownloadingUrl(null);
    }
  };

  const handleImageAction = (action) => {
    if (selectedFiles.length === 0) return;

    let command = '';
    switch (action) {
      case 'remove-bg':
        command = 'Remove the background and clean up this image.';
        break;
      case 'remix':
        command = 'Create a stunning new image based on this attachment. Here are the details: ';
        break;
      case 'enhance':
        command = 'Analyze the attached image and generate a higher quality version of it.';
        break;
      default:
        break;
    }
    setInputValue(command);

    if (action === 'remix') {
      inputRef.current?.focus();
      toast.success("Describe your changes and hit send!");
    } else {
      toast.success(`${action.replace('-', ' ')} processing...`);
      setLoadingText(`Processing ${action.replace('-', ' ')}... 🖼️`);
      setTimeout(() => handleSendMessage(), 100);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };


  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState("");

  // Feedback State
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackMsgId, setFeedbackMsgId] = useState(null);
  const [feedbackCategory, setFeedbackCategory] = useState([]);
  const [activeMessageId, setActiveMessageId] = useState(null);
  const [feedbackDetails, setFeedbackDetails] = useState("");
  const [loadingText, setLoadingText] = useState("Thinking..."); // New state for loading status text
  const [messageFeedback, setMessageFeedback] = useState({}); // { [msgId]: { type: 'up' | 'down', categories: [], details: '' } }
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const toggleFeedback = (msgId, feedbackData) => {
    setMessageFeedback(prev => {
      // If it's the same type and no extra data (categories), toggle it off
      if (prev[msgId]?.type === feedbackData.type && (!feedbackData.categories || feedbackData.categories.length === 0)) {
        const { [msgId]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [msgId]: feedbackData
      };
    });
  };

  const handlePdfAction = async (action, msg) => {
    // Instant Share/Copy if PDF is already pre-generated
    if ((action === 'share' || action === 'copy') && pregeneratedPdfs[msg.id]) {
      const file = pregeneratedPdfs[msg.id];

      if (action === 'copy') {
        try {
          if (!window.ClipboardItem) throw new Error("ClipboardItem not supported");

          const cleanText = msg.content
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/### (.*)/g, '$1')
            .replace(/\[(.*?)\]\((.*?)\)/g, '$1 ($2)');

          // We try to put both PDF and Text in the clipboard
          // Apps like WhatsApp Desktop might pick the PDF, others will pick the text
          const item = new ClipboardItem({
            ['application/pdf']: Promise.resolve(file),
            ['text/plain']: new Blob([cleanText], { type: 'text/plain' })
          });

          await navigator.clipboard.write([item]);
          toast.success("PDF aur Text copy ho gaya! 📋 Ab aap WhatsApp ya kisi bhi app mein Paste kar sakte hain.");
          return;
        } catch (err) {
          console.warn("Direct PDF copy failed, falling back to text only:", err);
          await navigator.clipboard.writeText(msg.content);
          toast.success("Text copy ho gaya! (PDF copy browser mein limited hai)");
          return;
        }
      }

      // Try native share (works on mobile)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: file.name || 'AI Ads Document',
            text: 'Converted Document from AI Ads'
          });
          return;
        } catch (err) {
          if (err.name === 'AbortError') return; // User cancelled
          // Native share failed for other reason — open in new tab as fallback
        }
      }
      // Desktop / unsupported: open PDF in new tab (NO download)
      const blobUrl = URL.createObjectURL(file);
      window.open(blobUrl, '_blank');
      return;
    }

    const isPregeneration = action === 'pregenerate';
    // If we're already pre-generating, don't start another one
    if (isPregeneration && pdfLoadingId === msg.id) return;
    if (isPregeneration && pregeneratedPdfs[msg.id]) return;

    // Converted File Logic
    if (msg.conversion && msg.conversion.file && msg.conversion.mimeType === 'application/pdf') {
      const shareToastId = !isPregeneration ? toast.loading(`${action === 'share' ? 'Sharing' : 'Preparing'} PDF...`) : null;
      try {
        const byteCharacters = atob(msg.conversion.file);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const filename = msg.conversion.fileName || 'AI Ads.pdf';
        const file = new window.File([blob], filename, { type: 'application/pdf' });

        if (isPregeneration) {
          setPregeneratedPdfs(prev => ({ ...prev, [msg.id]: file }));
          return;
        }

        if (action === 'download') {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          toast.success("PDF Downloaded", { id: shareToastId });
        } else if (action === 'open') {
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank');
          toast.dismiss(shareToastId);
        } else if (action === 'copy') {
          if (!window.ClipboardItem) {
            toast.error("Iss browser mein direct file copy supported nahi hai.");
            toast.dismiss(shareToastId);
            return;
          }
          const item = new ClipboardItem({
            [file.type || 'application/pdf']: Promise.resolve(file)
          });
          await navigator.clipboard.write([item]);
          toast.success("PDF file copy ho gayi! 📋", { id: shareToastId });
        } else if (action === 'share') {
          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: 'AI Ads AI Response',
                text: msg && msg.content ? `${msg.content.substring(0, 150)}...` : 'AI Ads Document output'
              });
              toast.success("PDF sent to share menu!", { id: shareToastId });
            } catch (shareErr) {
              if (shareErr.name !== 'AbortError') {
                // Share failed — open in new tab instead of downloading
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
                toast.dismiss(shareToastId);
              } else {
                toast.dismiss(shareToastId);
              }
            }
          } else {
            // Not supported — open in new tab (NO forced download)
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            toast.dismiss(shareToastId);
          }
        }
        return;
      } catch (err) {
        if (shareToastId) toast.error("Failed to process PDF", { id: shareToastId });
        console.error("Error handling PDF action:", err);
      }
    }

    // Normal AI Response PDF Logic
    const processToastId = !isPregeneration ? toast.loading(`${action === 'share' ? 'Sharing' : 'Generating'} PDF Document...`) : null;
    if (!isPregeneration) setPdfLoadingId(msg.id);

    try {
      const element = document.getElementById(`msg-text-${msg.id}`);
      if (!element) {
        if (processToastId) toast.error("Content not found", { id: processToastId });
        setPdfLoadingId(null);
        return;
      }

      let canvas;
      try {
        // Create an unconstrained wrapper to prevent screen-size clipping
        const tempWrapper = document.createElement('div');
        tempWrapper.style.position = 'absolute';
        tempWrapper.style.left = '-9999px';
        tempWrapper.style.top = '-9999px';
        tempWrapper.style.width = '800px'; // Fixed desktop-like width for consistency
        tempWrapper.style.backgroundColor = '#ffffff';

        // Clone the content
        const clonedContent = element.cloneNode(true);
        clonedContent.id = `temp-pdf-${msg.id}`;

        // Add Header
        const header = document.createElement('div');
        header.style.marginBottom = '20px';
        header.style.paddingBottom = '10px';
        header.style.borderBottom = '1px solid #eee';
        header.style.fontSize = '12px';
        header.style.color = '#888';
        header.style.fontWeight = 'bold';
        header.innerText = 'AI Ads AI RESPONSE';

        tempWrapper.appendChild(header);

        // Ensure all text in clone is black and wrapping properly
        clonedContent.style.padding = '20px';
        clonedContent.style.color = '#000000';
        clonedContent.style.backgroundColor = '#ffffff';
        clonedContent.style.width = '100%';
        clonedContent.style.lineHeight = '1.4';

        const all = clonedContent.querySelectorAll('*');
        Array.from(all).forEach(el => {
          el.style.color = '#000000';
          if (el.tagName === 'P') el.style.marginBottom = '6px';
          if (el.tagName === 'A') el.style.color = '#0000ff';
        });

        tempWrapper.appendChild(clonedContent);
        document.body.appendChild(tempWrapper);

        // Wait a tiny bit for styles to apply
        await new Promise(r => setTimeout(r, 100));

        // Generate canvas from the unconstrained clone
        canvas = await html2canvas(tempWrapper, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          windowWidth: 800, // Force window width awareness
          logging: false
        });

        // Cleanup
        document.body.removeChild(tempWrapper);

      } catch (genError) {
        if (processToastId) toast.error(`Canvas Error: ${genError.message}`, { id: processToastId });
        setPdfLoadingId(null);
        return;
      }

      if (!canvas) {
        if (processToastId) toast.error("Failed to capture content", { id: processToastId });
        setPdfLoadingId(null);
        return;
      }

      // ===== SMART PER-PAGE CANVAS SLICING =====
      // Scans for white space near page breaks to avoid cutting text lines
      const pdf = new jsPDF('p', 'mm', 'a4');
      const margin = 10;
      const pageW = pdf.internal.pageSize.getWidth();   // 210mm
      const pageH = pdf.internal.pageSize.getHeight();  // 297mm
      const printW = pageW - margin * 2;
      const printH = pageH - margin * 2;

      const pxPerMm = canvas.width / printW;
      const pageHeightPx = Math.floor(printH * pxPerMm);
      const mainCtx = canvas.getContext('2d', { willReadFrequently: true });

      let currentY = 0;
      let pageCount = 0;

      while (currentY < canvas.height) {
        if (pageCount > 0) pdf.addPage();

        let targetH = pageHeightPx;
        // If not the last page, try to find a "smart" break point (white space)
        if (currentY + targetH < canvas.height) {
          // Increase scan range to found a better gap (max 200px or 1/3 of page)
          const scanRange = Math.min(200, Math.floor(pageHeightPx / 3));
          try {
            const scanData = mainCtx.getImageData(0, currentY + targetH - scanRange, canvas.width, scanRange).data;
            let foundSafeRow = -1;

            // Search from bottom of the ideal page area upwards
            for (let row = scanRange - 1; row >= 0; row--) {
              let isWhiteRow = true;
              // Sampling check every 5th pixel for better accuracy than every 10th
              for (let col = 0; col < canvas.width; col += 5) {
                const idx = (row * canvas.width + col) * 4;
                // Check if color is near white (AI Ads bg or transparent)
                if (scanData[idx] < 245 || scanData[idx + 1] < 245 || scanData[idx + 2] < 245) {
                  isWhiteRow = false;
                  break;
                }
              }
              if (isWhiteRow) {
                foundSafeRow = row;
                break;
              }
            }

            if (foundSafeRow !== -1) {
              // We found a gap! Slice here.
              targetH = (targetH - scanRange) + foundSafeRow + 4; // 4px extra safety buffer
            } else {
              // If no gap found, we'll have to cut through text, 
              // but let's try to avoid mid-line repetition by being exact
              targetH = pageHeightPx;
            }
          } catch (e) {
            console.warn("Smart break scan failed", e);
            targetH = pageHeightPx;
          }
        } else {
          targetH = canvas.height - currentY;
        }

        // Clip safety: ensure we don't exceed actual canvas height
        if (currentY + targetH > canvas.height) {
          targetH = canvas.height - currentY;
        }

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = targetH;
        const pCtx = pageCanvas.getContext('2d');
        pCtx.fillStyle = '#ffffff';
        pCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        pCtx.drawImage(canvas, 0, currentY, canvas.width, targetH, 0, 0, canvas.width, targetH);

        const pageImg = pageCanvas.toDataURL('image/jpeg', 0.95); // JPEG slightly faster/smaller
        const mmH = targetH / pxPerMm;
        pdf.addImage(pageImg, 'JPEG', margin, margin, printW, mmH, undefined, 'FAST');

        currentY += targetH; // Advance by exactly what we took
        pageCount++;
      }
      // ===== END SMART SLICING =====

      const filename = `AI Ads.pdf`;
      const blob = pdf.output('blob');
      const file = new File([blob], filename, { type: 'application/pdf', lastModified: new Date().getTime() });

      if (isPregeneration) {
        setPregeneratedPdfs(prev => ({ ...prev, [msg.id]: file }));
        return;
      }

      if (action === 'download') {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        if (processToastId) toast.success("PDF Downloaded", { id: processToastId });
      } else if (action === 'open') {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        if (processToastId) toast.dismiss(processToastId);
      } else if (action === 'copy') {
        try {
          if (!window.ClipboardItem) throw new Error("ClipboardItem not supported");

          const cleanText = msg.content
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/### (.*)/g, '$1')
            .replace(/\[(.*?)\]\((.*?)\)/g, '$1 ($2)');

          const item = new ClipboardItem({
            ['application/pdf']: Promise.resolve(blob),
            ['text/plain']: new Blob([cleanText], { type: 'text/plain' })
          });

          await navigator.clipboard.write([item]);
          if (processToastId) toast.success("PDF aur Text copy ho gaya! 📋", { id: processToastId });
        } catch (err) {
          console.warn("Binary copy failed:", err);
          await navigator.clipboard.writeText(msg.content);
          if (processToastId) toast.success("Text copy ho gaya!", { id: processToastId });
        }
      } else if (action === 'share') {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        // On desktop, prioritize in-app WhatsApp share to avoid Windows native share login issues
        if (!isMobile) {
          handleWhatsAppPdfShare(msg);
          if (processToastId) toast.dismiss(processToastId);
          return;
        }

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'AI Ads AI Response',
              text: msg && msg.content ? `${msg.content.substring(0, 150)}...` : 'AI Ads Document output'
            });
            if (processToastId) toast.success("PDF sent to share menu!", { id: processToastId });
          } catch (shareErr) {
            if (shareErr.name !== 'AbortError') {
              // Share failed — open in new tab instead of downloading
              const blobUrl = URL.createObjectURL(blob);
              window.open(blobUrl, '_blank');
              if (processToastId) toast.dismiss(processToastId);
            } else {
              if (processToastId) toast.dismiss(processToastId);
            }
          }
        } else {
          // Fallback or specific Desktop case without navigator.share
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, '_blank');
          if (processToastId) toast.dismiss(processToastId);
        }
      }
    } catch (err) {
      console.error(err);
      if (processToastId) toast.error("Failed to generate PDF", { id: processToastId });
    } finally {
      if (!isPregeneration) setPdfLoadingId(null);
    }
  };

  // Auto-resize chat input textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'; // Reset height to recount
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  // ===== AUTO PRE-GENERATE PDF for latest AI message =====
  // Start PDF generation in background right after AI responds
  // so by the time user clicks the PDF icon, it's already ready (instant share!)
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.role !== 'model' || !lastMsg.content) return;
    if (pregeneratedPdfs[lastMsg.id]) return; // Already generated
    if (typingMessageId === lastMsg.id) return; // Wait for typing animation to finish

    // Wait 1.5s for DOM to fully render, then silently pre-generate
    const timer = setTimeout(() => {
      handlePdfAction('pregenerate', lastMsg);
    }, 1500);

    return () => clearTimeout(timer);
  }, [messages, typingMessageId, pregeneratedPdfs]);

  const handleThumbsDown = (msgId) => {
    setFeedbackMsgId(msgId);
    setFeedbackOpen(true);
    setFeedbackCategory([]);
    setFeedbackDetails("");
  };

  const handleThumbsUp = async (msgId) => {
    try {
      toggleFeedback(msgId, { type: 'up' });
      await axios.post(apis.feedback, {
        sessionId: sessionId || 'unknown',
        messageId: msgId,
        type: 'thumbs_up'
      });
      toast.success("Thanks for the positive feedback!", {
        icon: '👍',
      });
    } catch (error) {
      console.error("Feedback error:", error);
      toast.error("Failed to submit feedback");
      // Revert local state on error
      toggleFeedback(msgId, { type: 'up' });
    }
  };

  const handleShare = async (content) => {
    if (!sessionId || sessionId === 'new') {
      toast.error("Please send a message first to share this chat.");
      return;
    }

    const shareToast = toast.loading("Generating share link...");
    try {
      const response = await chatStorageService.shareSession(sessionId);
      if (response.success) {
        setCurrentShareId(response.shareId);
        setIsShareModalOpen(true);
        toast.dismiss(shareToast);
      } else {
        throw new Error("Failed to generate share link");
      }
    } catch (err) {
      console.error("Share error:", err);
      toast.error("Could not generate share link. Please try again.", { id: shareToast });
    }
  };

  const handleDownloadPdf = async (msg) => {
    const toastId = toast.loading("Generating PDF Report...");
    try {
      const element = document.getElementById(`msg-text-${msg.id}`);
      if (!element) { toast.error("Content not found", { id: toastId }); return; }

      const tempWrapper = document.createElement('div');
      tempWrapper.style.position = 'absolute';
      tempWrapper.style.left = '-9999px';
      tempWrapper.style.top = '-9999px';
      tempWrapper.style.width = '800px';
      tempWrapper.style.backgroundColor = '#ffffff';

      const clonedContent = element.cloneNode(true);
      const header = document.createElement('div');
      header.style.marginBottom = '30px';
      header.style.paddingBottom = '15px';
      header.style.borderBottom = '2px solid #000000';
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.alignItems = 'center';
      header.innerHTML = `
        <div style="font-weight: 900; font-size: 24px; color: #000000;">AISA</div>
        <div style="font-size: 10px; color: #aaa; text-align: right;">DOC-ID: ${msg.id}<br/>DATE: ${new Date().toLocaleDateString()}</div>
      `;

      tempWrapper.appendChild(header);
      clonedContent.style.padding = '10px';
      clonedContent.style.color = '#000000';
      clonedContent.style.backgroundColor = '#ffffff';
      clonedContent.style.width = '100%';
      clonedContent.style.lineHeight = '1.6';

      const all = clonedContent.querySelectorAll('*');
      Array.from(all).forEach(el => {
        el.style.color = '#111827';
        if (el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3') {
          el.style.color = '#000000';
          el.style.marginTop = '24px';
          el.style.marginBottom = '12px';
        }
        if (el.tagName === 'P') el.style.marginBottom = '10px';
        if (el.tagName === 'LI') el.style.marginBottom = '8px';
      });

      tempWrapper.appendChild(clonedContent);

      const footer = document.createElement('div');
      footer.style.marginTop = '40px';
      footer.style.paddingTop = '15px';
      footer.style.borderTop = '1px solid #eee';
      footer.style.fontSize = '10px';
      footer.style.color = '#999';
      footer.innerHTML = `AISA Report - Generated on ${new Date().toLocaleString()}. Always consult with a licensed professional.`;
      tempWrapper.appendChild(footer);

      document.body.appendChild(tempWrapper);
      await new Promise(r => setTimeout(r, 200));

      const canvas = await html2canvas(tempWrapper, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: 800
      });
      document.body.removeChild(tempWrapper);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const margin = 15;
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const printW = pageW - margin * 2;
      const printH = pageH - margin * 2;
      const pxPerMm = canvas.width / printW;
      const pageHeightPx = Math.floor(printH * pxPerMm);
      const mainCtx = canvas.getContext('2d');

      let curY = 0;
      let pageIdx = 0;
      while (curY < canvas.height) {
        if (pageIdx > 0) pdf.addPage();
        let targetH = pageHeightPx;
        if (curY + targetH < canvas.height) {
          const scanRange = 150;
          try {
            const scanData = mainCtx.getImageData(0, curY + targetH - scanRange, canvas.width, scanRange).data;
            let bestRow = -1;
            for (let r = scanRange - 1; r >= 0; r--) {
              let isWhite = true;
              for (let c = 0; c < canvas.width; c += 10) {
                const i = (r * canvas.width + c) * 4;
                if (scanData[i] < 250 || scanData[i + 1] < 250 || scanData[i + 2] < 250) { isWhite = false; break; }
              }
              if (isWhite) { bestRow = r; break; }
            }
            if (bestRow !== -1) targetH = (targetH - scanRange) + bestRow + 5;
          } catch (e) { }
        } else { targetH = canvas.height - curY; }

        const pCanvas = document.createElement('canvas');
        pCanvas.width = canvas.width;
        pCanvas.height = targetH;
        const pCtx = pCanvas.getContext('2d');
        pCtx.fillStyle = '#ffffff';
        pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);
        pCtx.drawImage(canvas, 0, curY, canvas.width, targetH, 0, 0, canvas.width, targetH);

        pdf.addImage(pCanvas.toDataURL('image/jpeg', 0.95), 'JPEG', margin, margin, printW, targetH / pxPerMm);
        curY += targetH;
        pageIdx++;
      }

      pdf.save(`AISA.pdf`);
      toast.success("PDF Downloaded! 📄", { id: toastId });
    } catch (err) {
      console.error("PDF Generate error:", err);
      toast.error("Download failed.", { id: toastId });
    }
  };

  // WhatsApp In-App PDF Share — uploads PDF to cloud, then lets user pick contact IN-APP
  const handleWhatsAppPdfShare = async (msg) => {
    const toastId = toast.loading("Preparing PDF for WhatsApp...");
    try {
      // 1. Generate PDF from message
      const element = document.getElementById(`msg-text-${msg.id}`);
      if (!element) { toast.error("Content not found", { id: toastId }); return; }

      // Create an unconstrained wrapper to prevent screen-size clipping
      const tempWrapper = document.createElement('div');
      tempWrapper.style.position = 'absolute';
      tempWrapper.style.left = '-9999px';
      tempWrapper.style.top = '-9999px';
      tempWrapper.style.width = '800px'; // Fixed desktop width
      tempWrapper.style.backgroundColor = '#ffffff';

      // Clone the content
      const clonedContent = element.cloneNode(true);
      clonedContent.id = `temp-wa-pdf-${msg.id}`;

      // Add Header
      const header = document.createElement('div');
      header.style.marginBottom = '20px';
      header.style.paddingBottom = '10px';
      header.style.borderBottom = '1px solid #eee';
      header.style.fontSize = '12px';
      header.style.color = '#888';
      header.style.fontWeight = 'bold';
      header.innerText = 'AI Ads AI RESPONSE';

      tempWrapper.appendChild(header);

      clonedContent.style.padding = '20px';
      clonedContent.style.color = '#000000';
      clonedContent.style.backgroundColor = '#ffffff';
      clonedContent.style.width = '100%';
      clonedContent.style.lineHeight = '1.4';

      const all = clonedContent.querySelectorAll('*');
      Array.from(all).forEach(el => {
        el.style.color = '#000000';
        if (el.tagName === 'P') el.style.marginBottom = '6px';
        if (el.tagName === 'A') el.style.color = '#0000ff';
      });

      tempWrapper.appendChild(clonedContent);
      document.body.appendChild(tempWrapper);

      // Wait a tiny bit for styles to apply
      await new Promise(r => setTimeout(r, 100));

      const canvas = await html2canvas(tempWrapper, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: 800,
        logging: false
      });

      document.body.removeChild(tempWrapper);

      // ===== SMART PER-PAGE SLICING (for WhatsApp) =====
      const pdf = new jsPDF('p', 'mm', 'a4');
      const margin = 10;
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const printW = pageW - margin * 2;
      const printH = pageH - margin * 2;
      const pxPerMm = canvas.width / printW;
      const pageHeightPx = Math.floor(printH * pxPerMm);
      const mainCtx = canvas.getContext('2d', { willReadFrequently: true });

      let curY = 0;
      let pageIdx = 0;
      while (curY < canvas.height) {
        if (pageIdx > 0) pdf.addPage();
        let targetH = pageHeightPx;
        if (curY + targetH < canvas.height) {
          const scanRange = Math.min(200, Math.floor(pageHeightPx / 3));
          try {
            const scanData = mainCtx.getImageData(0, curY + targetH - scanRange, canvas.width, scanRange).data;
            let bestRow = -1;
            for (let r = scanRange - 1; r >= 0; r--) {
              let isWhite = true;
              for (let c = 0; c < canvas.width; c += 5) {
                const i = (r * canvas.width + c) * 4;
                if (scanData[i] < 245 || scanData[i + 1] < 245 || scanData[i + 2] < 245) {
                  isWhite = false;
                  break;
                }
              }
              if (isWhite) { bestRow = r; break; }
            }
            if (bestRow !== -1) {
              targetH = (targetH - scanRange) + bestRow + 4;
            }
          } catch (e) { }
        } else { targetH = canvas.height - curY; }

        if (curY + targetH > canvas.height) targetH = canvas.height - curY;

        const pCanvas = document.createElement('canvas');
        pCanvas.width = canvas.width;
        pCanvas.height = targetH;
        const pCtx = pCanvas.getContext('2d');
        pCtx.fillStyle = '#ffffff';
        pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);
        pCtx.drawImage(canvas, 0, curY, canvas.width, targetH, 0, 0, canvas.width, targetH);
        pdf.addImage(pCanvas.toDataURL('image/jpeg', 0.95), 'JPEG', margin, margin, printW, targetH / pxPerMm, undefined, 'FAST');
        curY += targetH;
        pageIdx++;
      }
      // ===== END SMART SLICING =====
      // 2. Upload PDF blob to Cloudinary via backend
      toast.loading("Uploading PDF...", { id: toastId });
      const blob = pdf.output('blob');
      const formData = new FormData();
      formData.append('pdf', blob, 'AI Ads.pdf');

      const { BASE_URL } = await import('../types');
      const uploadRes = await axios.post(`${BASE_URL}/api/chat/upload-pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      const pdfUrl = uploadRes.data?.url;
      if (!pdfUrl) throw new Error("Upload failed");

      toast.dismiss(toastId);

      // 3. Show in-app WhatsApp contact picker modal
      setWaPdfUrl(pdfUrl);
      setWaMsgContent(`🤖 *AI Ads AI Response*\n\nYeh dekho meri AI Ads se baat: ${pdfUrl}`);
      setWaPhone('');
      setWaShareModal(true);

    } catch (err) {
      console.error("WhatsApp PDF Share error:", err);
      toast.error("WhatsApp share failed. Try again.", { id: toastId });
    }
  };

  const sendWhatsAppMessage = () => {
    const cleaned = waPhone.replace(/\D/g, '');
    if (cleaned.length < 7) { toast.error("Valid phone number daalo!"); return; }

    setWaUploading(true);
    const text = encodeURIComponent(waMsgContent);

    // Using api.whatsapp.com directly as it's more reliable for session persistence on desktop
    // Removing noreferrer to ensure cookies/sessions are shared correctly between windows
    const url = `https://api.whatsapp.com/send?phone=${cleaned}&text=${text}`;

    try {
      const win = window.open(url, '_blank', 'noopener');
      if (win) {
        win.focus();
        toast.success("WhatsApp mein message open ho gaya! 📤");
      } else {
        // Fallback for popup blockers
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.click();
        toast.success("WhatsApp opening... Check popups!");
      }
    } catch (err) {
      console.error("WhatsApp redirection error:", err);
      toast.error("Naya window nahi khul saka.");
    } finally {
      setWaUploading(false);
      setWaShareModal(false);
    }
  };

  const submitFeedback = async () => {
    if (isSubmittingFeedback) return;
    try {
      setIsSubmittingFeedback(true);
      const msgId = feedbackMsgId;
      const feedbackData = {
        type: 'down',
        categories: [...feedbackCategory],
        details: feedbackDetails
      };

      await axios.post(apis.feedback, {
        sessionId: sessionId || 'unknown',
        messageId: msgId,
        type: 'thumbs_down',
        categories: feedbackData.categories,
        details: feedbackData.details
      });

      toggleFeedback(msgId, feedbackData);
      toast.success("Feedback submitted. Thank you!");
      setFeedbackOpen(false);
    } catch (error) {
      console.error("Feedback error:", error);
      toast.error("Failed to submit feedback");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const toggleFeedbackCategory = (cat) => {
    setFeedbackCategory(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleCopyMessage = (content) => {
    if (!content) return;
    // Convert markdown to clean plain text for clipboard
    let clean = content;
    // Remove [ACTIVE TOOL: ...] tags
    clean = clean.replace(/\*?\*?\[ACTIVE TOOL:.*?\]\*?\*?/gi, '');
    // Convert markdown headings (##, ###) to plain uppercase text
    clean = clean.replace(/^#{1,6}\s+(.+)$/gm, (_, heading) => heading.trim().toUpperCase());
    // Remove bold/italic markers (**text**, *text*, __text__, _text_)
    clean = clean.replace(/\*\*(.+?)\*\*/g, '$1');
    clean = clean.replace(/\*(.+?)\*/g, '$1');
    clean = clean.replace(/__(.+?)__/g, '$1');
    clean = clean.replace(/_(.+?)_/g, '$1');
    // Remove strikethrough (~~text~~)
    clean = clean.replace(/~~(.+?)~~/g, '$1');
    // Remove inline code backticks
    clean = clean.replace(/`([^`]+)`/g, '$1');
    // Remove code block markers (```language ... ```)
    clean = clean.replace(/```[\s\S]*?```/g, (match) => {
      return match.replace(/```\w*\n?/g, '').replace(/```/g, '').trim();
    });
    // Clean up horizontal rules (---, ***, ___)
    clean = clean.replace(/^[-*_]{3,}\s*$/gm, '─'.repeat(40));
    // Clean up list markers (- item -> • item, * item -> • item)
    clean = clean.replace(/^\s*[-*]\s+/gm, '• ');
    // Clean ordered list markers (1. item -> 1. item) — keep as-is for readability
    // Remove link syntax [text](url) -> text
    clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    // Remove image syntax ![alt](url) -> alt
    clean = clean.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');
    // Remove blockquote markers
    clean = clean.replace(/^\s*>\s?/gm, '');
    // Collapse excessive blank lines (3+ newlines -> 2)
    clean = clean.replace(/\n{3,}/g, '\n\n');
    // Trim
    clean = clean.trim();

    navigator.clipboard.writeText(clean);
    toast.success("Copied to clipboard!");
  };

  const handleMessageDelete = (messageId) => {
    setDeleteConfig({
      isOpen: true,
      title: "Delete Message?",
      description: "Are you sure you want to delete this message? This action cannot be undone.",
      onConfirm: async () => {
        // Find the message index
        const msgIndex = messages.findIndex(m => m.id === messageId);
        if (msgIndex === -1) return;

        const msgsToDelete = [messageId];

        // Check if the NEXT message is an AI response (model), if so, delete it too
        if (msgIndex + 1 < messages.length) {
          const nextMsg = messages[msgIndex + 1];
          if (nextMsg.role === 'model') {
            msgsToDelete.push(nextMsg.id);
          }
        }

        // Optimistic update
        setMessages(prev => {
          const newMessages = prev.filter(m => !msgsToDelete.includes(m.id));
          // If the last message in history was deleted or affected, reset suggestions
          setSuggestions([]);
          return newMessages;
        });

        // Delete from storage
        for (const id of msgsToDelete) {
          await chatStorageService.deleteMessage(sessionId, id);
        }
        toast.success("Message deleted");
      }
    });
  };

  const startEditing = (msg) => {
    setEditingMessageId(msg.id);
    setEditContent(msg.content || msg.text || "");
  };

  const saveEdit = async (msg) => {
    if (editContent.trim() === "") return; // Don't allow empty

    const updatedMsg = { ...msg, content: editContent, text: editContent, edited: true };

    // Find the index of the edited message
    const editedMsgIndex = messages.findIndex(m => m.id === msg.id);

    // If in Audio Convert Mode, perform an in-place update without truncating history
    if (isAudioConvertMode) {
      const updatedMessages = [...messages];
      updatedMessages[editedMsgIndex] = updatedMsg;
      setMessages(updatedMessages);
      setEditingMessageId(null);
      setIsLoading(true);

      try {
        await chatStorageService.updateMessage(sessionId, updatedMsg);

        // Find the assistant's message that immediately follows the edited text
        const nextMsg = messages[editedMsgIndex + 1];
        const replaceAssistantMsgId = (nextMsg && nextMsg.role !== 'user') ? nextMsg.id : null;

        await manualTextToAudioConversion(updatedMsg.content, sessionId, replaceAssistantMsgId);
      } catch (e) {
        console.error("Error during audio edit:", e);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Normal chat mode behavior: truncate history
    // Remove all messages after the edited message
    const messagesUpToEdit = messages.slice(0, editedMsgIndex);
    const updatedMessages = [...messagesUpToEdit, updatedMsg];

    // Update UI immediately
    setMessages(updatedMessages);
    setEditingMessageId(null);
    setIsLoading(true);

    try {
      // Update the edited message in storage
      await chatStorageService.updateMessage(sessionId, updatedMsg);

      // Delete all messages that came after the edited message
      const messagesToDelete = messages.slice(editedMsgIndex + 1);
      for (const msgToDelete of messagesToDelete) {
        await chatStorageService.deleteMessage(sessionId, msgToDelete.id);
      }

      // Generate new AI response based on the edited message
      const SYSTEM_INSTRUCTION = `
You are AI Ads, an advanced AI assistant.
IMAGE GENERATION CAPABILITIES:
If the user asks for an image (e.g., "generate", "create", "draw", "show me a pic", "image dikhao", "photo bhejo", "pic do"), tell them to use the Image Generation mode via the Magic Tools button. Do NOT attempt to generate images inline.
`;

      const aiResponseData = await generateChatResponse(
        messagesUpToEdit,
        updatedMsg.content,
        SYSTEM_INSTRUCTION + getSystemPromptExtensions(),
        updatedMsg.attachments || (updatedMsg.attachment ? [updatedMsg.attachment] : []),
        currentLang
      );

      // Extract text reply and other metadata from the response object
      let reply = "";
      let conversion = null;
      let videoUrl = null;
      let imageUrl = null;

      if (typeof aiResponseData === 'string') {
        reply = aiResponseData;
      } else if (aiResponseData && typeof aiResponseData === 'object') {
        reply = aiResponseData.reply || "";
        conversion = aiResponseData.conversion || null;
        videoUrl = aiResponseData.videoUrl || null;
        imageUrl = aiResponseData.imageUrl || null;
      }

      const modelMsg = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: reply,
        timestamp: Date.now(),
        ...(conversion && { conversion }),
        ...(videoUrl && { videoUrl }),
        ...(imageUrl && { imageUrl })
      };

      // Update state with new AI response
      setMessages(prev => [...prev, modelMsg]);

      // Save the AI response to storage
      await chatStorageService.saveMessage(sessionId, modelMsg);

      toast.success("Message edited and new response generated!");
    } catch (error) {
      console.error("Error regenerating response:", error);
      toast.error("Failed to regenerate response. Please try again.");
      // Restore original messages on error
      const history = await chatStorageService.getHistory(sessionId);
      setMessages(history);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameFile = async (msg) => {
    if (!msg.attachment) return;

    const oldName = msg.attachment.name;
    const dotIndex = oldName.lastIndexOf('.');
    const extension = dotIndex !== -1 ? oldName.slice(dotIndex) : '';
    const baseName = dotIndex !== -1 ? oldName.slice(0, dotIndex) : oldName;

    const newBaseName = prompt("Enter new filename:", baseName);
    if (!newBaseName || newBaseName === baseName) return;

    const newName = newBaseName + extension;
    const updatedMsg = {
      ...msg,
      attachment: {
        ...msg.attachment,
        name: newName
      }
    };

    setMessages(prev => prev.map(m => m.id === msg.id ? updatedMsg : m));
    await chatStorageService.updateMessage(sessionId, updatedMsg);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditContent("");
  };

  const handleUndo = async () => {
    if (messages.length <= 1 || isLoading) return;

    // Last message might be AI, second to last is User
    const lastMsg = messages[messages.length - 1];
    const secondLastMsg = messages[messages.length - 2];

    const idsToDelete = [];
    let contentToRestore = "";

    if (lastMsg.role === 'model' && secondLastMsg.role === 'user') {
      idsToDelete.push(lastMsg.id, secondLastMsg.id);
      contentToRestore = secondLastMsg.content || secondLastMsg.text || "";
    } else if (lastMsg.role === 'user') {
      idsToDelete.push(lastMsg.id);
      contentToRestore = lastMsg.content || lastMsg.text || "";
    } else {
      idsToDelete.push(lastMsg.id);
    }

    // Restore content to input field
    if (contentToRestore) {
      setInputValue(contentToRestore);
      // Small delay to ensure state update before focusing
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          // Set cursor at the end
          inputRef.current.selectionStart = contentToRestore.length;
          inputRef.current.selectionEnd = contentToRestore.length;
        }
      }, 50);
    }

    // Optimistic Update
    setMessages(prev => prev.filter(m => !idsToDelete.includes(m.id)));

    // Delete from storage
    try {
      for (const id of idsToDelete) {
        if (id) {
          await chatStorageService.deleteMessage(currentSessionId, id);
        }
      }
      toast.success("Message restored to input", { icon: '↩️' });
    } catch (error) {
      console.error("Undo error:", error);
    }
  };

  const handleMessageUndo = async (msg) => {
    const msgIndex = messages.findIndex(m => m.id === msg.id);
    if (msgIndex === -1) return;

    const msgsToDelete = [msg.id];
    // Check if the next message is an AI response (model), if so, delete it too
    if (msgIndex + 1 < messages.length && messages[msgIndex + 1].role === 'model') {
      msgsToDelete.push(messages[msgIndex + 1].id);
    }

    // Restore content to input
    setInputValue(msg.content || msg.text || "");
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.selectionStart = (msg.content || msg.text || "").length;
        inputRef.current.selectionEnd = (msg.content || msg.text || "").length;
      }
    }, 50);

    // Optimistic Update
    setMessages(prev => prev.filter(m => !msgsToDelete.includes(m.id)));

    // Delete from storage
    try {
      for (const id of msgsToDelete) {
        if (id) {
          await chatStorageService.deleteMessage(currentSessionId, id);
        }
      }
      toast.success("Resumed from this message", { icon: '↩️' });
    } catch (error) {
      console.error("Quick undo error:", error);
    }
  };

  const [viewingDoc, setViewingDoc] = useState(null);
  const docContainerRef = useRef(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setViewingDoc(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Process Word documents
  useEffect(() => {
    if (viewingDoc && viewingDoc.name.match(/\.(docx|doc)$/i) && docContainerRef.current) {
      // Clear previous content
      docContainerRef.current.innerHTML = '';

      fetch(viewingDoc.url)
        .then(res => res.blob())
        .then(blob => {
          renderAsync(blob, docContainerRef.current, undefined, {
            inWrapper: true,
            ignoreWidth: false,
            className: "docx-viewer"
          }).catch(err => {
            console.error("Docx Preview Error:", err);
            docContainerRef.current.innerHTML = '<div class="text-center p-10 text-subtext">Preview not available.<br/>Please download to view.</div>';
          });
        });
    }
  }, [viewingDoc]);

  // Process Excel documents
  useEffect(() => {
    if (viewingDoc && viewingDoc.name.match(/\.(xls|xlsx|csv)$/i)) {
      setExcelHTML(null); // Reset
      fetch(viewingDoc.url)
        .then(res => res.arrayBuffer())
        .then(ab => {
          const wb = XLSX.read(ab, { type: 'array' });
          const firstSheetName = wb.SheetNames[0];
          const ws = wb.Sheets[firstSheetName];
          const html = XLSX.utils.sheet_to_html(ws, { id: "excel-preview", editable: false });
          setExcelHTML(html);
        })
        .catch(err => {
          console.error("Excel Preview Error:", err);
          setExcelHTML('<div class="text-center p-10 text-red-500">Failed to load Excel preview.</div>');
        });
    }
  }, [viewingDoc]);

  // Process Text/Code documents
  useEffect(() => {
    // Check if handled by other specific viewers
    const isSpecial = viewingDoc?.name.match(/\.(docx|doc|xls|xlsx|csv|pdf|mp4|webm|ogg|mov|mp3|wav|m4a|jpg|jpeg|png|gif|webp|bmp|svg)$/i) || viewingDoc?.url.startsWith('data:image/');

    if (viewingDoc && !isSpecial) {
      setTextPreview(null);
      fetch(viewingDoc.url)
        .then(res => res.text())
        .then(text => {
          if (text.length > 5000000) {
            setTextPreview(text.substring(0, 5000000) + "\n\n... (File truncated due to size)");
          } else {
            setTextPreview(text);
          }
        })
        .catch(err => {
          console.error("Text Preview Error:", err);
          setTextPreview("Failed to load text content.");
        });
    }
  }, [viewingDoc]);

  useEffect(() => {
    if (isAudioConvertMode) {
      setIsVoiceSettingsOpen(true);
    }
  }, [isAudioConvertMode]);

  return (
    <div className="flex w-full bg-secondary relative overflow-hidden aisa-scalable-text overscroll-none h-[100dvh] fixed inset-0 lg:static lg:h-full">
      {/* 🌟 Premium Minimalist Background Wrapper 🌟 */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#f8f9fc] dark:bg-[#0b0c15]">
        {/* Universal Ambient Glows: Animated Blobs for Depth */}
        <div className="absolute inset-0">
          {/* Light Mode: Soft, elegant radial hints */}
          <div className="absolute inset-0 dark:hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-50/50 rounded-full blur-[140px]" />
            <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-blue-50/40 rounded-full blur-[160px]" />
            <div className="absolute top-[30%] right-[-5%] w-[40%] h-[40%] bg-purple-50/30 rounded-full blur-[120px]" />
          </div>

          {/* Dark Mode: Deep, matte professional depth */}
          <div className="absolute inset-0 hidden dark:block">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[140px]" />
            <div className="absolute bottom-[10%] right-[-10%] w-[45%] h-[45%] bg-blue-500/5 rounded-full blur-[160px]" />
          </div>
        </div>

      </div>


      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteConfig.isOpen}
        title={deleteConfig.title}
        description={deleteConfig.description}
        onClose={() => setDeleteConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          deleteConfig.onConfirm();
          setDeleteConfig(prev => ({ ...prev, isOpen: false }));
        }}
      />

      {/* Document Viewer Modal */}
      <AnimatePresence>
        {viewingDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card w-full max-w-4xl h-full max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-secondary">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-maintext truncate max-w-md">{viewingDoc.name}</h3>
                    <p className="text-xs text-subtext">
                      {viewingDoc.type === 'image' || viewingDoc.name.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)
                        ? 'Image Preview'
                        : 'File Preview'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(viewingDoc.type === 'image' || viewingDoc.name?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i) || viewingDoc.url?.startsWith('data:image/')) && (
                    <button
                      onClick={() => handleCopyImage(viewingDoc.url)}
                      className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors text-subtext"
                      title="Copy Image"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDownload(viewingDoc.url, viewingDoc.name)}
                    className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors text-subtext"
                    title="Download"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewingDoc(null)}
                    className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-subtext"
                    title="Close"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Viewer Content */}
              <div className="flex-1 bg-gray-100 dark:bg-gray-900 relative flex items-center justify-center overflow-hidden">
                {viewingDoc.type === 'image' || viewingDoc.name.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i) || viewingDoc.url.startsWith('data:image/') ? (
                  <ImageViewer
                    src={viewingDoc.url}
                    alt="Preview"
                  />
                ) : viewingDoc.name.match(/\.(docx|doc)$/i) ? (
                  <div
                    ref={docContainerRef}
                    className="bg-gray-100 w-full h-full overflow-y-auto custom-scrollbar flex flex-col items-center py-8"
                  />
                ) : viewingDoc.name.match(/\.(xls|xlsx|csv)$/i) ? (
                  <div
                    className="bg-white w-full h-full overflow-auto p-4 custom-scrollbar text-black text-sm"
                    dangerouslySetInnerHTML={{ __html: excelHTML || '<div class="flex items-center justify-center h-full"><div class="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>' }}
                  />
                ) : viewingDoc.name.endsWith('.pdf') || viewingDoc.url.startsWith('data:application/pdf') ? (
                  <iframe
                    src={viewingDoc.url}
                    className="w-full h-full border-0"
                    title="Document Viewer"
                  />
                ) : viewingDoc.name.match(/\.(mp4|webm|ogg|mov)$/i) || viewingDoc.type.startsWith('video/') ? (
                  <video controls className="max-w-full max-h-full rounded-lg shadow-lg" src={viewingDoc.url}>
                    Your browser does not support the video tag.
                  </video>
                ) : viewingDoc.name.match(/\.(mp3|wav|ogg|m4a)$/i) || viewingDoc.type.startsWith('audio/') ? (
                  <div className="p-10 bg-surface rounded-2xl flex flex-col items-center gap-6 shadow-md border border-border">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center animate-pulse-slow">
                      <div className="w-12 h-12 border-2 border-primary rounded-full flex items-center justify-center">
                        <Mic className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold text-lg mb-1">{viewingDoc.name}</h3>
                      <p className="text-xs text-subtext">Audio File Player</p>
                    </div>
                    <audio controls className="w-full min-w-[300px]" src={viewingDoc.url}>
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                ) : (
                  <div className="w-full h-full bg-[#1e1e1e] p-0 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-black/20 backdrop-blur-md border-b border-transparent shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#cccccc] uppercase tracking-wider">
                          {viewingDoc.name.match(/\.(rar|zip|exe|dll|bin|iso|7z)$/i) ? 'BINARY CONTENT' : 'CODE READER'}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#0e639c] text-white font-mono shadow-sm">
                        {viewingDoc.name.split('.').pop().toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 overflow-auto custom-scrollbar p-4">
                      <code className="text-xs font-mono whitespace-pre-wrap text-[#9cdcfe] break-all leading-relaxed tab-4 block">
                        {textPreview || "Reading file stream..."}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      <ModelSelector
        isOpen={isModelSelectorOpen}
        onClose={() => setIsModelSelectorOpen(false)}
        toolType={selectedToolType}
        currentModel={selectedToolType ? toolModels[selectedToolType] : 'gemini-flash'}
        onSelectModel={handleModelSelect}
        pricing={TOOL_PRICING}
      />



      {/* Main Area */}
      <div
        className="flex-1 flex flex-col relative bg-transparent w-full min-w-0 pt-[5vh]"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 z-50 bg-primary/10 backdrop-blur-sm border-2 border-dashed border-primary flex flex-col items-center justify-center pointer-events-none">
            <Cloud className="w-16 h-16 text-primary mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold text-primary">Drop to Upload</h3>
          </div>
        )}

        {/* Header - Removed for minimalist cinematic aesthetic */}





        {/* <button className="flex items-center gap-2 text-subtext hover:text-maintext text-sm">
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">Device</span>
            </button> */}



        {/* Messages */}
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="relative flex-1 overflow-y-auto chatgpt-container pt-[20vh] pb-64 md:pb-72 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent aisa-scalable-text"
        >
          {messages.length > 0 && (
            <>
              {/* Extra large Top Spacer for premium starting position */}
              <div className="h-[5vh] w-full shrink-0" />
              {messages.map((msg, idx) => (
                <div
                  key={msg.id}
                  className={`chatgpt-message-row group ${msg.role === 'user' ? 'user-row' : 'ai-row'}`}
                  onMouseUp={(e) => {
                    // Only toggle active message on clean click (no text selection)
                    const selection = window.getSelection();
                    if (selection && selection.toString().trim().length > 0) return;
                    // Don't toggle if clicked on a button, link, or interactive element
                    if (e.target.closest('button, a, input, textarea, [role="button"]')) return;
                    setActiveMessageId(activeMessageId === msg.id ? null : msg.id);
                  }}
                >
                  {/* Actions Menu (Always visible for discoverability) */}

                  <div className={`chatgpt-message-content ${msg.role === 'model' ? 'w-full' : ''}`}>
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user'
                        ? 'bg-slate-200 dark:bg-slate-700'
                        : 'bg-transparent'
                        }`}
                    >
                      {msg.role === 'user' ? (
                        <User className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                      ) : (
                        <img src="/logo/Logo.svg" alt="AISA" className="w-6 h-6 object-contain" />
                      )}
                    </div>

                    <div className="flex-1 chatgpt-text">

                      {msg.isGenerating && (
                        <div className="flex items-center gap-3 mb-3 p-3 bg-primary/5 rounded-xl border border-primary/10 animate-pulse">
                          <img src="/logo/Logo.svg" alt="AISA" className="w-5 h-5 object-contain" />
                          <span className="text-xs font-semibold text-primary uppercase tracking-tighter">AISA generating...</span>
                        </div>
                      )}

                      {msg.isProcessing && (
                        <div className="flex items-center gap-3 mb-3 p-3 bg-primary/5 rounded-xl border border-primary/10 animate-pulse">
                          <Loader size="sm" />
                          <span className="text-xs font-semibold text-primary uppercase tracking-tighter">Preparing Audio...</span>
                        </div>
                      )}

                      {/* Attachment Display */}
                      {((msg.attachments && msg.attachments.length > 0) || msg.attachment) && (
                        <div className="flex flex-col gap-3 mb-3 mt-1">
                          {(msg.attachments || (msg.attachment ? [msg.attachment] : [])).map((att, idx) => (
                            <div key={idx} className="w-full">
                              {att.type === 'image' ? (
                                <div
                                  className="relative group/image overflow-hidden rounded-xl border border-white/20 shadow-lg transition-all hover:scale-[1.01] cursor-pointer max-w-[320px]"
                                  onClick={() => setViewingDoc(att)}
                                >
                                  <img
                                    src={att.url}
                                    alt="Attachment"
                                    className="w-full h-auto max-h-[400px] object-contain bg-black/5"
                                    loading="lazy"
                                    onError={(e) => {
                                      console.error("Attachment image load failed:", att.url);
                                      if (att.url && !e.target.dataset.retried) {
                                        e.target.dataset.retried = "true";
                                        const isSignedUrl = att.url?.includes('X-Goog-Signature');
                                        const retryUrl = isSignedUrl
                                          ? att.url
                                          : att.url + (att.url.includes('?') ? '&' : '?') + 'retry=' + Date.now();
                                        console.log("Retrying attachment image load:", retryUrl);
                                        e.target.src = retryUrl;
                                      } else {
                                        const errorText = att.url ? (att.url.substring(0, 30) + '...') : 'Unknown URL';
                                        e.target.src = `https://placehold.co/600x400/333/eee?text=Attachment+Unavailable%0A${encodeURIComponent(errorText)}%0AClick+to+Retry`;
                                        e.target.style.cursor = 'pointer';
                                        e.target.onclick = (event) => {
                                          event.stopPropagation();
                                          const isSignedUrl = att.url?.includes('X-Goog-Signature');
                                          e.target.src = isSignedUrl ? att.url : att.url + (att.url.includes('?') ? '&' : '?') + 'manual=' + Date.now();
                                        };
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownload(att.url, att.name);
                                    }}
                                    className="absolute top-2 right-2 p-2 bg-black/40 text-white rounded-full opacity-0 group-hover/image:opacity-100 transition-all hover:bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center"
                                    title="Download"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors backdrop-blur-md ${msg.role === 'user' ? 'bg-transparent border-white/20 hover:bg-white/10 shadow-none' : 'bg-secondary/30 border-border hover:bg-secondary/50'}`}>
                                  <div
                                    className="flex-1 flex items-center gap-3 min-w-0 cursor-pointer p-0.5 rounded-lg"
                                    onClick={() => setViewingDoc(att)}
                                  >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${(() => {
                                      const name = (att.name || '').toLowerCase();
                                      if (msg.role === 'user') return 'bg-white shadow-sm';
                                      if (name.endsWith('.pdf')) return 'bg-red-50 dark:bg-red-900/20';
                                      if (name.match(/\.(doc|docx)$/)) return 'bg-blue-50 dark:bg-blue-900/20';
                                      if (name.match(/\.(xls|xlsx|csv)$/)) return 'bg-emerald-50 dark:bg-emerald-900/20';
                                      if (name.match(/\.(ppt|pptx)$/)) return 'bg-blue-50 dark:bg-blue-900/20';
                                      return 'bg-secondary';
                                    })()}`}>
                                      {(() => {
                                        const name = (att.name || '').toLowerCase();
                                        const baseClass = "w-6 h-6";
                                        if (name.match(/\.(xls|xlsx|csv)$/)) return <FileSpreadsheet className={`${baseClass} text-emerald-600`} />;
                                        if (name.match(/\.(ppt|pptx)$/)) return <Presentation className={`${baseClass} text-blue-600`} />;
                                        if (name.endsWith('.pdf')) return <FileText className={`${baseClass} text-red-600`} />;
                                        if (name.match(/\.(doc|docx)$/)) return <FileIcon className={`${baseClass} text-blue-600`} />;
                                        return <FileIcon className={`${baseClass} text-primary`} />;
                                      })()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="font-semibold truncate text-xs mb-0.5">{att.name || 'File'}</p>
                                      <p className="text-[10px] opacity-70 uppercase tracking-tight font-medium">
                                        {(() => {
                                          const name = (att.name || '').toLowerCase();
                                          if (name.endsWith('.pdf')) return 'PDF • Preview';
                                          if (name.match(/\.(doc|docx)$/)) return 'WORD • Preview';
                                          if (name.match(/\.(xls|xlsx|csv)$/)) return 'EXCEL';
                                          if (name.match(/\.(ppt|pptx)$/)) return 'SLIDES';
                                          return 'DOCUMENT';
                                        })()}
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownload(att.url, att.name);
                                    }}
                                    className={`p-2 rounded-lg transition-colors shrink-0 ${msg.role === 'user' ? 'hover:bg-white/20 text-white' : 'hover:bg-primary/10 text-primary'}`}
                                    title="Download"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}






                      {editingMessageId === msg.id ? (
                        <div className="flex flex-col gap-3 min-w-[200px] w-full mt-2">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white rounded-xl p-3 text-sm focus:outline-none resize-none border border-black/10 dark:border-white/20 placeholder-slate-400 dark:placeholder-white/50"
                            rows={2}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                saveEdit(msg);
                              }
                              if (e.key === 'Escape') cancelEdit();
                            }}
                          />
                          <div className="flex gap-3 justify-end items-center">
                            <button
                              onClick={cancelEdit}
                              className="text-slate-500 dark:text-white/80 hover:text-slate-800 dark:hover:text-white text-sm font-medium transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => saveEdit(msg)}
                              className="bg-primary text-white dark:bg-white dark:text-primary px-6 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-all shadow-sm"
                            >
                              Update
                            </button>
                          </div>
                        </div>
                      ) : (
                        msg.content && (
                          <div id={`msg-text-${msg.id}`} className={`max-w-full break-words leading-relaxed whitespace-normal ${msg.role === 'user' ? 'text-slate-900 dark:text-white' : 'text-maintext'}`}>
                            {msg.role === 'user' && (msg.mode === MODES.DEEP_SEARCH || (msg.role === 'user' && msg.content && (msg.content.toLowerCase().includes('search') || msg.mode === 'web_search'))) && (
                              <div className="flex items-center gap-1.5 mb-2 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full w-fit border border-white/10 shadow-sm">
                                <Search size={10} className="text-white animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-[0.1em] text-white">
                                  {msg.mode === MODES.DEEP_SEARCH ? 'Deep Intelligence Search' : 'Web Intelligence Search'}
                                </span>
                              </div>
                            )}

                            {msg.role === 'model' && msg.isRealTime && (
                              <div className="flex items-center gap-3 mb-4 px-4 py-2 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/20 rounded-2xl w-fit shadow-lg shadow-blue-500/5 transition-all hover:scale-[1.02] group/search-badge">
                                <div className="p-1.5 bg-blue-500 rounded-lg shadow-md ring-1 ring-blue-400 group-hover/search-badge:rotate-12 transition-transform">
                                  <Globe className="w-3.5 h-3.5 text-white animate-[spin_8s_linear_infinite]" />
                                </div>
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-500 leading-none">Web Search</span>
                                    <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                                  </div>
                                  <span className="text-[9px] font-bold text-blue-500/60 uppercase tracking-widest mt-0.5">Real-Time Grounding Active</span>
                                </div>
                              </div>
                            )}

                            {msg.role === 'model' && !msg.isRealTime && msg.sources && msg.sources.length > 0 && (
                              <div className="flex items-center gap-3 mb-4 px-4 py-2 bg-gradient-to-r from-emerald-600/10 to-teal-600/10 border border-emerald-500/20 rounded-2xl w-fit shadow-lg shadow-emerald-500/5 transition-all hover:scale-[1.02] group/knowledge-badge">
                                <div className="p-1.5 bg-emerald-500 rounded-lg shadow-md ring-1 ring-emerald-400 group-hover/knowledge-badge:rotate-12 transition-transform">
                                  <HardDrive className="w-3.5 h-3.5 text-white" />
                                </div>
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-500 leading-none">Verified Knowledge</span>
                                    <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                                  </div>
                                  <span className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-widest mt-0.5">Verified Documents Grounding</span>
                                </div>
                              </div>
                            )}

                            {/* [READ MORE LOGIC]: For long messages, we show a truncate and read more option */}
                            <div className="relative group/msg-content">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  a: ({ href, children }) => {
                                    const isInternal = href && href.startsWith('/');
                                    return (
                                      <a
                                        href={href}
                                        onClick={(e) => {
                                          if (isInternal) {
                                            e.preventDefault();
                                            navigate(href);
                                          }
                                        }}
                                        className="text-primary hover:underline font-bold cursor-pointer"
                                        target={isInternal ? "_self" : "_blank"}
                                        rel={isInternal ? "" : "noopener noreferrer"}
                                      >
                                        {children}
                                      </a>
                                    );
                                  },
                                  p: ({ children }) => <div className="mb-[14px] last:mb-0 leading-[1.6]">{children}</div>,
                                  ul: ({ children }) => <ul className="list-disc pl-5 mb-[14px] last:mb-0 space-y-1.5">{children}</ul>,
                                  ol: ({ children }) => <ol className="list-decimal pl-5 mb-[14px] last:mb-0 space-y-1.5">{children}</ol>,
                                  li: ({ children }) => <li className="mb-1 last:mb-0 leading-[1.6]">{children}</li>,
                                  h1: ({ children }) => <h1 className="text-[22px] font-semibold mb-3.5 mt-6 block text-[#1a1a1a] dark:text-[#ececec] tracking-tight">{children}</h1>,
                                  h2: ({ children }) => <h2 className="text-[18px] font-semibold mb-3 mt-5 block text-[#1a1a1a] dark:text-[#ececec] tracking-tight">{children}</h2>,
                                  h3: ({ children }) => <h3 className="text-[16px] font-semibold mb-2.5 mt-4 block text-[#1a1a1a] dark:text-[#ececec] tracking-tight">{children}</h3>,
                                  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                                  table: ({ children }) => (
                                    <div className="overflow-x-auto my-4 rounded-xl border border-border/50 shadow-lg bg-surface/30 backdrop-blur-sm">
                                      <table className="w-full border-collapse text-sm">{children}</table>
                                    </div>
                                  ),
                                  thead: ({ children }) => <thead className="bg-primary/10 border-b border-border/50">{children}</thead>,
                                  tbody: ({ children }) => <tbody className="divide-y divide-border/30">{children}</tbody>,
                                  tr: ({ children }) => <tr className="transition-colors hover:bg-white/3">{children}</tr>,
                                  th: ({ children }) => <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-primary">{children}</th>,
                                  td: ({ children }) => <td className="px-4 py-3 text-sm text-maintext leading-relaxed">{children}</td>,
                                  mark: ({ children }) => <mark className="bg-[#5555ff] text-white px-1 py-0.5 rounded-sm">{children}</mark>,
                                  code: ({ node, inline, className, children, ...props }) => {
                                    const match = /language-(\w+)/.exec(className || '');
                                    const lang = match ? match[1] : '';
                                    const codeValue = String(children).replace(/\n$/, '');
                                    const isUser = msg.role === 'user';

                                    if (!inline) {
                                      return (
                                        <div className={`rounded-xl overflow-hidden my-3 border ${isUser ? 'border-white/10 bg-black/20' : 'border-[#1a1a1a] bg-[#0d0d0d]'} shadow-2xl w-full max-w-full group/code`}>
                                          {!isUser && (
                                            <div className="flex items-center justify-between px-4 py-2.5 bg-[#2d2d2d]/80 backdrop-blur-sm border-b border-zinc-800">
                                              <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[#9ca3af]">{lang || 'plain text'}</span>
                                              </div>
                                              <button
                                                onClick={() => {
                                                  navigator.clipboard.writeText(codeValue);
                                                  toast.success("Code copied!");
                                                }}
                                                className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-3 py-1 rounded-lg border border-white/5 active:scale-95"
                                              >
                                                <Copy className="w-3.5 h-3.5" />
                                                Copy
                                              </button>
                                            </div>
                                          )}
                                          <div className={`${isUser ? 'max-h-[500px]' : 'max-h-[600px]'} overflow-auto custom-scrollbar-thin ${isUser ? 'bg-transparent' : 'bg-[#0d0d0d]'}`}>
                                            <SyntaxHighlighter
                                              language={lang || 'text'}
                                              style={highlighterTheme}
                                              PreTag="div"
                                              customStyle={{
                                                margin: 0,
                                                padding: isUser ? '16px' : '20px',
                                                fontSize: isUser ? '13px' : '14px',
                                                lineHeight: '1.7',
                                                background: 'transparent',
                                                borderRadius: 0,
                                                border: 'none',
                                                color: '#e5e7eb', // Ensure visibility for plain text
                                                fontFamily: '"Fira Code", "JetBrains Mono", source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace'
                                              }}
                                              codeTagProps={{
                                                style: {
                                                  fontFamily: 'inherit',
                                                  background: 'transparent',
                                                  color: 'inherit'
                                                }
                                              }}
                                              {...props}
                                            >
                                              {codeValue}
                                            </SyntaxHighlighter>
                                          </div>
                                        </div>
                                      );
                                    }
                                    return (
                                      <code className="bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded-md font-mono text-primary font-bold mx-0.5 text-xs translate-y-[-1px] inline-block" {...props}>
                                        {children}
                                      </code>
                                    );
                                  },
                                  img: ({ node, ...props }) => {
                                    const isDownloading = isDownloadingUrl === props.src;
                                    return (
                                      <div className="relative my-4 group/img-container max-w-full">
                                        <div className="relative group/image overflow-hidden aspect-auto max-w-[500px] cursor-zoom-in w-fit" onClick={() => setViewingDoc({ url: props.src, type: 'image', name: 'AI Image' })}>
                                          {msg.role === 'model' && (
                                            <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent z-10 flex justify-between items-center opacity-100 sm:opacity-0 sm:group-hover/img-container:opacity-100 transition-opacity">
                                              <div className="flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">AISA™ Generated Asset</span>
                                              </div>
                                            </div>
                                          )}
                                          <ImageViewer
                                            src={props.src}
                                            alt={props.alt || "AI Image"}
                                          />
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/img-container:opacity-100 transition-opacity pointer-events-none" />
                                        </div>
                                        <button
                                          onClick={() => handleDownload(props.src, `AISA_gen_${Date.now()}.png`)}
                                          disabled={isDownloading}
                                          className="absolute bottom-4 right-4 z-20 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl border border-white/20 text-white shadow-lg transition-all active:scale-95 disabled:opacity-50"
                                        >
                                          <div className="flex items-center gap-2">
                                            {isDownloading ? (
                                              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                              <Download className="w-4 h-4" />
                                            )}
                                            <span className="text-[10px] font-bold uppercase">
                                              {isDownloading ? 'Downloading...' : 'Download'}
                                            </span>
                                          </div>
                                        </button>
                                      </div>
                                    )
                                  },
                                }}
                              >
                                {msg.content || msg.text || ""}
                              </ReactMarkdown>
                              {msg.cashflowData && (
                                <CashFlowChartWidget data={msg.cashflowData} />
                              )}
                            </div>
                            {/* Sources List (ONLY for Web Search, HIDE for RAG as requested) */}
                            {msg.role === 'model' && msg.isRealTime && msg.sources && msg.sources.length > 0 && (
                              <div className="mt-4 pt-4">
                                <p className="text-[10px] font-bold uppercase text-subtext mb-3 flex items-center gap-2">
                                  <ExternalLink className="w-3 h-3" />
                                  Web Sources
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {msg.sources.map((source, sIdx) => (
                                    <a
                                      key={sIdx}
                                      href={source.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 hover:bg-primary/10 border border-border rounded-lg transition-all group/source"
                                    >
                                      {source.url && source.url.includes('http') ? (
                                        <Globe className="w-3 h-3 text-subtext group-hover/source:text-primary" />
                                      ) : (
                                        <FileText className="w-3 h-3 text-subtext group-hover/source:text-primary" />
                                      )}
                                      <span className="text-xs font-medium text-maintext group-hover/source:text-primary truncate max-w-[150px]">
                                        {source.title}
                                      </span>
                                      <div className="w-4 h-4 bg-primary/20 rounded flex items-center justify-center">
                                        <ExternalLink className="w-2.5 h-2.5 text-primary" />
                                      </div>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {msg.videoUrl && (
                              <div className="relative mt-4 mb-2 w-fit max-w-full">
                                <CustomVideoPlayer src={msg.videoUrl} compact={true} />
                              </div>
                            )}

                            {/* Dynamic Image Rendering (if not in markdown) */}
                            {msg.imageUrl && (
                              <div
                                className="relative group/generated mt-4 mb-2 overflow-hidden transition-all hover:scale-[1.01] cursor-zoom-in w-fit max-w-sm"
                                onClick={() => {
                                  if (!viewingDoc) setViewingDoc({ url: msg.imageUrl, type: 'image', name: 'Generated Image' });
                                }}
                              >
                                <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent z-10 flex justify-between items-center opacity-100 sm:opacity-0 sm:group-hover/generated:opacity-100 transition-opacity">
                                  <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">AI Ads Generated Asset</span>
                                  </div>
                                </div>
                                <img
                                  src={msg.imageUrl}
                                  alt="Generated Content"
                                  className="w-full h-auto max-h-[420px] object-contain transition-all duration-500 group-hover/image:scale-[1.02]"
                                  loading="eager"
                                  onLoad={() => {
                                    console.log("Image loaded successfully:", msg.imageUrl);
                                    scrollToBottom(true);
                                  }}
                                  onError={(e) => {
                                    console.error("Image load failed for URL:", msg.imageUrl);
                                    if (!e.target.dataset.retried) {
                                      e.target.dataset.retried = "true";
                                      setTimeout(() => {
                                        // ⚠️ Never append extra query params to signed URLs — it breaks the signature
                                        const isSignedUrl = msg.imageUrl?.includes('X-Goog-Signature');
                                        const retryUrl = isSignedUrl
                                          ? msg.imageUrl  // Use exact URL for signed URLs
                                          : msg.imageUrl + (msg.imageUrl.includes('?') ? '&' : '?') + 'retry=' + Date.now();
                                        console.log("Retrying image load:", retryUrl);
                                        e.target.src = retryUrl;
                                      }, 2000);
                                    } else {
                                      const finalErrorMsg = msg.imageUrl?.includes('cloudinary') ? 'Cloudinary Error' : 'Image Load Error';
                                      e.target.src = `https://placehold.co/600x400/222/fff?text=${encodeURIComponent(finalErrorMsg)}%0AClick+to+Retry`;
                                      e.target.style.cursor = 'pointer';
                                      e.target.onclick = (event) => {
                                        event.stopPropagation();
                                        const isSignedUrl = msg.imageUrl?.includes('X-Goog-Signature');
                                        e.target.src = isSignedUrl
                                          ? msg.imageUrl
                                          : msg.imageUrl + (msg.imageUrl.includes('?') ? '&' : '?') + 'manual=' + Date.now();
                                      };
                                    }
                                  }}
                                />
                                <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover/generated:opacity-100 transition-all scale-100 sm:scale-90 sm:group-hover/generated:scale-100">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIsMagicEditing(true);
                                      setIsMagicSettingsOpen(true);
                                      setEditRefImage({
                                        url: msg.imageUrl,
                                        name: 'Generated Asset',
                                        type: 'image/png'
                                      });
                                      toast.success('Magic Edit mode active! Type your request.');
                                      inputRef.current?.focus();
                                    }}
                                    className="p-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 shadow-lg border border-white/20"
                                    title="Edit this Image"
                                  >
                                    <Wand2 className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopyImage(msg.imageUrl);
                                    }}
                                    className="p-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 shadow-lg border border-white/20"
                                    title="Copy Image"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                  <button
                                    disabled={isDownloadingUrl === msg.imageUrl}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownload(msg.imageUrl, 'AI Ads-generated.png');
                                    }}
                                    className={`p-2.5 rounded-xl shadow-lg border border-white/20 flex items-center gap-2 ${isDownloadingUrl === msg.imageUrl ? 'bg-zinc-600 cursor-wait' : 'bg-primary text-white hover:bg-primary/90'}`}
                                    title="Download High-Res"
                                  >
                                    <div className="flex items-center gap-2 px-1">
                                      {isDownloadingUrl === msg.imageUrl ? (
                                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                      ) : (
                                        <Download className="w-4 h-4" />
                                      )}
                                      <span className="text-[10px] font-bold uppercase">
                                        {isDownloadingUrl === msg.imageUrl ? 'Downloading...' : 'Download'}
                                      </span>
                                    </div>
                                  </button>
                                </div>
                              </div>
                            )}
                            {msg.snapshot && <AISnapshot data={msg.snapshot} />}
                          </div>
                        )
                      )}

                      {/* File Conversion Download Button */}
                      {msg.conversion && msg.conversion.file && (
                        <div className="mt-4 pt-3 border-t border-border/40 space-y-3">

                          {/* ── Modern Audio Player ── */}
                          {msg.conversion.mimeType.startsWith('audio/') && (() => {
                            const audioSrc = msg.conversion.blobUrl || `data:${msg.conversion.mimeType};base64,${msg.conversion.file}`;
                            const playerId = `player-${msg.id}`;
                            return (
                              <div className="rounded-2xl overflow-hidden mb-2" style={{ background: 'linear-gradient(135deg, rgba(20,20,40,0.95) 0%, rgba(30,20,60,0.95) 100%)', border: '1px solid rgba(139,92,246,0.2)' }}>
                                {/* Waveform decorative bars + header */}
                                <div className="px-4 pt-4 pb-2 flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                                    <Volume2 className="w-4 h-4 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-white truncate">{msg.conversion.fileName}</p>
                                    <p className="text-[10px] text-purple-300/60 font-medium">
                                      {msg.conversion.fileSize || ''}{msg.conversion.charCount ? ` · ${msg.conversion.charCount} chars` : ''} · MP3 Audio
                                    </p>
                                  </div>
                                  {/* Decorative waveform */}
                                  <div className="flex items-center gap-[2px] shrink-0">
                                    {[3, 5, 8, 6, 9, 7, 5, 8, 6, 4, 7, 5].map((h, i) => (
                                      <div key={i} className="w-[2px] rounded-full opacity-40" style={{ height: `${h}px`, background: 'linear-gradient(to top, #7c3aed, #818cf8)' }} />
                                    ))}
                                  </div>
                                </div>

                                {/* Player controls */}
                                <div className="px-4 pb-4">
                                  <audio id={playerId} src={audioSrc} preload="metadata" style={{ display: 'none' }} />

                                  {/* Seek bar */}
                                  <div className="mb-3">
                                    <input
                                      type="range" min="0" max="100" defaultValue="0" step="0.1"
                                      className="w-full h-1 rounded-full cursor-pointer appearance-none"
                                      style={{ background: 'rgba(255,255,255,0.08)' }}
                                      onInput={(e) => {
                                        const audio = document.getElementById(playerId);
                                        if (audio && audio.duration) {
                                          audio.currentTime = (e.target.value / 100) * audio.duration;
                                        }
                                        e.target.style.background = `linear-gradient(to right, #7c3aed 0%, #818cf8 ${e.target.value}%, rgba(255,255,255,0.08) ${e.target.value}%, rgba(255,255,255,0.08) 100%)`;
                                      }}
                                      ref={(el) => {
                                        if (!el) return;
                                        const audio = document.getElementById(playerId);
                                        if (!audio) return;
                                        const update = () => {
                                          if (!audio.duration) return;
                                          const pct = (audio.currentTime / audio.duration) * 100;
                                          el.value = pct;
                                          el.style.background = `linear-gradient(to right, #7c3aed 0%, #818cf8 ${pct}%, rgba(255,255,255,0.08) ${pct}%, rgba(255,255,255,0.08) 100%)`;
                                          // update time display
                                          const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
                                          const timeEl = document.getElementById(`time-${playerId}`);
                                          const durEl = document.getElementById(`dur-${playerId}`);
                                          if (timeEl) timeEl.textContent = fmt(audio.currentTime);
                                          if (durEl && audio.duration) durEl.textContent = fmt(audio.duration);
                                        };
                                        audio.addEventListener('timeupdate', update);
                                        audio.addEventListener('loadedmetadata', update);
                                      }}
                                    />
                                    <div className="flex justify-between text-[10px] text-white/20 mt-1 font-mono">
                                      <span id={`time-${playerId}`}>0:00</span>
                                      <span id={`dur-${playerId}`}>--:--</span>
                                    </div>
                                  </div>

                                  {/* Buttons */}
                                  <div className="flex items-center gap-3">
                                    {/* Play/Pause */}
                                    <button
                                      onClick={(e) => {
                                        const audio = document.getElementById(playerId);
                                        const btn = e.currentTarget;
                                        if (!audio) return;
                                        if (audio.paused) {
                                          // Pause all other players
                                          document.querySelectorAll('audio').forEach(a => { if (a !== audio) a.pause(); });
                                          audio.play();
                                          btn.dataset.playing = 'true';
                                          btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
                                          audio.addEventListener('ended', () => {
                                            btn.dataset.playing = '';
                                            btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
                                          }, { once: true });
                                        } else {
                                          audio.pause();
                                          btn.dataset.playing = '';
                                          btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
                                        }
                                      }}
                                      className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/30 transition-transform active:scale-90"
                                      style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                                    </button>

                                    {/* Speed pill */}
                                    <button
                                      onClick={(e) => {
                                        const audio = document.getElementById(playerId);
                                        if (!audio) return;
                                        const speeds = [1, 1.25, 1.5, 1.75, 2];
                                        const cur = speeds.indexOf(audio.playbackRate);
                                        const next = speeds[(cur + 1) % speeds.length];
                                        audio.playbackRate = next;
                                        e.currentTarget.textContent = `${next}×`;
                                      }}
                                      className="px-2.5 py-1 text-[10px] font-bold text-purple-300 rounded-lg border border-purple-500/20 hover:border-purple-400/50 transition-colors"
                                      style={{ background: 'rgba(124,58,237,0.1)' }}
                                    >1×</button>

                                    <div className="flex-1" />

                                    {/* Volume */}
                                    <button onClick={(e) => {
                                      const audio = document.getElementById(playerId);
                                      if (!audio) return;
                                      audio.muted = !audio.muted;
                                      e.currentTarget.style.opacity = audio.muted ? '0.4' : '1';
                                    }} className="text-white/40 hover:text-white/80 transition-colors">
                                      <Volume2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                          {/* File metadata + Download button */}
                          {!msg.conversion.mimeType.startsWith('audio/') && (
                            <div className="flex items-center justify-between px-1 py-1">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-maintext truncate">{msg.conversion.fileName}</p>
                                <p className="text-[10px] text-subtext font-bold uppercase tracking-widest flex items-center gap-2">
                                  <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-md border border-transparent">
                                    {msg.conversion.fileSize || "Ready"}
                                  </span>
                                  {msg.conversion.charCount && (
                                    <span className="px-1.5 py-0.5 bg-secondary/30 text-subtext rounded-md border border-transparent">
                                      {msg.conversion.charCount} CHARS
                                    </span>
                                  )}
                                  {msg.conversion.mimeType.includes('pdf') ? 'PDF • DOCUMENT' : 'WORD • DOCUMENT'}
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              onClick={() => {
                                const downloadToast = toast.loading("Starting download...");
                                try {
                                  const byteCharacters = atob(msg.conversion.file);
                                  const byteNumbers = new Array(byteCharacters.length);
                                  for (let i = 0; i < byteCharacters.length; i++) {
                                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                                  }
                                  const byteArray = new Uint8Array(byteNumbers);
                                  const blob = new Blob([byteArray], { type: msg.conversion.mimeType });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = msg.conversion.fileName;
                                  document.body.appendChild(a);
                                  a.click();
                                  setTimeout(() => {
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                    toast.dismiss(downloadToast);
                                    toast.success("Download complete!");
                                  }, 500);
                                } catch (err) {
                                  toast.dismiss(downloadToast);
                                  toast.error("Download failed");
                                }
                              }}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl transition-all shadow-lg font-bold text-sm active:scale-95 hover:opacity-90"
                              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                            >
                              <Download className="w-4 h-4" />
                              Download {msg.conversion.mimeType.includes('audio') ? 'Audio' : msg.conversion.mimeType.includes('pdf') ? 'PDF' : 'Document'}
                            </button>

                            <Menu as="div" className="relative">
                              <Menu.Button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 border border-transparent text-maintext rounded-xl transition-all hover:bg-white/20 font-bold text-sm shadow-sm active:scale-95 whitespace-nowrap backdrop-blur-sm">
                                <Share className="w-4 h-4" />
                                Share
                              </Menu.Button>

                              <Portal>
                                <Transition
                                  as={Fragment}
                                  enter="transition ease-out duration-100"
                                  enterFrom="transform opacity-0 scale-95"
                                  enterTo="transform opacity-100 scale-100"
                                  leave="transition ease-in duration-75"
                                  leaveFrom="transform opacity-100 scale-100"
                                  leaveTo="transform opacity-0 scale-95"
                                >
                                  <Menu.Items
                                    anchor="bottom end"
                                    className="w-56 mt-2 origin-top-right divide-y divide-transparent rounded-xl bg-white/10 dark:bg-black/40 backdrop-blur-2xl shadow-2xl border border-transparent focus:outline-none z-[100] overflow-hidden"
                                  >
                                    <div className="px-1 py-1">
                                      <Menu.Item>
                                        {({ active }) => (
                                          <button
                                            onClick={() => {
                                              const text = `I've converted "${msg.conversion.fileName}" into voice audio using AI Ads! ${window.location.href}`;
                                              const url = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
                                                ? `whatsapp://send?text=${encodeURIComponent(text)}`
                                                : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
                                              window.open(url, '_blank', 'noopener');
                                            }}
                                            className={`${active ? 'bg-green-500 text-white' : 'text-maintext'} group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors`}
                                          >
                                            <MessageCircle className="h-4 w-4" />
                                            WhatsApp
                                          </button>
                                        )}
                                      </Menu.Item>
                                      <Menu.Item>
                                        {({ active }) => (
                                          <button
                                            onClick={() => {
                                              const text = `AI Ads Audio Conversion: ${msg.conversion.fileName}`;
                                              const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
                                              window.open(url, '_blank');
                                            }}
                                            className={`${active ? 'bg-sky-500 text-white' : 'text-maintext'} group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors`}
                                          >
                                            <Send className="h-4 w-4" />
                                            Telegram
                                          </button>
                                        )}
                                      </Menu.Item>
                                    </div>
                                    <div className="px-1 py-1">
                                      <Menu.Item>
                                        {({ active }) => (
                                          <button
                                            onClick={() => {
                                              navigator.clipboard.writeText(window.location.href);
                                              toast.success("Link copied!");
                                            }}
                                            className={`${active ? 'bg-primary text-white' : 'text-maintext'} group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors`}
                                          >
                                            <Copy className="h-4 w-4" />
                                            Copy Link
                                          </button>
                                        )}
                                      </Menu.Item>
                                    </div>
                                  </Menu.Items>
                                </Transition>
                              </Portal>
                            </Menu>
                          </div>
                        </div>
                      )}

                      {/* AI Feedback Actions - Strictly hide for media and processing */}
                      {(msg.role === 'model' || msg.role === 'assistant') &&
                        !msg.conversion && !msg.imageUrl && !msg.videoUrl &&
                        !msg.isProcessing && !msg.isGenerating && !msg.error &&
                        typingMessageId !== msg.id && (
                          <div className="mt-4 w-full block">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
                              {(() => {
                                // Detect if the AI response contains Hindi (Devanagari script)
                                const isHindiContent = /[\u0900-\u097F]/.test(msg.content);
                                const prompts = isHindiContent ? FEEDBACK_PROMPTS.hi : FEEDBACK_PROMPTS.en;
                                const msgIdentifier = (msg.id || msg._id || Date.now()).toString();
                                const promptIndex = (msgIdentifier.charCodeAt(msgIdentifier.length - 1) || 0) % prompts.length;
                                return (
                                  <p className="text-xs text-subtext font-medium flex items-center gap-1.5 shrink-0 m-0">
                                    {prompts[promptIndex]}
                                    <span className="text-sm">😊</span>
                                  </p>
                                );
                              })()}
                              <div className="flex flex-col items-end gap-2 self-end sm:self-auto">
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => {
                                      // Language is auto-detected inside speakResponse / detectLanguageFromText
                                      speakResponse(msg.content, null, msg.id, msg.attachments || [], true);
                                    }}
                                    className={`transition-colors p-1.5 rounded-lg ${speakingMessageId === msg.id
                                      ? 'text-primary bg-primary/10'
                                      : 'text-subtext hover:text-primary hover:bg-surface-hover'
                                      }`}
                                    title={speakingMessageId === msg.id && !isPaused ? "Pause" : "Speak"}
                                  >
                                    {speakingMessageId === msg.id && !isPaused ? (
                                      <Pause className="w-3.5 h-3.5" />
                                    ) : (
                                      <Volume2 className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleCopyMessage(msg.content)}
                                    className="text-subtext hover:text-maintext transition-colors p-1.5 hover:bg-surface-hover rounded-lg"
                                    title="Copy"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleThumbsUp(msg.id)}
                                    className={`transition-colors p-1.5 rounded-lg ${messageFeedback[msg.id]?.type === 'up'
                                      ? 'text-blue-500 bg-blue-500/10'
                                      : 'text-subtext hover:text-primary hover:bg-surface-hover'
                                      }`}
                                    title="Helpful"
                                  >
                                    <ThumbsUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleThumbsDown(msg.id)}
                                    className={`transition-colors p-1.5 rounded-lg ${messageFeedback[msg.id]?.type === 'down'
                                      ? 'text-red-500 bg-red-500/10'
                                      : 'text-subtext hover:text-red-500 hover:bg-surface-hover'
                                      }`}
                                    title="Not Helpful"
                                  >
                                    <ThumbsDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleShare(msg.content)}
                                    className="text-subtext hover:text-primary transition-colors p-1.5 hover:bg-surface-hover rounded-lg"
                                    title="Share Text"
                                  >
                                    <Share className="w-3.5 h-3.5" />
                                  </button>

                                  {/* PDF Tools — Always show Download */}
                                  <div className="flex items-center gap-1 border-l border-zinc-200 dark:border-zinc-800 ml-2 pl-2">
                                    <button
                                      onClick={() => handleDownloadPdf(msg)}
                                      className="text-red-500 hover:text-red-600 transition-all p-1.5 hover:bg-red-50/10 rounded-lg flex items-center gap-1 active:scale-95 group/pdf"
                                      title="Download Ready-Made PDF Report"
                                    >
                                      <FileText className="w-3.5 h-3.5 group-hover/pdf:scale-110 transition-transform" />
                                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      
                      {/* Integrated Smart Suggestions (Only for the latest AI response) */}
                      {idx === messages.length - 1 && (msg.role === 'model' || msg.role === 'assistant') && 
                       suggestions.length > 0 && !isLoading && !typingMessageId && (
                        <div className="suggestions-container animate-in fade-in slide-in-from-bottom-3 duration-500">
                          {suggestions.map((item, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(item)}
                              className="suggestion-btn"
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      )}


                      {/* Timestamp & User Actions */}
                      <div className="mt-4 flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {msg.role === 'user' && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleMessageDelete(msg.id)}
                              className="p-1.5 text-subtext hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMessageUndo(msg)}
                              className="p-1.5 text-subtext hover:text-indigo-500 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                              title="Undo/Restore to Input"
                            >
                              <Undo2 className="w-3.5 h-3.5" />
                            </button>
                            {!msg.attachment && (
                              <button
                                onClick={() => startEditing(msg)}
                                className="p-1.5 text-subtext hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleCopyMessage(msg.content || msg.text)}
                              className="p-1.5 text-subtext hover:text-maintext hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                              title="Copy"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        <span className="text-[10px] text-subtext font-medium">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && !typingMessageId && (
                <AisaTypingIndicator
                  visible={true}
                  message={
                    isImageGeneration ? "AISA Generating..." :
                      isVideoGeneration ? "Generating cinematic video..." :
                        isMagicEditing ? "Processing image edit..." :
                          isDeepSearch ? "Deep searching..." :
                            "AISA is thinking"
                  }
                />
              )}
            </>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Welcome Screen - Absolute Overlay */}
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div
              key="welcome-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              className="absolute inset-0 z-0 overflow-y-auto no-scrollbar scroll-smooth pointer-events-auto bg-transparent"
            >
              {/* Removed duplicate background component */}
              <div className="relative z-10 flex flex-col items-center w-full min-h-screen pt-12">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="mb-12"
                >
                  <img
                    src="/logo/Logo.svg"
                    alt="AISA"
                    className="w-20 h-20 sm:w-24 sm:h-24 mx-auto drop-shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all duration-700 hover:scale-110"

                  />
                </motion.div>

                <section className="w-full pb-32 px-1 sm:px-2 md:px-0">
                  <FuturisticToolCards
                    isAdmin={isAdminUser}
                    activeToolId={
                      isImageGeneration ? 'image' :
                        isVideoGeneration ? 'video' :
                          isDeepSearch ? 'deep_search' :
                            isWebSearch ? 'web_search' :
                              isCodeWriter ? 'code' :
                                isAudioConvertMode ? 'audio' :
                                  isFileAnalysis ? 'document' :
                                    isMagicEditing ? 'edit_image' :
                                      isMagicVideoModalOpen ? 'image_to_video' :
                                        isStockModalOpen ? 'ai_cashflow' :
                                          (activeLegalToolkit || currentMode === 'LEGAL_TOOLKIT') ? 'legal' : null
                    }
                    onToolSelect={(id) => {
                      // Reset states
                      setIsImageGeneration(false);
                      setIsVideoGeneration(false);
                      setIsAudioConvertMode(false);
                      setIsCodeWriter(false);
                      setIsDeepSearch(false);
                      setIsWebSearch(false);
                      setIsFileAnalysis(false);
                      setIsMagicEditing(false);
                      setIsMagicVideoModalOpen(false);
                      setIsCashFlowMode(false);
                      setActiveLegalToolkit(false);

                      if (id === 'image') {
                        if (!checkPremiumTool('Image Generation')) return;
                        setIsImageGeneration(true);
                        setIsMagicSettingsOpen(true);
                        if (inputRef.current) { inputRef.current.value = "Generate an image of "; inputRef.current.focus(); }
                        toast.success("Image Mode Active");
                      } else if (id === 'video') {
                        if (!checkPremiumTool('Generate Video')) return;
                        setIsVideoGeneration(true);
                        setIsMagicSettingsOpen(true);
                        if (inputRef.current) { inputRef.current.value = "Generate a video of "; inputRef.current.focus(); }
                        toast.success("Video Mode Active");
                      } else if (id === 'audio') {
                        if (!checkPremiumTool('Convert to Audio')) return;
                        setIsAudioConvertMode(true);
                        if (inputRef.current) { inputRef.current.value = "Convert this text to audio: "; inputRef.current.focus(); }
                        toast.success("Audio Mode Active");
                      } else if (id === 'code') {
                        if (!checkPremiumTool('Code Writer')) return;
                        setIsCodeWriter(true);
                        if (inputRef.current) { inputRef.current.value = "Write a function to "; inputRef.current.focus(); }
                        toast.success("Code Mode Active");
                      } else if (id === 'deep_search') {
                        setIsDeepSearch(true);
                        if (inputRef.current) { inputRef.current.value = "Research in-depth about "; inputRef.current.focus(); }
                        toast.success("Deep Intelligence Active");
                      } else if (id === 'web_search') {
                        setIsWebSearch(true);
                        if (inputRef.current) { inputRef.current.value = "Search for live updates on "; inputRef.current.focus(); }
                        toast.success("Real-Time Search Active");
                      } else if (id === 'document') {
                        setIsFileAnalysis(true);
                        uploadInputRef.current?.click();
                        toast.success("Upload document for analysis");
                      } else if (id === 'edit_image') {
                        if (!checkPremiumTool('Edit Image')) return;
                        setIsMagicEditing(true);
                        toast.success("Image Editor Active");
                      } else if (id === 'image_to_video') {
                        if (!checkPremiumTool('Image to Video')) return;
                        setIsMagicVideoModalOpen(true);
                        toast.success("Image to Video Active");
                      } else if (id === 'legal') {
                        if (!checkPremiumTool('AI Legal')) return;
                        setActiveLegalToolkit(true);
                        toast.success("AI Legal Enabled ⚖️");
                      } else if (id === 'ai_cashflow') {
                        if (!checkPremiumTool('AI CashFlow')) return;
                        setIsStockModalOpen(true);
                        toast.success("AI CashFlow Active 📈");
                      } else if (id === 'aiad_agent') {
                        if (!checkPremiumTool('AI Ad Agent')) return;
                        setIsSocialMediaDashboardOpen(true);
                        toast.success("AIADS™ Active");
                      }
                    }}
                  />
                </section>
              </div>

            </motion.div>
          )}
        </AnimatePresence>


        {/* Unified Chat Input Container */}
        <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none" style={{ padding: 'max(0.375rem, env(safe-area-inset-bottom, 0.375rem)) 0.5rem max(0.375rem, 0.375rem) 0.5rem' }}>
          {/* Bottom Mask to prevent text showing behind input area */}
          <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/90 to-transparent -z-10 h-full w-full pointer-events-none" />
          <div className="max-w-5xl mx-auto w-full pointer-events-auto">

            <form
              onSubmit={handleSendMessage}
              className="relative w-full flex flex-col transition-all duration-300 backdrop-blur-3xl p-3 z-50 aisa-chat-input-wrapper bg-[#f8f9fc]/90 dark:bg-zinc-900/95 border border-slate-200/50 dark:border-zinc-800/80 rounded-[32px] shadow-2xl ring-1 ring-black/5 overflow-visible"
            >
              {/* Internal File Preview Area */}
              {filePreviews.length > 0 && (
                <div className="flex flex-wrap gap-4 px-2 py-2 mb-2">
                  {filePreviews.map((preview) => (
                    <div key={preview.id} className="relative group shrink-0 w-[68px] sm:w-[76px] aspect-square bg-slate-100 dark:bg-zinc-800 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-700 overflow-visible">
                      {preview.type.startsWith('image/') ? (
                        <div className="w-full h-full rounded-2xl overflow-hidden">
                          <img src={preview.url} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-1">
                          <FileText className="w-7 h-7 text-primary/60" />
                          <span className="text-[7px] font-black uppercase text-primary/70 mt-1 truncate px-1">{preview.type.split('/')[1]?.split('-')[0] || 'FILE'}</span>
                        </div>
                      )}
                      <div className="absolute -top-1.5 -right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-[101]">
                        <button type="button" className="w-6 h-6 bg-white dark:bg-zinc-700 text-slate-800 dark:text-white rounded-full flex items-center justify-center shadow-lg border border-slate-100 dark:border-zinc-600 hover:scale-110"><Edit2 size={12} /></button>
                        <button type="button" onClick={() => handleRemoveFile(preview.id)} className="w-6 h-6 bg-white dark:bg-zinc-700 text-red-500 rounded-full flex items-center justify-center shadow-lg border border-slate-100 dark:border-zinc-600 hover:scale-110"><X size={12} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reference Image Preview */}
              {isMagicEditing && editRefImage && filePreviews.length === 0 && (
                <div className="flex p-2 mb-1">
                  <div className="relative group shrink-0 w-16 h-16 bg-white dark:bg-zinc-800 border border-primary/20 rounded-xl shadow-md overflow-visible">
                    <img src={editRefImage.url} alt="Reference" className="w-full h-full object-cover rounded-xl" />
                    <button type="button" onClick={() => setEditRefImage(null)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-zinc-900 text-white rounded-full flex items-center justify-center shadow-lg border border-white/20"><X size={12} /></button>
                  </div>
                </div>
              )}

              <input id="file-upload" type="file" ref={uploadInputRef} onChange={handleFileSelect} multiple className="hidden" />
              <input id="drive-upload" type="file" ref={driveInputRef} onChange={handleFileSelect} multiple className="hidden" />
              <input id="doc-voice-upload" type="file" onChange={handleDocToVoiceSelect} className="hidden" accept=".pdf,.doc,.docx,.txt" />
              <input id="photos-upload" type="file" ref={photosInputRef} onChange={handleFileSelect} multiple className="hidden" accept="image/*" />
              <input id="camera-upload" type="file" onChange={handleFileSelect} className="hidden" accept="image/*" capture="environment" />

              <div className="flex items-end gap-2 w-full">


                {/* AI CashFlow Search Results Dropdown */}
                {isCashFlowMode && Array.isArray(stockSearchResults) && stockSearchResults.length > 0 && (
                  <div className="absolute bottom-full left-0 right-0 mb-3 px-2 z-[110] pointer-events-auto max-h-[300px] overflow-y-auto custom-scrollbar">
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
                      {stockSearchResults.map((stock) => (
                        <button
                          key={stock.symbol}
                          type="button"
                          onClick={() => {
                            setSelectedStock(stock);
                            setInputValue(stock.name);
                            setStockSearchResults([]);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-primary/10 border-b border-slate-100 dark:border-zinc-800 last:border-0 flex items-center justify-between group transition-colors"
                        >
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 dark:text-white group-hover:text-primary transition-colors">{stock.symbol}</span>
                            <span className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-1">{stock.name}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-slate-500 dark:text-zinc-400 font-bold uppercase">{stock.region}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Left Actions Group */}
                <div className="flex items-center gap-[2px] pl-[2px] shrink-0">
                  <AnimatePresence>
                    {isAttachMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        ref={menuRef}
                        className={`absolute bottom-full left-0 ${(isWebSearch || isDeepSearch || isImageGeneration || isVideoGeneration || isVoiceMode || isAudioConvertMode || isDocumentConvert || isCodeWriter || isMagicEditing || isFileAnalysis || isCashFlowMode || activeLegalToolkit || currentMode === 'LEGAL_TOOLKIT') ? 'mb-[60px]' : 'mb-4'} w-[min(85vw,220px)] bg-surface/95 dark:bg-[#1a1a1a]/95 border border-border/50 rounded-2xl shadow-2xl overflow-hidden z-[110] backdrop-blur-xl ring-1 ring-black/5`}
                      >
                        <div className="p-2 space-y-1">
                          {getAgentCapabilities(activeAgent.agentName, activeAgent.category).canCamera && (
                            <label
                              htmlFor="camera-upload"
                              onClick={() => setTimeout(() => setIsAttachMenuOpen(false), 500)}
                              className="w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-primary/10 rounded-xl transition-all group cursor-pointer"
                            >
                              <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/20 transition-colors shrink-0">
                                <Camera className="w-4 h-4 text-subtext group-hover:text-primary transition-colors" />
                              </div>
                              <span className="text-[13px] font-semibold text-maintext group-hover:text-primary transition-colors">Camera & Scan</span>
                            </label>
                          )}
                          <label
                            htmlFor="file-upload"
                            onClick={() => setIsAttachMenuOpen(false)}
                            className="w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-primary/10 rounded-xl transition-all group cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/20 transition-colors shrink-0">
                              <Paperclip className="w-4 h-4 text-subtext group-hover:text-primary transition-colors" />
                            </div>
                            <span className="text-[13px] font-semibold text-maintext group-hover:text-primary transition-colors">Upload files</span>
                          </label>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {isToolsMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        ref={toolsMenuRef}
                        className={`absolute bottom-full left-0 ${(isWebSearch || isDeepSearch || isImageGeneration || isVideoGeneration || isVoiceMode || isAudioConvertMode || isDocumentConvert || isCodeWriter || isMagicEditing || isFileAnalysis || isCashFlowMode || activeLegalToolkit || currentMode === 'LEGAL_TOOLKIT') ? 'mb-[60px]' : 'mb-[16px]'} w-[min(94vw,310px)] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[36px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)] overflow-hidden z-[110] ring-1 ring-black/5`}
                        style={{ maxHeight: 'calc(100vh - 180px)' }}
                      >
                        <div className="px-6 py-5 bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-100 dark:border-zinc-800 shrink-0">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/20">
                              <Brain className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-[16px] font-black text-slate-800 dark:text-white uppercase tracking-tight">
                              AISA ™ Magic Tools
                            </h3>
                          </div>
                        </div>
                        <div className="p-1.5 pb-12 space-y-1 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(100vh - 220px)' }}>
                          <button
                            type="button"
                            onClick={() => {
                              if (!checkPremiumTool('AI Ad Agent')) return;
                              setIsToolsMenuOpen(false);
                              setIsSocialMediaDashboardOpen(true);
                            }}
                            className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3.5 rounded-3xl transition-all group cursor-pointer border-2 bg-white/50 dark:bg-white/5 border-white/80 dark:border-white/5 hover:border-primary/30 hover:bg-white dark:hover:bg-zinc-800 shadow-sm hover:shadow-md`}
                          >
                            <div className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)] bg-slate-50 dark:bg-zinc-800 border-white dark:border-zinc-700 text-slate-600 dark:text-slate-300`}>
                              <Megaphone className="w-5.5 h-5.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="aisa-badge-small !bg-primary !text-white !font-black !px-2 !rounded-md">AISA ™</span>
                                <span className="text-[14.5px] font-extrabold text-slate-800 dark:text-white leading-none">AIADS™</span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Automate 30 days of social media content.</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (!checkPremiumTool('Generate Image')) return;
                              setIsToolsMenuOpen(false);
                              const newMode = !isImageGeneration;
                              setIsImageGeneration(newMode);
                              setIsVideoGeneration(false);
                              setIsDeepSearch(false);
                              setIsAudioConvertMode(false);
                              setIsDocumentConvert(false);
                              setIsCodeWriter(false);
                              if (newMode) {
                                setIsMagicSettingsOpen(true);
                                toast.success("Image Generation Mode Enabled");
                              }
                            }}
                            className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3.5 rounded-3xl transition-all group cursor-pointer border-2 ${isImageGeneration ? 'bg-primary/5 border-primary/20 shadow-inner' : 'bg-white/50 dark:bg-white/5 border-white/80 dark:border-white/5 hover:border-primary/30 hover:bg-white dark:hover:bg-zinc-800 shadow-sm hover:shadow-md'}`}
                          >
                            <div className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)] ${isImageGeneration ? 'bg-primary border-primary text-white' : 'bg-slate-50 dark:bg-zinc-800 border-white dark:border-zinc-700 text-slate-600 dark:text-slate-300'}`}>
                              <ImageIcon className="w-5.5 h-5.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="aisa-badge-small !bg-primary !text-white !font-black !px-2 !rounded-md">AISA ™</span>
                                <span className="text-[14.5px] font-extrabold text-slate-800 dark:text-white leading-none">Generate Image</span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Create unique AI art from your text.</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (!checkPremiumTool('Generate Video')) return;
                              setIsToolsMenuOpen(false);
                              const newMode = !isVideoGeneration;
                              setIsVideoGeneration(newMode);
                              setIsImageGeneration(false);
                              setIsDeepSearch(false);
                              setIsAudioConvertMode(false);
                              setIsDocumentConvert(false);
                              setIsCodeWriter(false);
                              if (newMode) {
                                setIsMagicSettingsOpen(true);
                                toast.success("Video Generation Mode Enabled");
                              }
                            }}
                            className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3.5 rounded-3xl transition-all group cursor-pointer border-2 ${isVideoGeneration ? 'bg-primary/5 border-primary/20 shadow-inner' : 'bg-white/50 dark:bg-white/5 border-white/80 dark:border-white/5 hover:border-primary/30 hover:bg-white dark:hover:bg-zinc-800 shadow-sm hover:shadow-md'}`}
                          >
                            <div className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)] ${isVideoGeneration ? 'bg-primary border-primary text-white' : 'bg-slate-50 dark:bg-zinc-800 border-white dark:border-zinc-700 text-slate-600 dark:text-slate-300'}`}>
                              <Video className="w-5.5 h-5.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="aisa-badge-small !bg-primary !text-white !font-black !px-2 !rounded-md">AISA ™</span>
                                <span className="text-[14.5px] font-extrabold text-slate-800 dark:text-white leading-none">Generate Video</span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Convert scenes into dynamic videos.</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (!checkPremiumTool('Web Search')) return;
                              setIsToolsMenuOpen(false);
                              setIsWebSearch(!isWebSearch);
                              setIsDeepSearch(false);
                              setIsImageGeneration(false);
                              setIsVideoGeneration(false);
                              setIsAudioConvertMode(false);
                              setIsDocumentConvert(false);
                              setIsCodeWriter(false);
                              if (!isWebSearch) toast.success("Real-Time Web Search Active");
                            }}
                            className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3.5 rounded-3xl transition-all group cursor-pointer border-2 ${isWebSearch ? 'bg-primary/5 border-primary/20 shadow-inner' : 'bg-white/50 dark:bg-white/5 border-white/80 dark:border-white/5 hover:border-primary/30 hover:bg-white dark:hover:bg-zinc-800 shadow-sm hover:shadow-md'}`}
                          >
                            <div className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)] ${isWebSearch ? 'bg-primary border-primary text-white' : 'bg-slate-50 dark:bg-zinc-800 border-white dark:border-zinc-700 text-slate-600 dark:text-slate-300'}`}>
                              <Globe className="w-5.5 h-5.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="aisa-badge-small !bg-primary !text-white !font-black !px-2 !rounded-md">AISA ™</span>
                                <span className="text-[14.5px] font-extrabold text-slate-800 dark:text-white leading-none">Web Search</span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Fast and accurate web queries.</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (!checkPremiumTool('Deep Search')) return;
                              setIsToolsMenuOpen(false);
                              setIsDeepSearch(!isDeepSearch);
                              setIsWebSearch(false);
                              setIsImageGeneration(false);
                              setIsVideoGeneration(false);
                              setIsAudioConvertMode(false);
                              setIsDocumentConvert(false);
                              setIsCodeWriter(false);
                              if (!isDeepSearch) toast.success("Deep Search Mode Enabled");
                            }}
                            className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3.5 rounded-3xl transition-all group cursor-pointer border-2 ${isDeepSearch ? 'bg-primary/5 border-primary/20 shadow-inner' : 'bg-white/50 dark:bg-white/5 border-white/80 dark:border-white/5 hover:border-primary/30 hover:bg-white dark:hover:bg-zinc-800 shadow-sm hover:shadow-md'}`}
                          >
                            <div className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)] ${isDeepSearch ? 'bg-primary border-primary text-white' : 'bg-slate-50 dark:bg-zinc-800 border-white dark:border-zinc-700 text-slate-600 dark:text-slate-300'}`}>
                              <Search className="w-5.5 h-5.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="aisa-badge-small !bg-primary !text-white !font-black !px-2 !rounded-md">AISA ™</span>
                                <span className="text-[14.5px] font-extrabold text-slate-800 dark:text-white leading-none">Deep Search</span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">In-depth analysis and data mining.</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (!checkPremiumTool('Convert to Audio')) return;
                              setIsToolsMenuOpen(false);
                              setIsAudioConvertMode(!isAudioConvertMode);
                              setIsDeepSearch(false);
                              setIsImageGeneration(false);
                              setIsVideoGeneration(false);
                              setIsDocumentConvert(false);
                              setIsCodeWriter(false);
                              if (!isAudioConvertMode) toast.success("Convert to Audio Mode Active");
                            }}
                            className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3.5 rounded-3xl transition-all group cursor-pointer border-2 ${isAudioConvertMode ? 'bg-primary/5 border-primary/20 shadow-inner' : 'bg-white/50 dark:bg-white/5 border-white/80 dark:border-white/5 hover:border-primary/30 hover:bg-white dark:hover:bg-zinc-800 shadow-sm hover:shadow-md'}`}
                          >
                            <div className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)] ${isAudioConvertMode ? 'bg-primary border-primary text-white' : 'bg-slate-50 dark:bg-zinc-800 border-white dark:border-zinc-700 text-slate-600 dark:text-slate-300'}`}>
                              <Headphones className="w-5.5 h-5.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="aisa-badge-small !bg-primary !text-white !font-black !px-2 !rounded-md">AISA ™</span>
                                <span className="text-[14.5px] font-extrabold text-slate-800 dark:text-white leading-none">Convert to Audio</span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Natural-sounding text-to-speech.</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (!checkPremiumTool('Convert Documents')) return;
                              setIsToolsMenuOpen(false);
                              setIsDocumentConvert(!isDocumentConvert);
                              setIsDeepSearch(false);
                              setIsImageGeneration(false);
                              setIsVideoGeneration(false);
                              setIsAudioConvertMode(false);
                              setIsCodeWriter(false);
                              if (!isDocumentConvert) toast.success("Document Converter Mode Active");
                            }}
                            className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3.5 rounded-3xl transition-all group cursor-pointer border-2 ${isDocumentConvert ? 'bg-primary/5 border-primary/20 shadow-inner' : 'bg-white/50 dark:bg-white/5 border-white/80 dark:border-white/5 hover:border-primary/30 hover:bg-white dark:hover:bg-zinc-800 shadow-sm hover:shadow-md'}`}
                          >
                            <div className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)] ${isDocumentConvert ? 'bg-primary border-primary text-white' : 'bg-slate-50 dark:bg-zinc-800 border-white dark:border-zinc-700 text-slate-600 dark:text-slate-300'}`}>
                              <FileText className="w-5.5 h-5.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="aisa-badge-small !bg-primary !text-white !font-black !px-2 !rounded-md">AISA ™</span>
                                <span className="text-[14.5px] font-extrabold text-slate-800 dark:text-white leading-none">Convert Documents</span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Format conversion and text extraction.</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (!checkPremiumTool('Code Writer')) return;
                              setIsToolsMenuOpen(false);
                              setIsCodeWriter(!isCodeWriter);
                              setIsDeepSearch(false);
                              setIsImageGeneration(false);
                              setIsVideoGeneration(false);
                              setIsAudioConvertMode(false);
                              setIsDocumentConvert(false);
                              setIsEditingImage(false);
                              setIsMagicEditing(false);
                              if (!isCodeWriter) toast.success("Code Writer Mode Enabled");
                            }}
                            className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3.5 rounded-3xl transition-all group cursor-pointer border-2 ${isCodeWriter ? 'bg-primary/5 border-primary/20 shadow-inner' : 'bg-white/50 dark:bg-white/5 border-white/80 dark:border-white/5 hover:border-primary/30 hover:bg-white dark:hover:bg-zinc-800 shadow-sm hover:shadow-md'}`}
                          >
                            <div className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)] ${isCodeWriter ? 'bg-primary border-primary text-white' : 'bg-slate-50 dark:bg-zinc-800 border-white dark:border-zinc-700 text-slate-600 dark:text-slate-300'}`}>
                              <Code className="w-5.5 h-5.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="aisa-badge-small !bg-primary !text-white !font-black !px-2 !rounded-md">AISA ™</span>
                                <span className="text-[14.5px] font-extrabold text-slate-800 dark:text-white leading-none">Code Writer</span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Generate multi-language code snippets.</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (!checkPremiumTool('Edit Image')) return;
                              setIsToolsMenuOpen(false);
                              const newMode = !isMagicEditing;
                              setIsMagicEditing(newMode);

                              if (newMode && !editRefImage && messages.length > 0) {
                                const lastImg = [...messages].reverse().find(m => m.imageUrl);
                                if (lastImg) setEditRefImage({ url: lastImg.imageUrl, name: 'Last Generated', type: 'image' });
                              }

                              setIsImageGeneration(false);
                              setIsVideoGeneration(false);
                              setIsDeepSearch(false);
                              setIsWebSearch(false);
                              setIsAudioConvertMode(false);
                              setIsDocumentConvert(false);
                              setIsCodeWriter(false);
                              setIsCashFlowMode(false);
                              setIsFileAnalysis(false);
                              if (newMode) {
                                setIsMagicSettingsOpen(true);
                                toast.success("Image Editing Enabled");
                              }
                            }}
                            className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3.5 rounded-3xl transition-all group cursor-pointer border-2 ${isMagicEditing ? 'bg-primary/5 border-primary/20 shadow-inner' : 'bg-white/50 dark:bg-white/5 border-white/80 dark:border-white/5 hover:border-primary/30 hover:bg-white dark:hover:bg-zinc-800 shadow-sm hover:shadow-md'}`}
                          >
                            <div className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)] ${isMagicEditing ? 'bg-primary border-primary text-white' : 'bg-slate-50 dark:bg-zinc-800 border-white dark:border-zinc-700 text-slate-600 dark:text-slate-300'}`}>
                              <Wand2 className="w-5.5 h-5.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="aisa-badge-small !bg-primary !text-white !font-black !px-2 !rounded-md">AISA ™</span>
                                <span className="text-[14.5px] font-extrabold text-slate-800 dark:text-white leading-none">Edit Image</span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Magic Image Editor.</p>
                            </div>
                          </button>


                          <button
                            type="button"
                            onClick={() => {
                              if (!checkPremiumTool('AI CashFlow')) return;
                              setIsToolsMenuOpen(false);
                              const newMode = !isCashFlowMode;
                              setIsCashFlowMode(newMode);

                              setIsImageGeneration(false);
                              setIsVideoGeneration(false);
                              setIsDeepSearch(false);
                              setIsWebSearch(false);
                              setIsAudioConvertMode(false);
                              setIsDocumentConvert(false);
                              setIsCodeWriter(false);
                              setIsMagicEditing(false);
                              setIsFileAnalysis(false);
                              if (newMode) {
                                setIsStockModalOpen(true);
                                toast.success("AI CashFlow Explorer Active");
                              }
                            }}
                            className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3.5 rounded-3xl transition-all group cursor-pointer border-2 ${isCashFlowMode ? 'bg-primary/5 border-primary/20 shadow-inner' : 'bg-white/50 dark:bg-white/5 border-white/80 dark:border-white/5 hover:border-primary/30 hover:bg-white dark:hover:bg-zinc-800 shadow-sm hover:shadow-md'}`}
                          >
                            <div className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)] ${isCashFlowMode ? 'bg-primary border-primary text-white' : 'bg-slate-50 dark:bg-zinc-800 border-white dark:border-zinc-700 text-slate-600 dark:text-slate-300'}`}>
                              <TrendingUp className="w-5.5 h-5.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="aisa-badge-small !bg-primary !text-white !font-black !px-2 !rounded-md">AISA ™</span>
                                <span className="text-[14.5px] font-extrabold text-slate-800 dark:text-white leading-none">AI CashFlow</span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Live Analysis & Reports.</p>
                            </div>
                          </button>


                          <button
                            type="button"
                            onClick={() => {
                              if (!checkPremiumTool('AI Legal')) return;
                              setIsToolsMenuOpen(false);
                              const newMode = !activeLegalToolkit;
                              setActiveLegalToolkit(newMode);
                              setIsImageGeneration(false);
                              setIsVideoGeneration(false);
                              setIsDeepSearch(false);
                              setIsAudioConvertMode(false);
                              setIsDocumentConvert(false);
                              setIsCodeWriter(false);
                              setIsMagicEditing(false);
                              if (newMode) toast.success("AI Legal Enabled ⚖️");
                            }}
                            className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3.5 rounded-3xl transition-all group cursor-pointer border-2 ${activeLegalToolkit ? 'bg-primary/5 border-primary/20 shadow-inner' : 'bg-white/50 dark:bg-white/5 border-white/80 dark:border-white/5 hover:border-primary/30 hover:bg-white dark:hover:bg-zinc-800 shadow-sm hover:shadow-md'}`}
                          >
                            <div className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)] ${activeLegalToolkit ? 'bg-primary border-primary text-white' : 'bg-slate-50 dark:bg-zinc-800 border-white dark:border-zinc-700 text-slate-600 dark:text-slate-300'}`}>
                              <Scale className="w-5.5 h-5.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="aisa-badge-small !bg-primary !text-white !font-black !px-2 !rounded-md">AISA ™</span>
                                <span className="text-[14.5px] font-extrabold text-slate-800 dark:text-white leading-none">AI Legal</span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">7 specialized AI legal tools.</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (!checkPremiumTool('Image to Video')) return;
                              setIsToolsMenuOpen(false);
                              setIsMagicVideoModalOpen(true);
                            }}
                            className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3.5 rounded-3xl transition-all group cursor-pointer border-2 bg-white/50 dark:bg-white/5 border-white/80 dark:border-white/5 hover:border-primary/30 hover:bg-white dark:hover:bg-zinc-800 shadow-sm hover:shadow-md`}
                          >
                            <div className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)] bg-slate-50 dark:bg-zinc-800 border-white dark:border-zinc-700 text-slate-600 dark:text-slate-300`}>
                              <PlaySquare className="w-5.5 h-5.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="aisa-badge-small !bg-primary !text-white !font-black !px-2 !rounded-md">AISA ™</span>
                                <span className="text-[14.5px] font-extrabold text-slate-800 dark:text-white leading-none">Image to Video</span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Animate your images with AI magic.</p>
                            </div>
                          </button>


                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="relative">
                    <AnimatePresence>
                      {isAttachHovered && <MagicShowEffect />}
                    </AnimatePresence>
                    <motion.button
                      type="button"
                      ref={attachBtnRef}
                      onMouseEnter={() => setIsAttachHovered(true)}
                      onMouseLeave={() => setIsAttachHovered(false)}
                      whileHover={{ scale: 1.15, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setIsAttachMenuOpen(!isAttachMenuOpen);
                        setIsToolsMenuOpen(false);
                      }}
                      className="w-[40px] h-[40px] rounded-full flex items-center justify-center text-subtext hover:text-primary hover:bg-secondary transition-all shadow-sm hover:shadow-md relative overflow-visible z-20"
                      title="Attachments"
                    >
                      <Plus className={`w-[22px] h-[22px] transition-transform duration-300 ${isAttachMenuOpen ? 'rotate-45' : ''}`} />
                    </motion.button>
                  </div>

                  <div className="relative">
                    <AnimatePresence>
                      {(isBrainHovered || isBrainTapped) && <MagicShowEffect isMobileIdle={!isBrainHovered && !isBrainTapped} />}
                    </AnimatePresence>
                    <motion.button
                      type="button"
                      ref={toolsBtnRef}
                      onMouseEnter={() => setIsBrainHovered(true)}
                      onMouseLeave={() => setIsBrainHovered(false)}
                      whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setExplosions(prev => [...prev, {
                          id: Date.now(),
                          x: rect.left + rect.width / 2,
                          y: rect.top + rect.height / 2
                        }]);
                        setIsBrainTapped(true);
                        setTimeout(() => setIsBrainTapped(false), 2000);
                        setIsToolsMenuOpen(!isToolsMenuOpen);
                        setIsAttachMenuOpen(false);
                      }}
                      className="w-[40px] h-[40px] rounded-full flex items-center justify-center bg-secondary/80 text-subtext hover:text-primary transition-colors shadow-lg hover:shadow-primary/40 relative overflow-visible z-20"
                      title="AISA ™ Magic Tools"
                    >
                      <Brain className={`w-[22px] h-[22px] relative z-10 transition-colors ${isBrainHovered ? 'text-primary' : ''}`} />
                      <AnimatePresence>
                        {isBrainHovered && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1.1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="absolute inset-0 rounded-full bg-primary/20 blur-md pointer-events-none"
                          />
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>

                </div>

                <div className="flex-1 flex items-center min-w-0 bg-transparent border-0 ring-0 focus:ring-0">
                  <AnimatePresence>
                    {(isWebSearch || isDeepSearch || isImageGeneration || isVideoGeneration || isVoiceMode || isAudioConvertMode || isDocumentConvert || isCodeWriter || isMagicEditing || isFileAnalysis || isCashFlowMode || activeLegalToolkit || currentMode === 'LEGAL_TOOLKIT') && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 flex gap-2 overflow-x-auto no-scrollbar pointer-events-auto w-[calc(100vw-24px)] max-w-5xl px-2 z-[100] justify-start sm:justify-start">
                        {isCashFlowMode && (
                          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold border border-transparent backdrop-blur-md whitespace-nowrap shrink-0">
                            <TrendingUp size={12} strokeWidth={3} /> <span className="hidden sm:inline">AI CashFlow</span>
                            <button onClick={() => setIsCashFlowMode(false)} className="ml-1 hover:text-primary/80"><X size={12} /></button>
                          </motion.div>
                        )}
                        {isWebSearch && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex items-center gap-3 px-3.5 py-1.5 bg-blue-600/20 dark:bg-blue-500/25 text-blue-700 dark:text-blue-400 rounded-full text-xs font-bold border border-blue-400/40 backdrop-blur-3xl whitespace-nowrap shrink-0 transition-all hover:bg-blue-600/30 group shadow-[0_8px_32px_-4px_rgba(37,99,235,0.3)] relative overflow-hidden ring-1 ring-white/10"
                          >
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50" />
                            <div className="flex items-center gap-2 relative z-10">
                              <div className="w-5 h-5 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/40 text-white">
                                <Globe size={14} strokeWidth={3} />
                              </div>
                              <span className="uppercase tracking-widest text-[9px] font-black hidden xs:inline">Web Search</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsWebSearch(false)}
                              className="ml-1 w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white text-blue-600 dark:text-blue-400 transition-all hover:rotate-90 relative z-10"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          </motion.div>
                        )}
                        {isDeepSearch && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex items-center gap-3 px-3.5 py-1.5 bg-emerald-600/20 dark:bg-emerald-500/25 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold border border-emerald-400/40 backdrop-blur-3xl whitespace-nowrap shrink-0 transition-all hover:bg-emerald-600/30 group shadow-[0_8px_32px_-4px_rgba(16,185,129,0.3)] relative overflow-hidden ring-1 ring-white/10"
                          >
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50" />
                            <div className="flex items-center gap-2 relative z-10">
                              <div className="w-5 h-5 rounded-lg bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/40 text-white">
                                <Search size={14} strokeWidth={3} />
                              </div>
                              <span className="uppercase tracking-widest text-[9px] font-black hidden xs:inline">Deep Search</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsDeepSearch(false)}
                              className="ml-1 w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white text-emerald-600 dark:text-emerald-400 transition-all hover:rotate-90 relative z-10"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          </motion.div>
                        )}
                        {isImageGeneration && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex items-center gap-3 px-3.5 py-1.5 bg-indigo-600/20 dark:bg-indigo-500/25 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-bold border border-indigo-400/40 backdrop-blur-3xl whitespace-nowrap shrink-0 transition-all hover:bg-indigo-600/30 group shadow-[0_8px_32px_-4px_rgba(79,70,229,0.3)] relative overflow-hidden ring-1 ring-white/10"
                          >
                            {/* Glossy Reflection Effect */}
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50" />

                            <div className="flex items-center gap-2 relative z-10">
                              <div className="w-5 h-5 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/40 text-white">
                                <ImageIcon size={14} strokeWidth={3} />
                              </div>
                              <span className="uppercase tracking-widest text-[9px] font-black hidden xs:inline">Image Gen</span>
                            </div>

                            <div className="w-[1px] h-3 bg-indigo-500/40 mx-0.5 relative z-10" />

                            <button
                              type="button"
                              onClick={() => setIsMagicSettingsOpen(!isMagicSettingsOpen)}
                              className="flex items-center gap-1.5 hover:text-indigo-900 dark:hover:text-indigo-200 transition-all px-1.5 py-0.5 rounded-md hover:bg-white/10 relative z-10"
                            >
                              <span className="text-[10px] font-extrabold opacity-90">{imageAspectRatio}</span>
                              <span className="text-[10px] font-black truncate max-w-[60px] sm:max-w-[100px] tracking-tight">
                                {TOOL_PRICING.image.models.find(m => m.id === imageModelId)?.name.replace('AISA ', '') || 'Model'}

                              </span>
                              <ChevronDown size={11} className={`transition-transform duration-300 ${isMagicSettingsOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <button
                              type="button"
                              onClick={() => setIsImageGeneration(false)}
                              className="ml-1 w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white text-indigo-600 dark:text-indigo-400 transition-all hover:rotate-90 relative z-10"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          </motion.div>
                        )}
                        {isVideoGeneration && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex items-center gap-3 px-3.5 py-1.5 bg-violet-600/20 dark:bg-violet-500/25 text-violet-700 dark:text-violet-400 rounded-full text-xs font-bold border border-violet-400/40 backdrop-blur-3xl whitespace-nowrap shrink-0 transition-all hover:bg-violet-600/30 group shadow-[0_8px_32px_-4px_rgba(139,92,246,0.3)] relative overflow-hidden ring-1 ring-white/10"
                          >
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50" />

                            <div className="flex items-center gap-2 relative z-10">
                              <div className="w-5 h-5 rounded-lg bg-violet-600 dark:bg-violet-500 flex items-center justify-center shadow-lg shadow-violet-500/40 text-white">
                                <Video size={14} strokeWidth={3} />
                              </div>
                              <span className="uppercase tracking-widest text-[9px] font-black hidden xs:inline">Video Gen</span>
                            </div>

                            <div className="w-[1px] h-3 bg-violet-500/40 mx-0.5 relative z-10" />

                            <button
                              type="button"
                              onClick={() => setIsMagicSettingsOpen(!isMagicSettingsOpen)}
                              className="flex items-center gap-1.5 hover:text-violet-900 dark:hover:text-violet-200 transition-all px-1.5 py-0.5 rounded-md hover:bg-white/10 relative z-10"
                            >
                              <span className="text-[10px] font-extrabold opacity-90">{videoAspectRatio || 'D'}</span>
                              <span className="text-[10px] font-black tracking-tight ml-1">{videoResolution}</span>
                              <ChevronDown size={11} className={`transition-transform duration-300 ${isMagicSettingsOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <button
                              type="button"
                              onClick={() => setIsVideoGeneration(false)}
                              className="ml-1 w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white text-violet-600 dark:text-violet-400 transition-all hover:rotate-90 relative z-10"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          </motion.div>
                        )}
                        {isVoiceMode && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-2.5 px-3 py-1.5 bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-full text-xs font-bold border border-rose-500/30 backdrop-blur-xl whitespace-nowrap shrink-0 transition-all hover:bg-rose-500/15 group shadow-lg shadow-rose-500/10"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-lg bg-rose-500/20 flex items-center justify-center">
                                <Volume2 size={14} strokeWidth={2.5} />
                              </div>
                              <span className="uppercase tracking-wide text-[10px] font-black hidden sm:inline">Voice Mode</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsVoiceMode(false)}
                              className="ml-1 w-5 h-5 rounded-full flex items-center justify-center hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-all hover:rotate-90"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          </motion.div>
                        )}
                        {isAudioConvertMode && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-2.5 px-3 py-1.5 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold border border-indigo-500/30 backdrop-blur-xl whitespace-nowrap shrink-0 transition-all hover:bg-indigo-500/15 group shadow-lg shadow-indigo-500/10"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                <Headphones size={14} strokeWidth={2.5} />
                              </div>
                              <span className="uppercase tracking-wide text-[10px] font-black hidden sm:inline">Audio Convert</span>
                            </div>
                            <button type="button" onClick={() => setIsVoiceSettingsOpen(true)} className="ml-1 w-5 h-5 rounded-lg flex items-center justify-center hover:bg-indigo-500/20 text-subtext hover:text-indigo-600 transition-colors" title="Voice Settings">
                              <Sliders size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsAudioConvertMode(false)}
                              className="ml-1 w-5 h-5 rounded-full flex items-center justify-center hover:bg-indigo-500/20 text-rose-600 transition-all hover:rotate-90"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          </motion.div>
                        )}
                        {isDocumentConvert && (
                          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold border border-transparent backdrop-blur-md whitespace-nowrap shrink-0">
                            <FileText size={12} strokeWidth={3} /> <span className="hidden sm:inline">Doc Convert</span>
                            <button onClick={() => setIsDocumentConvert(false)} className="ml-1 hover:text-primary/80"><X size={12} /></button>
                          </motion.div>
                        )}
                        {isCodeWriter && (
                          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold border border-transparent backdrop-blur-md whitespace-nowrap shrink-0">
                            <Code size={12} strokeWidth={3} /> <span className="hidden sm:inline">Code Writer</span>
                            <button onClick={() => setIsCodeWriter(false)} className="ml-1 hover:text-primary/80"><X size={12} /></button>
                          </motion.div>
                        )}

                        {(activeLegalToolkit || currentMode === 'LEGAL_TOOLKIT') && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-2.5 px-3 py-1.5 bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 rounded-full text-xs font-bold border border-indigo-500/30 backdrop-blur-xl whitespace-nowrap shrink-0 transition-all hover:bg-indigo-600/15 group shadow-lg shadow-indigo-500/10"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                <Scale size={14} strokeWidth={2.5} />
                              </div>
                              <span className="uppercase tracking-wide text-[10px] font-black truncate max-w-[120px]">
                                AI Legal
                                {(selectedLegalTool || activeTool) && (
                                  <span className="opacity-70 ml-1.5 font-bold border-l border-indigo-500/30 pl-1.5">
                                    {(selectedLegalTool?.name || selectedLegalTool || activeTool)}
                                  </span>
                                )}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveLegalToolkit(false);
                                setCurrentMode('NORMAL_CHAT');
                                setSelectedLegalTool(null);
                                setActiveTool(null);
                              }}
                              className="ml-1 w-5 h-5 rounded-full flex items-center justify-center hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 transition-all hover:rotate-90"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          </motion.div>
                        )}
                        {isMagicEditing && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex items-center gap-3 px-3.5 py-1.5 bg-amber-500/20 dark:bg-amber-500/25 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold border border-amber-400/40 backdrop-blur-3xl whitespace-nowrap shrink-0 transition-all hover:bg-amber-500/30 group shadow-[0_8px_32px_-4px_rgba(245,158,11,0.3)] relative overflow-hidden ring-1 ring-white/10"
                          >
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50" />

                            <div className="flex items-center gap-2 relative z-10">
                              <div className="w-5 h-5 rounded-lg bg-amber-500 dark:bg-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/40 text-white">
                                <Wand2 size={14} strokeWidth={3} />
                              </div>
                              <span className="uppercase tracking-widest text-[9px] font-black hidden xs:inline">{t('imageEdit')}</span>
                            </div>

                            <div className="w-[1px] h-3 bg-amber-500/40 mx-0.5 relative z-10" />

                            <button
                              type="button"
                              onClick={() => setIsMagicSettingsOpen(!isMagicSettingsOpen)}
                              className="flex items-center gap-1.5 hover:text-amber-900 dark:hover:text-amber-200 transition-all px-1.5 py-0.5 rounded-md hover:bg-white/10 relative z-10"
                            >
                              <span className="text-[10px] font-extrabold opacity-90">{imageAspectRatio}</span>
                              <span className="text-[10px] font-black truncate max-w-[60px] sm:max-w-[100px] tracking-tight">
                                {TOOL_PRICING.image.models.find(m => m.id === imageModelId)?.name.replace('AISA ', '') || 'Model'}
                              </span>
                              <ChevronDown size={11} className={`transition-transform duration-300 ${isMagicSettingsOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <button
                              type="button"
                              onClick={() => setIsMagicEditing(false)}
                              className="ml-1 w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white text-amber-600 dark:text-amber-400 transition-all hover:rotate-90 relative z-10"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          </motion.div>
                        )}
                        {isFileAnalysis && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-2.5 px-3 py-1.5 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold border border-blue-500/30 backdrop-blur-xl whitespace-nowrap shrink-0 transition-all hover:bg-blue-500/15 group shadow-lg shadow-blue-500/10"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <FileText size={14} strokeWidth={2.5} />
                              </div>
                              <span className="uppercase tracking-wide text-[10px] font-black hidden sm:inline">{t('analyzeDocument')}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsFileAnalysis(false)}
                              className="ml-1 w-5 h-5 rounded-full flex items-center justify-center hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-all hover:rotate-90"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </AnimatePresence>



                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    disabled={isLoading || isLimitReached}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 768) {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isGlobalSending || isLoading) return;
                        if (inputValue.trim() || selectedFiles.length > 0) {
                          handleSendMessage(e);
                        }
                      }
                    }}
                    placeholder={isLimitReached ? t('limitReached') || "Chat limit reached. Sign in to continue." : (isVideoGeneration ? t('describeVideo') || "Describe the video you want to generate..." : isAudioConvertMode ? t('enterTextToConvert') || "Enter text to convert..." : isDocumentConvert ? t('uploadFileToConvert') || "Upload file & ask to convert..." : typedPlaceholder)}
                    rows={1}
                    className={`w-full bg-transparent border-0 focus:ring-0 outline-none focus:outline-none px-2 py-2 text-slate-800 dark:text-zinc-100 text-left placeholder-slate-400 dark:placeholder-zinc-500 resize-none overflow-y-auto custom-scrollbar font-medium leading-relaxed text-[16px] ${isLimitReached ? 'cursor-not-allowed opacity-50' : ''}`}
                    style={{ minHeight: '32px', height: 'auto', maxHeight: '180px', lineHeight: '1.5' }}
                  />
                </div>

                {/* Right Actions Group */}
                <div className="flex items-center gap-[4px] sm:gap-[6px] pr-[2px] shrink-0">
                  {isListening && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 rounded-full border border-red-500/20 mr-2">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                      <span className="text-[10px] font-bold text-red-600 uppercase">{t('rec')}</span>
                    </div>
                  )}

                  {!isListening && (
                    <>
                      {getAgentCapabilities(activeAgent.agentName, activeAgent.category).canVoice && (
                        <div className="relative">
                          <AnimatePresence>
                            {isMicTapped && (
                              <MagicShowEffect isMobileIdle={false} />
                            )}
                          </AnimatePresence>
                          <motion.button
                            type="button"
                            onMouseEnter={() => setIsMicHovered(true)}
                            onMouseLeave={() => setIsMicHovered(false)}
                            whileHover={{ scale: 1.15, rotate: [0, -10, 10, 0] }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setIsMicTapped(true);
                              setTimeout(() => setIsMicTapped(false), 2000);
                              handleVoiceInput();
                            }}
                            title={t('voiceInput')}
                          >
                            <Mic className={`w-[22px] h-[22px] shrink-0 transition-colors ${isMicHovered && !isListening ? 'text-primary' : ''}`} />
                          </motion.button>
                        </div>
                      )}
                    </>
                  )}

                  {isLoading ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (abortControllerRef.current) abortControllerRef.current.abort();
                        setIsLoading(false);
                        isSendingRef.current = false;
                      }}
                      className="w-[36px] h-[36px] rounded-full bg-[#5555ff] text-white flex items-center justify-center shadow-lg hover:bg-[#4444ee] hover:scale-105 transition-all"
                    >
                      <div className="w-[12px] h-[12px] bg-white rounded-sm" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-[6px] relative">
                      <AnimatePresence>
                        {isSendTapped && !isLoading && (
                          <MagicShowEffect isMobileIdle={false} />
                        )}
                      </AnimatePresence>
                      <motion.button
                        type="submit"
                        disabled={!inputValue.trim() && filePreviews.length === 0}
                        onMouseEnter={() => setIsSendHovered(true)}
                        onMouseLeave={() => setIsSendHovered(false)}
                        whileHover={{ scale: 1.15, rotate: 2 }}
                        whileTap={{ scale: 0.88 }}
                        title={t('send')}
                        onClick={() => {
                          setIsSendTapped(true);
                          setTimeout(() => setIsSendTapped(false), 2000);
                        }}
                        className={`w-[42px] h-[42px] rounded-full flex items-center justify-center transition-all shadow-lg relative overflow-visible z-20 ${(!inputValue.trim() && filePreviews.length === 0) ? 'opacity-30 cursor-not-allowed bg-secondary border border-border/10' : 'bg-gradient-to-br from-primary to-indigo-600 text-white shadow-primary/30 hover:shadow-primary/50'}`}
                      >
                        <AnimatePresence>
                          {ripples.map(id => (
                            <SendRipple key={id} onComplete={() => setRipples(r => r.filter(i => i !== id))} />
                          ))}
                          {isLaunching && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 rounded-full bg-white/20 blur-xl pointer-events-none"
                            />
                          )}
                        </AnimatePresence>
                        <motion.div
                          animate={isLaunching ? {
                            y: [0, -120],
                            scale: [1, 2.8, 0],
                            opacity: [1, 0.4, 0],
                            rotate: [0, 720],
                            filter: ["blur(0px)", "blur(30px)"]
                          } : { y: 0, scale: 1, opacity: 1, filter: "blur(0px)" }}
                          transition={{ duration: 0.8, ease: "anticipate" }}
                          className="relative z-10"
                        >
                          <Zap
                            className={`w-[22px] h-[22px] transition-all duration-300 ${!inputValue.trim() && filePreviews.length === 0 ? 'text-subtext/20' : 'text-white hover:scale-110'}`}
                            strokeWidth={2.5}
                            fill="currentColor"
                          />
                        </motion.div>
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Live AI Modal */}
      <AnimatePresence>
        {isLiveMode && (
          <LiveAI
            onClose={() => setIsLiveMode(false)}
            language={currentLang}
          />
        )}
      </AnimatePresence>

      <LoginRequiredModal />

      {/* Feedback Modal */}
      <Transition appear show={feedbackOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setFeedbackOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-surface p-6 text-left align-middle shadow-xl transition-all border border-border">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-maintext flex justify-between items-center"
                  >
                    {t('shareFeedback')}
                    <button onClick={() => setFeedbackOpen(false)} className="text-subtext hover:text-maintext">
                      <X className="w-5 h-5" />
                    </button>
                  </Dialog.Title>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {["Incorrect or incomplete", "Not what I asked for", "Slow or buggy", "Style or tone", "Safety or legal concern", "Other"].map(cat => (
                      <button
                        key={cat}
                        onClick={() => toggleFeedbackCategory(cat)}
                        className={`text-xs px-3 py-2 rounded-full border transition-colors ${feedbackCategory.includes(cat)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-transparent text-subtext border-border hover:border-maintext'
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4">
                    <textarea
                      className="w-full bg-black/5 dark:bg-white/5 rounded-xl p-3 text-sm focus:outline-none border border-transparent focus:border-border text-maintext placeholder-subtext resize-none"
                      rows={3}
                      placeholder="Share details (optional)"
                      value={feedbackDetails}
                      onChange={(e) => setFeedbackDetails(e.target.value)}
                    />
                  </div>

                  <div className="mt-4 text-[10px] text-subtext leading-tight">
                    {t('conversationIncludedFeedback')}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      disabled={isSubmittingFeedback}
                      className={`inline-flex justify-center items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white transition-all ${isSubmittingFeedback ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                      onClick={submitFeedback}
                    >
                      {isSubmittingFeedback && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      {isSubmittingFeedback ? t('submitting') : t('submit')}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Limit Reached Modal */}
      <Transition show={isLimitReached} as={Fragment}>
        <Dialog as="div" className="relative z-[200]" onClose={() => { }}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-border p-8 text-center shadow-2xl transition-all">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                  </div>

                  <Dialog.Title as="h3" className="text-2xl font-black text-maintext mb-2 tracking-tight uppercase">
                    Chat Limit Reached
                  </Dialog.Title>

                  <p className="text-subtext mb-8 leading-relaxed text-sm">
                    You've reached the guest limit of 10 sessions and 5 messages per session.
                    Sign in to unlock **unlimited chat**, image generation, and more!
                  </p>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => navigate('/login', { state: { from: location.pathname } })}
                      className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-sm tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 active:scale-95 uppercase"
                    >
                      Sign In Now
                    </button>
                    <button
                      onClick={() => navigate('/signup')}
                      className="w-full py-4 bg-black/5 dark:bg-white/5 border border-border text-maintext rounded-2xl font-bold text-sm tracking-widest hover:bg-black/10 dark:hover:bg-white/10 transition-all active:scale-95 uppercase"
                    >
                      Create Free Account
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => {
          // Onboarding finished, just close the modal
          setShowOnboarding(false);
        }}
      />

      {/* ===== WHATSAPP IN-APP SHARE MODAL ===== */}
      {
        waShareModal && (
          <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
            <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border/50 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40" style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}>
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-sm">{t('shareOnWhatsApp')}</h3>
                  <p className="text-white/70 text-xs">{t('pdfLinkSendNoApp')}</p>
                </div>
                <button onClick={() => setWaShareModal(false)} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {/* Phone Input */}
                <div>
                  <label className="text-xs font-semibold text-subtext mb-1.5 block">📱 {t('phoneNumberWithCode')}</label>
                  <div className="flex gap-2">
                    <div className="flex items-center bg-surface-hover rounded-xl px-3 border border-border/50 text-sm text-maintext font-mono">+</div>
                    <input
                      type="tel"
                      value={waPhone}
                      onChange={e => setWaPhone(e.target.value)}
                      placeholder="91 9876543210"
                      className="flex-1 bg-surface-hover border border-border/50 rounded-xl px-3 py-2.5 text-sm text-maintext placeholder-subtext focus:outline-none focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] transition-all"
                      autoFocus
                    />
                  </div>
                  <p className="text-[10px] text-subtext mt-1">{t('phoneNumberExample')}</p>
                </div>

                {/* Message Preview */}
                <div>
                  <label className="text-xs font-semibold text-subtext mb-1.5 block">💬 {t('messagePreview')}</label>
                  <textarea
                    value={waMsgContent}
                    onChange={e => setWaMsgContent(e.target.value)}
                    rows={3}
                    className="w-full bg-surface-hover border border-border/50 rounded-xl px-3 py-2.5 text-xs text-maintext focus:outline-none focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] transition-all resize-none"
                  />
                </div>

                {/* PDF Link */}
                {waPdfUrl && (
                  <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                    <span className="text-xs text-green-600 font-medium truncate">PDF Ready: {waPdfUrl.split('/').pop()}</span>
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="flex gap-3 px-5 pb-5">
                <button
                  onClick={() => setWaShareModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border/50 text-sm text-subtext hover:bg-surface-hover transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={sendWhatsAppMessage}
                  disabled={waUploading || !waPhone}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                  {t('sendOnWhatsApp')}
                </button>
              </div>
            </div>
          </div>
        )
      }
      {/* ===== VOICE SETTINGS MODAL ===== */}
      <Transition appear show={isVoiceSettingsOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[999]" onClose={() => setIsVoiceSettingsOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95 translate-y-4" enterTo="opacity-100 scale-100 translate-y-0" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-md overflow-hidden rounded-3xl shadow-2xl border border-black/5 dark:border-white/10 bg-white/95 dark:bg-[#12121a]/95 backdrop-blur-3xl">

                  {/* ── Header ── */}
                  <div className="relative px-6 pt-6 pb-4">
                    <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top, rgba(99,102,241,0.4) 0%, transparent 70%)' }} />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                          <Sliders className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <Dialog.Title as="h3" className="text-sm font-bold text-maintext leading-none">{t('voiceSettings')}</Dialog.Title>
                          <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold mt-0.5">{t('chirp3HD')}</p>
                        </div>
                      </div>
                      <button onClick={() => setIsVoiceSettingsOpen(false)} className="w-7 h-7 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center text-subtext hover:text-maintext transition-all border border-black/5 dark:border-white/10">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="px-6 pb-6 space-y-5">

                    {/* ── Language Picker ── */}
                    {(() => {
                      const LANGS = [
                        {
                          group: '🇺🇸 English', items: [
                            { value: 'en-US', label: 'English (US)', flag: '🇺🇸' },
                            { value: 'en-GB', label: 'English (UK)', flag: '🇬🇧' },
                            { value: 'en-AU', label: 'English (Australia)', flag: '🇦🇺' },
                            { value: 'en-IN', label: 'English (India)', flag: '🇮🇳' },
                          ]
                        },
                        {
                          group: '🇮🇳 South Asian', items: [
                            { value: 'hi-IN', label: 'Hindi', flag: '🇮🇳' },
                            { value: 'bn-IN', label: 'Bengali', flag: '🇧🇩' },
                            { value: 'gu-IN', label: 'Gujarati', flag: '🇮🇳' },
                            { value: 'kn-IN', label: 'Kannada', flag: '🇮🇳' },
                            { value: 'ml-IN', label: 'Malayalam', flag: '🇮🇳' },
                            { value: 'mr-IN', label: 'Marathi', flag: '🇮🇳' },
                            { value: 'pa-IN', label: 'Punjabi ✨', flag: '🇮🇳' },
                            { value: 'ta-IN', label: 'Tamil', flag: '🇮🇳' },
                            { value: 'te-IN', label: 'Telugu', flag: '🇮🇳' },
                            { value: 'ur-IN', label: 'Urdu', flag: '🇮🇳' },
                          ]
                        },
                        {
                          group: '🇪🇺 European', items: [
                            { value: 'cs-CZ', label: 'Czech', flag: '🇨🇿' },
                            { value: 'da-DK', label: 'Danish', flag: '🇩🇰' },
                            { value: 'de-DE', label: 'German', flag: '🇩🇪' },
                            { value: 'el-GR', label: 'Greek', flag: '🇬🇷' },
                            { value: 'es-ES', label: 'Spanish (Spain)', flag: '🇪🇸' },
                            { value: 'es-US', label: 'Spanish (US)', flag: '🇺🇸' },
                            { value: 'fi-FI', label: 'Finnish', flag: '🇫🇮' },
                            { value: 'fr-FR', label: 'French (France)', flag: '🇫🇷' },
                            { value: 'fr-CA', label: 'French (Canada)', flag: '🇨🇦' },
                            { value: 'hu-HU', label: 'Hungarian', flag: '🇭🇺' },
                            { value: 'it-IT', label: 'Italian', flag: '🇮🇹' },
                            { value: 'nb-NO', label: 'Norwegian', flag: '🇳🇴' },
                            { value: 'nl-NL', label: 'Dutch', flag: '🇳🇱' },
                            { value: 'pl-PL', label: 'Polish', flag: '🇵🇱' },
                            { value: 'pt-BR', label: 'Portuguese (Brazil)', flag: '🇧🇷' },
                            { value: 'pt-PT', label: 'Portuguese (Portugal)', flag: '🇵🇹' },
                            { value: 'ro-RO', label: 'Romanian', flag: '🇷🇴' },
                            { value: 'ru-RU', label: 'Russian', flag: '🇷🇺' },
                            { value: 'sk-SK', label: 'Slovak', flag: '🇸🇰' },
                            { value: 'sv-SE', label: 'Swedish', flag: '🇸🇪' },
                            { value: 'tr-TR', label: 'Turkish', flag: '🇹🇷' },
                            { value: 'uk-UA', label: 'Ukrainian', flag: '🇺🇦' },
                          ]
                        },
                        {
                          group: '🌏 East Asian', items: [
                            { value: 'cmn-CN', label: 'Chinese — Mandarin (CN)', flag: '🇨🇳' },
                            { value: 'cmn-TW', label: 'Chinese — Mandarin (TW)', flag: '🇹🇼' },
                            { value: 'yue-HK', label: 'Cantonese (HK) ✨', flag: '🇭🇰' },
                            { value: 'ja-JP', label: 'Japanese', flag: '🇯🇵' },
                            { value: 'ko-KR', label: 'Korean', flag: '🇰🇷' },
                          ]
                        },
                        {
                          group: '🌍 Others', items: [
                            { value: 'ar-XA', label: 'Arabic', flag: '🇸🇦' },
                            { value: 'fil-PH', label: 'Filipino', flag: '🇵🇭' },
                            { value: 'he-IL', label: 'Hebrew', flag: '🇮🇱' },
                            { value: 'id-ID', label: 'Indonesian', flag: '🇮🇩' },
                            { value: 'ms-MY', label: 'Malay', flag: '🇲🇾' },
                            { value: 'th-TH', label: 'Thai', flag: '🇹🇭' },
                            { value: 'vi-VN', label: 'Vietnamese', flag: '🇻🇳' },
                          ]
                        },
                      ];
                      const allLangItems = LANGS.flatMap(g => g.items);
                      const selLang = allLangItems.find(l => l.value === audioLangCode) || allLangItems[0];
                      return (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-subtext mb-2">{t('language')}</p>
                          <Listbox value={audioLangCode} onChange={(val) => {
                            setAudioLangCode(val);
                            setAudioVoiceName(`${val}-Chirp3-HD-Autonoe`);
                            // Sync with UI Language context
                            const item = allLangItems.find(l => l.value === val);
                            if (item) {
                              const baseLang = item.label.split(' (')[0].split(' —')[0];
                              setTimeout(() => {
                                setLanguage(baseLang);
                              }, 0);
                            }
                          }}>
                            <div className="relative">
                              <Listbox.Button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 hover:border-indigo-500/40 transition-all group text-left">
                                <span className="text-xl leading-none">{selLang.flag}</span>
                                <span className="flex-1 text-sm font-semibold text-maintext">{selLang.label}</span>
                                <ChevronDown className="w-4 h-4 text-subtext group-hover:text-indigo-400 transition-colors shrink-0" />
                              </Listbox.Button>
                              <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 -translate-y-1">
                                <Listbox.Options className="absolute z-50 mt-2 w-full rounded-2xl overflow-hidden shadow-2xl border border-black/10 dark:border-white/10 outline-none bg-white/95 dark:bg-[#12121a]/95 backdrop-blur-3xl" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                                  {LANGS.map((group) => (
                                    <div key={group.group}>
                                      <div className="px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400/70 sticky top-0 bg-white/95 dark:bg-[#12121a]/95 backdrop-blur-md z-10">{group.group}</div>
                                      {group.items.map((item) => (
                                        <Listbox.Option key={item.value} value={item.value} className={({ active, selected }) =>
                                          `flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${selected ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-300' : active ? 'bg-black/5 dark:bg-white/5 text-maintext' : 'text-subtext'
                                          }`
                                        }>
                                          {({ selected }) => (
                                            <>
                                              <span className="text-base leading-none">{item.flag}</span>
                                              <span className="flex-1 text-sm font-medium">{item.label}</span>
                                              {selected && <Check className="w-3.5 h-3.5 shrink-0" />}
                                            </>
                                          )}
                                        </Listbox.Option>
                                      ))}
                                    </div>
                                  ))}
                                </Listbox.Options>
                              </Transition>
                            </div>
                          </Listbox>
                        </div>
                      );
                    })()}

                    {/* ── Voice Picker ── */}
                    {(() => {
                      const VOICES = [
                        {
                          group: '♀ Female Voices', color: 'rose', items: [
                            { name: 'Achernar', style: 'Bright, clear' },
                            { name: 'Achird', style: 'Warm, friendly' },
                            { name: 'Algenib', style: 'Smooth, graceful' },
                            { name: 'Aoede', style: 'Natural, balanced' },
                            { name: 'Autonoe', style: 'Soft, gentle · Default' },
                            { name: 'Callirrhoe', style: 'Rich, elegant' },
                            { name: 'Despina', style: 'Light, airy' },
                            { name: 'Erinome', style: 'Calm, composed' },
                            { name: 'Gacrux', style: 'Strong, confident' },
                            { name: 'Kore', style: 'Pure, melodic' },
                            { name: 'Laomedeia', style: 'Serene, flowing' },
                            { name: 'Leda', style: 'Warm, storytelling' },
                            { name: 'Pulcherrima', style: 'Radiant, vibrant' },
                            { name: 'Sulafat', style: 'Deep, resonant' },
                            { name: 'Vindemiatrix', style: 'Measured, clear' },
                            { name: 'Zephyr', style: 'Breezy, lively' },
                          ]
                        },
                        {
                          group: '♂ Male Voices', color: 'blue', items: [
                            { name: 'Algieba', style: 'Bold, expressive' },
                            { name: 'Alnilam', style: 'Deep, authoritative' },
                            { name: 'Charon', style: 'Dark, dramatic' },
                            { name: 'Enceladus', style: 'Crisp, powerful' },
                            { name: 'Fenrir', style: 'Bold, intense' },
                            { name: 'Iapetus', style: 'Steady, reliable' },
                            { name: 'Orus', style: 'Warm, friendly' },
                            { name: 'Puck', style: 'Playful, energetic' },
                            { name: 'Rasalgethi', style: 'Smooth, velvety' },
                            { name: 'Sadachbia', style: 'Calm, measured' },
                            { name: 'Sadaltager', style: 'Strong, clear' },
                            { name: 'Schedar', style: 'Rich, balanced' },
                            { name: 'Umbriel', style: 'Mysterious, deep' },
                            { name: 'Zubenelgenubi', style: 'Commanding, precise' },
                          ]
                        },
                      ];
                      const voiceKey = audioVoiceName.split('-Chirp3-HD-')[1] || 'Autonoe';
                      const allVoices = VOICES.flatMap(g => g.items.map(v => ({ ...v, group: g.group, color: g.color })));
                      const selVoice = allVoices.find(v => v.name === voiceKey) || allVoices[4];
                      const isFemale = VOICES[0].items.some(v => v.name === voiceKey);
                      return (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-subtext mb-2">{t('voice')}</p>
                          <Listbox value={audioVoiceName} onChange={setAudioVoiceName}>
                            <div className="relative">
                              <Listbox.Button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 hover:border-indigo-500/40 transition-all group text-left">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${isFemale ? 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300' : 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300'
                                  }`}>
                                  {isFemale ? '♀' : '♂'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-maintext leading-none">{selVoice.name}</p>
                                  <p className="text-[10px] text-subtext mt-0.5 truncate">{selVoice.style}</p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-subtext group-hover:text-indigo-400 transition-colors shrink-0" />
                              </Listbox.Button>
                              <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 -translate-y-1">
                                <Listbox.Options className="absolute z-50 mt-2 w-full rounded-2xl overflow-hidden shadow-2xl border border-black/10 dark:border-white/10 outline-none bg-white/95 dark:bg-[#12121a]/95 backdrop-blur-3xl" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                                  {VOICES.map((group) => (
                                    <div key={group.group}>
                                      <div className={`px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest sticky top-0 bg-white/95 dark:bg-[#12121a]/95 backdrop-blur-md z-10 ${group.color === 'rose' ? 'text-rose-500 dark:text-rose-400/70' : 'text-blue-500 dark:text-blue-400/70'
                                        }`}>{group.group}</div>
                                      {group.items.map((item) => {
                                        const voiceVal = `${audioLangCode}-Chirp3-HD-${item.name}`;
                                        return (
                                          <Listbox.Option key={item.name} value={voiceVal} className={({ active, selected }) =>
                                            `flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${selected
                                              ? (group.color === 'rose' ? 'bg-rose-50 dark:bg-rose-600/15 text-rose-600 dark:text-rose-300' : 'bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-300')
                                              : active ? 'bg-black/5 dark:bg-white/5 text-maintext' : 'text-subtext'
                                            }`
                                          }>
                                            {({ selected }) => (
                                              <>
                                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 ${group.color === 'rose' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                                  }`}>{group.color === 'rose' ? '♀' : '♂'}</div>
                                                <div className="flex-1 min-w-0">
                                                  <p className="text-xs font-semibold leading-none">{item.name}</p>
                                                  <p className="text-[9px] text-subtext mt-0.5 truncate">{item.style}</p>
                                                </div>
                                                {selected && <Check className="w-3 h-3 shrink-0" />}
                                              </>
                                            )}
                                          </Listbox.Option>
                                        );
                                      })}
                                    </div>
                                  ))}
                                </Listbox.Options>
                              </Transition>
                            </div>
                          </Listbox>
                        </div>
                      );
                    })()}

                    {/* ── Pitch Slider ── */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-subtext">{t('pitch')}</p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-bold text-indigo-500 dark:text-indigo-300">{audioPitch > 0 ? '+' : ''}{audioPitch.toFixed(1)}</span>
                          {audioPitch !== 0 && (
                            <button onClick={() => setAudioPitch(0)} className="text-[9px] text-subtext/50 hover:text-subtext transition-colors">reset</button>
                          )}
                        </div>
                      </div>
                      <div className="relative">
                        <input type="range" min="-10" max="10" step="0.5" value={audioPitch}
                          onChange={(e) => setAudioPitch(parseFloat(e.target.value))}
                          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                          style={{ background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((audioPitch + 10) / 20) * 100}%, rgba(128,128,128,0.2) ${((audioPitch + 10) / 20) * 100}%, rgba(128,128,128,0.2) 100%)` }}
                        />
                        <div className="flex justify-between text-[9px] text-subtext/50 mt-1.5 font-medium">
                          <span>Lower</span><span>Normal</span><span>Higher</span>
                        </div>
                      </div>
                    </div>

                    {/* ── Speed Slider ── */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-subtext">{t('speed')}</p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-bold text-indigo-500 dark:text-indigo-300">{audioSpeed.toFixed(2)}×</span>
                          {audioSpeed !== 1.0 && (
                            <button onClick={() => setAudioSpeed(1.0)} className="text-[9px] text-subtext/50 hover:text-subtext transition-colors">reset</button>
                          )}
                        </div>
                      </div>
                      <div className="relative">
                        <input type="range" min="0.25" max="4.0" step="0.25" value={audioSpeed}
                          onChange={(e) => setAudioSpeed(parseFloat(e.target.value))}
                          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                          style={{ background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((audioSpeed - 0.25) / 3.75) * 100}%, rgba(128,128,128,0.2) ${((audioSpeed - 0.25) / 3.75) * 100}%, rgba(128,128,128,0.2) 100%)` }}
                        />
                        <div className="relative mt-2 h-3 text-[9px] text-subtext/50 font-medium">
                          <span className="absolute left-0">0.25×</span>
                          <span className="absolute transform -translate-x-1/2" style={{ left: '20%' }}>1× (Normal)</span>
                          <span className="absolute transform -translate-x-1/2" style={{ left: '46.66%' }}>2×</span>
                          <span className="absolute right-0">4×</span>
                        </div>
                      </div>
                    </div>

                    {/* ── Buttons ── */}
                    <div className="flex gap-3 pt-1">
                      <button type="button" disabled={isPlayingSample} onClick={async () => {
                        if (isPlayingSample) return;
                        setIsPlayingSample(true);
                        // Stop any previously playing sample
                        if (sampleAudioRef.current) { sampleAudioRef.current.pause(); sampleAudioRef.current = null; }
                        const t = toast.loading('Generating sample...');
                        try {
                          const langSamples = {
                            'hi-IN': 'नमस्ते! मैं आपकी आवाज़ हूँ। क्या यह अच्छी लगती है?',
                            'bn-IN': 'নমস্কার! আমি আপনার ভয়েস। এটা কেমন শোনাচ্ছে?',
                            'gu-IN': 'નમસ્તે! હું તમારો અવાજ છું. આ કેવું લાગે છે?',
                            'kn-IN': 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಧ್ವನಿ. ಇದು ಹೇಗೆ ಕೇಳಿಸುತ್ತದೆ?',
                            'ml-IN': 'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ ശബ്ദമാണ്. ഇത് എങ്ങനെയുണ്ട്?',
                            'mr-IN': 'नमस्कार! मी तुमचा आवाज आहे. हे कसे वाटते?',
                            'pa-IN': 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡੀ ਆਵਾਜ਼ ਹਾਂ। ਇਹ ਕਿਵੇਂ ਲੱਗਦਾ ਹੈ?',
                            'ta-IN': 'வணக்கம்! நான் உங்கள் குரல். இது எப்படி கேட்கிறது?',
                            'te-IN': 'నమస్కారం! నేను మీ వాయిస్. ఇది ఎలా ఉంది?',
                            'ur-IN': 'ہیلو! میں آپ کی آواز ہوں۔ یہ کیسا لگ رہا ہے؟',
                            'ar-XA': 'مرحباً! أنا صوتك. هل يبدو هذا جيداً؟',
                            'ja-JP': 'こんにちは。私はあなたの声です。どう聞こえますか？',
                            'cmn-CN': '你好！我是您的声音。这听起来好吗？',
                            'ko-KR': '안녕하세요! 저는 당신의 목소리입니다.',
                            'de-DE': 'Hallo! Ich bin Ihre Stimme. Klingt das gut?',
                            'fr-FR': 'Bonjour! Je suis votre voix. Est-ce que ça sonne bien?',
                            'es-ES': '¡Hola! Soy tu voz. ¿Suena bien?',
                          };
                          const txt = langSamples[audioLangCode] || 'Hello! This is a voice sample. How does it sound to you?';
                          const res = await axios.post(apis.synthesizeFile, {
                            introText: txt, languageCode: audioLangCode,
                            voiceName: audioVoiceName, pitch: audioPitch, speakingRate: audioSpeed
                          }, { responseType: 'arraybuffer', timeout: 30000, headers: { Authorization: `Bearer ${getUserData()?.token}` } });
                          const audio = new Audio(URL.createObjectURL(new Blob([res.data], { type: 'audio/mpeg' })));
                          sampleAudioRef.current = audio;
                          audio.onended = () => setIsPlayingSample(false);
                          audio.play();
                          toast.dismiss(t); toast.success('Playing sample ▶');
                        } catch (e) { toast.dismiss(t); toast.error('Sample failed — check voice/language combo.'); setIsPlayingSample(false); }
                      }} className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl border border-black/5 dark:border-white/10 text-sm font-bold transition-all ${isPlayingSample ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-500 dark:text-indigo-300 cursor-not-allowed opacity-70' : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-subtext hover:text-maintext'}`}>
                        <PlayCircle className={`w-4 h-4 ${isPlayingSample ? 'animate-pulse' : ''} text-indigo-500 dark:text-indigo-400`} /> {isPlayingSample ? t('playing') : t('playSample')}
                      </button>
                      <button type="button" onClick={() => {
                        updatePersonalization('voice', {
                          languageCode: audioLangCode,
                          voiceName: audioVoiceName,
                          pitch: audioPitch,
                          speed: audioSpeed
                        });
                        setIsVoiceSettingsOpen(false);
                        toast.success(t('settingsPersisted') || 'Voice Settings Applied ✨', { icon: '🎙️' });
                      }}
                        className="flex-[2] h-11 rounded-2xl text-sm font-bold text-white transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                      >
                        {t('applySettings')}
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <PremiumUpsellModal />
      <MagicVideoGenModal
        isOpen={isMagicVideoModalOpen}
        onClose={() => setIsMagicVideoModalOpen(false)}
        onCreditDeduction={(credits) => console.log('deducted', credits)}
      />


      <MagicToolSettingsCard
        isOpen={isMagicSettingsOpen}
        onClose={() => setIsMagicSettingsOpen(false)}
        referenceImage={editRefImage}
        toolType={isMagicEditing ? 'edit' : isImageGeneration ? 'image' : isVideoGeneration ? 'video' : ''}
        config={
          isMagicEditing
            ? { modelId: editModelId }
            : isImageGeneration
              ? { aspectRatio: imageAspectRatio, modelId: imageModelId }
              : isVideoGeneration
                ? { aspectRatio: videoAspectRatio, resolution: videoResolution, modelId: videoModelId }
                : {}
        }
        onChange={(key, value) => {
          if (isMagicEditing) {
            if (key === 'modelId') setEditModelId(value);
          } else if (isImageGeneration) {
            if (key === 'aspectRatio') setImageAspectRatio(value);
            if (key === 'modelId') setImageModelId(value);
          } else if (isVideoGeneration) {
            if (key === 'aspectRatio') setVideoAspectRatio(value);
            if (key === 'modelId') setVideoModelId(value);
            if (key === 'resolution') setVideoResolution(value);
          }
        }}
        onContentSelect={(content) => {
          setInputValue(content);
          // Auto-focus input if possible for immediate refinement
          const inputEl = document.querySelector('textarea');
          if (inputEl) inputEl.focus();
        }}
        pricing={TOOL_PRICING}
      />
      <AiSocialMediaDashboard
        isOpen={isSocialMediaDashboardOpen}
        onClose={() => setIsSocialMediaDashboardOpen(false)}
        userPlan={userPlanName}
      />
      <CashFlowStockModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        onSelect={(stock) => handleStockAnalysis(stock)}
      />
      {explosions && explosions.map(exp => (
        <NeuralExplosion
          key={exp.id}
          x={exp.x}
          y={exp.y}
          onComplete={() => setExplosions(prev => prev.filter(e => e.id !== exp.id))}
        />
      ))}

      <LegalToolkitCard
        isOpen={activeLegalToolkit}
        onClose={() => setActiveLegalToolkit(false)}
        isAdmin={isAdminUser}
        unlockedTools={unlockedTools}
        onSelect={(tool, isUnlocked) => {
          if (tool.id === 'legal_chat') {
            setSelectedLegalTool(null); // Clear specific tool to go to general chat
            setCurrentMode('LEGAL_TOOLKIT');
            setActiveLegalToolkit(false);
            toast.success("Legal Chat Activated ⚖️", {
              icon: '⚖️',
              style: {
                background: '#eff6ff',
                color: '#1d4ed8',
                borderRadius: '16px',
                border: '1px solid #bfdbfe',
                fontWeight: 'bold'
              }
            });
            if (inputRef.current) inputRef.current.focus();
            return;
          }

          if (!isUnlocked) {
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: 'user',
              content: `Use ${tool.name}`,
              timestamp: Date.now()
            }, {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: `**Premium Mode Restricted**\n\nThe **${tool.name}** tool is part of our Premium AI Legal Toolkit.\n\n**To access this tool:**\n1. Select "Unlock All" to get full toolkit access.\n2. Or upgrade your subscription to the **FOUNDER PLAN**.\n\n*Would you like to see pricing for the AI Legal Archive?*`,
              isPremiumRestricted: true,
              timestamp: Date.now()
            }]);
            setActiveLegalToolkit(false);
            return;
          }

          setSelectedLegalTool({ id: tool.id, name: tool.name });
          setCurrentMode('LEGAL_TOOLKIT');
          setActiveLegalToolkit(false);
          if (inputRef.current) inputRef.current.focus();
          toast.success(`✅ AI Legal Activated: ${tool.name} ✨`, {
            position: 'top-right',
            style: {
              background: '#F0FDF4',
              color: '#166534',
              borderRadius: '16px',
              padding: '16px 24px',
              fontWeight: 'bold',
              border: '1px solid #BBF7D0',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
            }
          });
        }}
      />

      {/* Gmail Connected Feature Showcase Modal */}
      <GmailConnectedModal
        isOpen={showGmailModal}
        onClose={() => setShowGmailModal(false)}
        onTryPrompt={(prompt) => {
          setInputValue(prompt);
          setShowGmailModal(false);
          setTimeout(() => {
            if (inputRef.current) inputRef.current.focus();
          }, 100);
        }}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareId={currentShareId}
        sessionTitle={messages[0]?.content || "Shared Chat"}
        sessionId={currentSessionId}
      />
    </div>

  );
};

export default Chat; 
