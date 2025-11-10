import { score } from './gamestate.js';
import { disableGameInput } from './main.js';

export function endGame(won) {
    disableGameInput();

    const timeString = document.getElementById('timer').textContent.replace('Time: ', '');
    showPlayerNameInput(won, score, timeString);
}

function showPlayerNameInput(won, finalScore, timeString) {
    const overlay = document.getElementById('gameEndOverlay');
    const modal = document.getElementById('scoreModal');
    const title = document.getElementById('scoreTitle');
    const info = document.getElementById('scoreInfo');
    const label = document.getElementById('scoreLabel');
    const input = document.getElementById('playerNameInput');
    const submit = document.getElementById('submitScoreBtn');
    const skip = document.getElementById('skipScoreBtn');

    overlay.classList.remove('hidden');
    modal.classList.remove('hidden');

    title.textContent = won ? 'Congratulations! You Won!' : 'Game Over!';
    title.className = won ? 'win' : 'lose';
    info.innerHTML = `<strong>Final Score:</strong> ${finalScore}<br><strong>Time:</strong> ${timeString}`;
    label.textContent = 'Enter your name for the scoreboard:';

    submit.onclick = async () => {
        const name = input.value.trim();
        if (name) {
            await submitScore(name, finalScore, timeString);
        } else {
            alert('Please enter your name!');
        }
    };

    skip.onclick = () => showScoreboard();
}

async function submitScore(name, score, time) {
    try {
        const response = await fetch('api/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, score, time })
        });
        const result = await response.json();
        showScoreboard(result);
    } catch {
        alert('Failed to submit score.');
        showScoreboard();
    }
}

export async function showScoreboard(submissionResult = null) {
    const overlay = document.getElementById('gameEndOverlay');
    const modal = document.getElementById('scoreModal');
    const scoreboard = document.getElementById('scoreboardModal');
    const tbody = scoreboard.querySelector('tbody');
    const closeBtn = document.getElementById('closeScoreboardBtn');

    // Ensure overlay is visible and other modals hidden
    overlay.classList.remove('hidden');
    modal.classList.add('hidden');
    scoreboard.classList.remove('hidden');

    tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

    try {
        const response = await fetch('api/scores');
        const data = await response.json();

        if (!data.scores || data.scores.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4">No scores yet!</td></tr>`;
        } else {
            tbody.innerHTML = '';
            data.scores.forEach(s => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${getRankSuffix(s.rank)}</td>
                    <td>${s.name}</td>
                    <td>${s.score}</td>
                    <td>${s.time}</td>`;
                tbody.appendChild(row);
            });
        }
    } catch (err) {
        console.error('Error loading scores:', err);
        tbody.innerHTML = `<tr><td colspan="4">Error loading scores.</td></tr>`;
    }

    closeBtn.onclick = () => {
        overlay.classList.add('hidden');
        scoreboard.classList.add('hidden');
        window.location.reload();
    };
}

function getRankSuffix(rank) {
    switch (rank % 10) {
        case 1: return rank % 100 === 11 ? `${rank}th` : `${rank}st`;
        case 2: return rank % 100 === 12 ? `${rank}th` : `${rank}nd`;
        case 3: return rank % 100 === 13 ? `${rank}th` : `${rank}rd`;
        default: return `${rank}th`;
    }
}