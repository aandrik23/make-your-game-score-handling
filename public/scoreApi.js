const BASE_URL = "/api/scores";

export async function submitScore({ name, score, timeMs }) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, score, time_ms: timeMs }),
  });

  if (!res.ok) {
    throw new Error(`Failed to submit score: ${res.status}`);
  }
  return res.json(); // { rank, percentile, total }
}

export async function fetchScores(page = 1, perPage = 5) {
  const url = `${BASE_URL}?page=${page}&per_page=${perPage}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch scores: ${res.status}`);
  }
  return res.json(); 
  // {
  //   page, per_page, total, total_pages,
  //   scores: [{ name, score, time_ms, created_at }, ...]
  // }
}
