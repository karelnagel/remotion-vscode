import { window } from "vscode";

export async function init() {
	const terminal = window.createTerminal("Create");
	terminal.sendText(`npm init video`, true);
	terminal.show();
}