import * as vscode from 'vscode';

export async function getPropFiles(context: vscode.ExtensionContext) {
	if (!context.storageUri) return [];
	return (await vscode.workspace.fs.readDirectory(context.storageUri)).map(p => ({ label: p[0] }));
}