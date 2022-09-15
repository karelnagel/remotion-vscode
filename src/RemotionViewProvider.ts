import * as vscode from 'vscode';
import { PostType, States } from './consts';
import { getNonce } from './helpers/nonce';
import { deletePropsFile, readPropsFile, writePropsFile } from './helpers/propFiles';
import { inputPropsFile } from './quick/inputPropsFile';
import { quickComponent } from './quick/quickComponent';
import { quickPropFile } from './quick/quickPropFile';
import { selectFile } from './quick/selectFile';
import { getComps } from './remotion/getComps';
import { openBrowser } from './remotion/openBrowser';
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

		webviewView.webview.onDidReceiveMessage(async data => {
			vscode.window.showInformationMessage(data.type);
			switch (data.type) {
				case 'selectIndexFile':
					await this.selectIndexFile();
					break;
				case 'refreshComps':
					await this.refreshComps();
					break;
				case 'setPropsFile':
					await this.setPropsFile();
					break;
				case 'newPropsFile':
					await this.newPropsFile();
					break;
				case 'deletePropsFile':
					await this.deletePropsFile();
					break;
				case 'loadProps':
					await this.loadProps();
					break;
				case 'render':
					await this.render();
					break;
				case 'startPreview':
					await this.startPreview();
					break;
				case 'openBrowser':
					await openBrowser();
					break;

				case 'indexPath':
					this.postMessage("indexPath", await this.getState("indexPath"));
					break;
				case 'selectedPropFile':
					this.postMessage("selectedPropFile", await this.getState("selectedPropFile"));
					break;

				case 'readPropFile':
					this.postMessage("readPropFile", await this.readPropFile());
					break;
				case 'writePropFile':
					await this.writePropFile(data.value);
					break;
			}
		});
	}
	private async getEntryPoint() { return (await this.getState("indexPath")).split(vscode.workspace.workspaceFolders![0].name)[1]; }
	private async getPropsPath() { return vscode.Uri.joinPath(this._context.storageUri!, await this.getState("selectedPropFile")).path; }

	private async readPropFile() {
		return readPropsFile(this._context, await this.getState("selectedPropFile"));
	}
	private async writePropFile(data: string) {
		await writePropsFile(this._context, await this.getState("selectedPropFile"), data);
	}

	public postMessage(type: PostType, value: any) {
		if (!this._view) return;
		this._view.webview.postMessage({ type, value });
	}
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
		this.postMessage("indexPath", path);
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
		const fileName = (await inputPropsFile(await this.getPropFiles()))?.replace(".json", "") + ".json";
		const comp = await quickComponent("Load default props from component", await this.getState("compositions"), "Empty props");

		try {
			await this.setState("selectedPropFile", fileName);
			await this.writePropFile(JSON.stringify(comp?.defaultProps || {}, undefined, 2));
			this.postMessage("selectedPropFile", fileName);
			vscode.window.showInformationMessage('New props file created!');
		}
		catch (e) {
			vscode.window.showErrorMessage(e as string);
		}
	}

	public async setPropsFile() {
		const fileName = await quickPropFile("Select a prop file", await this.getPropFiles(), await this.getState("selectedPropFile"));
		await this.setState("selectedPropFile", fileName);
		this.postMessage("selectedPropFile", fileName);
	}
	public async deletePropsFile() {
		const fileName = await quickPropFile("Which file to delete?", await this.getPropFiles(), await this.getState("selectedPropFile"));

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
			await this.writePropFile(JSON.stringify(comps?.defaultProps || {}, undefined, 2));
			this.postMessage("readPropFile", await this.readPropFile());
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
				<p id="indexPath">sdfsdf</p>
				<p id="selectedPropFile"></p>
				<button id="selectIndexFile">Select index file</button>
				<button id="refreshComps">Refresh components</button>
				<div>
					<button id="setPropsFile">Set props file</button>
					<button id="newPropsFile">New props file</button>
					<button id="deletePropsFile">Delete props file</button>
					<button id="loadProps">Load props from Component</button>
				</div>
				<div>
					<button id="startPreview">Start preview</button>
					<button id="openBrowser">Open browser</button>
					<button id="render">Render</button>
				</div>
			
				<p>Change props</p>
				<textarea id="propFile"></textarea>

				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}
