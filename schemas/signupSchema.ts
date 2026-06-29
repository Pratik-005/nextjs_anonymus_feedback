import z, { email } from "zod";


export const usernameValidation = z
    .string()
    .min(2, 'Username must contain atleast 2 characters')
    .max(20, 'Username must contain atmost 20 characters');


export const signupSchema = z.object({
    username: usernameValidation,
    email: z.email('Invlaid email address')
})