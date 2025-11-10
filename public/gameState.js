import { PlayerHitSound, PlayLevelFailedSound, stopMusic } from './audio.js';
import { player } from './bomber.js';
import { showEnding } from './storyMode.js';
import { loadGameOver } from './videos.js';



export let score = 0;
export let lives = 3

export function addScore(points) {
    score += points;
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
