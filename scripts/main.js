const gameboard = document.querySelector(".gameboard");
const dino = document.querySelector(".dino");
const obstaclesArea = document.querySelector(".obstacles");
const retryBtn = document.querySelector(".retry-button");
const pageTitle = document.querySelector("header");
const menu = document.querySelector(".retry-menu");
const scoreBox = document.querySelector(".live-score");
const bestScore = document.querySelector(".best-score");
const score = document.querySelector("#score");
const highestScore = document.querySelector("#highest-score");
let cactusModel = [
    "./images/Cactus_Small_Single.png",
    "./images/Cactus_Small_Double.png",
    "./images/Cactus_Small_Triple.png",
    "./images/Cactus_Big_Single.png",
    "./images/Cactus_Big_Double.png",
    "./images/Cactus_Big_Triple.png",
];
let lockedObstacles = true;
let gameOver = false;
let scorePoints = 0;
let speed = 6;

// INTERVALS
let createObstaclesTimeout;
let runningInterval;
let scoreInterval;
let moveGround1Request;
let moveGround2Request;

//MAKE DINO JUMP [START GAME]
document.addEventListener("keydown", jumpDino);
function jumpDino(e) {
    if (e.code === "Space" && !dino.classList.contains("jump")) {
        dino.classList.add("jump");
        setTimeout(() => {
            dino.classList.remove("jump");
        }, 800);
        jumpSound();
    }
    if (lockedObstacles) {
        lockedObstacles = false;
        setTimeout(() => {
            createObstacle();
            startCountingScore();
            scoreBox.style.visibility = "visible";
            if (localStorage.getItem("bestScore") != null) {
                highestScore.textContent = "HI " + localStorage.getItem("bestScore");
            }
        }, 1000);
        runningEffect();
        moveGround1Request = requestAnimationFrame(moveGround1);
        document.querySelector("#wellcome").style.display = "none";
    }
}

// CREATE OBSTACLES
function createObstacle() {
    let cactus = document.createElement("img");
    cactus.src =
        speed < 8
            ? cactusModel[Math.floor(Math.random() * 2)]
            : cactusModel[Math.floor(Math.random() * cactusModel.length)];
    cactus.classList.add("cactus");
    obstaclesArea.appendChild(cactus);
    let velocityX = gameboard.getBoundingClientRect().width + 100;

    //MOVE OBSTACLES
    function moveObstacle() {
        velocityX -= speed;
        cactus.style.left = velocityX + "px";
        if (velocityX > -100) {
            if (!gameOver) {
                checkCollision(dino, cactus, moveObstacle);
                //It also stops moving the next cactus
            }
        } else {
            obstaclesArea.removeChild(cactus);
        }
    }
    requestAnimationFrame(moveObstacle);

    //Recall createObstacle() randomly
    let randomTimeout = Math.random() * 1900 + 900;
    createObstaclesTimeout = setTimeout(() => {
        createObstacle();
    }, randomTimeout);
}

//CHECK COLLISION
function checkCollision(dino, cactus, moveObstacle) {
    let dinoRect = dino.getBoundingClientRect();
    let cactusRect = cactus.getBoundingClientRect();
    if (
        cactusRect.x < dinoRect.right - 10 &&
        cactusRect.y < dinoRect.bottom - 5 &&
        cactusRect.right > dinoRect.x + 5
    ) {
        gameOver = true;
        clearTimeout(createObstaclesTimeout);

        clearInterval(runningInterval);
        clearInterval(scoreInterval);

        menu.classList.add("show-game-over-menu");

        updateUserBestScore();
        crashSound();
    } else {
        requestAnimationFrame(moveObstacle);
    }
}

//RUNNING DINO EFFECT
function runningEffect() {
    runningInterval = setInterval(() => {
        dino.src = "./images/Dino_Run01.png";
        setTimeout(() => {
            dino.src = "./images/Dino_Run02.png";
            if (gameOver) {
                dino.src = "./images/dino-dead.png";
            }
        }, 250);
    }, 500);
}

// SCORE COUNTING
function startCountingScore(scoreValueCheck = 100) {
    scoreInterval = setInterval(() => {
        ++scorePoints;
        score.textContent = scorePoints;
        if (scorePoints == scoreValueCheck) {
            scoreValueCheck += 100;
            speed += 0.75;
            scoreSound();
        }
    }, 100);
}

// MOVE THE GROUND
const terrainArea = document.querySelector(".terrain-area");
const ground1 = document.querySelector(".ground1");
const ground2 = document.querySelector(".ground2");
let gameboardRect = gameboard.getBoundingClientRect();
let runG1 = true;
let runG2 = true;
let ground1X = 0;

function moveGround1() {
    let ground1Rect = ground1.getBoundingClientRect();
    ground1X -= speed;
    ground1.style.left = ground1X + "px";
    if (ground1Rect.x + ground1Rect.width < gameboardRect.right + 20) {
        if (runG2 === true) {
            requestAnimationFrame(moveGround2);
            runG2 = false;
        }
    }
    if (ground1Rect.right > gameboardRect.x && !gameOver) {
        requestAnimationFrame(moveGround1);
    } else {
        runG2 = true;
        ground1X = gameboardRect.width;
        if (!gameOver) {
            ground1.style.left = ground1X + "px";
        }
    }
}

let ground2X = gameboardRect.width;

function moveGround2() {
    let ground2Rect = ground2.getBoundingClientRect();
    ground2X -= speed;
    ground2.style.left = ground2X + "px";
    if (ground2Rect.x + ground2Rect.width < gameboardRect.right + 20) {
        if (runG1 === true) {
            requestAnimationFrame(moveGround1);
            runG1 = false;
        }
    }
    if (ground2Rect.right > gameboardRect.x && !gameOver) {
        requestAnimationFrame(moveGround2);
    } else {
        runG1 = true;
        ground2X = gameboardRect.width;
        if (!gameOver) {
            ground2.style.left = ground2X + "px";
        }
    }
}

// UPDATE USER BEST SCORE
function updateUserBestScore() {
    if (
        scorePoints > parseInt(localStorage.getItem("bestScore")) ||
        localStorage.length == 0
    ) {
        localStorage.setItem("bestScore", scorePoints);
        bestScore.textContent = "Best Score: " + localStorage.getItem("bestScore");
    } else {
        bestScore.textContent = "Best Score: " + localStorage.getItem("bestScore");
    }
}

//RESET SCORE BUTTON MENU
document.querySelector(".reset-best-score-button").onclick = () => {
    localStorage.clear();
    bestScore.textContent = "Best Score: 0";
    highestScore.textContent = "HI 0";
};

//RESTART GAME
retryBtn.onclick = () => {
    pageTitle.classList.remove("slideTitle");
    setTimeout(() => {
        location.reload();
    }, 1200);
};

// MOVE CLOUDS []
// function moveClouds() {}

//AUDIO SETTINGS
function jumpSound() {
    let sound = new Audio("./audio/jump.mp3");
    sound.volume = 1;
    sound.onload = sound.play();
}

function crashSound() {
    let sound = new Audio("./audio/collision.mp3");
    sound.volume = 1;
    sound.onload = sound.play();
}

function scoreSound() {
    let sound = new Audio("./audio/points.mp3");
    sound.volume = 1;
    sound.onload = sound.play();
}

window.onload = () => {
    pageTitle.classList.add("slideTitle");
};
