import { window } from "vscode";

export async function startPreview(entryPoint: string, props: string) {
	const terminal = window.createTerminal("Remotion Preview");

	terminal.sendText(`npx remotion preview ${entryPoint} --props=${props}`, true);
	terminal.show();
}