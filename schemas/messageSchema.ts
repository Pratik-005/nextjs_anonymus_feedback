import z, { boolean } from "zod";

export const messagesSchema = z.object({
    content: z.string().min(10, 'Content must be atleast 10 characters')
        .max(200, 'Content must be no longer than  200 characters')
})