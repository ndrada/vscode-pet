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
    //special uri to safely access cat sprites
    const spriteUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'cat.png')
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
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          #container {
            width: 100vw;
            height: 200px;
            position: relative;
            overflow: hidden;
          }
          canvas {
            position: absolute;
            image-rendering: pixelated;
            width: 64px;
            height: 64px;
          }
        </style>
      </head>
      <body>
        <div id="container">
          <canvas id="pet-canvas" width="32" height="32"></canvas>
        </div>
        <script>
            const canvas = document.getElementById('pet-canvas');
            const container = document.getElementById('container');
            const ctx = canvas.getContext('2d');
            const sprite = new Image();
            sprite.src = '${spriteUri}';
            
            const SPRITE_WIDTH = 32;
            const SPRITE_HEIGHT = 32;
            const CONTAINER_WIDTH = 300;
            const CONTAINER_HEIGHT = 200;
            const CAT_DISPLAY_SIZE = 64;
            
            const ANIMATIONS = {
              idle: [[0,0], [0,1]],
              walk: [[1,0], [1,1]],
              layDown: [[2,0], [2,1], [2,2], [2,3]],
              sleep: [[2,3], [3,3]],
              getUp: [[3,2], [3,1], [2,0]]
            };
                       
            let currentAnimation = 'idle';
            let animFrame = 0;
            let frameDelay = 10;
            let frameCount = 0;
            let facingRight = true;
            let posX = CONTAINER_WIDTH / 2 - CAT_DISPLAY_SIZE / 2; // Start in center
            let posY = CONTAINER_HEIGHT / 2 - CAT_DISPLAY_SIZE / 2; // Center vertically
            let speed = 1;
            let isWalking = false;
            
            function drawFrame(){
              const [row, col] = ANIMATIONS[currentAnimation][animFrame];
              
              // Clear the canvas
              ctx.clearRect(0, 0, SPRITE_WIDTH, SPRITE_HEIGHT);
              
              // Position the canvas element
              canvas.style.left = posX + 'px';
              canvas.style.top = posY + 'px';
              
              ctx.save();
              
              if(facingRight){
                ctx.translate(SPRITE_WIDTH, 0);
                ctx.scale(-1, 1); // flip horizontally
              }
              
              ctx.drawImage(
                sprite,
                col * SPRITE_WIDTH, row * SPRITE_HEIGHT,
                SPRITE_WIDTH, SPRITE_HEIGHT,
                0, 0,
                SPRITE_WIDTH, SPRITE_HEIGHT
              );
              
              ctx.restore();
            }
            
            function animate(){
              // Handle movement
              if(currentAnimation === 'walk' && isWalking){
                posX += facingRight ? speed : -speed;
                
                // Check boundaries and turn around
                if(facingRight && posX >= CONTAINER_WIDTH - CAT_DISPLAY_SIZE){
                  posX = CONTAINER_WIDTH - CAT_DISPLAY_SIZE;
                  isWalking = false;
                  playAnimation('layDown');
                  setTimeout(() => {
                    facingRight = false;
                    playAnimation('getUp');
                    setTimeout(() => {
                      isWalking = true;
                      playAnimation('walk');
                    }, 1500); // get up duration
                  }, 2000); // lay down duration
                }
                else if(!facingRight && posX <= 0){
                  posX = 0;
                  isWalking = false;
                  playAnimation('layDown');
                  setTimeout(() => {
                    facingRight = true;
                    playAnimation('getUp');
                    setTimeout(() => {
                      isWalking = true;
                      playAnimation('walk');
                    }, 1500); // get up duration
                  }, 2000); // lay down duration
                }
              }
              
              // Handle animation frames
              frameCount++;
              if(frameCount % frameDelay === 0){
                animFrame = (animFrame + 1) % ANIMATIONS[currentAnimation].length;
                frameCount = 0;
              }
              
              drawFrame();
              requestAnimationFrame(animate);
            }
            
            function playAnimation(name){
              if(ANIMATIONS[name] && currentAnimation !== name){
                currentAnimation = name;
                animFrame = 0;
                frameCount = 0;
              }
            }
            
            sprite.onload = function(){
              animate();
              
              // Start walking after a short delay
              setTimeout(() => {
                isWalking = true;
                playAnimation('walk');
              }, 1000);
            };
        </script>
      </body>
    </html>
    `;
  }
}

exports.activate = activate;
