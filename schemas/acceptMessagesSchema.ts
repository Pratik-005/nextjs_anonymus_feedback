import z, { boolean } from "zod";

export const acceptMessageSchema = z.object({
    acceptMessages: z.boolean()
});


