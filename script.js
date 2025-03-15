const snippets = [
  `function factorial(n) {
    if (n === 0) return 1;
    return n * factorial(n - 1);
  }
  console.log(factorial(5));`,

  `function isPrime(num) {
    if (num <= 1) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) return false;
    }
    return true;
  }
  console.log(isPrime(23));`,

  `const numbers = [1,2,3,4,5];
  let sum = numbers.reduce((acc, val) => acc + val, 0);
  console.log(sum);`
];

let snippetEditor, typingEditor;
let currentSnippet = "";
let timer, timeLeft = 60, testStarted = false;
let testDuration = "60"; // Default duration (in seconds) or "unlimited".

const timerDisplay = document.getElementById("timer");
const wpmDisplay = document.getElementById("wpm");
const accuracyDisplay = document.getElementById("accuracy");
const themeToggle = document.getElementById("theme-toggle");
const restartButton = document.getElementById("restart-button");

// Initialize CodeMirror editors
function initEditors() {
  snippetEditor = CodeMirror.fromTextArea(document.getElementById("snippet-editor"), {
    mode: "javascript",
    theme: "eclipse",
    lineNumbers: true,
    readOnly: true,
    lineWrapping: true
  });

  typingEditor = CodeMirror.fromTextArea(document.getElementById("typing-editor"), {
    mode: "javascript",
    theme: "eclipse",
    lineNumbers: true,
    lineWrapping: true
  });

  typingEditor.on("change", handleTyping);
}

// Normalize text by trimming both start and end of each line
function normalizeText(text) {
  return text.split("\n").map(line => line.trim()).join("\n");
}

// Update WPM and accuracy statistics
function updateStats(typedText) {
  const normalizedSnippet = normalizeText(currentSnippet);
  let correctChars = typedText.split("").filter((char, idx) => char === normalizedSnippet[idx]).length;
  let elapsedMinutes;
  if (testDuration !== "unlimited") {
    elapsedMinutes = (parseInt(testDuration) - timeLeft) / 60;
  } else {
    elapsedMinutes = (testStarted ? (new Date() - startTime) / 60000 : 1/60);
  }
  let wpm = Math.round((correctChars / 5) / (elapsedMinutes || (1 / 60)));
  let accuracy = Math.round((correctChars / (typedText.length || 1)) * 100);

  wpmDisplay.textContent = wpm || "0";
  accuracyDisplay.textContent = accuracy || "0";
}

// Highlight correct and incorrect characters in the snippet editor
function highlightMistakesInSnippet(typedText) {
  const normalizedSnippet = normalizeText(currentSnippet);
  snippetEditor.operation(() => {
    snippetEditor.getDoc().setValue(normalizedSnippet);
    for (let i = 0; i < typedText.length; i++) {
      let expectedChar = normalizedSnippet[i];
      let actualChar = typedText[i];
      let fromPos = snippetEditor.posFromIndex(i);
      let toPos = snippetEditor.posFromIndex(i + 1);
      if (actualChar === expectedChar) {
        snippetEditor.markText(fromPos, toPos, { className: "cm-correct" });
      } else {
        snippetEditor.markText(fromPos, toPos, { className: "cm-incorrect" });
      }
    }
  });
}

// Record the start time (used in unlimited mode for stats)
let startTime = null;

// Handle typing events
function handleTyping() {
  if (!testStarted) {
    startTest();
    testStarted = true;
    if (testDuration === "unlimited") {
      startTime = new Date();
    }
  }

  const typedText = normalizeText(typingEditor.getValue());
  updateStats(typedText);
  highlightMistakesInSnippet(typedText);

  const normalizedSnippet = normalizeText(currentSnippet);
  // End test if the user has typed the entire snippet correctly.
  if (typedText === normalizedSnippet) {
    endTest();
    return;
  }

  // Additionally, if the user has reached the last line and completed it, end the test.
  const snippetLines = normalizedSnippet.split("\n");
  const userLines = typingEditor.getValue().split("\n").map(line => line.trim());
  if (
    userLines.length >= snippetLines.length &&
    userLines[snippetLines.length - 1].length >= snippetLines[snippetLines.length - 1].length
  ) {
    endTest();
  }
}

// Start the timer if a time limit is set
function startTest() {
  if (testDuration !== "unlimited") {
    timer = setInterval(() => {
      timeLeft--;
      timerDisplay.textContent = timeLeft;
      if (timeLeft <= 0) endTest();
    }, 1000);
  }
}

// End the test, store results, and redirect to the results page
function endTest() {
  clearInterval(timer);
  typingEditor.setOption("readOnly", true);

  // Store test results and preferences in localStorage
  localStorage.setItem("wpm", wpmDisplay.textContent);
  localStorage.setItem("accuracy", accuracyDisplay.textContent);
  localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dracula" : "eclipse");
  localStorage.setItem("duration", testDuration);

  window.location.href = "results.html";
}

// Restart the test without resetting the theme
restartButton.onclick = () => {
  // Re-read the duration option from the select element.
  const durationSelect = document.getElementById("duration-select");
  if (durationSelect) {
    testDuration = durationSelect.value;
  }
  if (testDuration !== "unlimited") {
    timeLeft = parseInt(testDuration);
    timerDisplay.textContent = timeLeft;
  } else {
    timerDisplay.textContent = "Unlimited";
  }

  typingEditor.setValue("");
  typingEditor.setOption("readOnly", false);
  clearInterval(timer);
  testStarted = false;
  wpmDisplay.textContent = "0";
  accuracyDisplay.textContent = "100";
  startTime = null;

  currentSnippet = snippets[Math.floor(Math.random() * snippets.length)];
  snippetEditor.setValue(currentSnippet);
};

// Toggle theme and store the preference
themeToggle.onclick = () => {
  document.body.classList.toggle("dark-mode");
  let theme = document.body.classList.contains("dark-mode") ? "dracula" : "eclipse";
  snippetEditor.setOption("theme", theme);
  typingEditor.setOption("theme", theme);
  localStorage.setItem("theme", theme);
};

// On page load, load preferences, set the duration, and initialize the test
window.onload = () => {
  let savedTheme = localStorage.getItem("theme") || "eclipse";
  if (savedTheme === "dracula") {
    document.body.classList.add("dark-mode");
  }

  // Read the duration option from the select element (and update if a stored value exists)
  const durationSelect = document.getElementById("duration-select");
  if (durationSelect) {
    // If the user has previously selected a duration, use that.
    let storedDuration = localStorage.getItem("selectedDuration");
    if (storedDuration) {
      durationSelect.value = storedDuration;
      testDuration = storedDuration;
    } else {
      testDuration = durationSelect.value;
    }
    if (testDuration !== "unlimited") {
      timeLeft = parseInt(testDuration);
      timerDisplay.textContent = timeLeft;
    } else {
      timerDisplay.textContent = "Unlimited";
    }
    // Refresh the page when a new duration is selected.
    durationSelect.addEventListener("change", function(){
      localStorage.setItem("selectedDuration", this.value);
      window.location.reload();
    });
  }

  currentSnippet = snippets[Math.floor(Math.random() * snippets.length)];
  initEditors();
  snippetEditor.setOption("theme", savedTheme);
  typingEditor.setOption("theme", savedTheme);
  snippetEditor.setValue(currentSnippet);
};
