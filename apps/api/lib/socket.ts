import { Server as SocketIOServer, type Socket } from "socket.io";
import type { Server as HTTPServer } from "http";
import { auth } from "./auth.js";
import { CORS } from "../config/server.js";

let io: SocketIOServer | null = null;

// Exported standalone so it can be unit tested without spinning up a real
// socket.io server: only requires session cookies in the handshake headers,
// same as any REST route guarded by VerifyPermissions("admin").
export async function requireAdminSocket(socket: Socket, next: (err?: Error) => void): Promise<void> {
  try {
    const session = await auth.api.getSession({ headers: socket.handshake.headers as any });
    if (!session || session.user.role !== "admin") {
      return next(new Error("unauthorized"));
    }
    next();
  } catch (err) {
    next(new Error("unauthorized"));
  }
}

// Attaches a Socket.io server to the same HTTP server Express listens on, so
// admins get real-time notifications (new logs — plugin installs, theme
// updates, redirect/page/image changes, ...) without polling. Gated behind
// the same better-auth session + "admin" role check as the REST routes: the
// handshake headers carry the same session cookie a normal request would.
export function initSocket(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: CORS.origin,
      credentials: true,
    },
  });

  io.of("/admin").use(requireAdminSocket);

  return io;
}

// Broadcasts an event to every connected admin. No-op (and safe to call)
// before initSocket() has run or if nobody is connected.
export function emitAdminEvent(event: string, payload: unknown): void {
  io?.of("/admin").emit(event, payload);
}
