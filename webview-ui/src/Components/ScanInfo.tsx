import { VscSymbolKeyword, VscLink, VscSparkle } from 'react-icons/vsc';
import { ScanInfoType } from '../utilities/types';
import { useState } from 'react';

const ScanInfo = (props: { scanInfo: ScanInfoType }) => {

  const type = props.scanInfo['@_type'] ? props.scanInfo['@_type'] : '-';
  const protocol = props.scanInfo['@_protocol'] ? props.scanInfo['@_protocol'] : '-';
  const ports = props.scanInfo['@_numservices'] ? props.scanInfo['@_numservices'] : '-';

  const [visible, setVisible] = useState(false);

  const toggleVisible = () => {
    setVisible(prevVisible => !prevVisible);
  };

  return (
    <div className='flex w-full flex-col'>
      <div className='flex flex-row w-full text-white justify-evenly mt-2'>
        <div className='bg-gray-800 p-3 m-2 flex flex-col text-center rounded-xl text-xl flex-grow flex-basis-0'>
          <p className='text-gray-400 cursor-default tooltip'>Type<span className="tooltiptext text-sm">Scan Type</span></p>
          <p className='font-bold'>{type.toUpperCase()}</p>
        </div>
        <div className='bg-gray-800 p-3 m-2 flex flex-col text-center rounded-xl text-xl flex-grow flex-basis-0'>
          <p className='text-gray-400 cursor-default tooltip'>Protocol<span className="tooltiptext text-sm">Scan Protocol</span></p>
          <p className='font-bold'>{protocol.toUpperCase()}</p>
        </div>
        <div className='bg-gray-800 p-3 m-2 flex flex-col text-center rounded-xl text-xl flex-grow flex-basis-0'>
          <p className='text-gray-400 cursor-default tooltip'>Scanned<span className="tooltiptext text-sm">Scanned Ports</span></p>
          <p className='font-bold'>{ports.toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
};

export default ScanInfo;