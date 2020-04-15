// Load all audio and set propperties
const themeSong = new Audio('audio/ThemeSong.mp3')
themeSong.volume = 0.18
themeSong.loop = true
const dropCard = new Audio('audio/Pop.mp3')
dropCard.volume = 0.25
const buttonHover = new Audio('audio/ButtonHover.mp3')
const buttonClick = new Audio('audio/ButtonClick.mp3')
buttonClick.volume = 0.15
const chimes = new Audio('audio/Chimes.mp3')
chimes.volume = 0.5

// Load characters from API
const loadCharacters = async () => {
    try {
        // Await results
        const result = await fetch('http://hp-api.herokuapp.com/api/characters')
        const hpCharacters = await result.json()
        // Call filter function
        housesFilter(hpCharacters)
    } catch(err) {
        console.error(err)
    }
}

// Filter only Griffindor and Slitherin characters
const housesFilter = (characters) => {
    const result = characters.filter(character => {
        if(character.house === 'Gryffindor' || character.house === 'Slytherin'){
            return character.house
        } 
    })
    // Call function -> display characters
    displayCharacters(result)
}

// Shuffle array function
const shuffle = (array) => {
    let currentIndex = array.length
    while (0 !== currentIndex) {
        let randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex -= 1
        let temporaryValue = array[currentIndex]
        array[currentIndex] = array[randomIndex]
        array[randomIndex] = temporaryValue
    }
    return array
}

// Display characters function
const displayCharacters = (characters) => {
    // Shuffle the characters
    shuffle(characters)
    // Construct card element for each character
    const characterCards = characters.map(character => {
        // Set prefixes for wand information
        character.wand.wood != '' ? wandWood = 'Wand wood:' : wandWood = ''
        character.wand.core != '' ? wandCore = 'Wand core:' : wandCore = ''
        // Return HTML template for each card
        return `
        <div class="card" draggable="true" data-id="${character.house}">
            <div class="photo">
                <img src="${character.image}" draggable="false"/>
            </div>
            <div class="info">
                <h2>${character.name}</h2>
                <hr>
                <p>${wandWood} ${character.wand.wood}</p>
                <p>${wandCore} ${character.wand.core}</p>
            </div>   
        </div>
        `
    }).join('')
    // Add cards to characterlist (DOM)
    const characterList = document.querySelector('#characterList')
    characterList.innerHTML = characterCards
}

// Start drag event for all cards
let pickedCharacter
document.addEventListener('dragstart', (e) => {pickedCharacter = e.target})

// Set drag events for all dropzones
const theHouses = document.querySelectorAll('.dropzone')
theHouses.forEach(house => {
    house.addEventListener('dragenter', (e) => e.preventDefault())
    house.addEventListener('dragover', (e) => e.preventDefault())
    house.addEventListener('dragleave', (e) => e.preventDefault())
    house.addEventListener('drop', (e) => {
        // On drop -> play drop card sound
        dropCard.play()
        // Append the dropped card to the dropzone
        house.append(pickedCharacter)
        // Call function -> check if all correct cards are in each dropzone
        checkIfHouseComplete()
    })
})

// Check if dropzones are complete function
const checkIfHouseComplete = () => {
    // Loop through dropzones to check if all correct cards are present
    const griffondorHouseCharacters = document.querySelectorAll('#Gryffindor > [data-id="Gryffindor"]')
    griffondorHouseCharacters.forEach(present => true)
    const slytherinHouseCharacters = document.querySelectorAll('#Slytherin > [data-id="Slytherin"]')
    slytherinHouseCharacters.forEach(present => true)
    // If all correct cards are present end the game
    if(griffondorHouseCharacters.length === 10 && slytherinHouseCharacters.length === 9){
        // Call function -> end game
        endGame()
    }
}

// Track time elapsed function
const timeHistory = []
let time
let timer
const trackTime = (command) => {
    if(command === 'start'){
        time = 0
        timer = window.setInterval(() => { time++ },1000)
    } else if (command === 'stop'){
        timeHistory.push(time)
        clearInterval(timer)
        let fastestTime = Math.min(...timeHistory)
        return fastestTime
    }
}

// Collect elements
const gameScreen = document.querySelector('#gameScreen')
const gamePlayButton = document.querySelector('#gamePlayButton')
const gameText = document.querySelector('.text')
const gameMusicButton = document.querySelector('.gameMusic')
const gameScreenButton = document.querySelector('.fullScreen')
const gryffindor = document.querySelector('#Gryffindor')
const slytherin = document.querySelector('#Slytherin')

// Start game function
const startGame = () => {
    // Set game start text
    gameText.innerHTML = 'All characters are lost!<br> Help them and place each character in the correct house.'
    // Set all button text to initial state
    gamePlayButton.innerHTML = 'Start Game'
    gameMusicButton.innerHTML = 'Music is On'
    gameScreenButton.innerHTML = 'Enter Fullscreen'
    // Start game button click
    gamePlayButton.addEventListener('click', () => {
        // Trasition out the gamescreen
        gameScreen.classList.add('transition-out')
        // Start background music
        themeSong.play()
        // Strat game timer function
        trackTime('start')
    })
}

// End game function 
const endGame = () => {
    // Play chime sound
    chimes.play()
    // Stop game timer function
    let displayTime = trackTime('stop')
    // Set game end text
    gameText.innerHTML = `Well done!<br> You have placed the correct charaters in there houses.<br> Your fastest time is ${displayTime} seconds. Wanna play again?`
    // Set new game button text
    gamePlayButton.innerHTML = 'Play Again'
    // Transition game end screen
    gameScreen.classList.remove('transition-out')
    gameScreen.classList.add('transition-in')
    // On game screen transition end
    gameScreen.ontransitionend = () => {
        // Empty Griffindor dropzone
        while(gryffindor.firstChild) {
            gryffindor.removeChild(gryffindor.firstChild);
        }
        // Empty Slytherin dropzone
        while(slytherin.firstChild) {
            slytherin.removeChild(slytherin.firstChild);
        }
        // Call funtion -> load characters from API
        loadCharacters()
    }
    // On play game button click
    gamePlayButton.addEventListener('click', () => {
        // Transition out gamescreen
        gameScreen.classList.remove('transition-in')
        gameScreen.classList.add('transition-out')
    })
}

// Set sound effects for all buttons
const allButtonsSoundFX = document.querySelectorAll('button')
allButtonsSoundFX.forEach(button => {
    button.addEventListener('mouseenter', () => {
        buttonHover.play()
    })
    button.addEventListener('click', () => {
        buttonClick.play()
    })
})

// Toggle music off/on
gameMusicButton.addEventListener('click', () => {
    // Get state from data attribute
    let state = gameMusicButton.dataset.state
    if(state == '1'){
        gameMusicButton.setAttribute('data-state','0')
        gameMusicButton.innerHTML = 'Music is Off'
        themeSong.volume = 0
    } else {
        gameMusicButton.setAttribute('data-state','1')
        gameMusicButton.innerHTML = 'Music is On'
        themeSong.volume = 0.18
    }
})

// Toggle fullscreen
gameScreenButton.addEventListener('click', () => {
    // Get state from data attribute
    let state = gameScreenButton.dataset.state
    if(state == '0'){
        gameScreenButton.setAttribute('data-state','1')
        gameScreenButton.innerHTML = 'Exit Fullscreen'
        // Call open fullscreen function
        openFullscreen()
    } else {
        gameScreenButton.setAttribute('data-state','0')
        gameScreenButton.innerHTML = 'Enter Fullscreen'
        // Call close fullscreen function
        closeFullscreen()
    }
})

// Open fullscreen funtion
const openFullscreen = () => {
    const elem = document.documentElement
    if (elem.requestFullscreen) {
      elem.requestFullscreen()
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen()
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen()
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen()
    }
}

// Close fullscreen function
const closeFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }

// Initial function calls on page load
loadCharacters()
startGame()