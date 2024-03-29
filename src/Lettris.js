import React from 'react';
import './Lettris.css';

const LocalWordsVersion = "localWordsV1";

function GetPseudorandomLetter() {
  const WeightedLetters = "EEEEEEEEEEAAAAAAAARRRRRRRIIIIIIIOOOOOOOTTTTTTTNNNNNNNSSSSSSLLLLLCCCCCUUUUDDDPPPMMMHHHGGBBFFYYWKVXZJQ";
  return WeightedLetters[Math.floor(Math.random() * WeightedLetters.length)];
}

function Square(props) {
  let square_class = '';
  if (props.letter === '') {
    square_class = "empty-square";
  } else if (props.selected === true) {
    square_class = "selected-filled-square-" + props.letter;
  } else {
    square_class = "unselected-filled-square-" + props.letter;
  }
  return (
    <div className={square_class} onClick={props.onClick}>{props.letter}</div>
  )
}

function StartButton(props) {
  var caption = "START";
  if (props.gameInPlay === true) {
    caption = "PAUSE";
  }
  return (
    <button className="start-button" onClick={props.onClick}>{caption}</button>
  );
}

function WordAndScoreDisplay(props) {
  let displayClass = "word-score-display";
  if (props.displayClickable === true) {
    displayClass = "word-score-display-clickable";
  }
  return (
    <div className={displayClass} onClick={props.onClick}>{props.displayText}</div>
  );
}

function BackButton(props) {
  return (
    <button className="back-button" onClick={props.onClick}>BACK</button>
  );
}

function InstButton(props) {
  return (
    <div className="instructions" onClick={props.onClick}>
      i
    </div>
  );
}

function StatButton(props) {
  return (
    <div className="stats" onClick={props.onClick}>...</div>
  );
}


function GameOverPopup(props) {
  let popupClass = "info-center game-over-popup-hidden";

  if (props.gameOver === true) {
    popupClass = "info-center game-over-popup-visible";
  }
  return (
    <div className={popupClass}>
      GAME OVER !! <hr/><br/><p>Your Score: {props.score}</p><p>High Score: {props.highScore}</p>
      <button className="game-over-ok-button" onClick={props.onClick}>OK</button>
    </div>
  );
}

function InstPopup(props) {
  let instPopupClass = "inst-popup-hidden";
  if (props.instPopupShow === true) {
    instPopupClass = "inst-popup-visible";
  }
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
  )
}

function StatPopup(props) {
  let statPopupClass = "info-center stat-popup-hidden";
  if (props.statPopupShow === true) {
    statPopupClass = "info-center stat-popup-visible";
  }
  return (
    <div className={statPopupClass}>
      <h3 className="info-center">Statistics</h3>
      <hr/>
      <p>Current Score: {props.score} </p>
      <p>High Score: {props.highScore} </p>
    </div>
  );
}

class Lettris extends React.Component {
  constructor(props) {
    super(props);
    this.timerId = null;
    this.score = 0;
    this.squareArray = [];
    this.useLocalWords =  false;
    for (let i = 0; i < 150; i++) {
      this.squareArray.push({alphabet: '',
        selected: -1,
        index: i,
      });
    }

    this.selectedSquares = [];
    this.fallingSquares = [];
    this.wordScoreDisplayText = [];

    this.refreshFallingSquares = this.refreshFallingSquares.bind(this);
    this.moveFallingSquares = this.moveFallingSquares.bind(this);
    this.dropUpperSquares = this.dropUpperSquares.bind(this);

    this.handleStartButtonClick = this.handleStartButtonClick.bind(this);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.handleDisplayClick = this.handleDisplayClick.bind(this);
    this.handleGameOverButtonClick = this.handleGameOverButtonClick.bind(this);
    this.handleInstClick = this.handleInstClick.bind(this);
    this.handleStatClick = this.handleStatClick.bind(this);

    this.checkValidWord = this.checkValidWord.bind(this);

    this.pauseGame = this.pauseGame.bind(this);
    this.resumeGame = this.resumeGame.bind(this);
    this.resetGame = this.resetGame.bind(this);
    this.updateGrid = this.updateGrid.bind(this);
    this.getGridState = this.getGridState.bind(this);

    let tmp = localStorage.getItem("highScore");
    if (tmp == null) {
      this.highScore = 0;
    } else {
      this.highScore = Number(tmp);
    }

    this.state = {
      selected: Array(150).fill(false),
      letters: Array(150).fill(''),
      displayText: '',
      displayClickable: false,
      gameInPlay: false,
      gameOver: false,
      instPopupShow: false,
      statPopupShow: false,
    };
  }
  
  componentDidMount() {
    if (localStorage.getItem(LocalWordsVersion) === "true") {
      //console.log("Found local words!!");
      return;
    }
    //console.log("No local words!! Fetching words.txt");
    fetch(process.env.PUBLIC_URL + "words.txt")
    .then(response => {
      return response.text();
    })
    .then(data => {
      let tmpList = data.split("\n");
      for (let i = 0; i < tmpList.length; i++) {
        let word = tmpList[i].replace("\r", "");
        if (localStorage.getItem(word) === null) {
          localStorage.setItem(word, "valid");
        }
      }
      localStorage.setItem(LocalWordsVersion, "true");
      //console.log("All words from words.txt stored in local storage.");
    })
    .catch(error => console.error(error));
  }

  checkValidWord(word) {
    if (word.length < 3) {
      this.setState({displayClickable: false});
      return;
    }

    //console.log("checking valid word with local words.");
    if (localStorage.getItem(word) === "valid") {
      this.setState({displayClickable: true});
      return;
    }

    this.setState({displayClickable: false});
    //console.log("checking valid word with dictionary api.");
    fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + word)
    .then(response => {
      if (response.status === 200) {
        localStorage.setItem(word, "valid");
        this.checkValidWord(this.wordScoreDisplayText.join(''));
      }
    });
  }

  refreshFallingSquares() {
    let i = 0;
    for (; i < 10; i++) {
      if (this.squareArray[i].alphabet !== '') {
        break;
      }
    }
    if (i < 10) {
      this.pauseGame();
      this.setState({gameOver: true});
      return;
    }
    const amap = new Map();
    for (i = 0; i < 10; i++) {
      let a = '';
      do {
        a = GetPseudorandomLetter();
      } while (amap.has(a));
      amap.set(a, true);
      this.squareArray[i].alphabet = a;
      this.fallingSquares.push(this.squareArray[i]);
    }
  }

  moveFallingSquares() {
    var fallingSquaresNext = [];
    for (let i = 0; i < this.fallingSquares.length; i++) {
      if (Math.floor(this.fallingSquares[i].index/10) >= 14) {
        continue;
      }
      if (this.squareArray[this.fallingSquares[i].index + 10].alphabet !== '') {
        continue;
      }
      if (this.fallingSquares[i].alphabet === '') {
        continue;
      }
      this.squareArray[this.fallingSquares[i].index + 10].alphabet =
        this.fallingSquares[i].alphabet;
      if (this.fallingSquares[i].selected > -1) {
        this.selectedSquares[this.fallingSquares[i].selected] =
          this.squareArray[this.fallingSquares[i].index + 10];
      }
      this.squareArray[this.fallingSquares[i].index + 10].selected =
        this.fallingSquares[i].selected;
      this.fallingSquares[i].alphabet = '';
      this.fallingSquares[i].selected = -1;
      fallingSquaresNext.push(this.squareArray[this.fallingSquares[i].index + 10]);
    }
    if (fallingSquaresNext.length === 0) {
      this.refreshFallingSquares();
      return;
    }
    this.fallingSquares = fallingSquaresNext;
  }

  getGridState(gridLetters, gridSelected) {
    for (let i = 0; i < 150; i++) {
      gridLetters[i] = this.squareArray[i].alphabet;
      gridSelected[i] = (this.squareArray[i].selected > -1);
    }
  }

  pauseGame() {
    clearInterval(this.timerId);
    this.timerId = null;
    this.setState({gameInPlay: false});
  }

  resumeGame() {
    this.timerId = setInterval(this.updateGrid, 1000);
    this.setState({ gameInPlay: true, instPopupShow: false, statPopupShow: false, gameOver: false });
  }

  resetGame() {
    this.fallingSquares = [];
    this.selectedSquares = [];
    this.wordScoreDisplayText = [];
    this.score = 0;
    for (let i = 0; i < 150; i++) {
      this.squareArray[i] = {
        alphabet: '',
        selected: -1,
        index: i,
      }
    }

    this.setState({
      letters: Array(150).fill(''),
      selected: Array(150).fill(false),
      displayClickable: false,
      displayText:"",
      gameOver: false,
      gameInPlay: false,
    });
  }

  updateGrid() {
    let gridLetters = [...this.state.letters];
    let gridSelected = [...this.state.selected];
    
    this.moveFallingSquares();
    if (this.state.gameOver === true) {
      setTimeout(this.resetGame, 10000);
      return;
    }
    this.getGridState(gridLetters, gridSelected);
    this.setState({ letters: gridLetters, selected: gridSelected });
  }

  handleStartButtonClick() {
    if (this.state.gameOver === true) {
      return;
    }
    if (this.state.gameInPlay === false) {
      this.resumeGame();
    } else {
      this.pauseGame();
    }
  }

  handleSquareClick = (i) => {
    if (this.state.gameInPlay === false ||
        this.state.gameOver === true ||
        this.squareArray[i].selected > -1) {
      return;
    }

    if (this.squareArray[i].alphabet === '' && this.squareArray[i+10].alphabet !== '') {
        let flag = false;
        for (let s of this.fallingSquares) {
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
    this.squareArray[i].selected = this.selectedSquares.push(this.squareArray[i]) - 1;
    this.wordScoreDisplayText.push(this.squareArray[i].alphabet);
    let word = this.wordScoreDisplayText.join('');

    this.checkValidWord(word);

    let gridSelected = [...this.state.selected];
    let gridLetters = [...this.state.letters];

    this.getGridState(gridLetters, gridSelected);

    this.setState({
      selected: gridSelected,
      displayText: word,
    });
  };

  dropUpperSquares(index) {
    if (this.squareArray[index].selected === -1)
      return;
    
    while (index >= 10 && this.squareArray[index - 10].alphabet !== '') {
      if (this.squareArray[index - 10].selected > -1) {
        this.dropUpperSquares(index-10);
      }
      this.squareArray[index].alphabet = this.squareArray[index - 10].alphabet;
      this.squareArray[index].selected = this.squareArray[index - 10].selected;
      index = index - 10;
    }
    this.squareArray[index].alphabet = '';
    this.squareArray[index].selected = -1;
  }
  

  handleDisplayClick() {
    if (this.state.gameInPlay === false ||
        this.state.gameOver === true ||
        this.state.displayClickable === false) {
      return;
    }

    for (let i = 0; i < this.selectedSquares.length; i++) {
      this.dropUpperSquares(this.selectedSquares[i].index);
    }

    let gridLetters = [...this.state.letters];
    let gridSelected = [...this.state.selected];

    this.getGridState(gridLetters, gridSelected);
    this.score += this.wordScoreDisplayText.length * 2;
    if (this.score > this.highScore) {
      localStorage.setItem("highScore", String(this.score));
      this.highScore = this.score;
    }

    this.selectedSquares = [];
    this.wordScoreDisplayText = [];
    this.setState({letters: gridLetters,
                  selected: gridSelected,
                  displayClickable: false,
                  displayText:"Score: " + this.score});
  }

  handleGameOverButtonClick() {
    this.resetGame();
  }

  handleInstClick() {
    if (this.state.instPopupShow === true) {
      this.setState({instPopupShow: false});
      if (this.instPopupShowDuringGamePlay === true) {
        this.instPopupShowDuringGamePlay = false;
        this.resumeGame();
      }
    } else {
      if (this.state.gameInPlay === true) {
        this.pauseGame();
        this.instPopupShowDuringGamePlay = true;
      } else {
        this.instPopupShowDuringGamePlay = false;
      }
      this.setState({instPopupShow: true, statPopupShow: false});
    }
  }

  handleStatClick() {
    if (this.state.statPopupShow === true) {
      this.setState({statPopupShow: false});
      if (this.statPopupShowDuringGamePlay === true) {
        this.statPopupShowDuringGamePlay = false;
        this.resumeGame();
      }
    } else {
      if (this.state.gameInPlay === true) {
        this.pauseGame();
        this.statPopupShowDuringGamePlay = true;
      } else {
        this.statPopupShowDuringGamePlay = false;
      }
      this.setState({statPopupShow: true, instPopupShow: false});
    }
  }

  handleBackButtonClick() {
    if (this.state.gameInPlay === false
      || this.selectedSquares.length === 0) {
        return;
      }
    let gridSelected = [...this.state.selected];
    let gridLetters = [...this.state.letters];

    let square = this.selectedSquares.pop();
    square.selected = -1;

    this.wordScoreDisplayText.pop();
    let word = this.wordScoreDisplayText.join('');

    this.checkValidWord(word);

    this.getGridState(gridLetters, gridSelected);
    
    this.setState({
      selected: gridSelected,
      displayText: word,
    });
  }

  renderGrid() {
    var grid = [];
    for (var i = 0; i < 150; i++) {
      grid.push(this.renderSquare(i));
    }
    return grid;
  }

  renderSquare(i) {
    return (
      <Square selected={this.state.selected[i]} letter={this.state.letters[i]} onClick={this.handleSquareClick.bind(this, i)} />
    );
  }

  render() {
    return (
        <><div className="top-container">
            <InstButton onClick={this.handleInstClick} />
            <div className="lettris-name">
                Lettris
            </div>
            <StatButton onClick={this.handleStatClick} />
        </div><div className="grid-container">
                {this.renderGrid()}
                <InstPopup instPopupShow={this.state.instPopupShow} />
                <StatPopup statPopupShow={this.state.statPopupShow} score={this.score} highScore={this.highScore} />
                <GameOverPopup gameOver={this.state.gameOver} score={this.score} highScore={this.highScore} onClick={this.handleGameOverButtonClick} />
            </div><div className="bottom-container">
                <StartButton gameInPlay={this.state.gameInPlay} onClick={this.handleStartButtonClick} />
                <WordAndScoreDisplay displayText={this.state.displayText}
                    displayClickable={this.state.displayClickable}
                    onClick={this.handleDisplayClick} />
                <BackButton onClick={this.handleBackButtonClick} />
            </div></>
    );
  }
};

export default Lettris;