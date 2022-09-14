import { getPropFiles } from "../props/getPropFiles";
import * as vscode from "vscode";
export async function inputPropsFile(context: vscode.ExtensionContext) {
	const propFiles = (await getPropFiles(context)).map(p => p.label);
	return await vscode.window.showInputBox({
		title: "Enter file name",
		validateInput: (value) => propFiles.includes(value) || propFiles.includes(`${value}.json`) ? "File already exists" : undefined
	});
}