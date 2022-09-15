import { ExtensionContext, Uri, workspace } from "vscode";
import { propsFileName } from "../consts";


export async function writePropsFile(context: ExtensionContext, props: string) {
	if (!context.storageUri) throw ("No storageUri");
	const filePath = Uri.joinPath(context.storageUri, propsFileName);

	await workspace.fs.createDirectory(context.storageUri);
	await workspace.fs.writeFile(filePath, Buffer.from(props, "utf-8"));
}
export async function readPropsFile(context: ExtensionContext) {
	if (!context.storageUri) throw ("No storageUri");
	const filePath = Uri.joinPath(context.storageUri, propsFileName);

	return (await workspace.fs.readFile(filePath)).toString();
}