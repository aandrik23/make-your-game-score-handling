import { AUDIO_PATHS, IMAGE_PATHS } from "./config/paths.js";

// Lazily create & cache <audio> elements so you only build what you use
const SOUNDS = new Map();
function getAudio(key) {
  if (!SOUNDS.has(key)) {
    const a = new Audio(AUDIO_PATHS[key]);
    a.preload = "auto";
    SOUNDS.set(key, a);
  }
  return SOUNDS.get(key);
}

// Shorthand getters (call these!)
const bgMusic            = () => getAudio("bgMusic");
const explosionSound     = () => getAudio("explosion");
const playerHitSound     = () => getAudio("playerHit");
const powerUpSound       = () => getAudio("powerUp");
const levelClearedSound  = () => getAudio("levelCleared");
const levelFailedSound   = () => getAudio("levelFailed");

let isMuted = false;
let globalVolume = 0.5; // default from slider in settings (50%)

function applyVolume() {
  const volume = isMuted ? 0 : globalVolume;
  [bgMusic(), explosionSound(), playerHitSound(), powerUpSound(), levelClearedSound(), levelFailedSound()]
    .forEach(a => { a.volume = volume; });
}

export function startMusic() {
  const a = bgMusic();
  a.loop = true;
  applyVolume();
  // play() returns a Promise; catch to avoid noisy unhandled rejections if autoplay blocks
  a.play().catch(() => {});
}

export function stopMusic() {
  const a = bgMusic();
  a.pause();
  a.currentTime = 0;
}

export function ExplosionSound(durationMs) {
  const a = explosionSound();
  applyVolume();
  a.currentTime = 0;
  a.play().catch(() => {});
  setTimeout(() => { a.pause(); a.currentTime = 0; }, durationMs);
}

export function PlayerHitSound() {
  const a = playerHitSound();
  applyVolume();
  a.currentTime = 0;
  a.play().catch(() => {});
}

export function PlayPowerUpSound() {
  const a = powerUpSound();
  applyVolume();
  a.currentTime = 0;
  a.play().catch(() => {});
}

export function PlayLevelClearedSound() {
  const a = levelClearedSound();
  applyVolume();
  a.currentTime = 0;
  a.play().catch(() => {});
}

export function PlayLevelFailedSound() {
  const a = levelFailedSound();
  applyVolume();
  a.currentTime = 0;
  a.play().catch(() => {});
}

// settings UI connections
export function initAudioControls() {
  const muteBtn = document.getElementById("muteBtn");
  const muteIcon = document.getElementById("muteIcon");
  const volumeSlider = document.getElementById("volumeSlider");

  muteBtn.addEventListener("click", () => {
    isMuted = !isMuted;
    applyVolume();
    muteBtn.classList.toggle("muted", isMuted);
    muteIcon.src = isMuted ? IMAGE_PATHS.soundOff : IMAGE_PATHS.soundOn;
  });

  volumeSlider.addEventListener("input", (e) => {
    globalVolume = e.target.value / 100;
    applyVolume();
  });
}
