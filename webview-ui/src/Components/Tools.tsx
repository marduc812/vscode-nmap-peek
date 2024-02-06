import React, { useState } from 'react';
import { copyToClip, extractURLs } from '../utilities/utils'
import { VscLink, VscSymbolKeyword, VscServer, VscCopy } from 'react-icons/vsc';

const Tools = (props: {xmlNmap: string}) => {
    const [visible, setVisible] = useState(false);
    const [text, setText] = useState("");

    const toggleVisible = () => {
        setVisible(prevVisible => !prevVisible);
    };

    const getUrls = () => {
        const extractedUrls = extractURLs(props.xmlNmap);
        if (extractedUrls === null) {
            setText("No URLs extracted");
        } else {
            const urlsText = extractedUrls.join('\n');
            setText(urlsText);
        }
    };

    const classes = visible ? 'text-green-500' : 'text-gray-400';
    

    return (
        <div>
            <div className='text-gray-400 flex flex-col items-center'>
                <div className='flex flex-row'>
                    <div className={`flex flex-row items-center p-2 m-2 bg-gray-800 rounded hover:bg-gray-700 hover:cursor-pointer hover:text-gray-200 ${classes}`} onClick={() => {toggleVisible(); getUrls();}}>
                        <VscLink className='text-xl mr-2' />
                        <h2 className='text-md'>Extract URLs</h2>
                    </div>
                </div>
            </div>

            {visible && <div>
                <div className='flex flex-row items-center justify-between'>
                    <h4 className='text-gray-300 font-bold ml-5 text-xl '>Extracted</h4>
                    <div className='flex flex-row text-gray-300 items-center hover:text-gray-100 active:text-white hover:cursor-pointer mr-5' onClick={() => copyToClip(text)}>
                        <VscCopy className='font-bold ml-5 text-xl mr-2'/>
                        <h2>COPY</h2>
                    </div>
                    
                </div>

                <div className='h-40 bg-gray-800 m-2 border rounded-md border-gray-700 max-w-full scripts-scrollbar p-2 overflow-auto'>
                    <p className='whitespace-pre-wrap text-gray-200'>
                        {text}
                    </p>
                </div>
            </div>}
        </div>
    );
};

export default Tools;