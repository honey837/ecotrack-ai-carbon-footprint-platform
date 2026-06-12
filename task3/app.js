/* ============================================
   CANOPY — Carbon Footprint Awareness Platform
   App Logic — Quiz Flow, Score Engine, Rendering
   (Polished Version)
   ============================================ */

// ─── STATE ─────────────────────────────────────
const quizKeys = Object.keys(EMISSION_DATA);
let currentStep = 0;
let answers = {};

// ─── SCREEN MANAGEMENT ────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(id);
  screen.classList.add('active');
  // Re-trigger entrance animation
  screen.style.animation = 'none';
  screen.offsetHeight;
  screen.style.animation = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── QUIZ ──────────────────────────────────────
function startQuiz() {
  currentStep = 0;
  answers = {};
  showScreen('screen-quiz');
  renderQuestion();
}

function goBack() {
  if (currentStep > 0) {
    currentStep--;
    renderQuestion();
  } else {
    showScreen('screen-welcome');
  }
}

function renderQuestion() {
  const key = quizKeys[currentStep];
  const data = EMISSION_DATA[key];
  const total = quizKeys.length;

  // Back button visibility
  const backBtn = document.getElementById('quiz-back-btn');
  backBtn.style.opacity = '1';

  // Progress dots
  const progressHTML = quizKeys.map((_, i) => {
    let cls = 'quiz-progress-dot';
    if (i < currentStep) cls += ' filled';
    else if (i === currentStep) cls += ' current';
    return `<div class="${cls}"></div>`;
  }).join('');
  document.getElementById('quiz-progress').innerHTML = progressHTML;

  // Counter
  document.getElementById('quiz-counter').textContent = `${currentStep + 1}/${total}`;

  // Icon with bounce
  const iconEl = document.getElementById('quiz-icon');
  iconEl.textContent = data.icon;
  iconEl.style.animation = 'none';
  iconEl.offsetHeight;
  iconEl.style.animation = 'iconBounce 0.5s cubic-bezier(0.22, 1, 0.36, 1)';

  // Question
  document.getElementById('quiz-question').textContent = data.question;

  // Options — check if previously answered
  const previousAnswer = answers[key];
  const optionsHTML = data.options.map((opt, i) => {
    const isSelected = previousAnswer === opt.tons ? ' selected' : '';
    return `
      <button class="quiz-option${isSelected}" onclick="selectOption('${key}', ${i})" id="opt-${i}">
        <span class="quiz-option-radio"></span>
        ${opt.label}
      </button>
    `;
  }).join('');
  
  const optContainer = document.getElementById('quiz-options');
  optContainer.innerHTML = optionsHTML;

  // Stagger option animations
  const options = optContainer.querySelectorAll('.quiz-option');
  options.forEach((opt, i) => {
    opt.style.opacity = '0';
    opt.style.transform = 'translateY(10px)';
    setTimeout(() => {
      opt.style.transition = 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)';
      opt.style.opacity = '1';
      opt.style.transform = 'translateY(0)';
    }, 60 + i * 50);
  });
}

function selectOption(key, index) {
  const option = EMISSION_DATA[key].options[index];
  answers[key] = option.tons;

  // Visual feedback
  document.querySelectorAll('.quiz-option').forEach(el => el.classList.remove('selected'));
  const selectedEl = document.getElementById(`opt-${index}`);
  selectedEl.classList.add('selected');

  // Auto-advance after short delay
  setTimeout(() => {
    currentStep++;
    if (currentStep < quizKeys.length) {
      renderQuestion();
    } else {
      calculateAndShowResults();
    }
  }, 400);
}

// ─── SCORE CALCULATION ─────────────────────────
function calculateScore() {
  let total = 0;
  const breakdown = [];

  for (const key of quizKeys) {
    const tons = answers[key] || 0;
    total += tons;
    breakdown.push({
      key,
      tons,
      label: CATEGORIES[key].label,
      icon: CATEGORIES[key].icon,
      color: CATEGORIES[key].color
    });
  }

  // Sort by tons descending
  breakdown.sort((a, b) => b.tons - a.tons);

  // Calculate percentages
  breakdown.forEach(item => {
    item.percent = total > 0 ? Math.round((item.tons / total) * 100) : 0;
  });

  return { total: Math.round(total * 10) / 10, breakdown };
}

// ─── RESULTS RENDERING ────────────────────────
function calculateAndShowResults() {
  showScreen('screen-results');
  const { total, breakdown } = calculateScore();

  // Reset animated elements so they replay
  document.querySelectorAll('.animate-in').forEach(el => {
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = '';
  });

  // Animate score count-up
  animateScore(total);

  // Grade badge
  const grade = getGrade(total);
  const gradeEl = document.getElementById('score-grade');
  gradeEl.textContent = `${grade.grade} · ${grade.label}`;
  gradeEl.style.background = grade.color + '15';
  gradeEl.style.color = grade.color;
  gradeEl.style.border = `1.5px solid ${grade.color}30`;

  // Comparison — colorize your score
  const compYou = document.getElementById('comp-you');
  compYou.textContent = total.toFixed(1);
  compYou.style.color = grade.color;

  // Insight callout
  renderInsightCallout(breakdown, total);

  // Breakdown bars
  renderBreakdown(breakdown, total);

  // Equivalencies
  renderEquivalencies(total);

  // Actions
  renderActions(breakdown[0].key);

  // What-if
  renderWhatIf(total, breakdown[0].key);
}

function animateScore(target) {
  const el = document.getElementById('score-number');
  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out quart for dramatic effect
    const eased = 1 - Math.pow(1 - progress, 4);
    el.textContent = (target * eased).toFixed(1);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target.toFixed(1);
    }
  }

  requestAnimationFrame(tick);
}

function renderInsightCallout(breakdown, total) {
  const top = breakdown[0];
  const el = document.getElementById('insight-callout');
  
  const percentStr = top.percent;
  const topLabel = top.label.toLowerCase();
  
  // Contextual insight based on top category
  const insights = {
    transport: `Your commute and car use are your biggest source — <strong>${percentStr}% of your total</strong>. Most people underestimate how much driving adds up over a year.`,
    flights: `Air travel dominates your footprint at <strong>${percentStr}%</strong>. A single transatlantic round trip emits more than months of daily driving.`,
    food: `What you eat accounts for <strong>${percentStr}% of your footprint</strong>. Beef alone produces 10× more emissions than chicken per kilogram.`,
    energy: `Home energy is your biggest contributor at <strong>${percentStr}%</strong>. Heating and cooling alone can outweigh all your transport emissions.`,
    shopping: `Consumption and shopping make up <strong>${percentStr}% of your footprint</strong>. The hidden carbon in manufacturing is often larger than the delivery.`
  };

  el.innerHTML = `💡 <strong>Key insight:</strong> ${insights[top.key]}`;
}

function renderBreakdown(breakdown, total) {
  const container = document.getElementById('breakdown-card');
  container.innerHTML = breakdown.map((item, i) => {
    const isTop = i === 0;
    return `
      <div class="breakdown-item">
        <span class="breakdown-icon">${item.icon}</span>
        <div class="breakdown-info">
          <div class="breakdown-label-row">
            <span class="breakdown-name">${item.label}</span>
            <span class="breakdown-value">${item.tons.toFixed(1)}t · ${item.percent}%</span>
          </div>
          <div class="breakdown-bar-bg">
            <div class="breakdown-bar-fill" 
                 style="background: ${item.color}; width: 0%;" 
                 data-width="${item.percent}%"></div>
          </div>
        </div>
        ${isTop ? '<span class="top-badge">#1 Impact</span>' : ''}
      </div>
    `;
  }).join('');

  // Animate bars with stagger
  setTimeout(() => {
    const bars = container.querySelectorAll('.breakdown-bar-fill');
    bars.forEach((bar, i) => {
      setTimeout(() => {
        bar.style.width = bar.dataset.width;
      }, i * 120);
    });
  }, 400);
}

function renderEquivalencies(total) {
  const container = document.getElementById('equivalencies');
  const keys = ['trees', 'flights', 'driving'];

  container.innerHTML = keys.map(key => {
    const eq = EQUIVALENCIES[key];
    const value = eq.calc(total);
    const labelText = eq.label(value);
    // Split the label to isolate the value
    const restText = labelText.replace(String(value) + ' ', '');
    return `
      <div class="equiv-card">
        <div class="equiv-icon">${eq.icon}</div>
        <div class="equiv-text">
          <strong>${value}</strong> ${restText}
        </div>
      </div>
    `;
  }).join('');
}

function renderActions(topCategory) {
  const container = document.getElementById('actions-section');
  const actions = ACTIONS[topCategory];
  const catLabel = CATEGORIES[topCategory].label;
  const catIcon = CATEGORIES[topCategory].icon;

  document.getElementById('actions-subtitle').textContent = 
    `Your biggest area is ${catLabel} ${catIcon}  — start here`;

  container.innerHTML = actions.map((action, i) => `
    <div class="action-card">
      <div class="action-icon">${action.icon}</div>
      <div class="action-content">
        <div class="action-title">${action.title}</div>
        <div class="action-desc">${action.description}</div>
        <div class="action-savings">↓ saves ~${action.savings} tons CO₂e/year</div>
      </div>
    </div>
  `).join('');
}

function renderWhatIf(currentTotal, topCategory) {
  const actions = ACTIONS[topCategory];
  const totalSavings = actions.reduce((sum, a) => sum + a.savings, 0);
  const newScore = Math.max(0, currentTotal - totalSavings);
  const reductionPercent = Math.round((totalSavings / currentTotal) * 100);

  // Before
  document.getElementById('whatif-before').textContent = currentTotal.toFixed(1);

  // After — animated count
  const afterEl = document.getElementById('whatif-score');
  animateNumber(afterEl, newScore, 800, 500);

  // Savings text
  document.getElementById('whatif-savings').textContent = 
    `↓ ${totalSavings.toFixed(1)} tons less · ${reductionPercent}% reduction`;
}

function animateNumber(el, target, duration, delay) {
  setTimeout(() => {
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = (target * eased).toFixed(1);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(1);
    }
    requestAnimationFrame(tick);
  }, delay);
}

// ─── RESTART ───────────────────────────────────
function restart() {
  currentStep = 0;
  answers = {};
  showScreen('screen-welcome');
}
