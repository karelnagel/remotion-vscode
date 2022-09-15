import * as vscode from 'vscode';

export async function quickPropFile(title: string, propFiles: string[], selectedValue?: string, customOption?: boolean) {
	const quickPick = vscode.window.createQuickPick();
	quickPick.title = title;
	quickPick.placeholder = "Select props file";
	const items = propFiles.map(p => ({ label: p, picked: p === selectedValue }));
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