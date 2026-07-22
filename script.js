// JS: Ineractivity w/ Development 

// === WEEK LOGIC ===

// This tracks how many weeks away from the current week we are
// 0 = this week, -1 = last week, 1 = next week
let weekOffset = 0;

// Gets the Monday of whatever week we're looking at
function getMonday(offset) {
  const today = new Date();
  const day = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust to Monday
  const monday = new Date(today.setDate(diff + offset * 7));
  return monday;
}

// Builds an array of 7 dates starting from Monday
function getWeekDates(offset) {
  const monday = getMonday(offset);
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date);
  }
  return dates;
}

// Formats a date as "Mon 27" style
function formatLabel(date) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()] + ' ' + date.getDate();
}

// Formats a date as a simple key like "2026-05-27"
function formatKey(date) {
  return date.toISOString().split('T')[0];
}

// === SPLASH SCREEN ===
function runSplash() {
  // Set greeting on splash too
  const hour = new Date().getHours();
  let message;
  if (hour < 12) message = 'hello, good morning.';
  else if (hour < 17) message = 'hello, good afternoon.';
  else if (hour < 21) message = 'hello, good evening.';
  else message = 'hey, still here.';
  document.getElementById('splash-greeting').textContent = message;

  // After 2.8 seconds start fading out splash
  setTimeout(() => {
    const splash = document.getElementById('splash');
    splash.style.opacity = '0';

    // After fade out remove splash and fade in tracker
    setTimeout(() => {
      splash.style.display = 'none';
      document.getElementById('tracker').style.opacity = '1';
    }, 1200);
  }, 2800);
}

// === GREETING ===
function setGreeting() {
  const hour = new Date().getHours();
  let message;

  if (hour < 12) {
    message = 'hello, good morning.';
  } else if (hour < 17) {
    message = 'hello, good afternoon.';
  } else if (hour < 21) {
    message = 'hello, good evening.';
  } else {
    message = 'hey, still here.';
  }

  document.getElementById('greeting').textContent = message;
}

// === SUMMARY ===
function updateSummary() {
  const dates = getWeekDates(weekOffset);
  const today = new Date().toISOString().split('T')[0];
  const rows = document.querySelectorAll('.habit-row:not(#day-headers)');

  let totalChecked = 0;
  let totalPossible = 0;
  const activeDays = new Set();

  rows.forEach(row => {
    const habitName = row.querySelector('.habit-name').textContent.trim();
    dates.forEach((date, i) => {
      const dateKey = formatKey(date);
      if (dateKey <= today) {
        totalPossible++;
        const id = habitName + '-' + dateKey;
        if (localStorage.getItem(id) === 'checked') {
          totalChecked++;
          activeDays.add(dateKey);
        }
      }
    });
  });

  // Update counts
  document.getElementById('moments-count').textContent =
    totalChecked === 1 ? '1 moment' : `${totalChecked} moments`;
  document.getElementById('active-days').textContent =
    activeDays.size === 1 ? '1 active day' : `${activeDays.size} active days`;

  // Update progress bar
  const percent = totalPossible === 0 ? 0 : (totalChecked / totalPossible) * 100;
  document.getElementById('progress-bar').style.width = percent + '%';

  // Soft message based on progress
  let message;
  if (totalChecked === 0) {
    message = 'a fresh week. no pressure, just presence.';
  } else if (percent < 25) {
    message = 'something is always better than nothing.';
  } else if (percent < 50) {
    message = 'you\'re showing up. that counts.';
  } else if (percent < 75) {
    message = 'more than halfway there. keep going.';
  } else if (percent < 100) {
    message = 'almost a full week. this is what consistency looks like.';
  } else {
    message = 'a complete week. you showed up for yourself.';
  }
  document.getElementById('summary-message').textContent = message;
}

// === RENDER ===

function renderWeek() {
  const dates = getWeekDates(weekOffset);
  const today = new Date().toISOString().split('T')[0];

  // Update the week label
  const start = dates[0];
  const end = dates[6];
  document.getElementById('week-label').textContent =
    start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' – ' +
    end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Update day headers
    const dayHeaders = document.querySelectorAll('#day-headers .day-label');
    dayHeaders.forEach((label, i) => {
    label.textContent = formatLabel(dates[i]);

    // Highlight today's column
    const dateHighlight = formatKey(dates[i]);
    if (dateHighlight === today) {
        label.classList.add('today');
    } else {
        label.classList.remove('today');
    }
        updateSummary();
    });

  // Update each cell's data-id and locked state
  const rows = document.querySelectorAll('.habit-row:not(#day-headers)');
  rows.forEach(row => {
    const habitName = row.querySelector('.habit-name').textContent.trim();
    const cells = row.querySelectorAll('.cell');
    cells.forEach((cell, i) => {
      const dateKey = formatKey(dates[i]);
      const id = habitName + '-' + dateKey;
      cell.setAttribute('data-id', id);

      // Restore checked state
      cell.classList.remove('checked');
      if (localStorage.getItem(id) === 'checked') {
        cell.classList.add('checked');
      }

      // Lock future days
      if (dateKey > today) {
        cell.classList.add('locked');
      } else {
        cell.classList.remove('locked');
      }

     // Highlight today's column
    if (dateKey === today) {
    cell.classList.add('today-col');
    } else {
    cell.classList.remove('today-col');
    }
    });
  });
}


// === CLICK HANDLER ===

document.querySelectorAll('.cell').forEach(cell => {
  cell.addEventListener('click', () => {
    if (cell.classList.contains('locked')) return;
    cell.classList.toggle('checked');
    const id = cell.getAttribute('data-id');
    if (cell.classList.contains('checked')) {
      localStorage.setItem(id, 'checked');
    } else {
      localStorage.removeItem(id);
    }
    updateSummary();
  });
});

// === CLEAR WEEK ===
document.getElementById('clear-week').addEventListener('click', () => {
  const dates = getWeekDates(weekOffset);
  const rows = document.querySelectorAll('.habit-row:not(#day-headers)');

  rows.forEach(row => {
    const habitName = row.querySelector('.habit-name').textContent.trim();
    dates.forEach(date => {
      const id = habitName + '-' + formatKey(date);
      localStorage.removeItem(id);
    });
  });

  renderWeek();
}); 

// === NAVIGATION ===

document.getElementById('prev-week').addEventListener('click', () => {
  weekOffset--;
  renderWeek();
});

document.getElementById('next-week').addEventListener('click', () => {
  weekOffset++;
  renderWeek();

});

//Rotating Quotes
const quotes = [
    "This too shall pass.",
    "Sometimes when you're in a dark place, you think you’ve been buried, but you’ve actually been planted.",
    "Hope is being able to see that there is light despite all of the darkness.",
    "You don’t have to see the whole staircase, just take the first step.",
    "No feeling is final.",
    "You are allowed to be both a masterpiece and a work in progress, simultaneously.",
    "You may have to fight a battle more than once to win it.",
    "Out of suffering have emerged the strongest souls; the most massive characters are seared with scars."
]

function setQuote(){
    const index = Math.floor(Math.random()*quotes.length);
    document.getElementById('rotating-quotes').textContent = quotes[index];
}
    setQuote();
// === INIT ===
renderWeek();
setGreeting();
runSplash();


