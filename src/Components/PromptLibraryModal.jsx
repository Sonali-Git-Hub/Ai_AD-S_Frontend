import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Sparkles, Wand2, Star, Clock, Image as ImageIcon, Camera, Palette, Zap, Globe, Heart, ChevronRight, TrendingUp, Shield, Rocket, Flame, Layout, Play, Eye } from 'lucide-react';

const CATEGORIES = [
    { id: 'All', icon: Globe },
    { id: 'Viral Feed', icon: Flame },
    { id: 'Social Media', icon: Rocket },
    { id: 'Aesthetic', icon: Palette },
    { id: 'Photography', icon: Camera },
    { id: 'Anime', icon: Zap },
    { id: 'Fantasy', icon: Sparkles },
    { id: 'Product', icon: Shield },
    { id: 'Logo', icon: ImageIcon },
];

// Viral-Only Social Media Trends
const VIRAL_TEMPLATES = [
    { title: "AI Influencer Portrait", template: "AI influencer girl, ultra realistic skin, soft cinematic lighting, luxury aesthetic, Instagram style, 8K, highly detailed face.", cat: "Social Media" },
    { title: "Viral Reels Cyberpunk", template: "Cyberpunk street, neon glow, rainy night, cinematic lighting, ultra detailed, viral reel style, 4k.", cat: "Viral Feed" },
    { title: "Aesthetic Room Tour", template: "Cozy aesthetic room, LED lighting, lofi vibes, warm ambient light, interior design, Pinterest style, masterpiece.", cat: "Aesthetic" },
    { title: "Studio Ghibli Realism", template: "Studio Ghibli style landscape but hyper-realistic, lush greens, magical lighting, floating islands, anime movie vibe.", cat: "Viral Feed" },
    { title: "Minimal Luxury Watch", template: "Luxury watch photography, studio lighting, minimal background, high-end commercial style, clean and sharp, 8k.", cat: "Product" },
    { title: "3D Cartoon Avatar", template: "3D character avatar, Disney Pixar style, soft subsurface scattering, vibrant colors, trending social media profile picture.", cat: "Aesthetic" },
    { title: "Viral AI Fashion Shoot", template: "High fashion editorial shoot, avant-garde style, dramatic lighting, futuristic clothing, vogue magazine aesthetic, 8k.", cat: "Social Media" },
    { title: "Dark Aesthetic Edit", template: "Moody dark aesthetic, shadows and highlights, mystery vibe, urban explorer style, cinematic noir, high contrast.", cat: "Aesthetic" }
];

const DATA = {
    Art: {
        styles: ["Cyberpunk", "Surrealism", "Vaporwave", "Steampunk", "Pop Art", "Impressionist", "Gothic", "Minimalist", "Oil Painting"],
        subjects: ["Robot Soldier", "Cosmic Whale", "Lost City", "Neon Samurai", "Flying Castle", "Abstract Soul", "Mechanical Heart"],
    },
    Photography: {
        styles: ["Macro Photography", "Portrait", "Wide-Angle Landscape", "Street Photography", "Black and White", "National Geographic Style"],
        subjects: ["Mountain Peak", "Rainy Streets", "Ancient Temple", "Polar Bear", "Volcanic Eruption", "Modern Skyscraper"],
    },
    Anime: {
        styles: ["Studio Ghibli style", "Makoto Shinkai style", "90s Retro Anime", "Cyberpunk Edgerunners style", "Chibi", "Sketch Style"],
        subjects: ["School Girl with Magic", "Mecha Battle", "Spirit Forest", "Magical Girl Transformation", "Dragon Rider"],
    },
    Fantasy: {
        styles: ["Epic Fantasy", "Dark Fantasy", "Mystical", "D&D Style", "Lord of the Rings style", "Enchanted"],
        subjects: ["Dragon Horde", "Elven Archer", "Undead King", "Magic Spellbook", "Wizard's Tower"],
    },
    Product: {
        styles: ["Commercial Photography", "Studio Lighting", "Clean Minimalist", "Floating product", "High speed splash"],
        subjects: ["Smartphone", "Sneaker", "Watch", "Cosmetic Bottle", "Headphones"],
    }
};

const LIGHTING = ["Cinematic Lighting", "Neon Glow", "Soft Ambient", "Dramatic Shadows", "Golden Hour Glow", "Harsh Sunlight"];
const QUALITY = ["masterpiece", "ultra-detailed", "infinite resolution", "sharp focus", "highly intricate", "best quality"];

// Generate massive amount of prompts with viral logic
const generateAllPrompts = () => {
    let result = [];
    let id = 1;

    // Insert Viral templates first
    VIRAL_TEMPLATES.forEach(v => {
        result.push({
            id: id++,
            title: v.title,
            prompt: v.template,
            category: v.cat,
            isViral: true,
            isTrending: Math.random() > 0.5,
            engagement: Math.floor(Math.random() * 50000) + 10000
        });
    });

    // Expand thousands of prompts
    const cats = Object.keys(DATA);
    for (let i = 0; i < 5000; i++) {
        const cat = cats[i % cats.length];
        const catData = DATA[cat];
        const style = catData.styles[Math.floor(Math.random() * catData.styles.length)];
        const subject = catData.subjects[Math.floor(Math.random() * catData.subjects.length)];
        const light = LIGHTING[Math.floor(Math.random() * LIGHTING.length)];
        const quality = QUALITY[Math.floor(Math.random() * QUALITY.length)];
        
        result.push({
            id: id++,
            title: `${style} ${subject}`,
            prompt: `${style} of ${subject}, ${light}, ${quality}, 8k, viral aesthetic.`,
            category: cat,
            isTrending: Math.random() > 0.95,
            isViral: Math.random() > 0.98,
            engagement: Math.floor(Math.random() * 20000)
        });
    }

    return result;
};

const PromptLibraryModal = ({ isOpen, onClose, onSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [page, setPage] = useState(1);
    
    const [allPrompts] = useState(() => generateAllPrompts());
    const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('aisa_fav_v3') || '[]'));
    const [recent, setRecent] = useState(() => JSON.parse(localStorage.getItem('aisa_recent_v3') || '[]'));
    const [stats, setStats] = useState(() => JSON.parse(localStorage.getItem('aisa_stats_v3') || '{}'));

    const itemsPerPage = 20;

    const toggleFavorite = (id) => {
        const newFavs = favorites.includes(id) ? favorites.filter(fid => fid !== id) : [...favorites, id];
        setFavorites(newFavs);
        localStorage.setItem('aisa_fav_v3', JSON.stringify(newFavs));
    };

    const handleSelect = (prompt, id, category) => {
        // Track stats for "Recommended"
        const newStats = { ...stats, [category]: (stats[category] || 0) + 1 };
        setStats(newStats);
        localStorage.setItem('aisa_stats_v3', JSON.stringify(newStats));

        const newRecent = [id, ...recent.filter(rid => rid !== id)].slice(0, 10);
        setRecent(newRecent);
        localStorage.setItem('aisa_recent_v3', JSON.stringify(newRecent));
        onSelect(prompt);
    };

    const recommendedCategory = useMemo(() => {
        const sorted = Object.entries(stats).sort((a, b) => b[1] - a[1]);
        return sorted.length > 0 ? sorted[0][0] : null;
    }, [stats]);

    const filteredPrompts = useMemo(() => {
        setPage(1);
        return allPrompts.filter(p => {
            if (activeCategory === 'Viral Feed') return p.isViral || p.isTrending;
            const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 p.prompt.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
            return matchesSearch && matchesCategory;
        }).sort((a, b) => {
            // Priority: Recommended category -> Viral -> Engagement
            if (activeCategory === 'All') {
                if (a.category === recommendedCategory && b.category !== recommendedCategory) return -1;
                if (b.category === recommendedCategory && a.category !== recommendedCategory) return 1;
            }
            if (a.isViral && !b.isViral) return -1;
            return b.engagement - a.engagement;
        });
    }, [searchQuery, activeCategory, recommendedCategory, allPrompts]);

    const displayedPrompts = useMemo(() => filteredPrompts.slice(0, page * itemsPerPage), [filteredPrompts, page]);

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 100) {
            if (displayedPrompts.length < filteredPrompts.length) setPage(p => p + 1);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1100] flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-[15px]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 50 }}
                    className="relative w-full max-w-5xl h-[92vh] sm:h-[88vh] bg-white/5 rounded-[40px] shadow-[0_60px_120px_-30px_rgba(0,0,0,1)] overflow-hidden border border-white/10 flex flex-col backdrop-blur-3xl"
                >
                    {/* Glassy Header */}
                    <div className="p-6 sm:p-10 bg-white/[0.03] border-b border-white/[0.05] relative space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-[0_10px_30px_-5px_rgba(139,92,246,0.4)]">
                                    <Flame className="w-7 h-7 text-white animate-pulse" />
                                </div>
                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-[1000] text-white tracking-tight leading-none mb-2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                                        Viral Prompt Feed
                                    </h2>
                                    <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em]">Trending Now • Real-time Alpha</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleSelect(allPrompts[Math.floor(Math.random()*100)].prompt, 0)}
                                    className="px-5 py-2.5 rounded-2xl bg-white/[0.08] text-white text-[11px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-all flex items-center gap-2"
                                >
                                    <Sparkles size={16} className="text-yellow-400" />
                                    Surprise Me
                                </motion.button>
                                <button onClick={onClose} className="p-2.5 rounded-full bg-white/10 text-white/60 hover:text-white transition-all">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Search & Categories */}
                        <div className="space-y-5">
                            <div className="relative">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                                <input 
                                    type="text"
                                    placeholder="Search trending styles, viral effects, or artists..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-14 pr-6 py-5 bg-white/[0.05] border border-white/[0.1] rounded-[26px] text-white font-bold placeholder:text-white/20 focus:outline-none focus:bg-white/[0.08] focus:border-white/20 transition-all"
                                />
                            </div>

                            <div className="flex items-center gap-2.5 overflow-x-auto pb-3 scrollbar-hide px-1">
                                {CATEGORIES.map((cat) => {
                                    const Icon = cat.icon;
                                    const isActive = activeCategory === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => setActiveCategory(cat.id)}
                                            className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[11px] font-[900] uppercase tracking-wider transition-all whitespace-nowrap border-2 ${
                                                isActive 
                                                ? 'bg-white text-black border-white shadow-[0_10px_30px_rgba(255,255,255,0.2)]' 
                                                : 'bg-white/5 text-white/60 border-white/[0.1] hover:bg-white/10 hover:text-white'
                                            }`}
                                        >
                                            <Icon size={16} />
                                            {cat.id}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Feed Section */}
                    <div 
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 bg-transparent custom-scrollbar"
                    >
                        {displayedPrompts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                {displayedPrompts.map((p, idx) => (
                                    <motion.div
                                        key={`${p.id}-${idx}`}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: (idx % 20) * 0.03 }}
                                        className="group relative flex flex-col bg-white/[0.03] hover:bg-white/[0.06] rounded-[32px] p-7 border border-white/[0.05] transition-all duration-500 overflow-hidden"
                                    >
                                        {/* Dynamic Badges */}
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex flex-wrap gap-2">
                                                {p.isViral && (
                                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-[9px] font-black uppercase text-white shadow-lg">
                                                        <Sparkles size={10} />
                                                        Viral
                                                    </div>
                                                )}
                                                {p.isTrending && (
                                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-[9px] font-black uppercase text-white shadow-lg">
                                                        <Flame size={10} />
                                                        Trending Now
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[9px] font-black uppercase text-white/60 border border-white/10">
                                                    <Eye size={10} />
                                                    {(p.engagement / 1000).toFixed(1)}K
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => toggleFavorite(p.id)}
                                                className={`p-2.5 rounded-2xl transition-all ${favorites.includes(p.id) ? 'bg-rose-500 text-white shadow-[0_5px_15px_rgba(244,63,94,0.4)]' : 'bg-white/5 text-white/30 hover:text-white'}`}
                                            >
                                                <Heart size={18} fill={favorites.includes(p.id) ? "currentColor" : "none"} />
                                            </button>
                                        </div>

                                        <div className="mb-4">
                                            <h4 className="text-[17px] font-black text-white mb-2 leading-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/40 group-hover:bg-clip-text transition-all">{p.title}</h4>
                                            <div className="w-10 h-1 rounded-full bg-white/10 group-hover:w-20 group-hover:bg-primary transition-all duration-500" />
                                        </div>

                                        <p className="text-[12px] text-white/50 font-medium leading-relaxed mb-8 line-clamp-3 group-hover:text-white/80 transition-all font-mono">
                                            {p.prompt}
                                        </p>

                                        <div className="mt-auto space-y-3">
                                            <button 
                                                onClick={() => handleSelect(p.prompt, p.id, p.category)}
                                                className="w-full py-4 rounded-2xl bg-white text-black text-[11px] font-[1000] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-primary transition-all shadow-[0_10px_30px_-10px_rgba(255,255,255,0.4)] group-active:scale-95"
                                            >
                                                <Play size={14} className="fill-current" />
                                                Quick Use
                                            </button>
                                            
                                            {p.category === recommendedCategory && idx < 5 && (
                                                <p className="text-[9px] text-primary font-black uppercase tracking-widest text-center animate-pulse">✨ Best Match for You</p>
                                            )}
                                        </div>

                                        {/* Card Ambient Glow */}
                                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-all duration-700" />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full py-40 opacity-20">
                                <Layout size={80} className="text-white mb-8" />
                                <h3 className="text-xl font-black text-white uppercase tracking-widest">No Viral Hits Found</h3>
                            </div>
                        )}
                        
                        {displayedPrompts.length < filteredPrompts.length && (
                            <div className="flex justify-center py-12">
                                <motion.div 
                                    animate={{ scale: [1, 1.1, 1] }} 
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="flex items-center gap-4 px-8 py-4 rounded-full bg-white/5 border border-white/10 text-[11px] font-black text-white/40 uppercase tracking-[0.3em]"
                                >
                                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    Fetching next viral trend...
                                </motion.div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PromptLibraryModal;
