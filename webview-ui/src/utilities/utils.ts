import { XMLParser } from "fast-xml-parser";
import toast from "react-hot-toast";
import { HostAddressType, HostType, HostnameType, NmapRunType, PortScriptType, PortType, PortsType, ScanInfoType } from "./types";

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
export const getAddresses = (scanAddresses: HostAddressType[]) => {

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

    return { ipv4: ipv4, ipv6: ipv6, mac: mac };
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

    let hostnamesList = new Set();
    hostnames.forEach((hostname: any) => {
        if (typeof (hostname) === 'string') {
            hostnamesList.add(hostname);
        } else {
            // Check if hostname and its property exist before accessing '@_name'
            if (hostname && hostname.hostname) {
                if (typeof hostname.hostname === 'string') {
                    hostnamesList.add(hostname.hostname);
                } else if (hostname.hostname['@_name']) {
                    hostnamesList.add(hostname.hostname['@_name']);
                }

                if (Array.isArray(hostname.hostname)) {
                    let hostnamesSet = new Set();
                    hostname.hostname.forEach((hostnameItem: HostnameType) => {
                        if (hostnameItem && hostnameItem['@_name']) {
                            hostnamesSet.add(hostnameItem['@_name']);
                        }
                    });

                    let hostnamesArray = Array.from(hostnamesSet);
                    if (hostnamesArray.length === 1) {
                        hostnamesList.add(hostnamesArray[0]);
                    } else {
                        hostnamesList.add(hostnamesArray.join(', '));
                    }
                }
            } else {
                console.log('Invalid hostname format:', hostname);
            }
        }
    });

    const uniqueHostnamesList = [...new Set(hostnamesList)];
    return uniqueHostnamesList.join(', ');
};



/**
 * Returns the nuymber of ports and the ports of each host
 * @param scanPorts - Takes the ports field from the nmap scan object
 * @returns {{number: string, state: string}[]} - An array with the ports and their state of the scope
 */
export const generatePortScanInfo = (scanPorts: any): {number: string, state: string}[] => {
    let ports: {number: string, state: string}[] = [];

    if (scanPorts && scanPorts.port) {
        // Many ports are present
        if (Array.isArray(scanPorts.port)) {
            scanPorts.port.forEach((port: PortType) => {
                if (port && port['@_portid']) {
                    ports.push({number: port['@_portid'], state: port.state["@_state"]});
                }
            });
        } else if (typeof scanPorts.port === 'object') {
            // There is a single port
            if (scanPorts.port['@_portid']) {
                ports.push({number: scanPorts.port['@_portid'], state: scanPorts.port.state["@_state"]});
            }
        }
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

/**
 * Detectes the OS of the host based on service info
 * @param ports - The ports object of the host
 * @returns the OS or empty string if nothing was found.
 */
const getOSFromPorts = (ports: PortsType) => {
    if (!ports || !ports.port) {
        return '';
    }

    const portsArray = Array.isArray(ports.port) ? ports.port : [ports.port];

    for (const port of portsArray) {
        if (port && port.service && port.service["@_ostype"]) {
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
export const getScripts = (scanScript: PortScriptType[]): PortScriptType[] => {
    if (scanScript === undefined) {
        return [{ "@_id": "", "@_output": "" }];
    }
    let scriptsArray: { "@_id": string, "@_output": string }[] = [];

    if (Array.isArray(scanScript)) {
        scanScript.forEach((script: PortScriptType) => {
            scriptsArray.push({ "@_id": script["@_id"], "@_output": script["@_output"] });
        });
    } else if (typeof (scanScript) === 'object') {
        // there is single script
        scriptsArray.push({ "@_id": scanScript["@_id"], "@_output": scanScript["@_output"] });
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


export const filterPort = (ports: PortsType, query: string, filter: string): boolean => {
    if (!ports || !ports.port) {
        return false;
    }

    const normalizedPorts = Array.isArray(ports.port) ? ports.port : [ports.port];


    const lowerCaseQuery = query.toLowerCase();

    return normalizedPorts.some(port => {
        const state = port?.state?.["@_state"] ?? '';
        const serviceName = port?.service?.['@_name'] ?? '';
        const serviceOSType = port?.service?.['@_ostype'] ?? '';
        const serviceProduct = port?.service?.['@_product'] ?? '';
        const serviceVersion = port?.service?.['@_version'] ?? '';
        const serviceCPE = port?.service?.cpe ? getCPE(port.service.cpe) : '';
        const protocol = port?.["@_protocol"] ?? '';
        const portId = port?.["@_portid"] ?? '';
        const script = port?.script ? getScripts(port.script) : '';

        switch(filter) {
            case "state":
                return state.includes(lowerCaseQuery);

            case "pnumber":
                return portId === lowerCaseQuery;

            case "pscript":
                return scriptContains(script, lowerCaseQuery);

            case "sname":
                return serviceName.includes(lowerCaseQuery);
            
            case "protocol":
                return protocol === lowerCaseQuery;

            case "port":
                return serviceName.toLowerCase().includes(lowerCaseQuery) ||
                    serviceOSType.toLowerCase().includes(lowerCaseQuery) ||
                    serviceProduct.toLowerCase().includes(lowerCaseQuery) ||
                    serviceVersion.toLowerCase().includes(lowerCaseQuery) ||
                    serviceCPE.toLowerCase().includes(lowerCaseQuery);

            default:
                return state.toLowerCase().includes(lowerCaseQuery) ||
                    serviceName.toLowerCase().includes(lowerCaseQuery) ||
                    serviceOSType.toLowerCase().includes(lowerCaseQuery) ||
                    serviceProduct.toLowerCase().includes(lowerCaseQuery) ||
                    serviceVersion.toLowerCase().includes(lowerCaseQuery) ||
                    serviceCPE.toLowerCase().includes(lowerCaseQuery) ||
                    protocol.toLowerCase().includes(lowerCaseQuery) ||
                    portId.toLowerCase().includes(lowerCaseQuery) ||
                    scriptContains(script, lowerCaseQuery);
        }
    });
};


export const scriptContains = (scripts: PortScriptType[] | "", query: string) : boolean => {
    if (scripts === "") {
        return false;
    }

    return scripts.some(script => {
        return script["@_output"].toLowerCase().includes(query);
    });
}; 


/**
 * Copies the selected text to clipboard
 * @param text 
 */
export const copyToClip = (text: string) => {
    navigator.clipboard.writeText(text);
    toast('Copied to clipboard!',
    {   duration: 700,
        position: 'top-right',
        icon: '📋',
        style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
        },
    }
    );
};

/**
 * Returns the URLs extracted from the XML file
 * @param text : the whole XML content
 * @returns string[] | null: A list of strings or null if no urls were extracted.
 */
export const extractURLs = (text: string): string[] | null => {
    const urlRegex = /\bhttps?:\/\/[^\s()<>]+(?:\([\w\d]+\)|([^`!{}\[\];:'".,<>?«»“”‘’\s]|\/))/g;
    return text.match(urlRegex);
};