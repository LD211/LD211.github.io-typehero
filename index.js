let spot;
let mtWords;
let monkeyWords = [];
let targetpos = null;
let cursorName = "outlineblock";
let spotNumber = 0;
let greenChar = "";
let entireSong;
let theAudio;
let songIndex = 0;
let liveWpmDisplayed = false;
let title = "fallingdown";
//document.body.style.backgroundImage = "url('./images/"+title+".webp')";
const textInput = document.getElementById("textInput");
let endTime;
let startTime;
let startFlag = 0;
let display = document.getElementById("typing");
const typedText = document.createElement("span");
display.appendChild(typedText);
let liveWpm = document.getElementById("livewpm");
//document.body.style.backgroundImage = "url('./images/alejandro.jpg')";
let backgroundDiv = document.getElementById("background");
backgroundDiv.style.backgroundImage = "url('./images/" + title + ".jpg')";
backgroundDiv.style.opacity = "0.9"; //major key alert

const songNames = [
  "bands",
  "givemeareason",
  "faint",
  "saveme",
  "darkage",
  "dreamsandnightmares",
  "alejandro",
  "drowning",
  "runitback",
  "fallingdown",
  "misery",
];
getSongLyrics();

window.onload = function () {
  document.getElementById("textInput").focus();
};

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    restartGame();
    if (title === "english200") {
      display.innerText = "";
      remakeEnglishWords();
    }
  } else if (event.key === "ArrowLeft") {
    songIndex--;
    if (songIndex < 0) {
      songIndex = songNames.length - 1;
    }
    title = songNames[songIndex];
    display.innerText = "";
    getSongLyrics();
    restartGame();
    updateCursor();
  } else if (event.key === "&") {
    title = "english200";
    display.innerText = "";
    getEnglishWords();
    spotNumber = 0;
  }
});

display.addEventListener("click", function () {
  textInput.focus();
});

function liveWordsPerMinute() {
  setInterval(function () {
    let endTimes = new Date();
    let secondslive = (endTimes.getTime() - startTime.getTime()) / 1000;

    liveWpm.innerText = Math.floor((spotNumber / 5) / secondslive * 60) +
      " wpm";
  }, 1000);
}

function ghostCaret() {
}

function restartGame() {
  if (theAudio) theAudio.pause();
  startFlag = 0;
  spotNumber = 0;
  updateCursor();
}

function getEnglishWords() {
  fetch("./lyrics/" + title + ".txt")
    .then((response) => {
      return response.text();
    })
    .then((text) => {
      entireSong = text;
      entireSong = entireSong.replace(/\r?\n|\r/g, "\n");
      mtWords = entireSong.split("\n");
      monkeyWords = mtWords;
      let randomIndex;
      for (let i = 0; i < mtWords.length; i++) {
        randomIndex = Math.floor(Math.random() * i);
        [mtWords[i], mtWords[randomIndex]] = [mtWords[randomIndex], mtWords[i]];
      }
      entireSong = mtWords.join(" ");
      interpretWords(entireSong);
    });
}

function remakeEnglishWords() {
  if (monkeyWords) {
    let randomIndex;
    for (let i = 0; i < monkeyWords.length; i++) {
      randomIndex = Math.floor(Math.random() * i);
      [monkeyWords[i], monkeyWords[randomIndex]] = [
        monkeyWords[randomIndex],
        monkeyWords[i],
      ];
    }
    entireSong = monkeyWords.join(" ");
    interpretWords(entireSong);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const cursor = document.getElementById("cursor");
  cursor.style.left = "10px";
  cursor.style.top = "35px";
  textInput.addEventListener("input", (event) => {
    if (liveWpmDisplayed === false) {
      liveWordsPerMinute();
      liveWpmDisplayed = true;
    }
    if (startFlag === 0) {
      startTime = new Date();
      if (title) {
        if (title !== "english200") {
          theAudio = new Audio("./sounds/" + title + ".mp3");
          visualizeTheAudio(theAudio);
        }
        //var currentTime = audio.currentTime; // Current playback time in seconds
        startFlag = 1;
      } else {
        display.innerText =
          "please select a song, 0: bands, 1:givemeareason, 2: save me";
      }
    }
    let inputValue = event.target.value;
    event.target.value = "";
    gameInput(inputValue);
  });
});

function visualizeTheAudio(theAudio) {
  var context = new AudioContext();
  var src = context.createMediaElementSource(theAudio);
  var analyser = context.createAnalyser();

  var canvas = document.getElementById("canvas");
  canvas.style.backgroundColor = "rgba(255,255,255,0)";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  var ctx = canvas.getContext("2d");
  //ctx.globalCompositeOperation = 'destination-out';
  src.connect(analyser);
  analyser.connect(context.destination);

  analyser.fftSize = 256;

  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Uint8Array(bufferLength);
  var WIDTH = canvas.width;
  var HEIGHT = canvas.height;

  var barWidth = (WIDTH / bufferLength) * 2.5;
  var barHeight;
  var x = 0;

  function renderFrame() {
    requestAnimationFrame(renderFrame);
    x = 0;

    analyser.getByteFrequencyData(dataArray);
    ctx.fillStyle = "#000";
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.globalCompositeOperation = "source-over";

    let opacityValues = 0;
    for (let j = 0; j < dataArray.length; j++) {
      opacityValues += dataArray[j];
    }
    let average = opacityValues / dataArray.length;
    let volume = average / 255;
    backgroundDiv.style.opacity = 1 - (volume / 2);
    backgroundDiv.style.backgroundSize = (100 + volume) + "%" + " " +
      (100 + volume) + "%";
    for (var i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i];

      var r = barHeight + (25 * (i / bufferLength));
      var g = 250 * (i / bufferLength);
      var b = 50;

      ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
      ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  }
  theAudio.play();
  renderFrame();
}

function updateCursor() {
  const charSpan =
    document.getElementById("typing").getElementsByTagName("span")[spotNumber];
  const cursor = document.getElementById("cursor");
  const rect = charSpan.getBoundingClientRect();
  targetpos = {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
  cursorType(rect, cursor);
  cursor.style.width = targetpos.width + "px";
  cursor.style.height = (targetpos.height) + "px";
  smoothCursor();
}

function cursorType(rect, cursor) {
  if (cursorName === "underline") {
    targetpos.width = rect.width;
    targetpos.height = 5;
    targetpos.top = rect.top + 35;
  } else if (cursorName === "block") {
    targetpos.width = rect.width;
    targetpos.height = rect.height;
  } else if (cursorName === "normal") {
    targetpos.width = 3;
  } else if (cursorName === "outlineblock") {
    cursor.style.border = "2px solid white";
    cursor.style.backgroundColor = "rgba(255, 255, 255, 0)";
    targetpos.width = rect.width - 4;
    targetpos.height = rect.height - 9;
    targetpos.left = rect.left;
    targetpos.top = rect.top + 3;
  }
}

function smoothCursor() {
  const cursor = document.getElementById("cursor");
  const leftpos = parseFloat(cursor.style.left);
  const toppos = parseFloat(cursor.style.top);
  if (
    Math.abs(leftpos - targetpos.left) < 1 &&
    Math.abs(toppos - targetpos.top) < 1
  ) {
    cursor.style.left = targetpos.left + "px";
    cursor.style.top = targetpos.top + "px";
    return;
  }
  const nextLeft = leftpos + (targetpos.left - leftpos) / 11;
  const nextTop = toppos + (targetpos.top - toppos) / 11;
  cursor.style.left = nextLeft + "px";
  cursor.style.top = nextTop + "px";
  requestAnimationFrame(smoothCursor);
}

function calculateWPM(startTime, endTime, length) {
  let seconds = (endTime.getTime() - startTime.getTime()) / 1000;
  return Math.floor((length / 5) / seconds * 60);
}

function interpretWords(song) {
  display.innerHTML = [...song].map((c) => `<span>${c}</span>`).join("");
  updateCursor();
}
function gameInput(song) {
  spot = entireSong[spotNumber];
  if (song === spot) {
    spotNumber++;
    updateCursor();
  }
  if (spot === "*") {
    spotNumber++;
    updateCursor();
  }
  if (spot == "\r" || spot == "\n") {
    spotNumber++;
    updateCursor();
  }
  if (spotNumber > entireSong.length - 1) {
    endTime = new Date();
    let wpm = calculateWPM(startTime, endTime, entireSong.length);
    display.innerHTML += "<br> congrats, you typed at a speed of " + wpm +
      " words per minute";
  }
}
function getSongLyrics() {
  fetch("./lyrics/" + title + ".txt")
    .then((response) => {
      return response.text();
    })
    .then((text) => {
      entireSong = text;
      entireSong = entireSong.replace(/\r?\n|\r/g, "\n");
      backgroundDiv.style.backgroundImage = "url('./images/" + title + ".jpg')";
      interpretWords(entireSong);
    });
}
