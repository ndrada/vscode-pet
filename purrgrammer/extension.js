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
        vscode.Uri.joinPath(this.extensionUri, 'scripts')
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
    const petScriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'scripts', 'pet.js')
    );

    const timerScriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'scripts', 'timer.js')
    );

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            display: flex;
            justify-content: center;
            align-items: flex-end;
            flex-direction: column;
            height: 98vh;
            width: 90vw;
            margin: 0;
            border: 1px solid #ccc;
          }
          #container {
            width: 100vw;
            min-width: 100px;
            height: 100%;
            max-height: 100px;
            min-height: 100px;
            position: relative;
            overflow: hidden;
            border: 1px solid #ccc;
          }
          canvas {
            position: absolute;
            left: 0;
            bottom: 0;
            image-rendering: pixelated;
            width: 64px;
            height: 64px;
          }
        </style>
      </head>
      <body>
        <h1 id="title" style="text-align:center;margin-top:10px;">🍅 TOMATO CAT - a pomodoro timer</h1>
        <div id="timer-display" style="font-size:2em;text-align:center;margin-top:5px;">25:00</div>
        <button id="start-btn" style="display:block;margin:20px auto;">Start</button>
        <div id="container">
          <canvas id="pet-canvas" width="32" height="32"></canvas>
        </div>
        <script>
          // Set sprite URI before loading the pet script
          window.spriteUri = '${spriteUri}';
          console.log('Sprite URI set:', window.spriteUri);
        </script>
        <script src="${petScriptUri}"></script>
        <script src=${timerScriptUri}></script>
      </body>
    </html>
    `;
  }
}

exports.activate = activate;
