import React, { useState } from 'react';
import { PortType } from '../utilities/types';
import { getCPE, getScripts } from '../utilities/utils';
import { VscCircleLargeFilled } from "react-icons/vsc";
import ScriptsView from './ScriptsView';
import CPEView from './CPEView';

const PortsView = (props: { scanPorts: PortType[], host: string }) => {

    const portsArray = Array.isArray(props.scanPorts) ? props.scanPorts : [props.scanPorts];

    const ports = portsArray.map((port, index) =>
        <PortView scanPort={port} key={`${props.host}-${index}`} />
    );

    return (
        <div>
            <table>
                <thead className='text-left text-gray-500'>
                    <tr>
                        <th></th>
                        <th>Port</th>
                        <th>Scripts</th>
                        <th>Service</th>
                        <th className='pl-2'>Version</th>
                        <th className='pl-2'>Product</th>
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

    const toggleExpandedScript = () => {
        setExpandedScript(!expandedScript);
        setExpandedCPE(false);
    };

    const toggleExpandedCPE = () => {
        setExpandedCPE(!expandedCPE);
        setExpandedScript(false);
    };

    const state = props.scanPort?.state?.["@_state"] ?? '';
    const serviceName = props.scanPort?.service?.['@_name'] ?? '';
    const serviceOSType = props.scanPort?.service?.['@_ostype'] ?? '';
    const serviceProduct = props.scanPort?.service?.['@_product'] ?? '';
    const serviceVersion = props.scanPort?.service?.['@_version'] ?? '';
    const serviceCPE = props.scanPort?.service?.cpe ? getCPE(props.scanPort.service.cpe) : '';
    const protocol = props.scanPort?.["@_protocol"] ?? '';
    const portId = props.scanPort?.["@_portid"] ?? '';
    const script = props.scanPort?.script ? getScripts(props.scanPort.script) : '';


    const stateIcon = state === 'open' ? 'fill-green-500' : state === 'closed' ? 'fill-red-500' : 'fill-yellow-500';
    const stateScript = expandedScript === true ? 'text-green-500' : 'text-white';
    const stateCPE = expandedCPE === true ? 'text-green-500' : 'text-white';

    return (
        <>
            <tr>
                <td><VscCircleLargeFilled width={16} height={16} className={`m-2 ${stateIcon}`} /></td>
                <td><p className='text-gray-300 font-bold'>{portId}</p></td>
                <td>
                    <div className='flex flex-row'>
                        {script !== '' ? <p className={`${stateScript} font-bold ml-2 hover:cursor-pointer`} onClick={toggleExpandedScript}>S</p> : <p className={`text-gray-900 font-bold ml-2 cursor-default`}>N</p>}
                        {serviceCPE !== '' ? <p className={`${stateCPE} font-bold ml-2 hover:cursor-pointer`} onClick={toggleExpandedCPE}>C</p> : <p className={`text-gray-900 font-bold ml-2 cursor-default`}>N</p>}
                    </div>
                </td>
                <td><p className='text-gray-300 pl-2'>{serviceName}</p></td>
                <td><p className='text-gray-300 pl-2'>{serviceVersion}</p></td>
                <td><p className='text-gray-300 pl-2 truncate'>{serviceProduct}</p></td>

            </tr>
            {expandedScript && script !== '' && (
                <tr className="transition-transform duration-700 ease-in-out max-h-fit opacity-100">
                    <td colSpan={6}>
                        <ScriptsView scripts={script} port={portId} />
                    </td>
                </tr>
            )}
            {expandedCPE && serviceCPE !== '' && (
                <tr className="transition-transform duration-700 ease-in-out max-h-fit opacity-100">
                    <td colSpan={6}>
                        <CPEView cpe={serviceCPE} />
                    </td>
                </tr>
            )}
        </>
    );
};
