// config/paths.js
export const BASE_DIRS = {
  sounds: "./assets/sounds/",
  images: "./assets/images/",
  videos: "./assets/video/"
};

export const AUDIO_PATHS = {
  bgMusic: `${BASE_DIRS.sounds}background.mp3`,
  explosion: `${BASE_DIRS.sounds}explosion.flac`,
  playerHit: `${BASE_DIRS.sounds}player_hit.wav`,
  powerUp: `${BASE_DIRS.sounds}powerUp.mp3`,
  levelCleared: `${BASE_DIRS.sounds}level_completed.mp3`,
  levelFailed: `${BASE_DIRS.sounds}level_failed.mp3`
};

export const VIDEO_PATHS = {
  gameOver: `${BASE_DIRS.videos}GameOver.mp4`,
  youWin: `${BASE_DIRS.videos}BIM.mp4`
};

export const IMAGE_PATHS = {
  soundOn:     `${BASE_DIRS.images}sound.png`,
  soundOff:    `${BASE_DIRS.images}enable-sound.png`,
  wall:        `${BASE_DIRS.images}rock.png`,
  brick:       `${BASE_DIRS.images}bricks.png`,
  bomber:      `${BASE_DIRS.images}BombermanRight.png`,  // default
  bomberUp:    `${BASE_DIRS.images}BombermanUp.png`,
  bomberDown:  `${BASE_DIRS.images}BombermanDown.png`,
  bomberLeft:  `${BASE_DIRS.images}BombermanLeft.png`,
  bomberRight: `${BASE_DIRS.images}BombermanRight.png`,
  ghostBlue:   `${BASE_DIRS.images}blueGhost.png`,
  ghostRed:    `${BASE_DIRS.images}enemy1.png`,
  ghostPink:   `${BASE_DIRS.images}enemy2.png`,
  ghostOrange: `${BASE_DIRS.images}enemy3.png`,
  cherry:      `${BASE_DIRS.images}cherry.png`,
  apple:       `${BASE_DIRS.images}apple.png`,
  banana:      `${BASE_DIRS.images}banana.png`,
  key:         `${BASE_DIRS.images}key.png`,
  port:        `${BASE_DIRS.images}port.png`,
  bomb:        `${BASE_DIRS.images}bomb.png`,
  explosion:   `${BASE_DIRS.images}explosion.png`,
  countdown3: `${BASE_DIRS.images}3.png`,
  countdown2: `${BASE_DIRS.images}2.png`,
  countdown1: `${BASE_DIRS.images}1.png`,
  countdownGo:`${BASE_DIRS.images}go.png`,
};
