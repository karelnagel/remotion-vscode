import * as vscode from 'vscode';
import { getPropFiles } from '../props/getPropFiles';

export async function quickPropFile(context: vscode.ExtensionContext, selectedValue?: string, customOption?: boolean) {
	const quickPick = vscode.window.createQuickPick();
	quickPick.placeholder = "Select props file";
	const propFiles = await getPropFiles(context);
	const items = propFiles.map(p => ({ label: p.label, picked: p.label === selectedValue }));
	quickPick.items = customOption ?
		[{ label: "Path to props" }, ...items] : items;
	quickPick.onDidHide(() => quickPick.dispose());
	quickPick.show();

	quickPick.onDidChangeValue((value) => {
		if (customOption)
			quickPick.items = [{ label: `${value}.json` }, ...quickPick.items.slice(1)];
	});
	return new Promise<string>((resolve) => {
		quickPick.onDidChangeSelection(selection => {
			resolve(selection[0].label);
			quickPick.hide();
		});
	});
}