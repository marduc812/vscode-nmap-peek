import { NmapRunType } from '../utilities/types';
import { VscTerminalBash, VscWatch } from "react-icons/vsc";

const ScanInfo = (props: { nmapRun: NmapRunType['nmaprun'] }) => {

  const scanInfo = props.nmapRun.scaninfo;
  const type = scanInfo['@_type'] ? scanInfo['@_type'] : '-';
  const protocol = scanInfo['@_protocol'] ? scanInfo['@_protocol'] : '-';
  const ports = scanInfo['@_numservices'] ? scanInfo['@_numservices'] : '-';

  const command = props.nmapRun['@_args'];
  const startTime = props.nmapRun['@_startstr'];
  const finished = props.nmapRun.runstats?.finished;
  const finishedTime = finished?.['@_timestr'];
  const elapsed = finished?.['@_elapsed'];

  return (
    <div className='w-full p-3'>
      <div className='bg-[#1a1d27] border border-[rgba(255,255,255,0.06)] rounded-lg overflow-hidden'>

        {/* Stat tiles */}
        <div className='grid grid-cols-3 divide-x divide-[rgba(255,255,255,0.06)]'>
          <StatCard label="Type" tooltip="Scan Type" value={type.toUpperCase()} />
          <StatCard label="Protocol" tooltip="Scan Protocol" value={protocol.toUpperCase()} />
          <StatCard label="Scanned" tooltip="Scanned Ports" value={ports.toUpperCase()} />
        </div>

        {/* Command + time */}
        {(command || startTime || finishedTime) && (
          <div className='border-t border-[rgba(255,255,255,0.06)] flex flex-col gap-3 p-4'>

            {command && (
              <div className='flex items-start gap-2'>
                <VscTerminalBash className='text-emerald-400 text-sm mt-0.5 shrink-0' />
                <code className='text-xs text-slate-300 font-mono break-all leading-relaxed'>
                  {command}
                </code>
              </div>
            )}

            {(startTime || finishedTime) && (
              <div className='flex items-center gap-2 text-xs text-slate-400'>
                <VscWatch className='text-emerald-400 text-sm shrink-0' />
                <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
                  {startTime && (
                    <span>
                      <span className='text-slate-500'>Started</span> {startTime}
                    </span>
                  )}
                  {startTime && finishedTime && <span className='text-slate-600'>•</span>}
                  {finishedTime && (
                    <span>
                      <span className='text-slate-500'>Finished</span> {finishedTime}
                    </span>
                  )}
                  {elapsed && (
                    <span className='text-slate-500'>({elapsed}s)</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = (props: { label: string; tooltip: string; value: string }) => (
  <div className='p-4 flex flex-col text-center hover:bg-[rgba(255,255,255,0.02)] transition-colors duration-200'>
    <p className='text-slate-400 text-xs uppercase tracking-wider mb-1 cursor-default tooltip'>
      {props.label}
      <span className="tooltiptext text-xs">{props.tooltip}</span>
    </p>
    <p className='text-white font-semibold text-xl'>{props.value}</p>
  </div>
);

export default ScanInfo;
