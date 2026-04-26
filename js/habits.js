import { getTodayStr, habitColorPairs } from './storage.js';

export function renderDashboardDateStrip() {
  const container = document.getElementById('dashboard-date-strip');
  container.innerHTML = '';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Show 5 days ending today
  for (let i = 4; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    
    const node = document.createElement('div');
    node.className = 'date-node';
    
    const dayNum = document.createElement('div');
    dayNum.className = 'day-num';
    dayNum.textContent = d.getDate();
    
    const dayName = document.createElement('div');
    dayName.className = 'day-name';
    dayName.textContent = d.toLocaleDateString('en-US', { weekday: 'short' });
    
    node.appendChild(dayNum);
    node.appendChild(dayName);
    container.appendChild(node);
  }
}

export function renderHabitsDashboard(habits, logs, onHabitToggle, onHabitTap) {
  const container = document.getElementById('habits-list');
  container.innerHTML = '';
  
  const todayStr = getTodayStr();
  const today = new Date();
  today.setHours(0,0,0,0);
  
  habits.forEach(habit => {
    const colorPair = habitColorPairs[habit.colorIdx] || habitColorPairs[0];
    
    const card = document.createElement('div');
    card.className = 'habit-card';
    card.style.backgroundColor = colorPair.bg;
    
    // Header text
    const header = document.createElement('div');
    header.className = 'card-header';
    
    const textGroup = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'habit-name';
    name.textContent = habit.name;
    name.style.color = colorPair.fill; // dark text
    
    const stats = document.createElement('div');
    stats.className = 'habit-stats';
    stats.style.color = colorPair.fill;
    
    if (habit.streak >= 21) {
      stats.textContent = `🎉 21-Day Habit Formed! (${habit.total} total)`;
    } else if (habit.streak > 0) {
      stats.textContent = `Day ${habit.streak} of 21`;
    } else if (habit.total > 0) {
      stats.textContent = `Missed yesterday • ${habit.total} total`;
    } else {
      stats.textContent = `Start your 21-day journey`;
    }
    
    textGroup.appendChild(name);
    textGroup.appendChild(stats);
    header.appendChild(textGroup);
    card.appendChild(header);
    
    // 5-Day Circles
    const circlesRow = document.createElement('div');
    circlesRow.className = 'circles-row';
    
    for (let i = 4; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      
      const circle = document.createElement('div');
      circle.className = 'circle';
      
      const log = logs[dStr];
      const isCompleted = log && log.habits && log.habits.includes(habit.id);
      
      if (isCompleted) {
        circle.classList.add('filled');
        circle.style.backgroundColor = colorPair.fill;
      } else {
        circle.classList.add('empty');
        circle.style.borderColor = colorPair.fill;
      }
      
      if (i === 0) {
        circle.classList.add('today');
        const dot = document.createElement('div');
        dot.className = 'dot';
        if(!isCompleted) {
            dot.style.backgroundColor = colorPair.fill;
        }
        circle.appendChild(dot);
      }
      
      // Tap to toggle
      circle.addEventListener('click', (e) => {
        e.stopPropagation();
        onHabitToggle(habit.id, dStr);
      });
      
      circlesRow.appendChild(circle);
    }
    
    card.appendChild(circlesRow);
    
    // Tap card to open details
    card.addEventListener('click', () => {
      onHabitTap(habit);
    });
    
    container.appendChild(card);
  });
}
