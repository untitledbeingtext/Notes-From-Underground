document.addEventListener("DOMContentLoaded", async () => {
  const noAuthorBg = 'img/chocomin.webp';
  const authorBgList = [
    'img/lime.webp',
    'img/orange.webp',
    'img/beige.webp',
    'img/TIM.webp',
    'img/yellow.webp',
    'img/neon.webp',
    'img/grey.webp',
  ];

  const authorBgMap = {};
  let authorColorIndex = 0;

  function getBgForNote(item) {
    if (item.noteColor && item.noteColor.trim() !== "") {
      return item.noteColor;
    }
    if (!item.author) {
      return noAuthorBg;
    }
    if (!authorBgMap[item.author]) {
      authorBgMap[item.author] = authorBgList[authorColorIndex % authorBgList.length];
      authorColorIndex++;
    }
    return authorBgMap[item.author];
  }

  // ascii
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

            ctx.fillStyle = `rgba(205, 239, 239, ${intensity * 0.45})`;
            ctx.fillText(char, c * fontSize, r * fontSize * 1.2);
          }
        }
      }

      requestAnimationFrame(renderASCII);
    }

    renderASCII();
  }

  const container = document.getElementById('notes-container');

  if (container) {
    try {
      const response = await fetch('index.json');
      const notesData = await response.json();

      notesData.forEach(item => {
        let indexHTML = '';
        if (item.index) {
          indexHTML = `<div style="position: absolute; bottom: 8px; left: 12px; font-size: 0.7rem; opacity: 0.4; font-family: 'Courier Prime', monospace; pointer-events: none; z-index: 3;">#${item.index}</div>`;
        }

        if (item.type === 'text') {
          const noteDiv = document.createElement('div');
          noteDiv.className = 'note';
          noteDiv.style.position = 'relative';

          if (item.date) {
            noteDiv.classList.add('real-time-note');
          } else {
            const bgImage = getBgForNote(item);
            noteDiv.style.backgroundImage = `url("${bgImage}")`;
          }

          let htmlContent = `<div>${item.content}</div>`;

          if (item.author && item.author !== 'math') {
            htmlContent += `<div style="text-align: right; margin-top: 10px; margin-bottom: 15px; font-weight: bold;">― ${item.author}</div>`;
          } else {
            htmlContent += `<div style="margin-bottom: 15px;"></div>`;
          }

          noteDiv.innerHTML = htmlContent + indexHTML;
          container.appendChild(noteDiv);

        } else if (item.type === 'image') {
          const imgDiv = document.createElement('div');
          imgDiv.className = 'imgs';
          imgDiv.style.position = 'relative';

          const bgImage = getBgForNote(item);
          imgDiv.style.backgroundImage = `url("${bgImage}")`;
          imgDiv.style.backgroundSize = 'cover';
          imgDiv.style.backgroundPosition = 'center';

          let imgHTML = `<img src="${item.content}" alt="illustration" style="display: block;">`;

          if (item.author) {
            imgHTML += `<div style="text-align: right; margin-top: 10px; margin-bottom: 15px; font-weight: bold; padding: 0 10px;">― ${item.author}</div>`;
          } else {
            imgHTML += `<div style="margin-bottom: 15px;"></div>`;
          }

          imgDiv.innerHTML = imgHTML + indexHTML;
          container.appendChild(imgDiv);

        } else if (item.type === 'img-text') {
          const mixDiv = document.createElement('div');
          mixDiv.className = 'note';
          mixDiv.style.position = 'relative';
          mixDiv.style.padding = "30px 20px";

          const bgImage = getBgForNote(item);
          mixDiv.style.backgroundImage = `url("${bgImage}")`;
          mixDiv.style.backgroundSize = 'cover';
          mixDiv.style.backgroundPosition = 'center';

          let mixHTML = `<div>${item.content}</div>`;

          if (item.author && item.author !== 'math') {
            mixHTML += `<div style="text-align: right; margin-top: 10px; font-weight: bold; margin-bottom: 10px;">― ${item.author}</div>`;
          }

          mixHTML += `
            <div style="margin-top: 0; margin-bottom: 15px; line-height: 0; overflow: hidden;">
              <img src="${item.img}" alt="illustration" style="width: 100%; height: auto; display: block; object-fit: contain; background: transparent;">
            </div>
          `;

          mixDiv.innerHTML = mixHTML + indexHTML;
          container.appendChild(mixDiv);
        }
      });

      if (window.innerWidth <= 768) {
        const observerOptions = {
          root: null,
          rootMargin: "-35% 0px -35% 0px",
          threshold: 0.2
        };

        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('active-zoom');
            } else {
              entry.target.classList.remove('active-zoom');
            }
          });
        }, observerOptions);

        const allNotes = container.querySelectorAll('.note, .imgs');
        allNotes.forEach(note => observer.observe(note));
      }

    } catch (error) {
      console.error("Ko tai đc:", error);
    }
  }
});