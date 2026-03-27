import React, { useState } from "react";
import { copyToClip, extractURLs, getAddresses, getHostnames, getHostPorts } from "../utilities/utils";
import { VscCopy, VscLink, VscSymbolKeyword, VscJson, VscTable, VscSettingsGear } from "react-icons/vsc";
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

    const getButtonClass = (tool: string) =>
        `flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 cursor-pointer ${
            selectedTool === tool
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                : "bg-[#252836] text-slate-400 border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)] hover:text-slate-200"
        }`;


    const showSettings = () => {
        setSettingsVisible(!settingsVisible);
    };

    return (
        <div className="px-3 py-2">
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Extract</span>

                <div className={getButtonClass("urls")} onClick={() => handleSelection("urls", getUrls)}>
                    <VscLink className="text-sm" />
                    <span>URLs</span>
                </div>

                <div className={getButtonClass("hostPort")} onClick={() => handleSelection("hostPort", extractHostPort)}>
                    <VscSymbolKeyword className="text-sm" />
                    <span>host:port</span>
                </div>

                <div className="w-px h-4 bg-slate-700/50 mx-1" />

                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Export</span>

                <div className={getButtonClass("json")} onClick={() => handleSelection("json", exportAsJson)}>
                    <VscJson className="text-sm" />
                    <span>JSON</span>
                </div>

                <div className={getButtonClass("csv")} onClick={() => handleSelection("csv", exportAsCSV)}>
                    <VscTable className="text-sm" />
                    <span>CSV</span>
                </div>

                <div className={getButtonClass("settings")} onClick={() => handleSelection("settings", showSettings)}>
                    <VscSettingsGear className="text-sm" />
                </div>
            </div>

            {selectedTool && selectedTool !== "settings" && (
                <div className="mt-2">
                    <div className="flex items-center justify-between mb-1.5">
                        <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Output</h4>
                        <div
                            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
                            onClick={() => copyToClip(text)}
                        >
                            <VscCopy className="text-sm" />
                            <span>Copy</span>
                        </div>
                    </div>

                    <div className="max-h-48 bg-[#0f1117] rounded-md border border-[rgba(255,255,255,0.06)] p-2 overflow-auto scripts-scrollbar">
                        <pre className="whitespace-pre-wrap text-slate-300 text-xs font-mono">{text}</pre>
                    </div>
                </div>
            )}

            {settingsVisible && (
                <div className="mt-2 bg-[#0f1117] border border-[rgba(255,255,255,0.06)] rounded-md p-3">
                    <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-3">Export Fields</h4>

                    <div className="mb-3">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-2">Host</p>
                        <div className="flex flex-wrap gap-3">
                            <FieldCheckbox label="Status" checked={selectedFields["status"]} onChange={() => toggleField("status")} />
                            <FieldCheckbox label="Address" checked={selectedFields["address"]} onChange={() => toggleField("address")} />
                            <FieldCheckbox label="Hostname" checked={selectedFields["hostname"]} onChange={() => toggleField("hostname")} />
                        </div>
                    </div>

                    <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-2">Port</p>
                        <div className="flex flex-wrap gap-3">
                            <FieldCheckbox label="Port ID" checked={selectedFields["portID"]} onChange={() => toggleField("portID")} />
                            <FieldCheckbox label="State" checked={selectedFields["state"]} onChange={() => toggleField("state")} />
                            <FieldCheckbox label="Service Name" checked={selectedFields["service_name"]} onChange={() => toggleField("service_name")} />
                            <FieldCheckbox label="Service Product" checked={selectedFields["service_product"]} onChange={() => toggleField("service_product")} />
                            <FieldCheckbox label="Service Version" checked={selectedFields["service_version"]} onChange={() => toggleField("service_version")} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const FieldCheckbox = (props: { label: string; checked: boolean; onChange: () => void }) => (
    <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer hover:text-slate-100 transition-colors">
        <input
            type="checkbox"
            checked={props.checked}
            onChange={props.onChange}
            className="rounded border-slate-600 bg-[#252836] text-indigo-500 focus:ring-indigo-500/20 focus:ring-offset-0 w-3.5 h-3.5"
        />
        {props.label}
    </label>
);

export default Tools;
