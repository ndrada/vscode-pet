// wait for DOM to be ready and sprite uri to be available
function initPet() {
    const canvas = document.getElementById('pet-canvas');
    const container = document.getElementById('container');
    
    if (!canvas || !container || !window.spriteUri) {
        console.log('Waiting for elements...', { canvas: !!canvas, container: !!container, spriteUri: !!window.spriteUri });
        setTimeout(initPet, 100);
        return;
    }
    
    console.log('Initializing pet...');
    
    const ctx = canvas.getContext('2d');
    const sprite = new Image();
    sprite.src = window.spriteUri;
    
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
    let posX = CONTAINER_WIDTH / 2 - CAT_DISPLAY_SIZE / 2;
    let posY = CONTAINER_HEIGHT / 2 - CAT_DISPLAY_SIZE / 2;
    let speed = 1;
    let isWalking = false;
    
    function drawFrame(){
        const [row, col] = ANIMATIONS[currentAnimation][animFrame];
        
        ctx.clearRect(0, 0, SPRITE_WIDTH, SPRITE_HEIGHT);
        
        canvas.style.left = posX + 'px';
        canvas.style.top = posY + 'px';
        
        ctx.save();
        
        if(facingRight){
            ctx.translate(SPRITE_WIDTH, 0);
            ctx.scale(-1, 1);
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
        if(currentAnimation === 'walk' && isWalking){
            posX += facingRight ? speed : -speed;
            
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
                    }, 1500);
                }, 2000);
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
                    }, 1500);
                }, 2000);
            }
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
            frameCount = 0;
        }
    }
    
    sprite.onload = function(){
        console.log('Sprite loaded, starting animation');
        animate();
        
        setTimeout(() => {
            isWalking = true;
            playAnimation('walk');
        }, 1000);
    };
    
    sprite.onerror = function(){
        console.error('Failed to load sprite');
    };
}

// start animation
initPet();
