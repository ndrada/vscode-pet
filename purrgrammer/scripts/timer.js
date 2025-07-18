class PomodoroTimer {
    constructor() {
        this.workTime = 25 * 60; // 25 minutes in seconds
        this.breakTime = 5 * 60; // 5 minutes in seconds
        this.currentTime = this.workTime;
        this.isRunning = false;
        this.isWorkSession = true;
        this.intervalId = null;
        this.autoStartTimeout = null; // auto-start
        this.isFirstSession = true; // track if it's the first work session
        
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
            
            //timer started event
            document.dispatchEvent(new CustomEvent('timerStarted'));
            
            this.intervalId = setInterval(() => {
                this.currentTime--;
                this.updateDisplay();

                //sound logic
                //play ticking sound for last 5 second for work and break
                if(this.currentTime === 5 && window.soundManager){
                    window.soundManager.playTicking();
                }

                if(this.currentTime === 1 && window.soundManager){
                    window.soundManager.fadeOutTicking();
                }
                
                // at 0 play meow
                if(this.currentTime === 0 && window.soundManager){
                    window.soundManager.meow.currentTime = 0;
                    window.soundManager.playMeow();
                }
                
                // only save state every 5 seconds to reduce overhead
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
            clearInterval(this.intervalId);
            this.startPauseBtn.textContent = 'Start';
            
            // clear autostart if paused manually
            if (this.autoStartTimeout) {
                clearInterval(this.autoStartTimeout);
                this.autoStartTimeout = null;
                this.startPauseBtn.disabled = false;
            }
            
            // dipatch timer paused event
            document.dispatchEvent(new CustomEvent('timerPaused'));
        }
    }
    
    reset() {
        this.pause();
        
        // clear auto start countdown if active
        if (this.autoStartTimeout) {
            clearInterval(this.autoStartTimeout);
            this.autoStartTimeout = null;
            this.startPauseBtn.disabled = false;
        }
        
        this.isWorkSession = true;
        this.isFirstSession = true; // reset to first sesh
        this.currentTime = this.workTime;
        this.updateDisplay();
        this.updateStatus();
        
        // dispath reset event
        document.dispatchEvent(new CustomEvent('timerReset'));
    }
    
    sessionComplete() {
        this.pause();
        
        if (this.isWorkSession) {
            //start break
            this.isWorkSession = false;
            this.currentTime = this.breakTime;
            this.updateStatus('Break time! Take a rest');
            
            // dispath break event
            document.dispatchEvent(new CustomEvent('timerBreak'));
            
            // notify pet
            if (window.petController) {
                window.petController.startBreak();
            }
        } else {
            //back to work
            this.isWorkSession = true;
            this.currentTime = this.workTime;
            this.updateStatus(
                'Break over! Ready to focus!');
            
            //dispath work sesh event
            document.dispatchEvent(new CustomEvent('timerWorkSession'));
            
            //notify pet
            if (window.petController) {
                window.petController.endBreak();
            }
        }
        
        this.updateDisplay();
        //autostart next session after 20 seconds
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
                        this.isRunning = false; //always start paused on reload
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

// initialize timer
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