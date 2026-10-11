document.addEventListener("DOMContentLoaded", async () => {
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
  // --- 3D ASCII ROOM ENGINE ---
  (function initAsciiRoom() {
    const width = 100;
    const height = 45;
    const canvas = document.getElementById('ascii-canvas');
    if (!canvas) return;

    let rotX = 0.2;
    let rotY = 0.4;

    // Tọa độ 8 đỉnh của căn phòng (Khối hộp 3D)
    const vertices = [
      [-1.2, -0.8, -1.2], [1.2, -0.8, -1.2], [1.2, 0.8, -1.2], [-1.2, 0.8, -1.2],
      [-1.2, -0.8, 1.2], [1.2, -0.8, 1.2], [1.2, 0.8, 1.2], [-1.2, 0.8, 1.2]
    ];

    // Các cạnh nối phòng
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7]
    ];

    function rotate(point, rx, ry) {
      let [x, y, z] = point;
      let x1 = x * Math.cos(ry) + z * Math.sin(ry);
      let z1 = -x * Math.sin(ry) + z * Math.cos(ry);
      let y2 = y * Math.cos(rx) - z1 * Math.sin(rx);
      let z2 = y * Math.sin(rx) + z1 * Math.cos(rx);
      return [x1, y2, z2];
    }

    function project(point) {
      const distance = 3.2;
      const fov = 42;
      let [x, y, z] = point;
      let zDist = z + distance;
      let px = Math.floor(width / 2 + (x / zDist) * fov * 2);
      let py = Math.floor(height / 2 + (y / zDist) * fov);
      return [px, py];
    }

    function drawLine(p1, p2, buffer, char = '#') {
      let [x0, y0] = p1;
      let [x1, y1] = p2;
      let dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
      let sx = (x0 < x1) ? 1 : -1, sy = (y0 < y1) ? 1 : -1;
      let err = dx - dy;

      while (true) {
        if (x0 >= 0 && x0 < width && y0 >= 0 && y0 < height) {
          buffer[y0][x0] = char;
        }
        if (x0 === x1 && y0 === y1) break;
        let e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x0 += sx; }
        if (e2 < dx) { err += dx; y0 += sy; }
      }
    }

    function render() {
      let buffer = Array.from({ length: height }, () => Array(width).fill(' '));
      let projected = vertices.map(v => project(rotate(v, rotX, rotY)));

      // Dùng ký tự nét vẽ ASCII
      edges.forEach(([u, v]) => drawLine(projected[u], projected[v], buffer, '+'));

      canvas.textContent = buffer.map(row => row.join('')).join('\n');
    }

    // Tự động xoay căn phòng nhẹ nhàng theo con trỏ chuột
    window.addEventListener('mousemove', (e) => {
      rotY = (e.clientX / window.innerWidth - 0.5) * 1.5;
      rotX = (e.clientY / window.innerHeight - 0.5) * 1.5;
      render();
    });

    render();
  })();
});