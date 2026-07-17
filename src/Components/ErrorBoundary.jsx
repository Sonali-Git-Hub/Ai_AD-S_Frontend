import React from 'react';
import { reportErrorToBackend } from '../services/incidentReporter';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("🚨 Global ErrorBoundary caught application crash:", error, errorInfo);
        
        // Expose for browser console debugging
        window.AISA_ERROR = { error: error?.toString(), stack: errorInfo?.componentStack };
        
        // Send telemetry immediately to backend
        try {
            reportErrorToBackend(
                error?.toString() || 'Unhandled Application Crash',
                errorInfo?.componentStack || error?.stack || 'No stack trace available',
                {
                    component: 'Frontend',
                    errorCode: 'GLOBAL_APP_CRASH',
                    logs: ['Global Error Boundary Catch']
                }
            );
        } catch (e) {
            console.error('Failed to report global error telemetry:', e);
        }
    }

    handleReset = () => {
        // Redirect to a clean session and reload
        window.location.href = '/dashboard/chat/new';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="fixed inset-0 z-[99999] bg-[#020617] text-[#f3f4f6] flex flex-col items-center justify-center p-6 sm:p-10 select-none overflow-y-auto font-sans">
                    
                    {/* Glowing blur effects */}
                    <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />
                    
                    <div className="max-w-2xl w-full bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[32px] p-8 sm:p-12 shadow-2xl relative flex flex-col items-center text-center space-y-6">
                        
                        {/* Glow indicator */}
                        <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.25)] animate-pulse">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        
                        <div className="space-y-2">
                            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-[#ffffff]">
                                AISA System Exception
                            </h1>
                            <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed max-w-md mx-auto">
                                The application crashed during runtime. Telemetry has logged the incident and notified our engineering team.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 w-full justify-center">
                            <button
                                onClick={this.handleReset}
                                className="px-5 py-2.5 rounded-2xl bg-violet-600 text-white font-bold text-xs shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_4px_25px_rgba(139,92,246,0.45)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                            >
                                Restore Dashboard
                            </button>

                            <button
                                onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                                className="px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-[#94a3b8] hover:text-white font-bold text-xs transition-all cursor-pointer"
                            >
                                {this.state.showDetails ? 'Hide technical logs' : 'View technical logs'}
                            </button>
                        </div>

                        {this.state.showDetails && (
                            <div className="w-full text-left bg-[#05070a] border border-white/5 rounded-2xl p-5 font-mono text-[10px] text-red-400/90 leading-relaxed overflow-x-auto select-text max-h-[250px] custom-scrollbar">
                                <p className="font-extrabold uppercase text-[8px] text-white/40 tracking-wider mb-2 border-b border-white/5 pb-1">Telemetry Crash Log</p>
                                <p className="font-extrabold text-white mb-2 break-all">{this.state.error && this.state.error.toString()}</p>
                                <pre className="whitespace-pre text-[#94a3b8]/60 leading-relaxed">
                                    {this.state.errorInfo && this.state.errorInfo.componentStack}
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

export default ErrorBoundary;
