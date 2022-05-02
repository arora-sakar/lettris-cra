import { render } from '@testing-library/react';
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
    square_class = "selected-filled-square";
  } else {
    square_class = "unselected-filled-square";
  }
  return (
    <button className={square_class} onClick={props.onClick}>{props.letter}</button>
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

class WordAndScoreDisplay extends React.Component {
  render() {
    return (
      <div className="word-score-display"></div>
    );
  }
}

class BackButton extends React.Component {
  render() {
    return (
      <button className="back-button">BACK</button>
    );
  }
}

/*
class LetterBox {
  constructor(x, y) {
    this.gridShape = {rows: x, cols:y};
    this.letters = Array(this.gridShape.cols);
    this.ydiff = Array(this.gridShape.cols);
    this.y = 0;
    this.refresh();
  }

  moveDown(gridState) {
    if (this.y < this.gridShape.rows)
      this.y++;
  }

  refresh() {
    for (let i = 0; i < this.letters.length; i++) {
      this.letters[i] = GetPseudorandomLetter();
      this.ydiff[i] = 0;
    }
    this.y = 0;
  }

  is_settled() {
    return false;
  }

  get(gridState) {
    var newState = gridState.slice();
    for (let i = 0; i < this.gridShape.cols; i++) {
      newState[(this.y + this.ydiff[i]) * this.gridShape.rows + i] = this.letters[i];
    }
    return newState;
  }
}
*/

class Lettris extends React.Component {
  constructor(props) {
    super(props);
    this.timerId = null;
    this.letterBoxRefresh = this.letterBoxRefresh.bind(this);
    this.letterBoxExpired = this.letterBoxExpired.bind(this);
    this.letterBoxDraw = this.letterBoxDraw.bind(this);
    this.letterBoxErase = this.letterBoxErase.bind(this);
    this.handleStartButtonClick = this.handleStartButtonClick.bind(this);
    this.handleSquareClick = this.handleSquareClick.bind(this);
    this.playGame = this.playGame.bind(this);

    this.letterBox = {
      letters: Array(10).fill(''),
      letters_row: Array(10).fill(0),
    }

    this.state = {
      selected: Array(160).fill(false),
      letters: Array(160).fill(''),
      gameInPlay: false,
    };
  }

  letterBoxRefresh() {
    for (let i = 0; i < this.letterBox.letters.length; i++) {
      this.letterBox.letters[i] = GetPseudorandomLetter();
      this.letterBox.letters_row[i] = 0;
    }
    console.log(this.letterBox.letters);
  }

  letterBoxExpired(gridLetters) {
    let ret = true;

    if (this.letterBox.letters[0] === '')
      return ret;

    for (let i = 0; i < this.letterBox.letters.length; i++) {
      if (this.letterBox.letters_row[i] >= 15) {
        continue;
      }
      if (gridLetters[(this.letterBox.letters_row[i] + 1) * 10 + i] === '') {
        ret = false;
        break;
      }
    }
    return ret;
  }

  letterBoxDraw(gridLetters) {
    for (let i = 0; i < this.letterBox.letters.length; i++) {
      gridLetters[(this.letterBox.letters_row[i]) * 10 + i] = this.letterBox.letters[i];
    }

    return gridLetters;
  }

  letterBoxErase(gridLetters) {
    for (let i = 0; i < this.letterBox.letters.length; i++) {
      gridLetters[(this.letterBox.letters_row[i]) * 10 + i] = '';
    }
    return this.gridLetters;
  }

  letterBoxMoveDown(gridLetters) {
    for (let i = 0; i < this.letterBox.letters.length; i++) {
      if (this.letterBox.letters_row[i] >= 15) {
        continue;
      }
      if (gridLetters[(this.letterBox.letters_row[i] + 1) * 10 + i] === '') {
        this.letterBox.letters_row[i]++;
      }
    }
  }

  playGame() {
    let gridLetters = [...this.state.letters];
    if (this.letterBoxExpired(gridLetters) === true) {
      this.letterBoxRefresh();
    } else {
      this.letterBoxErase(gridLetters);
      this.letterBoxMoveDown(gridLetters);
    }
    this.letterBoxDraw(gridLetters);
    this.setState({ letters: gridLetters });
  }

  handleStartButtonClick() {
    if (this.timerId === null) {
      this.timerId = setInterval(this.playGame, 1000);
      this.setState({ gameInPlay: true });
    } else {
      clearInterval(this.timerId);
      this.timerId = null;
      this.setState({ gameInPlay: false });
    }
  }

  handleSquareClick(i) {
    const selected = this.state.selected.slice();

    selected[i] = true;
    this.setState({ selected: selected });
  }

  renderGrid() {
    var grid = [];
    for (var i = 0; i < 160; i++) {
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
        <div className="grid-container">
          {this.renderGrid()}
        </div>
        <div className="bottom-container">
          <StartButton gameInPlay={this.state.gameInPlay} onClick={() => this.handleStartButtonClick()} />
          <WordAndScoreDisplay />
          <BackButton />
        </div>
      </div>
    );
  }
}

export default Lettris;