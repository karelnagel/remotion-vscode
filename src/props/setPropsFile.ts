import * as vscode from 'vscode';
import { quickPropFile } from '../quick/quickPropFile';

export async function setPropsFile(context: vscode.ExtensionContext, propFile: string) {

	context.workspaceState.update("selectedProps", propFile);
}

export function getPropsFile(context: vscode.ExtensionContext) {
	return context.workspaceState.get("selectedProps") as string;
}