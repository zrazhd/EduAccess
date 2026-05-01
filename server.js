
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.static('public')); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Buffer.from(file.originalname, 'latin1').toString('utf8'));
  }
});
const upload = multer({ storage });

let materials = [];

app.get('/api/materials', (req, res) => {
  res.json(materials);
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  const { title, subject, grade, teacher, type, date } = req.body;
  
  const newMaterial = {
    id: Date.now(),
    title, subject, grade, teacher, type, date,
    downloads: 0,
    fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
    fileName: req.file ? req.file.originalname : 'Нет файла'
  };
  
  materials.unshift(newMaterial);
  res.json({ success: true, material: newMaterial });
});

app.post('/api/download/:id', (req, res) => {
  const material = materials.find(m => m.id == req.params.id);
  if (material) material.downloads++;
  res.sendStatus(200);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен! Открой в браузере: http://localhost:${PORT}`);
});

