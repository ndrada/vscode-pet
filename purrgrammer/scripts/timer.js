class PomodoroTimer {
    constructor() {
        this.workTime = 25 * 60; // 25 minutes in seconds
        this.breakTime = 5 * 60; // 5 minutes in seconds
        this.currentTime = this.workTime;
        this.isRunning = false;
        this.isWorkSession = true;
        this.intervalId = null;
        
        this.initializeElements();
        this.updateDisplay();
        this.bindEvents();
    }
    
    initializeElements() {
        this.displayElement = document.getElementById('timer-display');
        this.statusElement = document.getElementById('timer-status');
        this.startPauseBtn = document.getElementById('start-pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
    }
    
    bindEvents() {
        this.startPauseBtn.addEventListener('click', () => this.toggleTimer());
        this.resetBtn.addEventListener('click', () => this.reset());
    }
    
    toggleTimer() {
        if (this.isRunning) {
            this.pause();
        } else {
            this.start();
        }
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.startPauseBtn.textContent = 'Pause';
            this.updateStatus();
            
            // Dispatch timer started event
            document.dispatchEvent(new CustomEvent('timerStarted'));
            
            this.intervalId = setInterval(() => {
                this.currentTime--;
                this.updateDisplay();
                
                if (this.currentTime <= 0) {
                    this.sessionComplete();
                }
            }, 1000);
        }
    }
    
    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            this.startPauseBtn.textContent = 'Start';
            clearInterval(this.intervalId);
            this.updateStatus();
            
            // Dispatch timer paused event
            document.dispatchEvent(new CustomEvent('timerPaused'));
        }
    }
    
    reset() {
        this.pause();
        this.isWorkSession = true;
        this.currentTime = this.workTime;
        this.startPauseBtn.textContent = 'Start';
        this.updateDisplay();
        this.updateStatus();
        
        // Dispatch work session event (since we reset to work)
        document.dispatchEvent(new CustomEvent('timerWorkSession'));
    }
    
    sessionComplete() {
        this.pause();
        
        if (this.isWorkSession) {
            // Work session complete, start break
            this.isWorkSession = false;
            this.currentTime = this.breakTime;
            this.updateStatus('Break time! Take a rest 😸');
            
            // Dispatch break event
            document.dispatchEvent(new CustomEvent('timerBreak'));
            
            // Notify the pet (if you want to add special break behavior)
            if (window.petController) {
                window.petController.startBreak();
            }
        } else {
            // Break complete, back to work
            this.isWorkSession = true;
            this.currentTime = this.workTime;
            this.updateStatus('Break over! Ready to focus 💪');
            
            // Dispatch work session event
            document.dispatchEvent(new CustomEvent('timerWorkSession'));
            
            // Notify the pet
            if (window.petController) {
                window.petController.endBreak();
            }
        }
        
        this.updateDisplay();
        // Auto-start next session after 3 seconds
        setTimeout(() => {
            this.start();
        }, 3000);
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        this.displayElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateStatus(customMessage = null) {
        if (customMessage) {
            this.statusElement.textContent = customMessage;
            return;
        }
        
        if (this.isRunning) {
            this.statusElement.textContent = this.isWorkSession ? 'Focus time! 🎯' : 'Break time! 😌';
        } else {
            this.statusElement.textContent = this.isWorkSession ? 'Ready to focus!' : 'Break paused';
        }
    }
}

// Initialize timer
function initTimer() {
    if (window.uiReady) {
        window.pomodoroTimer = new PomodoroTimer();
    } else {
        document.addEventListener('uiReady', () => {
            window.pomodoroTimer = new PomodoroTimer();
        });
    }
}

initTimer();