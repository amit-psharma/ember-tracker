import { habitColorPairs } from './storage.js';

export function renderMonthlyCalendar(containerId, year, month, logs, selectedHabit = null) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Pad empty days
  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'cal-cell';
    container.appendChild(emptyCell);
  }
  
  const todayStr = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + String(new Date().getDate()).padStart(2, '0');
  
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    const log = logs[dateStr];
    
    const cell = document.createElement('div');
    cell.className = 'cal-cell active';
    cell.textContent = d;
    
    if (selectedHabit) {
      // Single Habit Mode
      cell.style.backgroundColor = '#3C3A37'; // empty dark circle
      cell.style.color = 'rgba(255,255,255,0.5)';
      
      const isCompleted = log && log.habits && log.habits.includes(selectedHabit.id);
      if (isCompleted) {
        cell.classList.add('filled');
        // Habit Builder uses a light blue or green for filled in details view. Let's use the habit's bg color.
        const colorPair = habitColorPairs[selectedHabit.colorIdx];
        cell.style.backgroundColor = colorPair.bg; 
        cell.style.color = '#000';
      }
    } else {
      // Global Heatmap Mode
      cell.style.backgroundColor = 'transparent';
      const habitsCompleted = (log && log.habits) ? log.habits.length : 0;
      
      if (habitsCompleted > 0) {
        cell.classList.add('filled');
        cell.style.color = '#fff';
        // Colors: light greenish to dark green based on intensity
        const levels = ['#B9C6B6', '#A5B49F', '#7C9A74', '#548152'];
        const levelIdx = Math.min(habitsCompleted - 1, levels.length - 1);
        cell.style.backgroundColor = levels[levelIdx];
        
        // Let's add border radius
        cell.style.borderRadius = '50%';
      } else {
        cell.style.backgroundColor = '#E5DAC8'; // empty circle color
        cell.style.color = 'rgba(0,0,0,0.5)';
      }
    }
    
    container.appendChild(cell);
  }
}

export function renderTopHabits(habits) {
  const container = document.getElementById('top-habits-list');
  container.innerHTML = '';
  
  // Sort habits by total completion
  const sorted = [...habits].sort((a, b) => (b.total || 0) - (a.total || 0));
  const maxTotal = sorted.length > 0 ? (sorted[0].total || 1) : 1;
  
  sorted.forEach((habit, index) => {
    const row = document.createElement('div');
    row.className = 'top-habit-row';
    
    const idx = document.createElement('div');
    idx.className = 'th-index';
    idx.textContent = (index + 1) + '.';
    
    const name = document.createElement('div');
    name.className = 'th-name';
    name.textContent = habit.name;
    
    const count = document.createElement('div');
    count.className = 'th-count';
    count.textContent = habit.total || 0;
    
    const barContainer = document.createElement('div');
    barContainer.className = 'th-bar-container';
    
    const bar = document.createElement('div');
    bar.className = 'th-bar';
    const pct = ((habit.total || 0) / maxTotal) * 100;
    bar.style.width = pct + '%';
    
    barContainer.appendChild(bar);
    
    const arrow = document.createElement('div');
    arrow.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="opacity:0.5"><path d="M9 18l6-6-6-6"/></svg>';
    
    row.appendChild(idx);
    row.appendChild(name);
    row.appendChild(count);
    row.appendChild(barContainer);
    row.appendChild(arrow);
    
    container.appendChild(row);
  });
}
