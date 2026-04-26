import { playKalimbaPluck } from './audio.js';
import { triggerHaptic, triggerCracker } from './animations.js';

export class PomodoroTimer {
  constructor(displayEl, toggleBtn, resetBtn, sessionsEl) {
    this.displayEl = displayEl;
    this.toggleBtn = toggleBtn;
    this.resetBtn = resetBtn;
    this.sessionsEl = sessionsEl;
    
    this.focusTime = 25 * 60; // 25 mins
    this.timeLeft = this.focusTime;
    this.isRunning = false;
    this.intervalId = null;
    this.sessionsCompleted = 0;
    
    this.toggleBtn.addEventListener('click', () => this.toggle());
    this.resetBtn.addEventListener('click', () => this.reset());
    
    this.updateDisplay();
  }
  
  toggle() {
    triggerHaptic(20);
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  }
  
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.toggleBtn.textContent = 'Pause';
    
    this.intervalId = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.completeSession();
      }
      this.updateDisplay();
    }, 1000);
  }
  
  pause() {
    if (!this.isRunning) return;
    this.isRunning = false;
    this.toggleBtn.textContent = 'Resume';
    clearInterval(this.intervalId);
  }
  
  reset() {
    triggerHaptic(20);
    this.pause();
    this.timeLeft = this.focusTime;
    this.toggleBtn.textContent = 'Start';
    this.updateDisplay();
  }
  
  completeSession() {
    this.pause();
    this.sessionsCompleted++;
    this.sessionsEl.textContent = this.sessionsCompleted;
    this.timeLeft = this.focusTime;
    this.toggleBtn.textContent = 'Start';
    this.updateDisplay();
    
    // Play completion sound and animation
    playKalimbaPluck(true);
    triggerHaptic([100, 50, 100, 50, 200]);
    triggerCracker(document.body);
  }
  
  updateDisplay() {
    const mins = Math.floor(this.timeLeft / 60);
    const secs = this.timeLeft % 60;
    this.displayEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
}
