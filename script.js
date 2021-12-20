const gameBoard = (() => {
  // Stores game state data.

    const boardState = [];
    
    function createBoard() {
      // Creates an empty boardstate.
      for (i = 0; i <= 2; i++) {
        let row = []  
        for (j = 0; j <= 2; j++) {
          let tile = undefined
          row.push(tile)  
        }
      boardState.push(row)
      }
  }

  function isFull() {
    // Returns 'true' if all items in the board state have a value (i.e. the gameboard is full).
    
    for (i = 0; i <= 2; i++) {
      let row = boardState[i]
      for (j = 0; j <= 2; j++) {
        let tile = row[i]
        if (tile === undefined) {
          return false
        }
      }
    }
    return true
  }

    return {
      createBoard,
      boardState,
      isFull
    };
  })();

const displayController = (() => {
  // Houses all functions related to creating and updating the UI.
  
  const boardDiv = document.getElementById('board-anchor')
  // const tiles = document.querySelectorAll('.board-tile')

  function createBoard() {
    // Creates a grid of DOM elements & assign values to each cell based values of gameBoard array.

    let rowIndex = 0
      gameBoard.boardState.forEach(row => {
          let rowDiv = document.createElement('div')
          rowDiv.classList.add('board-row')
          rowDiv.setAttribute('data-row-index', rowIndex++)
          
          let tileIndex = 0
          // ***I don't use tile as a var here. Can I refactor this to remove it?
          row.forEach(tile => {
              let tileDiv = document.createElement('div')
              tileDiv.classList.add('board-tile')
              tileDiv.setAttribute('data-tile-index', tileIndex++)
              tileDiv.innerHTML = ''
              rowDiv.appendChild(tileDiv)
          })
          boardDiv.appendChild(rowDiv)
      });
  } 


  function updateBoard() {
    // Updates board at the end of a turn.
    
    // ***why can't I refactor this to be in the scope of display controller?
    const tiles = document.querySelectorAll('.board-tile')

    tiles.forEach(tile => {
      const row =  Number(tile.parentElement.getAttribute('data-row-index'))
      const column = Number(tile.getAttribute('data-tile-index'))
      const currentValue = gameBoard.boardState[row][column]
      if (currentValue !== undefined) {
        tile.innerHTML = currentValue
      }
    })
  }


  function activateTiles() {
    // Makes board tiles clickable.
    
    const tiles = document.querySelectorAll('.board-tile')
    tiles.forEach(tile => tile.addEventListener('click', takeTurn))
  }


  function takeTurn() {
    // Responds to a click on a tile during an active game.
    
    const row =  Number(this.parentElement.getAttribute('data-row-index'))
    const column = Number(this.getAttribute('data-tile-index'))

    // confirms tile is empty before updating boardstate
    if (!this.innerHTML) {
      gameBoard.boardState[row][column] = 'j'
      displayController.updateBoard()
    }

    // checks win conditions
    if (gameBoard.isFull()) {
      console.log('it\'s a tie')
    } else {
      // udpate active player
      console.log('next players turn')
    }

  }


  function addPlayerSymbol() {
    // Fills emtpy tiles with a symbol.
    
    const row =  Number(this.parentElement.getAttribute('data-row-index'))
    const column = Number(this.getAttribute('data-tile-index'))

    if (!this.innerHTML) {
      gameBoard.boardState[row][column] = 'j'
    }
  }

  
  function confirmPlayers() {
    // Creates player objects based on user's input.
    
    xPlayerForm = document.getElementById('x-player-form')
    oPlayerForm = document.getElementById('o-player-form')

    xPlayerForm.addEventListener('submit', retrievePlayerData)
    // oPlayerForm.addEventListener('submit', retrievePlayerData)
    
    xPlayer = player(xPlayerForm.value, 'X')
    // oPlayer = player(PlayerDiv.value, 'O')

    return xPlayer

  }


  function retrievePlayerData(e) {
    // Scrub data from player input.
    
    const formData = new FormData(this)

    return formData.entries()

  }


  return {
    createBoard,
    activateTiles,
    addPlayerSymbol,
    updateBoard,
    confirmPlayers
    };
})();

const player = (name, symbol) => {
  // Creates a player for the gdame.

  // tba
    return {name, symbol};
  };

const game = (() => {
  // initializes and runs a game (this is 'main').

  // creates a new board datastructure & displays an empty board
  gameBoard.createBoard()
  displayController.createBoard()
 
  displayController.activateTiles()

  // console.log(tiles)

})();



// ***notes about UI setup***
// num of human players
// player names
// X or O?
// desired number of rounds (with a limit)