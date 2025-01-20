import { z } from 'zod';

const createUserZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    email: z.string({ required_error: 'Email name is required' }),
    password: z.string({ required_error: 'Password is required' }),
    image: z.string().optional(),
  }),
});

const updateZodSchema = z.object({
  name: z.string().optional(),
  image: z.string().optional(),
  password: z.string().optional(),
  phone: z.string().optional(),
});

export const UserValidation = {
  createUserZodSchema,
  updateZodSchema,
};
