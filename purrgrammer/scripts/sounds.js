class SoundManager {
    constructor() {
        this.soundEnabled = true;
        this.soundBtn = null;
        this.tickingTimeout = null;
        this.fadeInterval = null;
        this.primed = false;

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.soundBtn = document.getElementById('sound-btn');
        
        // Preload sounds
        this.tap = new Audio(window.tapUri);
        this.meow = new Audio(window.meowUri);

        // Prime audio on any button click
        const prime = () => {
            if(this.primed) return;
            this.tap.muted = true;
            this.meow.muted = true;
            this.tap.play().catch(() => {}); // ignore errors
            this.meow.play().catch(() => {});
            setTimeout(() => {
                this.tap.pause();
                this.tap.currentTime = 0;
                this.tap.muted = false;
                this.meow.pause();
                this.meow.currentTime = 0;
                this.meow.muted = false;
            }, 200);
            this.primed = true;
        }
        
        // Listen for ANY button click to prime audio
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                prime();
            }
        });
        
        // Button logic
        if (this.soundBtn) {
            this.soundBtn.addEventListener('click', () => this.toggleSound());
            this.updateIcon();
        }
    }

    playTicking(){
        if (!this.soundEnabled) return;
        this.stopTicking(); // ensure no overlap

        this.tap.currentTime = 0;
        this.tap.volume = 1;
        this.tap.loop = false;
        this.tap.play().catch(() => {}); // handle potential errors
        this.tickingTimeout = setTimeout(() => {
            this.fadeOutTicking();
        }, 3000);
    }

    fadeOutTicking(){
        if(!this.soundEnabled) return; 
        let volume = this.tap.volume;
        clearInterval(this.fadeInterval);
        this.fadeInterval = setInterval(() => {
            volume -= 0.02;
            if(volume <= 0){
                this.tap.volume = 0;
                this.stopTicking();
                clearInterval(this.fadeInterval);
            } else {
                this.tap.volume = volume;
            }
        }, 50); 
    }

    stopTicking(){
        if(this.tickingTimeout) clearTimeout(this.tickingTimeout);
        if(this.fadeInterval) clearInterval(this.fadeInterval);
        this.tap.pause();
        this.tap.currentTime = 0;
        this.tap.volume = 1;
    }

    playMeow() {
        if (!this.soundEnabled) return;
        this.meow.currentTime = 0;
        this.meow.play().catch(() => {}); // handle potential errors
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.updateIcon();
        if(!this.soundEnabled) this.stopTicking();
    }

    updateIcon() {
        if (this.soundBtn) {
            this.soundBtn.innerHTML = this.soundEnabled ? '🕪' : '🕨';
        }
    }
}

function initSoundManager() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.soundManager = new SoundManager();
        });
    } else {
        window.soundManager = new SoundManager();
    }
}

initSoundManager();