import { TCompMetadata } from "remotion";
import { window } from "vscode";

export async function quickComponent(title: string, comps: TCompMetadata[], defaultValue?: string) {
	const selected = await window.showQuickPick(
		defaultValue ? [{ label: defaultValue }, ...comps.map(c => ({ label: c.id }))] : comps.map(c => ({ label: c.id })),
		{ placeHolder: "Select component", title });
	return comps.find(c => c.id === selected?.label);
}