import { getCompositions } from '@remotion/renderer';
import * as vscode from 'vscode';
import { getIndexRelativePath } from './helpers/getIndexPath';
import { openBrowser } from './remotion/openBrowser';
import { getPropsFile } from './props/setPropsFile';
import { startPreview } from './remotion/startPreview';
import { RemotionViewProvider } from './RemotionViewProvider';
import { quickComponent } from './quick/quickComponent';
import { inputPropsFile } from './quick/inputPropsFile';
import { quickPropFile } from './quick/quickPropFile';

export function activate(context: vscode.ExtensionContext) {

	const provider = new RemotionViewProvider(context.extensionUri, context);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(RemotionViewProvider.viewType, provider));

	context.subscriptions.push(
		vscode.commands.registerCommand('remotion.startPreview', async () => {
			await startPreview(await getIndexRelativePath(), "props.json");
		}));
	context.subscriptions.push(
		vscode.commands.registerCommand('remotion.openBrowser', async () => {
			await openBrowser();
		}));
	context.subscriptions.push(
		vscode.commands.registerCommand('remotion.setProps', async () => {
			const propFile = await quickPropFile(context, getPropsFile(context), true);

			await provider.setPropsFile(propFile);
		}));
	context.subscriptions.push(
		vscode.commands.registerCommand('remotion.newProps', async () => {
			const fileName = await inputPropsFile(context);
			const comp = await quickComponent("Load default props from component", "Empty props");
			await provider.newPropsFile(fileName, comp?.defaultProps);
		}));

	context.subscriptions.push(
		vscode.commands.registerCommand('remotion.render', async () => {
			const comp = await quickComponent("Select composition to render");
			if (!comp) return;
			provider.render(comp.id);

		}));
	vscode.window.showInformationMessage("Remotion ready");
}
