import { describe, test, expect } from 'vitest';
import { getServiceNames, applyServiceFilter, filterHostByQuery } from './utils';
import { HostType, PortType } from './types';

const makePort = (portid: string, serviceName?: string, state = 'open'): PortType => ({
  state: { '@_state': state, '@_reason': '', '@_reason_ttl': '' },
  service: serviceName ? ({ '@_name': serviceName } as PortType['service']) : undefined,
  '@_protocol': 'tcp',
  '@_portid': portid,
});

const makeHost = (ports: PortType[]): HostType => ({
  status: { '@_state': 'up', '@_reason': '', '@_reason_ttl': '' },
  address: { '@_addr': '10.0.0.1', '@_addrtype': 'ipv4' },
  hostnames: '',
  ports: { port: ports },
});

describe('filterHostByQuery', () => {
  test('returns the host for an empty query', () => {
    const host = makeHost([makePort('80', 'http')]);

    expect(filterHostByQuery(host, '')).toBe(host);
  });

  test('matches on IP address with the host filter', () => {
    const host = makeHost([makePort('80', 'http')]);

    expect(filterHostByQuery(host, 'host:10.0.0.1')).toBe(host);
    expect(filterHostByQuery(host, 'host:192.168.0.1')).toBeNull();
  });

  test('matches host status exactly with the status filter', () => {
    const host = makeHost([makePort('80', 'http')]);

    expect(filterHostByQuery(host, 'status:up')).toBe(host);
    expect(filterHostByQuery(host, 'status:down')).toBeNull();
  });

  test('trims to a single port with the pnumber filter', () => {
    const host = makeHost([makePort('80', 'http'), makePort('22', 'ssh')]);

    const result = filterHostByQuery(host, 'pnumber:22');

    expect(result).not.toBeNull();
    expect((result!.ports.port as PortType[]).map((p) => p['@_portid'])).toEqual(['22']);
  });

  test('matches a service name with the sname filter', () => {
    const host = makeHost([makePort('80', 'http'), makePort('22', 'ssh')]);

    expect(filterHostByQuery(host, 'sname:ssh')).toBe(host);
    expect(filterHostByQuery(host, 'sname:ftp')).toBeNull();
  });

  test('performs a substring match across fields with no filter prefix', () => {
    const host = makeHost([makePort('80', 'http')]);

    expect(filterHostByQuery(host, 'http')).toBe(host);
    expect(filterHostByQuery(host, 'nonexistent')).toBeNull();
  });
});

describe('getServiceNames', () => {
  test('returns unique service names sorted alphabetically across all hosts', () => {
    const hosts = [
      makeHost([makePort('80', 'http'), makePort('22', 'ssh')]),
      makeHost([makePort('443', 'http'), makePort('25', 'smtp')]),
    ];

    expect(getServiceNames(hosts)).toEqual(['http', 'smtp', 'ssh']);
  });

  test('ignores ports without a service name', () => {
    const hosts = [makeHost([makePort('80', 'http'), makePort('9999')])];

    expect(getServiceNames(hosts)).toEqual(['http']);
  });

  test('handles a host with no ports', () => {
    const host: HostType = {
      status: { '@_state': 'down', '@_reason': '', '@_reason_ttl': '' },
      address: { '@_addr': '10.0.0.2', '@_addrtype': 'ipv4' },
      hostnames: '',
      ports: undefined as unknown as HostType['ports'],
    };

    expect(getServiceNames([host])).toEqual([]);
  });

  test('handles a single (non-array) port', () => {
    const host = makeHost([] as PortType[]);
    host.ports = { port: makePort('22', 'ssh') as unknown as PortType[] };

    expect(getServiceNames([host])).toEqual(['ssh']);
  });
});

describe('applyServiceFilter', () => {
  test('returns the host unchanged when no services are selected', () => {
    const host = makeHost([makePort('80', 'http'), makePort('22', 'ssh')]);

    expect(applyServiceFilter(host, [])).toBe(host);
  });

  test('keeps only ports whose service is selected', () => {
    const host = makeHost([makePort('80', 'http'), makePort('22', 'ssh'), makePort('25', 'smtp')]);

    const result = applyServiceFilter(host, ['http', 'smtp']);

    expect(result).not.toBeNull();
    const ports = result!.ports.port as PortType[];
    expect(ports.map((p) => p['@_portid'])).toEqual(['80', '25']);
  });

  test('drops the host when no ports match the selected services', () => {
    const host = makeHost([makePort('22', 'ssh')]);

    expect(applyServiceFilter(host, ['http'])).toBeNull();
  });

  test('drops a host that has no ports when services are selected', () => {
    const host: HostType = {
      status: { '@_state': 'up', '@_reason': '', '@_reason_ttl': '' },
      address: { '@_addr': '10.0.0.3', '@_addrtype': 'ipv4' },
      hostnames: '',
      ports: undefined as unknown as HostType['ports'],
    };

    expect(applyServiceFilter(host, ['http'])).toBeNull();
  });

  test('handles a single (non-array) port', () => {
    const host = makeHost([] as PortType[]);
    host.ports = { port: makePort('80', 'http') as unknown as PortType[] };

    const result = applyServiceFilter(host, ['http']);

    expect(result).not.toBeNull();
    const ports = result!.ports.port as PortType[];
    expect(ports.map((p) => p['@_portid'])).toEqual(['80']);
  });
});
