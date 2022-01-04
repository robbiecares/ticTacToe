const gameBoard = (() => {
  // Stores game board state data.

  const boardState = [];

  function createBoard() {
    // Creates an empty datastructure to represent the game's board state.

    for (i = 0; i <= 2; i++) {
      let row = []  
      for (j = 0; j <= 2; j++) {
        let space = undefined
        row.push(space)  
      }
    boardState.push(row)
    }
  }


  function updateBoard(row, column, symbol) {
    // Verifies a board space is undefined, then updates it.
    
    if (!boardState[row][column]) {
      boardState[row][column] = symbol
    }    
  }


  function resetBoard() {
    boardState.length = 0
  }


  function isFull() {
    // Returns 'true' if all spaces in the board state have a value (i.e. the gameboard is full).
    
    let full = true

    for (i = 0; i < boardState.length; i++) check: {
      for (j = 0; j < boardState.length; j++) {
        if (!boardState[i][j]) {
          full = false
          break check
        }
      }
    }
    
    return full

    // idea: alternate implementation - concat all boardstate elements and make one check using an array method like 'every'
    // note: function no longer used due to implementation of 'turn' variable
  }


  function _checkSet(set, symbol = set[0]) {
    // Returns true if a provided set of elements are all the same.

    return (symbol && set.every(space => space === symbol))
  }


  function _checkHorizontalWin() {
    // Checks if any row on the board contains a set of three symbols from the same player.

    let win = false 

    for (i = 0; i < boardState.length; i++) {
      win = _checkSet(boardState[i])
      if (win) {
        break
      }
    }
    return win
  }


  function _checkVerticalWin() {
    // Checks if any column on the board contains a set of three symbols from the same player.

    let win = false 

    for (i = 0; i < boardState.length; i++) {
      let column = []
      for (j = 0; j < boardState.length; j++) {
          column.push(boardState[j][i])
      }
      win = _checkSet(column)
      if (win) {
        break
      }
    }  
    return win
  }


  function _checkDiagonalWin() {
    // Checks if either diagonal set on the board contains a set of three symbols from the same player.

    let win = false 
    const center = boardState[1][1]

    if (center) {

      const diagonals = [
        [boardState[0][0], center, boardState[2][2]],
        [boardState[0][2], center, boardState[2][0]]
      ]
      
      for (i = 0; i < diagonals.length; i++) {
        win = _checkSet(diagonals[i], center)
        if (win) {
          break
        }
      }
      
      // if (boardState[0][0] === center && boardState[2][2] === center) {
      //   win = true
      // } else if (boardState[0][2] === center && boardState[2][0] === center) {
      //   win = true
      // }
    } 
    return win
  }


  function checkWinConditions() {
    // Checks board state for any set of three characters in a row.
    
    return (_checkHorizontalWin() || _checkVerticalWin() || _checkDiagonalWin())

  }

  return {
    createBoard,
    updateBoard,
    resetBoard,
    // isFull,
    checkWinConditions
  };
})();

const displayController = (() => {
  // Houses all functions related to creating and updating the UI.
  
  const newGameBtn = document.getElementById('reset')
  newGameBtn.addEventListener('click', resetGame)
  
  const boardDiv = document.getElementById('board-anchor')
  
  // collection of all spaces on the board display
  let boardSpaces = undefined
  
  const modal = {
    base: document.getElementById('modal'),
    closeBtn: document.getElementById('modal-close'),
    text: document.getElementById('modal-text'),
  }
  modal.closeBtn.addEventListener('click', () => modal.base.style.display = "none")

  
  function createBoard() {
    // Creates a grid of DOM elements.

    for (rowIndex = 0;rowIndex <= 2; rowIndex++) {
      let rowDiv = document.createElement('div')
      rowDiv.classList.add('board-row')
      rowDiv.setAttribute('data-row-index', rowIndex)
      
      for (columnIndex = 0;columnIndex <= 2; columnIndex++) {
        let boardSpaceDiv = document.createElement('div')
        boardSpaceDiv.classList.add('board-space')
        boardSpaceDiv.setAttribute('data-column-index', columnIndex)
        rowDiv.appendChild(boardSpaceDiv)
      }
      boardDiv.appendChild(rowDiv)
      
      // updates the parent variable after spaces are created
      boardSpaces = document.querySelectorAll('.board-space')
    };
  } 


  function resetGame() {
    // Clears gamestate and display data, then sets up a new game.

    gameBoard.resetBoard()
    boardDiv.innerHTML = ''
    game.setupGame()
  }


  function activateSpaces() {
    // Adds turn event listeners to spaces.
    
    boardSpaces.forEach(space => space.addEventListener('click', game.takeTurn))
  }


  function deactivateSpaces() {
    // Removes turn event listener from spaces.
    
    boardSpaces.forEach(space => space.removeEventListener('click', game.takeTurn))
  }

  
  function confirmPlayers() {
    // Creates player objects based on user's input.

    const xPlayerData = document.getElementById('x-player-name')
    const oPlayerData = document.getElementById('o-player-name')

    // idea: move parsing of player data into player function to avoid repetition of 'get attribute'
    const activePlayer = player(xPlayerData.value || xPlayerData.getAttribute('data-symbol'), xPlayerData.getAttribute('data-symbol'))
    const inactivePlayer = player(oPlayerData.value || oPlayerData.getAttribute('data-symbol'), oPlayerData.getAttribute('data-symbol'))

    return [activePlayer, inactivePlayer]
  }

  return {
    createBoard,
    confirmPlayers,
    modal,
    activateSpaces,
    deactivateSpaces
    };
})();

const player = (name, symbol) => {
  // Creates a player for the game.

  // tba
    return {name, symbol};
  };

const game = (() => {
  // Initializes and runs a game.

  const modal = displayController.modal
  
  // initialize player variables
  let [activePlayer, inactivePlayer] = [undefined, undefined]

  // initialize a turn counter
  let turns = 0
  
  

  function takeTurn() {
    // Responds to a click on a space during an active game.
    
    const row =  Number(this.parentElement.getAttribute('data-row-index'))
    const column = Number(this.getAttribute('data-column-index'))

    // confirms the space is empty before updating the board state
    if (!this.innerHTML) {

      gameBoard.updateBoard(row, column, activePlayer.symbol)
      this.innerHTML = activePlayer.symbol
      turns++

      // checks for win condition
      if (turns > 4 && gameBoard.checkWinConditions()) {
          modal.base.style.display = "flex"
          modal.text.innerHTML = `${activePlayer.name} wins!`
          displayController.deactivateSpaces()

      // checks for tie
      } else if (turns === 9) {
          modal.base.style.display = "flex"
          modal.text.innerHTML = 'it\'s a tie'
      
      // passes the turn
      } else {
          // udpate active player
          [activePlayer, inactivePlayer] = [inactivePlayer, activePlayer]
      }
    }
  }


  function setupGame() {
    // Creates a new gameboard data structure & displays an empty board.
   
    gameBoard.createBoard();
    displayController.createBoard();
    [activePlayer, inactivePlayer] = displayController.confirmPlayers();
    displayController.activateSpaces();
    turns = 0
  }

  return {
    setupGame,
    takeTurn,
    activePlayer,
  }
})();


game.setupGame()