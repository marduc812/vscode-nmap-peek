import * as vscode from 'vscode';
import { Host, HostProvider } from './hostsInterface';
// eslint-disable-next-line @typescript-eslint/naming-convention
const { XMLParser } = require('fast-xml-parser');
const path = require('path');

export function activate(context: vscode.ExtensionContext) {

	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showInformationMessage('Editor not found');
		return;
	}
	const fileName = editor.document.fileName;
	const fileExtension = path.extname(fileName).slice(1);
	const nmapExtensions = ['xml', 'nmap', 'gnmap'];

	if (nmapExtensions.includes(fileExtension)) {
		const text = editor.document.getText();
		const parsingOptions = {
			ignoreAttributes : false,
			ignoreNameSpace: false
		};
		const parser = new XMLParser(parsingOptions);
		const jsonResult = parser.parse(text);
		
		
		// verify that it's an nmap file and not a random xml
		if (!jsonResult.nmaprun) {
			vscode.window.showInformationMessage('Not a valid nmap file');
			return;
		}

		const hosts = jsonResult.nmaprun.host;
		const hostProvider = new HostProvider(hosts);
		vscode.window.registerTreeDataProvider('nmapViewer',hostProvider);
		vscode.commands.registerCommand("nmapViewer.refresh", () =>
			hostProvider.refresh()
        );
	}
}

// This method is called when your extension is deactivated
export function deactivate() {
}


//[undefined_publisher.nmap-peek]: View container 'package-explorer' does not exist and all views registered to it will be added to 'Explorer'.