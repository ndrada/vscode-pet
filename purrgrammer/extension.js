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
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'media')]
    };
    //store html content for webview panel
    webviewView.webview.html = this.getHtml(webviewView.webview);
  }

  //actual html panel that will be displayed
  getHtml(webview){
    //special uri to safely access gifs
    const catGif = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'awesome-cat.gif')
    );

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          /*centering everything with a nice dark background*/
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh; 
            background: #191919;
          }
          img { width: 120px; } /*image size*/
        </style>
      </head>
      <body>
        <img src="${catGif}" alt="kitty gif" />
      </body>
    </html>
    `;
  }
}

exports.activate = activate;
