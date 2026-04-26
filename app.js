const STORAGE_KEY = "aidenMathGamesProgress";

const state = {
  activeGame: "make-ten",
  progress: loadProgress(),
  selectedNumbers: [],
  robotProgram: [],
  robotPosition: 20,
  quantum: null,
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
    short: "Shape definitions",
    topic: "Geometry",
    icon: "[]",
    parent:
      "Ask Aiden to name the properties before choosing. For example: a square is a rectangle and a rhombus, but a rectangle is not always a rhombus.",
    mathTalk: "Shapes can belong to more than one family. A square has 4 equal sides and 4 right angles, so it is both a rectangle and a rhombus.",
    codeTalk: "A program can classify a shape by checking properties like sides, equal sides, parallel sides, and right angles.",
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
    id: "quantum-ttt",
    title: "Quantum Tic-Tac-Toe",
    short: "Ghost marks and loops",
    topic: "Strategy duel",
    icon: "Q",
    parent:
      "First play for the story: each move is linked across two squares. When a loop appears, choose how the board becomes real.",
    mathTalk: "The ghost marks make a graph. A loop means the choices cannot all stay ghostly, so the loop collapses into definite marks.",
    codeTalk: "The app stores each ghost move as an edge between two squares, then searches for cycles before triggering collapse.",
    render: renderQuantumTicTacToe
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

const geometryShapes = [
  {
    id: "circle",
    name: "Circle",
    minLevel: 1,
    definition: "A round shape with no corners and no straight sides.",
    properties: ["0 sides", "0 corners", "curved edge"],
    trueFacts: ["A circle has no corners.", "A circle does not have straight sides."],
    falseFacts: ["A circle is a polygon.", "A circle has 4 sides."]
  },
  {
    id: "triangle",
    name: "Triangle",
    minLevel: 1,
    definition: "A polygon with exactly 3 sides and 3 corners.",
    properties: ["3 sides", "3 corners", "polygon"],
    trueFacts: ["Every triangle has 3 sides.", "A triangle is a polygon."],
    falseFacts: ["Every triangle has 4 sides.", "A triangle must have a right angle."]
  },
  {
    id: "square",
    name: "Square",
    minLevel: 1,
    definition: "A quadrilateral with 4 equal sides and 4 right angles.",
    properties: ["4 sides", "4 equal sides", "4 right angles", "2 pairs of parallel sides", "rectangle", "rhombus"],
    trueFacts: ["Every square is a rectangle.", "Every square is a rhombus.", "A square has 4 equal sides."],
    falseFacts: ["A square has only 3 corners.", "A square is never a rectangle."]
  },
  {
    id: "rectangle",
    name: "Rectangle",
    minLevel: 1,
    definition: "A quadrilateral with 4 right angles.",
    properties: ["4 sides", "4 right angles", "opposite sides equal", "2 pairs of parallel sides", "parallelogram"],
    trueFacts: ["Every rectangle has 4 right angles.", "A square is a special rectangle.", "A rectangle is a parallelogram."],
    falseFacts: ["Every rectangle is a rhombus.", "A rectangle must have 4 equal sides."]
  },
  {
    id: "rhombus",
    name: "Rhombus",
    minLevel: 2,
    definition: "A quadrilateral with 4 equal sides. Its opposite sides are parallel.",
    properties: ["4 sides", "4 equal sides", "2 pairs of parallel sides", "parallelogram"],
    trueFacts: ["Every rhombus has 4 equal sides.", "A square is a special rhombus.", "A diamond shape can be a rhombus when all 4 sides are equal.", "A rhombus is a parallelogram."],
    falseFacts: ["Every rhombus has 4 right angles.", "Every rectangle is a rhombus."]
  },
  {
    id: "pentagon",
    name: "Pentagon",
    minLevel: 2,
    definition: "A polygon with exactly 5 sides and 5 corners.",
    properties: ["5 sides", "5 corners", "polygon"],
    trueFacts: ["Every pentagon has 5 sides.", "A pentagon is a polygon."],
    falseFacts: ["A pentagon has 6 sides.", "A pentagon must have 4 right angles."]
  },
  {
    id: "hexagon",
    name: "Hexagon",
    minLevel: 2,
    definition: "A polygon with exactly 6 sides and 6 corners.",
    properties: ["6 sides", "6 corners", "polygon"],
    trueFacts: ["Every hexagon has 6 sides.", "A hexagon has more sides than a pentagon."],
    falseFacts: ["A hexagon has 5 sides.", "A hexagon is a circle."]
  },
  {
    id: "parallelogram",
    name: "Parallelogram",
    minLevel: 3,
    definition: "A quadrilateral with 2 pairs of parallel sides.",
    properties: ["4 sides", "2 pairs of parallel sides", "opposite sides equal"],
    trueFacts: ["A rectangle is a special parallelogram.", "A rhombus is a special parallelogram."],
    falseFacts: ["Every parallelogram is a square.", "A parallelogram has no parallel sides."]
  },
  {
    id: "trapezoid",
    name: "Trapezoid",
    minLevel: 3,
    definition: "A quadrilateral with at least 1 pair of parallel sides.",
    properties: ["4 sides", "at least 1 pair of parallel sides", "quadrilateral"],
    trueFacts: ["A trapezoid is a quadrilateral.", "A trapezoid has a pair of parallel sides."],
    falseFacts: ["A trapezoid has 3 sides.", "A trapezoid must have 4 equal sides."]
  },
  {
    id: "right-triangle",
    name: "Right triangle",
    minLevel: 3,
    definition: "A triangle with one right angle.",
    properties: ["3 sides", "3 corners", "1 right angle", "triangle"],
    trueFacts: ["A right triangle is still a triangle.", "A right triangle has one right angle."],
    falseFacts: ["Every triangle is a right triangle.", "A right triangle has 4 sides."]
  }
];

const geometryRelationshipFacts = [
  { minLevel: 1, text: "Every square is a rectangle.", answer: true },
  { minLevel: 1, text: "Every rectangle is a square.", answer: false },
  { minLevel: 2, text: "Every square is a rhombus.", answer: true },
  { minLevel: 2, text: "Every rectangle is a rhombus.", answer: false },
  { minLevel: 2, text: "A rhombus must have 4 equal sides.", answer: true },
  { minLevel: 3, text: "A rectangle is a parallelogram.", answer: true },
  { minLevel: 3, text: "A rhombus is a parallelogram.", answer: true },
  { minLevel: 3, text: "Every parallelogram is a square.", answer: false },
  { minLevel: 3, text: "A quadrilateral always has 4 sides.", answer: true },
  { minLevel: 4, text: "A square is both a rectangle and a rhombus.", answer: true },
  { minLevel: 4, text: "If a 4-sided shape has 4 right angles, it is a rectangle.", answer: true }
];

function availableGeometryShapes() {
  return geometryShapes.filter((shape) => shape.minLevel <= difficultyLevel());
}

function makeGeometryProblem() {
  const shapes = availableGeometryShapes();
  const shape = shapes[randomInt(0, shapes.length - 1)];
  const useRelationship = difficultyLevel() >= 2 && Math.random() < 0.35;
  if (useRelationship) {
    const facts = geometryRelationshipFacts.filter((fact) => fact.minLevel <= difficultyLevel());
    const fact = facts[randomInt(0, facts.length - 1)];
    return {
      type: "relationship",
      shape,
      question: "Is this statement true?",
      statement: fact.text,
      answer: fact.answer ? "True" : "False",
      choices: ["True", "False"],
      explanation: fact.answer ? "Yes. That statement follows the shape definitions." : "Not quite. One example can break an always-statement."
    };
  }

  const askName = Math.random() < 0.45;
  if (askName) {
    return {
      type: "name",
      shape,
      question: "What shape is this?",
      answer: shape.name,
      choices: makeGeometryChoices(shape.name, shapes.map((item) => item.name)),
      explanation: shape.definition
    };
  }

  const trueFact = shape.trueFacts[randomInt(0, shape.trueFacts.length - 1)];
  const falseFacts = shape.falseFacts.slice().sort(() => Math.random() - 0.5).slice(0, 3);
  return {
    type: "property",
    shape,
    question: `Which fact is true about a ${shape.name.toLowerCase()}?`,
    answer: trueFact,
    choices: [trueFact, ...falseFacts].sort(() => Math.random() - 0.5),
    explanation: shape.definition
  };
}

function makeGeometryChoices(answer, options) {
  const choices = new Set([answer]);
  while (choices.size < 4 && choices.size < options.length) {
    choices.add(options[randomInt(0, options.length - 1)]);
  }
  return Array.from(choices).sort(() => Math.random() - 0.5);
}

function renderShapeShop(problem = makeGeometryProblem(), message = "Look at the shape, then use its properties.") {
  activityPanel.innerHTML = `
    ${progressPill('<span class="target-pill">Correct detective work = 1 spark</span>')}
    <p class="prompt">${message}</p>
    <div class="geometry-layout">
      <div class="geometry-card">
        <div class="geometry-visual" aria-label="${problem.shape.name}">
          ${shapeSvg(problem.shape.id)}
        </div>
        <div>
          <h3>${problem.shape.name}</h3>
          <p>${problem.shape.definition}</p>
        </div>
        <div class="property-list">
          ${problem.shape.properties.map((property) => `<span>${property}</span>`).join("")}
        </div>
      </div>
      <div class="fact-panel">
        <div class="fact-card">
          <span>${problem.type === "relationship" ? "Shape relationship" : "Shape question"}</span>
          <strong>${problem.statement || problem.question}</strong>
        </div>
        ${problem.statement ? `<p class="prompt">${problem.question}</p>` : ""}
        <div class="choice-grid">
          ${problem.choices
            .map((choice) => `<button class="choice-button geometry-choice" type="button" data-choice="${choice}">${choice}</button>`)
            .join("")}
        </div>
      </div>
    </div>
  `;

  activityPanel.querySelectorAll("[data-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const success = button.dataset.choice === problem.answer;
      button.classList.add(success ? "correct" : "wrong");
      completeRound({ sparks: success ? 1 : 0 });
      delayedGameRender("shape-shop", () => {
        renderShapeShop(
          success ? makeGeometryProblem() : problem,
          success ? `${problem.explanation} Spark earned.` : `${problem.explanation} Try again.`
        );
      });
    });
  });
}

function shapeSvg(id) {
  const common = 'viewBox="0 0 180 150" role="img"';
  const styles = 'fill="#dff7f0" stroke="#18212f" stroke-width="7" stroke-linejoin="round"';
  const line = 'stroke="#d94b4b" stroke-width="5" stroke-linecap="round"';
  const svgs = {
    circle: `<svg ${common}><circle cx="90" cy="75" r="48" ${styles}/></svg>`,
    triangle: `<svg ${common}><polygon points="90,20 150,125 30,125" ${styles}/></svg>`,
    square: `<svg ${common}><rect x="45" y="30" width="90" height="90" rx="4" ${styles}/><path d="M45 48 h18 v-18" ${line}/></svg>`,
    rectangle: `<svg ${common}><rect x="28" y="42" width="124" height="70" rx="4" ${styles}/><path d="M28 60 h18 v-18" ${line}/></svg>`,
    rhombus: `<svg ${common}><polygon points="90,18 150,75 90,132 30,75" ${styles}/></svg>`,
    pentagon: `<svg ${common}><polygon points="90,18 150,65 126,130 54,130 30,65" ${styles}/></svg>`,
    hexagon: `<svg ${common}><polygon points="58,24 122,24 158,75 122,126 58,126 22,75" ${styles}/></svg>`,
    parallelogram: `<svg ${common}><polygon points="58,38 158,38 122,112 22,112" ${styles}/></svg>`,
    trapezoid: `<svg ${common}><polygon points="55,38 125,38 158,112 22,112" ${styles}/></svg>`,
    "right-triangle": `<svg ${common}><polygon points="42,28 42,122 148,122" ${styles}/><path d="M42 101 h21 v21" ${line}/></svg>`
  };
  return svgs[id] || svgs.square;
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

const winLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

function newQuantumGame() {
  state.quantum = {
    current: "X",
    moveNumber: 1,
    moves: [],
    resolved: Array(9).fill(null),
    selected: [],
    collapse: null,
    winner: "",
    recorded: false
  };
}

function renderQuantumTicTacToe(message = "Choose two open squares to place a paired ghost mark.") {
  if (!state.quantum) newQuantumGame();
  const game = state.quantum;
  activityPanel.innerHTML = `
    ${progressPill('<span class="target-pill">Win the quantum duel = 4 sparks</span>')}
    <p class="prompt">${message}</p>
    <div class="quantum-layout">
      <div class="quantum-board-wrap">
        <div class="quantum-board" aria-label="Quantum tic-tac-toe board">
          ${Array.from({ length: 9 }, (_, index) => renderQuantumCell(game, index)).join("")}
        </div>
      </div>
      <div class="quantum-side">
        <div class="turn-card quantum-turn">
          <span>${game.winner ? "Result" : game.collapse ? "Collapse chooser" : "Turn"}</span>
          <strong>${game.winner || (game.collapse ? game.collapse.chooser : game.current)}</strong>
        </div>
        ${renderQuantumCollapse(game)}
        <div class="quantum-log">
          <h3>Entangled Moves</h3>
          ${game.moves.length ? game.moves.map((move) => renderQuantumMove(move)).join("") : "<p>No ghost marks yet.</p>"}
        </div>
        <button class="primary-button" type="button" id="newQuantumGame">New quantum board</button>
      </div>
    </div>
  `;

  activityPanel.querySelectorAll("[data-q-cell]").forEach((button) => {
    button.addEventListener("click", () => {
      selectQuantumCell(Number(button.dataset.qCell));
    });
  });

  activityPanel.querySelectorAll("[data-collapse-cell]").forEach((button) => {
    button.addEventListener("click", () => {
      collapseQuantumLoop(Number(button.dataset.collapseCell));
    });
  });

  activityPanel.querySelector("#newQuantumGame").addEventListener("click", () => {
    newQuantumGame();
    renderQuantumTicTacToe();
  });
}

function renderQuantumCell(game, index) {
  const resolved = game.resolved[index];
  const marks = game.moves.filter((move) => !move.resolved && move.cells.includes(index));
  const selected = game.selected.includes(index);
  const disabled = Boolean(resolved || game.collapse || game.winner);
  return `
    <button class="q-cell ${resolved ? `resolved player-${resolved.player.toLowerCase()}` : ""} ${selected ? "selected" : ""}" type="button" data-q-cell="${index}" ${disabled ? "disabled" : ""}>
      <span class="q-cell-number">${index + 1}</span>
      ${
        resolved
          ? `<span class="q-real">${resolved.player}</span><span class="q-move-id">${resolved.moveId}</span>`
          : `<span class="q-ghosts">${marks.map((move) => `<span class="q-chip player-${move.player.toLowerCase()}">${move.player}${move.id}</span>`).join("")}</span>`
      }
    </button>
  `;
}

function renderQuantumMove(move) {
  const status = move.resolved ? (move.realCell === null ? "vanished" : `real at ${move.realCell + 1}`) : `${move.cells[0] + 1} <span>↔</span> ${move.cells[1] + 1}`;
  return `
    <div class="q-move-row ${move.resolved ? "settled" : ""}">
      <strong class="player-${move.player.toLowerCase()}">${move.player}${move.id}</strong>
      <span>${status}</span>
    </div>
  `;
}

function renderQuantumCollapse(game) {
  if (!game.collapse) {
    return `
      <div class="quantum-help">
        <strong>Rule</strong>
        <p>A ghost mark lives in two squares. If the links make a loop, someone chooses which square becomes real first.</p>
      </div>
    `;
  }
  const move = game.moves.find((item) => item.id === game.collapse.moveId);
  return `
    <div class="collapse-panel">
      <h3>Loop Detected</h3>
      <p>${game.collapse.chooser} chooses where ${move.player}${move.id} becomes real.</p>
      <div class="choice-grid">
        ${game.collapse.options.map((cell) => `<button class="choice-button" type="button" data-collapse-cell="${cell}">Square ${cell + 1}</button>`).join("")}
      </div>
    </div>
  `;
}

function selectQuantumCell(cell) {
  const game = state.quantum;
  if (!game || game.winner || game.collapse || game.resolved[cell]) return;
  if (game.selected.includes(cell)) {
    game.selected = game.selected.filter((item) => item !== cell);
    renderQuantumTicTacToe("Pick two different squares for the ghost mark.");
    return;
  }
  game.selected.push(cell);
  if (game.selected.length < 2) {
    renderQuantumTicTacToe("Pick the second square for the same ghost mark.");
    return;
  }
  const [first, second] = game.selected;
  game.selected = [];
  addQuantumMove(first, second);
}

function addQuantumMove(first, second) {
  const game = state.quantum;
  if (first === second || game.resolved[first] || game.resolved[second]) {
    renderQuantumTicTacToe("Choose two different open squares.");
    return;
  }
  const makesLoop = hasQuantumPath(game, first, second);
  const move = {
    id: game.moveNumber,
    player: game.current,
    cells: [first, second],
    resolved: false,
    realCell: null
  };
  game.moves.push(move);

  if (makesLoop) {
    game.collapse = {
      moveId: move.id,
      chooser: otherQuantumPlayer(game.current),
      options: move.cells
    };
    renderQuantumTicTacToe(`A loop appeared. ${game.collapse.chooser} chooses how it collapses.`);
    return;
  }

  game.current = otherQuantumPlayer(game.current);
  game.moveNumber += 1;
  if (availableQuantumCells(game).length < 2) {
    finishQuantumGame("Tie", "No room for another ghost pair. The quantum duel is a tie.");
    return;
  }
  renderQuantumTicTacToe(`${game.current}'s turn. Choose two open squares.`);
}

function hasQuantumPath(game, start, end) {
  const visited = new Set([start]);
  const stack = [start];
  while (stack.length) {
    const cell = stack.pop();
    const neighbors = game.moves
      .filter((move) => !move.resolved && move.cells.includes(cell))
      .map((move) => (move.cells[0] === cell ? move.cells[1] : move.cells[0]));
    for (const neighbor of neighbors) {
      if (neighbor === end) return true;
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        stack.push(neighbor);
      }
    }
  }
  return false;
}

function collapseQuantumLoop(cell) {
  const game = state.quantum;
  if (!game || !game.collapse) return;
  const move = game.moves.find((item) => item.id === game.collapse.moveId);
  if (!move || !move.cells.includes(cell)) return;
  resolveQuantumMove(game, move.id, cell);
  game.collapse = null;
  const result = quantumWinner(game);
  if (result) {
    finishQuantumGame(result, result === "Tie" ? "Both players made a line in the same collapse." : `${result} made a real tic-tac-toe line.`);
    return;
  }
  game.current = otherQuantumPlayer(game.current);
  game.moveNumber += 1;
  if (availableQuantumCells(game).length < 2) {
    finishQuantumGame("Tie", "No room for another ghost pair. The quantum duel is a tie.");
    return;
  }
  renderQuantumTicTacToe(`Collapse complete. ${game.current}'s turn.`);
}

function resolveQuantumMove(game, moveId, cell) {
  const move = game.moves.find((item) => item.id === moveId);
  if (!move || move.resolved) return;
  if (game.resolved[cell]) {
    move.resolved = true;
    move.realCell = null;
    return;
  }
  game.resolved[cell] = { player: move.player, moveId: move.id };
  move.resolved = true;
  move.realCell = cell;
  const knockedMoves = game.moves.filter((item) => !item.resolved && item.cells.includes(cell));
  knockedMoves.forEach((item) => {
    const twin = item.cells[0] === cell ? item.cells[1] : item.cells[0];
    resolveQuantumMove(game, item.id, twin);
  });
}

function quantumWinner(game) {
  const winners = new Set();
  winLines.forEach((line) => {
    const players = line.map((cell) => game.resolved[cell]?.player);
    if (players[0] && players.every((player) => player === players[0])) winners.add(players[0]);
  });
  if (winners.size > 1) return "Tie";
  return Array.from(winners)[0] || "";
}

function finishQuantumGame(result, message) {
  const game = state.quantum;
  game.winner = result;
  if (!game.recorded) {
    completeRound(result === "Tie" ? { sparks: 1 } : { sparks: 4, win: true });
    game.recorded = true;
  }
  renderQuantumTicTacToe(message);
}

function availableQuantumCells(game) {
  return game.resolved.map((mark, index) => (mark ? null : index)).filter((cell) => cell !== null);
}

function otherQuantumPlayer(player) {
  return player === "X" ? "O" : "X";
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
