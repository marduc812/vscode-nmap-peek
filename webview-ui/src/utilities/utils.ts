import { XMLParser } from "fast-xml-parser";
import { HostAddressType, HostType, NmapRunType, PortScriptType, PortType, PortsType, ScanInfoType } from "./types";

/**
 * Returns the parsed XML content to itterate on each host
 * @param nmapScan - string with the XML of nmap
 * @returns - parsed Object of Nmap | null
 */
export const parseNmapScan = (nmapScan: string): NmapRunType | null => {
    const parsingOptions = {
        ignoreAttributes: false,
        ignoreNameSpace: false
    };
    const xmlParser = new XMLParser(parsingOptions);
    try {
        const parsedContent: NmapRunType = xmlParser.parse(nmapScan);
        return parsedContent;
    } catch (error) {
        return null;
    }
};


/**
 * Returns values for ipv4, ipv6 and mac address
 * @param scanAddresses - Array of addresses and assigs each to it's category
 * @returns - returns values for each ipv4, ipv6 and mac address
 */
export const getAddresses = (scanAddresses : HostAddressType[]) => {

    let ipv4 = "";
    let mac = "";
    let ipv6 = "";

    scanAddresses.forEach((address) => {
        if (address["@_addrtype"] === 'mac') {
            mac = address["@_addr"];
        } else if (address["@_addrtype"] === 'ipv4') {
            ipv4 = address["@_addr"];
        } else if (address["@_addrtype"] === 'ipv6') {
            ipv6 = address["@_addr"];
        }
    });

    return {ipv4: ipv4, ipv6: ipv6, mac: mac};
};


/**
 * Returns all the hostnames in form of a single string
 * @param scanHostnames - hostnames field of nmap. Can have some or even be empty
 * @returns {string} - list of hosts
 */
export const getHostnames = (scanHostnames: any): string => {
    let hostnames: string[] = [];

    if (!Array.isArray(scanHostnames)) {
        hostnames = [scanHostnames];
    } else {
        hostnames = scanHostnames;
    }

    let hostnamesList: string[] = [];
    hostnames.forEach((hostname: any) => {

        if (typeof (hostname) === 'string') {
            hostnamesList.push(hostname);
        } else {
            if (hostname.hostname['@_name']) {
                hostnamesList.push(hostname.hostname['@_name']);
            } else {
                console.log(hostname);
            }
        }
    });

    const uniqueHostnamesList = [...new Set(hostnamesList)];
    return uniqueHostnamesList.join(', ');
};


/**
 * Returns the nuymber of ports and the ports of each host
 * @param scanPorts - Takes the ports field from the nmap scan object
 * @returns {string[]} - An array with the ports of the scope
 */
export const generatePortScanInfo = (scanPorts: any): string[] => {
    let ports: string[] = [];

    // many ports are present
    if (Array.isArray(scanPorts.port)) {

        scanPorts.port.forEach((port: PortType) => {
            ports.push(port['@_portid']);
        });

    } else if (typeof (scanPorts.port) === 'object') {
        // there is single port
        ports.push(scanPorts.port['@_portid']);
    }

    return ports;
};

/**
 * Detects the OS based on the OS tag if it is present. 
 * @param scanHost - The Host Object
 * @returns {vendor: string, family: string} - which shows the vendot and the family of the OS.
 */
export const findOS = (scanHost: HostType): { vendor: string, family: string } => {
    const osmatch = scanHost.os && scanHost.os.osmatch ? scanHost.os.osmatch[0] : null;
    const osclass = osmatch && osmatch.osclass ? osmatch.osclass : null;
    let vendor = osclass && osclass['@_vendor'] ? osclass['@_vendor'] : '?';
    let family = osclass && osclass['@_osfamily'] ? osclass['@_osfamily'] : '?';

    if (vendor === '?' && family === '?') {
        const detectedOS = getOSFromPorts(scanHost.ports);
        if (detectedOS !== '') {
            vendor = '';
            family = detectedOS;
        }
    }

    return { vendor, family };
};


const getOSFromPorts = (ports: PortsType) => {
    const portsArray = Array.isArray(ports.port) ? ports.port : [ports.port];

    for (const port of portsArray) {
        if (port.service?.["@_ostype"]) {
            return port.service["@_ostype"];
        }
    }

    return '';
};


/**
 * Returns information from the scripts as a single string
 * @param scanScript 
 * @returns {in: string, out: string}[] - Object with in and out of script executions
 */
export const getScripts = (scanScript: PortScriptType[]): {in: string, out: string}[] => {
    if (scanScript === undefined) {
        return [{in: "", out: ""}];
    }
    let scriptsArray: {in: string, out: string}[] = [];

    if (Array.isArray(scanScript)) {
        scanScript.forEach((script: PortScriptType) => {
            scriptsArray.push({in: script["@_id"], out: script["@_output"]});
        });
    } else if (typeof (scanScript) === 'object') {
        // there is single script
        scriptsArray.push({in: scanScript["@_id"], out: scanScript["@_output"]});
    }

    return scriptsArray;
};


/**
 * Geths the CPE information and returns it in form of a single string
 * @param scanCPE 
 * @returns {string} - String with values from the CPE fields
 */
export const getCPE = (scanCPE: string | string[]): string => {
    let cpes: string[] = [];

    if (!Array.isArray(scanCPE)) {
        cpes = [scanCPE];
    } else {
        cpes = scanCPE;
    }

    let cpesList: string[] = [];
    cpes.forEach((cpe: any) => {
        cpesList.push(cpe);
    });

    const uniqueCpeList = [...new Set(cpesList)];
    return uniqueCpeList.join(', ');
};