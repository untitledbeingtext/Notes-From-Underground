document.addEventListener("DOMContentLoaded", async () => {
  const canvas = document.getElementById("ascii-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const CHARS = " .':;ilwW@#";

    const fontSize = 12;
    let cols = 0;
    let rows = 0;

    let mouseYRatio = 0.5;
    let targetYRatio = 0.5;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Math.floor(canvas.width / fontSize);
      rows = Math.floor(canvas.height / (fontSize * 1.2));
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    window.addEventListener("mousemove", (e) => {
      targetYRatio = e.clientY / window.innerHeight;
    });

    function renderASCII() {
      mouseYRatio += (targetYRatio - mouseYRatio) * 0.05;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;
      ctx.textBaseline = "top";
      const horizonY = rows * (0.2 + mouseYRatio * 0.6);
      const vanishingX = cols * 0.5;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const normX = (c / cols) * 2 - 1;
          let regionFactor = 1.0;
          if (Math.abs(normX) < 0.5) {
            regionFactor = 0.25;
          } else {
            regionFactor = 1.0;
          }
          const dy = r - horizonY;
          const dx = c - vanishingX;
          const distFromCenter = Math.sqrt(dx * dx + dy * dy);
          let depthPattern = Math.sin(distFromCenter * 0.15 - mouseYRatio * 5);
          let intensity = (depthPattern + 1) * 0.5 * regionFactor;

          if (intensity > 0.08) {
            const charIdx = Math.floor(intensity * (CHARS.length - 1));
            const char = CHARS[Math.min(charIdx, CHARS.length - 1)];

            // fixed
            ctx.fillStyle = `rgba(205, 239, 239, ${intensity * 0.45})`;
            ctx.fillText(char, c * fontSize, r * fontSize * 1.2);
          }
        }
      }

      requestAnimationFrame(renderASCII);
    }

    renderASCII();
  }

  const noAuthorBg = 'img/chocomin.png';

  const authorBgList = [
    'img/lime.png',
    'img/orange.png',
    'img/beige.png',
    'img/TIM.png',
    'img/yellow.png',
    'img/neon.png',
    'img/grey.png',
    'img/mint.png',
  ];

  const authorBgMap = {};
  let authorColorIndex = 0;

  function getBgForAuthor(author) {
    if (!author) {
      return noAuthorBg;
    }

    if (!authorBgMap[author]) {
      authorBgMap[author] = authorBgList[authorColorIndex % authorBgList.length];
      authorColorIndex++;
    }

    return authorBgMap[author];
  }

  const container = document.getElementById('notes-container');

  try {
    const response = await fetch('index.json');
    const notesData = await response.json();

    notesData.forEach(item => {
      if (item.type === 'text') {
        const noteDiv = document.createElement('div');
        noteDiv.className = 'note';

        const bgImage = getBgForAuthor(item.author);
        noteDiv.style.backgroundImage = `url("${bgImage}")`;

        let htmlContent = item.content;

        if (item.author && item.author !== 'math') {
          htmlContent += `<div style="text-align: right; margin-top: 10px; font-weight: bold;">― ${item.author}</div>`;
        }

        noteDiv.innerHTML = htmlContent;
        container.appendChild(noteDiv);

      } else if (item.type === 'image') {
        const imgDiv = document.createElement('div');
        imgDiv.className = 'imgs';
        imgDiv.innerHTML = `<img src="${item.content}" alt="notes">`;
        container.appendChild(imgDiv);
      }
    });

  } catch (error) {
    console.error("Ko tai dc:", error);
  }
});