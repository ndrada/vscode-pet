// Wait for UI to be ready before initializing pet
function waitForUI() {
    if (window.uiReady) {
        initPet();
    } else {
        document.addEventListener('uiReady', initPet);
    }
}

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

    const ANIMATIONS = {
        idle: [[0,0], [0,1]],
        walk: [[1,0], [1,1]],
        layDown: [[2,0], [2,1], [2,2], [2,3]],
        sleep: [[2,3], [3,3]],
        getUp: [[3,2], [3,1], [2,0]]
    };
    
    let currentAnimation = 'idle';
    let animFrame = 0;
    let frameDelay = 20; // higher = slower
    let frameCount = 0;
    let facingRight = true;
    let shouldLoop = true;
    let isTimerRunning = false;
    let isBreakTime = false;
    
    // Listen for timer events
    document.addEventListener('timerStarted', () => {
        isTimerRunning = true;
        if (!isBreakTime) {
            playAnimation('walk');
        }
    });
    
    document.addEventListener('timerPaused', () => {
        isTimerRunning = false;
        if( !isBreakTime) {
            playAnimation('idle');
        }
    });
    
    document.addEventListener('timerBreak', () => {
        isBreakTime = true;
        isTimerRunning = false;
        playAnimation('layDown');
        setTimeout(() => {
            playAnimation('sleep');
        }, 2000); // Wait for layDown animation to complete
    });
    
    document.addEventListener('timerWorkSession', () => {
        isBreakTime = false;
        if (currentAnimation === 'sleep') {
            playAnimation('getUp');
            setTimeout(() => {
                if (isTimerRunning) {
                    playAnimation('walk');
                } else {
                    playAnimation('idle');
                }
            }, 1500); // Wait for getUp animation
        } else if (isTimerRunning) {
            playAnimation('walk');
        } else {
            playAnimation('idle');
        }
    });
    
    function drawFrame(){
        const [row, col] = ANIMATIONS[currentAnimation][animFrame];
        
        ctx.clearRect(0, 0, SPRITE_WIDTH, SPRITE_HEIGHT);
        
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
        frameCount++;
        if(frameCount % frameDelay === 0){
            // Check if we should loop or stop at last frame
            if(shouldLoop || animFrame < ANIMATIONS[currentAnimation].length - 1) {
                animFrame = (animFrame + 1) % ANIMATIONS[currentAnimation].length;
            }
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
            
            // Set which animations should loop
            shouldLoop = ['idle', 'walk', 'sleep'].includes(name);
            
            // Different frame delays for different animations
            switch(name) {
                case 'idle':
                    frameDelay = 40; // slow idle breathing
                    break;
                case 'walk':
                    frameDelay = 20; // moderate walking pace
                    break;
                case 'sleep':
                    frameDelay = 60; // very slow sleep animation
                    break;
                case 'layDown':
                case 'getUp':
                    frameDelay = 15; // slightly faster transitions
                    break;
                default:
                    frameDelay = 25;
            }
            
            console.log(`Playing animation: ${name}, frameDelay: ${frameDelay}, shouldLoop: ${shouldLoop}`);
        }
    }
    
    sprite.onload = function(){
        console.log('Sprite loaded, starting animation');
        animate();
        
        // Start with idle animation
        playAnimation('idle');
    };
    
    sprite.onerror = function(){
        console.error('Failed to load sprite');
    };

    // Expose pet controller for external control
    window.petController = {
        startBreak: function() {
            isBreakTime = true;
            playAnimation('layDown');
            setTimeout(() => {
                playAnimation('sleep');
            }, 2000);
        },
        
        endBreak: function() {
            isBreakTime = false;
            playAnimation('getUp');
            setTimeout(() => {
                if (isTimerRunning) {
                    playAnimation('walk');
                } else {
                    playAnimation('idle');
                }
            }, 1500);
        },
        
        setAnimation: function(animName) {
            playAnimation(animName);
        }
    };
}

// start animation
waitForUI();
