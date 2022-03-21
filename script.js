const gameBoard = (() => {
  // Stores game board state data.

  const boardState = [];
  let turn0 = undefined

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


  function _getRandomElement(iterable) {
    // Returns a random element from the given iterable.

    const element = Math.floor(Math.random() * iterable.length)

    return iterable[element]
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


  function checkForWin() {
    // Returns true if any set in the game contains three matching symbols.
  
    let win = false
    const vSets = _getVerticalSets();
    const dSets = _getDiagonalSets();

    allSets:
    for (sets of [boardState, vSets, dSets]) {        
      for (i = 0; i < sets.length; i++) {
        let set = sets[i]
        let symbol = set[0]
        let win = symbol && set.every(space => space === symbol)
        if (win) {
          break allSets;
        }
      }
    }
    return win
  }


  function _getAvailableCorners() {
    // Return the indices of all availables corner spaces.
    let indices = [];
    for (x of [0, 2]) {
      for (y of [0, 2]) {
        if (!boardState[x][y]) {
          indices.push([x, y])
        };
      };
    };
    return indices
  };


  function _getOppositeCorner(x, y) {
    // Returns the corner in same diagnoal as the one provided.
    return (x === y) ? [Math.abs(x-2), Math.abs(y-2)] : [y, x]
  }


  function _getAvailableSides() {
    // Returns the coordinates of all available 'side' spaces.
    
    available = []

    for (space of [[0, 1], [1, 0], [1, 2], [2, 1]]) {
      let [x ,y] = space
      if (!boardState[x][y]) {
        available.push(space)
      }
    }
    return available
  }


  function assessBoard() {
    // Returns the best space for the AI.

    let bestMove = undefined
    const aPlayer = game.getActivePlayerSymbol()
    const iPlayer = game.getInactivePlayerSymbol()
    const turn = game.getTurn()
    const vSets = _getVerticalSets();
    const dSets = _getDiagonalSets();
    const corners = _getAvailableCorners()

    function _checkForPotentialWin(symbol) {
      // Checks board state for any potential move that could win the game.
  
      let winningSpace = undefined

      function _confirmTwoOutOfThree(set) {
        // Returns the index of the undefined element in a set that contains two matching symbols and undefined element.
    
        return set.filter(x => x === symbol).length === 2 && set.filter(x => x === undefined).length === 1 ? set.indexOf(undefined) : undefined
      }

      // Iterates each row, column and diagnoal set of the gameboard and returns the first potential winning space.
      allSets:
      for (sets of [boardState, vSets, dSets]) {        
        for (i = 0; i < sets.length; i++) {
          // std var for 'true' check
          let set = sets[i]
          let coord = _confirmTwoOutOfThree(set)
          if (coord || coord === 0) {
            winningSpace = _orderCoordinates(sets, coord);
            break allSets;
          }
        }
      }
      return winningSpace
    }


    function _confirmPotentialToIncrease(set, symbol) {
      // Returns the index of the first undefined element of a set that contains two undefined elements and the active player symbol.
  
      return set.filter(x => x === symbol).length === 1 && set.filter(x => x === undefined).length === 2 ? set.indexOf(undefined) : undefined
    }


    function _orderCoordinates(sets, coord) {
      // Returns boardspace coordinates based on the set type.
  
      let coords = undefined
  
      switch(sets) {
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

    if (turn > 2) {
      bestMove = _checkForPotentialWin(aPlayer) || _checkForPotentialWin(iPlayer)
    }
    if (!bestMove) {  
      switch (turn) {
        case 0:
          // turn 0 - take a corner
          bestMove = _getRandomElement(corners)
          turn0 = bestMove
          break;
        case 1:
          // turn 1 - take center, or take corner if center taken
          bestMove = (!boardState[1][1]) ? [1, 1] : _getRandomElement(corners);
          break;
        case 2:
          // turn 2 - take opposite corner. If unavailable, take adjacent corner.
          bestMove = (corners.length === 2) ? _getRandomElement(corners) : _getOppositeCorner(...turn0)
          break;
        case 3:
          // turn 3 - take a side space to force a defensive move.
          bestMove = _getRandomElement(_getAvailableSides())
          break;
        case 4:
          // take a corner 
          bestMove = _getRandomElement(corners)
          break;
        default:
          allSets:
          for (sets of [boardState, vSets, dSets]) {        
            for (i = 0; i < sets.length; i++) {
              // std var for 'true' check
              let set = sets[i]
              let coord = _confirmPotentialToIncrease(set, aPlayer)
              if (coord || coord === 0) {
                bestMove = _orderCoordinates(set, coord);
                break allSets;
              }
            } 
          }
        } 
      }
    return bestMove
}

  return {
    createBoard,
    updateBoard,
    resetBoard,
    checkForWin,
    assessBoard,
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
    
    if (!activeGame && xPlayerData.type.value === 'human') {
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
      [row, column] = gameBoard.assessBoard();
      const element = displayController.getBoardSpaceElement(row, column);
      updateBoard(row, column, element);
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
    getInactivePlayerSymbol,
    getTurn
  }
})();


game.setupGame()


// notes:
// check what can be factored out or pushed up in the hierarchy of the game object


// stopped at:
// todo: improve logic for increasing lead whenever possible (vs taking a simple "random location")
