import * as vscode from "vscode";

export async function inputPropsFile(propFiles: string[]) {
	return await vscode.window.showInputBox({
		title: "Enter file name",
		validateInput: (value) => propFiles.includes(value) || propFiles.includes(`${value}.json`) ? "File already exists" : undefined
	});
}