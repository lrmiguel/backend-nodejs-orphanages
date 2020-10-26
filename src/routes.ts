import { Router } from 'express';
import multer from 'multer';
import OrphanagesController from './controllers/OrphanagesController';

import uploadConfig from './config/upload';
import UsersController from './controllers/UsersController';
import LoginController from './controllers/LoginController';

import auth from './middlewares/auth';

const routes = Router();
const upload = multer(uploadConfig);

routes.get('/orphanages', OrphanagesController.index);
routes.get('/orphanages/:id', OrphanagesController.show);
routes.post('/orphanages', upload.array('images'), OrphanagesController.create);

routes.post('/users', UsersController.create);

routes.post('/login', LoginController.login);

routes.post('/forgot_password', LoginController.forgotPassword);

routes.post('/reset_password', LoginController.resetPassword);

routes.use(auth.checkAuthorization);

export default routes;
