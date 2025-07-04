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
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.extensionUri, 'media'),
        vscode.Uri.joinPath(this.extensionUri, 'scripts'),
        vscode.Uri.joinPath(this.extensionUri, 'styles')
      ]
    };
    webviewView.webview.html = this.getHtml(webviewView.webview);
  }

  //actual html panel that will be displayed
  getHtml(webview){
    //special uri to safely access cat sprites
    const spriteUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'cat.png')
    );
    
    // Background layer URIs
    const bg1Uri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'background', '1.png')
    );
    const bg2Uri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'background', '2.png')
    );
    const bg3Uri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'background', '3.png')
    );
    const bg4Uri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'background', '4.png')
    );
    const bg5Uri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'background', '5.png')
    );
    const bg6Uri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'background', '6.png')
    );
    const bg7Uri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'background', '7.png')
    );
    
    //special uri to safely access js scripts
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'scripts', 'pet.js')
    );
    const timerUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'scripts', 'timer.js')
    );
    const uiUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'scripts', 'ui.js')
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
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Jersey+10&display=swap');
        </style>
        <title>Purrgrammer</title>
      </head>
      <body>
        <div id="background-canvas">
          <div class="parallax layer1" data-bg="${bg1Uri}"></div>
          <div class="parallax layer2" data-bg="${bg2Uri}"></div>
          <div class="parallax layer3" data-bg="${bg3Uri}"></div>
          <div class="parallax layer4" data-bg="${bg4Uri}"></div>
          <div class="parallax layer5" data-bg="${bg5Uri}"></div>
          <div class="parallax layer6" data-bg="${bg6Uri}"></div>
          <div class="parallax layer7" data-bg="${bg7Uri}"></div>
        </div>
        
        <!-- Main App (no intro) -->
        <div id="main-app">
          <div id="header">
            <h2>Purrgrammer</h2>
            <button id="reset-btn" title="Reset Timer">↻</button>
          </div>
          
          <div id="timer-container">
            <div id="timer-display">25:00</div>
            <div id="timer-controls">
              <button id="start-pause-btn">Start</button>
            </div>
            <div id="timer-status">Ready to focus!</div>
          </div>
          
          <div id="container">
            <canvas id="pet-canvas" width="32" height="32"></canvas>
          </div>
        </div>
        
        <script>
          window.spriteUri = "${spriteUri}";
        </script>
        <script src="${uiUri}"></script>
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
