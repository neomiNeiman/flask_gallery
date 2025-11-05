const selected = new Set();
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const gallery = document.getElementById('gallery');

// הגדרת גלריה
let galleryImgs = Array.from(document.querySelectorAll('.image-container img'));

// פונקציה לסימון תמונה
function setupGalleryClick(div) {
  div.addEventListener('click', () => {
    const name = div.dataset.name;
    if (selected.has(name)) {
      selected.delete(name);
      div.classList.remove('selected');
    } else {
      selected.add(name);
      div.classList.add('selected');
    }
  });
}

// אתחול על התמונות הקיימות
document.querySelectorAll('.image-container').forEach(setupGalleryClick);

// העלאה אוטומטית של תמונות
function handleFiles(files) {
  if (files.length === 0) return;
  const formData = new FormData();
  for (let file of files) {
    formData.append('images', file);
  }

  fetch('/upload', { method: 'POST', body: formData })
    .then(res => res.text())
    .then(() => {
      for (let file of files) {
        const div = document.createElement('div');
        div.classList.add('image-container');
        div.dataset.name = file.name;
        const img = document.createElement('img');
        img.src = `/static/uploads/${file.name}`;
        img.alt = file.name;
        div.appendChild(img);
        setupGalleryClick(div);
        gallery.appendChild(div);
        galleryImgs.push(img);
      }
      fileInput.value = '';
    });
}

// לחיצה על אזור העלאה
uploadArea.addEventListener('click', () => fileInput.click());

// Drag & Drop
uploadArea.addEventListener('dragover', e => {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});
uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
uploadArea.addEventListener('drop', e => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  handleFiles(e.dataTransfer.files);
});

// אירוע change של input
fileInput.addEventListener('change', e => handleFiles(fileInput.files));

// הורדת רשימת הבחירות למחשב
document.getElementById('downloadBtn').addEventListener('click', () => {
  const data = Array.from(selected).join('\n');
  const blob = new Blob([data], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'selected_images.txt';
  a.click();
  URL.revokeObjectURL(url);
});

// Modal גדול
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImage');
const closeModal = document.getElementById('closeModal');
const prevImg = document.getElementById('prevImg');
const nextImg = document.getElementById('nextImg');
let currentIndex = 0;

// פתיחה של modal
function openModal(index) {
  currentIndex = index;
  modal.style.display = 'flex';
  modalImg.src = galleryImgs[currentIndex].src;
  updateBorder();
}

// עדכון המסגרת הירוקה במצב modal
function updateBorder() {
  const imgContainer = galleryImgs[currentIndex].parentElement;
  if (imgContainer.classList.contains('selected')) {
    modalImg.style.border = '4px solid #00c853';
    modalImg.style.boxShadow = '0 0 10px rgba(0,200,83,0.5)';
  } else {
    modalImg.style.border = 'none';
    modalImg.style.boxShadow = 'none';
  }
}

// פתיחה בלחיצה ימנית
galleryImgs.forEach((img, i) => {
  img.addEventListener('contextmenu', e => {
    e.preventDefault();
    openModal(i);
  });
});

// סגירה
closeModal.addEventListener('click', () => modal.style.display = 'none');
modal.addEventListener('click', e => {
  if (e.target === modal) modal.style.display = 'none';
});

// ניווט חיצים
prevImg.addEventListener('click', e => {
  e.stopPropagation();
  currentIndex = (currentIndex - 1 + galleryImgs.length) % galleryImgs.length;
  modalImg.src = galleryImgs[currentIndex].src;
  updateBorder();
});
nextImg.addEventListener('click', e => {
  e.stopPropagation();
  currentIndex = (currentIndex + 1) % galleryImgs.length;
  modalImg.src = galleryImgs[currentIndex].src;
  updateBorder();
});

// סימון תמונה בלחיצה על התמונה הגדולה
modalImg.addEventListener('click', () => {
  const imgContainer = galleryImgs[currentIndex].parentElement;
  const name = imgContainer.dataset.name;
  if (selected.has(name)) {
    selected.delete(name);
    imgContainer.classList.remove('selected');
  } else {
    selected.add(name);
    imgContainer.classList.add('selected');
  }
  updateBorder();
});