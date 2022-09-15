import * as vscode from 'vscode';

export async function quickPropFile(title: string, propFiles: string[], selectedValue?: string) {
	const quickPick = vscode.window.createQuickPick();
	quickPick.title = title;
	quickPick.placeholder = "Select props file";
	const items = propFiles.map(p => ({ label: p, picked: p === selectedValue }));
	quickPick.items =  items;
	quickPick.onDidHide(() => quickPick.dispose());
	quickPick.show();

	return new Promise<string>((resolve) => {
		quickPick.onDidChangeSelection(selection => {
			resolve(selection[0].label);
			quickPick.hide();
		});
	});
}