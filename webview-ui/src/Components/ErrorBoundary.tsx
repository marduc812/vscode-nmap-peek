import React from 'react';


interface ErrorBoundaryState {
    hasError: boolean;
    errorMessage?: string;
}

interface ErrorBoundaryProps {
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({ hasError: true, errorMessage: error.message });
    }

    render() {
        if (this.state.hasError) {

            return (
                <div className='w-full flex flex-col items-center mt-16 px-8'>
                    <div className='bg-[#1a1d27] border border-red-500/20 rounded-lg p-8 max-w-md text-center'>
                        <div className='w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4'>
                            <span className='text-red-400 text-2xl'>!</span>
                        </div>
                        <h1 className='text-slate-200 text-lg font-semibold mb-2'>Something went wrong</h1>
                        <p className='text-slate-400 text-sm mb-4'>The following error occurred while rendering:</p>
                        <p className='text-emerald-400 text-sm font-mono bg-[#0f1117] rounded p-2 border border-[rgba(255,255,255,0.06)]'>
                            {this.state.errorMessage}
                        </p>
                        <p className='text-slate-500 text-xs mt-4'>
                            Please consider reporting this on{' '}
                            <a href="https://github.com/marduc812/vscode-nmap-peek" className='text-indigo-400 hover:text-indigo-300'>GitHub</a>
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
