import React from 'react';

const CPEView = (props : {cpe: string}) => {
    return (
        <div className='my-2 ml-4'>
          <h4 className='text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5'>CPE</h4>
          <p className='text-slate-300 text-xs font-mono bg-[#0f1117] rounded-md border border-[rgba(255,255,255,0.06)] p-2'>{props.cpe}</p>
        </div>
      );
};

export default CPEView;
