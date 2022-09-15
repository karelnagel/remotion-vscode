import { window } from "vscode";

export async function quickPresets(title: string, propFiles: string[], customValue?: boolean) {
	const quickPick = window.createQuickPick();
	quickPick.title = title;
	quickPick.placeholder = "Select props file";
	const items = propFiles.map(p => ({ label: p }));
	quickPick.items = customValue ? [{ label: "Select saved or create new" }, ...items] : items;
	quickPick.onDidHide(() => quickPick.dispose());

	quickPick.onDidChangeValue(value => {
		if (customValue) {
			quickPick.items = [{ label: value }, ...items.slice(1)];
		}
	});
	quickPick.show();

	return new Promise<string>((resolve) => {
		quickPick.onDidChangeSelection(selection => {
			resolve(selection[0].label);
			quickPick.hide();
		});
	});
}