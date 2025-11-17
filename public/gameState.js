import { PlayerHitSound, PlayLevelFailedSound, stopMusic } from './audio.js';
import { player } from './bomber.js';
import { showEnding } from './storyMode.js';
import { loadGameOver } from './videos.js';
import { difficulty } from './bomber.js';


export let score = 0;
export let lives = 3;




export function addScore(points = 0) {
    // points = difficultyMultiplier(points);
    if (difficulty === "easy") {
        points = points;
    } else if (difficulty === "medium") {
        points = points * 1.5;
    } else {
        // hard diff
        points = points * 2;
    }

    score += points;

}

export function difficultyMultiplier(points) {
    if (difficulty === "easy") {
        points = points;
    } else if (difficulty === "medium") {
        points = points * 1.5;
    } else {
        // hard diff
        points = points * 3;
    }
}

export function resetStats() {
    score = 0;
    lives = 3;
}

export function playerHit() {

    PlayerHitSound();
    if (!player.invulnerable) {
        lives--;
        document.getElementById("lives").textContent = `Lives: ${lives}`;
        if (lives <= 0) {
            stopMusic();
            PlayLevelFailedSound();
            loadGameOver();
            showEnding(false);
        }

        // Reset player position
        player.resetPosition();

        // Activate temporary invulnerability
        player.activateInvulnerability();
    }
}
