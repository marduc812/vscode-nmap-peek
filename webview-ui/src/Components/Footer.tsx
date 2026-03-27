import React from 'react';

const Footer = () => {
  return (
    <div className='flex justify-center items-center w-full py-4 mt-4 border-t border-[rgba(255,255,255,0.04)]'>
      <p className='text-slate-500 text-xs'>
        Bugs or feature requests? Open an issue on{' '}
        <a
          href="https://github.com/marduc812/vscode-nmap-peek"
          className='text-indigo-400 hover:text-indigo-300 transition-colors duration-150'
        >
          GitHub
        </a>
      </p>
    </div>
  );
};

export default Footer;
