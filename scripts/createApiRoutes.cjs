const fs = require('fs');
const path = require('path');

const basePath = path.resolve(__dirname, '..');

const srcPath = path.join(basePath, 'src');

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

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

const folders = ['routes', 'controllers', 'services', 'models', 'tests'];

const dbType = process.argv.includes('--db=pg') ? 'pg' : 'mongo';
function createModuleFiles(moduleName) {
  folders.forEach((folder) => {
    const folderPath = path.join(srcPath, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log(`📂 Folder created: ${folderPath}`);
    }

    const singularFolder = folder.slice(0, -1);
    const fileName = `${moduleName}.${singularFolder}.ts`;
    const filePath = path.join(folderPath, fileName);

    if (fs.existsSync(filePath)) {
      console.warn(`⚠️ File already exist: ${filePath}`);
      return;
    }

    let content = '';

    if (folder === 'routes') {
      content = `
        import express from 'express';
        import ${moduleName}Controller from '../controllers/${moduleName}.controller.js';
        import { isAuthenticated } from '@/middlewares/auth.middleware.ts';
        import { errorHandler } from '../middlewares/error.middleware.ts';
        const router = express.Router();

        // CREATE
        router.post('/', isAuthenticated(), ${moduleName}Controller.create);

        // READ ALL
        router.get('/', isAuthenticated(), ${moduleName}Controller.getAll);

        // READ ONE
        router.get('/:id', isAuthenticated(), ${moduleName}Controller.getById);

        // UPDATE
        router.put('/:id', isAuthenticated(), ${moduleName}Controller.update);

        // DELETE
        router.delete('/:id', isAuthenticated(), ${moduleName}Controller.remove);

        router.use(errorHandler)

        export default router;
        `;
    }

    if (folder === 'controllers') {
      content = `import ${moduleName}Service from '../services/${moduleName}.service';
import { Request, Response, NextFunction } from 'express';

const create = async (req:Request, res:Response, next:NextFunction) => {
  try {
    const result = await ${moduleName}Service.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const getAll = async (req:Request, res:Response, next:NextFunction) => {
  try {
    const result = await ${moduleName}Service.getAll();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getById = async (req:Request, res:Response, next:NextFunction) => {
  try {
    const result = await ${moduleName}Service.getById(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const update = async (req:Request, res:Response, next:NextFunction) => {
  try {
    const result = await ${moduleName}Service.update(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const remove = async (req:Request, res:Response, next:NextFunction) => {
  try {
    await ${moduleName}Service.remove(req.params.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export default {
  create,
  getAll,
  getById,
  update,
  remove,
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
    
      if (folder === 'models') {
        content = dbType === 'pg'
          ? `import { DataTypes } from 'sequelize';
    import sequelize from '@/db/sequelize';
    
    const ${capitalize(moduleName)} = sequelize.define('${capitalize(moduleName)}', {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: DataTypes.TEXT
    }, {
      timestamps: true
    });
    
    export default ${capitalize(moduleName)};`
          : `import mongoose from 'mongoose';
    
    const ${moduleName}Schema = new mongoose.Schema({
      name: { type: String, required: true },
      description: String,
      createdAt: { type: Date, default: Date.now }
    });
    
    const ${capitalize(moduleName)} = mongoose.model('${capitalize(moduleName)}', ${moduleName}Schema);
    
    export default ${capitalize(moduleName)};`;
      }
    
      if (folder === 'tests') {
        content = `import request from 'supertest';
    import app from '@/app';
    
    describe('${capitalize(moduleName)} API', () => {
      it('should return 200 on GET /api/${moduleName}', async () => {
        const res = await request(app).get('/api/${moduleName}');
        expect(res.statusCode).toBe(200);
      });
    
      it('should create item on POST /api/${moduleName}', async () => {
        const payload = { name: 'Sample ${moduleName}' };
        const res = await request(app).post('/api/${moduleName}').send(payload);
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id');
      });
    });
    `;
      }
    

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Creado ${filePath}`);
  });
}

moduleNames.forEach(createModuleFiles);
