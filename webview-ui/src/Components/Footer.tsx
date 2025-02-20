import React from 'react';

const Footer = () => {
  return (
    <div className='flex flex-row p-5 justify-center items-center w-full'>
        <p className='text-gray-400'>For bugs and feature requests please raise an issue on <a href="https://github.com/marduc812/vscode-nmap-peek" className='underline decoration-wavy decoration-fuchsia-500 hover:decoration-solid hover:text-fuchsia-500 decoration-2 hover:decoration-4 hover:font-bold'>Github</a>.</p>
    </div>
  );
};

export default Footer;