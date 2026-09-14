import type { Request, Response } from "express";
import { prisma } from "@omega/db";

export const getAllRedirects = async (req: Request, res: Response) => {
  try {
    const data = await prisma.redirect.findMany();
    return res
      .status(200)
      .json({ code: 200, message: "All Redirects", data: data });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ code: 500, message: "Internal Server Error " + error });
  }
};
export const getSpecificRedirect = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    const data = await prisma.redirect.findUnique({ where: { from: slug } });
    return res
      .status(200)
      .json({ code: 200, message: "Specific Redirect", data: data });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ code: 500, message: "Internal Server Error " + error });
  }
};
export const addRedirect = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.body;
    const data = await prisma.redirect.create({
      data: {
        from: from,
        to: to,
      },
    });
    return res
      .status(200)
      .json({ code: 200, message: "Redirect Added", data: data });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ code: 500, message: "Internal Server Error " + error });
  }
};
export const deleteRedirect = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const data = await prisma.redirect.delete({ where: { id: parseInt(id) } });
    return res
      .status(200)
      .json({ code: 200, message: "Redirect Deleted", data: data });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ code: 500, message: "Internal Server Error " + error });
  }
};
