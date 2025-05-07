import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Lettris.css';

const LocalWordsVersion = "localWordsV1";

// Helper functions moved outside component for cleaner organization
const getPseudorandomLetter = () => {
  const weightedLetters = "EEEEEEEEEEAAAAAAAARRRRRRRIIIIIIIOOOOOOOTTTTTTTNNNNNNNSSSSSSLLLLLCCCCCUUUUDDDPPPMMMHHHGGBBFFYYWKVXZJQ";
  return weightedLetters[Math.floor(Math.random() * weightedLetters.length)];
};

// UI Components converted to functional components with React.memo for performance
const Square = React.memo(({ letter, selected, onClick }) => {
  let squareClass = '';
  if (letter === '') {
    squareClass = "empty-square";
  } else if (selected === true) {
    squareClass = "selected-filled-square-" + letter;
  } else {
    squareClass = "unselected-filled-square-" + letter;
  }
  
  return (
    <div className={squareClass} onClick={onClick}>{letter}</div>
  );
});

const StartButton = React.memo(({ gameInPlay, onClick }) => {
  const caption = gameInPlay ? "PAUSE" : "START";
  return (
    <button className="start-button" onClick={onClick}>{caption}</button>
  );
});

const WordAndScoreDisplay = React.memo(({ displayText, displayClickable, onClick }) => {
  const displayClass = displayClickable ? "word-score-display-clickable" : "word-score-display";
  return (
    <div className={displayClass} onClick={onClick}>{displayText}</div>
  );
});

const BackButton = React.memo(({ onClick }) => {
  return (
    <button className="back-button" onClick={onClick}>BACK</button>
  );
});

const InstButton = React.memo(({ onClick }) => {
  return (
    <div className="instructions" onClick={onClick}>i</div>
  );
});

const StatButton = React.memo(({ onClick }) => {
  return (
    <div className="stats" onClick={onClick}>...</div>
  );
});

const GameOverPopup = React.memo(({ gameOver, score, highScore, onClick }) => {
  const popupClass = gameOver 
    ? "info-center game-over-popup-visible" 
    : "info-center game-over-popup-hidden";
    
  return (
    <div className={popupClass}>
      GAME OVER !! <hr/><br/><p>Your Score: {score}</p><p>High Score: {highScore}</p>
      <button className="game-over-ok-button" onClick={onClick}>OK</button>
    </div>
  );
});

const InstPopup = React.memo(({ instPopupShow }) => {
  const instPopupClass = instPopupShow ? "inst-popup-visible" : "inst-popup-hidden";
  
  return (
    <div className={instPopupClass}>
      <h3 className="info-center">HOW TO PLAY</h3>
      <hr/>
      <p>Make as many words as possible before space for falling alphabets runs out.</p>
      <br/>
      <ul>
        <li>
          Press &nbsp;
          <button className="start-button-info">START</button>/<button className="start-button-info">PAUSE</button> to start or pause the game.
        </li>
        <li>
          Press the alphabets <div className="alphabet-info-A">A</div>-<div className="alphabet-info-Z">Z</div> that you want to append to your word.
        </li>
        <li>
          Press <button className="back-button-info">BACK</button> to remove letter from the end of the word.
        </li>
        <li>
          The word is displayed in a word box between <button className="start-button-info">START</button> and <button className="back-button-info">BACK</button>
        </li>
        <li>
          As soon as a valid word of 3 or more alphabets is formed, word box becomes pressable.
          <div className="word-score-display-clickable center">VALID</div>Press it to clear the selected alphabets.
        </li>
        <li>
          The bigger the word the more points you get for it.
        </li>
      </ul>
    </div>
  );
});

const StatPopup = React.memo(({ statPopupShow, score, highScore }) => {
  const statPopupClass = statPopupShow 
    ? "info-center stat-popup-visible" 
    : "info-center stat-popup-hidden";
    
  return (
    <div className={statPopupClass}>
      <h3 className="info-center">Statistics</h3>
      <hr/>
      <p>Current Score: {score} </p>
      <p>High Score: {highScore} </p>
    </div>
  );
});

// Main component converted to functional component with hooks
const Lettris = () => {
  // State variables
  const [letters, setLetters] = useState(Array(150).fill(''));
  const [selected, setSelected] = useState(Array(150).fill(false));
  const [displayText, setDisplayText] = useState('');
  const [displayClickable, setDisplayClickable] = useState(false);
  const [gameInPlay, setGameInPlay] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [instPopupShow, setInstPopupShow] = useState(false);
  const [statPopupShow, setStatPopupShow] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const storedHighScore = localStorage.getItem("highScore");
    return storedHighScore ? Number(storedHighScore) : 0;
  });

  // Refs for values that don't trigger re-renders
  const timerIdRef = useRef(null);
  const instPopupShowDuringGamePlayRef = useRef(false);
  const statPopupShowDuringGamePlayRef = useRef(false);
  
  // Refs for game state
  const squareArrayRef = useRef([]);
  const selectedSquaresRef = useRef([]);
  const fallingSquaresRef = useRef([]);
  const wordScoreDisplayTextRef = useRef([]);

  // Initialize squareArray on component mount
  useEffect(() => {
    for (let i = 0; i < 150; i++) {
      squareArrayRef.current.push({
        alphabet: '',
        selected: -1,
        index: i,
      });
    }
  }, []);

  // Fetch words.txt for dictionary
  useEffect(() => {
    const loadDictionary = async () => {
      if (localStorage.getItem(LocalWordsVersion) === "true") {
        return;
      }
      
      try {
        const response = await fetch(process.env.PUBLIC_URL + "words.txt");
        const data = await response.text();
        let tmpList = data.split("\n");
        
        for (let i = 0; i < tmpList.length; i++) {
          let word = tmpList[i].replace("\r", "");
          if (localStorage.getItem(word) === null) {
            localStorage.setItem(word, "valid");
          }
        }
        
        localStorage.setItem(LocalWordsVersion, "true");
      } catch (error) {
        console.error(error);
      }
    };
    
    loadDictionary();
  }, []);

  // Check if word is valid
  const checkValidWord = useCallback(async (word) => {
    if (word.length < 3) {
      setDisplayClickable(false);
      return;
    }

    if (localStorage.getItem(word) === "valid") {
      setDisplayClickable(true);
      return;
    }

    setDisplayClickable(false);
    
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (response.status === 200) {
        localStorage.setItem(word, "valid");
        checkValidWord(wordScoreDisplayTextRef.current.join(''));
      }
    } catch (error) {
      console.error("Error checking word:", error);
    }
  }, []);

  // Refresh falling squares
  const refreshFallingSquares = useCallback(() => {
    let i = 0;
    for (; i < 10; i++) {
      if (squareArrayRef.current[i].alphabet !== '') {
        break;
      }
    }
    
    if (i < 10) {
      pauseGame();
      setGameOver(true);
      return;
    }
    
    const amap = new Map();
    for (i = 0; i < 10; i++) {
      let a = '';
      do {
        a = getPseudorandomLetter();
      } while (amap.has(a));
      
      amap.set(a, true);
      squareArrayRef.current[i].alphabet = a;
      fallingSquaresRef.current.push(squareArrayRef.current[i]);
    }
  }, []);

  // Move falling squares
  const moveFallingSquares = useCallback(() => {
    var fallingSquaresNext = [];
    for (let i = 0; i < fallingSquaresRef.current.length; i++) {
      if (Math.floor(fallingSquaresRef.current[i].index/10) >= 14) {
        continue;
      }
      
      if (squareArrayRef.current[fallingSquaresRef.current[i].index + 10].alphabet !== '') {
        continue;
      }
      
      if (fallingSquaresRef.current[i].alphabet === '') {
        continue;
      }
      
      squareArrayRef.current[fallingSquaresRef.current[i].index + 10].alphabet =
        fallingSquaresRef.current[i].alphabet;
        
      if (fallingSquaresRef.current[i].selected > -1) {
        selectedSquaresRef.current[fallingSquaresRef.current[i].selected] =
          squareArrayRef.current[fallingSquaresRef.current[i].index + 10];
      }
      
      squareArrayRef.current[fallingSquaresRef.current[i].index + 10].selected =
        fallingSquaresRef.current[i].selected;
        
      fallingSquaresRef.current[i].alphabet = '';
      fallingSquaresRef.current[i].selected = -1;
      fallingSquaresNext.push(squareArrayRef.current[fallingSquaresRef.current[i].index + 10]);
    }
    
    if (fallingSquaresNext.length === 0) {
      refreshFallingSquares();
      return;
    }
    
    fallingSquaresRef.current = fallingSquaresNext;
  }, [refreshFallingSquares]);

  // Get grid state
  const getGridState = useCallback(() => {
    const newLetters = [...letters];
    const newSelected = [...selected];
    
    for (let i = 0; i < 150; i++) {
      newLetters[i] = squareArrayRef.current[i].alphabet;
      newSelected[i] = (squareArrayRef.current[i].selected > -1);
    }
    
    setLetters(newLetters);
    setSelected(newSelected);
  }, [letters, selected]);

  // Game control functions
  const pauseGame = useCallback(() => {
    clearInterval(timerIdRef.current);
    timerIdRef.current = null;
    setGameInPlay(false);
  }, []);

  const resumeGame = useCallback(() => {
    timerIdRef.current = setInterval(updateGrid, 1000);
    setGameInPlay(true);
    setInstPopupShow(false);
    setStatPopupShow(false);
    setGameOver(false);
  }, []);

  const resetGame = useCallback(() => {
    fallingSquaresRef.current = [];
    selectedSquaresRef.current = [];
    wordScoreDisplayTextRef.current = [];
    
    setScore(0);
    
    for (let i = 0; i < 150; i++) {
      squareArrayRef.current[i] = {
        alphabet: '',
        selected: -1,
        index: i,
      };
    }

    setLetters(Array(150).fill(''));
    setSelected(Array(150).fill(false));
    setDisplayClickable(false);
    setDisplayText("");
    setGameOver(false);
    setGameInPlay(false);
  }, []);

  // Update grid state
  const updateGrid = useCallback(() => {
    moveFallingSquares();
    
    if (gameOver) {
      setTimeout(resetGame, 10000);
      return;
    }
    
    getGridState();
  }, [moveFallingSquares, getGridState, gameOver, resetGame]);

  // Drop upper squares when word is formed
  const dropUpperSquares = useCallback((index) => {
    if (squareArrayRef.current[index].selected === -1) {
      return;
    }
    
    while (index >= 10 && squareArrayRef.current[index - 10].alphabet !== '') {
      if (squareArrayRef.current[index - 10].selected > -1) {
        dropUpperSquares(index - 10);
      }
      
      squareArrayRef.current[index].alphabet = squareArrayRef.current[index - 10].alphabet;
      squareArrayRef.current[index].selected = squareArrayRef.current[index - 10].selected;
      index = index - 10;
    }
    
    squareArrayRef.current[index].alphabet = '';
    squareArrayRef.current[index].selected = -1;
  }, []);

  // Event handlers
  const handleStartButtonClick = useCallback(() => {
    if (gameOver) {
      return;
    }
    
    if (!gameInPlay) {
      resumeGame();
    } else {
      pauseGame();
    }
  }, [gameOver, gameInPlay, resumeGame, pauseGame]);

  const handleSquareClick = useCallback((i) => {
    if (!gameInPlay || gameOver || squareArrayRef.current[i].selected > -1) {
      return;
    }

    if (squareArrayRef.current[i].alphabet === '' && squareArrayRef.current[i+10].alphabet !== '') {
      let flag = false;
      for (let s of fallingSquaresRef.current) {
        if (s.index === i+10) {
          flag = true;
          break;
        }
      }
      
      if (flag === false) {
        return;
      }
      
      i = i + 10;
    }
    
    squareArrayRef.current[i].selected = selectedSquaresRef.current.push(squareArrayRef.current[i]) - 1;
    wordScoreDisplayTextRef.current.push(squareArrayRef.current[i].alphabet);
    let word = wordScoreDisplayTextRef.current.join('');

    checkValidWord(word);
    getGridState();
    setDisplayText(word);
  }, [gameInPlay, gameOver, checkValidWord, getGridState]);

  const handleDisplayClick = useCallback(() => {
    if (!gameInPlay || gameOver || !displayClickable) {
      return;
    }

    for (let i = 0; i < selectedSquaresRef.current.length; i++) {
      dropUpperSquares(selectedSquaresRef.current[i].index);
    }

    getGridState();
    
    const newScore = score + wordScoreDisplayTextRef.current.length * 2;
    setScore(newScore);
    
    if (newScore > highScore) {
      localStorage.setItem("highScore", String(newScore));
      setHighScore(newScore);
    }

    selectedSquaresRef.current = [];
    wordScoreDisplayTextRef.current = [];
    setDisplayClickable(false);
    setDisplayText(`Score: ${newScore}`);
  }, [gameInPlay, gameOver, displayClickable, dropUpperSquares, getGridState, score, highScore]);

  const handleBackButtonClick = useCallback(() => {
    if (!gameInPlay || selectedSquaresRef.current.length === 0) {
      return;
    }
    
    let square = selectedSquaresRef.current.pop();
    square.selected = -1;

    wordScoreDisplayTextRef.current.pop();
    let word = wordScoreDisplayTextRef.current.join('');

    checkValidWord(word);
    getGridState();
    setDisplayText(word);
  }, [gameInPlay, checkValidWord, getGridState]);

  const handleGameOverButtonClick = useCallback(() => {
    resetGame();
  }, [resetGame]);

  const handleInstClick = useCallback(() => {
    if (instPopupShow) {
      setInstPopupShow(false);
      if (instPopupShowDuringGamePlayRef.current) {
        instPopupShowDuringGamePlayRef.current = false;
        resumeGame();
      }
    } else {
      if (gameInPlay) {
        pauseGame();
        instPopupShowDuringGamePlayRef.current = true;
      } else {
        instPopupShowDuringGamePlayRef.current = false;
      }
      
      setInstPopupShow(true);
      setStatPopupShow(false);
    }
  }, [instPopupShow, gameInPlay, pauseGame, resumeGame]);

  const handleStatClick = useCallback(() => {
    if (statPopupShow) {
      setStatPopupShow(false);
      if (statPopupShowDuringGamePlayRef.current) {
        statPopupShowDuringGamePlayRef.current = false;
        resumeGame();
      }
    } else {
      if (gameInPlay) {
        pauseGame();
        statPopupShowDuringGamePlayRef.current = true;
      } else {
        statPopupShowDuringGamePlayRef.current = false;
      }
      
      setStatPopupShow(true);
      setInstPopupShow(false);
    }
  }, [statPopupShow, gameInPlay, pauseGame, resumeGame]);

  // Render the grid
  const renderGrid = () => {
    const grid = [];
    for (let i = 0; i < 150; i++) {
      grid.push(
        <Square 
          key={i}
          selected={selected[i]} 
          letter={letters[i]} 
          onClick={() => handleSquareClick(i)} 
        />
      );
    }
    return grid;
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className="top-container">
        <InstButton onClick={handleInstClick} />
        <div className="lettris-name">
          Lettris
        </div>
        <StatButton onClick={handleStatClick} />
      </div>
      
      <div className="grid-container">
        {renderGrid()}
        <InstPopup instPopupShow={instPopupShow} />
        <StatPopup 
          statPopupShow={statPopupShow} 
          score={score} 
          highScore={highScore} 
        />
        <GameOverPopup 
          gameOver={gameOver} 
          score={score} 
          highScore={highScore} 
          onClick={handleGameOverButtonClick} 
        />
      </div>
      
      <div className="bottom-container">
        <StartButton 
          gameInPlay={gameInPlay} 
          onClick={handleStartButtonClick} 
        />
        <WordAndScoreDisplay 
          displayText={displayText}
          displayClickable={displayClickable}
          onClick={handleDisplayClick} 
        />
        <BackButton onClick={handleBackButtonClick} />
      </div>
    </>
  );
};

export default Lettris;