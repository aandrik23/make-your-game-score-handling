import { buildMap,resetGame  } from "./bomber.js";
import { gameLoop, resetTimer,setPausedAt, resetFrameTimers  } from "./gameLoop.js";
import { startMusic, stopMusic } from "./audio.js";
import { showIntro } from "./storyMode.js";
import { runCountdown } from "./countdown.js";
import { loadAndShowScoreboard } from "./scoreboard.js";

export let gamePaused = true;
export let gameRunning = false;
export const animationState = { id: null };

const menu = document.getElementById("menu");
const mainMenu = document.getElementById("mainMenu");
const pauseMenu = document.getElementById("pauseMenu");


//MAIN MENU
const startBtn = document.getElementById("startBtn");
const infoBtn = document.getElementById("infoBtn");
const settingsBtn = document.getElementById("settingsBtn");
const ldrboardBtn = document.getElementById("leaderboard")
const quitBtn = document.getElementById("quitBtn");

//PAUSE MENU
const continueBtn = document.getElementById("continueBtn");
const restartBtn = document.getElementById("restartBtn");
const mainMenuBtn = document.getElementById("mainMenuBtn")
const settingsPauseBtn = document.getElementById("settingsPauseBtn");;
const infoPauseBtn = document.getElementById("infoPauseBtn");


//SETTINGS  
export const settingsMenu = document.getElementById("settingsMenu");
const backBtn = document.getElementById("backBtn");

//INFO
const infoMenu = document.getElementById("infoMenu");
const backInfoBtn = document.getElementById("backInfoBtn");

export function showMainMenu() {
    menu.style.display = "flex";
    mainMenu.style.display = "flex";
    pauseMenu.style.display = "none";
    gamePaused = true;
}

function showPauseMenu() {
    menu.style.display = "flex";
    mainMenu.style.display = "none";
    pauseMenu.style.display = "flex";
}
export function hideMenu() {
    menu.style.display = "none";
    gamePaused = false;
    if (!gameRunning) {
        gameRunning = true;
        resetTimer();
        buildMap();
        animationState.id = requestAnimationFrame(gameLoop);
    } else {
        animationState.id = requestAnimationFrame(gameLoop);
    }
}

function hideMenuUIOnly() {
    menu.style.display = "none"; // just hide the menu UI
}

// Main menu buttons
startBtn.onclick = () => {
    menu.style.display = "none";
    resetGame()
    showIntro();
};

ldrboardBtn.onclick = () => {
    menu.style.display = "none";
    loadAndShowScoreboard();
};

infoBtn.onclick = () => {
    SetGameRunning(false);
    infoMenu.style.display = "flex";
    backInfoBtn.focus();
};

infoPauseBtn.onclick = () => {
    SetGameRunning(false);
    infoMenu.style.display = "flex";
    backInfoBtn.focus();  // focus back button for accessibility.   ***
};

backInfoBtn.onclick = () => {
    SetGameRunning(true);
    infoMenu.style.display = "none";   // hide info menu    // show main menu again
};


settingsBtn.onclick = () => {
    settingsMenu.style.display = "flex";
    backBtn.focus();  // focus back button for accessibility.   ***
};
settingsPauseBtn.onclick = () => {
    settingsMenu.style.display = "flex";
    backBtn.focus();  // focus back button for accessibility.   ***
};

backBtn.onclick = () => {
    settingsMenu.style.display = "none";   // hide settings menu    // show main menu again
};

quitBtn.onclick = () => {
    window.close();
};

// Pause menu buttons
continueBtn.onclick = () => {
    Continue();
};
restartBtn.onclick = () => {
    showIntro();

};
mainMenuBtn.onclick = () => {
    resetGame();
    showMainMenu();
    gameRunning = false;
};


// pause logic:
window.addEventListener("keydown", (e) => {
    const activeEl = document.activeElement;
    const typingInField =
      activeEl &&
      (activeEl.tagName === "INPUT" ||
       activeEl.tagName === "TEXTAREA" ||
       activeEl.isContentEditable);

    if (typingInField) {
      return;
    }
    
    if (e.code === "Space") e.preventDefault();

    if (e.repeat) return; // ignore if key is held down.   ***
    if (settingsMenu.style.display === "flex") {
        settingsMenu.style.display = "none";
        return;
    }


    if (e.code === "Space" && gameRunning) {
        if (gamePaused) {

            Continue()

        } else {
            Pause()
            showPauseMenu()
        }
    }
});


// block dafault click on focused space button.   ***
window.addEventListener("keyup", (e) => {
    if (e.code === "Space") {
        e.preventDefault();
    }
});

export function Restart() {
    startMusic();
    cancelAnimationFrame(animationState.id);
    resetGame();
    buildMap();
    hideMenu();
}

export function Continue() {
    //hide menu UI
    hideMenuUIOnly();

    //keep the game frozen
    SetGameRunning(false);
    gamePaused = true;
    stopMusic();

    runCountdown(() => {
        gamePaused = false;
        SetGameRunning(true);
        resetFrameTimers();
        startMusic();
        hideMenu();
    })
}

export function Pause() {
    gamePaused = true;
    stopMusic();
    setPausedAt();
    cancelAnimationFrame(animationState.id);
}

function SetGameRunning(x) {
    gameRunning = x;
}

export { SetGameRunning };