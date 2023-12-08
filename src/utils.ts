import * as vscode from 'vscode';
import { NmapRunType } from './types';
import { XMLParser } from 'fast-xml-parser';

/**
 * Verifies that the open file is XML and that it's a valid Nmap file
 * @param editor - The active VS code editor object
 * @returns {boolean} valid - True if nmap file / False if not
 */
export const verifyNmapFile = (editor: vscode.TextEditor): boolean => {
    const document = editor.document;
    const fileType = document.languageId;

    if (fileType !== 'xml') {
        vscode.window.showErrorMessage('Unsupported file format. Only .xml is currently supported');
        return false;
    }

    const content = document.getText();
    if (!content.includes('<nmaprun')) {
        vscode.window.showErrorMessage('Missing nmaprun XML attribute. Is this an Nmap file?');
        return false;
    }

    return true;
};

/**
 * Returns the parsed XML content to itterate on each host
 * @param editor - VSCode TextEditor object
 * @returns - Whole Nmap file passed
 */
export const parseXMLContent = (editor: vscode.TextEditor): NmapRunType | null => {
    const fileContent = editor.document.getText();
    const parsingOptions = {
        ignoreAttributes: false,
        ignoreNameSpace: false
    };
    const xmlParser = new XMLParser(parsingOptions);
    try {
        const parsedContent: NmapRunType = xmlParser.parse(fileContent);
        return parsedContent;
    } catch (error) {
        return null;
    }
};