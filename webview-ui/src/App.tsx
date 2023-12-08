import React, { useEffect, useState } from 'react';
import "./App.css";
import MainView from './Components/MainView';
import Footer from './Components/Footer';
import { scan } from './utilities/test';

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
      <MainView nmapScan={inputFile}/>
      <Footer />
    </main>
  );
}

export default App;