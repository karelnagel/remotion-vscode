import * as vscode from 'vscode';

export async function writePropsFile(context: vscode.ExtensionContext, fileName: string, props: string) {
	if (!context.storageUri) throw ("No storageUri");

	await vscode.workspace.fs.createDirectory(context.storageUri);
	const filePath = vscode.Uri.joinPath(context.storageUri, fileName.replace(".json", "") + ".json");
	vscode.window.showInformationMessage(props);
	await vscode.workspace.fs.writeFile(filePath, Buffer.from(props, "utf-8"));
}
export async function deletePropsFile(context: vscode.ExtensionContext, fileName?: string) {
	if (!context.storageUri) throw ("No storageUri");
	if (!fileName) throw ("No fileName");

	const filePath = vscode.Uri.joinPath(context.storageUri, fileName);
	await vscode.workspace.fs.delete(filePath);
}
export async function readPropsFile(context: vscode.ExtensionContext, fileName?: string) {
	if (!context.storageUri) throw ("No storageUri");
	if (!fileName) throw ("No fileName");

	const filePath = vscode.Uri.joinPath(context.storageUri, fileName);
	return (await vscode.workspace.fs.readFile(filePath)).toString();
}