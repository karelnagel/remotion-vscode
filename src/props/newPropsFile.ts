import * as vscode from 'vscode';
import { inputPropsFile } from '../quick/inputPropsFile';
import { quickComponent } from '../quick/quickComponent';

export async function newPropsFile(context: vscode.ExtensionContext, fileName?: string, props?: any) {
	if (!context.storageUri) throw ("No storageUri");
	if (!fileName) throw ("No fileName");

	await vscode.workspace.fs.createDirectory(context.storageUri);
	const filePath = vscode.Uri.joinPath(context.storageUri, fileName.replace(".json", "") + ".json");
	await vscode.workspace.fs.writeFile(filePath, new TextEncoder().encode(JSON.stringify(props ?? {})));
}