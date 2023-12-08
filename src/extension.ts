import * as vscode from 'vscode';
import { commands, ExtensionContext } from "vscode";
import { parseXMLContent, verifyNmapFile } from './utils';
import { HelloWorldPanel } from "./panels/HelloWorldPanel";
import { NmapRunType } from './types';
import path from 'path';

export function activate(context: ExtensionContext) {
  const nmapWebView = commands.registerCommand("nmap-peek.visualize", () => {
    
    const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No Nmap file is open in the editor');
			return;
		}

		if(!verifyNmapFile(editor)) {
			return;
		}

		// Info about the whole scan
		const scan: NmapRunType | null = parseXMLContent(editor);

    const filePath = editor.document.fileName;
	const fileName = path.basename(filePath);

    const nmapData = editor.document.getText();

    if (scan === null) {
			vscode.window.showErrorMessage('Failed to parse XML content.');
			return;
		}

    HelloWorldPanel.render(context.extensionUri, nmapData, fileName);
  });

  context.subscriptions.push(nmapWebView);
}
