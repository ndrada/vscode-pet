const vscode = require('vscode'); //import vscode api

//activate func runs when extension activates (when vscode loads it)
function activate(context) {
  context.subscriptions.push( //everything added here will be cleaned up when vscode disables the extension
    vscode.window.registerWebviewViewProvider(
      'purrgrammerPanel', //matches id used in package.json "views"
      new KittyViewProvider(context.extensionUri) //creates a new panel view provider with the class below
    )
  ); 
}

class KittyViewProvider{
  constructor(extensionUri){
    this.extensionUri = extensionUri; //root folder needed later to load local files
  }

  resolveWebviewView(webviewView){
    webviewView.webview.options = {
      enableScripts: true, //let html panel run js - for interactivity
      localResourceRoots: [
        vscode.Uri.joinPath(this.extensionUri, 'media'),
        vscode.Uri.joinPath(this.extensionUri, 'scripts'),
        vscode.Uri.joinPath(this.extensionUri, 'styles')
      ]
    };
    //store html content for webview panel
    webviewView.webview.html = this.getHtml(webviewView.webview);
  }

  //actual html panel that will be displayed
  getHtml(webview){
    //special uri to safely access cat sprites
    const spriteUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'cat.png')
    );
    //special uri to safely access js script
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'scripts', 'pet.js')
    );
    //special uri to safely access timer script
    const timerUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'scripts', 'timer.js')
    );
    //special uri to safely access css
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'styles', 'style.css')
    );

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="${styleUri}">
        <title>Purrgrammer</title>
      </head>
      <body>
      <h1>Tomato Cat</h1>
        <div id="timer-container">
          <div id="timer-display">25:00</div>
          <div id="timer-controls">
            <button id="start-btn">Start</button>
            <button id="pause-btn">Pause</button>
            <button id="reset-btn">Reset</button>
          </div>
          <div id="timer-status">Ready to focus!</div>
        </div>
        
        <div id="container">
          <canvas id="pet-canvas" width="32" height="32"></canvas>
        </div>
        
        <script>
          window.spriteUri = "${spriteUri}";
        </script>
        <script src="${scriptUri}"></script>
        <script src="${timerUri}"></script>
      </body>
      </html>
    `;
  }
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
