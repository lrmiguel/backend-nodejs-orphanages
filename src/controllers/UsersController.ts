import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import User from '../models/User';
import * as Yup from 'yup';
import usersView from '../views/users_view';
import bcrypt from 'bcrypt';

export default {
    async create(request: Request, response: Response) {
        const {
            name,
            email,
            password,
        } = request.body;

        const usersRepository = getRepository(User);

        const user = usersRepository.create({
            name,
            email,
            password,
        });

        const schema = Yup.object().shape({
            name: Yup.string().required(),
            email: Yup.string().required(),
            password: Yup.string().required(),
        });

        await schema.validate(user, {
            abortEarly: false,
        });

        const saltRounds = 10;


        await bcrypt.hash(user.password, saltRounds, (err, hash) => {
            if (err) {
                return response.status(400).json(err);
            }
            user.password = hash;
            usersRepository.save(user);
        });

        return response.status(201).json(usersView.render(user));
    },

}