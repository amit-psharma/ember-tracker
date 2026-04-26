const STORAGE_KEY = 'ember_data_v2';

// The new design uses specific pastel backgrounds and dark filled circle colors.
export const habitColorPairs = [
  { bg: '#FBDD9E', fill: '#9B6C13' }, // Yellow
  { bg: '#C1E1FD', fill: '#015F97' }, // Blue
  { bg: '#FBC9BC', fill: '#A83111' }, // Red
  { bg: '#8BF0A2', fill: '#006B33' }  // Green
];

export function getTodayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

const defaultData = {
  habits: [
    { id: '1', name: 'Meditate', frequency: 'daily', createdAt: Date.now(), streak: 0, missed: 0, colorIdx: 0 },
    { id: '2', name: 'Exercise for 10 min', frequency: 'daily', createdAt: Date.now(), streak: 0, missed: 0, colorIdx: 1 },
    { id: '3', name: 'Read for 20 min', frequency: 'daily', createdAt: Date.now(), streak: 0, missed: 0, colorIdx: 2 },
    { id: '4', name: 'Plan my day', frequency: 'daily', createdAt: Date.now(), streak: 0, missed: 0, colorIdx: 3 }
  ],
  logs: {}
};

export function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { ...defaultData };
  
  try {
    const data = JSON.parse(raw);
    
    // Migrate colors
    if (data.habits) {
      data.habits = data.habits.map((h, i) => ({ 
        ...h, 
        streak: h.streak || 0,
        missed: h.missed || 0,
        colorIdx: h.colorIdx !== undefined ? h.colorIdx : i % habitColorPairs.length
      }));
    }
    
    return data;
  } catch (e) {
    console.error('Failed to parse storage, returning default.', e);
    return { ...defaultData };
  }
}

export function recalculateStats(data) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  data.habits.forEach(habit => {
    let currentStreak = 0;
    let missed = 0;
    let total = 0;
    let hasFoundFirstCompletion = false;
    
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      
      const log = data.logs[dateStr];
      const isCompleted = log && log.habits && log.habits.includes(habit.id);
      
      if (isCompleted) {
        total++;
        if (missed === 0) currentStreak++;
        hasFoundFirstCompletion = true;
      } else if (i > 0) { 
        if (currentStreak > 0) {
          // streak broken
        } else if (hasFoundFirstCompletion) {
          // Stop counting missed days once we've reached a previous active period, 
          // or just count missed days since the last streak broke.
        } else {
          missed++;
        }
      }
    }
    
    // Quick fix: If no completions ever, missed is 0
    if (total === 0) missed = 0;
    
    habit.streak = currentStreak;
    habit.missed = missed; // Simple heuristic for now
    habit.total = total;
  });
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function exportData() {
  const data = localStorage.getItem(STORAGE_KEY);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ember_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
}
