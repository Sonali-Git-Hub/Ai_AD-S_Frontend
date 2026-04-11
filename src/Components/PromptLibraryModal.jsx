import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Sparkles, Wand2, Star, Clock, Image as ImageIcon, Camera, Palette, Zap, Globe, Heart, ChevronRight, TrendingUp, Shield, Rocket, Flame, Layout, Brain } from 'lucide-react';

const CATEGORIES = [
    { id: 'All', icon: Globe },
    { id: 'Trending', icon: Flame },
    { id: 'Fantasy', icon: Sparkles },
    { id: 'Realistic', icon: Camera },
    { id: 'Art', icon: Palette },
    { id: 'Photography', icon: Camera },
    { id: 'Anime', icon: Zap },
    { id: 'Logo', icon: ImageIcon },
    { id: 'Social Media', icon: Rocket },
    { id: 'Product', icon: Shield },
];

// Procedural Engine Data
const DATA = {
    Art: {
        styles: ["Cyberpunk", "Surrealism", "Vaporwave", "Steampunk", "Pop Art", "Impressionist", "Gothic", "Minimalist", "Doodle", "Oil Painting"],
        subjects: ["Robot Soldier", "Cosmic Whale", "Lost City", "Neon Samurai", "Flying Castle", "Abstract Soul", "Mechanical Heart", "Cyber Cityscape"],
    },
    Photography: {
        styles: ["Macro Photography", "Portrait", "Wide-Angle Landscape", "Street Photography", "Black and White", "National Geographic Style", "Golden Hour"],
        subjects: ["Mountain Peak", "Rainy Streets", "Ancient Temple", "Polar Bear", "Volcanic Eruption", "Modern Skyscraper", "Elderly Person Facials"],
    },
    Anime: {
        styles: ["Studio Ghibli style", "Makoto Shinkai style", "90s Retro Anime", "Cyberpunk Edgerunners style", "Modern Shonen", "Chibi", "Sketch Style"],
        subjects: ["School Girl with Magic", "Mecha Battle", "Spirit Forest", "Magical Girl Transformation", "Dragon Rider", "Futuristic Tokyo"],
    },
    Logo: {
        styles: ["Minimal Vector", "3D Gradient", "Line Art", "Mascot", "Lettermark", "Modern Emblem", "Branding style", "Flat Design"],
        subjects: ["Eagle", "Tech Company", "Coffee Shop", "Geometric Shape", "Infinity Symbol", "Lion Head", "Abstract Rocket"],
    },
    Fantasy: {
        styles: ["Epic Fantasy", "Dark Fantasy", "Mystical", "D&D Style", "Lord of the Rings style", "Celestial", "Enchanted"],
        subjects: ["Dragon Horde", "Elven Archer", "Undead King", "Magic Spellbook", "Hidden Cave of Jewels", "Giant Spider", "Wizard's Tower"],
    },
    Realistic: {
        styles: ["Hyperrealistic", "Photorealistic", "8K Resolution", "Masterpiece", "Unreal Engine 5", "Octane Render"],
        subjects: ["Human Eye Close-up", "Water Drop", "Luxury Sports Car", "Space Shuttle Launch", "Diamond Ring", "Historical Soldier"],
    },
    "Social Media": {
        styles: ["Instagram aesthetic", "Influencer style", "Cinematic Vlog", "Flatlay", "Bright and Airy", "Moody Teal/Orange"],
        subjects: ["Morning Coffee", "Travel Outfit", "Beach Sunset", "Aesthetic Room", "Gaming Setup", "Gourmet Food", "Luxury Resort"],
    },
    Product: {
        styles: ["Commercial Photography", "Studio Lighting", "Clean Minimalist", "Floating product", "High speed splash", "Clean Background"],
        subjects: ["Smartphone", "Sneaker", "Watch", "Cosmetic Bottle", "Headphones", "Dyson Vacuum", "Coffee Machine"],
    }
};

const LIGHTING = ["Cinematic Lighting", "Volumetric Fog", "Neon Glow", "Soft Ambient", "Dramatic Shadows", "Golden Hour Glow", "Harsh Sunlight", "Underworld Blue"];
const QUALITY = ["masterpiece", "ultra-detailed", "infinite resolution", "sharp focus", "highly intricate", "best quality", "hyper-detailed"];

// Generate massive amount of prompts
const generateAllPrompts = () => {
    let result = [];
    let id = 1;

    // Base prompts for consistency
    const basePrompts = [
        { id: id++, title: "Cyberpunk Metropolis", prompt: "Cyberpunk city at night, neon lights, futuristic environment, ultra detailed, rainy streets, cinematic.", category: "Realistic" },
        { id: id++, title: "Anime Spirit Forest", prompt: "Studio Ghibli inspired forest, glowing spirits, soft lighting, magical atmosphere, vibrant greens.", category: "Anime" },
    ];
    result.push(...basePrompts);

    // Expand categories
    Object.keys(DATA).forEach(cat => {
        const catData = DATA[cat];
        for (let i = 0; i < 500; i++) {
            const style = catData.styles[Math.floor(Math.random() * catData.styles.length)];
            const subject = catData.subjects[Math.floor(Math.random() * catData.subjects.length)];
            const light = LIGHTING[Math.floor(Math.random() * LIGHTING.length)];
            const quality = QUALITY[Math.floor(Math.random() * QUALITY.length)];
            
            result.push({
                id: id++,
                title: `${style} ${subject}`,
                prompt: `${style} of ${subject}, ${light}, ${quality}, 8k, professional work.`,
                category: cat
            });
        }
    });

    return result;
};

const PromptLibraryModal = ({ isOpen, onClose, onSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [page, setPage] = useState(1);
    const scrollRef = useRef(null);

    const [allPrompts] = useState(() => generateAllPrompts());
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem('aisa_fav_v2');
        return saved ? JSON.parse(saved) : [];
    });
    const [recent, setRecent] = useState(() => {
        const saved = localStorage.getItem('aisa_recent_v2');
        return saved ? JSON.parse(saved) : [];
    });

    const itemsPerPage = 20;

    const toggleFavorite = (id) => {
        const newFavs = favorites.includes(id) ? favorites.filter(fid => fid !== id) : [...favorites, id];
        setFavorites(newFavs);
        localStorage.setItem('aisa_fav_v2', JSON.stringify(newFavs));
    };

    const handleSelect = (prompt, id) => {
        const newRecent = [id, ...recent.filter(rid => rid !== id)].slice(0, 10);
        setRecent(newRecent);
        localStorage.setItem('aisa_recent_v2', JSON.stringify(newRecent));
        onSelect(prompt);
    };

    const filteredPrompts = useMemo(() => {
        setPage(1); // Reset page on filter
        return allPrompts.filter(p => {
            if (activeCategory === 'Trending') return recent.includes(p.id) || favorites.slice(0, 5).includes(p.id) || p.id % 50 === 0;
            const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 p.prompt.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeCategory, recent, favorites]);

    const displayedPrompts = useMemo(() => {
        return filteredPrompts.slice(0, page * itemsPerPage);
    }, [filteredPrompts, page]);

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 100) {
            if (displayedPrompts.length < filteredPrompts.length) {
                setPage(p => p + 1);
            }
        }
    };

    const handleSurprise = () => {
        const random = allPrompts[Math.floor(Math.random() * allPrompts.length)];
        handleSelect(random.prompt, random.id);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-[12px]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 30 }}
                    className="relative w-full max-w-4xl h-[90vh] sm:h-[85vh] bg-white/70 rounded-[30px] sm:rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden border border-white/40 flex flex-col"
                >
                    {/* Header Section */}
                    <div className="p-5 sm:p-8 bg-white/40 border-b border-black/[0.05] relative space-y-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 shadow-xl shadow-primary/20">
                                    <img src="/logo/Logo.svg" alt="AISA" className="w-6 h-6 object-contain brightness-0 invert" />
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5 flex items-center gap-2">
                                        Dynamic Prompt Library
                                        <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] uppercase font-black tracking-widest border border-primary/20">5000+ Items</div>
                                    </h2>
                                    <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] opacity-70">Procedurally Generated AI Masterpieces</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={handleSurprise}
                                    className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 text-orange-600 text-xs font-black uppercase tracking-widest border border-orange-500/20 hover:bg-orange-500 hover:text-white transition-all shadow-sm"
                                >
                                    <Wand2 size={14} />
                                    Surprise Me
                                </button>
                                <button onClick={onClose} className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Search and Categories */}
                        <div className="space-y-4">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                <input 
                                    type="text"
                                    placeholder="Search styles, subjects, or keywords..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white/80 border-2 border-transparent focus:border-primary/20 rounded-[22px] text-sm font-bold placeholder:text-slate-400 focus:outline-none transition-all shadow-sm"
                                />
                            </div>

                            <div className="flex items-center gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide custom-scrollbar">
                                {CATEGORIES.map((cat) => {
                                    const Icon = cat.icon;
                                    const isActive = activeCategory === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => setActiveCategory(cat.id)}
                                            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap border ${
                                                isActive 
                                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25' 
                                                : 'bg-white/50 text-slate-600 border-white/80 hover:bg-white/80'
                                            }`}
                                        >
                                            <Icon size={14} className={isActive ? 'animate-bounce' : ''} />
                                            {cat.id}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Content Section (Infinite Scroll) */}
                    <div 
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-4 bg-slate-50/20 custom-scrollbar"
                    >
                        {displayedPrompts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                                {displayedPrompts.map((p, idx) => (
                                    <motion.div
                                        key={`${p.id}-${idx}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: (idx % 20) * 0.02 }}
                                        className="group relative bg-white/70 hover:bg-white rounded-[24px] p-5 sm:p-6 border border-white/80 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col min-h-[180px]"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2.5 py-1 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest rounded-lg border border-primary/5">
                                                    {p.category}
                                                </span>
                                                {recent.includes(p.id) && (
                                                    <span className="px-2.5 py-1 bg-green-500/10 text-green-600 text-[8px] font-black uppercase tracking-widest rounded-lg">Recently Used</span>
                                                )}
                                            </div>
                                            <button 
                                                onClick={() => toggleFavorite(p.id)}
                                                className={`p-2 rounded-xl transition-all ${favorites.includes(p.id) ? 'bg-red-50 text-red-500 scale-110 shadow-sm' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}
                                            >
                                                <Heart size={16} fill={favorites.includes(p.id) ? "currentColor" : "none"} />
                                            </button>
                                        </div>
                                        
                                        <h4 className="font-extrabold text-slate-800 text-[15px] mb-2 leading-tight group-hover:text-primary transition-colors">{p.title}</h4>
                                        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mb-5 line-clamp-3 opacity-80 group-hover:opacity-100">
                                            {p.prompt}
                                        </p>
                                        
                                        <div className="mt-auto">
                                            <button 
                                                onClick={() => handleSelect(p.prompt, p.id)}
                                                className="w-full py-3 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-primary hover:scale-[1.02] active:scale-95 transition-all shadow-md group-hover:shadow-primary/20"
                                            >
                                                Use Prompt
                                                <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full py-20 opacity-30 text-center">
                                <Search size={64} className="text-slate-400 mb-6" />
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">No matching prompts</h3>
                                <p className="text-xs font-bold text-slate-500 mt-1">Try broadening your search or choosing "All"</p>
                            </div>
                        )}
                        
                        {displayedPrompts.length < filteredPrompts.length && (
                            <div className="flex justify-center py-8">
                                <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/40 border border-white/60 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    Scanning more masterpieces...
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PromptLibraryModal;
