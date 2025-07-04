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
    }
    
    setupParallax() {
        // Get all parallax layers
        this.parallaxLayers = document.querySelectorAll('.parallax');
        
        // Set background images from data attributes
        this.parallaxLayers.forEach(layer => {
            const bgUri = layer.getAttribute('data-bg');
            if (bgUri) {
                layer.style.backgroundImage = `url('${bgUri}')`;
            }
        });
        
        // Define slower speeds for each layer
        // Negative values to move background left (making cat appear to walk right)
        this.parallaxSpeeds = [
            -0.1,  // layer1 - furthest back, slowest
            -0.15, // layer2
            -0.2,  // layer3
            -0.3,  // layer4
            -0.4,  // layer5
            -0.5   // layer6 - closest, fastest
        ];
        
        // Start parallax animation loop (but paused)
        this.startParallax();
    }
    
    setupTimerListeners() {
        // Listen for custom timer events
        document.addEventListener('timerStarted', () => {
            this.resumeParallax();
        });
        
        document.addEventListener('timerPaused', () => {
            this.pauseParallax();
        });
        
        document.addEventListener('timerBreak', () => {
            this.pauseParallax();
        });
        
        document.addEventListener('timerWorkSession', () => {
            this.resumeParallax();
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