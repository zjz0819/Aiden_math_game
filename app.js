const STORAGE_KEY = "aidenMathGamesProgress";

const state = {
  activeGame: "make-ten",
  progress: loadProgress(),
  selectedNumbers: [],
  currentShape: "square",
  placedShapes: [],
  robotProgram: [],
  robotPosition: 20,
  pebble: null,
  boxDuel: null
};

const games = [
  {
    id: "make-ten",
    title: "Make Ten Trail",
    short: "Pairs, sums, complements",
    topic: "Number sense",
    icon: "10",
    parent:
      "Ask Aiden to predict a pair before choosing it. As levels rise, the target number changes.",
    mathTalk: "What pairs make the target? Can you find the missing partner without counting up one by one?",
    codeTalk: "A program can check every pair by using a loop and an if statement.",
    render: renderMakeTen
  },
  {
    id: "shape-shop",
    title: "Shape Workshop",
    short: "Combine simple shapes",
    topic: "Geometry",
    icon: "[]",
    parent:
      "Build a picture together, then ask which pieces could be swapped without changing the overall idea.",
    mathTalk: "What shapes did you use? Which shapes have corners, curves, or equal sides?",
    codeTalk: "This is like sprites in Scratch: choose an object, set its position, then draw it.",
    render: renderShapeShop
  },
  {
    id: "array-builder",
    title: "Array Builder",
    short: "See multiplication",
    topic: "Multiplication",
    icon: "x",
    parent:
      "Ask Aiden to count rows first, then columns, then predict the total before choosing an answer.",
    mathTalk: "Multiplication is equal groups. 3 rows of 4 is the same total as 4 rows of 3.",
    codeTalk: "A nested loop can draw an array: one loop for rows and one loop for columns.",
    render: renderArrayBuilder
  },
  {
    id: "share-fair",
    title: "Share Fair",
    short: "Divide into groups",
    topic: "Division",
    icon: "/",
    parent:
      "Have Aiden say what each number means: total objects, number of groups, and objects in each group.",
    mathTalk: "Division asks how to share a total into equal groups. It undoes multiplication.",
    codeTalk: "A program can deal one item to each group again and again until none are left.",
    render: renderShareFair
  },
  {
    id: "fact-family",
    title: "Fact Family",
    short: "Connect x and /",
    topic: "Multiplication and division",
    icon: "fx",
    parent:
      "Ask Aiden which two multiplication facts and which two division facts live in the same family.",
    mathTalk: "If 4 x 5 = 20, then 20 / 5 = 4 and 20 / 4 = 5.",
    codeTalk: "These facts share the same three numbers, so a program can generate the whole family from one array.",
    render: renderFactFamily
  },
  {
    id: "clock-quest",
    title: "Clock Quest",
    short: "Read analog time",
    topic: "Time",
    icon: "12",
    parent:
      "Let Aiden move his finger around the minutes. Higher levels move from quarter-hours to five-minute times.",
    mathTalk: "Where is the hour hand? How many groups of 5 minutes has the minute hand moved?",
    codeTalk: "The clock is a circle, so the program turns each hand by an angle.",
    render: renderClockQuest
  },
  {
    id: "robot-path",
    title: "Robot Path",
    short: "Sequence commands",
    topic: "Computational thinking",
    icon: "R",
    parent:
      "Have Aiden say the whole program out loud before running it. Debugging is noticing the first step that surprises you.",
    mathTalk: "How many squares over and up does the robot need to travel?",
    codeTalk: "A program is a sequence. If the result is wrong, change one command and test again.",
    render: renderRobotPath
  },
  {
    id: "pattern-machine",
    title: "Pattern Machine",
    short: "Find the rule",
    topic: "Patterns",
    icon: "+",
    parent:
      "After Aiden finds the next number, ask him to invent a new rule for you to solve.",
    mathTalk: "What is changing each time? Is the jump always the same?",
    codeTalk: "Patterns are rules. A loop can repeat the rule again and again.",
    render: renderPatternMachine
  },
  {
    id: "pebble-duel",
    title: "Pebble Duel",
    short: "2 players, last pebble wins",
    topic: "Strategy duel",
    icon: "2P",
    parent:
      "Play a few rounds without advice, then ask which pile sizes feel safe or dangerous.",
    mathTalk: "If you can leave 4, 8, 12, or 16 pebbles, what happens next?",
    codeTalk: "This game has states. A program can label each state as winning or losing.",
    render: renderPebbleDuel
  },
  {
    id: "box-duel",
    title: "Box Capture",
    short: "2 players, claim squares",
    topic: "Strategy duel",
    icon: "##",
    parent:
      "Ask Aiden when it is worth giving away a square to set up a bigger capture later.",
    mathTalk: "Which line creates a box? Which move gives the other player an easy point?",
    codeTalk: "The app checks the four edges around every square after each move.",
    render: renderBoxDuel
  }
];

const activityPanel = document.querySelector("#activityPanel");
const gameNav = document.querySelector("#gameNav");
const gameTitle = document.querySelector("#gameTitle");
const gameTopic = document.querySelector("#gameTopic");
const parentLens = document.querySelector("#parentLens");
const mathTalk = document.querySelector("#mathTalk");
const codeTalk = document.querySelector("#codeTalk");
const roundCount = document.querySelector("#roundCount");
const sparkCount = document.querySelector("#sparkCount");
const levelCount = document.querySelector("#levelCount");
const winCount = document.querySelector("#winCount");
const rewardText = document.querySelector("#rewardText");
const badgeRow = document.querySelector("#badgeRow");

function init() {
  gameNav.innerHTML = games
    .map(
      (game) => `
        <button class="nav-button" data-game="${game.id}" type="button">
          <span class="nav-icon" aria-hidden="true">${game.icon}</span>
          <span>
            <strong>${game.title}</strong>
            <span>${game.short}</span>
          </span>
        </button>
      `
    )
    .join("");

  gameNav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-game]");
    if (!button) return;
    state.activeGame = button.dataset.game;
    state.selectedNumbers = [];
    state.robotProgram = [];
    if (state.activeGame === "robot-path") state.robotPosition = robotStartPosition();
    render();
  });

  render();
}

function render() {
  const game = getActiveGame();
  document.querySelectorAll(".nav-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.game === game.id);
  });
  gameTitle.textContent = game.title;
  gameTopic.textContent = `${game.topic} | ${difficultyName()}`;
  parentLens.textContent = game.parent;
  mathTalk.textContent = game.mathTalk;
  codeTalk.textContent = game.codeTalk;
  updateProgressUI();
  game.render();
}

function getActiveGame() {
  return games.find((game) => game.id === state.activeGame) || games[0];
}

function loadProgress() {
  const fallback = { rounds: 0, sparks: 0, wins: 0, badges: [] };
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  } catch {
    return fallback;
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
}

function playerLevel() {
  return Math.min(9, Math.floor(state.progress.sparks / 6) + 1);
}

function difficultyLevel() {
  return Math.min(4, Math.floor((playerLevel() - 1) / 2) + 1);
}

function difficultyName() {
  return ["", "Explorer", "Thinker", "Strategist", "Mastermind"][difficultyLevel()];
}

function completeRound(options = {}) {
  const normalized = typeof options === "boolean" ? { sparks: options ? 1 : 0 } : options;
  state.progress.rounds += 1;
  state.progress.sparks += normalized.sparks || 0;
  if (normalized.win) state.progress.wins += 1;
  awardBadges();
  saveProgress();
  updateProgressUI();
}

function awardBadges() {
  const badges = new Set(state.progress.badges || []);
  if (state.progress.sparks >= 5) badges.add("Spark Starter");
  if (state.progress.sparks >= 18) badges.add("Pattern Finder");
  if (state.progress.sparks >= 30) badges.add("Fact Explorer");
  if (state.progress.wins >= 1) badges.add("Duel Winner");
  if (state.progress.wins >= 5) badges.add("Strategy Builder");
  state.progress.badges = Array.from(badges);
}

function updateProgressUI() {
  roundCount.textContent = state.progress.rounds;
  sparkCount.textContent = state.progress.sparks;
  levelCount.textContent = playerLevel();
  winCount.textContent = state.progress.wins;
  const nextLevelAt = playerLevel() * 6;
  const needed = Math.max(0, nextLevelAt - state.progress.sparks);
  rewardText.textContent = needed
    ? `${needed} sparks until Level ${playerLevel() + 1}. Difficulty: ${difficultyName()}.`
    : `Level ${playerLevel()} unlocked. Difficulty: ${difficultyName()}.`;
  badgeRow.innerHTML = (state.progress.badges || []).length
    ? state.progress.badges.map((badge) => `<span class="badge">${badge}</span>`).join("")
    : '<span class="badge muted-badge">No badges yet</span>';
}

function progressPill(extra = "") {
  return `
    <div class="game-row">
      <span class="target-pill">Level ${playerLevel()}</span>
      <span class="target-pill">${difficultyName()}</span>
      ${extra}
    </div>
  `;
}

function delayedGameRender(gameId, callback) {
  window.setTimeout(() => {
    if (state.activeGame === gameId) callback();
  }, 650);
}

function sampleNumbers(target = makeTenTarget()) {
  const guaranteed = Math.floor(Math.random() * (target - 1)) + 1;
  const pair = target - guaranteed;
  const numbers = [guaranteed, pair];
  while (numbers.length < 8) {
    numbers.push(Math.floor(Math.random() * target) + 1);
  }
  return numbers.sort(() => Math.random() - 0.5);
}

function makeTenTarget() {
  return [10, 12, 15, 20][difficultyLevel() - 1];
}

function renderMakeTen(numbers = sampleNumbers(), message = "Choose two cards that hit the target.") {
  const target = makeTenTarget();
  activityPanel.innerHTML = `
    ${progressPill(`<span class="target-pill">Target: ${target}</span>`)}
    <div class="game-row">
      <span class="feedback" id="makeTenFeedback">${message}</span>
    </div>
    <div class="number-cards">
      ${numbers
        .map(
          (number, index) => `
            <button class="number-card" type="button" data-index="${index}" data-number="${number}" data-digits="${String(number).length}">
              <span class="number-card-label">${number}</span>
            </button>
          `
        )
        .join("")}
    </div>
    <div class="game-row">
      <button class="primary-button" type="button" id="newNumbers">New cards</button>
      <button class="secondary-button" type="button" id="clearNumbers">Clear picks</button>
    </div>
  `;

  activityPanel.querySelector("#newNumbers").addEventListener("click", () => {
    state.selectedNumbers = [];
    renderMakeTen();
  });

  activityPanel.querySelector("#clearNumbers").addEventListener("click", () => {
    state.selectedNumbers = [];
    renderMakeTen(numbers);
  });

  activityPanel.querySelectorAll(".number-card").forEach((card) => {
    card.addEventListener("click", () => {
      const pick = {
        index: Number(card.dataset.index),
        number: Number(card.dataset.number)
      };
      if (state.selectedNumbers.some((item) => item.index === pick.index)) return;
      state.selectedNumbers.push(pick);
      card.classList.add("selected");

      if (state.selectedNumbers.length === 2) {
        const sum = state.selectedNumbers[0].number + state.selectedNumbers[1].number;
        const success = sum === target;
        completeRound({ sparks: success ? 1 : 0 });
        const nextMessage = success
          ? `${state.selectedNumbers[0].number} + ${state.selectedNumbers[1].number} = ${target}. Spark earned.`
          : `${state.selectedNumbers[0].number} + ${state.selectedNumbers[1].number} = ${sum}. Try another pair.`;
        state.selectedNumbers = [];
        renderMakeTen(success ? sampleNumbers() : numbers, nextMessage);
      }
    });
  });
}

function factorLimit() {
  return [5, 6, 9, 12][difficultyLevel() - 1];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeChoiceSet(correct, min, max, count = 4) {
  const choices = new Set([correct]);
  let guard = 0;
  while (choices.size < count && guard < 80) {
    choices.add(randomInt(min, max));
    guard += 1;
  }
  return Array.from(choices).sort(() => Math.random() - 0.5);
}

function makeArrayProblem() {
  const max = factorLimit();
  const rows = randomInt(2, max);
  const cols = randomInt(2, max);
  const answer = rows * cols;
  return {
    rows,
    cols,
    answer,
    choices: makeChoiceSet(answer, 2, max * max)
  };
}

function renderArrayBuilder(problem = makeArrayProblem(), message = "How many dots are in the array?") {
  activityPanel.innerHTML = `
    ${progressPill(`<span class="target-pill">Facts up to ${factorLimit()} x ${factorLimit()}</span>`)}
    <p class="prompt">${message}</p>
    <div class="multiply-layout">
      <div>
        <div class="array-equation">${problem.rows} rows of ${problem.cols}</div>
        <div class="array-board" style="--cols:${problem.cols}">
          ${Array.from({ length: problem.answer }, () => '<span class="array-dot"></span>').join("")}
        </div>
      </div>
      <div class="fact-panel">
        <div class="fact-card">
          <span>Question</span>
          <strong>${problem.rows} x ${problem.cols} = ?</strong>
        </div>
        <div class="choice-grid">
          ${problem.choices
            .map((choice) => `<button class="choice-button" type="button" data-choice="${choice}">${choice}</button>`)
            .join("")}
        </div>
      </div>
    </div>
  `;

  activityPanel.querySelectorAll("[data-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const success = Number(button.dataset.choice) === problem.answer;
      button.classList.add(success ? "correct" : "wrong");
      completeRound({ sparks: success ? 1 : 0 });
      delayedGameRender("array-builder", () => {
        renderArrayBuilder(
          success ? makeArrayProblem() : problem,
          success ? `${problem.rows} x ${problem.cols} = ${problem.answer}. Spark earned.` : "Try counting rows, then skip-counting by columns."
        );
      });
    });
  });
}

function makeShareProblem() {
  const max = factorLimit();
  const groups = randomInt(2, Math.min(max, 8));
  const each = randomInt(2, max);
  const total = groups * each;
  return {
    groups,
    each,
    total,
    choices: makeChoiceSet(each, 1, max + 3)
  };
}

function renderShareFair(problem = makeShareProblem(), message = "Share the treats equally. How many go in each group?") {
  activityPanel.innerHTML = `
    ${progressPill(`<span class="target-pill">Division from facts up to ${factorLimit()}</span>`)}
    <p class="prompt">${message}</p>
    <div class="division-layout">
      <div class="share-board">
        <div class="treat-pile" aria-label="${problem.total} treats">
          ${Array.from({ length: problem.total }, () => '<span class="treat"></span>').join("")}
        </div>
        <div class="group-row">
          ${Array.from({ length: problem.groups }, (_, index) => `
            <div class="share-group">
              <strong>Group ${index + 1}</strong>
              <span>?</span>
            </div>
          `).join("")}
        </div>
      </div>
      <div class="fact-panel">
        <div class="fact-card">
          <span>Question</span>
          <strong>${problem.total} / ${problem.groups} = ?</strong>
        </div>
        <div class="choice-grid">
          ${problem.choices
            .map((choice) => `<button class="choice-button" type="button" data-choice="${choice}">${choice}</button>`)
            .join("")}
        </div>
      </div>
    </div>
  `;

  activityPanel.querySelectorAll("[data-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const success = Number(button.dataset.choice) === problem.each;
      button.classList.add(success ? "correct" : "wrong");
      completeRound({ sparks: success ? 1 : 0 });
      delayedGameRender("share-fair", () => {
        renderShareFair(
          success ? makeShareProblem() : problem,
          success ? `${problem.total} shared into ${problem.groups} groups gives ${problem.each} each. Spark earned.` : "Use multiplication to check: groups x each should equal the total."
        );
      });
    });
  });
}

function makeFactFamilyProblem() {
  const max = factorLimit();
  const a = randomInt(2, max);
  const b = randomInt(2, max);
  const total = a * b;
  const modes = [
    { equation: `${a} x ${b} = ?`, answer: total, min: 2, max: max * max },
    { equation: `${total} / ${a} = ?`, answer: b, min: 1, max: max + 3 },
    { equation: `${total} / ${b} = ?`, answer: a, min: 1, max: max + 3 },
    { equation: `? x ${b} = ${total}`, answer: a, min: 1, max: max + 3 }
  ];
  const mode = modes[randomInt(0, modes.length - 1)];
  return {
    a,
    b,
    total,
    equation: mode.equation,
    answer: mode.answer,
    choices: makeChoiceSet(mode.answer, mode.min, mode.max)
  };
}

function renderFactFamily(problem = makeFactFamilyProblem(), message = "Use the three numbers to finish the fact.") {
  activityPanel.innerHTML = `
    ${progressPill('<span class="target-pill">Connect x and / = 1 spark</span>')}
    <p class="prompt">${message}</p>
    <div class="family-layout">
      <div class="family-triangle" aria-label="Fact family numbers">
        <span class="family-total">${problem.total}</span>
        <span>${problem.a}</span>
        <span>${problem.b}</span>
      </div>
      <div class="fact-panel">
        <div class="fact-card">
          <span>Missing number</span>
          <strong>${problem.equation}</strong>
        </div>
        <div class="choice-grid">
          ${problem.choices
            .map((choice) => `<button class="choice-button" type="button" data-choice="${choice}">${choice}</button>`)
            .join("")}
        </div>
      </div>
    </div>
  `;

  activityPanel.querySelectorAll("[data-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const success = Number(button.dataset.choice) === problem.answer;
      button.classList.add(success ? "correct" : "wrong");
      completeRound({ sparks: success ? 1 : 0 });
      delayedGameRender("fact-family", () => {
        renderFactFamily(
          success ? makeFactFamilyProblem() : problem,
          success ? "Yes. Same three numbers, new fact. Spark earned." : "Look at the top number as the total, then ask which factor is missing."
        );
      });
    });
  });
}

function renderShapeShop(message = "Pick a shape, then place it on the board.") {
  activityPanel.innerHTML = `
    ${progressPill('<span class="target-pill">4 placed shapes = 1 spark</span>')}
    <p class="prompt">${message}</p>
    <div class="shape-board">
      <div class="shape-canvas" id="shapeCanvas" aria-label="Shape canvas"></div>
      <div class="shape-bank">
        ${["square", "triangle", "rectangle", "circle"]
          .map(
            (shape) => `
              <button class="shape-piece ${shape === state.currentShape ? "active" : ""}" type="button" data-shape="${shape}">
                <span class="shape ${shape}" aria-hidden="true"></span>
                <span class="sr-only">${shape}</span>
              </button>
            `
          )
          .join("")}
        <button class="primary-button" type="button" id="shapeChallenge">Challenge</button>
        <button class="secondary-button" type="button" id="clearShapes">Clear</button>
      </div>
    </div>
  `;

  const canvas = activityPanel.querySelector("#shapeCanvas");
  drawPlacedShapes(canvas, state.placedShapes);

  activityPanel.querySelectorAll("[data-shape]").forEach((button) => {
    button.addEventListener("click", () => {
      state.currentShape = button.dataset.shape;
      renderShapeShop(`Current shape: ${state.currentShape}. Place it on the board.`);
    });
  });

  canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    state.placedShapes.push({
      shape: state.currentShape,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      turn: Math.floor(Math.random() * 5) * 12
    });
    drawPlacedShapes(canvas, state.placedShapes);
    completeRound({ sparks: state.placedShapes.length % 4 === 0 ? 1 : 0 });
  });

  activityPanel.querySelector("#shapeChallenge").addEventListener("click", () => {
    const ideas = [
      "Make a house using one triangle and one rectangle.",
      "Make a robot using at least three rectangles.",
      "Make a creature with only circles and triangles.",
      "Make a pattern that repeats: square, circle, square, circle."
    ];
    renderShapeShop(ideas[Math.floor(Math.random() * ideas.length)]);
  });

  activityPanel.querySelector("#clearShapes").addEventListener("click", () => {
    state.placedShapes = [];
    renderShapeShop();
  });
}

function drawPlacedShapes(canvas, shapes) {
  canvas.innerHTML = shapes
    .map(
      (item) => `
        <span class="placed-shape" style="left:${item.x - 43}px; top:${item.y - 43}px; --turn:${item.turn}deg">
          <span class="shape ${item.shape}" aria-hidden="true"></span>
        </span>
      `
    )
    .join("");
}

function makeClockProblem() {
  const minuteSets = [
    [0, 15, 30, 45],
    [0, 10, 20, 30, 40, 50],
    [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55],
    [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]
  ];
  const minutes = minuteSets[difficultyLevel() - 1];
  const hour = Math.floor(Math.random() * 12) + 1;
  const minute = minutes[Math.floor(Math.random() * minutes.length)];
  const correct = formatTime(hour, minute);
  const choices = new Set([correct]);
  while (choices.size < 4) {
    choices.add(formatTime(Math.floor(Math.random() * 12) + 1, minutes[Math.floor(Math.random() * minutes.length)]));
  }
  return { hour, minute, correct, choices: Array.from(choices).sort(() => Math.random() - 0.5) };
}

function formatTime(hour, minute) {
  return `${hour}:${String(minute).padStart(2, "0")}`;
}

function renderClockQuest(problem = makeClockProblem(), message = "Read the clock, then choose the time.") {
  const hourAngle = ((problem.hour % 12) + problem.minute / 60) * 30;
  const minuteAngle = problem.minute * 6;
  activityPanel.innerHTML = `
    ${progressPill('<span class="target-pill">Correct clock = 1 spark</span>')}
    <p class="prompt">${message}</p>
    <div class="clock-area">
      <div class="clock-face" aria-label="Analog clock">
        ${Array.from({ length: 12 }, (_, index) => {
          const number = index + 1;
          const position = clockNumberPosition(number);
          return `<span class="clock-number" style="--x:${position.x}%; --y:${position.y}%">${number}</span>`;
        }).join("")}
        <span class="hand hour-hand" style="--turn:${hourAngle}deg"></span>
        <span class="hand minute-hand" style="--turn:${minuteAngle}deg"></span>
        <span class="clock-pin"></span>
      </div>
      <div>
        <div class="choice-grid">
          ${problem.choices
            .map((choice) => `<button class="choice-button" type="button" data-choice="${choice}">${choice}</button>`)
            .join("")}
        </div>
      </div>
    </div>
  `;

  activityPanel.querySelectorAll("[data-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const success = button.dataset.choice === problem.correct;
      button.classList.add(success ? "correct" : "wrong");
      completeRound({ sparks: success ? 1 : 0 });
      delayedGameRender("clock-quest", () => {
        renderClockQuest(success ? makeClockProblem() : problem, success ? "Correct. Spark earned." : "Look at the minute hand first, then try again.");
      });
    });
  });
}

function clockNumberPosition(number) {
  const angle = (number % 12) * 30 * (Math.PI / 180);
  const radius = 40;
  return {
    x: 50 + radius * Math.sin(angle),
    y: 50 - radius * Math.cos(angle)
  };
}

function renderRobotPath(message = "Build a program that moves the robot to the green gem.") {
  const gemPosition = difficultyLevel() >= 3 ? 2 : 4;
  const startPosition = robotStartPosition();
  activityPanel.innerHTML = `
    ${progressPill('<span class="target-pill">Reach the gem = 1 spark</span>')}
    <p class="prompt">${message}</p>
    <div class="robot-grid">
      <div class="robot-board" aria-label="Robot grid">
        ${Array.from({ length: 25 }, (_, index) => `
          <div class="cell">
            ${index === state.robotPosition ? '<span class="robot" aria-label="Robot"></span>' : ""}
            ${index === gemPosition ? '<span class="gem" aria-label="Gem"></span>' : ""}
          </div>
        `).join("")}
      </div>
      <div class="program-panel">
        <div class="command-row">
          ${["up", "down", "left", "right"]
            .map((command) => `<button class="command-button" type="button" data-command="${command}">${command}</button>`)
            .join("")}
        </div>
        <div class="program-list" aria-label="Program">
          ${state.robotProgram.map((command) => `<span class="program-chip">${command}</span>`).join("")}
        </div>
        <div class="game-row">
          <button class="primary-button" type="button" id="runProgram">Run</button>
          <button class="secondary-button" type="button" id="undoProgram">Undo</button>
          <button class="secondary-button" type="button" id="resetProgram">Reset</button>
        </div>
      </div>
    </div>
  `;

  activityPanel.querySelectorAll("[data-command]").forEach((button) => {
    button.addEventListener("click", () => {
      if (state.robotProgram.length >= 8) return;
      state.robotProgram.push(button.dataset.command);
      renderRobotPath("Program ready. Run it or add another command.");
    });
  });

  activityPanel.querySelector("#undoProgram").addEventListener("click", () => {
    state.robotProgram.pop();
    renderRobotPath("One command removed.");
  });

  activityPanel.querySelector("#resetProgram").addEventListener("click", () => {
    state.robotProgram = [];
    state.robotPosition = startPosition;
    renderRobotPath();
  });

  activityPanel.querySelector("#runProgram").addEventListener("click", () => {
    let position = startPosition;
    state.robotProgram.forEach((command) => {
      const col = position % 5;
      if (command === "up" && position >= 5) position -= 5;
      if (command === "down" && position < 20) position += 5;
      if (command === "left" && col > 0) position -= 1;
      if (command === "right" && col < 4) position += 1;
    });
    state.robotPosition = position;
    const success = position === gemPosition;
    completeRound({ sparks: success ? 1 : 0 });
    renderRobotPath(success ? "The robot reached the gem. Spark earned." : "Debug time. Which command should change?");
  });
}

function robotStartPosition() {
  return difficultyLevel() >= 4 ? 22 : 20;
}

function makePatternProblem() {
  const start = Math.floor(Math.random() * 5) + 1;
  const step = Math.floor(Math.random() * (difficultyLevel() + 3)) + 2;
  const length = difficultyLevel() >= 3 ? 9 : 8;
  const missingIndex = Math.floor(Math.random() * 3) + 4;
  const values = Array.from({ length }, (_, index) => start + step * index);
  return {
    values,
    answer: values[missingIndex],
    missingIndex,
    choices: [values[missingIndex], values[missingIndex] + step, values[missingIndex] - 1, values[missingIndex] + 1].sort(
      () => Math.random() - 0.5
    )
  };
}

function renderPatternMachine(problem = makePatternProblem(), message = "Find the missing number.") {
  activityPanel.innerHTML = `
    ${progressPill('<span class="target-pill">Correct rule = 1 spark</span>')}
    <p class="prompt">${message}</p>
    <div class="sequence-board">
      <div class="sequence-lane">
        ${problem.values
          .map((value, index) => `
            <span class="sequence-tile ${index === problem.missingIndex ? "mystery" : ""}">
              ${index === problem.missingIndex ? "?" : value}
            </span>
          `)
          .join("")}
      </div>
      <div class="choice-grid">
        ${problem.choices.map((choice) => `<button class="choice-button" type="button" data-choice="${choice}">${choice}</button>`).join("")}
      </div>
    </div>
  `;

  activityPanel.querySelectorAll("[data-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const success = Number(button.dataset.choice) === problem.answer;
      button.classList.add(success ? "correct" : "wrong");
      completeRound({ sparks: success ? 1 : 0 });
      delayedGameRender("pattern-machine", () => {
        renderPatternMachine(success ? makePatternProblem() : problem, success ? "Yes. You found the rule. Spark earned." : "Try saying the jumps between numbers.");
      });
    });
  });
}

function newPebbleGame() {
  const starts = [12, 16, 20, 24];
  state.pebble = {
    stones: starts[difficultyLevel() - 1],
    current: "Aiden",
    winner: "",
    history: []
  };
}

function renderPebbleDuel(message = "Take 1, 2, or 3 pebbles. Whoever takes the last pebble wins.") {
  if (!state.pebble) newPebbleGame();
  const game = state.pebble;
  activityPanel.innerHTML = `
    ${progressPill('<span class="target-pill">Win a duel = 3 sparks</span>')}
    <p class="prompt">${message}</p>
    <div class="duel-layout">
      <div class="pebble-pile" aria-label="${game.stones} pebbles left">
        ${Array.from({ length: game.stones }, () => '<span class="pebble"></span>').join("")}
      </div>
      <div class="duel-panel">
        <div class="turn-card">
          <span>${game.winner ? "Winner" : "Turn"}</span>
          <strong>${game.winner || game.current}</strong>
        </div>
        <div class="choice-grid">
          ${[1, 2, 3]
            .map((amount) => `<button class="choice-button" type="button" data-take="${amount}" ${amount > game.stones ? "disabled" : ""}>Take ${amount}</button>`)
            .join("")}
        </div>
        <div class="game-row">
          <button class="primary-button" type="button" id="newPebble">New duel</button>
        </div>
        <p class="result-text">${game.history.length ? `Moves: ${game.history.join(", ")}` : "Try to leave the other player a pile of 4."}</p>
      </div>
    </div>
  `;

  activityPanel.querySelectorAll("[data-take]").forEach((button) => {
    button.addEventListener("click", () => {
      const amount = Number(button.dataset.take);
      game.stones -= amount;
      game.history.push(`${game.current} -${amount}`);
      if (game.stones === 0) {
        game.winner = game.current;
        completeRound({ sparks: 3, win: true });
        renderPebbleDuel(`${game.current} wins. Notice which pile sizes controlled the ending.`);
        return;
      }
      game.current = game.current === "Aiden" ? "Parent" : "Aiden";
      renderPebbleDuel(`${game.current}'s turn. ${game.stones} pebbles left.`);
    });
  });

  activityPanel.querySelector("#newPebble").addEventListener("click", () => {
    newPebbleGame();
    renderPebbleDuel();
  });
}

function newBoxDuel() {
  const size = difficultyLevel() >= 3 ? 3 : 2;
  state.boxDuel = {
    size,
    current: "Aiden",
    edges: [],
    owners: {},
    scores: { Aiden: 0, Parent: 0 },
    winner: "",
    recorded: false
  };
}

function renderBoxDuel(message = "Draw one line. If you finish a box, you claim it and move again.") {
  if (!state.boxDuel) newBoxDuel();
  const game = state.boxDuel;
  const grid = renderBoxGrid(game);
  activityPanel.innerHTML = `
    ${progressPill('<span class="target-pill">Win a board = 3 sparks</span>')}
    <p class="prompt">${message}</p>
    <div class="box-duel-layout">
      <div class="box-grid" style="--box-size:${game.size}; --grid-count:${game.size * 2 + 1}">
        ${grid}
      </div>
      <div class="duel-panel">
        <div class="turn-card">
          <span>${game.winner ? "Winner" : "Turn"}</span>
          <strong>${game.winner || game.current}</strong>
        </div>
        <div class="score-table">
          <span>Aiden</span><strong>${game.scores.Aiden}</strong>
          <span>Parent</span><strong>${game.scores.Parent}</strong>
        </div>
        <button class="primary-button" type="button" id="newBoxDuel">New board</button>
        <p class="result-text">A finished box gives the same player another move.</p>
      </div>
    </div>
  `;

  activityPanel.querySelectorAll("[data-edge]").forEach((button) => {
    button.addEventListener("click", () => {
      playBoxEdge(button.dataset.edge);
    });
  });

  activityPanel.querySelector("#newBoxDuel").addEventListener("click", () => {
    newBoxDuel();
    renderBoxDuel();
  });
}

function renderBoxGrid(game) {
  const parts = [];
  for (let row = 0; row <= game.size * 2; row += 1) {
    for (let col = 0; col <= game.size * 2; col += 1) {
      if (row % 2 === 0 && col % 2 === 0) {
        parts.push('<span class="dot"></span>');
      } else if (row % 2 === 0) {
        const edge = `h-${row / 2}-${(col - 1) / 2}`;
        parts.push(renderEdgeButton(edge, "h-edge", game.edges.includes(edge)));
      } else if (col % 2 === 0) {
        const edge = `v-${(row - 1) / 2}-${col / 2}`;
        parts.push(renderEdgeButton(edge, "v-edge", game.edges.includes(edge)));
      } else {
        const square = `${(row - 1) / 2}-${(col - 1) / 2}`;
        const owner = game.owners[square] || "";
        parts.push(`<span class="box-cell ${owner ? "owned" : ""}" data-owner="${owner}">${owner ? owner[0] : ""}</span>`);
      }
    }
  }
  return parts.join("");
}

function renderEdgeButton(edge, className, claimed) {
  return `<button class="edge-button ${className} ${claimed ? "claimed" : ""}" type="button" data-edge="${edge}" ${claimed ? "disabled" : ""}></button>`;
}

function playBoxEdge(edge) {
  const game = state.boxDuel;
  if (!game || game.edges.includes(edge) || game.winner) return;
  game.edges.push(edge);
  const completed = claimCompletedBoxes(game);
  if (completed === 0) {
    game.current = game.current === "Aiden" ? "Parent" : "Aiden";
  }
  const totalBoxes = game.size * game.size;
  if (Object.keys(game.owners).length === totalBoxes) {
    if (game.scores.Aiden === game.scores.Parent) {
      game.winner = "Tie";
      if (!game.recorded) {
        completeRound({ sparks: 0 });
        game.recorded = true;
      }
    } else {
      game.winner = game.scores.Aiden > game.scores.Parent ? "Aiden" : "Parent";
      if (!game.recorded) {
        completeRound({ sparks: 3, win: true });
        game.recorded = true;
      }
    }
    renderBoxDuel(`${game.winner} wins the board.`);
    return;
  }
  renderBoxDuel(completed ? `${game.current} completed ${completed} box. Move again.` : `${game.current}'s turn.`);
}

function claimCompletedBoxes(game) {
  let completed = 0;
  for (let row = 0; row < game.size; row += 1) {
    for (let col = 0; col < game.size; col += 1) {
      const key = `${row}-${col}`;
      if (game.owners[key]) continue;
      const needed = [`h-${row}-${col}`, `h-${row + 1}-${col}`, `v-${row}-${col}`, `v-${row}-${col + 1}`];
      if (needed.every((edge) => game.edges.includes(edge))) {
        game.owners[key] = game.current;
        game.scores[game.current] += 1;
        completed += 1;
      }
    }
  }
  return completed;
}

init();
