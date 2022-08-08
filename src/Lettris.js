//import { render } from '@testing-library/react';
import React from 'react';
import './Lettris.css';

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
      <i className="material-icons info-icon">information</i>
    </div>
  );
}

function GameOverPopup(props) {
  let popupClass = "info-center game-over-popup-hidden";

  if (props.gameOver === true) {
    popupClass = "info-center game-over-popup-visible";
  }
  return (
    <div className={popupClass}>
      GAME OVER !! <br/> Your Score: {props.score} <br/>
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
          Press the alphabets <div className="unselected-filled-square-A square-info">A</div>-<div className="unselected-filled-square-Z square-info">Z</div> that you want to append to your word.
        </li>
        <li>
          Press <button className="back-button-info">BACK</button> to remove letter from the end of the word.
        </li>
        <li>
          The word is displayed in between <button className="start-button-info">START</button> and <button className="back-button-info">BACK</button>
        </li>
        <li>
          As soon as a valid word of 3 or more letters is formed, it becomes pressable.
          <div className="word-score-display-clickable">VALID</div>Press it to clear the selected alphabets.
        </li>
        <li>
          The bigger the word the more points you get for it.
        </li>
      </ul>
    </div>
  )
}

class Lettris extends React.Component {
  constructor(props) {
    super(props);
    this.timerId = null;
    this.score = 0;
    this.squareArray = [];
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
    this.handleSquareClick = this.handleSquareClick.bind(this);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.handleDisplayClick = this.handleDisplayClick.bind(this);
    this.handleGameOverButtonClick = this.handleGameOverButtonClick.bind(this);

    this.checkValidWord = this.checkValidWord.bind(this);

    this.pauseGame = this.pauseGame.bind(this);
    this.resumeGame = this.resumeGame.bind(this);
    this.resetGame = this.resetGame.bind(this);
    this.updateGrid = this.updateGrid.bind(this);
    this.getGridState = this.getGridState.bind(this);

    this.state = {
      selected: Array(150).fill(false),
      letters: Array(150).fill(''),
      displayText: '',
      displayClickable: false,
      gameInPlay: false,
      gameOver: false,
      instPopupShow: false,
    };
  }
  
  componentDidMount() {
  }

  checkValidWord(word) {
    if (word.length < 3) {
      this.setState({displayClickable: false});
      return;
    }
    
    fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + word)
    .then(response => {
      let clickable = false;
      if (response.status === 200) {
        clickable = true;
      }
      this.setState({displayClickable: clickable});
    })
    .catch(error => this.setState({displayClickable: false})
    );
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
    for (i = 0; i < 10; i++) {
      this.squareArray[i].alphabet = GetPseudorandomLetter();
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
    this.setState({ gameInPlay: true, instPopupShow: false, gameOver: false });
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
      setTimeout(this.resetGame, 5000);
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

  handleSquareClick(i) {
    if (this.state.gameInPlay === false ||
        this.state.gameOver === true ||
        this.squareArray[i].alphabet === '' ||
        this.squareArray[i].selected > -1)
      return;
  
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
  }

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
      if (this.instPopupShowDuringGamePlay === true) {
        this.setState({instPopupShow: false});
        this.instPopupShowDuringGamePlay = false;
        this.resumeGame();
      } else {
        this.setState({instPopupShow: false});
      }
    } else {
      if (this.state.gameInPlay === true) {
        this.pauseGame();
        this.instPopupShowDuringGamePlay = true;
        this.setState({instPopupShow: true});
      } else {
        this.instPopupShowDuringGamePlay = false;
        this.setState({instPopupShow: true});
      }
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
      <Square selected={this.state.selected[i]} letter={this.state.letters[i]} onClick={() => this.handleSquareClick(i)} />
    );
  }

  render() {
    return (
      <div className="lettris">
        <div className="top-container">
          <InstButton onClick={() => this.handleInstClick()} />
          <div className="lettris-name">Lettris</div>
          <div className="stats">...</div>
        </div>
        <div className="grid-container">
          {this.renderGrid()}
          <InstPopup instPopupShow={this.state.instPopupShow} />
          <GameOverPopup gameOver={this.state.gameOver} score={this.score} onClick={() => this.handleGameOverButtonClick()}/>
        </div>
        <div className="bottom-container">
          <StartButton gameInPlay={this.state.gameInPlay} onClick={() => this.handleStartButtonClick()} />
          <WordAndScoreDisplay displayText={this.state.displayText}
           displayClickable={this.state.displayClickable}
           onClick={() => this.handleDisplayClick()}/>
          <BackButton onClick={() => this.handleBackButtonClick()} />
        </div>
      </div>
    );
  }
};

export default Lettris;