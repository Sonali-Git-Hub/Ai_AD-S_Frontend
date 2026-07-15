import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog } from '@headlessui/react';
import { 
  X, Instagram, Facebook, Linkedin, Twitter, Youtube, Hash, Play, 
  Image as ImageIcon, Video, Upload, Trash2, CheckCircle2, ChevronDown, Check,
  FileText, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

const platforms = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-500' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
  { id: 'twitter', name: 'Twitter (X)', icon: Twitter, color: 'text-slate-800 dark:text-slate-200' },
  { id: 'threads', name: 'Threads', icon: Hash, color: 'text-slate-900 dark:text-white' }, // placeholder icon
  { id: 'tiktok', name: 'TikTok', icon: Play, color: 'text-black dark:text-white' }, // placeholder
  { id: 'pinterest', name: 'Pinterest', icon: ImageIcon, color: 'text-red-500' },
  { id: 'youtube', name: 'YouTube Community', icon: Youtube, color: 'text-red-600' }
];

const contentTypes = [
  'Marketing Post', 'Product Promotion', 'Educational', 'Announcement', 
  'Offer / Discount', 'Brand Awareness', 'Event Promotion', 'Recruitment', 'Custom'
];

const targetAudiences = [
  'General Audience', 'Students', 'Professionals', 'Business Owners',
  'Startups', 'Developers', 'Customers', 'Custom'
];

const tones = [
  'Professional', 'Friendly', 'Creative', 'Bold', 'Casual', 
  'Luxury', 'Funny', 'Persuasive', 'Inspirational'
];

export default function GeneratePostModal({ isOpen, onClose, onGenerate, isManual = false, initialConfig = null }) {
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [selectedContentTypes, setSelectedContentTypes] = useState([]);
  const [customContentType, setCustomContentType] = useState('');
  const [postTopic, setPostTopic] = useState('');
  const [keyMessage, setKeyMessage] = useState('');
  const [selectedAudiences, setSelectedAudiences] = useState([]);
  const [customAudience, setCustomAudience] = useState('');
  const [selectedTones, setSelectedTones] = useState([]);
  const [referenceMedia, setReferenceMedia] = useState([]);
  const [aiEnhancements, setAiEnhancements] = useState({
    caption: true,
    hashtags: true,
    cta: true,
    imagePrompt: true,
    multipleVariations: true
  });
  const [contentLength, setContentLength] = useState('Medium');
  const [language, setLanguage] = useState('English');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedGenerateModes, setSelectedGenerateModes] = useState(['caption']);
  const [description, setDescription] = useState('');

  // Reset state when modal opens (apply initialConfig prefill if provided)
  useEffect(() => {
    if (isOpen) {
      setSelectedPlatforms(initialConfig?.platform || []);
      setSelectedContentTypes(initialConfig?.contentType || []);
      setCustomContentType('');
      setPostTopic(initialConfig?.postTopic || '');
      setKeyMessage(initialConfig?.keyMessage || '');
      setSelectedAudiences([]);
      setCustomAudience('');
      setSelectedTones([]);
      setReferenceMedia([]);
      setAiEnhancements({ caption: true, hashtags: true, cta: true, imagePrompt: true, multipleVariations: true });
      setContentLength('Medium');
      setLanguage('English');
      setIsGenerating(false);
      setSelectedGenerateModes(['caption']);
      setDescription('');
    }
  }, [isOpen]);

  const fileInputRef = useRef(null);

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    if (referenceMedia.length + files.length > 10) {
      toast.error('Maximum 10 files allowed');
      return;
    }
    setReferenceMedia([...referenceMedia, ...files]);
  };

  const togglePlatform = (pName) => {
    setSelectedPlatforms(prev => prev.includes(pName) ? prev.filter(p => p !== pName) : [...prev, pName]);
  };

  const toggleContentType = (type) => {
    setSelectedContentTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const toggleAudience = (aud) => {
    setSelectedAudiences(prev => prev.includes(aud) ? prev.filter(a => a !== aud) : [...prev, aud]);
  };

  const toggleGenerateMode = (mode) => {
    setSelectedGenerateModes(prev => prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]);
  };

  const removeMedia = (index) => {
    const updated = [...referenceMedia];
    updated.splice(index, 1);
    setReferenceMedia(updated);
  };

  const toggleTone = (tone) => {
    if (selectedTones.includes(tone)) {
      setSelectedTones(selectedTones.filter(t => t !== tone));
    } else {
      setSelectedTones([...selectedTones, tone]);
    }
  };

  const toggleEnhancement = (key) => {
    setAiEnhancements(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerate = async (modes) => {
    if (selectedPlatforms.length === 0) return toast.error('Please select at least one platform');
    if (!postTopic.trim()) return toast.error('Post Topic is required');
    if (isManual && !description.trim()) return toast.error('Description is required in manual mode');
    if (modes.length === 0) return toast.error('Please select at least one generation mode');
    
    let updatedContentTypes = [...selectedContentTypes];
    if (modes.includes('carousel')) {
      if (!updatedContentTypes.includes('Carousel')) updatedContentTypes.push('Carousel');
    } else if (modes.includes('image')) {
      if (!updatedContentTypes.includes('Image')) updatedContentTypes.push('Image');
    } else if (modes.includes('hashtag') && updatedContentTypes.length === 0) {
      updatedContentTypes.push('Hashtags');
    } else if (modes.includes('caption') && updatedContentTypes.length === 0) {
      updatedContentTypes.push('Caption');
    } else {
      if (updatedContentTypes.length === 0) return toast.error('Please select a content type');
      if (updatedContentTypes.includes('Custom') && !customContentType) return toast.error('Please specify the custom content type');
    }

    setIsGenerating(true);
    
    let updatedEnhancements = { ...aiEnhancements };
    
    if (modes.includes('image') || modes.includes('carousel')) {
      updatedEnhancements.imagePrompt = true;
    } else {
      updatedEnhancements.imagePrompt = false;
    }

    if (modes.includes('hashtag') || modes.includes('carousel')) {
      updatedEnhancements.hashtags = true;
    } else {
      updatedEnhancements.hashtags = false;
    }

    if (modes.includes('caption') || modes.includes('carousel')) {
      updatedEnhancements.caption = true;
      updatedEnhancements.cta = true;
    } else {
      updatedEnhancements.caption = false;
      updatedEnhancements.cta = false;
    }
    
    if (modes.includes('carousel')) {
       updatedEnhancements.multipleVariations = true;
    }

    const finalContentTypes = updatedContentTypes.map(t => t === 'Custom' ? customContentType : t).join(', ');
    const finalAudiences = selectedAudiences.map(a => a === 'Custom' ? customAudience : a).join(', ');

    const config = {
      platform: selectedPlatforms.join(', '),
      contentType: finalContentTypes,
      postTopic,
      keyMessage,
      audience: finalAudiences,
      tones: selectedTones,
      referenceMedia,
      aiEnhancements: updatedEnhancements,
      contentLength,
      language,
      description
    };

    try {
      if (onGenerate) {
        await onGenerate(config);
      }
    } catch (e) {
      console.error("Post generation failed:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={() => !isGenerating && onClose()} className="relative z-[200]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-8">
        <Dialog.Panel
          as={motion.div}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-6xl max-h-[90vh] bg-white dark:bg-[#151928] rounded-[32px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-white/10"
        >
          {/* Header */}
          <div className="px-6 py-5 sm:px-10 sm:py-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02]">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Generate Post with AI</h2>
              <p className="text-[10px] sm:text-xs font-black text-primary uppercase tracking-widest mt-1">Orchestrate Your Next Move</p>
            </div>
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-all disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
            {/* Left Column (Scrollable Form) */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-10 custom-scrollbar relative">
              {isGenerating && (
                <div className="absolute inset-0 z-10 bg-white/50 dark:bg-[#151928]/50 backdrop-blur-[2px] pointer-events-auto" />
              )}
              
              {/* SECTION 1 — Social Media Platform */}
              <section className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">1. Social Media Platform <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {platforms.map(p => {
                    const isSelected = selectedPlatforms.includes(p.name);
                    return (
                      <div
                        key={p.id}
                        onClick={() => togglePlatform(p.name)}
                        className={`relative p-4 rounded-2xl cursor-pointer transition-all duration-300 border flex flex-col items-center gap-3 text-center
                          ${isSelected 
                            ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(79,70,229,0.2)] dark:bg-primary/10' 
                            : 'border-slate-200 dark:border-white/10 hover:border-primary/40 hover:bg-slate-50 dark:hover:bg-white/5'
                          }`}
                      >
                        <p.icon className={`w-8 h-8 ${isSelected ? 'text-primary' : p.color}`} />
                        <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wide ${isSelected ? 'text-primary' : 'text-slate-600 dark:text-slate-300'}`}>
                          {p.name}
                        </span>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* SECTION 2 — Content Type */}
              <section className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">2. What do you want to generate? <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-3">
                  {contentTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => toggleContentType(type)}
                      className={`px-4 py-2.5 rounded-xl border text-[11px] font-bold uppercase tracking-wide transition-all ${
                        selectedContentTypes.includes(type)
                          ? 'border-primary bg-primary text-white shadow-lg shadow-primary/30'
                          : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-primary/40 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                {selectedContentTypes.includes('Custom') && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <input
                      type="text"
                      placeholder="E.g., Client Testimonial"
                      value={customContentType}
                      onChange={(e) => setCustomContentType(e.target.value)}
                      className="w-full h-12 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-semibold text-slate-800 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all mt-4"
                    />
                  </motion.div>
                )}
              </section>

              {/* SECTION 3 — Tell AI About Your Post */}
              <section className="space-y-6">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">3. Tell AI About Your Post</label>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Post Topic <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Example: AI CRM for startups"
                      value={postTopic}
                      onChange={(e) => setPostTopic(e.target.value)}
                      className="w-full h-12 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-semibold text-slate-800 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Key Message (Optional)</label>
                    <input
                      type="text"
                      placeholder="Example: Save time with automation and increase productivity."
                      value={keyMessage}
                      onChange={(e) => setKeyMessage(e.target.value)}
                      className="w-full h-12 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-semibold text-slate-800 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-inner"
                    />
                  </div>
                  {isManual && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Description / Custom Instructions <span className="text-red-500">*</span></label>
                      <textarea
                        placeholder="Describe exactly what you want to write in this post..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full min-h-[100px] max-h-[250px] bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-inner resize-y"
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* SECTION 4 & 9 — Audience & Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <section className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">4. Target Audience</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {targetAudiences.map(a => (
                      <button
                        key={a}
                        onClick={() => toggleAudience(a)}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wide transition-all flex items-center gap-1.5 ${
                          selectedAudiences.includes(a)
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
                        }`}
                      >
                        {selectedAudiences.includes(a) && <Check className="w-3 h-3" />}
                        {a}
                      </button>
                    ))}
                  </div>
                  {selectedAudiences.includes('Custom') && (
                    <motion.input
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      type="text" placeholder="E.g., Graphic Designers"
                      value={customAudience} onChange={(e) => setCustomAudience(e.target.value)}
                      className="w-full h-12 mt-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-semibold text-slate-800 dark:text-white focus:border-primary outline-none transition-all shadow-inner"
                    />
                  )}
                </section>

                <section className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">5. Language</label>
                  <div className="relative">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full h-12 appearance-none bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                    >
                      {['English', 'Hindi', 'Hinglish'].map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </section>
              </div>

              {/* SECTION 5 — Tone of Voice */}
              <section className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">6. Tone of Voice</label>
                <div className="flex flex-wrap gap-2">
                  {tones.map(t => (
                    <button
                      key={t}
                      onClick={() => toggleTone(t)}
                      className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wide transition-all flex items-center gap-1.5 ${
                        selectedTones.includes(t)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      {selectedTones.includes(t) && <Check className="w-3 h-3" />}
                      {t}
                    </button>
                  ))}
                </div>
              </section>

              {/* SECTION 6 — Reference Media */}
              <section className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex justify-between">
                  <span>7. Reference Media (Optional)</span>
                  <span className="text-slate-400">{referenceMedia.length}/10</span>
                </label>
                <div 
                  className="border-2 border-dashed border-slate-200 dark:border-white/20 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-white/[0.01] hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all cursor-pointer relative group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="mt-4 text-sm font-bold text-slate-600 dark:text-slate-300">Drag & Drop or Click to Upload</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Images & Videos (Max 10)</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleMediaUpload}
                  />
                </div>
                
                {/* File Preview */}
                {referenceMedia.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                    {referenceMedia.map((file, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 group bg-slate-100">
                        {file.type.startsWith('image/') ? (
                          <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                            <Video className="w-8 h-8 text-white/50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                          <button onClick={(e) => { e.stopPropagation(); removeMedia(idx); }} className="self-end p-1.5 bg-red-500/80 rounded-lg text-white hover:bg-red-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="text-white text-[9px] font-bold truncate p-1 bg-black/40 rounded">
                            {file.name}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* SECTION 7 & 8 — Enhancements & Length */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <section className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">8. AI Enhancements</label>
                  <div className="space-y-2">
                    {Object.entries({
                      caption: 'Generate Caption',
                      hashtags: 'Generate Hashtags',
                      cta: 'Generate CTA',
                      imagePrompt: 'Generate Image Prompt',
                      multipleVariations: 'Generate Multiple Variations'
                    }).map(([key, label]) => (
                      <div 
                        key={key} 
                        onClick={() => toggleEnhancement(key)}
                        className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${
                          aiEnhancements[key] 
                            ? 'border-primary/30 bg-primary/5 dark:bg-primary/10 text-primary' 
                            : 'border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
                        }`}
                      >
                        <span className="text-[11px] font-bold uppercase tracking-wide">{label}</span>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${aiEnhancements[key] ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-white/10'}`}>
                          {aiEnhancements[key] && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">9. Content Length</label>
                  <div className="space-y-2">
                    {['Short', 'Medium', 'Long'].map(len => (
                      <div
                        key={len}
                        onClick={() => setContentLength(len)}
                        className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                          contentLength === len 
                            ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm' 
                            : 'border-slate-200 dark:border-white/10 hover:border-primary/40 hover:bg-slate-50 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${contentLength === len ? 'border-primary' : 'border-slate-300 dark:border-white/30'}`}>
                          {contentLength === len && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-wide ${contentLength === len ? 'text-primary' : 'text-slate-600 dark:text-slate-300'}`}>
                          {len}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* SECTION 10 — What do you want to generate? */}
              <section className="space-y-4 pt-6 border-t border-slate-100 dark:border-white/5">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">10. What do you want to generate? <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'caption', name: 'Caption', icon: FileText, desc: 'Generate post copy' },
                    { id: 'hashtag', name: 'Hashtag', icon: Hash, desc: 'Generate trending tags' },
                    { id: 'carousel', name: 'Carousel', icon: Layers, desc: 'Multi-slide sequence' },
                    { id: 'image', name: 'Image', icon: ImageIcon, desc: 'AI visual prompt' }
                  ].map(item => {
                    const isSelected = selectedGenerateModes.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleGenerateMode(item.id)}
                        className={`relative p-4 rounded-2xl cursor-pointer transition-all duration-300 border flex flex-col items-center gap-2 text-center
                          ${isSelected 
                            ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(79,70,229,0.2)] dark:bg-primary/10' 
                            : 'border-slate-200 dark:border-white/10 hover:border-primary/40 hover:bg-slate-50 dark:hover:bg-white/5'
                          }`}
                      >
                        <item.icon className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-slate-500'}`} />
                        <span className={`text-xs font-bold uppercase tracking-wide ${isSelected ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>
                          {item.name}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">
                          {item.desc}
                        </span>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

            </div>

            {/* Right Column (Live Preview - Desktop Only) */}
            <div className="hidden lg:flex w-[380px] bg-slate-50 dark:bg-white/[0.02] border-l border-slate-100 dark:border-white/5 flex-col sticky top-0 h-full overflow-hidden">
              <div className="px-8 pt-8 pb-4 shrink-0">
                <h3 className="text-sm font-black uppercase tracking-[3px] text-slate-400">Live Preview</h3>
              </div>
              <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-6 custom-scrollbar">
                
                {/* Preview Cards */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#151928] shadow-sm border border-slate-100 dark:border-white/5 space-y-4">
                  
                  {/* Platform */}
                  <div className="border-b border-slate-50 dark:border-white/5 pb-3 space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Platform</div>
                    {selectedPlatforms.length === 0 ? (
                      <div className="text-xs font-bold text-slate-400">Not Selected</div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedPlatforms.map(pName => {
                          const p = platforms.find(pl => pl.name === pName);
                          return (
                            <span key={pName} className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/5 border border-primary/20 text-[10px] font-bold text-primary`}>
                              {p?.icon && <p.icon className="w-3 h-3" />}
                              {pName}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Type */}
                  <div className="space-y-1.5">
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Type</div>
                    {selectedContentTypes.length === 0 ? (
                      <div className="text-xs font-bold text-slate-400">Not Selected</div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedContentTypes.map(t => (
                          <span key={t} className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/5 text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                            {t === 'Custom' ? (customContentType || 'Custom Type') : t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Audience */}
                  <div className="space-y-1.5">
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Audience</div>
                    {selectedAudiences.length === 0 ? (
                      <div className="text-xs font-bold text-slate-400">Any</div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedAudiences.map(a => (
                          <span key={a} className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/5 text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                            {a === 'Custom' ? (customAudience || 'Custom Audience') : a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Language & Length */}
                  <div className="space-y-1">
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Language & Length</div>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 rounded bg-slate-100 dark:bg-white/5 text-[10px] font-bold">{language}</span>
                      <span className="px-2 py-1 rounded bg-slate-100 dark:bg-white/5 text-[10px] font-bold">{contentLength}</span>
                    </div>
                  </div>

                  {selectedTones.length > 0 && (
                    <div className="space-y-1.5 border-t border-slate-50 dark:border-white/5 pt-3">
                      <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Tone</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedTones.map(t => (
                          <span key={t} className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 text-slate-500">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedGenerateModes.length > 0 && (
                    <div className="space-y-1.5 border-t border-slate-50 dark:border-white/5 pt-3">
                      <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Generate</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedGenerateModes.map(m => (
                          <span key={m} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary capitalize">{m}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {referenceMedia.length > 0 && (
                    <div className="space-y-1 border-t border-slate-50 dark:border-white/5 pt-3">
                      <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Media attached</div>
                      <div className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                        <ImageIcon className="w-3.5 h-3.5" />
                        {referenceMedia.length} File(s)
                      </div>
                    </div>
                  )}

                </div>

                {/* Validation Info */}
                {(selectedPlatforms.length === 0 || selectedContentTypes.length === 0 || !postTopic || (isManual && !description)) && (
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-500 text-xs font-bold flex flex-col gap-1">
                    {selectedPlatforms.length === 0 && <span>• Select a Platform</span>}
                    {selectedContentTypes.length === 0 && <span>• Select a Content Type</span>}
                    {!postTopic && <span>• Enter a Post Topic</span>}
                    {isManual && !description && <span>• Enter a Description</span>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 sm:px-10 sm:py-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#1E2438] flex justify-between items-center shrink-0">
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleGenerate(selectedGenerateModes)}
              disabled={isGenerating || selectedPlatforms.length === 0 || !postTopic || (isManual && !description)}
              className="px-8 py-3.5 rounded-xl font-black uppercase tracking-[2px] text-xs bg-primary text-white shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate With AI
                </>
              )}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
