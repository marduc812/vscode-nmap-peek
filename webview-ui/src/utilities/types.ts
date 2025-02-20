/* eslint-disable @typescript-eslint/naming-convention */
export type NmapRunType = {
    "nmaprun": {
        "scaninfo": ScanInfoType;
        "host": HostType | HostType[];
    }
};

export type ScanInfoType = {
    "@_type": string;
    "@_protocol": string;
    "@_numservices": string;
    "@_services":string;
};

export type HostType = {
    "status": HostStatusType;
    "address": HostAddressType | HostAddressType[];
    "hostnames": HostnameType | HostnameType[] | string;
    "ports": PortsType;
    "os"?: OSType;
};

export type OSType = {
    "osmatch": OSMatchType[]
};

export type OSMatchType = {
    "osclass": OSClass;
};

export type OSClass = {
    "@_vendor": string;
    "@_osfamily": string;
};

export type HostStatusType = {
    "@_state": string;
    "@_reason": string;
    "@_reason_ttl": string;
};

export type HostAddressType = {
    "@_addr": string;
    "@_addrtype": string;
};

export type HostnameType = {
        [x: string]: any;
        "@_name": string;
        "@_type": string;
};

export type PortsType = {
    "port" : PortType[];
};

export type PortType = {
    "state": {
        "@_state": string;
        "@_reason": string;
        "@_reason_ttl": string;
    };
    "service"?: PortServiceType;
    "script"?: PortScriptType[];
    "@_protocol": string;
    "@_portid": string;
};

export type PortServiceType = {
    "cpe": string | string[];
    "@_name": string;
    "@_product": string;
    "@_version": string;
    "@_extrainfo": string;
    "@_ostype": string;
    "@_servicefp": string;
};

export type PortScriptType = {
    "@_id": string;
    "@_output": string;
};