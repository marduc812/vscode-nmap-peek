import React, { useEffect, useState } from 'react';
import { HostType } from '../utilities/types';
import { filterPort, findOS, generatePortScanInfo, getAddresses, getHostnames, copyToClip } from '../utilities/utils';
import { VscTriangleUp, VscBlank } from "react-icons/vsc";
import PortsView from './PortsView';
import Search from './Search';
import Tools from './Tools';

const HostsView = (props: { hosts: HostType | HostType[] }) => {

  const [allHosts, setAllHosts] = useState<HostType[]>([]);
  const [filteredHosts, setFilteredHosts] = useState<HostType[]>([]);

  useEffect(() => {
    const hostsArray = Array.isArray(props.hosts) ? props.hosts : [props.hosts];
    setAllHosts(hostsArray);
    setFilteredHosts(hostsArray);
  }, [props.hosts]);

  const handleSearch = (searchQuery: string) => {
    const lowerCaseQuery = searchQuery.toLowerCase();

    let filter = "";
    let searchvalue = "";

    if (lowerCaseQuery.includes(":")) {
      filter = lowerCaseQuery.split(':')[0].trim();
      searchvalue = lowerCaseQuery.split(':')[1].trim();
    } else {
      searchvalue = lowerCaseQuery;
    }

    const filtered = allHosts.filter(host => {
      let addresses = Array.isArray(host.address) ? host.address : [host.address];
      const ipMatch = addresses.some(address => address['@_addr'].toLowerCase().includes(searchvalue));
      const hostnameMatch = getHostnames(host.hostnames).toLowerCase().includes(searchvalue);


      if (filter === 'host') {
        return ipMatch || hostnameMatch;
      }

      const status = host.status['@_state'] === searchvalue;

      if (filter === 'status') {
        return status;
      }

      const port = filterPort(host.ports, searchvalue, filter);

      return ipMatch || hostnameMatch || port || status;
    });
    setFilteredHosts(filtered);
  };

  return (
    <div className='w-full flex flex-col'>
      <Search onSearch={handleSearch} />
      <h2 className='text-white font-bold ml-5 text-2xl'>Hosts</h2>
      {filteredHosts.map((hostItem, index) => (
        <HostView key={index} host={hostItem} />
      ))}
    </div>
  );
};

export default HostsView;

const HostView = (props: { host: HostType }) => {

  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const addresses = Array.isArray(props.host.address) ? props.host.address : [props.host.address];

  const parsedAddress = getAddresses(addresses);
  const portsData = props.host.ports ? props.host.ports.port : [];

  const ip = parsedAddress.ipv4;
  const ipv6 = parsedAddress.ipv6;
  const mac = parsedAddress.mac;
  const statusClasses = props.host.status['@_state'] === 'up' ? 'text-green-500 active:text-green-400' : 'text-red-500 active:text-red-400';
  const hostnames = getHostnames(props.host.hostnames);

  const ports = generatePortScanInfo(props.host.ports);
  const openCount = ports.filter(item => item.state === "open").length;
  const os: { vendor: string, family: string } = findOS(props.host);

  const arrowClasses = expanded ? `rotate-0` : `rotate-180`;
  const arrowImageHover = ports.length !== 0 ? 'hover:cursor-pointer' : '';

  return (
    <div className='flex flex-col'>
      <div className='flex flex-col bg-gray-800 m-2 p-2 rounded-lg'>
        <div className='flex flex-row'>
          <p className={`${statusClasses} font-bold text-lg hover:cursor-pointer`} onClick={() => copyToClip(ip)}>{ip}</p>
          {hostnames !== "" && <p className='text-gray-400 ml-2'>({hostnames})</p>}
        </div>
        <div className='flex flex-row items-center'>
          <div onClick={toggleExpanded} className={`${arrowImageHover} transition-transform duration-500 ease-in-out ${arrowClasses}`}>
            {ports.length !== 0 ? <VscTriangleUp className='m-1 fill-white' width={16} height={16} /> : <VscBlank className='m-1 fill-white' width={16} height={16} />}
          </div>
          <div className='flex flex-row ml-2'>
            <p className='text-sm text-gray-400 tooltip cursor-default'>OS<span className="tooltiptext">Operating System</span></p>
            <p className='ml-2 uppercase text-gray-300 text-sm font-bold'>{os.vendor} {os.family}</p>
          </div>
          <div className='flex flex-row ml-5'>
            <p className='text-sm text-gray-400 tooltip cursor-default'>IP<span className="tooltiptext">Supported Address</span></p>
            {ip !== "" && <ItemView title='TP' value="IPv4" titleTooltip={ip} />}
            {ipv6 !== "" && <ItemView title='TP' value="IPv6" titleTooltip={ipv6} />}
            {mac !== "" && <ItemView title='TP' value="MAC" titleTooltip={mac} />}
          </div>
          <div className='flex flex-row ml-5'>
            <p className='text-sm text-gray-400 tooltip cursor-default'>OP<span className="tooltiptext">Open Ports</span></p>
            <p className='ml-2 uppercase text-gray-300 text-sm font-bold'>{openCount}</p>
          </div>
        </div>
      </div>
      <div className={`ml-5 transition-transform duration-700 ease-in-out overflow-hidden ${expanded ? 'max-h-fit opacity-100' : 'max-h-0 opacity-0'}`}>
        {expanded && <PortsView scanPorts={portsData} host={ip} />}
      </div>

    </div>
  );
};


const ItemView = (props: { title: string, value: string, titleTooltip: string }) => {
  return (
    <div className='flex flex-row'>
      <p className='ml-2 text-gray-300 text-sm font-bold tooltip'>{props.value}{props.titleTooltip !== "" && <span className="tooltiptext">{props.titleTooltip}</span>}</p>
    </div>
  );
};