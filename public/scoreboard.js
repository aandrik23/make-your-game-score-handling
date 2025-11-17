// scoreboard.js
import { showMainMenu } from "./menu.js";
import { submitScore, fetchScores } from "./scoreApi.js";
import { getElapsedMs } from './gameLoop.js';
import { score as currentScore } from "./gameState.js";

let pendingGameResult = null; // { score, timeMs, didWin }
let currentPage = 1;
const PER_PAGE = 5;
let lastSubmitInfo = null; // { name, rank, percentile }

let currentScoresPage = [];   // scores of the current page
let currentSearchTerm = "";   // live search term
let lastPageInfo = { page: 1, totalPages: 1 };

function formatTimeMs(timeMs) {
  const totalSeconds = Math.floor(timeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return `${mm}:${ss}`;
}

function formatOrdinal(n) {
  const s = ["th", "st", "nd", "rd"],
    v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function initScoreboardUI() {
  const nameModal = document.getElementById("namePromptModal");
  const nameInput = document.getElementById("playerNameInput");
  const submitBtn = document.getElementById("submitScoreBtn");

  const scoreboardModal = document.getElementById("scoreboardModal");
  const closeBtn = document.getElementById("scoreCloseBtn");
  const prevBtn = document.getElementById("scorePrevBtn");
  const nextBtn = document.getElementById("scoreNextBtn");

  if (!nameModal || !scoreboardModal) {
    console.warn("Scoreboard modals not found in DOM.");
    return;
  }
  
  submitBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim() || "Anonymous";
    if (!pendingGameResult) return;

    const { score, timeMs } = pendingGameResult;

    nameModal.style.display = "none";

    try {
      const result = await submitScore({ name, score, timeMs });
      lastSubmitInfo = { name, rank: result.rank, percentile: result.percentile };
      currentPage = 1;
      await loadAndShowScoreboard();
    } catch (err) {
      console.error(err);
      alert("Could not submit score. Please try again.");
    }
  });

  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      submitBtn.click();
    }
  });

  closeBtn.addEventListener("click", () => {
    scoreboardModal.style.display = "none";
    showMainMenu()
  });

  prevBtn.addEventListener("click", async () => {
    if (currentPage > 1) {
      currentPage--;
      await loadAndShowScoreboard(false); // no message change
    }
  });

  nextBtn.addEventListener("click", async () => {
    currentPage++;
    const changed = await loadAndShowScoreboard(false);
    if (!changed) {
      currentPage--; // rollback if beyond last page
    }
  });

  // Helper: show name modal
  function showNameModal() {
    nameModal.style.display = "flex";
    nameInput.value = "";
    nameInput.focus();
  }
  
  const searchInput = document.getElementById("scoreSearchInput");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      currentSearchTerm = searchInput.value.trim().toLowerCase();
      // renderScoreRows(lastPageInfo);  // re-render current page with filter
      renderScoreRows(lastPageInfo);
    });
  }
  // Expose to other modules
  window.__showNameModalForScore = showNameModal;
}

export async function loadAndShowScoreboard(updateMessage = true) {
  const scoreboardModal = document.getElementById("scoreboardModal");
  const tbody = document.querySelector("#scoreboardTable tbody");
  const pageLabel = document.getElementById("scorePageLabel");
  const msgEl = document.getElementById("scoreboardMessage");
  const titleEl = document.getElementById("scoreboardTitle");

  try {
    const requestedPage = currentPage;
    const data = await fetchScores(currentPage, PER_PAGE);
    const { page, total_pages, scores } = data;

        // If we asked past the last page, signal "no change"
        if (total_pages > 0 && requestedPage > total_pages) {
          return false;
        }
    
        // Use the effective page (server might clamp later if you fix backend)
        const effectivePage = Math.min(page, total_pages || 1);
        currentPage = effectivePage;

    if (total_pages === 0) {
      // nothing yet
      tbody.innerHTML = "<tr><td colspan='4'>No scores yet.</td></tr>";
      pageLabel.textContent = "Page 0/0";
   } else {
      currentScoresPage = scores.map((s, idx) => ({
        ...s,
        _rank: (effectivePage - 1) * PER_PAGE + idx + 1,
      }));
    
      lastPageInfo = { page: effectivePage, totalPages: total_pages };
      renderScoreRows(lastPageInfo);
    }
    

    if (updateMessage && lastSubmitInfo && pendingGameResult) {
      const { name, rank, percentile } = lastSubmitInfo;
      const roundedPct = Math.round(percentile);
      const ord = formatOrdinal(rank);
      const prefix = pendingGameResult.didWin ? "Congrats" : "Good try";
      msgEl.textContent = `${prefix} ${name}, you are in the top ${roundedPct}%, on the ${ord} position.`;
    }

    titleEl.textContent = "Scoreboard";
    scoreboardModal.style.display = "flex";
    return true;
  } catch (err) {
    console.error(err);
    alert("Could not load scoreboard.");
    return false;
  }
}

function renderScoreRows(pageInfo) {
  const tbody = document.querySelector("#scoreboardTable tbody");
  const pageLabel = document.getElementById("scorePageLabel");
  if (!tbody || !pageLabel) return;

  const { page, totalPages } = pageInfo;

  const filtered = currentScoresPage.filter((s) =>
    !currentSearchTerm ||
    s.name.toLowerCase().includes(currentSearchTerm)
  );

  tbody.innerHTML = "";

  if (filtered.length === 0) {
    tbody.innerHTML = "<tr><td colspan='4'>No matching scores.</td></tr>";
  } else {
    filtered.forEach((s) => {
      const tr = document.createElement("tr");

      const tdRank = document.createElement("td");
      tdRank.textContent = formatOrdinal(s._rank);
      const tdName = document.createElement("td");
      tdName.textContent = s.name;
      const tdScore = document.createElement("td");
      tdScore.textContent = s.score;
      const tdTime = document.createElement("td");
      tdTime.textContent = formatTimeMs(s.time_ms);

      tr.appendChild(tdRank);
      tr.appendChild(tdName);
      tr.appendChild(tdScore);
      tr.appendChild(tdTime);

      if (
        lastSubmitInfo &&
        lastSubmitInfo.name === s.name &&
        s._rank === lastSubmitInfo.rank
      ) {
        tr.classList.add("scoreboard-highlight");
      }

      tbody.appendChild(tr);
    });
  }

  pageLabel.textContent = `Page ${page}/${totalPages}`;
}

// This is the function your game should call at the end of a run.
export function handleGameOver(finalScore, totalTimeMs, didWin) {
  const roundedTimeMs = Math.round(totalTimeMs);

  pendingGameResult = {
    score: finalScore,
    timeMs: roundedTimeMs,
    didWin
  };
  
  if (!didWin) {
    loadAndShowScoreboard();
    return;
  }

  if (window.__showNameModalForScore) {
    window.__showNameModalForScore();
  } else {
    console.warn("Scoreboard UI not initialized yet.");
  }
}

export function leaderboardUI(result) {
  if (result === false) {
      const totalTimeMs = getElapsedMs();
      // didWin = false
      handleGameOver(currentScore, totalTimeMs, false);
  } else {
    const totalTimeMs = getElapsedMs();
    handleGameOver(currentScore, totalTimeMs, true);
  }
}