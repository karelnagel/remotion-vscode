
(function () {
    const vscode = acquireVsCodeApi();
    const postMessage = (type, value) => vscode.postMessage({ type, value });

    const button = (type) => document.getElementById(type)?.addEventListener('click', () => {
        postMessage(type);
    });

    button("init");
    button("preview");
    button("selectIndexFile");
    button("refreshComps");
    button("savePreset");
    button("loadPreset");
    button("deletePreset");
    button("loadProps");
    button("startPreview");
    button("render");
    button("openBrowser");

    postMessage("indexPath");
    postMessage("readPropFile");
    postMessage("compositions");
    postMessage("presets");

    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.type) {
            case 'indexPath':
                document.getElementById("indexPath").textContent = message.value;
                if (message.value) {
                    document.getElementById("no-index-file").style.display = "none";
                    document.getElementById("indexPath").style.display = "block";
                    document.getElementById("only-with-index-file").style.display = "block";
                }
                break;
            case 'compositions':
                document.getElementById("compsFound").textContent = `Found ${message.value.length}`;
                break;
            case 'presets':
                if (message.value && message.value.length > 0) {
                    document.getElementById("loadPreset").disabled = false;
                    document.getElementById("deletePreset").disabled = false;
                }
                else {
                    document.getElementById("loadPreset").disabled = true;
                    document.getElementById("deletePreset").disabled = true;
                }
                break;
            case 'readPropFile':
                document.getElementById("propFile").value = message.value;
                break;

        }
    });

    let timer = null;
    document.getElementById("propFile").addEventListener('input', (event) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            console.log(event.target.value);
            postMessage("writePropFile", event.target.value);
        }, 1000);
    });
}());


