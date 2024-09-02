import {z} from "zod"

export const imageUpdateSchema = z.object({
    title: z.string().min(1, "Title is required"),
    alt: z.string().min(1, "Alt is required"),
    slug: z.string().min(1, "Slug is required")
})

export const AddRoleSchema = z.object({
    role_name: z.string().min(1, "Name is required"),
    role_permission: z.object({})
})