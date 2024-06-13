import {z} from "zod"

export const imageUpdateSchema = z.object({
    title: z.string().nonempty("Title is required"),
    alt: z.string().nonempty("Alt is required"),
    slug: z.string().nonempty("Slug is required")
})