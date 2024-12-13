import {z} from "zod"

export const imageUpdateSchema = z.object({
    title: z.string().min(1, "Title is required"),
    alt: z.string().min(1, "Alt is required"),
    slug: z.string().min(1, "Slug is required")
})

export const AddRoleSchema = z.object({
    role_name: z.string().min(1, "Name is required"),
    role_permissions: z.object({})
})

export const pageSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required"),
    body: z.string().min(1, "Body is required")
})

export const userSchema = z.object({
    username: z.string().min(3, "Username is required").max(10, "Lenght is to mutch").nullable().optional(),
    email: z.string()
    .email("Must be a valid email")
    .or(z.literal(null)) 
    .optional(), 
    roleId : z.number(), 
    emailVerified: z.boolean().nullable().optional()
})