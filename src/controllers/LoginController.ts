import { Request, Response } from 'express';
import User from "../models/User";
import usersView from '../views/users_view';
import mailConfig from '../config/mail';

import * as Yup from 'yup';
import { getRepository } from "typeorm";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';
import crypto from 'crypto';

export default {
    async login(request: Request, response: Response) {
        const {
            email,
            password,
        } = request.body;

        const schema = Yup.object().shape({
            email: Yup.string().required(),
            password: Yup.string().required(),
        });

        await schema.validate(request.body, {
            abortEarly: false,
        });

        const usersRepository = getRepository(User);

        const returnedUser: User = await usersRepository.createQueryBuilder('users')
            .where({ email: email })
            .getOne() as User;


        await bcrypt.compare(password, returnedUser.password, (err, result) => {
            if (err) {
                return response.status(500).json(err);
            }

            if (result == true) {
                console.log('Usuário logado com sucesso!');
                return response.status(200).json({ user: usersView.render(returnedUser), token: generateToken(returnedUser) });
            } else {
                console.log('Usuário/Senha incorretos');
                return response.status(400).json({ message: "Usuário e/ou senha incorretos" });
            }
        });
    },

    async forgotPassword(request: Request, response: Response) {
        const userRepository = getRepository(User);
        const email = request.body.email;

        const user = await userRepository.createQueryBuilder('users')
            .where({ email: email })
            .getOne() as User;

        if (!user)
            return response.status(400).send({ error: 'User not found' });

        const token = crypto.randomBytes(20).toString('hex');
        const now = new Date();
        now.setHours(now.getHours() + 1);

        user.passwordResetToken = token;
        user.passwordResetExpires = now;

        userRepository.save(user);

        const transport = nodemailer.createTransport(mailConfig());
        transport.use('compile', hbs({
            viewEngine: {
                defaultLayout: undefined,
                partialsDir: path.resolve('./src/resources/mail/')
            },
            viewPath: path.resolve('./src/resources/mail/'),
            extName: '.html',
        }));

        transport.sendMail({
            from: 'leo.rmiguel@gmail.com',
            to: email,
            subject: 'Reset password',
            template: 'auth/forgot_password',
            context: { token },
        }, (err) => {
            if (err) {
                console.log(err);
                return response.status(400).send({ error: err.message });
            }

            return response.status(200).send({ message: 'Email enviado' });
        });
    },

    async resetPassword(request: Request, response: Response) {
        const { email, token, password } = request.body;

        try {
            const userRepository = getRepository(User);
            const user = await userRepository.createQueryBuilder('users')
                .where({ email: email })
                .getOne() as User;
            if (!user) {
                return response.status(400).send({ error: 'User not found' });
            }

            if (token !== user.passwordResetToken) {
                return response.status(400).send({ error: 'Invalid token' });
            }

            const now = new Date();

            if (now > user.passwordResetExpires) {
                return response.status(400).send({ error: 'Token expired, generate a new one' });
            }

            const saltRounds = 10;
            await bcrypt.hash(password, saltRounds, (err, hash) => {
                if (err) {
                    return response.status(400).json(err);
                }
                user.password = hash;
                userRepository.save(user);
            });

            return response.status(200).send({ message: 'Password reset success' });
        } catch (err) {
            return response.status(500).send({ error: err.message });
        }
    }
}

function generateToken(returnedUser: User) {
    return jwt.sign(
        {
            id: returnedUser.id
        },
        'secret',
        {
            expiresIn: 86400
        },
    );
}
