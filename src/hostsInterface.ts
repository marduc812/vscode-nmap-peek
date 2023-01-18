import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { XMLParser } from 'fast-xml-parser';

// TBD: On hover show how many ports or the open ports

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

    // currently returns an empty promise
	getChildren(element?: Host): Thenable<any[]> {
			
		console.log(this.inputJsonNmap);
		
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
				ignoreAttributes : false,
				ignoreNameSpace: false
			};
			const parser = new XMLParser(parsingOptions);
			const jsonResult = parser.parse(text);

			return Promise.resolve(this.getNmapFromJson(jsonResult.nmaprun));
        } else {
            return Promise.resolve(this.getPortsFromHost(element.ports));
        }
	}

	private getJsonFromXml(xmlText: string): string {
		const parsingOptions = {
			ignoreAttributes : false,
			ignoreNameSpace: false
		};
		const parser = new XMLParser(parsingOptions);
		const jsonResult = parser.parse(xmlText);
		
		// verify that it's an nmap file and not a random xml
		if (!jsonResult.nmaprun) {
			vscode.window.showInformationMessage('Not a valid nmap file');
			return "";
		}

		return jsonResult;
	}

	private getNmapFromJson(jsonNmap: any): Host[] {
		if (!jsonNmap) {
			console.log('No input supplied');
			return [];
		}

		if (typeof(jsonNmap) === 'string') {
			jsonNmap = JSON.parse(jsonNmap);
		}

		let hosts = [];
		let hostOs = "";

		// there are more than 1 hosts in nmap, so it's an array
		if (jsonNmap.host.length) {
			hosts = jsonNmap.host.map((host: { address: { [x: string]: any; }; hostnames: { hostname: { [x: string]: any; }; }; status: { [x: string]: any; }; ports: { port: any[]; }; }) => {
				const hostIP = host.address["@_addr"];
				const hostName = host.hostnames && host.hostnames.hostname ? ` (${host.hostnames.hostname["@_name"]})` : "";
				const hostState = host.status["@_state"];
				let hostPorts = [];
	
				if (host.ports.port.length) {
					hostPorts = host.ports.port.map((port: { [x: string]: any; state: { [x: string]: any; }; service: { [x: string]: any; }; }) => {
						const portNumber = port["@_portid"];
						const protocol = port["@_protocol"];
						const portStatus = port.state["@_state"];
						const portName = port.service["@_name"];
						const portInfo = port.service["@_product"];
						const portVersion = port.service["@_version"];
						hostOs = port.service["@_ostype"];
						return new Port(portNumber,protocol, portStatus,portName, portInfo, portVersion, vscode.TreeItemCollapsibleState.None);
					});
				} else {
					console.log('here')
					return;
				}
				return new Host(hostIP,hostName,hostState,hostPorts, hostOs, vscode.TreeItemCollapsibleState.Collapsed);
			});
		} else {
		// Only one host, so the object is different
			const hostIP = jsonNmap.host.address["@_addr"];
			const hostName = jsonNmap.host.hostnames && jsonNmap.host.hostnames.hostname ? ` (${jsonNmap.host.hostnames.hostname["@_name"]})` : "";
			const hostState = jsonNmap.host.status["@_state"];
			
			let hostPorts = [];
			
			// many ports
			if (jsonNmap.host.ports.port && jsonNmap.host.ports.port.length) {
				hostPorts = jsonNmap.host.ports.port.map((port: { [x: string]: any; state: { [x: string]: any; }; service: { [x: string]: any; }; }) => {
					const portNumber = port["@_portid"];
					const protocol = port["@_protocol"];
					const portStatus = port.state["@_state"];
					const portName = port.service["@_name"];
					const portInfo = port.service["@_product"];
					const portVersion = port.service["@_version"];
					hostOs = port.service["@_ostype"];
					return new Port(portNumber,protocol, portStatus,portName, portInfo, portVersion, vscode.TreeItemCollapsibleState.None);
				});
				hosts.push(new Host(hostIP,hostName,hostState,hostPorts, hostOs, vscode.TreeItemCollapsibleState.Collapsed));
			} else {
				hosts.push(new Host(hostIP,hostName,hostState,[], hostOs, vscode.TreeItemCollapsibleState.Collapsed));
			}
		}
		return hosts;
	}


	private getPortsFromHost(jsonPorts: any): Port[] {
		if (!jsonPorts) {
			console.log('No input supplied');
			return [];
		}

		const hostPorts = jsonPorts.map((port: { [x: string]: any; state: { [x: string]: any; }; service: { [x: string]: any; }; }) => {
					const portNumber = port.portNumber;
					const portStatus = port.portStatus;
					const protocol = port.protocol;
					const portName = port.portName ? port.portName : "";
					const portInfo = port.portInfo ? port.portInfo : "";
					const portVersion = port.portVersion ? port.portInfo : "";
					return new Port(portNumber,protocol ,portStatus,portName, portInfo, portVersion, vscode.TreeItemCollapsibleState.None);
			});
		return hostPorts;
	}
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

		if (this.hostOs === 'Windows') 
			{	
				this.iconPath = {
					light: path.join(__filename, '..', '..', 'resources', 'light', 'windows.png'),
					dark: path.join(__filename, '..', '..', 'resources', 'dark', 'windows.png')
				};
			}
			else if(this.hostOs === 'Linux') {
				this.iconPath = {
					light: path.join(__filename, '..', '..', 'resources', 'light', 'linux.png'),
					dark: path.join(__filename, '..', '..', 'resources', 'dark', 'linux.png')
				};
			} 
			else if(this.hostOs === 'Mac OS X') {
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

		//console.log(`Number: ${portNumber}, Status: ${portStatus}, Verions: ${portName}, Protocol: ${protocol}, Port Info: ${portInfo}, Port Version: ${portversion}`);
		
		this.tooltip = ` ${this.protocol}`;
		this.description = `${this.portName} ${this.portInfo} ${this.portversion}`;

		if (this.portStatus === 'open') 
			{	
				this.iconPath = {
					light: path.join(__filename, '..', '..', 'resources', 'light', 'open.png'),
					dark: path.join(__filename, '..', '..', 'resources', 'dark', 'open.png')
				};
			}
			else if(this.portStatus === 'filtered') {
				this.iconPath = {
					light: path.join(__filename, '..', '..', 'resources', 'light', 'filtered.png'),
					dark: path.join(__filename, '..', '..', 'resources', 'dark', 'filtered.png')
				};
			} 
			else if(this.portStatus === 'closed') {
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