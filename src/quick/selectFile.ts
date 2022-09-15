import * as vscode from 'vscode';

export async function selectFile() {
	return await vscode.window.showOpenDialog({
		title: "Select remotion index file"
	});

}