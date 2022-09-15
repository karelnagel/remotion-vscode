import * as vscode from 'vscode';

export async function writePropsFile(context: vscode.ExtensionContext, fileName?: string, props?: any) {
	if (!context.storageUri) throw ("No storageUri");
	if (!fileName) throw ("No fileName");

	await vscode.workspace.fs.createDirectory(context.storageUri);
	const filePath = vscode.Uri.joinPath(context.storageUri, fileName.replace(".json", "") + ".json");
	await vscode.workspace.fs.writeFile(filePath, new TextEncoder().encode(JSON.stringify(props ?? {})));
}
export async function deletePropsFile(context: vscode.ExtensionContext, fileName?: string) {
	if (!context.storageUri) throw ("No storageUri");
	if (!fileName) throw ("No fileName");

	const filePath = vscode.Uri.joinPath(context.storageUri, fileName.replace(".json", "") + ".json");
	await vscode.workspace.fs.delete(filePath);
}