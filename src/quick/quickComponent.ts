import { getIndexPath } from "../helpers/getIndexPath";
import { getComps } from "../remotion/getComps";
import * as vscode from 'vscode';
import { TCompMetadata } from "remotion";

export async function quickComponent(title: string, defaultValue?: string) {
	const quickpick = vscode.window.createQuickPick();
	quickpick.title = title;
	quickpick.placeholder = "Loading...";
	quickpick.items = defaultValue ? [{ label: defaultValue }] : [];
	quickpick.onDidHide(() => quickpick.dispose());
	quickpick.show();

	const comps = await getComps(await getIndexPath());
	quickpick.placeholder = "Select component";
	quickpick.items = [...quickpick.items, ...comps.map(c => ({ label: c.id }))];

	return new Promise<TCompMetadata | undefined>((resolve) => {

		quickpick.onDidChangeSelection(selection => {
			resolve(comps.find(c => c.id === selection[0].label));
			quickpick.hide();
		});
	});
}