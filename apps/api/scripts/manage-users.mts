#!/usr/bin/env node
// Command-line user management — the only way to create/manage users today
// is the admin UI itself (chicken-and-egg for the very first admin account)
// or editing the database by hand (phpMyAdmin), which skips better-auth's
// own logic (password hashing, required fields, linked credential account)
// and is exactly how a user ends up with e.g. a missing `name` and can't
// log in. This goes through the same better-auth APIs the app itself uses.
//
// Usage:
//   pnpm run manage-users create <email> <password> <name> [role]
//   pnpm run manage-users list
//   pnpm run manage-users set-role <email> <admin|user>
//   pnpm run manage-users set-password <email> <newPassword>
//   pnpm run manage-users delete <email>
import { randomUUID } from "crypto";
import { prisma } from "@omega/db";
import { hashPassword } from "better-auth/crypto";
import { auth } from "../lib/auth.js";

function usage(): never {
  console.error(
    [
      "Usage:",
      "  pnpm run manage-users create <email> <password> <name> [role]",
      "  pnpm run manage-users list",
      "  pnpm run manage-users set-role <email> <admin|user>",
      "  pnpm run manage-users set-password <email> <newPassword>",
      "  pnpm run manage-users delete <email>",
    ].join("\n")
  );
  process.exit(1);
}

async function createUser(email: string, password: string, name: string, role: string): Promise<void> {
  if (!email || !password || !name) usage();
  // auth.api.createUser skips its normal admin-session check specifically
  // when called like this (no request/headers) — this is better-auth's
  // documented way to call its API from server-side code.
  const { user } = await auth.api.createUser({
    body: { email, password, name, role: role || "user" },
  });
  console.log(`Utilisateur créé : ${user.email} (id=${user.id}, role=${role || "user"})`);
}

async function listUsers(): Promise<void> {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, banned: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  if (users.length === 0) {
    console.log("Aucun utilisateur.");
    return;
  }
  for (const u of users) {
    console.log(
      `${u.email}\tname=${u.name ?? "(vide)"}\trole=${u.role ?? "user"}${u.banned ? "\tBANNI" : ""}\tcréé le ${u.createdAt.toISOString().slice(0, 10)}`
    );
  }
}

async function setRole(email: string, role: string): Promise<void> {
  if (!email || !role) usage();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error(`Aucun utilisateur avec l'email ${email}`);
  await prisma.user.update({ where: { email }, data: { role } });
  console.log(`${email} a désormais le rôle "${role}".`);
}

async function setPassword(email: string, newPassword: string): Promise<void> {
  if (!email || !newPassword) usage();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error(`Aucun utilisateur avec l'email ${email}`);

  const hashed = await hashPassword(newPassword);
  const existing = await prisma.account.findFirst({ where: { userId: user.id, providerId: "credential" } });

  if (existing) {
    await prisma.account.update({ where: { id: existing.id }, data: { password: hashed, updatedAt: new Date() } });
  } else {
    // User was created without a password (e.g. social/magic-link only) —
    // link a credential account the same way better-auth's own sign-up
    // flow would.
    await prisma.account.create({
      data: {
        id: randomUUID(),
        accountId: user.id,
        providerId: "credential",
        userId: user.id,
        password: hashed,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
  console.log(`Mot de passe mis à jour pour ${email}.`);
}

async function deleteUser(email: string): Promise<void> {
  if (!email) usage();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error(`Aucun utilisateur avec l'email ${email}`);
  await prisma.user.delete({ where: { email } });
  console.log(`Utilisateur ${email} supprimé (sessions et comptes liés supprimés aussi).`);
}

async function main(): Promise<void> {
  const [, , command, ...args] = process.argv;

  switch (command) {
    case "create":
      await createUser(args[0], args[1], args[2], args[3]);
      break;
    case "list":
      await listUsers();
      break;
    case "set-role":
      await setRole(args[0], args[1]);
      break;
    case "set-password":
      await setPassword(args[0], args[1]);
      break;
    case "delete":
      await deleteUser(args[0]);
      break;
    default:
      usage();
  }
}

main()
  .catch((err) => {
    console.error("Erreur :", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
