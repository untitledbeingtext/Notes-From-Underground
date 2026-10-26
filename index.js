document.addEventListener("DOMContentLoaded", async () => {
  const noAuthorBg = 'img/chocomin.webp';
  const authorBgList = [
    'img/lime.webp',
    'img/orange.webp',
    'img/beige.webp',
    'img/TIM.webp',
    'img/neon.webp',
    'img/yellow.webp',
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
      const manifestResponse = await fetch('manifest.json');
      const fileList = await manifestResponse.json();
      const allDataPromises = fileList.map(async (filePath) => {
        const res = await fetch(filePath);
        return await res.json();
      });

      const nestedNotes = await Promise.all(allDataPromises);
      const notesData = nestedNotes.flat();

      notesData.forEach((item, idx) => {
        const autoIndex = String(idx + 1).padStart(5, '0');
        const indexHTML = `<div style="position: absolute; bottom: 8px; left: 12px; font-size: 0.7rem; opacity: 0.4; font-family: 'Courier Prime', monospace; pointer-events: none; z-index: 3;">#${autoIndex}</div>`;

        const noteDiv = document.createElement('div');
        noteDiv.className = 'note';
        noteDiv.style.position = 'relative';

        if (item.videoUrl && item.videoUrl.trim() !== "" && item.img && item.img.trim() !== "") {
          noteDiv.style.paddingTop = '0px';
        }

        if (item.date) {
          noteDiv.classList.add('real-time-note');
        } else {
          const bgImage = getBgForNote(item);
          noteDiv.style.backgroundImage = `url("${bgImage}")`;
          noteDiv.style.backgroundSize = '100% auto';
          noteDiv.style.backgroundPosition = 'top center';
          noteDiv.style.backgroundRepeat = 'repeat-y';
        }

        const fullContent = item.content || "";
        const paragraphs = fullContent.split(/\r?\n/).filter(p => p.trim() !== "");

        const isPoem = item.type === "poem";
        const isMusicVideo = item.videoUrl && item.videoUrl.trim() !== "";

        
        const isLongContent = !isPoem && !isMusicVideo && (paragraphs.length > 3 || fullContent.length > 200);

        let highlightText = fullContent;
        if (isLongContent) {
          const firstTwoParagraphs = paragraphs.slice(0, 3).join('\n\n');
          highlightText = `${firstTwoParagraphs}... <span class="read-more-hint"><br><br>(read more)</span>`;
          noteDiv.classList.add('collapsed-note');
        }

        let htmlContent = '';
        if (isMusicVideo && item.img && item.img.trim() !== "") {
          const songTitle = item.title ? item.title : (item.content ? item.content : "");
          const songAuthor = item.author && item.author !== 'math' ? item.author : "";
          const lyrics = item.title ? item.content : "";

          htmlContent += `
            <div class="noto-sans-music" style="display: grid; grid-template-columns: 50px 1fr; column-gap: 20px; align-items: center; height: 50px; ">
              <div style="display: flex; align-items: center; justify-content: center; width: 50px; height: 50px; overflow: hidden; position: relative; border-radius: 2px;">
                <a href="${item.videoUrl}" target="_blank" style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">
                  <img src="${item.img}" alt="Thumbnail" style="height: 150%; object-fit: cover; display: block;" onerror="this.onerror=null; this.src='https://img.youtube.com/vi/${item.videoUrl.split('/').pop().split('?')[0]}/hqdefault.jpg';">
                </a>
              </div>
              <div style="display: flex; flex-direction: column; justify-content: center; align-items: flex-start; height: 50px; padding: 0px 0px; box-sizing: border-box;">
                <div style="margin: 0; line-height: 1.75; font-weight: bold;font-size:15px;">${songTitle}</div>
                <div style="margin: 0; line-height: 1.75; opacity: 0.85;font-weight: normal;font-size:15px;">${songAuthor}</div>
              </div>
            </div>
          `;
          if (lyrics && lyrics.trim() !== "") {
            htmlContent += `<div class="music-lyrics">${lyrics}</div>`;
          }

        } else {
          htmlContent += `<div class="note-text-container">${isLongContent ? highlightText : fullContent}</div>`;

          if (item.author && item.author !== 'math') {
            htmlContent += `<div style="text-align: right; margin-top: 10px; margin-bottom: 15px; font-weight: bold;">― ${item.author}</div>`;
          } else {
            htmlContent += `<div style="margin-bottom: 15px;"></div>`;
          }

          
          if (item.img && item.img.trim() !== "") {
            htmlContent += `
              <div class="note-image-wrapper" style="margin-top: 0; margin-bottom: 15px; line-height: 0; overflow: hidden; border-radius: 1px;">
                <img src="${item.img}" alt="illustration" style="width: 100%; height: auto; display: block; object-fit: contain; background: transparent;">
              </div>
            `;
          }
        }

        noteDiv.innerHTML = htmlContent + indexHTML;

        if (isLongContent) {
          let isExpanded = false;
          noteDiv.style.cursor = 'pointer';

          noteDiv.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') return;

            isExpanded = !isExpanded;
            const textContainer = noteDiv.querySelector('.note-text-container');

            if (isExpanded) {
              textContainer.innerText = fullContent;
              noteDiv.classList.remove('collapsed-note');
              noteDiv.classList.add('expanded-note');
            } else {
              textContainer.innerHTML = highlightText;
              noteDiv.classList.remove('expanded-note');
              noteDiv.classList.add('collapsed-note');
            }
          });
        }

        container.appendChild(noteDiv);
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
      console.error("Ko tải đc:", error);
    }
  }
});