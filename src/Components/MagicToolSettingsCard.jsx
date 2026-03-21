import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layout, Monitor, Smartphone, Check, Zap, DollarSign, Settings2 } from 'lucide-react';

const MagicToolSettingsCard = ({ 
    isOpen, 
    onClose, 
    toolType, 
    config, 
    onChange, 
    pricing 
}) => {
    if (!isOpen) return null;

    const toolPricing = pricing[toolType] || { models: [] };
    
    const aspectRatios = toolType === 'video' ? [
        { id: '16:9', label: '16:9 Landscape', icon: Monitor },
        { id: '9:16', label: '9:16 Portrait', icon: Smartphone },
        { id: '1:1', label: '1:1 Square', icon: Layout },
    ] : [
        { id: '1:1', label: '1:1 Square', icon: Layout },
        { id: '16:9', label: '16:9 Wide', icon: Monitor },
        { id: '9:16', label: '9:16 Portrait', icon: Smartphone },
        { id: '4:5', label: '4:5 Post', icon: Layout },
    ];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md overflow-hidden rounded-3xl shadow-2xl border border-white/10"
                style={{ background: 'linear-gradient(135deg, rgba(20,20,35,0.97) 0%, rgba(15,15,28,0.98) 100%)', backdropFilter: 'blur(40px)' }}
            >
                {/* ── Header ── */}
                <div className="relative px-6 pt-6 pb-4">
                    <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(ellipse at top, rgba(99,102,241,0.4) 0%, transparent 70%)' }} />
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <Settings2 className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white leading-none">
                                    {toolType === 'image' ? 'Image' : 'Video'} Settings
                                </h3>
                                <p className="text-[10px] text-indigo-400 font-semibold mt-0.5">
                                    {toolType === 'image' ? 'Imagen 4.0 · Hyper-realistic · Ultra HD' : 'Veo 3.1 · Fast Motion · 4K Ready'}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-7 h-7 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all border border-white/10">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                <div className="px-6 pb-6 space-y-6">
                    {/* Aspect Ratio Section */}
                    {config.aspectRatio !== undefined && (
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Aspect Ratio</p>
                            <div className="grid grid-cols-2 gap-2.5">
                                {aspectRatios.map((ar) => (
                                    <button
                                        key={ar.id}
                                        onClick={() => onChange('aspectRatio', ar.id)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all group ${
                                            config.aspectRatio === ar.id
                                            ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/8 hover:text-white'
                                        }`}
                                    >
                                        <ar.icon size={16} className={config.aspectRatio === ar.id ? 'text-indigo-400' : 'text-white/30 group-hover:text-white/50'} />
                                        <span className="text-xs font-semibold">{ar.label}</span>
                                        {config.aspectRatio === ar.id && <Check size={14} className="ml-auto text-indigo-400" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Resolution Section (for Video) */}
                    {config.resolution !== undefined && (
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Resolution</p>
                            <div className="flex gap-2.5">
                                {['1080p', '4k'].map((res) => (
                                    <button
                                        key={res}
                                        onClick={() => onChange('resolution', res)}
                                        className={`flex-1 flex items-center justify-center py-3 rounded-2xl border font-bold text-xs transition-all ${
                                            config.resolution === res
                                            ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/8 hover:text-white'
                                        }`}
                                    >
                                        {res.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Model Section */}
                    {config.modelId !== undefined && (
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">AI Engine</p>
                            <div className="space-y-2">
                                {toolPricing.models.map((model) => (
                                    <button
                                        key={model.id}
                                        onClick={() => onChange('modelId', model.id)}
                                        className={`w-full p-4 rounded-2xl border transition-all text-left relative group ${
                                            config.modelId === model.id
                                            ? 'bg-indigo-600/20 border-indigo-500/50'
                                            : 'bg-white/5 border-white/10 hover:bg-white/8'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-[13px] font-bold ${config.modelId === model.id ? 'text-indigo-300' : 'text-white'}`}>
                                                {model.name}
                                            </span>
                                            {config.modelId === model.id && <Check size={14} className="text-indigo-400" />}
                                        </div>
                                        <p className="text-[11px] text-white/40 line-clamp-1 font-medium mb-3 italic">{model.description}</p>
                                        
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/30">
                                                <Zap size={11} className={config.modelId === model.id ? 'text-indigo-400' : ''} /> {model.speed}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/30">
                                                <DollarSign size={11} className={config.modelId === model.id ? 'text-indigo-400' : ''} /> {model.price === 0 ? 'Free' : `${model.price} Credits`}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="p-6 bg-white/5 border-t border-white/10">
                   <button 
                    onClick={onClose}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98]"
                   >
                     Apply Configurations
                   </button>
                </div>
            </motion.div>
        </div>
    );
};

export default MagicToolSettingsCard;
