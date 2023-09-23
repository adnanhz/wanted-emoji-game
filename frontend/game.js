let timeRemaining = 10
let gameState = 'running' // running or over
let wantedEmoji
let currentLevel = 0
let timerPenality = 5
let foundSound, wrongSound, bgSound
let emojiPoolStart = 0
let emojiPoolEnd = emojis.length

function renderTimer() {
    const timer = document.querySelector('#timer')
    timer.innerHTML = `${timeRemaining}s`
    setInterval(() => {
        timeRemaining--
        timer.innerHTML = `${timeRemaining}s`
        if (timeRemaining <= 0) {
            gameState = 'over'
        }
    }, 1000)
}

function renderWantedEmoji() {
    wantedEmoji = getRandomEmoji(emojiPoolStart, emojiPoolEnd)
    document.querySelector('#wanted-emoji').innerHTML = wantedEmoji
}

function reward() {
    timeRemaining = timeRemaining + timerPenality
}

function penalize() {
    wrongSound.pause()
    wrongSound.currentTime = 0
    wrongSound.play()
    timeRemaining = timeRemaining - timerPenality
}

function renderEmojis() {
    document.querySelector('#emojis').innerHTML = ''
    const emojis = [wantedEmoji]
    let maxEmojis = currentLevel + 2
    emojiPoolStart = 0
    emojiPoolEnd = emoji.length
    if(currentLevel > 55) {
        emojiPoolStart = randomInt(0, emoji.length)
        emojiPoolEnd = emojiPoolStart + randomInt(3, 6)
    }
    if (currentLevel > 50) {
        emojiPoolStart = 1000
        emojiPoolEnd = 1010
    }
    if (currentLevel > 40) {
        emojiPoolStart = 10
        emojiPoolEnd = 110
    }
    else if (currentLevel > 20) {
        emojiPoolStart = 0
        emojiPoolEnd = 500
    }
    if (emojiPoolEnd < emojiPoolStart + 1) {
        emojiPoolEnd = emojiPoolStart + 1
    }
    if (currentLevel > 40) {
        maxEmojis += 20
    }
    for (let i = 0; i < maxEmojis; i++) {
        let randomEmoji = getRandomEmoji(emojiPoolStart, emojiPoolEnd)
        if (randomEmoji === wantedEmoji) {
            continue
        }
        emojis.push(randomEmoji)
    }
    function renderEmoji(emoji) {
        let div = document.createElement('div')
        div.innerHTML = emoji
        div.dataset.wanted = emoji === wantedEmoji
        div.style.position = 'absolute'
        div.style.top = getRandomArbitrary(5, 85) + '%'
        div.style.left = getRandomArbitrary(5, 85) + '%'
        div.style.fontSize = `${getRandomInt(30, 55)}px`;

        if (currentLevel > 40) {
            // div.style.animation = `fade ${getRandomInt(3, 20)}s infinite`
        }
        else if (currentLevel > 35) {
            div.style.animation = `changeSize ${getRandomInt(3, 6)}s infinite`
            div.style.animationDirection = getRandomInt(1, 4) % 2 === 0 ? 'normal' : 'reverse'
        }
        else if (currentLevel > 30) {
            div.style.animation = `fade ${getRandomInt(3, 15)}s infinite`
        }
        else if (currentLevel > 20) {
            div.style.animation = `move ${getRandomInt(5, 15)}s infinite`
        }
        else if (currentLevel > 15) {
            div.style.rotate = getRandomInt(0, 180) + 'deg'
        }
        const emojisContainer = document.querySelector('#emojis')
        emojisContainer.appendChild(div)
    }
    for (let emoji of emojis) {
        renderEmoji(emoji)
    }
    const emojisContainer = document.querySelector('#emojis')
    emojisContainer.removeEventListener('click', onEmojisContainerClick)
    emojisContainer.addEventListener('click', onEmojisContainerClick)
}

function revealWanted() {
    const wantedDiv = document.querySelector('[data-wanted=true]')
    document.querySelector('#emojis').innerHTML = ''
    document.querySelector('#emojis').appendChild(wantedDiv)
}

function onEmojisContainerClick(e) {
    if (!bgSound) {
        foundSound = new Audio('found.mp3')
        wrongSound = new Audio('wrong.mp3')
        bgSound = new Audio('bg.mp3')

    }
    // bgSound.play()
    // bgSound.loop = true
    const wantedDiv = document.querySelector('[data-wanted=true]')
    let wantedDivRect = wantedDiv.getBoundingClientRect()
    if (e.clientX >= wantedDivRect.left && e.clientX <= wantedDivRect.right &&
        e.clientY >= wantedDivRect.top && e.clientY <= wantedDivRect.bottom) {
        revealWanted()
        foundSound.play()
        setTimeout(() => {
            reward()
            renderNextLevel()
        }, 300)
    } else if (e.target.dataset.wanted !== undefined) {
        penalize()
    }
}

function renderCurrentLevel() {
    document.querySelector('#level').innerHTML = currentLevel
}

function renderNextLevel() {
    currentLevel++;
    renderCurrentLevel()
    renderWantedEmoji()
    renderEmojis()
}

function pollGameState() {
    setInterval(() => {
        if (gameState === 'over') {
            wrongSound.play()
            revealWanted()
            let score = currentLevel
            setTimeout(() => {
                window.location.href = '/game-over.html?score=' + score
            }, 2000)
        }
    }, 200)
}

renderTimer()
renderNextLevel()
pollGameState()