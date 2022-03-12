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


  function _confirmThreeInARow(set, symbol = set[0]) {
    // Returns true if a provided set of elements all have the same value.

    return (symbol && set.every(space => space === symbol))
  }


  function _checkHorizontalWin() {
    // Checks if any row on the board contains a set of three symbols from the same player.

    let win = false 

    for (i = 0; i < boardState.length; i++) {
      win = _confirmThreeInARow(boardState[i])
      if (win) {
        break
      }
    }
    return win
  }


  function _checkVerticalWin() {
    // Checks if any column of the board contains a set of three symbols from the same player.

    let win = false 

    for (i = 0; i < boardState.length; i++) {
      let column = []
      for (j = 0; j < boardState.length; j++) {
          column.push(boardState[j][i])
      }
      win = _confirmThreeInARow(column)
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
        win = _confirmThreeInARow(diagonals[i], center)
        if (win) {
          break
        }
      }
    } 
    return win
  }


  function checkForWin() {
    // Checks board state for any set of three characters in a row.
    
    return _checkHorizontalWin() || _checkVerticalWin() || _checkDiagonalWin()
  }


  function _getVerticalSets() {
    // Returns the vertical sets of the boardstate.

    let columns = []

    for (column = 0; column < boardState.length; column++) {
      let set = []
      for (row = 0; row < boardState.length; row++) {
        set.push(boardState[row][column])
      }
      columns.push(set)
    }    
    return columns
  }


  function _getDiagonalSets() {
    // Returns the diagonal sets of the boardstate.
    
    const center = boardState[1][1]

    return [
      [boardState[0][0], center, boardState[2][2]],
      [boardState[0][2], center, boardState[2][0]]
    ]
  }


  function _chooseRandomSpace() {
    // Returns the index of an undefined space within the boardstate.

    const availableSpaces = []

    for (i = 0; i < boardState.length; i++) {
      let row = boardState[i];
      for (j = 0; j < boardState.length; j++) {
        let space = row[j];
        if (!space) {
          availableSpaces.push([i, j])
        }
      }
    }
    const randInt = Math.floor(Math.random() * availableSpaces.length)

    return availableSpaces[randInt]
  }


  function _checkForPotentialWin(symbol) {
    // Checks board state for any potential move that could win the game.


    function _confirmTwoOutOfThree(items) {
      // Returns the index of the undefined element in a set that contains two matching symbols and undefined element.
  
      return items.filter(x => x === symbol).length === 2 && items.filter(x => x === undefined).length === 1 ? items.indexOf(undefined) : undefined
    }

    
    function _orderCoordinates(set, coord) {
      // Returns boardspace coordinates based on the set type.

      let coords = undefined

      switch(set) {
        case boardState:
          coords = [i, coord]
          break
        case vSets:
          coords = [coord, i]          
          break
        case dSets:
          if (coord === 1 || !i) {
            coords = [coord, coord]
          } else {
            coords = (!coord) ? [coord, 2] : [coord, 0]
          }          
          break
      }
      return coords
    }

    // std var
    let winningSpace = undefined
    const vSets = _getVerticalSets();
    const dSets = _getDiagonalSets();

    // Iterates each row, column and diagnoal set of the gameboard and returns the first potential winning space.
    sets:
    for (set of [boardState, vSets, dSets]) {        
      for (i = 0; i < set.length; i++) {
        // std var for 'true' check
        let coord = _confirmTwoOutOfThree(set[i]) 
        if (coord || coord === 0) {
          winningSpace = _orderCoordinates(set, coord);
          break sets;
        }
      }
    }
    return winningSpace
  }


  function determineAIMove() {
    // Returns the best space for the AI.

    // create better AI logic
      // could I win this turn?
        //  check all sets
      // could I lose next turn?
        //  check all sets
      // where could I block a potential set for my opponent?

    const aPlayer = game.getActivePlayerSymbol()
    const iPlayer = game.getInactivePlayerSymbol()

    
    return _checkForPotentialWin(aPlayer) || _checkForPotentialWin(iPlayer) || _chooseRandomSpace()
  }

  return {
    createBoard,
    updateBoard,
    resetBoard,
    checkForWin,
    determineAIMove
  };
})();


const displayController = (() => {
  // Houses all functions related to creating and updating the UI.
  
  const startBtn = document.getElementById('start')
  const resetBtn = document.getElementById('reset')
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
      element.removeEventListener('click', game.humanTakeTurn)
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
    startBtn,
    resetBtn,
    activateSpaces,
    getBoardSpaceElement,
    updateBoard,
    };
})();


const player = (name, symbol, type, element) => {
  // Creates a player for the game.

  const protectForm = (state) => {

    const elements = element.elements

    for (i = 0; i < elements.length; i++) {
        elements[i].disabled = state;
    }
  }
  
  return {name, symbol, type, element, protectForm}
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

  // set events for game buttons
  displayController.startBtn.addEventListener('click', (e) => {startGame(e)})
  displayController.resetBtn.addEventListener('click', requestReset)


  function setupGame() {
    // Creates a new gameboard data structure & displays an empty board.
   
    gameBoard.createBoard();
    displayController.createBoard();
    displayController.activateSpaces();
    activeGame = false
    turns = 0
  }


  function humanTakeTurn(e) {
    // Uses a human player's space choice to update the game.
    
    if (!turns) {
      startGame(e)
    }

    if (activeGame && activePlayer.type === 'human') {

      const row =  Number(this.parentElement.getAttribute('data-row-index'))
      const column = Number(this.getAttribute('data-column-index'))
      updateBoard(row, column, e.target)
    }
  
  }


  function aITakeTurn() {
    // Uses the AI's space choice to update the game.

    let row =  undefined;
    let column = undefined;
  
    setTimeout(function() {
      [row, column] = gameBoard.determineAIMove()
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
    } else if (turns > 3 && gameBoard.checkForWin()) {
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
      activePlayer.protectForm(false)
      inactivePlayer.protectForm(false)
    }
  }


  function requestReset() {
    // Handles a request to reset the game.
  
    if (!activeGame || activePlayer.type === 'human') {
      resetGame()
    } else {
      resetGameFlag = true
    }
  }


  function startGame(e) {
    // Starts a new game.

    if (!turns) {
      [activePlayer, inactivePlayer] = displayController.confirmPlayers();
      activeGame = true
      activePlayer.protectForm(true)
      inactivePlayer.protectForm(true)


      // highlight active player data
      inactivePlayer.element.classList.remove('active-player')
      activePlayer.element.classList.add('active-player')



      if (e.target === displayController.startBtn && activePlayer.type === 'AI') {
        aITakeTurn()
      }
    }    
  }


  function resetGame() {
    // Clears gamestate and display data, then sets up a new game.

    gameBoard.resetBoard()
    displayController.boardDiv.innerHTML = ''
    resetGameFlag = false

    // unlocks player data forms
    if (typeof(activePlayer) !== "undefined") {
      activePlayer.protectForm(false)
      inactivePlayer.protectForm(false)
      activePlayer.element.classList.remove('active-player')



    }
    game.setupGame()
    
  }

  function getActivePlayerSymbol() {
    // Provides the active player symbol to other functions and objects.

    return activePlayer.symbol
  }


  function getInactivePlayerSymbol() {
    // Provides the active player symbol to other functions and objects.

    return inactivePlayer.symbol
  }


  function getTurn() {
    return turns
  }

  return {
    setupGame,
    humanTakeTurn,
    requestReset,
    getActivePlayerSymbol,
    getInactivePlayerSymbol
  }
})();


game.setupGame()

// notes:
// check what can be factored out or pushed up in the hierarchy of the game object

<<<<<<< HEAD
// stopped at:
  // working on strategy for opening move
=======
// bug: player data forms "shake"

// stopped at:

>>>>>>> dev
