import React from 'react';
import { AlertOctagon, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { reportErrorToBackend } from '../services/incidentReporter';

class CardErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false, 
            error: null, 
            errorInfo: null,
            showDetails: false,
            isReloading: false
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error(`🚨 CardErrorBoundary caught crash in [${this.props.cardName || 'Anonymous Card'}]:`, error, errorInfo);
        
        // Report error with explicit card/component metadata
        reportErrorToBackend(
            error?.toString() || 'React Component Render Crash',
            errorInfo?.componentStack || error?.stack || 'No component stack trace',
            {
                component: 'Frontend',
                cardName: this.props.cardName || 'Unnamed Card Component',
                toolModule: this.props.toolModule || 'General',
                errorCode: 'REACT_RENDER_ERROR',
                logs: [`Component Props Keys: ${Object.keys(this.props).join(', ')}`]
            }
        );
    }

    handleRetry = () => {
        this.setState({ isReloading: true });
        
        // Simulate a tiny visual layout reload/cooldown for UX polish
        setTimeout(() => {
            this.setState({ 
                hasError: false, 
                error: null, 
                errorInfo: null,
                showDetails: false,
                isReloading: false
            });
        }, 600);
    };

    toggleDetails = () => {
        this.setState((prev) => ({ showDetails: !prev.showDetails }));
    };

    render() {
        if (this.state.hasError) {
            const cardTitle = this.props.cardName || 'Component Section';
            return (
                <div className="relative overflow-hidden w-full min-h-[220px] rounded-[24px] bg-gradient-to-br from-red-500/5 via-white/[0.02] to-transparent backdrop-blur-md border border-white/10 dark:border-red-500/10 p-6 flex flex-col items-center justify-center text-center shadow-lg transition-all duration-300">
                    
                    {/* Glowing background accent */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex flex-col items-center gap-3 max-w-md w-full">
                        <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)] animate-pulse">
                            <AlertOctagon className="w-5 h-5" />
                        </div>
                        
                        <div className="space-y-1">
                            <h3 className="text-sm font-black text-maintext tracking-tight capitalize leading-tight">
                                {cardTitle} Unavailable
                            </h3>
                            <p className="text-[11px] text-subtext leading-relaxed font-medium">
                                This section experienced a rendering glitch. The developer team has been automatically alerted.
                            </p>
                        </div>

                        {/* Interactive Retry Button */}
                        <div className="flex items-center gap-2 pt-1.5">
                            <button
                                onClick={this.handleRetry}
                                disabled={this.state.isReloading}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 font-bold transition-all text-[11px] outline-none select-none cursor-pointer active:scale-95"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${this.state.isReloading ? 'animate-spin' : ''}`} />
                                {this.state.isReloading ? 'Reloading...' : 'Retry Render'}
                            </button>

                            <button
                                onClick={this.toggleDetails}
                                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-subtext hover:text-maintext border border-white/5 transition-all text-[11px] font-bold outline-none cursor-pointer"
                            >
                                {this.state.showDetails ? 'Hide details' : 'Show details'}
                                {this.state.showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                        </div>

                        {/* Collapsible Technical Context */}
                        {this.state.showDetails && (
                            <div className="w-full mt-3 bg-[#05070a] border border-white/5 rounded-xl p-3 text-left font-mono text-[9px] text-red-400/80 leading-relaxed overflow-x-auto select-text max-h-[140px] custom-scrollbar">
                                <p className="font-extrabold uppercase text-[8px] text-white/40 tracking-wider mb-1">Crash Log</p>
                                <p className="font-bold text-maintext mb-1.5">{this.state.error?.toString()}</p>
                                <pre className="whitespace-pre text-subtext/60">
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default CardErrorBoundary;
