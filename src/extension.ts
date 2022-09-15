import { commands, ExtensionContext, window } from 'vscode';
import { openBrowser } from './remotion/openBrowser';
import { RemotionViewProvider } from './RemotionViewProvider';

export function activate(context: ExtensionContext) {

	const provider = new RemotionViewProvider(context.extensionUri, context);

	context.subscriptions.push(
		window.registerWebviewViewProvider(RemotionViewProvider.viewType, provider));

	context.subscriptions.push(
		commands.registerCommand('remotion.init', async () => {
			await provider.init();
		}));
	context.subscriptions.push(
		commands.registerCommand('remotion.selectIndexFile', async () => {
			await provider.selectIndexFile();
		}));
	context.subscriptions.push(
		commands.registerCommand('remotion.refreshComps', async () => {
			await provider.refreshComps();
		}));
	context.subscriptions.push(
		commands.registerCommand('remotion.savePreset', async () => {
			await provider.savePreset();
		}));
	context.subscriptions.push(
		commands.registerCommand('remotion.loadPreset', async () => {
			await provider.loadPreset();
		}));
	context.subscriptions.push(
		commands.registerCommand('remotion.deletePreset', async () => {
			await provider.deletePreset();
		}));
	context.subscriptions.push(
		commands.registerCommand('remotion.loadProps', async () => {
			await provider.loadProps();
		}));
	context.subscriptions.push(
		commands.registerCommand('remotion.startPreview', async () => {
			await provider.startPreview();
		}));
	context.subscriptions.push(
		commands.registerCommand('remotion.render', async () => {
			await provider.render();
		}));
	context.subscriptions.push(
		commands.registerCommand('remotion.openBrowser', async () => {
			await openBrowser();
		}));
	window.showInformationMessage("Remotion ready");
}
