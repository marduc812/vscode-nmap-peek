import React, { useEffect, useMemo, useState } from 'react';
import { HostType } from '../utilities/types';
import { findOS, generatePortScanInfo, getAddresses, getHostnames, copyToClip, filterHostByQuery, applyServiceFilter, getServiceNames } from '../utilities/utils';
import { VscChevronDown } from "react-icons/vsc";
import PortsView from './PortsView';
import Search from './Search';
import ServiceFilters from './ServiceFilters';
import Tools from './Tools';

const HostsView = (props: { hosts: HostType | HostType[] }) => {

  const [allHosts, setAllHosts] = useState<HostType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  useEffect(() => {
    const hostsArray = Array.isArray(props.hosts) ? props.hosts : [props.hosts];
    setAllHosts(hostsArray);
  }, [props.hosts]);

  const serviceNames = useMemo(() => getServiceNames(allHosts), [allHosts]);

  const filteredHosts = useMemo(() => {
    return allHosts
      .map((host) => filterHostByQuery(host, searchQuery))
      .filter((host): host is HostType => host !== null)
      .map((host) => applyServiceFilter(host, selectedServices))
      .filter((host): host is HostType => host !== null);
  }, [allHosts, searchQuery, selectedServices]);

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  const clearServices = () => setSelectedServices([]);

  return (
    <div className='w-full flex flex-col'>
      <Search onSearch={setSearchQuery} />
      <ServiceFilters
        services={serviceNames}
        selected={selectedServices}
        onToggle={toggleService}
        onClear={clearServices}
      />
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
            <span
              className='text-slate-500 text-xs truncate cursor-pointer hover:text-slate-300 transition-colors active:text-indigo-300'
              onClick={(e) => { e.stopPropagation(); copyToClip(hostnames); }}
            >
              {hostnames}
            </span>
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
  <span
    className='text-[10px] px-1.5 py-0.5 rounded bg-[#252836] text-slate-400 border border-[rgba(255,255,255,0.06)] tooltip cursor-pointer hover:text-slate-200 hover:border-[rgba(255,255,255,0.15)] transition-colors active:text-indigo-300'
    onClick={(e) => { e.stopPropagation(); if (props.tooltip) { copyToClip(props.tooltip); } }}
  >
    {props.text}
    {props.tooltip !== "" && <span className="tooltiptext">{props.tooltip}</span>}
  </span>
);
