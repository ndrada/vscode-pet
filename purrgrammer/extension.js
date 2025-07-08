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
    
    //dynamic background layer URIs
    function getBgUri(extensionUri, webview, mode='background', count=7){
      return Array.from({length: count}, (_, i) => 
        webview.asWebviewUri(
          vscode.Uri.joinPath(extensionUri, 'media', mode, `${i+1}.png`)
        ));
    }

    const bgUri = getBgUri(this.extensionUri, webview, 'background', 7);
    const darkBgUri = getBgUri(this.extensionUri, webview, 'darkmode', 6);

    const bgLayersHtml = bgUri.map((uri, i) => 
    `<div class="parallax layer${i+1}" data-bg="${uri}"></div>`).join('');

    const darkBgLayersHtml = darkBgUri.map((uri, i) => 
      `<div class="parallax layer${i+1}" data-bg="${uri}"></div>`).join('');

    
    //script uris
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'scripts', 'pet.js')
    );
    const timerUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'scripts', 'timer.js')
    );
    const uiUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'scripts', 'ui.js')
    );
    const soundManagerUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'scripts', 'sounds.js')
    );
    //special uri to safely access css
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'styles', 'style.css')
    );

    //sounds
    const meowUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'sounds', 'meowx2.wav')
    );

    const tapUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'sounds', 'ticking.wav')
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
          <div id="bg-light">${bgLayersHtml}</div>
          <div id="bg-dark" style="display:none">${darkBgLayersHtml}</div>
        </div>
        
        <!-- Main App (no intro) -->
        <div id="main-app">
          <div id="header">
            <button id="sound-btn" title="Sound Button">🕪</button>
            <button id="mode-btn" title="Toggle Dark Mode"></button>
            <h2>Purrgrammer</h2>
            <button id="reset-btn" title="Reset Timer">↻</button>
          </div>
          
          <div id="timer-status">Ready to focus!</div>

          <div id="timer-container">
            <div id="timer-display">25:00</div>
            <div id="timer-controls">
              <button id="start-pause-btn">Start</button>
            </div>
          </div>
          
          <div id="container">
            <canvas id="pet-canvas" width="32" height="32"></canvas>
          </div>
        </div>


        <script>
          window.spriteUri = "${spriteUri}";
        </script>
        <script>
          window.meowUri = "${meowUri}";
          window.tapUri = "${tapUri}";
        </script>
        <script src="${soundManagerUri}"></script>
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
