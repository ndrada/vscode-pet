class UIController {
    constructor() {
        this.introScreen = null;
        this.mainApp = null;
        this.isIntroComplete = false;
        
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
        this.introScreen = document.getElementById('intro-screen');
        this.mainApp = document.getElementById('main-app');
        
        if (!this.introScreen || !this.mainApp) {
            console.error('UI elements not found');
            return;
        }
        
        // Start the intro sequence
        this.startIntroSequence();
    }
    
    startIntroSequence() {
        console.log('Starting intro sequence...');
        
        // After 3 seconds, start fade out
        setTimeout(() => {
            this.fadeOutIntro();
        }, 3000);
    }
    
    fadeOutIntro() {
        console.log('Fading out intro...');
        
        // Add fade-out class to intro screen
        this.introScreen.classList.add('fade-out');
        
        // After fade out completes (1 second), show main app
        setTimeout(() => {
            this.showMainApp();
        }, 1000);
    }
    
    showMainApp() {
        console.log('Showing main app...');
        
        // Hide intro screen completely
        this.introScreen.style.display = 'none';
        
        // Show main app
        this.mainApp.classList.remove('hidden');
        
        // Trigger show animation
        setTimeout(() => {
            this.mainApp.classList.add('show');
            this.isIntroComplete = true;
            
            // Notify other scripts that UI is ready
            this.notifyUIReady();
        }, 50);
    }
    
    notifyUIReady() {
        // Dispatch custom event for other scripts to listen to
        const event = new CustomEvent('uiReady', {
            detail: { introComplete: true }
        });
        document.dispatchEvent(event);
        
        // Also set a global flag
        window.uiReady = true;
    }
    
    // Method to skip intro (for development/testing)
    skipIntro() {
        if (!this.isIntroComplete) {
            this.introScreen.style.display = 'none';
            this.showMainApp();
        }
    }
}

// Initialize UI Controller
window.uiController = new UIController();

// Optional: Add keyboard shortcut to skip intro (for development)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !window.uiController.isIntroComplete) {
        window.uiController.skipIntro();
    }
});