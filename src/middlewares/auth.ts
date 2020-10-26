import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import { promisify } from 'util';
import User from '../models/User';

export default {
    async checkAuthorization(request: Request, response: Response, next: Function) {
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            return response.status(401).send({ error: "No token provided" });
        }

        const [scheme, token] = authHeader.split(" ");

        try {
            const decoded = await promisify(jwt.verify)(token, "secret");

            request.userId = (decoded as any).id;

            const usersRepository = getRepository(User);
            const loggedInUser = await usersRepository.findOneOrFail(request.userId);
            if (!loggedInUser) {
                return response.status(401).send({ error: "Authentication failed" });
            }

            return next();
        } catch (err) {
            return response.status(401).send({ error: "Token is invalid" });
        }
    }
}