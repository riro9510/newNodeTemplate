const fs = require('fs');
const path = require('path');

const basePath = path.resolve(__dirname, '..');

const srcPath = path.join(basePath, 'src');

if (!fs.existsSync(srcPath)) {
  console.error('❌ Folder does not exist. please run ./init.sh');
  process.exit(1);
}

const rawInput = process.argv[2];
if (!rawInput) {
  console.error('❌ You must give at least one api name (ej: users o users,books,tasks)');
  process.exit(1);
}
const moduleNames = rawInput.split(',').map((name) => name.trim().toLowerCase());

const folders = ['routes', 'controllers', 'services'];

function createModuleFiles(moduleName) {
  folders.forEach((folder) => {
    const folderPath = path.join(srcPath, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log(`📂 Folder created: ${folderPath}`);
    }

    const singularFolder = folder.slice(0, -1);
    const fileName = `${moduleName}.${singularFolder}.js`;
    const filePath = path.join(folderPath, fileName);

    if (fs.existsSync(filePath)) {
      console.warn(`⚠️ File already exist: ${filePath}`);
      return;
    }

    let content = '';

    if (folder === 'routes') {
      content = `const express = require('express');
const router = express.Router();
const ${moduleName}Controller = require('../controllers/${moduleName}.controller');

// CREATE
router.post('/', ${moduleName}Controller.create);

// READ ALL
router.get('/', ${moduleName}Controller.getAll);

// READ ONE
router.get('/:id', ${moduleName}Controller.getById);

// UPDATE
router.put('/:id', ${moduleName}Controller.update);

// DELETE
router.delete('/:id', ${moduleName}Controller.remove);

module.exports = router;
`;
    }

    if (folder === 'controllers') {
      content = `const ${moduleName}Service = require('../services/${moduleName}.service');

exports.create = async (req, res, next) => {
  try {
    const result = await ${moduleName}Service.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const result = await ${moduleName}Service.getAll();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const result = await ${moduleName}Service.getById(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const result = await ${moduleName}Service.update(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const result = await ${moduleName}Service.remove(req.params.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
`;
    }

    if (folder === 'services') {
      content = `// Simulaciones de base de datos
const db = [];

exports.create = async (data) => {
  const newItem = { id: db.length + 1, ...data };
  db.push(newItem);
  return newItem;
};

exports.getAll = async () => {
  return db;
};

exports.getById = async (id) => {
  return db.find(item => item.id === parseInt(id));
};

exports.update = async (id, data) => {
  const index = db.findIndex(item => item.id === parseInt(id));
  if (index !== -1) {
    db[index] = { ...db[index], ...data };
    return db[index];
  }
  return null;
};

exports.remove = async (id) => {
  const index = db.findIndex(item => item.id === parseInt(id));
  if (index !== -1) {
    db.splice(index, 1);
    return true;
  }
  return false;
};
`;
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Creado ${filePath}`);
  });
}

moduleNames.forEach(createModuleFiles);
