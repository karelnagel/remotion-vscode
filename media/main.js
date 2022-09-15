
(function () {
    const vscode = acquireVsCodeApi();

    const postMessage = (type, value) => vscode.postMessage({ type, value });

    const button = (type) => document.getElementById(type)?.addEventListener('click', () => {
        postMessage(type);
    });

    button("preview");
    button("selectIndexFile");
    button("refreshComps");
    button("setPropsFile");
    button("newPropsFile");
    button("deletePropsFile");
    button("loadProps");
    button("startPreview");
    button("render");
    button("openBrowser");

    postMessage("indexPath");
    postMessage("selectedPropFile");
    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.type) {
            case 'indexPath':
                document.getElementById("indexPath").textContent = message.value;
                break;
            case 'selectedPropFile':
                document.getElementById("selectedPropFile").textContent = message.value;
                postMessage("readPropFile");
                break;
            case 'readPropFile':
                document.getElementById("propFile").textContent = message.value;
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


