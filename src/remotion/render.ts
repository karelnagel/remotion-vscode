import { window } from "vscode";

export async function render(entryPoint: string, comp: string, props: string) {
	const terminal = window.createTerminal("Render");
	terminal.sendText(`npx remotion render ${entryPoint} ${comp} --props="${props}"`, true);
	terminal.show();
}