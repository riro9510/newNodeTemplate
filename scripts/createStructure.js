const fs = require('fs');
const path = require('path');

const folderStructure = [
  'src/config',
  'src/controllers',
  'src/middlewares',
  'src/models',
  'src/routes',
  'src/services',
  'src/utils',
  'src/validations',
  'tests/controllers',
  'tests/services',
  'tests/middlewares',
  'tests/utils',
  'public',
];


function createFolders(basePath, folders) {
  folders.forEach(folder => {
    const dirPath = path.resolve(basePath, '..', folder);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Carpeta creada: ${dirPath}`)
    }
  });
}

createFolders(__dirname, folderStructure);
