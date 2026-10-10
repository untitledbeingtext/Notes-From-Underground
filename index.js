
document.addEventListener("DOMContentLoaded", () => {
  const bgImages = [
    'img/lime.png',
    'img/neon.png',
    'img/yellow.png',
    'img/orange.png'
  ];

  const notes = document.querySelectorAll('.note');

  notes.forEach(note => {
    const randomIndex = Math.floor(Math.random() * bgImages.length);
    note.style.backgroundImage = `url("${bgImages[randomIndex]}")`;
  });
});