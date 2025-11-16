import { PlayerHitSound, PlayLevelFailedSound, stopMusic } from './audio.js';
import { player } from './bomber.js';
import { showEnding } from './storyMode.js';
import { loadGameOver } from './videos.js';
import { getElapsedMs } from './gameLoop.js';
import { handleGameOver } from './scoreboard.js';



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
        if (lives <= 0) {
            stopMusic();
            PlayLevelFailedSound();
            loadGameOver();
            showEnding(false);

            // if (!gameOverHandled) {
            //     gameOverHandled = true;
            //     const totalTimeMs = getElapsedMs();
            //     // didWin = false
            //     handleGameOver(score, totalTimeMs, false);
            // }
        }

        // Reset player position
        player.resetPosition();

        // Activate temporary invulnerability
        player.activateInvulnerability();
    }
}
