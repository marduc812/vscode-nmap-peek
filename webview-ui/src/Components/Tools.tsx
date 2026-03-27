import React, { useState, useEffect, useRef } from "react";
import { copyToClip, extractURLs, getAddresses, getHostnames, getHostPorts } from "../utilities/utils";
import { VscCopy, VscLink, VscSymbolKeyword, VscJson, VscTable, VscSettingsGear, VscClose } from "react-icons/vsc";
import { HostType } from "../utilities/types";

const Tools = (props: { filteredHosts: HostType[] }) => {
    const [selectedTool, setSelectedTool] = useState<string | null>(null);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [text, setText] = useState("");
    const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({
        host: true,
        status: true,
        address: true,
        hostname: true,
        portID: true,
        state: true,
        service_name: true,
        service_product: true,
        service_version: true
    });

    const toggleField = (field: string) => {
        setSelectedFields(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSelection = (tool: string, action: () => void) => {
        setSelectedTool((prev) => (prev === tool ? null : tool));
        action();
    };

    const getUrls = () => {
        const nmapString = JSON.stringify(props.filteredHosts);
        const extractedUrls = extractURLs(nmapString.replaceAll("&#xa;","\n"));
        setText(extractedUrls ? extractedUrls.join("\n") : "No URLs extracted");
    };

    const extractHostPort = () => {
        const hostPortText = getHostPorts(props.filteredHosts);
        setText(hostPortText.join("\n"));
    };

    const exportAsJson = () => {
        const filteredData = props.filteredHosts.map(host => {
            const filteredHost: any = {};

            Object.keys(selectedFields).forEach(field => {
                if (selectedFields[field as keyof typeof selectedFields]) {
                    switch (field) {
                        case "hostname":
                            filteredHost[field] = getHostnames(host.hostnames);
                            break;
                        case "status":
                            filteredHost[field] = host.status["@_state"];
                            break;
                        case "address":
                            const addresses = getAddresses(host.address);
                            filteredHost[field] = Object.values(addresses)
                                .filter(value => value !== "")
                                .join(",");
                            break;
                        default:
                            filteredHost[field] = (host as any)[field];
                    }
                }
            });

            if (host.ports && host.ports.port) {
                const portsArray = Array.isArray(host.ports.port) ? host.ports.port : [host.ports.port];
                filteredHost.ports = portsArray.map(port => {
                    const portData: any = {};

                    Object.keys(selectedFields).forEach(field => {
                        if (selectedFields[field as keyof typeof selectedFields]) {
                            switch (field) {
                                case "portID":
                                    portData.portID = port["@_portid"];
                                    break;
                                case "state":
                                    portData.state = port.state["@_state"];
                                    break;
                                case "service_name":
                                    if (port.service) {
                                        portData.service = portData.service || {};
                                        portData.service.name = port.service["@_name"] ?? "";
                                    }
                                    break;
                                case "service_product":
                                    if (port.service) {
                                        portData.service = portData.service || {};
                                        portData.service.product = port.service["@_product"] ?? "";
                                    }
                                    break;
                                case "service_version":
                                    if (port.service) {
                                        portData.service = portData.service || {};
                                        portData.service.version = port.service["@_version"] ?? "";
                                    }
                                    break;

                            }
                        }
                    });
                    return portData;
                });
            }

            return filteredHost;
        });

        setText(JSON.stringify(filteredData, null, 2));
    };


    const exportAsCSV = () => {
        const fields = Object.keys(selectedFields).filter(field => selectedFields[field as keyof typeof selectedFields]);
        const csvRows = [fields.join(",")];

        props.filteredHosts.forEach(host => {
            const addresses = Array.isArray(host.address) ? host.address : [host.address];
            const portsArray = host.ports && host.ports.port ? (Array.isArray(host.ports.port) ? host.ports.port : [host.ports.port]) : [];

            if (portsArray.length > 0) {
                portsArray.forEach(port => {
                    const row = fields.map(field => {
                        let value;

                        switch (field) {
                            case "address":
                                const address = getAddresses(host.address);
                                value = Object.values(address)
                                    .filter(value => value !== "")
                                    .join(" ");
                                break;
                            case "status":
                                value = host.status["@_state"];
                                break;
                            case "hostname":
                                value = getHostnames(host.hostnames).replaceAll(","," ");
                                break;
                            case "portID":
                                value = port["@_portid"];
                                break;
                            case "state":
                                value = port.state["@_state"];
                                break;
                            case "service_name":
                                value = port.service ? port.service["@_name"] : "";
                                break;
                            case "service_product":
                                value = port.service ? port.service["@_product"] : "";
                                break;
                            case "service_version":
                                value = port.service ? port.service["@_version"] : "";
                                break;
                            case "host":
                                value = addresses.length > 0 ? addresses[0]["@_addr"] : "";
                                break;
                            default:
                                value = "";
                        }
                        return value ?? "";
                    }).join(",");
                    csvRows.push(row);
                });
            } else {
                const row = fields.map(field => {
                    let value;
                    switch (field) {
                        case "address":
                            const address = getAddresses(host.address);
                            value = Object.values(address)
                                .filter(value => value !== "")
                                .join(" ");
                            break;
                        case "host":
                            value = addresses.length > 0 ? addresses[0]["@_addr"] : "";
                            break;

                        case "status":
                            value = host.status["@_state"];
                            break;
                        case "hostname":
                            value = getHostnames(host.hostnames).replaceAll(","," ");
                            break;
                        default:
                            value = (host as any)[field] ?? "";
                    }
                    return value ?? "";
                }).join(",");
                csvRows.push(row);
            }
        });

        setText(csvRows.join("\n"));
    };

    const toolBtnClass = (tool: string) =>
        `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer ${
            selectedTool === tool
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_8px_rgba(99,102,241,0.15)]"
                : "bg-[#252836] text-slate-400 border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.15)] hover:text-slate-200 hover:bg-[#2a2d3a]"
        }`;

    const lineCount = text ? text.split('\n').length : 0;

    return (
        <div className="px-3 py-2">
            {/* Toolbar */}
            <div className="flex items-center bg-[#13151c] border border-[rgba(255,255,255,0.04)] rounded-lg px-3 py-2 gap-2 flex-wrap">
                {/* Extract group */}
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mr-1">Extract</span>
                    <div className={toolBtnClass("urls")} onClick={() => handleSelection("urls", getUrls)}>
                        <VscLink className="text-sm" />
                        <span>URLs</span>
                    </div>
                    <div className={toolBtnClass("hostPort")} onClick={() => handleSelection("hostPort", extractHostPort)}>
                        <VscSymbolKeyword className="text-sm" />
                        <span>host:port</span>
                    </div>
                </div>

                <div className="w-px h-5 bg-slate-700/30 mx-1" />

                {/* Export group */}
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mr-1">Export</span>
                    <div className={toolBtnClass("json")} onClick={() => handleSelection("json", exportAsJson)}>
                        <VscJson className="text-sm" />
                        <span>JSON</span>
                    </div>
                    <div className={toolBtnClass("csv")} onClick={() => handleSelection("csv", exportAsCSV)}>
                        <VscTable className="text-sm" />
                        <span>CSV</span>
                    </div>
                </div>

                <div className="w-px h-5 bg-slate-700/30 mx-1" />

                {/* Settings */}
                <div
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs cursor-pointer transition-all duration-150 ${
                        settingsVisible
                            ? "text-indigo-300"
                            : "text-slate-500 hover:text-slate-300"
                    }`}
                    onClick={() => setSettingsVisible(!settingsVisible)}
                >
                    <VscSettingsGear className="text-sm" />
                </div>
            </div>

            {/* Output panel */}
            {selectedTool && (
                <div className="mt-2 bg-[#13151c] border border-[rgba(255,255,255,0.04)] rounded-lg overflow-hidden">
                    {/* Output header */}
                    <div className="flex items-center justify-between px-3 py-2 border-b border-[rgba(255,255,255,0.04)]">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest">Output</span>
                            {lineCount > 0 && (
                                <span className="text-[10px] text-slate-600 font-mono">{lineCount} lines</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <div
                                className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-indigo-300 cursor-pointer transition-colors px-2 py-0.5 rounded hover:bg-indigo-500/10"
                                onClick={() => copyToClip(text)}
                            >
                                <VscCopy className="text-xs" />
                                <span>Copy</span>
                            </div>
                            <div
                                className="text-slate-600 hover:text-slate-300 cursor-pointer transition-colors p-0.5 rounded hover:bg-[rgba(255,255,255,0.05)]"
                                onClick={() => setSelectedTool(null)}
                            >
                                <VscClose className="text-xs" />
                            </div>
                        </div>
                    </div>

                    {/* Output content */}
                    <div className="max-h-56 p-3 overflow-auto scripts-scrollbar">
                        <pre className="whitespace-pre-wrap text-slate-300 text-xs font-mono leading-relaxed">{text}</pre>
                    </div>
                </div>
            )}

            {/* Settings modal overlay */}
            {settingsVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setSettingsVisible(false)}>
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

                    {/* Modal */}
                    <div
                        className="relative bg-[#1a1d27] border border-[rgba(255,255,255,0.08)] rounded-xl shadow-2xl w-80 max-w-[90vw]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
                            <h3 className="text-sm font-semibold text-slate-200">Export Fields</h3>
                            <div
                                className="text-slate-500 hover:text-slate-300 cursor-pointer transition-colors p-1 rounded hover:bg-[rgba(255,255,255,0.05)]"
                                onClick={() => setSettingsVisible(false)}
                            >
                                <VscClose className="text-sm" />
                            </div>
                        </div>

                        {/* Modal body */}
                        <div className="p-4 space-y-4">
                            <FieldGroup title="Host">
                                <FieldToggle label="Status" checked={selectedFields["status"]} onChange={() => toggleField("status")} />
                                <FieldToggle label="Address" checked={selectedFields["address"]} onChange={() => toggleField("address")} />
                                <FieldToggle label="Hostname" checked={selectedFields["hostname"]} onChange={() => toggleField("hostname")} />
                            </FieldGroup>

                            <FieldGroup title="Port">
                                <FieldToggle label="Port ID" checked={selectedFields["portID"]} onChange={() => toggleField("portID")} />
                                <FieldToggle label="State" checked={selectedFields["state"]} onChange={() => toggleField("state")} />
                                <FieldToggle label="Service Name" checked={selectedFields["service_name"]} onChange={() => toggleField("service_name")} />
                                <FieldToggle label="Service Product" checked={selectedFields["service_product"]} onChange={() => toggleField("service_product")} />
                                <FieldToggle label="Service Version" checked={selectedFields["service_version"]} onChange={() => toggleField("service_version")} />
                            </FieldGroup>
                        </div>

                        {/* Modal footer */}
                        <div className="px-4 py-3 border-t border-[rgba(255,255,255,0.06)] flex justify-end">
                            <div
                                className="px-3 py-1.5 rounded-md text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 cursor-pointer hover:bg-indigo-500/30 transition-colors"
                                onClick={() => setSettingsVisible(false)}
                            >
                                Done
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const FieldGroup = (props: { title: string; children: React.ReactNode }) => (
    <div>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-2">{props.title}</p>
        <div className="space-y-1.5">
            {props.children}
        </div>
    </div>
);

const FieldToggle = (props: { label: string; checked: boolean; onChange: () => void }) => (
    <label className="flex items-center justify-between py-1 px-2 rounded-md cursor-pointer hover:bg-[rgba(255,255,255,0.03)] transition-colors group">
        <span className={`text-xs transition-colors ${props.checked ? 'text-slate-200' : 'text-slate-500'}`}>
            {props.label}
        </span>
        <div
            className={`w-7 h-4 rounded-full transition-colors duration-200 relative ${
                props.checked ? 'bg-indigo-500' : 'bg-slate-700'
            }`}
            onClick={props.onChange}
        >
            <div
                className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    props.checked ? 'translate-x-3.5' : 'translate-x-0.5'
                }`}
            />
        </div>
    </label>
);

export default Tools;
