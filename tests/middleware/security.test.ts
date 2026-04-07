/**
 * Security Middleware Tests
 *
 * Verifies CORS, session validation, input guards,
 * and HTTPS enforcement behavior.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAllowedOrigins,
  createSessionValidator,
  inputGuard,
} from "../../src/middleware/security.js";
import type { Request, Response, NextFunction } from "express";

function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    method: "GET",
    headers: {},
    query: {},
    protocol: "https",
    ...overrides,
  } as unknown as Request;
}

function mockRes(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    setHeader: vi.fn(),
    redirect: vi.fn(),
  } as unknown as Response;
  return res;
}

describe("Security Middleware", () => {
  describe("getAllowedOrigins", () => {
    beforeEach(() => {
      delete process.env.ALLOWED_ORIGINS;
    });

    it("returns default origins when env is not set", () => {
      const origins = getAllowedOrigins();
      expect(origins).toContain("https://claude.ai");
      expect(origins).toContain("https://chat.openai.com");
      expect(origins).toContain("https://chatgpt.com");
    });

    it("parses ALLOWED_ORIGINS env variable", () => {
      process.env.ALLOWED_ORIGINS =
        "https://custom.com, https://other.com";
      const origins = getAllowedOrigins();
      expect(origins).toEqual([
        "https://custom.com",
        "https://other.com",
      ]);
    });
  });

  describe("createSessionValidator", () => {
    it("rejects requests without sessionId", () => {
      const sessions = new Map();
      const middleware = createSessionValidator(sessions);
      const req = mockReq({ query: {} });
      const res = mockRes();
      const next = vi.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it("rejects requests with invalid sessionId", () => {
      const sessions = new Map();
      const middleware = createSessionValidator(sessions);
      const req = mockReq({ query: { sessionId: "fake_session" } });
      const res = mockRes();
      const next = vi.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it("allows requests with valid sessionId", () => {
      const sessions = new Map([["valid_session", {}]]);
      const middleware = createSessionValidator(sessions);
      const req = mockReq({ query: { sessionId: "valid_session" } });
      const res = mockRes();
      const next = vi.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("inputGuard", () => {
    it("allows GET requests regardless of content type", () => {
      const middleware = inputGuard();
      const req = mockReq({ method: "GET" });
      const res = mockRes();
      const next = vi.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalledOnce();
    });

    it("allows POST with application/json", () => {
      const middleware = inputGuard();
      const req = mockReq({
        method: "POST",
        headers: { "content-type": "application/json" },
      });
      const res = mockRes();
      const next = vi.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalledOnce();
    });

    it("rejects POST with text/html", () => {
      const middleware = inputGuard();
      const req = mockReq({
        method: "POST",
        headers: { "content-type": "text/html" },
      });
      const res = mockRes();
      const next = vi.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(415);
      expect(next).not.toHaveBeenCalled();
    });

    it("rejects POST with multipart/form-data", () => {
      const middleware = inputGuard();
      const req = mockReq({
        method: "POST",
        headers: { "content-type": "multipart/form-data" },
      });
      const res = mockRes();
      const next = vi.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(415);
      expect(next).not.toHaveBeenCalled();
    });

    it("allows POST without content-type header", () => {
      const middleware = inputGuard();
      const req = mockReq({ method: "POST", headers: {} });
      const res = mockRes();
      const next = vi.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalledOnce();
    });
  });
});
