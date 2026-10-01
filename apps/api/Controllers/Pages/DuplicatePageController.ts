import type { Request, Response } from "express";
import { prisma } from "@omega/db";
import { revalidateWebPaths } from "../../Functions/RevalidateWeb.js";

// Copies an existing page's title/body/template into a new row — mainly
// so starting a translation (same content, different locale, admin
// rewrites it from there) doesn't mean retyping or re-building every
// block from scratch, but works for a same-locale duplicate too (new
// slug, same locale) since nothing here assumes the locale actually
// changes.
const DuplicatePage = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const slug = typeof req.body?.slug === "string" ? req.body.slug.trim() : "";
    const locale = typeof req.body?.locale === "string" && req.body.locale.trim() ? req.body.locale.trim() : "fr";
    if (!slug) {
        return res.status(400).json({ code: 400, message: "Un slug est requis pour la copie." });
    }
    try {
        const source = await prisma.page.findUnique({ where: { id } });
        if (!source) {
            return res.status(404).json({ code: 404, message: "Page source introuvable." });
        }
        const created = await prisma.page.create({
            data: {
                title: source.title,
                body: source.body,
                template: source.template,
                slug,
                locale,
            },
        });
        await revalidateWebPaths([{ slug, locale }]);
        res.status(200).json({ code: 200, data: created });
    } catch (error: any) {
        if (error?.code === "P2002") {
            return res.status(409).json({ code: 409, message: "Une page avec ce slug et cette langue existe déjà." });
        }
        console.error(error);
        res.status(500).json({ code: 500, message: "Internal Server Error " + error });
    }
};
export default DuplicatePage;
