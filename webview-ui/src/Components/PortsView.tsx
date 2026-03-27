import React, { useState } from 'react';
import { PortType } from '../utilities/types';
import { getCPE, getScripts } from '../utilities/utils';
import { VscLock } from "react-icons/vsc";
import ScriptsView from './ScriptsView';
import CPEView from './CPEView';
import FPView from './FPView';

const PortsView = (props: { scanPorts: PortType[], host: string }) => {

    const portsArray = Array.isArray(props.scanPorts) ? props.scanPorts : [props.scanPorts];

    const ports = portsArray.map((port, index) =>
        <PortView scanPort={port} key={`${props.host}-${index}`} />
    );

    return (
        <div className='pt-2'>
            <table className='w-full text-sm'>
                <thead>
                    <tr className='text-slate-500 text-xs uppercase tracking-wider'>
                        <th className='pb-2 pl-1 w-6'></th>
                        <th className='pb-2 text-left font-medium'>Port</th>
                        <th className='pb-2 text-left font-medium'>Info</th>
                        <th className='pb-2 text-left font-medium'>Service</th>
                        <th className='pb-2 text-left font-medium pl-2'>Version</th>
                        <th className='pb-2 text-left font-medium pl-2'>Product</th>
                    </tr>
                </thead>
                <tbody>
                    {ports}
                </tbody>
            </table>
        </div>
    );
};

export default PortsView;


const PortView = (props: { scanPort: PortType }) => {

    if (props.scanPort === undefined) {
        return (<></>);
    };

    const [expandedScript, setExpandedScript] = useState(false);
    const [expandedCPE, setExpandedCPE] = useState(false);
    const [expandedFP, setExpandedFP] = useState(false);

    const toggleExpandedScript = () => {
        setExpandedScript(!expandedScript);
        setExpandedCPE(false);
        setExpandedFP(false);
    };

    const toggleExpandedCPE = () => {
        setExpandedCPE(!expandedCPE);
        setExpandedScript(false);
        setExpandedFP(false);
    };

    const toggleExpandedFP = () => {
        setExpandedFP(!expandedFP);
        setExpandedCPE(false);
        setExpandedScript(false);
    };

    const state = props.scanPort?.state?.["@_state"] ?? '';
    const serviceName = props.scanPort?.service?.['@_name'] ?? '';
    const serviceProduct = props.scanPort?.service?.['@_product'] ?? '';
    const serviceVersion = props.scanPort?.service?.['@_version'] ?? '';
    const serviceFP = props.scanPort?.service?.['@_servicefp'] ?? '';
    const serviceCPE = props.scanPort?.service?.cpe ? getCPE(props.scanPort.service.cpe) : '';
    const portId = props.scanPort?.["@_portid"] ?? '';
    const script = props.scanPort?.script ? getScripts(props.scanPort.script) : '';

    const tunnel = props.scanPort?.service?.['@_tunnel'] ?? '';
    const scripts = props.scanPort?.script ?? [];
    const scriptsArray = Array.isArray(scripts) ? scripts : [scripts];
    const hasSSLScript = scriptsArray.some(s => s['@_id']?.startsWith('ssl-'));
    const isSSL = tunnel === 'ssl' || serviceName.includes('ssl') || serviceName === 'https' || hasSSLScript;

    const stateColor = state === 'open' ? 'bg-emerald-400' : state === 'closed' ? 'bg-red-400' : 'bg-yellow-400';
    const hasScript = script !== '';
    const hasCPE = serviceCPE !== '';
    const hasFP = serviceFP !== '';

    return (
        <>
            <tr className='border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.02)] transition-colors'>
                <td className='py-1.5 pl-1'>
                    <div className={`w-1.5 h-1.5 rounded-full ${stateColor}`} />
                </td>
                <td className='py-1.5'>
                    <span className='text-slate-200 font-mono font-medium'>{portId}</span>
                </td>
                <td className='py-1.5'>
                    <div className='flex items-center gap-1'>
                        <span className='w-5 h-5 inline-flex items-center justify-center'>
                            {isSSL && (
                                <span className='text-amber-300 tooltip cursor-default'>
                                    <VscLock className='text-[10px]' />
                                    <span className="tooltiptext">SSL/TLS enabled</span>
                                </span>
                            )}
                        </span>
                        <InfoPill letter="S" active={hasScript} expanded={expandedScript} onClick={hasScript ? toggleExpandedScript : undefined} title="Scripts" />
                        <InfoPill letter="C" active={hasCPE} expanded={expandedCPE} onClick={hasCPE ? toggleExpandedCPE : undefined} title="CPE" />
                        <InfoPill letter="F" active={hasFP} expanded={expandedFP} onClick={hasFP ? toggleExpandedFP : undefined} title="Fingerprint" />
                    </div>
                </td>
                <td className='py-1.5'><span className='text-slate-300'>{serviceName}</span></td>
                <td className='py-1.5 pl-2'><span className='text-slate-400'>{serviceVersion}</span></td>
                <td className='py-1.5 pl-2'><span className='text-slate-400 truncate'>{serviceProduct}</span></td>
            </tr>
            {expandedScript && hasScript && (
                <tr>
                    <td colSpan={6}>
                        <ScriptsView scripts={script} port={portId} />
                    </td>
                </tr>
            )}
            {expandedCPE && hasCPE && (
                <tr>
                    <td colSpan={6}>
                        <CPEView cpe={serviceCPE} />
                    </td>
                </tr>
            )}
            {expandedFP && hasFP && (
                <tr>
                    <td colSpan={6}>
                        <FPView fp={serviceFP} />
                    </td>
                </tr>
            )}
        </>
    );
};

const InfoPill = (props: { letter: string; active: boolean; expanded: boolean; onClick?: () => void; title: string }) => {
    if (!props.active) {
        return <span className='w-5 h-5 inline-flex items-center justify-center text-[10px] text-slate-700 cursor-default'>{props.letter}</span>;
    }
    return (
        <span
            className={`w-5 h-5 inline-flex items-center justify-center text-[10px] font-semibold rounded cursor-pointer transition-colors duration-150 ${
                props.expanded
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'bg-[#252836] text-slate-300 border border-[rgba(255,255,255,0.08)] hover:border-indigo-500/30 hover:text-indigo-300'
            }`}
            onClick={props.onClick}
            title={props.title}
        >
            {props.letter}
        </span>
    );
};
