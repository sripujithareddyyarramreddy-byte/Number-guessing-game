(function () {
  const difficultyEl = document.getElementById('difficulty');
  const attemptsEl = document.getElementById('attempts');
  const soundToggleEl = document.getElementById('soundToggle');
  const newGameBtn = document.getElementById('newGameBtn');

  const guessForm = document.getElementById('guessForm');
  const guessInput = document.getElementById('guessInput');

  const rangeText = document.getElementById('rangeText');
  const attemptsText = document.getElementById('attemptsText');
  const hintText = document.getElementById('hintText');

  const streakEl = document.getElementById('streak');
  const bestStreakEl = document.getElementById('bestStreak');

  const successSfx = document.getElementById('successSfx');
  const errorSfx = document.getElementById('errorSfx');

  
  let secret = 0;
  let min = 1;
  let max = 100;
  let attemptsLeft = 7;
  let streak = 0;
  let bestStreak = Number(localStorage.getItem('bestStreak') || 0);
  let soundEnabled = true;

 
  const randInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

  function setHint(text, type = 'normal') {
    hintText.textContent = text;
    hintText.classList.remove('ok', 'warn', 'err');
    if (type === 'ok') hintText.classList.add('ok');
    if (type === 'warn') hintText.classList.add('warn');
    if (type === 'err') hintText.classList.add('err');
  }

  function playSuccess() { if (soundEnabled && successSfx) successSfx.play().catch(() => {}); }
  function playError() { if (soundEnabled && errorSfx) errorSfx.play().catch(() => {}); }

  function applyDifficulty() {
    const diff = difficultyEl.value;
    if (diff === 'easy') { min = 1; max = 50; }
    else if (diff === 'hard') { min = 1; max = 500; }
    else { min = 1; max = 100; }
    rangeText.textContent = `Range: ${min}–${max}`;
  }

  function applyAttempts() {
    attemptsLeft = Number(attemptsEl.value);
    attemptsText.textContent = `Attempts left: ${attemptsLeft}`;
  }

  function updateStreakUI() {
    streakEl.textContent = String(streak);
    bestStreakEl.textContent = String(bestStreak);
  }

  function saveBestStreak() {
    localStorage.setItem('bestStreak', String(bestStreak));
  }

  function newGame(resetStreak = false) {
    applyDifficulty();
    applyAttempts();
    secret = randInt(min, max);
    setHint('New game started! Make a guess.', 'ok');
    guessInput.value = '';
    guessInput.focus();
    if (resetStreak) streak = 0;
    updateStreakUI();
  }

  function endGame(win) {
    if (win) {
      streak += 1;
      if (streak > bestStreak) { bestStreak = streak; saveBestStreak(); }
      updateStreakUI();
      setHint(`Correct! The number was ${secret}. Press R or New Game to play again.`, 'ok');
      playSuccess();
    } else {
      setHint(`Out of attempts! The number was ${secret}. Streak reset.`, 'err');
      streak = 0;
      updateStreakUI();
      playError();
    }
  }

  function validateGuess(val) {
    if (Number.isNaN(val)) return 'Please enter a valid number.';
    if (val < min || val > max) return `Your guess must be between ${min} and ${max}.`;
    return null;
  }

  function handleGuessSubmit(e) {
    e.preventDefault();
    const value = Number(guessInput.value);
    const err = validateGuess(value);
    if (err) {
      setHint(err, 'err');
      playError();
      return;
    }

    if (value === secret) {
      endGame(true);
      return;
    }

    attemptsLeft -= 1;
    attemptsText.textContent = `Attempts left: ${attemptsLeft}`;

    const diff = Math.abs(value - secret);
    const direction = value < secret ? 'Too low' : 'Too high';
    let hintType = 'warn';
    let extra = '';

    if (diff <= Math.ceil((max - min) * 0.02)) { extra = 'Very close!'; hintType = 'ok'; }
    else if (diff <= Math.ceil((max - min) * 0.1)) { extra = 'Close.'; }
    else { extra = 'Far off.'; hintType = 'warn'; }

    setHint(`${direction}. ${extra}`, hintType);
    playError();

    if (attemptsLeft <= 0) {
      endGame(false);
    }
  }

  guessForm.addEventListener('submit', handleGuessSubmit);
  newGameBtn.addEventListener('click', () => newGame(false));
  difficultyEl.addEventListener('change', () => newGame(false));
  attemptsEl.addEventListener('change', () => newGame(false));
  soundToggleEl.addEventListener('change', (e) => {
    soundEnabled = e.target.checked;
  });

 
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'r') newGame(false);
  });

  applyDifficulty();
  applyAttempts();
  updateStreakUI();
  setHint('Make a guess to start!');
  secret = randInt(min, max);
  soundEnabled = soundToggleEl.checked;
})();