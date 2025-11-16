// storyMode.js

import { startStoryGame } from "./main.js";
import { Continue, Pause, SetGameRunning, showMainMenu } from "./menu.js";
import { loadGameOver, loadYouWin } from "./videos.js";
import { leaderboardUI } from './scoreboard.js';

// Intro, development, and ending story screens for Bomber Game


const game = document.getElementById("game");
const pauseMenu = document.getElementById("pauseMenu");

export function showIntro() {
  pauseMenu.style.display = "none";
  game.style.display = "none";
  const overlay = document.createElement("div");
  overlay.id = "storyOverlay";
  overlay.innerHTML = `
    <div class="story-panel">
      <h2>🔥 The Siege Begins</h2>
      <p>
        The high-tech megacorporation Zone 01 — leader in AI and cyber defense — has fallen under attack.
      </p>
      <p>
        A rogue collective known as The Null Sector has breached the central system, infecting servers, shutting down power, and corrupting security bots.
      </p>
      <p>
        You are Bomber, a cyber-engineer and the last remaining inside operative. Your mission:
        Reboot the core, secure the encryption key, and restore the main system before Zone 01 collapses.
      </p>
      <p>
        Time is running out — and the system is fighting back.
      </p>
      <button id="beginMissionBtn">Begin Mission</button>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById("beginMissionBtn").onclick = () => {
    overlay.remove();
    game.style.display = "grid";
    // continue to game start
    startStoryGame();
  };
}

// Optional: mid-story when a score milestone is hit
export function showMidStory() {

  SetGameRunning(false);
  Pause()

  game.style.display = "none";
  const overlay = document.createElement("div");
  overlay.id = "storyOverlay";
  overlay.innerHTML = `
    <div class="story-panel">
      <h2>⚙️ Powering Up</h2>
      <p>
        You’ve done it — the encryption key is secured. The core’s defenses flicker back online.
      </p>
      <p>
        But the Null Sector isn’t retreating.
      </p>
      <p>
        Zone 01’s survival now depends on your next move. Reach the Central Port before the system locks you out forever.
      </p>
      <button id="continueMissionBtn">Continue</button>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById("continueMissionBtn").onclick = () => {
    overlay.remove();
    // show the game but stay paused
    game.style.display = "grid";
    SetGameRunning(true);
    Continue();
    
  }
}

export function showEnding(victory = true) {
  SetGameRunning(false);
  Pause();
  game.style.display = "none";

  //play the video based on victory or defeat
  if (victory) {
    loadYouWin();
  } else {
    loadGameOver();
  }

  const checkVideoEnd = () => {
    const videos = document.querySelectorAll("video");
    if (videos.length > 0) {
      //  connect video with event listener
      const video = videos[videos.length - 1];
      video.addEventListener("ended", () => {
        const overlay = document.createElement("div");
        overlay.id = "storyOverlay";
        overlay.innerHTML = `
          <div class="story-panel">
            <h2>${victory ? "🏆 Mission Complete" : "💀 Mission Failed"}</h2>
            <p>
              ${victory
            ? "Zone 01 is restored — your code saved the company from collapse."
            : "Zone 01 falls — the system is lost to the Null Sector."}
            </p>
            <button id="Close">Close</button>
          </div>
        `;
        document.body.appendChild(overlay);
        
         document.getElementById("Close").onclick = () => {
           overlay.remove();
        //   showMainMenu();
          leaderboardUI(victory);
         };
         
      });
    } else {
      // check again after a short delay
      setTimeout(checkVideoEnd, 100);
    }
  };
  checkVideoEnd();
}
