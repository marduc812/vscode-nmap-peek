import React from 'react';

const CPEView = (props : {cpe: string}) => {
    return (
        <div className='flex flex-col ml-5 mb-5'>
          <h4 className='text-white font-bold'>CPE</h4>
            <p className='text-gray-300 ml-2'>{props.cpe}</p>
        </div>
      );
};

export default CPEView;