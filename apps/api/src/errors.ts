import type { FastifyReply } from "fastify";

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export function sendError(
  reply: FastifyReply,
  status: number,
  code: string,
  message: string,
  details?: unknown,
) {
  const body: ApiErrorBody = {
    error: details === undefined ? { code, message } : { code, message, details },
  };
  return reply.status(status).send(body);
}

export function notFound(reply: FastifyReply, message = "Resource not found") {
  return sendError(reply, 404, "not_found", message);
}

export function unauthorized(reply: FastifyReply, message = "Unauthorized") {
  return sendError(reply, 401, "unauthorized", message);
}

export function badRequest(
  reply: FastifyReply,
  message: string,
  details?: unknown,
) {
  return sendError(reply, 400, "bad_request", message, details);
}
