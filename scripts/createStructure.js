const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

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
const content = {
  'src/controllers/user.controller.ts':`import { Request,Response } from "express";
import { User } from "../models/users";

const mockUser: User = {
    id: '1',
    name: 'Ricardo Ramos',
    email: 'ricardo@example.com'
  };
  
  export const getUser = (req: Request, res: Response) => {
    res.json(mockUser);
  };`,
  'src/models/users.ts':`export interface User{
    id: string;
    name: string;
    email: string;
}`,
 'src/routes/user.routes.ts' :`import { Router } from 'express';
import { getUser } from '../controllers/user.controller';

const router = Router();

router.get('/user', getUser);

export default router;
`,
'src/index.ts': `import express from 'express';
import userRoutes from './routes/user.routes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', userRoutes);

app.listen(PORT, () => {
console.log(\`Server is running on port \${PORT}\`);
});
`
}
const scriptPath = path.resolve(__dirname, '../check-env.sh');
function createFolders(basePath, folders) {
  folders.forEach(folder => {
    const dirPath = path.resolve(basePath, '..', folder);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Carpeta creada: ${dirPath}`)
    }
  });
}

function createExampleComponents(content) {
  Object.entries(content).forEach(([filePath, fileContent]) => {
    const dirPath = path.dirname(filePath);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Carpeta creada: ${dirPath}`);
    }

    fs.writeFileSync(filePath, fileContent);
    console.log(`Archivo creado: ${filePath}`);
  });
}
createFolders(__dirname, folderStructure);
createExampleComponents(content);
const child = spawn('bash', [scriptPath], {
  stdio: 'inherit', 
  detached: true,  
});

child.unref();