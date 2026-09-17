import type { Request, Response } from "express";
import { prisma } from "@omega/db";

const MAX_LABEL_LENGTH = 191;
const MAX_URL_LENGTH = 191;
const MAX_MENU_NAME_LENGTH = 191;

// Every item in a menu, top-level and nested, ordered by `order` then id —
// a theme's Header/Footer just renders this tree, no client-side sorting.
export const getMenu = async (req: Request, res: Response) => {
  try {
    const menu = req.params.menu || "main";
    const items = await prisma.menuItem.findMany({
      where: { menu, parentId: null },
      orderBy: [{ order: "asc" }, { id: "asc" }],
      include: { children: { orderBy: [{ order: "asc" }, { id: "asc" }] } },
    });
    res.status(200).json({ code: 200, data: items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: "Internal Server Error " + error });
  }
};

// Flat list (no tree nesting) for the admin's own menu editor — easier to
// edit a "parent" dropdown against a flat list than a nested one.
export const getAllMenuItems = async (req: Request, res: Response) => {
  try {
    const menu = req.query.menu as string | undefined;
    const items = await prisma.menuItem.findMany({
      where: menu ? { menu } : undefined,
      orderBy: [{ menu: "asc" }, { order: "asc" }, { id: "asc" }],
    });
    res.status(200).json({ code: 200, data: items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: "Internal Server Error " + error });
  }
};

export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const { label, url, menu, target, order, parentId } = req.body ?? {};
    if (typeof label !== "string" || !label.trim() || typeof url !== "string" || !url.trim()) {
      return res.status(400).json({ code: 400, message: "label et url sont requis" });
    }
    const data = await prisma.menuItem.create({
      data: {
        label: label.trim().slice(0, MAX_LABEL_LENGTH),
        url: url.trim().slice(0, MAX_URL_LENGTH),
        menu: (typeof menu === "string" && menu.trim() ? menu.trim() : "main").slice(0, MAX_MENU_NAME_LENGTH),
        target: typeof target === "string" && target.trim() ? target.trim() : null,
        order: Number.isFinite(order) ? Number(order) : 0,
        parentId: parentId ? Number(parentId) : null,
      },
    });
    res.status(200).json({ code: 200, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: "Internal Server Error " + error });
  }
};

export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { label, url, menu, target, order, parentId } = req.body ?? {};
    const data = await prisma.menuItem.update({
      where: { id },
      data: {
        ...(label !== undefined ? { label: String(label).trim().slice(0, MAX_LABEL_LENGTH) } : {}),
        ...(url !== undefined ? { url: String(url).trim().slice(0, MAX_URL_LENGTH) } : {}),
        ...(menu !== undefined ? { menu: String(menu).trim().slice(0, MAX_MENU_NAME_LENGTH) } : {}),
        ...(target !== undefined ? { target: target ? String(target).trim() : null } : {}),
        ...(order !== undefined ? { order: Number(order) } : {}),
        ...(parentId !== undefined ? { parentId: parentId ? Number(parentId) : null } : {}),
      },
    });
    res.status(200).json({ code: 200, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: "Internal Server Error " + error });
  }
};

export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    // Cascades to any children (see schema.prisma) — deleting a parent
    // deletes its submenu with it, same as deleting a page deletes nothing
    // of its own but this is a tree, not independent rows.
    const data = await prisma.menuItem.delete({ where: { id } });
    res.status(200).json({ code: 200, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: "Internal Server Error " + error });
  }
};
