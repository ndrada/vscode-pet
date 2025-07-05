class PomodoroTimer {
    constructor() {
        this.workTime = 0.2 * 60; // 25 minutes in seconds
        this.breakTime = 0.2 * 60; // 5 minutes in seconds
        this.currentTime = this.workTime;
        this.isRunning = false;
        this.isWorkSession = true;
        this.intervalId = null;
        
        this.initializeElements();
        this.loadState();
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

                
                // Only save state every 5 seconds to reduce overhead
                if (this.currentTime % 5 === 0) {
                    this.saveState();
                }
                
                if (this.currentTime <= 0) {
                    this.sessionComplete();
                }
            }, 1000);
        }
    }
    
    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            this.startPauseBtn.textContent = 'START';
            clearInterval(this.intervalId);
            this.updateStatus();
            this.saveState();
            
            // Dispatch timer paused event
            document.dispatchEvent(new CustomEvent('timerPaused'));
        }
    }
    
    reset() {
        this.pause();
        this.isWorkSession = true;
        this.currentTime = this.workTime;
        this.startPauseBtn.textContent = 'START';
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
            this.updateStatus('Break time! Take a rest');
            
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
            this.updateStatus(
                'Break over! Ready to focus!');
            
            // Dispatch work session event
            document.dispatchEvent(new CustomEvent('timerWorkSession'));
            
            // Notify the pet
            if (window.petController) {
                window.petController.endBreak();
            }
        }
        
        this.updateDisplay();
        // Auto-start next session after 20 seconds
        setTimeout(() => {
            this.start();
        }, 20000);
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
            this.statusElement.textContent = this.isWorkSession ? 'Focus time!' : 'Break time!';
        } else {
            this.statusElement.textContent = this.isWorkSession ? 'Ready to focus!' : 'Break paused';
        }
    }
    
    loadState() {
        try {
            const saved = localStorage.getItem('pomodoroState');
            console.log('Loading state:', saved);
            
            if (saved) {
                const state = JSON.parse(saved);
                const timePassed = Math.floor((Date.now() - state.lastSaved) / 1000);
                
                //only restore state if it's valid and the timer wasn't expired
                if(
                    typeof state.isWorkSession === 'boolean' &&
                    typeof state.currentTime === 'number' &&
                    typeof state.isRunning === 'boolean'
                ){
                    //only use saved state if there is still time left
                    const timeLeft = Math.max(0, state.currentTime - timePassed);
                    if(timeLeft > 0){
                        this.isWorkSession = state.isWorkSession;
                        this.currentTime = timeLeft;
                        this.isRunning = false; //always start paused on reload;
                    } else {
                        //session expired, reset to new work session
                        this.isWorkSession = true;
                        this.currentTime = this.workTime;
                        this.isRunning = false;
                    }
                } else {
                    //invalid saved state, start fresh
                    this.isWorkSession = true;
                    this.currentTime = this.workTime;
                    this.isRunning = false;
                }
            } else {
                //no saved state, start fresh
                this.isWorkSession = true;
                this.currentTime = this.workTime;
                this.isRunning = false;
            }
        } catch (error) {
            console.error('Error loading timer state:', error);
            this.isWorkSession = true;
            this.currentTime = this.workTime;
            this.isRunning = false;
        }
    }
    
    saveState() {
        const state = {
            currentTime: this.currentTime,
            isWorkSession: this.isWorkSession,
            isRunning: this.isRunning,
            lastSaved: Date.now()
        };
        localStorage.setItem('pomodoroState', JSON.stringify(state));
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