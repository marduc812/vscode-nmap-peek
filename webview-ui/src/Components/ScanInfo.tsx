import { ScanInfoType } from '../utilities/types';

const ScanInfo = (props: { scanInfo: ScanInfoType }) => {

  const type = props.scanInfo['@_type'] ? props.scanInfo['@_type'] : '-';
  const protocol = props.scanInfo['@_protocol'] ? props.scanInfo['@_protocol'] : '-';
  const ports = props.scanInfo['@_numservices'] ? props.scanInfo['@_numservices'] : '-';

  return (
    <div className='flex w-full flex-col'>
      <div className='flex flex-row w-full justify-evenly gap-3 p-3'>
        <StatCard label="Type" tooltip="Scan Type" value={type.toUpperCase()} />
        <StatCard label="Protocol" tooltip="Scan Protocol" value={protocol.toUpperCase()} />
        <StatCard label="Scanned" tooltip="Scanned Ports" value={ports.toUpperCase()} />
      </div>
    </div>
  );
};

const StatCard = (props: { label: string; tooltip: string; value: string }) => (
  <div className='flex-1 bg-[#1a1d27] border border-[rgba(255,255,255,0.06)] p-4 flex flex-col text-center rounded-lg hover:border-[rgba(99,102,241,0.3)] transition-colors duration-200'>
    <p className='text-slate-400 text-xs uppercase tracking-wider mb-1 cursor-default tooltip'>
      {props.label}
      <span className="tooltiptext text-xs">{props.tooltip}</span>
    </p>
    <p className='text-white font-semibold text-xl'>{props.value}</p>
  </div>
);

export default ScanInfo;
