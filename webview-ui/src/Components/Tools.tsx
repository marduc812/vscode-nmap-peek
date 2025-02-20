import React, { useState } from "react";
import { copyToClip, extractURLs, getAddresses, getCPE, getHostnames, getHostPorts, getScripts } from "../utilities/utils";
import { VscCopy, VscLink, VscSymbolKeyword, VscJson, VscTable, VscSettingsGear } from "react-icons/vsc";
import { HostType, PortScriptType } from "../utilities/types";

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
    
                    // Apply selectedFields filter to port data
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
                                        portData.service = portData.service || {}; // Initialize if needed
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
            const addresses = Array.isArray(host.address) ? host.address : [host.address]; // Normalize addresses
            const portsArray = host.ports && host.ports.port ? (Array.isArray(host.ports.port) ? host.ports.port : [host.ports.port]) : []; // Normalize ports

            if (portsArray.length > 0) { // Check if there are any ports
                portsArray.forEach(port => {
                    const row = fields.map(field => {
                        let value;

                        switch (field) { // Use a switch for cleaner code
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
            } else { // Handle hosts without ports
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
        `flex flex-row items-center p-2 m-2 rounded hover:bg-gray-700 hover:cursor-pointer hover:text-gray-200 ${
            selectedTool === tool ? "bg-green-500 text-white" : "bg-gray-800 text-gray-400"
        }`;


    const showSettings = () => {
        setSettingsVisible(!settingsVisible);
    };

    return (
        <div>
            <div className="text-gray-400 flex flex-row items-center justify-between w-full">
                <div className="flex flex-row justify-center flex-grow items-center">
                    <h1 className="text-2xl text-white mx-5">Extract</h1>

                    <div className={getButtonClass("urls")} onClick={() => handleSelection("urls", getUrls)}>
                        <VscLink className="text-xl mr-2" />
                        <h2 className="text-md">URLs</h2>
                    </div>

                    <div className={getButtonClass("hostPort")} onClick={() => handleSelection("hostPort", extractHostPort)}>
                        <VscSymbolKeyword className="text-xl mr-2" />
                        <h2 className="text-md">host:port</h2>
                    </div>

                    <div className="min-h-[1em] w-px self-stretch bg-gradient-to-tr from-transparent via-neutral-500 to-transparent opacity-25 dark:via-neutral-400 mx-2"></div>

                    <div className="flex flex-row justify-center items-center">
                        <h1 className="text-2xl text-white mx-5">Export</h1>

                        <div className={getButtonClass("json")} onClick={() => handleSelection("json", exportAsJson)}>
                            <VscJson className="text-xl mr-2" />
                            <h2 className="text-md">JSON</h2>
                        </div>

                        <div className={getButtonClass("csv")} onClick={() => handleSelection("csv", exportAsCSV)}>
                            <VscTable className="text-xl mr-2" />
                            <h2 className="text-md">CSV</h2>
                        </div>

                        <div className={getButtonClass("settings")} onClick={() => handleSelection("settings", showSettings)}>
                            <VscSettingsGear className="text-xl" />
                        </div>
                    </div>
                </div>
            </div>

            {selectedTool && (
                <div>
                    <div className="flex flex-row items-center justify-between">
                        <h4 className="text-gray-300 font-bold ml-5 text-xl text-green-300">Extracted</h4>
                        <div className="flex flex-row text-gray-300 items-center hover:text-gray-100 active:text-white hover:cursor-pointer mr-5"
                            onClick={() => copyToClip(text)}>
                            <VscCopy className="font-bold ml-5 text-xl mr-2" />
                            <h2>COPY</h2>
                        </div>
                    </div>

                    <div className="h-40 bg-gray-800 m-2 border rounded-md border-gray-700 max-w-full scripts-scrollbar p-2 overflow-auto">
                        <p className="whitespace-pre-wrap text-gray-200">{text}</p>
                    </div>
                </div>
            )}

            {settingsVisible && (
                <div className="p-4 bg-gray-900 rounded-md mt-2">
                    <h4 className="text-gray-300 font-bold text-xl text-green-300">Export Options</h4>
                    <div className="m-2 text-gray-100">
                        <h2 className="text-white font-bold text-xl">Host</h2>
                        <div className="grid grid-cols-5 grid-rows-1 gap-4 m-5">
                            <div className="flex flex-row">
                                <input type="checkbox" checked={selectedFields["status"]} onChange={() => toggleField("status")} />
                                <p className="ml-2">Status</p>
                            </div>
                            <div className="flex flex-row">
                                <input type="checkbox" checked={selectedFields["address"]} onChange={() => toggleField("address")} />
                                <p className="ml-2">Address</p>
                            </div>
                            <div className="flex flex-row">
                                <input type="checkbox" checked={selectedFields["hostname"]} onChange={() => toggleField("hostname")} />
                                <p className="ml-2">Hostname</p>
                            </div>
                        </div>
                    </div>

                    <div className="m-2 text-gray-100">
                        <h2 className="text-white font-bold text-xl">Post</h2>
                        <div className="grid grid-cols-5 grid-rows-2 gap-4 m-5">
                            <div className="flex flex-row">
                                <input type="checkbox" checked={selectedFields["portID"]} onChange={() => toggleField("portID")} />
                                <p className="ml-2">PortID</p>
                            </div>
                            <div className="flex flex-row">
                                <input type="checkbox" checked={selectedFields["state"]} onChange={() => toggleField("state")} />
                                <p className="ml-2">State</p>
                            </div>
                            <div className="flex flex-row">
                                <input type="checkbox" checked={selectedFields["service_name"]} onChange={() => toggleField("service_name")} />
                                <p className="ml-2">Service Name</p>
                            </div>
                            <div className="flex flex-row">
                                <input type="checkbox" checked={selectedFields["service_product"]} onChange={() => toggleField("service_product")} />
                                <p className="ml-2">Service Product</p>
                            </div>
                            <div className="flex flex-row">
                                <input type="checkbox" checked={selectedFields["service_version"]} onChange={() => toggleField("service_version")} />
                                <p className="ml-2">Service Version</p>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default Tools;
