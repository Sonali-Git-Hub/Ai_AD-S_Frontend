import React, { useState, useEffect, useRef } from "react";
import {
  Globe, Upload, FileText, X, Check, RefreshCw, Sparkles, ChevronDown, ChevronRight,
  Building2, Target, Cpu, Users, ShoppingBag, Hash, Calendar, Megaphone, BarChart3,
  TrendingUp, Eye, Zap, Image as ImageIcon, FileCheck, Save, Trash2, Plus, Edit3,
  AlertCircle, CheckCircle2, RotateCcw, Info, Download, Layers, BookOpen, Palette, Terminal, AlertTriangle,
  Scan, Star, Type, Link2, Instagram, Twitter, Youtube, Linkedin, Facebook, FileSearch,
  Database, Maximize2
} from "lucide-react";
import toast from "react-hot-toast";
import { apiService } from "../../services/apiService";
import { API } from "../../types.js";

const DNA_SECTIONS = [
  { key: "companyInfo",           label: "Company Information",         icon: Building2,  sectionLetter: "A" },
  { key: "brandIdentity",         label: "Brand Identity",              icon: Sparkles,   sectionLetter: "B" },
  { key: "brandPersonality",      label: "Brand Personality",           icon: Cpu,        sectionLetter: "C" },
  { key: "brandVoice",            label: "Brand Voice",                 icon: Megaphone,  sectionLetter: "D" },
  { key: "audienceProfile",       label: "Target Audience",             icon: Users,      sectionLetter: "E" },
  { key: "productsServices",      label: "Products and Services",       icon: ShoppingBag,sectionLetter: "F" },
  { key: "seoKeywords",           label: "SEO and Marketing Keywords",  icon: Hash,       sectionLetter: "G" },
  { key: "contentStrategy",       label: "Content Strategy",            icon: Calendar,   sectionLetter: "H" },
  { key: "ctaStrategy",           label: "CTA Strategy",                icon: Target,     sectionLetter: "I" },
  { key: "socialRecommendation",  label: "Social Media Recommendation", icon: BarChart3,  sectionLetter: "J" },
  { key: "competitorIntelligence",label: "Competitor Intelligence",     icon: TrendingUp, sectionLetter: "K" },
  { key: "visualIdentity",        label: "Visual Identity",             icon: Palette,    sectionLetter: "L" },
  { key: "swotAnalysis",          label: "SWOT Analysis",               icon: Zap,        sectionLetter: "M" },
  { key: "contentPreferences",    label: "Content Preferences",         icon: FileCheck,  sectionLetter: "N" },
];

const PERSONALITY_TRAITS = ["Professional","Friendly","Premium","Luxury","Modern","Corporate","Innovative","Technical","Emotional","Bold","Minimal"];

const ASSET_CATEGORIES = [
  { id: "logo",       label: "Logo",               accept: "image/*" },
  { id: "images",     label: "Brand Images",        accept: "image/*" },
  { id: "fonts",      label: "Fonts",               accept: ".ttf,.otf,.woff,.woff2" },
  { id: "icons",      label: "Icons",               accept: "image/*,.svg" },
  { id: "references", label: "Reference Images",    accept: "image/*" },
  { id: "videos",     label: "Videos",              accept: "video/*" },
  { id: "guidelines", label: "Brand Guidelines",    accept: ".pdf,.docx,.pptx" },
  { id: "marketing",  label: "Marketing Documents", accept: ".pdf,.docx,.pptx,.xlsx" },
];

const ANALYSIS_STEPS = [
  { id: "read",     label: "Reading Website..." },
  { id: "discover", label: "Discovering Pages..." },
  { id: "extract",  label: "Extracting Business Information..." },
  { id: "products", label: "Analyzing Products..." },
  { id: "voice",    label: "Understanding Brand Voice..." },
  { id: "audience", label: "Detecting Audience..." },
  { id: "strategy", label: "Generating Marketing Strategy..." },
  { id: "dna",      label: "Building Brand DNA..." },
  { id: "memory",   label: "Creating Global Brand Memory..." },
  { id: "done",     label: "Almost Done..." }
];

const LOG_MESSAGES = {
  read: [
    "[Crawler] Initializing brand crawler context...",
    "[Crawler] Resolving DNS headers...",
    "[Crawler] Connection established securely.",
    "[Crawler] Crawling primary index and routing pages..."
  ],
  discover: [
    "[Crawler] Sitemap discovered automatically.",
    "[Crawler] Discovered 14 high-value internal links.",
    "[Crawler] Prioritizing routes: /about, /products, /services..."
  ],
  extract: [
    "[AI Core] Distilling brand company metadata...",
    "[AI Core] Parsing corporate headers and tagline variables...",
    "[AI Core] Extracted founded year and headquarters context."
  ],
  products: [
    "[AI Core] Cataloging products & service matrices...",
    "[AI Core] Compiling core feature sets and pricing metrics...",
    "[AI Core] Categorized pricing details successfully."
  ],
  voice: [
    "[Voice Engine] Analyzing communication tone patterns...",
    "[Voice Engine] Establishing tone matrix: Professional, Bold...",
    "[Voice Engine] Vocabulary density indexed."
  ],
  audience: [
    "[Audience Modeler] Mapping target buyer personas...",
    "[Audience Modeler] Analyzing pain points and demographic values...",
    "[Audience Modeler] Storing audience profile nodes."
  ],
  strategy: [
    "[Planner] Formulating monthly content distribution models...",
    "[Planner] Building strategic weekly themes and recommendations..."
  ],
  dna: [
    "[Database] Creating version 1 schema documents...",
    "[Database] Saving normalized sections (companyinfo, identity)...",
    "[Database] Syncing sections to parent BrandProfile document..."
  ],
  memory: [
    "[Memory Core] Vectorizing key brand traits...",
    "[Memory Core] Centralized Brand DNA memory successfully cached!"
  ],
  done: [
    "[System] Post-process cleanup complete.",
    "[System] Workspace strategy online.",
    "[System] Enterprise Brand DNA extraction fully completed."
  ]
};

const ConfidenceBadge = ({ score }) => {
  const color = score >= 90 ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
              : score >= 70 ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
                             : "text-red-500 bg-red-500/10 border-red-500/20";
  return (
    <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest ${color}`}>
      {score}% AI
    </span>
  );
};

const ChipInput = ({ values = [], onChange, placeholder = "Add...", disabled }) => {
  const [inputVal, setInputVal] = useState("");
  const addChip = () => {
    const v = inputVal.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setInputVal("");
  };
  return (
    <div className="flex flex-wrap gap-1.5 p-2 border border-slate-200 dark:border-white/10 rounded-xl min-h-[44px] bg-slate-50/50 dark:bg-white/[0.02]">
      {values.map((chip, i) => (
        <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
          {chip}
          {!disabled && (
            <button onClick={() => onChange(values.filter((_, idx) => idx !== i))} className="ml-0.5 opacity-60 hover:opacity-100">
              <X className="w-2.5 h-2.5" />
            </button>
          )}
        </span>
      ))}
      {!disabled && (
        <input value={inputVal} onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addChip(); }}}
          placeholder={placeholder}
          className="flex-1 min-w-[80px] bg-transparent text-xs text-slate-700 dark:text-slate-300 placeholder-slate-400 outline-none font-medium" />
      )}
    </div>
  );
};

const DNAField = ({ label, value, onChange, multiline }) => {
  const [editing, setEditing] = useState(false);
  const [localVal, setLocalVal] = useState(value || "");
  useEffect(() => { setLocalVal(value || ""); }, [value]);
  const save = () => { onChange(localVal); setEditing(false); };
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:scale-105 active:scale-95 transition-all">
            <Edit3 className="w-2.5 h-2.5" /> Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={save} className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-1">
              <Check className="w-2.5 h-2.5" /> Save
            </button>
            <button onClick={() => { setLocalVal(value || ""); setEditing(false); }} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-1">
              <X className="w-2.5 h-2.5" /> Cancel
            </button>
          </div>
        )}
      </div>
      {editing ? (
        multiline ? (
          <textarea value={localVal} onChange={e => setLocalVal(e.target.value)} autoFocus rows={4}
            className="w-full text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-white/5 border border-primary/40 rounded-xl p-2.5 outline-none resize-none" />
        ) : (
          <input value={localVal} onChange={e => setLocalVal(e.target.value)} onKeyDown={e => e.key === "Enter" && save()} autoFocus
            className="w-full text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-white/5 border border-primary/40 rounded-xl px-3 py-2 outline-none" />
        )
      ) : (
        <p className="w-full text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 min-h-[36px] leading-relaxed">
          {value || <span className="italic text-slate-400">Not set</span>}
        </p>
      )}
    </div>
  );
};

const renderSectionContent = (sectionKey, sectionData, onFieldChange) => {
  const field = (key, label, multiline = false) => (
    <DNAField key={key} label={label} value={sectionData?.[key]} onChange={(v) => onFieldChange(key, v)} multiline={multiline} />
  );
  const chips = (key, label) => (
    <div key={key} className="space-y-1">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{label}</label>
      <ChipInput values={sectionData?.[key] || []} onChange={(v) => onFieldChange(key, v)} />
    </div>
  );

  switch (sectionKey) {
    case "companyInfo":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field("brandName","Brand Name")} {field("tagline","Tagline")}
          {field("website","Website")} {field("industry","Industry")}
          {field("subIndustry","Sub Industry")} {field("businessType","Business Type")}
          {field("foundedYear","Founded Year")} {field("headquarters","Headquarters")}
          {field("contactInfo","Contact Info")}
          <div className="sm:col-span-2">{field("description","Company Description",true)}</div>
        </div>
      );
    case "brandIdentity":
      return (
        <div className="grid grid-cols-1 gap-4">
          {field("mission","Mission",true)} {field("vision","Vision",true)}
          {chips("coreValues","Core Values")}
          {field("brandStory","Brand Story",true)} {field("usp","USP",true)}
          {field("competitiveAdvantage","Competitive Advantage",true)}
          {field("brandPositioning","Brand Positioning",true)}
        </div>
      );
    case "brandPersonality":
      return (
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Select Personality Traits</label>
          <div className="flex flex-wrap gap-2">
            {PERSONALITY_TRAITS.map(trait => {
              const selected = (sectionData?.traits || []).includes(trait);
              return (
                <button key={trait} onClick={() => { const cur = sectionData?.traits || []; onFieldChange("traits", selected ? cur.filter(t => t !== trait) : [...cur, trait]); }}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 border ${selected ? "border-primary bg-primary/10 text-primary" : "border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/[0.02]"}`}>
                  {selected && <Check className="w-2.5 h-2.5 inline mr-1" />}{trait}
                </button>
              );
            })}
          </div>
        </div>
      );
    case "brandVoice":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field("communicationStyle","Communication Style")} {field("writingStyle","Writing Style")}
          {field("toneOfVoice","Tone of Voice")} {field("vocabularyStyle","Vocabulary Style")}
          {field("ctaStyle","CTA Style")} {field("storytellingStyle","Storytelling Style")}
          {field("emojiUsage","Emoji Usage")}
        </div>
      );
    case "audienceProfile":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {chips("ageGroups","Age Groups")} {chips("gender","Gender")}
          {chips("industry","Industry")} {chips("profession","Profession")}
          {chips("location","Location")} {field("incomeLevel","Income Level")}
          {chips("interests","Interests")} {chips("painPoints","Pain Points")}
          {chips("goals","Goals")}
          <div className="sm:col-span-2">{field("buyingBehaviour","Buying Behaviour",true)}</div>
        </div>
      );
    case "productsServices":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {chips("products","Products")} {chips("services","Services")}
          {chips("categories","Product Categories")} {chips("keyFeatures","Key Features")}
          {chips("keyBenefits","Key Benefits")} {field("pricingInfo","Pricing Structure")}
        </div>
      );
    case "seoKeywords":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {chips("primary","Primary Keywords")} {chips("secondary","Secondary Keywords")}
          {chips("industry","Industry Keywords")} {chips("brand","Brand Keywords")}
          <div className="sm:col-span-2">{chips("longTail","Long Tail Keywords")}</div>
        </div>
      );
    case "contentStrategy":
      return (
        <div className="space-y-4">
          {chips("pillars","Content Pillars")}
        </div>
      );
    case "ctaStrategy":
      return (
        <div className="space-y-4">
          {chips("preferredCTAs","Preferred CTAs")}
        </div>
      );
    case "socialRecommendation":
      return (
        <div className="space-y-4">
          {sectionData?.platforms?.map((plat, idx) => (
            <div key={idx} className="p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-700 dark:text-white uppercase tracking-wider">{plat.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-bold">Priority Score: {plat.priorityScore}</span>
              </div>
              <p className="text-[9px] text-slate-500 leading-relaxed">{plat.reason}</p>
            </div>
          )) || <p className="text-[10px] text-slate-400 italic">No recommendations</p>}
        </div>
      );
    case "competitorIntelligence":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {chips("topCompetitors","Top Competitors")} {field("marketPosition","Market Position")}
          <div className="sm:col-span-2">{chips("opportunities","Market Opportunities")}</div>
          <div className="sm:col-span-2">{chips("differentiators","Differentiators")}</div>
        </div>
      );
    case "visualIdentity":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {chips("brandColors","Brand Colors (Hex)")} {field("typographyStyle","Typography Style")}
          {field("designStyle","Design Style")} {field("visualTheme","Visual Theme")}
          {field("imageStyle","Image Style")}
        </div>
      );
    case "swotAnalysis":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {chips("strengths","Strengths")} {chips("weaknesses","Weaknesses")}
          {chips("opportunities","Opportunities")} {chips("threats","Threats")}
        </div>
      );
    case "contentPreferences":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field("defaultLanguage","Default Language")} {field("defaultTone","Default Tone")}
          {field("preferredContentLength","Content Length")} {field("preferredCTA","Preferred CTA Style")}
          {field("hashtagCount","Hashtag Count")} {field("writingStyle","Writing Style")}
        </div>
      );
    default:
      return null;
  }
};

const BrandWorkspace = ({ workspaceId, setActiveTab: setParentActiveTab, setShowGeneratorOptions }) => {
  const [activeTab, setActiveTab] = useState("setup");
  const [url, setUrl] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [dnaData, setDnaData] = useState(null);
  const [rawKnowledgeBase, setRawKnowledgeBase] = useState("");
  const [brandAssets, setBrandAssets] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [savedBrand, setSavedBrand] = useState(null);

  // AI Workflow / Progress States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [liveLogs, setLiveLogs] = useState([]);
  const [analysisError, setAnalysisError] = useState(null);
  const [isCancelled, setIsCancelled] = useState(false);
  
  // Section UX states
  const [expandedSections, setExpandedSections] = useState({});
  const [regeneratingSections, setRegeneratingSections] = useState({});
  const [aiThinkingText, setAiThinkingText] = useState({});
  const [confidenceDiff, setConfidenceDiff] = useState({});
  const [isUploadingAsset, setIsUploadingAsset] = useState(false);
  const [assetCategory, setAssetCategory] = useState("logo");
  const [isLoadingDNA, setIsLoadingDNA] = useState(false);

  // Brand Intelligence Agent — Asset Discovery
  const [discoverUrl, setDiscoverUrl] = useState("");
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveredAssets, setDiscoveredAssets] = useState(null);
  const [assetApprovals, setAssetApprovals] = useState({}); // key: `${category}-${idx}`, value: true/false
  const [isSavingAssets, setIsSavingAssets] = useState(false);
  const [discoveryError, setDiscoveryError] = useState(null);

  // Brand Assets tab UI state
  const [manualOpen, setManualOpen] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [showSuccessCard, setShowSuccessCard] = useState(false);

  const docInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const logsEndRef = useRef(null);
  const timerRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Auto Scroll Logs Terminal
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [liveLogs]);

  // Fetch initial DNA & determine onboarding state
  useEffect(() => {
    if (!workspaceId) {
      setIsLoadingDNA(false);
      setSavedBrand(null);
      setDnaData(null);
      setActiveTab("setup");
      return;
    }
    setIsLoadingDNA(true);
    (async () => {
      try {
        const res = await apiService.getBrandDNA(workspaceId);
        if (res.success && res.brand) {
          setSavedBrand(res.brand);
          // Check if there is actual DNA data populated in the profile
          const hasDNA = res.brand.companyName || (res.brand.companyInfo && res.brand.companyInfo.brandName);
          if (hasDNA) {
            setDnaData(res.brand);
            setActiveTab("dna");
          } else {
            setDnaData(null);
            setActiveTab("setup");
          }
        } else {
          setSavedBrand(null);
          setDnaData(null);
          setActiveTab("setup");
        }
      } catch (e) {
        console.error("Failed to load initial DNA:", e);
        setSavedBrand(null);
        setDnaData(null);
        setActiveTab("setup");
      } finally {
        setIsLoadingDNA(false);
      }
    })();
  }, [workspaceId]);

  // Fetch Assets (via new unified endpoint)
  useEffect(() => {
    if (!workspaceId) return;
    (async () => {
      try {
        const res = await apiService.getAllBrandAssets(workspaceId);
        if (res.success) setBrandAssets(res.assets || []);
      } catch (e) {
        // fallback to legacy endpoint
        try {
          const legacy = await apiService.getBrandAssets(workspaceId);
          if (legacy.success) setBrandAssets(legacy.assets || []);
        } catch { }
      }
    })();
  }, [workspaceId]);

  // Auto-fill discoverUrl ONLY from completed Brand Setup data (savedBrand.website)
  // Does NOT read from the live url input — only triggers when brand is already saved
  useEffect(() => {
    if (savedBrand?.website?.trim() && !discoverUrl) {
      setDiscoverUrl(savedBrand.website.trim());
    }
  }, [savedBrand]);

  // AI Workflow Loading & Log Simulation Hook
  useEffect(() => {
    if (!isAnalyzing) return;
    
    // Clear logs and errors
    setLiveLogs([]);
    setIsCancelled(false);
    setAnalysisError(null);

    let stepIdx = 0;
    setAnalysisStep(0);
    setAnalysisProgress(0);

    const stepDuration = 3000; // 3 seconds per step simulation

    const runSimulation = () => {
      if (stepIdx >= ANALYSIS_STEPS.length) {
        return;
      }
      
      const currentStep = ANALYSIS_STEPS[stepIdx];
      setAnalysisStep(stepIdx);
      
      // Post logs corresponding to this step
      const stepLogs = LOG_MESSAGES[currentStep.id] || [];
      stepLogs.forEach((log, logIdx) => {
        setTimeout(() => {
          setLiveLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${log}`]);
        }, logIdx * 800);
      });

      // Update progress
      setAnalysisProgress(Math.min(Math.round(((stepIdx + 1) / ANALYSIS_STEPS.length) * 100), 95));

      stepIdx++;
      timerRef.current = setTimeout(runSimulation, stepDuration);
    };

    runSimulation();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isAnalyzing]);

  const handleCancelAnalysis = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsAnalyzing(false);
    setIsCancelled(true);
    setLiveLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - [WARN] Extraction pipeline aborted by user.`]);
    toast.error("Analysis cancelled.");
  };

  const handleAnalyzeUrl = async () => {
    if (!url.trim()) { toast.error("Please enter a website URL"); return; }
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    setIsCancelled(false);
    
    abortControllerRef.current = new AbortController();

    try {
      const res = await apiService.analyzeBrandUrl(url.trim(), workspaceId, {
        signal: abortControllerRef.current.signal
      });

      if (res.success) {
        setDnaData(res.dna);
        setRawKnowledgeBase(res.rawKnowledgeBase || "");

        // Save DNA to parent & normalized database immediately
        try {
          const saveRes = await apiService.saveBrandDNA(
            workspaceId,
            res.dna,
            res.logoUrl || null,
            res.rawKnowledgeBase || "",
            "url"
          );
          if (saveRes.success) {
            setSavedBrand(saveRes.brand);
          }
        } catch (saveErr) {
          console.error("Auto-save failed:", saveErr);
        }

        // Finalize simulation progress immediately
        if (timerRef.current) clearTimeout(timerRef.current);
        setAnalysisStep(ANALYSIS_STEPS.length - 1);
        setAnalysisProgress(100);
        setLiveLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - [System] Analysis complete. Saved successfully.`]);
        
        toast.success("Brand DNA extracted and saved successfully!");
        setTimeout(() => { setActiveTab("dna"); }, 800);
      } else {
        throw new Error(res.error || "Analysis returned an unsuccessful code.");
      }
    } catch (err) {
      if (err.name === 'AbortError' || err.message === 'canceled') return;
      console.error(err);
      setAnalysisError(err.message || "An unexpected error occurred during website crawling.");
      setLiveLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - [ERROR] Pipeline failure: ${err.message}`]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeDocs = async () => {
    if (uploadedFiles.length === 0) { toast.error("Please upload at least one document"); return; }
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    setIsCancelled(false);
    
    abortControllerRef.current = new AbortController();

    try {
      const formData = new FormData();
      uploadedFiles.forEach(f => formData.append("files", f));
      formData.append("workspaceId", workspaceId);

      const res = await apiService.analyzeBrandDocs(formData, workspaceId, {
        signal: abortControllerRef.current.signal
      });

      if (res.success) {
        setDnaData(res.dna);
        setRawKnowledgeBase(res.rawKnowledgeBase || "");

        try {
          const saveRes = await apiService.saveBrandDNA(
            workspaceId,
            res.dna,
            null,
            res.rawKnowledgeBase || "",
            "document"
          );
          if (saveRes.success) {
            setSavedBrand(saveRes.brand);
          }
        } catch (saveErr) {
          console.error("Auto-save failed:", saveErr);
        }

        if (timerRef.current) clearTimeout(timerRef.current);
        setAnalysisStep(ANALYSIS_STEPS.length - 1);
        setAnalysisProgress(100);
        setLiveLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - [System] Analysis complete. Saved successfully.`]);
        
        toast.success("Documents parsed and DNA cached successfully!");
        setTimeout(() => { setActiveTab("dna"); }, 800);
      } else {
        throw new Error(res.error || "Document parsing pipeline failed.");
      }
    } catch (err) {
      if (err.name === 'AbortError' || err.message === 'canceled') return;
      console.error(err);
      setAnalysisError(err.message || "An unexpected error occurred while parsing files.");
      setLiveLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - [ERROR] Parsing failure: ${err.message}`]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveDNA = async () => {
    if (!dnaData) return;
    setIsSaving(true);
    try {
      const res = await apiService.saveBrandDNA(workspaceId, dnaData, null, "", url ? "url" : "document");
      if (res.success) {
        setSavedBrand(res.brand);
        toast.success("Brand DNA saved successfully!");
        // Auto-fill the Brand Assets scan URL from Brand Setup URL and switch to Assets tab
        const websiteUrl = url?.trim() || res.brand?.website?.trim();
        if (websiteUrl) setDiscoverUrl(websiteUrl);
        setActiveTab("assets");
      } else {
        toast.error(res.error || "Save failed");
      }
    } catch (err) {
      toast.error(err.message || "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSection = async (sectionKey, updatedFields) => {
    const currentSection = dnaData?.[sectionKey] || {};
    const newSectionData = { ...currentSection, ...updatedFields };

    setDnaData(prev => ({
      ...prev,
      [sectionKey]: newSectionData
    }));

    try {
      const res = await apiService.updateBrandDNASection(workspaceId, sectionKey, newSectionData);
      if (res.success) {
        setDnaData(prev => ({
          ...prev,
          [sectionKey]: res.section
        }));
      }
    } catch (err) {
      console.error("Failed to sync update to database:", err);
      toast.error("Database update failed");
    }
  };

  const handleRegenerateSection = async (sectionKey) => {
    if (!workspaceId) return;
    
    const currentConf = dnaData?.[sectionKey]?.aiConfidence || 85;
    setRegeneratingSections(p => ({ ...p, [sectionKey]: true }));

    const thinkingPhrases = [
      "Analyzing raw brand context...",
      "Evaluating tone and vocabulary...",
      "Refining intelligence parameters...",
      "Polishing final output structures..."
    ];
    let phase = 0;
    setAiThinkingText(p => ({ ...p, [sectionKey]: thinkingPhrases[0] }));
    const phraseInterval = setInterval(() => {
      phase = (phase + 1) % thinkingPhrases.length;
      setAiThinkingText(p => ({ ...p, [sectionKey]: thinkingPhrases[phase] }));
    }, 2000);

    try {
      const res = await apiService.regenerateBrandDNASection(workspaceId, sectionKey);
      clearInterval(phraseInterval);
      if (res.success) {
        const newConf = res.section?.aiConfidence || 85;
        
        setConfidenceDiff(p => ({
          ...p,
          [sectionKey]: { from: currentConf, to: newConf }
        }));

        setDnaData(prev => ({ ...prev, [sectionKey]: res.section }));
        toast.success("Section regenerated and saved immediately!");

        setTimeout(() => {
          setConfidenceDiff(p => {
            const copy = { ...p };
            delete copy[sectionKey];
            return copy;
          });
        }, 8000);
      } else {
        toast.error(res.error || "Regeneration failed");
      }
    } catch (err) {
      clearInterval(phraseInterval);
      toast.error(err.response?.data?.error || err.message || "Regeneration failed");
    } finally {
      setRegeneratingSections(p => ({ ...p, [sectionKey]: false }));
      setAiThinkingText(p => {
        const copy = { ...p };
        delete copy[sectionKey];
        return copy;
      });
    }
  };

  const handleResetSection = async (sectionKey) => {
    if (!savedBrand) return;
    const lastSavedData = savedBrand[sectionKey] || {};
    await handleUpdateSection(sectionKey, lastSavedData);
    toast("Section reset and saved to database.");
  };

  const handleAssetUpload = async (files) => {
    if (!files?.length) return;
    setIsUploadingAsset(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(f => formData.append("files", f));
      formData.append("workspaceId", workspaceId);
      formData.append("category", assetCategory);
      const res = await apiService.uploadBrandAsset(formData);
      if (res.success) {
        setBrandAssets(prev => [...prev, ...res.assets]);
        toast.success("Assets uploaded!");
      } else {
        toast.error(res.error || "Upload failed");
      }
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setIsUploadingAsset(false);
    }
  };

  const handleDeleteAsset = async (filename) => {
    try {
      await apiService.deleteBrandAsset(workspaceId, filename);
      setBrandAssets(prev => prev.filter(a => a.filename !== filename));
      toast.success("Asset deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const renderSetupTab = () => {
    if (isAnalyzing || analysisError || isCancelled) {
      return (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-[28px] p-6 space-y-6">
            
            {/* Header / Loading Spinner */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  {isAnalyzing ? (
                    <>
                      <Cpu className="w-5 h-5 text-primary animate-spin" />
                      AI Onboarding Engine Active
                    </>
                  ) : isCancelled ? (
                    <>
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      Crawling Aborted
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      Crawling Pipeline Failure
                    </>
                  )}
                </h3>
                <p className="text-[10px] font-medium text-slate-400 mt-1">
                  {isAnalyzing ? "Processing website structure and business details..." : "Review logs below."}
                </p>
              </div>
              <span className="text-xs font-black text-primary bg-primary/10 px-2.5 py-1 rounded-xl">
                {analysisProgress}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden relative">
              <div className={`h-full bg-primary rounded-full transition-all duration-500 ${isAnalyzing ? "animate-pulse" : ""}`} style={{ width: `${analysisProgress}%` }} />
            </div>

            {/* AI Steps Timeline */}
            {isAnalyzing && (
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-white/[0.01] rounded-2xl border border-slate-200 dark:border-white/5">
                {ANALYSIS_STEPS.map((step, idx) => (
                  <div key={idx} className={`flex items-center gap-2 transition-all duration-300 ${idx === analysisStep ? "opacity-100 scale-102" : idx < analysisStep ? "opacity-55" : "opacity-25"}`}>
                    {idx < analysisStep ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : idx === analysisStep ? (
                      <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-white/20 shrink-0" />
                    )}
                    <span className={`text-[10px] font-bold tracking-wide uppercase ${idx === analysisStep ? "text-primary font-black" : idx < analysisStep ? "text-emerald-500" : "text-slate-400"}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Error Message Card */}
            {analysisError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest">Pipeline Error Detail</h4>
                  <p className="text-[10px] text-red-600 dark:text-red-400 font-medium leading-relaxed">{analysisError}</p>
                </div>
              </div>
            )}

            {/* Cancel & Retry Control Actions */}
            <div className="flex gap-3 justify-end pt-1">
              {isAnalyzing && (
                <button onClick={handleCancelAnalysis} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                  Cancel Analysis
                </button>
              )}
              {(analysisError || isCancelled) && (
                <>
                  <button onClick={() => { setIsCancelled(false); setAnalysisError(null); }} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                    Reset Form
                  </button>
                  <button onClick={url ? handleAnalyzeUrl : handleAnalyzeDocs} className="px-5 py-2.5 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-102 active:scale-95 transition-all shadow-lg shadow-primary/20">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retry Extraction
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto hover:scale-105 active:scale-95 transition-transform">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">Brand Intelligence Onboarding</h2>
          <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
            Select a target format below to automatically configure the AI memory engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Option 1 - Website URL Card */}
          <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-[28px] p-6 space-y-4 hover:border-primary/30 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4.5 h-4.5 text-primary" />
                <h3 className="text-[10px] font-black text-slate-700 dark:text-white uppercase tracking-[3px]">Option 1 — URL</h3>
              </div>
              <p className="text-[10px] font-medium text-slate-400">Scan domain pages to extract tone, products, and brand voice.</p>
            </div>
            
            <div className="space-y-3 pt-2">
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="url" value={url} onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAnalyzeUrl()}
                  placeholder="https://yourcompany.com"
                  className="w-full pl-10 pr-4 py-3 text-[11px] font-medium bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-primary/50 text-slate-700 dark:text-slate-300 placeholder-slate-400" />
              </div>
              <button onClick={handleAnalyzeUrl} disabled={!url.trim()}
                className="w-full py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                <Sparkles className="w-4 h-4" />
                Analyze Domain
              </button>
            </div>
          </div>

          {/* Option 2 - Documents Upload Card */}
          <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-[28px] p-6 space-y-4 hover:border-primary/30 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-primary" />
                <h3 className="text-[10px] font-black text-slate-700 dark:text-white uppercase tracking-[3px]">Option 2 — Upload</h3>
              </div>
              <p className="text-[10px] font-medium text-slate-400">Parse brand files: Guidelines, PDFs, or PPTs.</p>
            </div>

            <div className="space-y-3 pt-2">
              <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); setUploadedFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]); }}
                onClick={() => docInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${dragOver ? "border-primary bg-primary/5" : "border-slate-200 dark:border-white/10 hover:border-primary/40"}`}>
                <Upload className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto mb-1" />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Upload Guidelines files</p>
                <input ref={docInputRef} type="file" accept=".pdf,.docx,.pptx,.ppt,.txt" multiple hidden
                  onChange={e => { setUploadedFiles(prev => [...prev, ...Array.from(e.target.files)]); e.target.value = ""; }} />
              </div>
              {uploadedFiles.length > 0 && (
                <div className="space-y-2 max-h-[120px] overflow-y-auto">
                  {uploadedFiles.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-white/[0.01] border border-slate-200 dark:border-white/10 rounded-xl">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 truncate">{f.name}</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setUploadedFiles(prev => prev.filter((_, idx) => idx !== i)); }} className="text-slate-400 hover:text-red-500 transition-colors shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button onClick={handleAnalyzeDocs}
                    className="w-full py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all">
                    <Sparkles className="w-4 h-4" />
                    Extract Files
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  };

  const renderDNATab = () => {
    if (isLoadingDNA) {
      return (
        <div className="space-y-4 max-w-4xl mx-auto">
          <div className="flex justify-between items-center pb-2">
            <div className="space-y-2 w-1/3">
              <div className="h-4 bg-slate-200 dark:bg-white/10 rounded-md animate-pulse w-full" />
              <div className="h-3 bg-slate-200 dark:bg-white/5 rounded-md animate-pulse w-1/2" />
            </div>
            <div className="h-10 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse w-24" />
          </div>
          {[1, 2, 3, 4].map(idx => (
            <div key={idx} className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-[24px] p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-white/10 animate-pulse" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 bg-slate-200 dark:bg-white/10 rounded animate-pulse w-1/4" />
                  <div className="h-2 bg-slate-200 dark:bg-white/5 rounded animate-pulse w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (!dnaData) {
      return (
        <div className="text-center py-20 space-y-4 max-w-md mx-auto bg-white dark:bg-white/[0.01] border border-slate-200 dark:border-white/10 rounded-[32px] p-8 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto hover:scale-105 active:scale-95 transition-transform shadow-sm">
            <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-600" />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-widest">No Brand DNA Yet</p>
            <p className="text-[10px] font-medium text-slate-400 leading-relaxed">Analyze your website or upload guidelines documents in the setup screen to configure the AI memory engine.</p>
          </div>
          <button onClick={() => setActiveTab("setup")} className="px-6 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20">
            Initialize Onboarding
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        
        {/* DNA Header controls */}
        <div className="flex justify-between items-center bg-white dark:bg-white/[0.01] p-4 border border-slate-200 dark:border-white/10 rounded-2xl max-w-4xl mx-auto">
          <div>
            <h2 className="text-md font-black text-slate-800 dark:text-white">Brand DNA Matrix</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">14 Normalized Sections • Dynamic CRUD & History Versioning</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => {
              const expands = {};
              DNA_SECTIONS.forEach(s => expands[s.key] = true);
              setExpandedSections(expands);
            }} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
              Expand All
            </button>
            <button onClick={() => setExpandedSections({})} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
              Collapse All
            </button>
            <button onClick={handleSaveDNA} disabled={isSaving}
              className="px-5 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {isSaving ? "Saving..." : "Save DNA"}
            </button>
          </div>
        </div>

        {/* Sections loop */}
        <div className="space-y-4 max-w-4xl mx-auto">
          {DNA_SECTIONS.map(({ key, label, icon: Icon, sectionLetter }) => {
            const sectionData = dnaData?.[key];
            const confidence = sectionData?.aiConfidence || 0;
            const isExpanded = expandedSections[key] ?? false;
            const isRegenerating = regeneratingSections[key];

            return (
              <div key={key} className={`bg-white dark:bg-white/[0.01] border rounded-[24px] overflow-hidden transition-all duration-300 ${isExpanded ? "border-primary/30 shadow-sm" : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"}`}>
                
                {/* Header toggle button */}
                <button onClick={() => setExpandedSections(p => ({ ...p, [key]: !isExpanded }))}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isExpanded ? "bg-primary/20 text-primary" : "bg-slate-100 dark:bg-white/5 text-slate-400"}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Section {sectionLetter}</span>
                      <span className="text-[11px] font-black text-slate-800 dark:text-white">{label}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ConfidenceBadge score={confidence} />
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {/* Body Content */}
                {isExpanded && (
                  <div className="px-5 pb-5 space-y-4 animate-fade-in border-t border-slate-100 dark:border-white/5 pt-4">
                    
                    {/* Live active regeneration updates */}
                    {isRegenerating && aiThinkingText[key] && (
                      <div className="flex items-center gap-2 p-3 bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-500/10 rounded-2xl animate-pulse">
                        <Cpu className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{aiThinkingText[key]}</span>
                      </div>
                    )}

                    {/* Confidence Delta Box */}
                    {confidenceDiff[key] && (
                      <div className="flex items-center gap-2 p-3 bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-500/10 rounded-2xl animate-fade-in">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                          Confidence Update: {confidenceDiff[key].from}% ➔ {confidenceDiff[key].to}%
                        </span>
                      </div>
                    )}

                    {/* Section CRUD controls */}
                    <div className="flex flex-wrap gap-2 pt-1 border-b border-slate-100 dark:border-white/5 pb-3">
                      <button onClick={() => handleRegenerateSection(key)} disabled={isRegenerating}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 text-[8px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                        <RefreshCw className={`w-3 h-3 ${isRegenerating ? "animate-spin" : ""}`} />
                        {isRegenerating ? "Regenerating..." : "Regenerate"}
                      </button>
                      
                      <button onClick={() => { handleUpdateSection(key, { isApproved: true }); toast.success("Section approved!"); }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all ${sectionData?.isApproved === true ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-100 dark:bg-white/5 text-slate-500"}`}>
                        <Check className="w-3 h-3" />
                        Approved
                      </button>

                      <button onClick={() => { handleUpdateSection(key, { isApproved: false }); toast.error("Section rejected / unapproved."); }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all ${sectionData?.isApproved === false ? "bg-red-500/10 text-red-500" : "bg-slate-100 dark:bg-white/5 text-slate-500"}`}>
                        <X className="w-3 h-3" />
                        Rejected
                      </button>

                      <button onClick={() => handleResetSection(key)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 text-[8px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                        <RotateCcw className="w-3 h-3" />
                        Reset
                      </button>
                    </div>

                    {renderSectionContent(key, sectionData, (fieldKey, value) => handleFieldChange(key, fieldKey, value))}
                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>
    );
  };

  // ── Brand Intelligence Agent helpers ──────────────────────────────────────
  const handleDiscoverAssets = async () => {
    // Auto-resolve URL: typed > setup tab URL > saved brand website
    const targetUrl = discoverUrl.trim() || url?.trim() || savedBrand?.website?.trim();
    const hasFiles = uploadedFiles.length > 0;

    if (!targetUrl && !hasFiles) {
      toast.error("Please enter a website URL or upload brand documents in Brand Setup first");
      return;
    }

    setIsDiscovering(true);
    setDiscoveredAssets(null);
    setAssetApprovals({});
    setDiscoveryError(null);

    try {
      let payload;
      if (hasFiles) {
        // Build FormData — carry docs uploaded in Brand Setup + URL if available
        payload = new FormData();
        uploadedFiles.forEach(f => payload.append("files", f));
        if (targetUrl) payload.append("url", targetUrl);
      } else {
        payload = targetUrl;
      }

      const res = await apiService.discoverBrandAssets(workspaceId, payload);
      if (res.success) {
        setDiscoveredAssets(res.discovered);
        // Default-approve all with confidence >= 80
        const defaults = {};
        const d = res.discovered;
        const autoApprove = (arr, cat) => arr.forEach((item, i) => { if ((item.confidence || 0) >= 80) defaults[`${cat}-${i}`] = true; });
        autoApprove(d.logos || [], 'logo');
        autoApprove(d.colors || [], 'color');
        autoApprove(d.fonts || [], 'font');
        autoApprove(d.images || [], 'image');
        autoApprove(d.socialProfiles || [], 'social');
        autoApprove(d.documents || [], 'document');
        if (d.favicon) defaults['favicon-0'] = true;
        setAssetApprovals(defaults);
        toast.success(hasFiles ? `Discovered assets from ${hasFiles ? uploadedFiles.length + ' doc(s)' : ''}${targetUrl ? ' + ' + targetUrl : ''}` : `Discovered assets from ${targetUrl}`);
      } else {
        throw new Error(res.error || 'Discovery failed');
      }
    } catch (err) {
      setDiscoveryError(err.response?.data?.error || err.message || 'Asset discovery failed');
      toast.error('Discovery failed');
    } finally {
      setIsDiscovering(false);
    }
  };

  const toggleApproval = (key) => {
    setAssetApprovals(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveDiscoveredAssets = async () => {
    if (!discoveredAssets) return;
    setIsSavingAssets(true);
    try {
      const toSave = [];
      const d = discoveredAssets;
      const collect = (arr, cat, extraFn) => (arr || []).forEach((item, i) => {
        if (item && assetApprovals[`${cat}-${i}`]) toSave.push({ category: cat, ...item, ...(extraFn ? extraFn(item) : {}) });
      });
      collect(d.logos || [], 'logo');
      collect(d.colors || [], 'color', item => ({ hex: item?.hex || '' }));
      collect(d.fonts || [], 'font', item => ({ name: item?.name || '' }));
      collect(d.images || [], 'image');
      collect(d.socialProfiles || [], 'social', item => ({ platform: item.platform }));
      collect(d.documents || [], 'document', item => ({ type: item.type, name: item.name }));
      if (assetApprovals['favicon-0'] && d.favicon) toSave.push({ category: 'favicon', ...d.favicon });

      if (toSave.length === 0) { toast.error('Select at least one asset to save'); setIsSavingAssets(false); return; }

      const res = await apiService.saveDiscoveredBrandAssets(workspaceId, toSave);
      if (res.success) {
        toast.success(`${res.saved} assets saved to Brand Memory!`);
        // Refresh the stored assets list
        const updated = await apiService.getAllBrandAssets(workspaceId);
        if (updated.success) setBrandAssets(updated.assets || []);
        setDiscoveredAssets(null);
        // Show brand setup complete success card
        setShowSuccessCard(true);
      } else {
        toast.error(res.error || 'Save failed');
      }
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setIsSavingAssets(false);
    }
  };

  const renderAssetsTab = () => {
    const SOCIAL_ICONS = { instagram: Instagram, twitter: Twitter, youtube: Youtube, linkedin: Linkedin, facebook: Facebook };

    // ── Deduplication helpers ──────────────────────────────────────────────────
    const dedupeByKey = (arr, keyFn) => {
      const seen = new Set();
      return (arr || []).filter(item => {
        const k = keyFn(item);
        if (!k || seen.has(k)) return false;
        seen.add(k); return true;
      });
    };

    const d = discoveredAssets || {};
    const logos  = dedupeByKey(d.logos,          item => item?.url);
    const colors = dedupeByKey(d.colors,         item => item?.hex?.toLowerCase());
    const fonts  = dedupeByKey(d.fonts,          item => item?.name?.toLowerCase());
    const images = dedupeByKey(d.images,         item => item?.url);
    const socials = dedupeByKey(d.socialProfiles, item => item?.url || item?.platform);
    const docs   = dedupeByKey(d.documents,      item => item?.url || item?.name);
    const favicon = d.favicon;

    const totalAssets = logos.length + colors.length + fonts.length + images.length + socials.length + docs.length + (favicon ? 1 : 0);

    // ── Selection helpers ──────────────────────────────────────────────────────
    const selectedKeys = Object.entries(assetApprovals).filter(([, v]) => v === true).map(([k]) => k);
    const allKeys = [
      ...logos.map((_, i) => `logo-${i}`),
      ...colors.map((_, i) => `color-${i}`),
      ...fonts.map((_, i) => `font-${i}`),
      ...images.map((_, i) => `image-${i}`),
      ...socials.map((_, i) => `social-${i}`),
      ...docs.map((_, i) => `document-${i}`),
      ...(favicon ? ['favicon-0'] : []),
    ];
    const approveAll = () => { const u = {}; allKeys.forEach(k => u[k] = true);  setAssetApprovals(u); };
    const rejectAll  = () => { const u = {}; allKeys.forEach(k => u[k] = false); setAssetApprovals(u); };
    const toggleKey  = (key) => setAssetApprovals(p => ({ ...p, [key]: !p[key] }));

    // ── Confidence badge ───────────────────────────────────────────────────────
    const ConfBadge = ({ pct }) => {
      const c = (pct >= 90) ? 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20'
               : (pct >= 75) ? 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20'
               : 'text-red-500 bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20';
      return <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full border ${c}`}>{pct || '?'}%</span>;
    };

    // ── Section header ─────────────────────────────────────────────────────────
    const SectionHeader = ({ icon: Icon, title, count, onSelectAll, onDeselectAll }) => (
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-[12px] font-black text-slate-800 dark:text-white tracking-tight">{title}</h3>
          <span className="text-[9px] font-black text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">{count}</span>
        </div>
        {onSelectAll && (
          <div className="flex gap-3">
            <button onClick={onSelectAll} className="text-[9px] font-black text-primary hover:underline uppercase tracking-widest">Select All</button>
            <button onClick={onDeselectAll} className="text-[9px] font-black text-slate-400 hover:underline uppercase tracking-widest">None</button>
          </div>
        )}
      </div>
    );

    // ── Asset checkbox card ────────────────────────────────────────────────────
    const CheckCard = ({ cardKey, children, className = '' }) => {
      const selected = assetApprovals[cardKey] === true;
      return (
        <div onClick={() => toggleKey(cardKey)}
          className={`relative cursor-pointer rounded-2xl border-2 transition-all duration-200 group overflow-hidden select-none
            ${selected
              ? 'border-primary/50 shadow-lg shadow-primary/10 ring-2 ring-primary/15 bg-primary/[0.01]'
              : 'border-slate-100 dark:border-white/8 hover:border-slate-200 dark:hover:border-white/15 hover:shadow-md'}
            ${className}`}>
          <div className={`absolute top-2 right-2 z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shadow-sm
            ${selected ? 'bg-primary border-primary' : 'bg-white/90 dark:bg-slate-900/90 border-slate-300 dark:border-white/20 group-hover:border-primary/50'}`}>
            {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
          </div>
          {children}
        </div>
      );
    };

    // ── Collapsible manual upload state (moved to component top level) ─────────
    const MANUAL_CATS = ASSET_CATEGORIES.filter(c => ['logo','images','videos','guidelines','marketing'].includes(c.id));

    // ── Image lightbox state (moved to component top level) ───────────────────

    return (
      <div className="space-y-5 max-w-5xl mx-auto">

        {/* ── Scan Panel ── */}
        <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Scan className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-[14px] font-black text-slate-800 dark:text-white">Brand Intelligence Agent</h2>
              <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">Auto-discover logos · colors · fonts · images from any website</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="url" value={discoverUrl}
                onChange={e => setDiscoverUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleDiscoverAssets()}
                placeholder="https://yourcompany.com"
                className="w-full pl-10 pr-4 py-3 text-[11px] font-medium bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 text-slate-700 dark:text-slate-300 placeholder-slate-400 transition-all" />
            </div>
            <button onClick={handleDiscoverAssets} disabled={isDiscovering}
              className="px-6 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 shrink-0">
              {isDiscovering ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
              {isDiscovering ? 'Scanning…' : 'Scan & Discover'}
            </button>
          </div>

          {isDiscovering && (
            <div className="mt-4 p-4 bg-indigo-50/60 dark:bg-indigo-500/5 border border-indigo-200/60 dark:border-indigo-500/10 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">AI Agent Scanning…</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Reading HTML', 'Detecting Logo', 'Extracting Colors', 'Finding Fonts', 'Mapping Social Links', 'Locating Documents'].map((step, i) => (
                  <span key={i} className="text-[8px] font-bold text-indigo-500 bg-indigo-500/8 border border-indigo-500/15 px-2 py-0.5 rounded-lg">{step}</span>
                ))}
              </div>
            </div>
          )}

          {discoveryError && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-[9px] font-bold text-red-600 dark:text-red-400">{discoveryError}</p>
            </div>
          )}
        </div>

        {/* ── Discovered Assets ── */}
        {discoveredAssets ? (
          <div className="space-y-5">

            {/* Asset Count Summary + Action Toolbar */}
            <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex flex-wrap items-center gap-3 shadow-sm">
              <div className="flex items-center gap-2 mr-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black text-slate-700 dark:text-white uppercase tracking-widest">Discovered Assets</span>
                <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">{totalAssets} total</span>
              </div>
              {[
                { label: 'Logo', count: logos.length, icon: Star },
                { label: 'Colors', count: colors.length, icon: Palette },
                { label: 'Fonts', count: fonts.length, icon: Type },
                { label: 'Images', count: images.length, icon: ImageIcon },
                { label: 'Social', count: socials.length, icon: Link2 },
                { label: 'Docs', count: docs.length, icon: FileText },
              ].filter(x => x.count > 0).map(({ label, count, icon: Icon }) => (
                <div key={label} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5">
                  <Icon className="w-3 h-3 text-slate-400" />
                  <span className="text-[9px] font-black text-slate-600 dark:text-slate-300">{label}</span>
                  <span className="text-[9px] font-black text-primary">({count})</span>
                </div>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <button onClick={approveAll}
                  className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-[8px] font-black uppercase tracking-widest border border-emerald-200 dark:border-emerald-500/20 hover:scale-105 transition-all flex items-center gap-1">
                  <Check className="w-2.5 h-2.5" /> Approve All
                </button>
                <button onClick={rejectAll}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-white/5 text-slate-500 rounded-xl text-[8px] font-black uppercase tracking-widest border border-slate-200 dark:border-white/10 hover:scale-105 transition-all flex items-center gap-1">
                  <X className="w-2.5 h-2.5" /> Clear All
                </button>
                <button onClick={handleSaveDiscoveredAssets} disabled={isSavingAssets || selectedKeys.length === 0}
                  className="px-4 py-1.5 bg-primary text-white rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-40">
                  {isSavingAssets ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  {isSavingAssets ? 'Saving…' : `Save Selected (${selectedKeys.length})`}
                </button>
              </div>
            </div>

            {/* ── LOGOS ── */}
            {logos.length > 0 && (
              <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
                <SectionHeader icon={Star} title="Brand Logo" count={logos.length}
                  onSelectAll={() => { const u = {}; logos.forEach((_, i) => u[`logo-${i}`] = true); setAssetApprovals(p => ({ ...p, ...u })); }}
                  onDeselectAll={() => { const u = {}; logos.forEach((_, i) => u[`logo-${i}`] = false); setAssetApprovals(p => ({ ...p, ...u })); }} />

                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Primary logo large preview */}
                  <CheckCard cardKey="logo-0" className="flex-1">
                    <div className="min-h-[200px] flex flex-col items-center justify-center p-8 bg-[repeating-conic-gradient(#f1f5f9_0%_25%,white_0%_50%)] dark:bg-[repeating-conic-gradient(#1e293b_0%_25%,#0f172a_0%_50%)] bg-[length:16px_16px]">
                      <img src={logos[0].url} alt="Primary Logo"
                        className="max-h-[160px] max-w-[260px] object-contain drop-shadow-lg"
                        onError={e => { e.target.style.display = 'none'; }} />
                    </div>
                    <div className="p-4 bg-white dark:bg-[#0f172a] border-t border-slate-100 dark:border-white/5">
                      <p className="text-[11px] font-black text-slate-700 dark:text-white mb-2">{logos[0].label || 'Primary Logo'}</p>
                      <div className="flex flex-wrap gap-2">
                        {logos[0].resolution && <span className="text-[7px] font-bold text-slate-500 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded">{logos[0].resolution}</span>}
                        {logos[0].format && <span className="text-[7px] font-bold text-slate-500 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded">{logos[0].format?.toUpperCase()}</span>}
                        {logos[0].source && <span className="text-[7px] font-bold text-slate-500 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded">{logos[0].source}</span>}
                        <ConfBadge pct={logos[0].confidence} />
                      </div>
                    </div>
                  </CheckCard>

                  {/* Logo variants column */}
                  {logos.length > 1 && (
                    <div className="flex flex-col gap-3 w-48">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Variants</p>
                      {logos.slice(1).map((logo, i) => (
                        <CheckCard key={i} cardKey={`logo-${i + 1}`} className="flex items-center gap-3 p-3 bg-slate-50/60 dark:bg-white/[0.01]">
                          <div className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 shrink-0">
                            <img src={logo.url} alt={logo.label} className="max-w-full max-h-full object-contain"
                              onError={e => { e.target.style.display = 'none'; }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[9px] font-black text-slate-700 dark:text-white truncate">{logo.label || `Variant ${i + 1}`}</p>
                            <ConfBadge pct={logo.confidence} />
                          </div>
                        </CheckCard>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── COLORS ── */}
            {colors.length > 0 ? (
              <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
                <SectionHeader icon={Palette} title="Brand Colors" count={colors.length}
                  onSelectAll={() => { const u = {}; colors.forEach((_, i) => u[`color-${i}`] = true); setAssetApprovals(p => ({ ...p, ...u })); }}
                  onDeselectAll={() => { const u = {}; colors.forEach((_, i) => u[`color-${i}`] = false); setAssetApprovals(p => ({ ...p, ...u })); }} />
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {colors.map((color, idx) => (
                    <CheckCard key={idx} cardKey={`color-${idx}`} className="overflow-hidden">
                      <div className="h-20 w-full rounded-t-[14px]" style={{ backgroundColor: color?.hex }} />
                      <div className="p-2.5 bg-white dark:bg-[#0f172a] space-y-0.5">
                        <p className="text-[9px] font-black text-slate-700 dark:text-white truncate">{color?.role || color?.label || 'Color'}</p>
                        <p className="text-[8px] font-bold text-slate-400 font-mono uppercase">{color?.hex}</p>
                        {color?.rgb && <p className="text-[7px] text-slate-300 dark:text-slate-600 font-mono">{color?.rgb}</p>}
                      </div>
                    </CheckCard>
                  ))}
                </div>
              </div>
            ) : discoveredAssets ? (
              <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm text-center py-8">
                <Palette className="w-8 h-8 text-slate-300 dark:text-white/20 mx-auto mb-2" />
                <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">No brand colors detected from this website.</p>
              </div>
            ) : null}

            {/* ── FONTS ── */}
            {fonts.length > 0 && (
              <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
                <SectionHeader icon={Type} title="Brand Fonts" count={fonts.length}
                  onSelectAll={() => { const u = {}; fonts.forEach((_, i) => u[`font-${i}`] = true); setAssetApprovals(p => ({ ...p, ...u })); }}
                  onDeselectAll={() => { const u = {}; fonts.forEach((_, i) => u[`font-${i}`] = false); setAssetApprovals(p => ({ ...p, ...u })); }} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {fonts.map((font, idx) => (
                    <CheckCard key={idx} cardKey={`font-${idx}`} className="p-5 bg-slate-50/40 dark:bg-white/[0.01]">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <span className="text-5xl font-bold text-slate-800 dark:text-white leading-none" style={{ fontFamily: font.name }}>Aa</span>
                          <ConfBadge pct={font.confidence} />
                        </div>
                        <div>
                          <p className="text-[12px] font-black text-slate-700 dark:text-white">{font.name}</p>
                          {font.source && <p className="text-[8px] text-primary font-bold mt-0.5">{font.source}</p>}
                          {font.weights?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {font.weights.map((w, wi) => (
                                <span key={wi} className="text-[7px] font-bold text-slate-400 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-1.5 py-0.5 rounded">{w}</span>
                              ))}
                            </div>
                          )}
                          <p className="text-[10px] text-slate-400 mt-2.5 leading-relaxed" style={{ fontFamily: font.name }}>
                            The quick brown fox jumps over the lazy dog.
                          </p>
                        </div>
                      </div>
                    </CheckCard>
                  ))}
                </div>
              </div>
            )}

            {/* ── SOCIAL PROFILES ── */}
            {socials.length > 0 && (
              <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
                <SectionHeader icon={Link2} title="Social Profiles" count={socials.length}
                  onSelectAll={() => { const u = {}; socials.forEach((_, i) => u[`social-${i}`] = true); setAssetApprovals(p => ({ ...p, ...u })); }}
                  onDeselectAll={() => { const u = {}; socials.forEach((_, i) => u[`social-${i}`] = false); setAssetApprovals(p => ({ ...p, ...u })); }} />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {socials.map((item, idx) => {
                    const SIcon = SOCIAL_ICONS[item.platform?.toLowerCase()] || Link2;
                    return (
                      <CheckCard key={idx} cardKey={`social-${idx}`} className="p-4 bg-slate-50/50 dark:bg-white/[0.01] flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <SIcon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-slate-700 dark:text-white capitalize">{item.platform}</p>
                          <a href={item.url} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="text-[8px] text-primary hover:underline truncate block">{item.url?.replace(/https?:\/\//, '')}</a>
                        </div>
                      </CheckCard>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── DOCUMENTS ── */}
            {docs.length > 0 && (
              <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
                <SectionHeader icon={FileText} title="Documents" count={docs.length}
                  onSelectAll={() => { const u = {}; docs.forEach((_, i) => u[`document-${i}`] = true); setAssetApprovals(p => ({ ...p, ...u })); }}
                  onDeselectAll={() => { const u = {}; docs.forEach((_, i) => u[`document-${i}`] = false); setAssetApprovals(p => ({ ...p, ...u })); }} />
                <div className="space-y-2.5">
                  {docs.map((doc, idx) => (
                    <CheckCard key={idx} cardKey={`document-${idx}`} className="p-4 flex items-center gap-4 bg-slate-50/50 dark:bg-white/[0.01]">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-slate-700 dark:text-white truncate">{doc.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {doc.type && <span className="text-[7px] font-bold text-primary bg-primary/8 border border-primary/15 px-1.5 py-0.5 rounded">{doc.type?.toUpperCase()}</span>}
                          {doc.url && <span className="text-[7px] text-slate-400 truncate">{doc.url?.replace(/https?:\/\//, '').substring(0, 45)}</span>}
                        </div>
                      </div>
                      <ConfBadge pct={doc.confidence} />
                    </CheckCard>
                  ))}
                </div>
              </div>
            )}


          </div>
        ) : (
          !isDiscovering && (
            <div className="text-center py-20 bg-white dark:bg-white/[0.01] border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl space-y-4 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                <Scan className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              </div>
              <div>
                <p className="text-[14px] font-black text-slate-600 dark:text-slate-300">No Brand Assets Found</p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">Scan a website above or upload assets manually below</p>
              </div>
            </div>
          )
        )}


        {/* ── Manual Upload (Collapsed) ── */}
        <div className="bg-white dark:bg-white/[0.01] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
          <button onClick={() => setManualOpen(o => !o)}
            className="w-full flex items-center justify-between p-5 hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                <Upload className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-700 dark:text-white">Need to replace or upload missing assets?</p>
                <p className="text-[9px] text-slate-400 font-medium">Upload logo, images, videos, or documents manually</p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 shrink-0 ${manualOpen ? 'rotate-180' : ''}`} />
          </button>

          {manualOpen && (
            <div className="px-5 pb-5 border-t border-slate-100 dark:border-white/5 space-y-4 pt-4">
              <div className="flex flex-wrap gap-2">
                {MANUAL_CATS.map(cat => (
                  <button key={cat.id} onClick={() => setAssetCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 border ${assetCategory === cat.id ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 dark:border-white/10 text-slate-500 bg-slate-50 dark:bg-white/[0.02]'}`}>
                    {cat.label}
                  </button>
                ))}
              </div>
              <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleAssetUpload(Array.from(e.dataTransfer.files)); }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${dragOver ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-white/10 hover:border-primary/40 hover:bg-slate-50 dark:hover:bg-white/[0.01]'}`}>
                <Upload className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Drop {assetCategory} files here or click to browse</p>
                {isUploadingAsset && <RefreshCw className="w-5 h-5 text-primary animate-spin mx-auto mt-2" />}
                <input ref={fileInputRef} type="file" multiple hidden accept={ASSET_CATEGORIES.find(c => c.id === assetCategory)?.accept || '*'}
                  onChange={e => { handleAssetUpload(Array.from(e.target.files)); e.target.value = ''; }} />
              </div>
            </div>
          )}
        </div>

        {/* ── Lightbox ── */}
        {lightbox && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}>
            <div className="relative max-w-4xl w-full bg-white dark:bg-[#0f172a] rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/10">
                <p className="text-[11px] font-black text-slate-700 dark:text-white">{lightbox.label || 'Image Preview'}</p>
                <button onClick={() => setLightbox(null)} className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center hover:scale-105 transition-all">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="p-6 bg-[repeating-conic-gradient(#f1f5f9_0%_25%,white_0%_50%)] dark:bg-[repeating-conic-gradient(#1e293b_0%_25%,#0f172a_0%_50%)] bg-[length:20px_20px] min-h-[300px] flex items-center justify-center">
                <img src={lightbox.url} alt={lightbox.label} className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-lg"
                  onError={e => { e.target.style.display = 'none'; }} />
              </div>
              <div className="p-4 flex items-center justify-between border-t border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-3">
                  {lightbox.type && <span className="text-[8px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded">{lightbox.type}</span>}
                  {lightbox.resolution && <span className="text-[8px] text-slate-400 font-bold">{lightbox.resolution}</span>}
                </div>
                <a href={lightbox.url} download target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-md shadow-primary/20">
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  };
  const handleFieldChange = (sectionKey, fieldKey, value) => {
    handleUpdateSection(sectionKey, { [fieldKey]: value });
  };

  return (
    <div className="min-h-full">

      {/* ── Brand Setup Complete Success Modal ── */}
      {showSuccessCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowSuccessCard(false)}>
          <div className="relative w-full max-w-md bg-white dark:bg-[#0f172a] rounded-3xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}>
            {/* Top gradient bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-primary to-indigo-500" />
            <div className="p-8 text-center space-y-5">
              {/* Success icon */}
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-[20px] font-black text-slate-800 dark:text-white">Brand Setup Complete!</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  Your brand information, DNA, and assets have been saved successfully.
                  <br />The AI will use this context for all future content generation.
                </p>
              </div>
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Brand Setup', icon: Globe, done: !!savedBrand?.website },
                  { label: 'Brand DNA', icon: Sparkles, done: !!savedBrand },
                  { label: 'Brand Assets', icon: ImageIcon, done: brandAssets.length > 0 },
                ].map(({ label, icon: Icon, done }) => (
                  <div key={label} className={`rounded-2xl p-3 border flex flex-col items-center gap-1.5 ${
                    done ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20'
                         : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10'
                  }`}>
                    <Icon className={`w-4 h-4 ${done ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <span className={`text-[8px] font-black uppercase tracking-widest ${done ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>{label}</span>
                    {done && <Check className="w-3 h-3 text-emerald-500" strokeWidth={3} />}
                  </div>
                ))}
              </div>
               <button onClick={() => {
                  setShowSuccessCard(false);
                  if (setParentActiveTab) setParentActiveTab('calendar');
                  if (setShowGeneratorOptions) setShowGeneratorOptions(true);
                }}
                className="w-full py-3 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/25">
                Content generator
              </button>
            </div>
          </div>
        </div>
      )}


      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl mb-6 w-fit mx-auto">
        {[
          { id: "setup", label: "Brand Setup", icon: Globe },
          { id: "dna",   label: "Brand DNA",   icon: Sparkles },
          { id: "assets",label: "Brand Assets",icon: ImageIcon },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === id ? "bg-white dark:bg-white/10 text-primary shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white"}`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>
      <div className="px-1">
        {activeTab === "setup"  && renderSetupTab()}
        {activeTab === "dna"    && renderDNATab()}
        {activeTab === "assets" && renderAssetsTab()}
      </div>
    </div>
  );
};

export default BrandWorkspace;
