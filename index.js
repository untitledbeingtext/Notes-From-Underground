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
    'img/mint.webp',
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
        if (item.type === 'text') {
          const noteDiv = document.createElement('div');
          noteDiv.className = 'note';

          if (item.date) {
            noteDiv.classList.add('real-time-note');
          } else {
            const bgImage = getBgForAuthor(item.author);
            noteDiv.style.backgroundImage = `url("${bgImage}")`;
          }

          let htmlContent = item.content;

          if (item.author && item.author !== 'math') {
            htmlContent += `<div style="text-align: right; margin-top: 10px; font-weight: bold;">― ${item.author}</div>`;
          }

          noteDiv.innerHTML = htmlContent;
          container.appendChild(noteDiv);

        } else if (item.type === 'image') {
          const imgDiv = document.createElement('div');
          imgDiv.className = 'imgs';

          const bgImage = getBgForAuthor(item.author);
          imgDiv.style.backgroundImage = `url("${bgImage}")`;
          imgDiv.style.backgroundSize = 'cover';
          imgDiv.style.backgroundPosition = 'center';

          let imgHTML = `<img src="${item.content}" alt="illustration">`;

          if (item.author) {
            imgHTML += `<div style="text-align: right; margin-top: 10px; font-weight: bold;">― ${item.author}</div>`;
          }

          imgDiv.innerHTML = imgHTML;
          container.appendChild(imgDiv);

        } else if (item.type === 'img-text') {
          const mixDiv = document.createElement('div');
          mixDiv.className = 'note';

          // Giảm padding phía trên để hạn chế khoảng trống đầu tờ note
          mixDiv.style.padding = "30px 20px";

          const bgImage = getBgForAuthor(item.author);
          mixDiv.style.backgroundImage = `url("${bgImage}")`;
          mixDiv.style.backgroundSize = 'cover';
          mixDiv.style.backgroundPosition = 'center';

          // Xếp theo thứ tự: Nội dung văn bản -> Tên tác giả -> Hình ảnh nằm ở dưới cùng
          let mixHTML = `<div>${item.content}</div>`;

          if (item.author && item.author !== 'math') {
            mixHTML += `<div style="text-align: right; margin-top: 10px; font-weight: bold; margin-bottom: 10px;">― ${item.author}</div>`;
          }

          mixHTML += `
            <div style="margin-top: 0; line-height: 0; overflow: hidden;">
              <img src="${item.img}" alt="illustration" style="width: 100%; height: auto; display: block; object-fit: contain; background: transparent;">
            </div>
          `;

          mixDiv.innerHTML = mixHTML;
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