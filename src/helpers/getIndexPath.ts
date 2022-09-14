import { workspace } from "vscode";

export async function getIndexPath() {
	return `${workspace.workspaceFolders?.[0].uri.fsPath}/src/index.tsx`;
}

export async function getIndexRelativePath() {
	return `src/index.tsx`;
}
