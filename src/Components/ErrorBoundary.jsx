import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("🚨 ErrorBoundary caught:", error, errorInfo);
        // Expose for browser console debugging
        window.AISA_ERROR = { error: error?.toString(), stack: errorInfo?.componentStack };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 99999,
                    backgroundColor: '#ff0000',
                    color: '#ffffff',
                    padding: '40px',
                    fontFamily: 'monospace',
                    fontSize: '16px',
                    overflow: 'auto'
                }}>
                    <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>🚨 REACT ERROR BOUNDARY TRIGGERED</h1>
                    <p style={{ fontWeight: 'bold', marginBottom: '16px' }}>{this.state.error && this.state.error.toString()}</p>
                    <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                    <hr style={{ margin: '20px 0', borderColor: 'white' }} />
                    <p style={{ fontSize: '14px' }}>Check window.AISA_ERROR in browser console for full details</p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
