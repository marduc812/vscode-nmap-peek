import * as assert from 'assert';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

suite('Extension Test Suite', function () {
    this.timeout(10000); 

    vscode.window.showInformationMessage('Start all tests.');

    const testFilesPath = path.join(__dirname, '../../../test-scan-files');
    const files = fs.readdirSync(testFilesPath);

    files.forEach(file => {
        test(`Test for file: ${file}`, async () => {
            const filePath = path.join(testFilesPath, file);
            const document = await vscode.workspace.openTextDocument(filePath);
            await vscode.window.showTextDocument(document);

            assert.strictEqual(document.languageId, 'xml', `File ${file} should be an XML file`);

            await vscode.commands.executeCommand('nmap-peek.visualize');

            await new Promise(resolve => setTimeout(resolve, 5000)); // Delay for 5000 milliseconds
            await vscode.commands.executeCommand('workbench.action.closeAllEditors');
        });
    });
});
