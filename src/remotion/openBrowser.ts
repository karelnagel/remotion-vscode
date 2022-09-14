import * as vscode from 'vscode';

export async function openBrowser() {
	vscode.commands.executeCommand("simpleBrowser.show", ["http://localhost:3000"]);
}