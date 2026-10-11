document.addEventListener("DOMContentLoaded", async () => {
  // ==========================================
  // 1. KHỞI TẠO NỀN PHÒNG TỐI ASCII CANVAS
  // ==========================================
  const canvas = document.getElementById("ascii-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");

    // Chuỗi ký tự biểu diễn độ sáng (từ tối đến sáng)
    const CHARS = " .':;ilwW@#";

    // Cấu hình ô ký tự
    const fontSize = 12;
    let cols = 0;
    let rows = 0;

    let mouseYRatio = 0.5; // Góc nhìn mặc định ở giữa
    let targetYRatio = 0.5;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Math.floor(canvas.width / fontSize);
      rows = Math.floor(canvas.height / (fontSize * 1.2));
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Lắng nghe di chuyển chuột theo trục Y
    window.addEventListener("mousemove", (e) => {
      targetYRatio = e.clientY / window.innerHeight;
    });

    function renderASCII() {
      // Làm mịn chuyển động góc camera Y
      mouseYRatio += (targetYRatio - mouseYRatio) * 0.05;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;
      ctx.textBaseline = "top";

      // Điểm tụ của đường chân trời trong phòng
      const horizonY = rows * (0.2 + mouseYRatio * 0.6);
      const vanishingX = cols * 0.5;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Tính vị trí tương đối (-1 đến 1)
          const normX = (c / cols) * 2 - 1;

          // 1. Phân chia khung ngang làm 4 phần:
          // Part 1: [-1, -0.5] -> Tối (Lớp 1)
          // Part 2: [-0.5, 0]  -> Sáng (Lớp 2)
          // Part 3: [0, 0.5]   -> Sáng (Lớp 3)
          // Part 4: [0.5, 1]   -> Tối (Lớp 4)
          let regionFactor = 1.0;
          if (Math.abs(normX) < 0.5) {
            // Phần ở giữa (2/4 ở trung tâm): Ít ký tự hơn / Thưa / Sáng hơn
            regionFactor = 0.25;
          } else {
            // Phần ngoài rìa (2 bên): Dày ký tự / Tối
            regionFactor = 1.0;
          }

          // 2. Phối cảnh phòng 3D
          const dy = r - horizonY;
          const dx = c - vanishingX;
          const distFromCenter = Math.sqrt(dx * dx + dy * dy);

          // Tạo chiều sâu căn phòng bằng hàm sóng Sin
          let depthPattern = Math.sin(distFromCenter * 0.15 - mouseYRatio * 5);

          // Tổng hợp độ sáng intensity
          let intensity = (depthPattern + 1) * 0.5 * regionFactor;

          if (intensity > 0.08) {
            const charIdx = Math.floor(intensity * (CHARS.length - 1));
            const char = CHARS[Math.min(charIdx, CHARS.length - 1)];

            // Nét vẽ màu trắng mờ để phối hợp hoàn hảo với nền darkbrown.png
            ctx.fillStyle = `rgba(255, 255, 240, ${intensity * 0.45})`;
            ctx.fillText(char, c * fontSize, r * fontSize * 1.2);
          }
        }
      }

      requestAnimationFrame(renderASCII);
    }

    renderASCII();
  }

  // ==========================================
  // 2. LOGIC LOAD NOTES & QUOTES TỪ INDEX.JSON
  // ==========================================
  const noAuthorBg = 'img/neon.png';

  const authorBgList = [
    'img/lime.png',
    'img/orange.png',
    'img/beige.png',
    'img/grey.png',
    'img/TIM.png',
    'img/yellow.png',
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
        if (item.author) {
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