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
            
            return (<div className='w-full flex flex-col items-center mt-10 h-64 justify-center'>
              
                    <h1 className='text-red-300 text-xl'>Oops! Something went wrong. :(</h1>
                    <p className='text-gray-300 mt-5 mb-5'>The following error occured.</p>
                    <p className='text-lime-400'>{this.state.errorMessage}</p>
                    <p className='text-gray-300 mt-5 mb-5'>Please consider reporting this issue on our GitHub page to help improve nmap-peek.</p>
               
            </div>);
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
