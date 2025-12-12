import React, { useState, useEffect } from "react";
import "./App.css";

/* -------------------------------------------------
   GENERATE RANDOM 4x4 BOARD
-------------------------------------------------- */
function generateBoard() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const newBoard = [];
  for (let i = 0; i < 4; i++) {
    const row = [];
    for (let j = 0; j < 4; j++) {
      row.push(letters[Math.floor(Math.random() * letters.length)]);
    }
    newBoard.push(row);
  }
  return newBoard;
}

/* -------------------------------------------------
   WORD EXISTS ON BOARD (DFS PATH CHECK)
-------------------------------------------------- */
function wordExistsOnBoard(word, board) {
  word = word.toLowerCase();
  const rows = board.length;
  const cols = board[0].length;

  const visited = Array.from({ length: rows }, () =>
    Array(cols).fill(false)
  );

  const dirs = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],          [0, 1],
    [1, -1],  [1, 0], [1, 1]
  ];

  function dfs(r, c, index) {
    if (index === word.length) return true;
    if (r < 0 || c < 0 || r >= rows || c >= cols) return false;
    if (visited[r][c]) return false;
    if (board[r][c].toLowerCase() !== word[index]) return false;

    visited[r][c] = true;

    for (const [dr, dc] of dirs) {
      if (dfs(r + dr, c + dc, index + 1)) return true;
    }

    visited[r][c] = false;
    return false;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (dfs(r, c, 0)) return true;
    }
  }

  return false;
}

/* -------------------------------------------------
   BOGGLE SOLVER (DFS + DICTIONARY)
   - Uses dictionary to compute full solution list
   - User input does NOT use dictionary
-------------------------------------------------- */
function findAllBoardWords(board, dictionary) {
  if (!board || board.length === 0 || dictionary.length === 0) return [];

  const rows = board.length;
  const cols = board[0].length;

  const dictSet = new Set(dictionary);
  const prefixSet = new Set();

  for (const w of dictionary) {
    for (let i = 1; i <= w.length; i++) prefixSet.add(w.slice(0, i));
  }

  const results = new Set();
  const visited = Array.from({ length: rows }, () =>
    Array(cols).fill(false)
  );

  const dirs = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],          [0, 1],
    [1, -1],  [1, 0], [1, 1]
  ];

  function dfs(r, c, curr) {
    if (r < 0 || c < 0 || r >= rows || c >= cols || visited[r][c]) return;

    curr += board[r][c].toLowerCase();

    if (!prefixSet.has(curr)) return;

    visited[r][c] = true;

    if (curr.length >= 3 && dictSet.has(curr)) {
      results.add(curr.toUpperCase());
    }

    for (const [dr, dc] of dirs) dfs(r + dr, c + dc, curr);

    visited[r][c] = false;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dfs(r, c, "");
    }
  }

  return Array.from(results);
}

/* -------------------------------------------------
   MAIN APP COMPONENT
-------------------------------------------------- */
function App() {
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const [board, setBoard] = useState([]);
  const [input, setInput] = useState("");

  const [dictionary, setDictionary] = useState([]);
  const [dictReady, setDictReady] = useState(false);

  const [allSolutions, setAllSolutions] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [missedWords, setMissedWords] = useState([]);
  const [showAll, setShowAll] = useState(false);

  const [message, setMessage] = useState("");

  /* -------------------------------------------------
     LOAD DICTIONARY
  -------------------------------------------------- */
  useEffect(() => {
    fetch("full-wordlist.json")
      .then((res) => res.json())
      .then((data) => {
        setDictionary(data.map((w) => w.toLowerCase()));
        setDictReady(true);
      })
      .catch(() => setDictReady(true));
  }, []);

  /* -------------------------------------------------
     START GAME
  -------------------------------------------------- */
  const startGame = () => {
    if (!dictReady) return;

    const newBoard = generateBoard();
    const solutions = findAllBoardWords(newBoard, dictionary);

    setBoard(newBoard);
    setAllSolutions(solutions);

    setFoundWords([]);
    setMissedWords([]);
    setMessage("");
    setInput("");
    setShowAll(false);

    setStarted(true);
    setTimeLeft(60);
  };

  /* -------------------------------------------------
     STOP GAME
  -------------------------------------------------- */
  const stopGame = () => {
    setStarted(false);

    const missed = allSolutions.filter((w) => !foundWords.includes(w));
    setMissedWords(missed);
    setMessage("Game Over. Check Missed Words Below.");
  };

  /* -------------------------------------------------
     TIMER
  -------------------------------------------------- */
  useEffect(() => {
    if (!started) return;

    if (timeLeft <= 0) {
      stopGame();
      return;
    }

    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [started, timeLeft]);

  /* -------------------------------------------------
     SUBMIT WORD
     (VALIDATION USES BOARD ONLY, NOT DICTIONARY)
  -------------------------------------------------- */
  const submitWord = () => {
    const word = input.trim().toUpperCase();
    setInput("");

    if (!started) {
      setMessage("❌ Game is not running.");
      return;
    }

    if (!word) {
      setMessage("❌ Enter a word.");
      return;
    }

    if (foundWords.includes(word)) {
      setMessage("❌ Already found.");
      return;
    }

    // BOARD-ONLY CHECK
    if (!wordExistsOnBoard(word, board)) {
      setMessage("❌ That word is NOT on this board.");
      return;
    }

    setFoundWords([...foundWords, word]);
    setMessage("✔ Word added!");
  };

  /* -------------------------------------------------
     RENDER UI
  -------------------------------------------------- */
  return (
    <div className="wrapper">
      <div className="glass-card">
        <h1 className="title">Boggle Game</h1>

        {/* START / STOP BUTTON */}
        {!dictReady ? (
          <button className="btn start disabled">Loading Dictionary...</button>
        ) : !started ? (
          <button className="btn start" onClick={startGame}>
            Start Game
          </button>
        ) : (
          <button className="btn stop" onClick={stopGame}>
            Stop Game
          </button>
        )}

        {/* TIMER */}
        {started && (
          <div className="timer-box">
            <div className="timer-label">Time Left:</div>
            <div className="timer-value">{timeLeft}s</div>
          </div>
        )}

        {/* BOARD */}
        {started && (
          <div className="board">
            {board.map((row, r) => (
              <div key={r} className="row">
                {row.map((letter, c) => (
                  <div key={c} className="tile">{letter}</div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* INPUT – ONLY VISIBLE WHILE GAME ACTIVE */}
        {started && (
          <div className="input-row">
            <input
              className="word-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter word..."
            />
            <button className="btn submit" onClick={submitWord}>
              Submit
            </button>
          </div>
        )}

        {/* MESSAGE */}
        {message && <p className="message">{message}</p>}

        {/* FOUND WORDS */}
        <h2 className="subheader">Words Found</h2>
        <ul className="word-list">
          {foundWords.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>

        {/* MISSED WORDS */}
        {!started && missedWords.length > 0 && (
          <>
            <h2 className="subheader">Words You Missed</h2>
            <ul className="word-list">
              {missedWords.map((w, i) => (
                <li key={i} className="missed">{w}</li>
              ))}
            </ul>

            {/* SHOW ALL WORDS BUTTON */}
            <button
              className="btn start"
              style={{ marginTop: "10px", backgroundColor: "#444" }}
              onClick={() => setShowAll(true)}
            >
              Show All Words
            </button>
          </>
        )}

        {/* FULL SOLUTIONS LIST */}
        {showAll && (
          <>
            <h2 className="subheader">All Possible Words</h2>
            <ul className="word-list">
              {allSolutions.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
