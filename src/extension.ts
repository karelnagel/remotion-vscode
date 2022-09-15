import * as vscode from 'vscode';
import { openBrowser } from './remotion/openBrowser';
import { RemotionViewProvider } from './RemotionViewProvider';

export function activate(context: vscode.ExtensionContext) {

	const provider = new RemotionViewProvider(context.extensionUri, context);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(RemotionViewProvider.viewType, provider));

	context.subscriptions.push(
		vscode.commands.registerCommand('remotion.selectIndexFile', async () => {
			await provider.selectIndexFile();
		}));
	context.subscriptions.push(
		vscode.commands.registerCommand('remotion.refreshComps', async () => {
			await provider.refreshComps();
		}));
	context.subscriptions.push(
		vscode.commands.registerCommand('remotion.setProps', async () => {
			await provider.setPropsFile();
		}));
	context.subscriptions.push(
		vscode.commands.registerCommand('remotion.newProps', async () => {
			await provider.newPropsFile();
		}));
	context.subscriptions.push(
		vscode.commands.registerCommand('remotion.deleteProps', async () => {
			await provider.deletePropsFile();
		}));
	context.subscriptions.push(
		vscode.commands.registerCommand('remotion.loadProps', async () => {
			await provider.loadProps();
		}));
	context.subscriptions.push(
		vscode.commands.registerCommand('remotion.startPreview', async () => {
			await provider.startPreview();
		}));
	context.subscriptions.push(
		vscode.commands.registerCommand('remotion.render', async () => {
			await provider.render();
		}));
	context.subscriptions.push(
		vscode.commands.registerCommand('remotion.openBrowser', async () => {
			await openBrowser();
		}));
	vscode.window.showInformationMessage("Remotion ready");
}
