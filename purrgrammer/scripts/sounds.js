class SoundManager {
    constructor() {
        this.soundEnabled = true;
        this.soundBtn = document.getElementById('sound-btn');

        //preload sounds
        this.tap = new Audio(window.tapSoundUri);
        this.meow = new Audio(window.meowSoundUri);

        //button logic
        this.soundBtn.addEventListener('click', () => this.toggleSound());
        this.updateIcon();
    }

    playTap() {
        if (!this.soundEnabled) return;
        this.tap.currentTime = 0;
        this.tap.play();
    }

    playMeow() {
        if (!this.soundEnabled) return;
        this.meow.currentTime = 0;
        this.meow.play();
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.updateIcon();
    }

    updateIcon() {
        this.soundBtn.innerHTML = this.soundEnabled ? '🕪' : '🕨';
    }
}