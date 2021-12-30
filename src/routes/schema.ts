import { Joi } from "celebrate";

export const tokenIssueSchema = {
    body: Joi.object({
        refreshToken: Joi.string(),
        attributes: Joi.object()
    })
};

export const introspectSchema = {
    body: Joi.object({
        token: Joi.string().required(),
    }).required(),
};

export const signupSchema = {
    body: Joi.object({
        user: Joi.object({
            email: Joi.string().email().required(),
            name: Joi.string().required(),
            password: Joi.string().required(),
        }).required()
    }).required(),
};

export const loginSchema = {
    body: Joi.object({
        login: Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required(),
        }).required()
    }).required(),
};