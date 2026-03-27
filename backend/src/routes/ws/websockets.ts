import type { Server as HttpServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { startMetubeStatusPolling, stopMetubeStatusPolling } from "./metube.js";

export interface WsMessage<T = unknown> {
  type: string;
  data: T;
}

let io: SocketIOServer | null = null;
let connectedClients = 0;

export function broadcast(type: string, data: unknown) {
  if (!io) return;

  io.emit("message", { type, data } satisfies WsMessage);
}

export function initWebsockets(server: HttpServer) {
  if (io) return io;

  io = new SocketIOServer(server, {
    path: "/ws",
    cors: { origin: true },
  });

  io.on("connection", (socket) => {
    connectedClients += 1;

    if (connectedClients === 1) {
      startMetubeStatusPolling();
    }

    socket.on("disconnect", () => {
      connectedClients = Math.max(connectedClients - 1, 0);

      if (connectedClients === 0) {
        stopMetubeStatusPolling();
      }
    });
  });

  return io;
}