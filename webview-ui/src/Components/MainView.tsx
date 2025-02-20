import React from 'react';
import ScanInfo from './ScanInfo';
import HostsView from './HostsView';
import { parseNmapScan } from '../utilities/utils';
import Tools from './Tools';

const MainView = (props: { nmapScan: string }) => {

  const parsedNmap = parseNmapScan(props.nmapScan);

  return (
    <div className='w-full'>
      {parsedNmap?.nmaprun?.scaninfo && <ScanInfo scanInfo={parsedNmap.nmaprun.scaninfo} />}
      {parsedNmap?.nmaprun?.host && <HostsView hosts={parsedNmap.nmaprun.host} />}

    </div>
  );
};

export default MainView;