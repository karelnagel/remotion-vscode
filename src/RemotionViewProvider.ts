import * as vscode from 'vscode';
import { getNonce } from './helpers/nonce';
import { newPropsFile } from './props/newPropsFile';
import { setPropsFile } from './props/setPropsFile';

export class RemotionViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'remotion.view';

	private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri,
		private readonly _context: vscode.ExtensionContext,
	) {

	}

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;
		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(data => {
			switch (data.type) {
				case 'startPreview':
					{
						this.startPreview();
						break;
					}
				case 'endPreview':
					{
						this.endPreview();
						break;
					}
				case 'openBrowser':
					{
						this.openBrowser();
						break;
					}
				case 'render':
					{
						this.render(data.id);
						break;
					}
				case 'newProps':
					{
						this.newPropsFile(data.fileName, data.props);
						break;
					}
			}
		});
	}

	public startPreview() {
		if (!this._view) return;

		this._view.show?.(true);
		vscode.window.showInformationMessage('Starting preview...');
		// Todo start preview
		this._view.webview.postMessage({ type: 'startPreview', success: true });

	}
	public endPreview() {
		if (!this._view) return;

		this._view.show?.(true);
		vscode.window.showInformationMessage('Ending preview...');

		// Todo stop preview
		this._view.webview.postMessage({ type: 'endPreview' });

	}

	public async newPropsFile(fileName?: string, props?: any) {
		if (!this._view) return;

		vscode.window.showInformationMessage('Creating new props file...');
		try {
			await newPropsFile(this._context, fileName, props);
			this._view.webview.postMessage({ type: 'newProps', fileName });
			vscode.window.showInformationMessage('New props file created!');
		}
		catch (e) {
			vscode.window.showErrorMessage(e as string);
		}
	}

	public async setPropsFile(fileName: string, props?: any) {
		if (!this._view) return;

		try {
			await setPropsFile(this._context, fileName);
			this._view.webview.postMessage({ type: 'newProps', fileName });
		}
		catch (e) {
			vscode.window.showErrorMessage(e as string);
		}
	}

	public openBrowser() {
		if (!this._view) return;

		this._view.show?.(true);
		vscode.window.showInformationMessage('Opening browser...');

		this._view.webview.postMessage({ type: 'preview' });

	}
	public render(id: string) {
		if (!this._view) return;

		this._view.show?.(true);
		vscode.window.showInformationMessage(`Starting a render with id: ${id}`);

		// Todo start rendering 
		this._view.webview.postMessage({ type: 'preview' });

	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));

		// Do the same for the stylesheet.
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));

		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleMainUri}" rel="stylesheet">
				
				<title>Cat Colors</title>
			</head>
			<body>
				<button class="add-color-button">Start preview</button>
			
				<p>Change props</p>
				<textarea ></textarea>

				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}
