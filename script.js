const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const downloadBtn = document.getElementById("downloadBtn");
const countdownEl = document.getElementById("countdown");
const frameSelect = document.getElementById("frameSelect");
const shutterSound = document.getElementById("shutterSound");

let currentFrame = new Image();

navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((err) => {
    alert("Kamera tidak dapat diakses.");
  });

frameSelect.addEventListener("change", () => {
  currentFrame.src = "frame/" + frameSelect.value;
});
currentFrame.src = "frame/" + frameSelect.value;

function countdown(sec, callback) {
  countdownEl.innerText = sec;
  if (sec > 0) {
    setTimeout(() => countdown(sec - 1, callback), 1000);
  } else {
    countdownEl.innerText = "";
    callback();
  }
}

function capturePhoto(index, total, photos, callback) {
  shutterSound.play();
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(currentFrame, 0, 0, canvas.width, canvas.height);
  photos.push(canvas.toDataURL("image/png"));
  if (index < total - 1) {
    setTimeout(() => countdown(3, () => capturePhoto(index + 1, total, photos, callback)), 500);
  } else {
    callback(photos);
  }
}

startBtn.addEventListener("click", () => {
  const photos = [];
  canvas.style.display = "block";
  downloadBtn.style.display = "none";
  countdown(3, () => {
    capturePhoto(0, 4, photos, (photos) => {
      mergePhotos(photos);
    });
  });
});

function mergePhotos(photos) {
  const merged = document.createElement("canvas");
  merged.width = 800;
  merged.height = 600;
  const mctx = merged.getContext("2d");

  const photoWidth = 400;
  const photoHeight = 300;

  photos.forEach((src, index) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const x = (index % 2) * photoWidth;
      const y = Math.floor(index / 2) * photoHeight;
      mctx.drawImage(img, x, y, photoWidth, photoHeight);
      if (index === photos.length - 1) {
        canvas.getContext("2d").drawImage(merged, 0, 0, 800, 600);
        downloadBtn.style.display = "inline-block";
      }
    };
  });
}

downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "photobooth.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});
