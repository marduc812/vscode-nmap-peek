import React, { useEffect, useState } from 'react';
import "./App.css";
import MainView from './Components/MainView';
import Footer from './Components/Footer';
import ErrorBoundary from './Components/ErrorBoundary';

function App() {

  const [inputFile, setInputFile] = useState('');

  const handleMessage = (event: MessageEvent) => {
    const message = event.data;
    switch (message.command) {
      case 'sendData':
        setInputFile(message.data);
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <main className="">
      <ErrorBoundary>
        <MainView nmapScan={inputFile} />
      </ErrorBoundary>
      <Footer />
    </main>
  );
}

export default App;