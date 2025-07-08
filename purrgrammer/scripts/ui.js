class UIController {
    constructor() {
        this.parallaxLayers = [];
        this.parallaxAnimationId = null;
        this.parallaxOffset = 0;
        this.isParallaxActive = false; // Start paused
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupUI());
        } else {
            this.setupUI();
        }
    }
    
    setupUI() {
        // Setup parallax
        this.setupParallax();
        
        // Listen for timer events
        this.setupTimerListeners();
        
        // Notify that UI is ready
        this.notifyUIReady();

        const modeBtn = document.getElementById('mode-btn');
        if(modeBtn){
            modeBtn.addEventListener('click', () => {
                this.parallaxToggleMode();
            });
        }
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
                -0.1, -0.15, -0.2, -0.3, -0.4, -0.6 // 6 layers
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

        // show/hide parallax layers
        document.getElementById('bg-light').style.display = this.currentMode === 'light' ? '' : 'none';
        document.getElementById('bg-dark').style.display = this.currentMode === 'dark' ? '' : 'none';

        //set the right parallax layers and speeds
        this.setupParallax(this.currentMode);

        //add dark mode css
        document.body.classList.toggle('dark-mode', this.currentMode === 'dark');
    }
    
    setupTimerListeners() {
        document.addEventListener('timerStarted', () => {
            if(window.pomodoroTimer && window.pomodoroTimer.isWorkSession) {
                console.log('[ui] timerStarted: work sesh, paralalax on');
                this.resumeParallax();
            } else {
                console.log('[ui] timerStarted: break sesh, paralalax off');
                this.pauseParallax();
            }
        });
        
        //always pause parallax when timer is paused
        document.addEventListener('timerPaused', () => {
            console.log('[ui] timerPaused');
            this.pauseParallax();
        });
        
        // Add listeners for break and work session events
        document.addEventListener('timerBreak', () => {
            console.log('[ui] timerBreak');
            this.pauseParallax(); // Stop parallax when break starts
        });
    }
    
    startParallax() {
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
        console.log('Parallax paused - cat should idle');
    }
    
    resumeParallax() {
        this.isParallaxActive = true;
        console.log('Parallax resumed - cat should walk');
    }
    
    stopParallax() {
        if (this.parallaxAnimationId) {
            cancelAnimationFrame(this.parallaxAnimationId);
            this.parallaxAnimationId = null;
        }
    }
    
    // Method to adjust parallax speed
    setParallaxSpeed(baseSpeed) {
        this.baseSpeed = baseSpeed;
    }
    
    // Method to toggle parallax for development
    toggleParallax() {
        if (this.isParallaxActive) {
            this.pauseParallax();
        } else {
            this.resumeParallax();
        }
    }
    
    notifyUIReady() {
        // Dispatch custom event for other scripts to listen to
        const event = new CustomEvent('uiReady', {
            detail: { introComplete: true }
        });
        document.dispatchEvent(event);
        
        // Also set a global flag
        window.uiReady = true;
        console.log('UI ready - no intro');
    }
}

// Initialize UI Controller
window.uiController = new UIController();

// Optional: keyboard shortcuts for development
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !window.uiController.isIntroComplete) {
        window.uiController.skipIntro();
    }
    // Toggle parallax with 'P' key
    if (e.key === 'p' || e.key === 'P') {
        window.uiController.toggleParallax();
    }
});

// Expose methods globally for easy adjustment
window.setParallaxSpeed = (speed) => {
    window.uiController.setParallaxSpeed(speed);
};