import * as vscode from 'vscode';
import * as path from 'path';
import { XMLParser } from 'fast-xml-parser';



export class HostProvider implements vscode.TreeDataProvider<Host> {

	private _onDidChangeTreeData: vscode.EventEmitter<Host | undefined | void> = new vscode.EventEmitter<Host | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<Host | undefined | void> = this._onDidChangeTreeData.event;
	data: Host[] = [];

	constructor(private inputJsonNmap: string | undefined) {
		//this.data = this.getNmapFromJson(inputJsonNmap);
	}

	public refresh(): void {
		this._onDidChangeTreeData.fire(undefined);
	}

	getTreeItem(element: Host): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Host): Thenable<any[]> {

		if (!this.inputJsonNmap) {
			vscode.window.showInformationMessage('No host found in nmap file');
			return Promise.resolve([]);
		}

		if (element === undefined) {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showInformationMessage('Editor not found');
				return Promise.resolve([]);
			}
			const text = editor.document.getText();
			const parsingOptions = {
				ignoreAttributes: false,
				ignoreNameSpace: false
			};
			const parser = new XMLParser(parsingOptions);
			const jsonResult = parser.parse(text);

			return Promise.resolve(this.getNmapFromJson(jsonResult.nmaprun));
		} else {
			return Promise.resolve(this.getPortsFromHost(element.ports));
		}
	}

	private getNmapFromJson(jsonNmap: any): Host[] {
		if (!jsonNmap) {
			vscode.window.showInformationMessage('Invalid nmap file or no hosts found.');
			return [];
		}

		if (typeof (jsonNmap) === 'string') {
			jsonNmap = JSON.parse(jsonNmap);
		}

		let hosts = [];
		let hostOs = "";

		// there are more than 1 hosts in nmap, so it's an array
		if (Array.isArray(jsonNmap.host)) {
			hosts = jsonNmap.host.map((host: {
				os: any; address: { [x: string]: any; }; hostnames: { hostname: { [x: string]: any; }; }; status: { [x: string]: any; }; ports: { port: any[]; };
			}) => {
				let hostIp = "";
				if (host.address.length > 1) {
					host.address.forEach((address: { [x: string]: any; }) => {
						if (address["@_addrtype"] === "ipv4") {
							hostIp = address["@_addr"];
						}
					});
				} else {
					hostIp = host.address["@_addr"];
				}


				// parse both hostnames in case we have more than 1
				// example xml:
				//<address addr="10.10.10.10" addrtype="ipv4"/>
				// <hostnames>
				// <hostname name="hostname.local" type="user"/>
				// <hostname name="hostname.local" type="PTR"/>
				// </hostnames>
				let hostName: string = "";
				if (Array.isArray(host.hostnames.hostname)) {
					// eslint-disable-next-line @typescript-eslint/naming-convention
					host.hostnames.hostname.forEach((hostname: { '@_name': string, '@_type': string }) => {
						if (hostName === "") {
							hostName = hostname["@_name"];
						} else {
							if (hostname["@_name"] !== hostName) {
								hostName = hostName + ", " + hostname["@_name"];
							}
						}
					});
				} else {
					hostName = host.hostnames && host.hostnames.hostname && host.hostnames.hostname["@_name"] ? ` (${host.hostnames.hostname["@_name"]})` : "";
				}


				const hostState = host.status["@_state"];

				hostOs = host.os && host.os.osmatch && host.os.osmatch.osclass && host.os.osmatch.osclass['@_type'] ? host.os.osmatch.osclass['@_type'] : "";

				let hostPorts = [];


				// there are open ports
				if (host.ports && host.ports.port) {
					if (Array.isArray(host.ports.port)) {
						hostPorts = host.ports.port.map(portFromHost);
					} else {
						hostPorts = [portFromHost(host.ports.port)];
					}
				} else {
					// There are no ports found at all, so return just the host with empty ports array
					return new Host(hostIp, hostName, hostState, [], hostOs, vscode.TreeItemCollapsibleState.None);
				}
				return new Host(hostIp, hostName, hostState, hostPorts, hostOs, vscode.TreeItemCollapsibleState.Collapsed);
			});
		} else {
			// Only one host, so the object is different
			const hostIP = jsonNmap.host.address["@_addr"];
			const hostName = jsonNmap.host.hostnames && jsonNmap.host.hostnames.hostname && jsonNmap.host.hostnames.hostname["@_name"] ? ` (${jsonNmap.host.hostnames.hostname["@_name"]})` : "";
			
			const hostState = jsonNmap.host.status["@_state"];

			hostOs = jsonNmap.host.os && jsonNmap.host.os.osmatch && jsonNmap.host.os.osmatch.osclass && jsonNmap.host.os.osmatch.osclass['@_type'] ? jsonNmap.host.os.osmatch.osclass['@_type'] : "";

			let hostPorts = [];

			// many ports
			if (jsonNmap.host.ports && jsonNmap.host.ports.port) {

				if (Array.isArray(jsonNmap.host.ports.port)) {
					hostPorts = jsonNmap.host.ports.port.map(portFromHost);
				} else {
					hostPorts = [portFromHost(jsonNmap.host.ports.port)];
				}
				hosts.push(new Host(hostIP, hostName, hostState, hostPorts, hostOs, vscode.TreeItemCollapsibleState.Collapsed));
			} else {
				hosts.push(new Host(hostIP, hostName, hostState, [], hostOs, vscode.TreeItemCollapsibleState.None));
			}
		}
		return hosts;
	}


	private getPortsFromHost(jsonPorts: any): Port[] {
		if (!jsonPorts) {
			console.log('No ports supplied');
			return [];
		}

		const hostPorts = jsonPorts.map((port: { [x: string]: any; state: { [x: string]: any; }; service: { [x: string]: any; }; }) => {
			const portNumber = port.portNumber;
			const portStatus = port.portStatus;
			const protocol = port.protocol;
			const portName = port.portName ? port.portName : "";
			const portInfo = port.portInfo ? port.portInfo : "";
			const portVersion = port.portVersion ? port.portInfo : "";
			return new Port(portNumber, protocol, portStatus, portName, portInfo, portVersion, vscode.TreeItemCollapsibleState.None);
		});
		return hostPorts;
	}
}

// creates the port object
const portFromHost = (hostPort: any) => {
	const portNumber = hostPort["@_portid"];
	const protocol = hostPort["@_protocol"];
	const portStatus = hostPort.state["@_state"];
	const portName = hostPort.service?.["@_name"] ?? '';
	const portInfo = hostPort.service?.["@_product"] ?? '';
	const portVersion = hostPort.service?.["@_version"] ?? '';
	return new Port(portNumber, protocol, portStatus, portName, portInfo, portVersion, vscode.TreeItemCollapsibleState.None);
}

export class Host extends vscode.TreeItem {

	children: Port[] | undefined;

	constructor(
		public readonly hostIP: string, //label
		public readonly hostName: string, //version
		public readonly status: string, //version
		public readonly ports: Port[],
		public readonly hostOs: string, //
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(hostIP, collapsibleState);
		this.tooltip = `${this.ports.length} ports`;
		this.description = this.hostName;

		if (this.hostOs === 'Windows') {
			this.iconPath = {
				light: path.join(__filename, '..', '..', 'resources', 'light', 'windows.png'),
				dark: path.join(__filename, '..', '..', 'resources', 'dark', 'windows.png')
			};
		}
		else if (this.hostOs === 'Linux') {
			this.iconPath = {
				light: path.join(__filename, '..', '..', 'resources', 'light', 'linux.png'),
				dark: path.join(__filename, '..', '..', 'resources', 'dark', 'linux.png')
			};
		}
		else if (this.hostOs === 'Mac OS X') {
			this.iconPath = {
				light: path.join(__filename, '..', '..', 'resources', 'neutral', 'apple.png'),
				dark: path.join(__filename, '..', '..', 'resources', 'neutral', 'apple.png')
			};
		} else {
			this.iconPath = {
				light: path.join(__filename, '..', '..', 'resources', 'light', 'server.png'),
				dark: path.join(__filename, '..', '..', 'resources', 'dark', 'server.png')
			};
		}
	}
	contextValue = 'host';
}

export class Port extends vscode.TreeItem {
	constructor(
		public readonly portNumber: string,
		public readonly protocol: string,
		public readonly portStatus: string,
		public readonly portName: string,
		public readonly portInfo: string,
		public readonly portversion: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(`${portNumber}`, collapsibleState);

		const tooltip = `${this.protocol}`;

		this.tooltip = tooltip;
		this.description = `${this.portName} ${this.portInfo} ${this.portversion}`;

		if (this.portStatus === 'open') {
			this.iconPath = {
				light: path.join(__filename, '..', '..', 'resources', 'light', 'open.png'),
				dark: path.join(__filename, '..', '..', 'resources', 'dark', 'open.png')
			};
		}
		else if (this.portStatus === 'filtered') {
			this.iconPath = {
				light: path.join(__filename, '..', '..', 'resources', 'light', 'filtered.png'),
				dark: path.join(__filename, '..', '..', 'resources', 'dark', 'filtered.png')
			};
		}
		else if (this.portStatus === 'closed') {
			this.iconPath = {
				light: path.join(__filename, '..', '..', 'resources', 'light', 'closed.png'),
				dark: path.join(__filename, '..', '..', 'resources', 'dark', 'closed.png')
			};
		} else {
			this.iconPath = {
				light: path.join(__filename, '..', '..', 'resources', 'neutral', 'unknown.png'),
				dark: path.join(__filename, '..', '..', 'resources', 'neutral', 'unknown.png')
			};
		}
	}
	contextValue = 'port';
}