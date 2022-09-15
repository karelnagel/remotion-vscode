import { CancellationToken, ExtensionContext, Uri, Webview, WebviewView, WebviewViewProvider, WebviewViewResolveContext, window, workspace } from 'vscode';
import { PostType, Preset, propsFileName, States } from './consts';
import { getNonce } from './helpers/nonce';
import { readPropsFile, writePropsFile } from './helpers/propFiles';
import { quickComponent } from './quick/quickComponent';
import { quickPresets } from './quick/quickPropFile';
import { selectFile } from './quick/selectFile';
import { getComps } from './remotion/getComps';
import { openBrowser } from './remotion/openBrowser';
import { render } from './remotion/render';
import { startPreview } from './remotion/startPreview';

export class RemotionViewProvider implements WebviewViewProvider {

	public static readonly viewType = 'remotion.view';

	private _view?: WebviewView;

	constructor(
		private readonly _extensionUri: Uri,
		private readonly _context: ExtensionContext,
	) {

	}

	public resolveWebviewView(
		webviewView: WebviewView,
		context: WebviewViewResolveContext,
		_token: CancellationToken,
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
			window.showInformationMessage(data.type);
			switch (data.type) {
				case 'selectIndexFile':
					await this.selectIndexFile();
					break;
				case 'refreshComps':
					await this.refreshComps();
					break;
				case 'savePreset':
					await this.savePreset();
					break;
				case 'loadPreset':
					await this.loadPreset();
					break;
				case 'deletePreset':
					await this.deletePreset();
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

				case 'readPropFile':
					this.postMessage("readPropFile", await this.readPropFile());
					break;
				case 'writePropFile':
					await this.writePropFile(data.value);
					break;
			}
		});
	}
	private async getEntryPoint() { return (await this.getState("indexPath")).split(workspace.workspaceFolders![0].name)[1]; }
	private async getPropsPath() { return Uri.joinPath(this._context.storageUri!, propsFileName).path; }

	private async readPropFile() {
		return readPropsFile(this._context);
	}
	private async writePropFile(data: string) {
		await writePropsFile(this._context, data);
	}

	public postMessage(type: PostType, value: any) {
		if (!this._view) return;
		this._view.webview.postMessage({ type, value });
	}
	private async getState<T = string>(key: States) {
		return (await this._context.workspaceState.get(key)) as T;
	}
	private async setState<T = any>(key: States, value: T | undefined) {
		await this._context.workspaceState.update(key, value);
	}
	private async getPresets() {
		return await this.getState<Preset[]>("presets") || [];
	}

	public async selectIndexFile() {
		const files = await selectFile();
		if (!files) return;

		const path = files[0].fsPath;
		this.setState("indexPath", path);
		this.postMessage("indexPath", path);
		window.showInformationMessage(`Index file set to ${path}`);
		return path;
	}

	public async refreshComps() {
		if (!this._view) return;
		const indexPath = await this.getState("indexPath");
		if (!indexPath) return window.showErrorMessage("No index file selected");
		try {
			const comps = await getComps(indexPath);
			await this.setState("compositions", comps);
			window.showInformationMessage(`Found ${comps.length} compositions`);
		}
		catch (e) {
			window.showErrorMessage(e as string);
		}
	}

	public async savePreset() {
		const presets = await this.getPresets();
		const presetName = await quickPresets("Select preset", presets.map(p => p.name), true);
		await this.setState<Preset[]>("presets",
			[
				{ name: presetName, props: await this.readPropFile() },
				...presets.filter(p => p.name !== presetName)
			]);
	}

	public async loadPreset() {
		const presets = await this.getState<Preset[]>("presets");
		const presetName = await quickPresets("Select a preset", presets.map(p => p.name));
		const preset = presets.find(p => p.name === presetName);
		await this.writePropFile(preset!.props);
		this.postMessage("readPropFile", preset!.props);
	}

	public async deletePreset() {
		const presets = await this.getState<Preset[]>("presets");
		const presetName = await quickPresets("Which preset to delete?", presets.map(p => p.name));
		await this.setState<Preset[]>("presets", presets.filter(p => p.name !== presetName));
	}

	public async loadProps() {
		const comps = await quickComponent(`Select component props`, await this.getState("compositions"));
		await this.writePropFile(JSON.stringify(comps?.defaultProps || {}, undefined, 2));
		this.postMessage("readPropFile", await this.readPropFile());
	}

	public async startPreview() {
		window.showInformationMessage('Starting preview...');

		startPreview(await this.getEntryPoint(), await this.getPropsPath());
	}
	public async render() {
		const comp = await quickComponent("Select composition", await this.getState("compositions"));
		if (!comp) return;
		render(await this.getEntryPoint(), comp.id, await this.getPropsPath());
		window.showInformationMessage(`Starting a render with id: `);
	}

	private _getHtmlForWebview(webview: Webview) {
		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const scriptUri = webview.asWebviewUri(Uri.joinPath(this._extensionUri, 'media', 'main.js'));

		// Do the same for the stylesheet.
		const styleMainUri = webview.asWebviewUri(Uri.joinPath(this._extensionUri, 'media', 'main.css'));

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
				<p id="indexPath">Index path</p>
				<button id="selectIndexFile">Select index file</button>
				<button id="refreshComps">Refresh components</button>
				<div>
					<button id="savePreset">Save preset</button>
					<button id="loadPreset">Load preset</button>
					<button id="deletePreset">Delete preset</button>
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
