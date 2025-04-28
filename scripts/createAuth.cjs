const fs = require('fs');
const path = require('path');

// Obtener si será modo 'jwt' o 'session'
const authMode = process.argv[2]; // ejemplo: node create-auth.js jwt

if (!authMode || (authMode !== 'jwt' && authMode !== 'session')) {
  console.error('Error: Debes pasar "jwt" o "session" como parámetro');
  process.exit(1);
}

const baseSrcPath = path.resolve(__dirname, '../src');

const folders = [
  'controllers',
  'routes',
  'services',
  'middlewares',
  'strategies'
];

// Crear las carpetas si no existen
folders.forEach(folder => {
  const folderPath = path.join(baseSrcPath, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`📂 Carpeta creada: ${folderPath}`);
  }
});

// Contenidos base por archivo
const controllerContent = `
import * as authService from '../services/auth.service';
import { Request, Response } from 'express';

export const login = async (req: Request, res: Response) => {
  const token = await authService.login(req.body);
  res.status(200).json({ token });
};
`;

const routeContent = `
import { Router } from 'express';
import * as authController from '../controllers/auth.controller';

const router = Router();

router.post('/login', authController.login);

export default router;
`;

const serviceContentJWT = `
import jwt from 'jsonwebtoken';

export const login = async (data: { email: string, password: string }) => {
  // TODO: Validar usuario real contra BD
  const token = jwt.sign(
    { id: "user_id", email: data.email, role: 'user' },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
  return token;
};
`;

const serviceContentSession = `
export const login = async (data: { email: string, password: string }) => {
  // TODO: Validar usuario real contra BD
  // Session se maneja automáticamente por Passport
  return { message: 'Sesión iniciada' };
};
`;

const middlewareContent = `
import { Request, Response, NextFunction } from 'express';

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};
`;

const strategyContentJWT = `
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import passport from 'passport';

passport.use(new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET!,
  },
  (jwtPayload, done) => {
    return done(null, jwtPayload);
  }
));

export default passport;
`;

const strategyContentSession = `
import { Strategy as LocalStrategy } from 'passport-local';
import passport from 'passport';

passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    // TODO: validar usuario contra BD
    if (email === 'admin@example.com' && password === 'password') {
      return done(null, { id: 1, email: 'admin@example.com', role: 'admin' });
    } else {
      return done(null, false, { message: 'Invalid credentials' });
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, (user as any).id);
});

passport.deserializeUser((id, done) => {
  // TODO: Buscar usuario en la BD
  done(null, { id, email: 'admin@example.com', role: 'admin' });
});

export default passport;
`;

// Crear los archivos
const files = [
  { path: 'controllers/auth.controller.ts', content: controllerContent },
  { path: 'routes/auth.routes.ts', content: routeContent },
  { path: 'services/auth.service.ts', content: authMode === 'jwt' ? serviceContentJWT : serviceContentSession },
  { path: 'middlewares/auth.middleware.ts', content: middlewareContent },
  { path: 'strategies/passport.strategy.ts', content: authMode === 'jwt' ? strategyContentJWT : strategyContentSession },
];

files.forEach(file => {
  const fullPath = path.join(baseSrcPath, file.path);
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, file.content.trim());
    console.log(`✅ Creado: ${file.path}`);
  } else {
    console.warn(`⚠️ Ya existe: ${file.path}`);
  }
});
