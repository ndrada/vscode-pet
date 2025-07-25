class UIController {
    constructor() {
        this.parallaxLayers = [];
        this.parallaxAnimationId = null;
        this.parallaxOffset = 0;
        this.isParallaxActive = false; // start paused
        
        this.init();
    }
    
    init() {
        // wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupUI());
        } else {
            this.setupUI();
        }
    }
    
    setupUI() {
        //read mode from local storage / default to light
        const savedMode = localStorage.getItem('purrgrammer-mode') || 'light';

        // correct mode setup everywhere upfront
        this.currentMode = savedMode;
        document.getElementById('bg-light').style.display = savedMode === 'light' ? '' : 'none';
        document.getElementById('bg-dark').style.display = savedMode === 'dark' ? '' : 'none';
        document.body.classList.toggle('dark-mode', savedMode === 'dark');

        this.setupParallax(savedMode); // in saved mode
        this.setupTimerListeners(); //listen for timer events
        this.notifyUIReady(); //notify ui is readyyyy

        const modeBtn = document.getElementById('mode-btn');
        if(modeBtn){
            modeBtn.addEventListener('click', () => {
                this.parallaxToggleMode();
            });
        }
        
        // set initial button state
        this.updateModeButton();
    }
    
    setupParallax(mode = 'light') {
        this.currentMode = mode; //light or dark

        //only select visible layers
        if(mode === 'light') {
            this.parallaxLayers = document.querySelectorAll('#bg-light .parallax');
            this.parallaxSpeeds = [
                -0.1, -0.15, -0.2, -0.3, -0.4, -0.5, -0.7 // 7 layers
            ];
        } else {
            this.parallaxLayers = document.querySelectorAll('#bg-dark .parallax');
            this.parallaxSpeeds = [
                -0.12, -0.18, -0.23, -0.35, -0.44, -0.6 // 6 layers
            ];
        }        
        // set background images from data attributes
        this.parallaxLayers.forEach(layer => {
            const bgUri = layer.getAttribute('data-bg');
            if (bgUri) {
                layer.style.backgroundImage = `url('${bgUri}')`;
            }
        });
        
        this.startParallax();
    }

    parallaxToggleMode(){
        //flip mode
        this.currentMode = this.currentMode === 'light' ? 'dark' : 'light';
        //store mode in local storage
        localStorage.setItem('purrgrammer-mode', this.currentMode);

        // show/hide parallax layers
        document.getElementById('bg-light').style.display = this.currentMode === 'light' ? '' : 'none';
        document.getElementById('bg-dark').style.display = this.currentMode === 'dark' ? '' : 'none';

        //set the right parallax layers and speeds
        this.setupParallax(this.currentMode);

        //add dark mode css
        document.body.classList.toggle('dark-mode', this.currentMode === 'dark');
        
        // update the button icon
        this.updateModeButton();
    }
    
    setupTimerListeners() {
        document.addEventListener('timerStarted', () => {
            if(window.pomodoroTimer && window.pomodoroTimer.isWorkSession) {
                this.resumeParallax();
            } else {
                this.pauseParallax();
            }
        });
        
        //always pause parallax when timer is paused
        document.addEventListener('timerPaused', () => {
            this.pauseParallax();
        });
        
        // listeners for break and work session events
        document.addEventListener('timerBreak', () => {
            this.pauseParallax(); // Stop parallax when break starts
        });
    }
    
    startParallax() {
        // stop any existing animation loop first
        if (this.parallaxAnimationId) {
            cancelAnimationFrame(this.parallaxAnimationId);
            this.parallaxAnimationId = null;
        }
        
        const animate = () => {
            if (this.isParallaxActive) {
                this.parallaxOffset += 0.5;
                
                this.parallaxLayers.forEach((layer, index) => {
                    const speed = this.parallaxSpeeds[index];
                    const offset = this.parallaxOffset * speed;
                    layer.style.backgroundPositionX = `${offset}px`;
                });
            }
            
            this.parallaxAnimationId = requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    pauseParallax() {
        this.isParallaxActive = false;
    }
    
    resumeParallax() {
        this.isParallaxActive = true;
    }
    
    stopParallax() {
        if (this.parallaxAnimationId) {
            cancelAnimationFrame(this.parallaxAnimationId);
            this.parallaxAnimationId = null;
        }
    }
    
    // adjust parallax speed
    setParallaxSpeed(baseSpeed) {
        this.baseSpeed = baseSpeed;
    }
    
    // toggle parallax for dev
    toggleParallax() {
        if (this.isParallaxActive) {
            this.pauseParallax();
        } else {
            this.resumeParallax();
        }
    }
    
    notifyUIReady() {
        //custom event for other scripts to listen to
        const event = new CustomEvent('uiReady', {
            detail: { introComplete: true }
        });
        document.dispatchEvent(event);
        
        //global flag
        window.uiReady = true;
    }

    updateModeButton() {
        const modeBtn = document.getElementById('mode-btn');
        if (modeBtn) {
            modeBtn.textContent = this.currentMode === 'light' ? '⏾' : '☀';
        }
    }
}

window.uiController = new UIController();

//keyboard shortcuts for dev
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !window.uiController.isIntroComplete) {
        window.uiController.skipIntro();
    }
    // Toggle parallax with 'P' key
    if (e.key === 'p' || e.key === 'P') {
        window.uiController.toggleParallax();
    }
});

// expose methods globally for adjustment
window.setParallaxSpeed = (speed) => {
    window.uiController.setParallaxSpeed(speed);
};