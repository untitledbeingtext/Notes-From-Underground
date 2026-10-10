document.addEventListener("DOMContentLoaded", async () => {
  const bgImages = [
    'img/lime.png',
    'img/neon.png',
    'img/orange.png'
  ];

  const container = document.getElementById('notes-container');

  try {
    const response = await fetch('index.json');
    const notesData = await response.json();

    notesData.forEach(item => {
      const randomBg = bgImages[Math.floor(Math.random() * bgImages.length)];

      if (item.type === 'text') {
        const noteDiv = document.createElement('div');
        noteDiv.className = 'note';
        noteDiv.style.backgroundImage = `url("${randomBg}")`;

        let htmlContent = item.content;
        if (item.author) {
          htmlContent += `<br>― <span style="font-weight: bold; text-align: right;">${item.author}</span>`;
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
    console.error("Không thể tải file dữ liệu index.json:", error);
  }
});