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


  function _checkSet(set, symbol = set[0]) {
    // Returns true if a provided set of elements all have the same value.

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

  function chooseRandomSpace() {
    // Returns the index of an undefined space within the boardstate.

    const availableSpaces = []

    for (i = 0; i <= 2; i++) {
      let row = boardState[i]
      for (j = 0; j <= 2; j++) {
        let space = row[j]
        if (!space) {
          availableSpaces.push([i, j])
        }
      }
    }
    const randInt = Math.floor(Math.random() * availableSpaces.length)

    return availableSpaces[randInt]
  }


  return {
    createBoard,
    updateBoard,
    resetBoard,
    checkWinConditions,
    chooseRandomSpace
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


  function updateBoard(element, symbol) {
    // Adds the active player's symbol to the board display.

    if (!element.innerHTML) {
      element.innerHTML = symbol
    }
  }


  function activateSpaces() {
    // Adds turn event listeners to spaces.
    
    boardSpaces.forEach(space => space.addEventListener('click', game.humanTakeTurn))
  }


  function deactivateSpaces() {
    // Removes turn event listener from spaces.
    
    boardSpaces.forEach(space => space.removeEventListener('click', game.takeTurn))
  }


  function getBoardSpaceElement(row, column) {
    // Returns the DOM element for the provided row and column.

    return boardDiv.children[row].children[column]
  }


  function confirmPlayers() {
    // Creates player objects based on user's input.

    const activePlayer = _parsePlayerData(document.xPlayerData)
    activePlayer.element.classList.add('active-player')
    
    const inactivePlayer = _parsePlayerData(document.oPlayerData)
    inactivePlayer.element.classList.remove('active-player')



    return [activePlayer, inactivePlayer]
  }


  function _parsePlayerData(form) {
    // extract player data from page from.

    const name = form.name.value || form.dataset.symbol
    const symbol = form.dataset.symbol
    const type = form.type.value
    const element = form

    return player(name, symbol, type, element)

  }

  return {
    createBoard,
    confirmPlayers,
    modal,
    activateSpaces,
    deactivateSpaces,
    getBoardSpaceElement,
    updateBoard
    };
})();

const player = (name, symbol, type, element) => {
  // Creates a player for the game.

    return {name, symbol, type, element};
  };

const game = (() => {
  // Initializes and runs a game.

  const modal = displayController.modal
  
  // initialize player variables
  let [activePlayer, inactivePlayer] = [undefined, undefined]

  // initialize a turn counter
  let turns = 0

  function setupGame() {
    // Creates a new gameboard data structure & displays an empty board.
   
    gameBoard.createBoard();
    displayController.createBoard();
    [activePlayer, inactivePlayer] = displayController.confirmPlayers();

    displayController.activateSpaces();
    turns = 0
    if (activePlayer.type === 'AI') {
      aITakeTurn()
    }
  }


//   function takeTurn() {
//     // Controls the the flow of the info needed for a turn.


//     // initialize coordinates for the current turn  
//     let [row, column] = [undefined, undefined]
//     let displayElement = undefined

//     // determine turn coordinates (human and pc)
//     while (!displayElement) {

//       // confirms coordindates & display element for an AI player
//       if (activePlayer.type === 'AI') {
//         setTimeout(function() {
//           row, column = chooseSpaceAI()
//         }, 1500)
//         displayElement = displayController.getBoardSpaceElement(row, column)
//       }  
//     }
  
//   // determine DOM element (human and pc)
  

//   // update boardstate
//   gameBoard.updateBoard(row, column, activePlayer.symbol)

//   // udpate display
//   displayElement.innerHTML = activePlayer.symbol

//   // increment turns
//   turns++

//   // check gamestatus
//   reviewGameStatus()
// }


  function humanTakeTurn(e) {
    // Sets the coordinates of the choosen boardspace for a human player.

    if (activePlayer.type === 'human') {
      const symbol = activePlayer.symbol
      const row =  Number(this.parentElement.getAttribute('data-row-index'))
      const column = Number(this.getAttribute('data-column-index'))
      // const displayElement = e.target

      // update data structure and display
      gameBoard.updateBoard(row, column, symbol)
      displayController.updateBoard(e.target, symbol)

      // check for end conditions
      let gameOver = reviewGameStatus()

      if (!gameOver && activePlayer.type === 'AI') {
        aITakeTurn()
      }

    }
  }


  function aITakeTurn() {
    // Process for an AI to choose a board space, update the board & check the game's end conditions.
    
    let row =  undefined;
    let column = undefined;

    if (activePlayer.type === 'AI') {
      setTimeout(function() {
        
        [row, column] = gameBoard.chooseRandomSpace()
        const displayElement = displayController.getBoardSpaceElement(row, column)

        // update data structure and display
        gameBoard.updateBoard(row, column, activePlayer.symbol)
        displayController.updateBoard(displayElement, activePlayer.symbol)

        // check for end conditions
        let gameOver = reviewGameStatus()

        if (!gameOver && activePlayer.type === 'AI') {
          aITakeTurn()
        }
      }, 1500)
    }
  }


  function reviewGameStatus() {
    // Returns true if the game's win/tie conditions have been met.

    let gameOver = undefined

    // checks for win condition
    if (turns > 3 && gameBoard.checkWinConditions()) {
      gameOver = true
      modal.base.style.display = "flex"
      modal.text.innerHTML = `${activePlayer.name} wins!`
      displayController.deactivateSpaces()

    // checks for tie
    } else if (turns === 8) {
      gameOver = true
      modal.base.style.display = "flex"
      modal.text.innerHTML = 'it\'s a tie'
      displayController.deactivateSpaces()
    
    // passes the turn
    } else {
      // udpate active player
      [activePlayer, inactivePlayer] = [inactivePlayer, activePlayer]
      
      // idea: I could use the toggle ability below
      inactivePlayer.element.classList.remove('active-player')
      activePlayer.element.classList.add('active-player')
      turns++
    }
    return gameOver
  }

  return {
    setupGame,
    humanTakeTurn,
  }

})();


game.setupGame()

// bugs:
// clicking a boardspace after a tie activates the modal again