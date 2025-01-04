import { z } from 'zod';

const createPropertyZodSchema = z.object({
  body: z.object({
    owner: z.string({ required_error: 'Owner is required' }),
    zakRoomId: z.string({ required_error: 'ZakRoomId is required' }),
  }),
});

export const PropertyValidation = {
  createPropertyZodSchema,
};
