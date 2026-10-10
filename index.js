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
});