// script.js

// Завантаження даних користувача
window.addEventListener('load', () => {
  const page = location.pathname;
  if (page.includes('registration')) {
    document.getElementById('registrationForm').addEventListener('submit', handleRegistration);
  } else if (page.includes('tracker')) {
    loadTracker();
  }
});

function handleRegistration(e) {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const age = parseInt(document.getElementById('age').value);
  const gender = document.getElementById('gender').value;
  const height = parseInt(document.getElementById('height').value);
  const weight = parseInt(document.getElementById('weight').value);
  const activity = document.getElementById('activity').value;
  const goal = document.getElementById('goal').value;

  const customEnabled = document.getElementById('customValuesToggle')?.checked || false;
  const safeLoss = document.getElementById('safeLoss')?.checked || false;
  const lossType = parseFloat(document.getElementById('lossType')?.value || 0);

  let calories = 2000;
  if (customEnabled) {
    calories = parseInt(document.getElementById('customCalories').value) || 2000;
  } else {
    const bmr = gender === 'Жінка'
      ? 10 * weight + 6.25 * height - 5 * age - 161
      : 10 * weight + 6.25 * height - 5 * age + 5;
    calories = bmr * 1.4;

    if (goal === 'Схуднення') {
      if (safeLoss) {
        calories -= 250;
      } else {
        calories -= lossType * 1000;
      }
    } else if (goal === 'Набір ваги') {
      calories += 300;
    }
  }
  calories = Math.max(1000, Math.min(4000, Math.round(calories)));

  let water = 2000;
  if (customEnabled) {
    const glasses = parseInt(document.getElementById('customWater').value) || 8;
    water = glasses * 250;
  } else {
    water = Math.round((weight * 30) / 250) * 250;
  }

  let steps = 10000;
  if (customEnabled) {
    steps = parseInt(document.getElementById('customSteps').value) || 10000;
  } else {
    if (activity === 'Малоактивний') steps = 8000;
    if (activity === 'Активний') steps = 12000;
    if (goal === 'Схуднення') steps += 2000;
    if (goal === 'Набір ваги') steps -= 1000;
    if (age > 50) steps -= 1000;
    if (age < 25) steps += 500;
  }

  localStorage.setItem('glowfit', JSON.stringify({ name, calories, water, steps }));
  localStorage.setItem('progress', JSON.stringify({ water: 0, calories: 0, steps: 0 }));
  location.href = 'tracker.html';
}

function loadTracker() {
  savePreviousDay();
  const data = JSON.parse(localStorage.getItem('glowfit') || '{}');
  const progress = JSON.parse(localStorage.getItem('progress') || '{}');
  if (!data.name) location.href = 'registration.html';

  document.getElementById('welcome').innerHTML = `👋 Привіт, <b>${data.name}</b>!`;

  setTracker('water', data.water, progress.water);
  setTracker('calories', data.calories, progress.calories);
  setTracker('steps', data.steps, progress.steps);

  const proteins = Math.round((data.calories * 0.3) / 4);
  const fats = Math.round((data.calories * 0.25) / 9);
  const carbs = Math.round((data.calories * 0.45) / 4);
  document.getElementById('macros').innerText = `Б: ${proteins} г | Ж: ${fats} г | В: ${carbs} г`;
}

function setTracker(type, max, current = 0) {
  document.getElementById(`${type}Progress`).max = max;
  document.getElementById(`${type}Progress`).value = current;
  document.getElementById(`${type}Text`).innerText = `${current} / ${max} ${type === 'steps' ? '' : type === 'calories' ? 'ккал' : 'мл'}`;
}

function savePreviousDay() {
  const today = new Date().toISOString().split('T')[0];
  const lastSaved = localStorage.getItem('lastSavedDate');
  if (lastSaved !== today) {
    const history = JSON.parse(localStorage.getItem('history') || '{}');
    const prevProgress = JSON.parse(localStorage.getItem('progress') || '{}');
    if (lastSaved) {
      history[lastSaved] = prevProgress;
      localStorage.setItem('history', JSON.stringify(history));
    }
    localStorage.setItem('lastSavedDate', today);
    localStorage.setItem('progress', JSON.stringify({ water: 0, calories: 0, steps: 0 }));
  }
}

function addValue(type) {
  const value = prompt(`Скільки ${type === 'water' ? 'мл води' : type === 'calories' ? 'ккал' : 'кроків'} додати?`);
  if (!value || isNaN(value)) return;
  const progress = JSON.parse(localStorage.getItem('progress') || '{}');
  progress[type] = (progress[type] || 0) + parseInt(value);
  localStorage.setItem('progress', JSON.stringify(progress));
  loadTracker();
}
