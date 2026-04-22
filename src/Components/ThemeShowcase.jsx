import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Palette, Check, Zap, Bell, Settings, MessageSquare } from 'lucide-react';

const ThemeShowcase = () => {
    const { accentColor, setAccentColor, ACCENT_COLORS } = useTheme();
    const [toggle, setToggle] = useState(true);

    return (
        <div className="p-8 space-y-12 bg-primary-bg rounded-[2.5rem] border border-primary-border transition-all duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-foreground mb-2 flex items-center gap-3">
                        <Palette className="text-primary w-8 h-8" />
                        Accent Color System
                    </h2>
                    <p className="text-muted-foreground font-medium">Dynamic design tokens applied globally.</p>
                </div>
                
                <div className="flex items-center gap-2 bg-white/50 dark:bg-black/50 p-2 rounded-2xl border border-primary-border">
                    {Object.keys(ACCENT_COLORS).map((color) => (
                        <button
                            key={color}
                            onClick={() => setAccentColor(color)}
                            className={`w-8 h-8 rounded-full transition-all duration-300 transform hover:scale-110 flex items-center justify-center ${accentColor === color ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-black scale-110' : 'opacity-60 hover:opacity-100'}`}
                            style={{ backgroundColor: `hsl(${ACCENT_COLORS[color]})` }}
                            title={color}
                        >
                            {accentColor === color && <Check className="w-4 h-4 text-white" />}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Buttons Section */}
                <div className="space-y-4 p-6 bg-card rounded-3xl border border-border/50 shadow-sm">
                    <h3 className="text-sm font-black uppercase tracking-widest text-primary">Buttons</h3>
                    <div className="flex flex-col gap-3">
                        <button className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all transform active:scale-95">
                            Primary Button
                        </button>
                        <button className="w-full py-3 bg-primary-light/20 text-primary rounded-xl font-bold border border-primary/20 hover:bg-primary-light/30 transition-all">
                            Ghost Button
                        </button>
                        <button className="w-full py-3 text-primary font-bold hover:underline transition-all">
                            Link Button
                        </button>
                    </div>
                </div>

                {/* Toggles & Inputs Section */}
                <div className="space-y-4 p-6 bg-card rounded-3xl border border-border/50 shadow-sm">
                    <h3 className="text-sm font-black uppercase tracking-widest text-primary">Inputs & Toggles</h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-foreground">Accent Toggle</span>
                            <button
                                onClick={() => setToggle(!toggle)}
                                className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${toggle ? 'bg-primary' : 'bg-muted'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${toggle ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Focus me..." 
                                className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                            />
                        </div>

                        <div className="flex gap-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${i === 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer'}`}>
                                    {i}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Indicators Section */}
                <div className="space-y-4 p-6 bg-card rounded-3xl border border-border/50 shadow-sm">
                    <h3 className="text-sm font-black uppercase tracking-widest text-primary">Indicators</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Bell size={24} />
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary border-2 border-card rounded-full animate-pulse" />
                            </div>
                            <div>
                                <p className="text-sm font-bold">Active Notification</p>
                                <p className="text-xs text-muted-foreground">Using --primary-light</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                                <span className="text-primary">Progress</span>
                                <span className="text-muted-foreground">75%</span>
                            </div>
                            <div className="w-full h-2 bg-primary/10 rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: '75%' }} />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-md uppercase tracking-widest border border-primary/20">New</span>
                            <span className="px-2 py-1 bg-primary text-white text-[10px] font-black rounded-md uppercase tracking-widest">Premium</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Example */}
            <div className="p-6 bg-card rounded-3xl border border-border/50 shadow-lg">
                <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-4">Chat Component Preview</h3>
                <div className="flex gap-4 items-end">
                    <div className="flex-1 bg-muted/30 border border-border rounded-2xl p-3 min-h-[44px] flex items-center">
                        <p className="text-sm text-muted-foreground">Type a message...</p>
                    </div>
                    <button className="w-11 h-11 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all">
                        <Zap size={20} fill="currentColor" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ThemeShowcase;
