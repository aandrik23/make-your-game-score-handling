import { gamePaused, Restart, showMainMenu } from "./menu.js";
import { initAudioControls } from "./audio.js";

import { player } from './bomber.js';

import { IMAGE_PATHS } from "./config/paths.js";

import { initScoreboardUI } from "./scoreboard.js";


function applyCssImageVars() {
  const vars = {
    "--img-wall":        `url(${IMAGE_PATHS.wall})`,
    "--img-brick":       `url(${IMAGE_PATHS.brick})`,
    "--img-bomber":      `url(${IMAGE_PATHS.bomber})`,
    "--img-ghost-blue":  `url(${IMAGE_PATHS.ghostBlue})`,
    "--img-ghost-red":   `url(${IMAGE_PATHS.ghostRed})`,
    "--img-ghost-pink":  `url(${IMAGE_PATHS.ghostPink})`,
    "--img-ghost-orange":`url(${IMAGE_PATHS.ghostOrange})`,
    "--img-cherry":      `url(${IMAGE_PATHS.cherry})`,
    "--img-apple":       `url(${IMAGE_PATHS.apple})`,
    "--img-banana":      `url(${IMAGE_PATHS.banana})`,
    "--img-key":         `url(${IMAGE_PATHS.key})`,
    "--img-port":        `url(${IMAGE_PATHS.port})`,
    "--img-bomb":        `url(${IMAGE_PATHS.bomb})`,
    "--img-explosion":   `url(${IMAGE_PATHS.explosion})`,
    // Optional direction-specific vars if you want to use them:
    "--img-bomber-up":    `url(${IMAGE_PATHS.bomberUp})`,
    "--img-bomber-down":  `url(${IMAGE_PATHS.bomberDown})`,
    "--img-bomber-left":  `url(${IMAGE_PATHS.bomberLeft})`,
    "--img-bomber-right": `url(${IMAGE_PATHS.bomberRight})`
  };
  const root = document.documentElement;
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
}
applyCssImageVars();

window.addEventListener("keydown", (e) => {
    if (["b","B","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","w","a","s","d","W","A","S","D"].includes(e.key)) {
      e.preventDefault();
    }
    if (!player) return;
  
    if (gamePaused === false) {
      switch (e.key) {
        case "ArrowUp": case "w": case "W":
          player.nextDir = { dx: 0, dy: -1 };
          player.el.style.backgroundImage = `url(${IMAGE_PATHS.bomberUp})`;
          break;
        case "ArrowDown": case "s": case "S":
          player.nextDir = { dx: 0, dy: 1 };
          player.el.style.backgroundImage = `url(${IMAGE_PATHS.bomberDown})`;
          break;
        case "ArrowLeft": case "a": case "A":
          player.nextDir = { dx: -1, dy: 0 };
          player.el.style.backgroundImage = `url(${IMAGE_PATHS.bomberLeft})`;
          break;
        case "ArrowRight": case "d": case "D":
          player.nextDir = { dx: 1, dy: 0 };
          player.el.style.backgroundImage = `url(${IMAGE_PATHS.bomberRight})`;
          break;
        case "B": case "b":
          player.dropBomb();
          break;
      }
    }
  });


//Initialize audio controls
initAudioControls();

// Show main menu on load
showMainMenu();

// Initialize scoreboard UI
initScoreboardUI();

// Link story start to menu’s Start button
export function startStoryGame() {
    // Hide menus, then actually start the game
    const menu = document.getElementById("menu");
    if (menu) menu.style.display = "none";
    Restart()
};