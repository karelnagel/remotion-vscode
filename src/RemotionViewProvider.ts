import * as vscode from 'vscode';
import { States } from './consts';
import { getNonce } from './helpers/nonce';
import { deletePropsFile, writePropsFile } from './helpers/propFiles';
import { inputPropsFile } from './quick/inputPropsFile';
import { quickComponent } from './quick/quickComponent';
import { quickPropFile } from './quick/quickPropFile';
import { selectFile } from './quick/selectFile';
import { getComps } from './remotion/getComps';
import { render } from './remotion/render';
import { startPreview } from './remotion/startPreview';

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

			}
		});
	}
	private async getEntryPoint() { return (await this.getState("indexPath")).split(vscode.workspace.workspaceFolders![0].name)[1]; }
	private async getPropsPath() { return vscode.Uri.joinPath(this._context.storageUri!, await this.getState("selectedPropFile")).path; }

	private async getState<T = string>(key: States) {
		return (await this._context.workspaceState.get(key)) as T;
	}
	private async setState(key: States, value: any) {
		await this._context.workspaceState.update(key, value);
	}
	private async getPropFiles() {
		if (!this._context.storageUri) return [];
		return (await vscode.workspace.fs.readDirectory(this._context.storageUri))
			.map(p => p[0]);
	}

	public async selectIndexFile() {
		const files = await selectFile();
		if (!files) return;

		const path = files[0].fsPath;
		this.setState("indexPath", path);
		vscode.window.showInformationMessage(`Index file set to ${path}`);
		return path;
	}

	public async refreshComps() {
		if (!this._view) return;
		const indexPath = await this.getState("indexPath");
		if (!indexPath) return vscode.window.showErrorMessage("No index file selected");
		try {
			const comps = await getComps(indexPath);
			await this.setState("compositions", comps);
			vscode.window.showInformationMessage(`Found ${comps.length} compositions`);
		}
		catch (e) {
			vscode.window.showErrorMessage(e as string);
		}
	}

	public async newPropsFile() {
		const fileName = await inputPropsFile(await this.getPropFiles());
		const comp = await quickComponent("Load default props from component", await this.getState("compositions"), "Empty props");

		try {
			await writePropsFile(this._context, fileName, comp?.defaultProps);
			vscode.window.showInformationMessage('New props file created!');
		}
		catch (e) {
			vscode.window.showErrorMessage(e as string);
		}
	}

	public async setPropsFile() {
		const fileName = await quickPropFile("Select a prop file", await this.getPropFiles(), await this.getState("selectedPropFile"), true);

		try {
			await this.setState("selectedPropFile", fileName);
		}
		catch (e) {
			vscode.window.showErrorMessage(e as string);
		}
	}
	public async deletePropsFile() {
		const fileName = await quickPropFile("Which file to delete?", await this.getPropFiles(), await this.getState("selectedPropFile"), false);

		try {
			await deletePropsFile(this._context, fileName);
		}
		catch (e) {
			vscode.window.showErrorMessage(e as string);
		}
	}
	public async loadProps() {
		const fileName = await this.getState("selectedPropFile");
		const comps = await quickComponent(`Select component props for ${fileName}`, await this.getState("compositions"));

		try {
			await writePropsFile(this._context, fileName, comps?.defaultProps);
		}
		catch (e) {
			vscode.window.showErrorMessage(e as string);
		}
	}

	public async startPreview() {
		vscode.window.showInformationMessage('Starting preview...');

		startPreview(await this.getEntryPoint(), await this.getPropsPath());
	}
	public async render() {
		const comp = await quickComponent("Select composition", await this.getState("compositions"));
		if (!comp) return;
		render(await this.getEntryPoint(), comp.id, await this.getPropsPath());
		vscode.window.showInformationMessage(`Starting a render with id: `);
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
