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
    // Verifies a board space is undefined then updates the boardstate with the given symbol. Returns false if boardstate is not undefined, otherwise returns true.
    
    let occupied = boardState[row][column]

    if (!occupied) {
      boardState[row][column] = symbol
    }    
    return Boolean(boardState[row][column])
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


  function checkSetMajority(set) {
    // confirms the majority symbol of a given set.

    return (symbol && set.every(space => space === symbol))
    
    return false
  
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
  const boardDiv = document.getElementById('board-anchor')
  
  // collection of all spaces on the board display
  let boardSpaces = undefined
  
  // modal to display outcome of game
  const modal = {
    base: document.getElementById('modal'),
    closeBtn: document.getElementById('modal-close'),
    text: document.getElementById('modal-text')
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


  function updateBoard(element, symbol) {
    // Adds the provided symbol to the matching space of the board display.

    if (!element.innerHTML) {
      element.innerHTML = symbol
    }
  }


  function activateSpaces() {
    // Adds turn event listeners to spaces.
    
    boardSpaces.forEach(space => space.addEventListener('click', game.humanTakeTurn))
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
    boardDiv,
    newGameBtn,
    activateSpaces,
    getBoardSpaceElement,
    updateBoard,
    };
})();

const player = (name, symbol, type, element) => {
  // Creates a player for the game.

  const toggleForm = (state) => {

    const elements = element.elements

    for (i = 0; i < elements.length; i++) {
        elements[i].disabled = state;
    }
  }
  
  return {name, symbol, type, element, toggleForm}
  }


const game = (() => {
  // Initializes and runs a game.
  
  // initialize player variables
  let [activePlayer, inactivePlayer] = [undefined, undefined]

  // initialize a turn counter
  let turns = 0

  // initilize a flag to determine when the game should end
  let resetGameFlag = undefined
  
  // initilize a flag to determine when the game should end
  let activeGame = undefined

  // initialize the modal object to display game results
  const modal = displayController.modal

  // set event for new game button
  displayController.newGameBtn.addEventListener('click', requestReset)


  function setupGame() {
    // Creates a new gameboard data structure & displays an empty board.
   
    gameBoard.createBoard();
    displayController.createBoard();
    displayController.activateSpaces();
    [activePlayer, inactivePlayer] = displayController.confirmPlayers();
    turns = 0
    activeGame = true
    if (activePlayer.type === 'AI') {
      aITakeTurn()
    }
  }


  function humanTakeTurn(e) {
    // Uses a humnan player's space choice to update the game.

    // prevents changes to player data during an active game.
    if (!turns) {
      activePlayer.toggleForm(true)
      inactivePlayer.toggleForm(true)
    }

    
    if (activeGame && activePlayer.type === 'human') {
      const row =  Number(this.parentElement.getAttribute('data-row-index'))
      const column = Number(this.getAttribute('data-column-index'))
      updateBoard(row, column, e.target)
    }
  
  }


  function aITakeTurn() {
    // Uses the AI's space choice to update the game.
    
    if (!turns) {
      activePlayer.toggleForm(true)
      inactivePlayer.toggleForm(true)
    }

    let row =  undefined;
    let column = undefined;
  
    setTimeout(function() {
      [row, column] = gameBoard.chooseRandomSpace()
      const element = displayController.getBoardSpaceElement(row, column)
      updateBoard(row, column, element)
    }, 1000)
  }

  function updateBoard(row, column, element) {
    // Handles the updates to the boardstate and display, then checks for the game's end conditions.

    // update data structure and display
    if (gameBoard.updateBoard(row, column, activePlayer.symbol)) {
      displayController.updateBoard(element, activePlayer.symbol)

      // check for end conditions
      reviewGameStatus()

      if (activeGame && activePlayer.type === 'AI') {
        aITakeTurn()

      }
    }
  }

  function reviewGameStatus() {
    // Returns true if the game's win/tie conditions have been met.

    // handles a reset request made during AI turn
    if (resetGameFlag) {
      activeGame = false
      resetGame()
    
    // checks for win condition
    } else if (turns > 3 && gameBoard.checkWinConditions()) {
      activeGame = false
      modal.base.style.display = "flex"
      modal.text.innerHTML = `${activePlayer.name} wins!`

    // checks for tie
    } else if (turns === 8) {
      activeGame = false
      modal.base.style.display = "flex"
      modal.text.innerHTML = 'it\'s a tie'
    }
    
    // passes the turn
    if (activeGame) {
      // udpate active player
      [activePlayer, inactivePlayer] = [inactivePlayer, activePlayer]
      
      inactivePlayer.element.classList.remove('active-player')
      activePlayer.element.classList.add('active-player')
      turns++  
    } else {
      activePlayer.toggleForm(false)
      inactivePlayer.toggleForm(false)
    }
  }


function requestReset() {
  // Sets resetGame flag to enable a reset routine at the end of the current turn.
  if (!activeGame) {
    resetGame()
  } else {
    resetGameFlag = true
  }
}


function resetGame() {
  // Clears gamestate and display data, then sets up a new game.

  gameBoard.resetBoard()
  displayController.boardDiv.innerHTML = ''
  resetGameFlag = false

  game.setupGame()
  
}


  function getTurn() {
    return turns
  }

  return {
    setupGame,
    humanTakeTurn,
    requestReset,
  }

})();


game.setupGame()

// notes:
// check what can be factored out or pushed up in the hierarchy of the game object

// stopped at:
  // working on strategy for opening move
