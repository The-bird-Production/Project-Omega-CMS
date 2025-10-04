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
    body: z.string().min(1, "Body is required"),
})
export const articleSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required"),
    body: z.string().min(1, "Body is required"),
    authorId: z.string().min(1, "Author ID is required"),
})
export const articleDraftSchema = z.object({
    title: z.string().optional().nullable(),
    slug: z.string().optional().nullable(),
    body: z.string().nullable(),
    authorId: z.string().min(1, "Author ID is required"),
    draftId: z.string(),
})

export const userSchema = z.object({
    name: z.string().min(3, "Username is required").max(10, "Lenght is to mutch").nullable().optional(),
    email: z.string()
    .email("Must be a valid email")
    .or(z.literal(null)) 
    .optional(), 
    role : z.string(), 
    emailVerified: z.boolean().nullable().optional()
})

export const fileSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required"),
    alt: z.string().min(1, "Alt is required"),
   
})
export const redirectSchema = z.object({
    from: z.string().min(1, "From is required"),
    to: z.string().min(1, "To is required"),
})