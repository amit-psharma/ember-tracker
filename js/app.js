import { loadData, saveData, getTodayStr, recalculateStats, habitColorPairs } from './storage.js';
import { renderHabitsDashboard, renderDashboardDateStrip } from './habits.js';
import { renderMonthlyCalendar, renderTopHabits } from './insights.js';
import { initAudio, playClick } from './audio.js';
import { PomodoroTimer } from './timer.js';
import { triggerHaptic, triggerCracker } from './animations.js';
import { initQuotesCarousel } from './quotes.js';

let state = null;
let currentView = 'view-dashboard';
let insightsDate = new Date();
let detailsDate = new Date();
let activeHabitForDetails = null;

document.addEventListener('DOMContentLoaded', () => {
  state = loadData();
  recalculateStats(state);
  saveData(state);
  
  initUI();
  updateDashboard();
});

function initUI() {
  // Global click listener for audio/haptics on interactive elements
  document.body.addEventListener('click', (e) => {
    initAudio(); // Resumes AudioContext on first interaction
    const isButton = e.target.closest('button') || e.target.closest('.habit-card') || e.target.closest('.cal-nav');
    if (isButton && !e.target.closest('.circle')) { // Circles have their own haptic
      playClick();
      triggerHaptic(20);
    }
  });

  // Main Navigation
  document.querySelectorAll('.nav-item').forEach(navBtn => {
    navBtn.addEventListener('click', (e) => {
      const targetView = e.currentTarget.getAttribute('data-target');
      switchView(targetView);
      
      // Update active state
      document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
      e.currentTarget.classList.add('active');
    });
  });

  document.getElementById('back-from-details-btn').addEventListener('click', () => switchView('view-dashboard'));

  // Modals & Sheets
  setupBottomSheets();
  
  // Initialize Quotes
  initQuotesCarousel('quotes-carousel');
  
  // Initialize Timer
  new PomodoroTimer(
    document.getElementById('pomodoro-display'),
    document.getElementById('pomodoro-toggle'),
    document.getElementById('pomodoro-reset'),
    document.getElementById('pomodoro-sessions')
  );
  
  // Calendars
  document.getElementById('prev-month-btn').addEventListener('click', () => {
    insightsDate.setMonth(insightsDate.getMonth() - 1);
    updateInsights();
  });
  document.getElementById('next-month-btn').addEventListener('click', () => {
    insightsDate.setMonth(insightsDate.getMonth() + 1);
    updateInsights();
  });
  
  document.getElementById('details-prev-month').addEventListener('click', () => {
    detailsDate.setMonth(detailsDate.getMonth() - 1);
    updateDetails();
  });
  document.getElementById('details-next-month').addEventListener('click', () => {
    detailsDate.setMonth(detailsDate.getMonth() + 1);
    updateDetails();
  });
}

function switchView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
  document.getElementById(viewId).classList.add('active-view');
  currentView = viewId;
  
  if (viewId === 'view-dashboard') updateDashboard();
  if (viewId === 'view-insights') updateInsights();
  if (viewId === 'view-habit-details') updateDetails();
}

function updateDashboard() {
  renderDashboardDateStrip();
  renderHabitsDashboard(state.habits, state.logs, handleHabitToggle, openHabitDetails);
}

function updateInsights() {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  document.getElementById('calendar-month-year').textContent = monthNames[insightsDate.getMonth()];
  
  renderMonthlyCalendar('calendar-grid', insightsDate.getFullYear(), insightsDate.getMonth(), state.logs, null);
  renderTopHabits(state.habits);
}

function updateDetails() {
  if (!activeHabitForDetails) return;
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  document.getElementById('details-calendar-month-year').textContent = monthNames[detailsDate.getMonth()];
  
  // Set details hero color
  const colorPair = habitColorPairs[activeHabitForDetails.colorIdx];
  const hero = document.getElementById('details-hero');
  const header = document.getElementById('details-header');
  hero.style.backgroundColor = colorPair.fill;
  header.style.backgroundColor = colorPair.fill;
  
  document.getElementById('details-title').textContent = activeHabitForDetails.name;
  document.getElementById('stat-total').textContent = activeHabitForDetails.total || 0;
  document.getElementById('stat-week').textContent = calculateTimesThisWeek(activeHabitForDetails.id);
  
  // Calculate completion rate
  const created = new Date(activeHabitForDetails.createdAt);
  const now = new Date();
  const diffTime = Math.abs(now - created);
  const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const rate = Math.round(((activeHabitForDetails.total || 0) / diffDays) * 100);
  document.getElementById('stat-rate').textContent = `${rate}%`;
  
  renderMonthlyCalendar('details-calendar-grid', detailsDate.getFullYear(), detailsDate.getMonth(), state.logs, activeHabitForDetails);
}

function calculateTimesThisWeek(habitId) {
  let count = 0;
  const today = new Date();
  today.setHours(0,0,0,0);
  // Last 7 days
  for(let i=0; i<7; i++){
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    if (state.logs[dStr] && state.logs[dStr].habits.includes(habitId)) {
      count++;
    }
  }
  return count;
}

function handleHabitToggle(habitId, dateStr) {
  triggerHaptic(40);
  
  if (!state.logs[dateStr]) {
    state.logs[dateStr] = { habits: [] };
  }
  
  const isCurrentlyCompleted = state.logs[dateStr].habits.includes(habitId);
  
  if (isCurrentlyCompleted) {
    state.logs[dateStr].habits = state.logs[dateStr].habits.filter(id => id !== habitId);
  } else {
    state.logs[dateStr].habits.push(habitId);
  }
  
  // Check if this newly formed a streak > 1 to fire cracker
  const habitBefore = state.habits.find(h => h.id === habitId);
  const streakBefore = habitBefore ? habitBefore.streak : 0;
  
  recalculateStats(state);
  
  const habitAfter = state.habits.find(h => h.id === habitId);
  if (!isCurrentlyCompleted && habitAfter && habitAfter.streak > 1 && habitAfter.streak > streakBefore) {
    // Fired by toggle in dashboard, so let's fire cracker on the body
    triggerCracker(document.body);
  }
  
  saveData(state);
  updateDashboard();
}

function openHabitDetails(habit) {
  activeHabitForDetails = habit;
  detailsDate = new Date(); // reset to current month
  switchView('view-habit-details');
}

function setupBottomSheets() {
  const addSheet = document.getElementById('add-habit-sheet');
  const addBtn = document.getElementById('add-habit-btn');
  const addInput = document.getElementById('new-habit-input');
  
  addBtn.addEventListener('click', () => {
    addSheet.setAttribute('aria-hidden', 'false');
    setTimeout(() => addInput.focus(), 300);
  });

  document.getElementById('save-habit-btn').addEventListener('click', () => {
    if (!addInput.value.trim()) return;
    
    const name = addInput.value.trim();
    
    // Assign next color index
    const colorIdx = state.habits.length % habitColorPairs.length;

    state.habits.push({
      id: Date.now().toString(),
      name, frequency: 'daily', createdAt: Date.now(), streak: 0, total: 0, colorIdx
    });
    
    saveData(state);
    updateDashboard();
    
    addSheet.setAttribute('aria-hidden', 'true');
    addInput.value = '';
  });

  document.querySelectorAll('.sheet-handle').forEach(handle => {
    handle.addEventListener('click', (e) => {
      e.target.closest('.bottom-sheet').setAttribute('aria-hidden', 'true');
    });
  });
}
