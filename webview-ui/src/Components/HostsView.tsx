import React, { useEffect, useState } from 'react';
import { HostType } from '../utilities/types';
import { filterPort, findOS, generatePortScanInfo, getAddresses, getHostnames, copyToClip } from '../utilities/utils';
import { VscChevronDown } from "react-icons/vsc";
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
      filter = lowerCaseQuery.split(":")[0].trim();
      searchvalue = lowerCaseQuery.split(":")[1].trim();
    } else {
      searchvalue = lowerCaseQuery;
    }

    const filtered = allHosts
      .map((host) => {
        let addresses = Array.isArray(host.address) ? host.address : [host.address];
        const ipMatch = addresses.some((address) => address["@_addr"].toLowerCase().includes(searchvalue));
        const hostnameMatch = getHostnames(host.hostnames).toLowerCase().includes(searchvalue);
        const status = host.status["@_state"] === searchvalue;

        if (filter === "pnumber") {
          const filteredPorts = host.ports?.port?.filter((port) => port["@_portid"] === searchvalue) || [];

          if (filteredPorts.length === 0) {
            return null;
          }

          return {
            ...host,
            ports: { port: filteredPorts }
          };
        }

        if (filter === "host") {
          return ipMatch || hostnameMatch ? host : null;
        }

        if (filter === "status") {
          return status ? host : null;
        }

        const port = filterPort(host.ports, searchvalue, filter);
        return ipMatch || hostnameMatch || port || status ? host : null;
      })
      .filter((host) => host !== null);

    setFilteredHosts(filtered as HostType[]);
  };


  return (
    <div className='w-full flex flex-col'>
      <Search onSearch={handleSearch} />
      <Tools filteredHosts={filteredHosts} />
      <div className='px-3 pb-3 space-y-2'>
        {filteredHosts.map((hostItem, index) => (
          <HostView key={index} host={hostItem} />
        ))}
      </div>
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
  const isUp = props.host.status['@_state'] === 'up';
  const hostnames = getHostnames(props.host.hostnames);

  const ports = generatePortScanInfo(props.host.ports);
  const openCount = ports.filter(item => item.state === "open").length;
  const os: { vendor: string, family: string } = findOS(props.host);
  const hasPorts = ports.length !== 0;

  return (
    <div className='bg-[#1a1d27] border border-[rgba(255,255,255,0.06)] rounded-lg hover:border-[rgba(255,255,255,0.1)] transition-colors duration-200'>
      <div
        className={`flex items-center justify-between p-3 ${hasPorts ? 'cursor-pointer' : ''}`}
        onClick={hasPorts ? toggleExpanded : undefined}
      >
        <div className='flex items-center gap-3 min-w-0'>
          {/* Status dot */}
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isUp ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]' : 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.4)]'}`} />

          {/* IP address */}
          <span
            className={`font-semibold text-sm ${isUp ? 'text-emerald-300' : 'text-red-300'} hover:underline cursor-pointer`}
            onClick={(e) => { e.stopPropagation(); copyToClip(ip); }}
          >
            {ip}
          </span>

          {/* Hostname */}
          {hostnames !== "" && (
            <span className='text-slate-500 text-xs truncate'>{hostnames}</span>
          )}
        </div>

        <div className='flex items-center gap-4 flex-shrink-0'>
          {/* Meta badges */}
          {(os.vendor || os.family) && (
            <MetaBadge label="OS" value={`${os.vendor} ${os.family}`.trim()} />
          )}

          <div className='flex items-center gap-1.5'>
            {ip !== "" && <TagBadge text="IPv4" tooltip={ip} />}
            {ipv6 !== "" && <TagBadge text="IPv6" tooltip={ipv6} />}
            {mac !== "" && <TagBadge text="MAC" tooltip={mac} />}
          </div>

          {openCount > 0 && (
            <MetaBadge label="Open" value={String(openCount)} highlight />
          )}

          {/* Expand chevron */}
          {hasPorts && (
            <VscChevronDown
              className={`text-slate-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            />
          )}
        </div>
      </div>

      {/* Expanded ports */}
      {expanded && (
        <div className='border-t border-[rgba(255,255,255,0.04)] px-3 pb-3'>
          <PortsView scanPorts={portsData} host={ip} />
        </div>
      )}
    </div>
  );
};

const MetaBadge = (props: { label: string; value: string; highlight?: boolean }) => (
  <div className='flex items-center gap-1.5 text-xs'>
    <span className='text-slate-500'>{props.label}</span>
    <span className={`font-medium ${props.highlight ? 'text-emerald-400' : 'text-slate-300'}`}>
      {props.value}
    </span>
  </div>
);

const TagBadge = (props: { text: string; tooltip: string }) => (
  <span className='text-[10px] px-1.5 py-0.5 rounded bg-[#252836] text-slate-400 border border-[rgba(255,255,255,0.06)] tooltip cursor-default'>
    {props.text}
    {props.tooltip !== "" && <span className="tooltiptext">{props.tooltip}</span>}
  </span>
);
