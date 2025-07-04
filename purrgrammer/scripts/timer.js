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
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.startBtn.textContent = 'Running...';
            this.startBtn.disabled = true;
            this.updateStatus();
            
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
            this.startBtn.textContent = 'Start';
            this.startBtn.disabled = false;
            clearInterval(this.intervalId);
            this.updateStatus();
        }
    }
    
    reset() {
        this.pause();
        this.isWorkSession = true;
        this.currentTime = this.workTime;
        this.updateDisplay();
        this.updateStatus();
    }
    
    sessionComplete() {
        this.pause();
        
        if (this.isWorkSession) {
            // Work session complete, start break
            this.isWorkSession = false;
            this.currentTime = this.breakTime;
            this.updateStatus('Break time! Take a rest 😸');
            
            // Notify the pet (if you want to add special break behavior)
            if (window.petController) {
                window.petController.startBreak();
            }
        } else {
            // Break complete, back to work
            this.isWorkSession = true;
            this.currentTime = this.workTime;
            this.updateStatus('Break over! Ready to focus 💪');
            
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

// At the end of the file, replace the initialization with:
function initTimer() {
    if (window.uiReady) {
        window.pomodoroTimer = new PomodoroTimer();
    } else {
        document.addEventListener('uiReady', () => {
            window.pomodoroTimer = new PomodoroTimer();
        });
    }
}

// Initialize timer
initTimer();