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
          }
          canvas {
            width: 128px;
            height: 128px;
            image-rendering:pixelated;
          } /*image size*/
        </style>
      </head>
      <body>
        <canvas id="pet-canvas" width="32" height="32"></canvas>
        <script>
            const canvas = document.getElementById('pet-canvas');
            const ctx = canvas.getContext('2d');
            const sprite = new Image();
            sprite.src = '${spriteUri}';

            const SPRITE_WIDTH = 32;
            const SPRITE_HEIGHT = 32;

            const ANIMATIONS = {
              idle: [[0,0], [0,1]],
              walk: [[1,0], [1,1]],
              layDown:[[2,0], [2,1], [2,2], [2,3]],
              sleep:[[2,3], [3,3]],
              getUp:[[3,2], [3,1], [2,0]]
            }
            
            let currentAnimation = 'idle';
            let animFrame = 0;
            let frameDelay = 20;
            frameCount = 0;

            let facingRight = false;
            let posX = 0;
            let speed = 1;
            const CANVAS_WIDTH = 128;
            const CANVAS_HEIGHT = 128;

            function drawFrame(){
              const [row, col] = ANIMATIONS[currentAnimation][animFrame];
              ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
              ctx.save();

              if(facingRight){
                ctx.translate(SPRITE_WIDTH + posX, 0);
                ctx.scale(-1, 1); //flip horizontally
                ctx.drawImage(
                  sprite, 
                  col * SPRITE_WIDTH, row * SPRITE_HEIGHT, 
                  SPRITE_WIDTH, SPRITE_HEIGHT, 
                  0, 0, 
                  SPRITE_WIDTH, SPRITE_HEIGHT
                );
              } else {
                ctx.translate(posX, 0);
                ctx.drawImage(
                  sprite,
                  col * SPRITE_WIDTH, row * SPRITE_HEIGHT,
                  SPRITE_WIDTH, SPRITE_HEIGHT,
                  0, 0,
                  SPRITE_WIDTH, SPRITE_HEIGHT
                );
              }
              ctx.restore();
            }

            function animate(){
              if(currentAnimation === 'walk'){
                posX += facingRight ? speed : -speed;

                //left edge check
                if(!facingRight && posX <= 0){
                  posX = 0;
                  playAnimation('layDown');
                  setTimeout(() => {
                    facingRight = true;
                    playAnimation('getUp');
                    setTimeout(() => {
                      playAnimation('walk');
                    }, 1000); //get up
                  }, 1000); // lay down
                }
              } else if (facingRight && posX >= CANVAS_WIDTH - SPRITE_WIDTH){
                posX = CANVAS_WIDTH - SPRITE_WIDTH;
                playAnimation('layDown');
                setTimeout(() => {
                  facingRight = false;
                  playAnimation('getUp');
                  setTimeout(() => {
                    playAnimation('walk');
                  }, 1000); //get up
                }, 1000); // lay down
              }

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
                let frameCount = 0;
              }
            }

            sprite.onload = function(){
              animate();

              //demo
              let anims = Object.keys(ANIMATIONS);
              let idx = 0;
              setInterval(() => {
                playAnimation(anims[idx]);
                idx = (idx + 1) % anims.length;
              }, 2000);
            };
        </script>
      </body>
    </html>
    `;
  }
}

exports.activate = activate;
