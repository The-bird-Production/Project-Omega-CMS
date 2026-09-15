import { jest } from "@jest/globals";
import { EventEmitter } from "events";

const createMock = jest.fn();

jest.unstable_mockModule("@omega/db", () => ({
  prisma: { stats_api: { create: createMock } },
}));

const { trackApiRequest } = await import("../../Middleware/ApiStats.js");

function mockReqRes() {
  const req = { method: "GET", originalUrl: "/article/get/all?page=2" };
  const res = new EventEmitter();
  res.statusCode = 200;
  res.send = function (body) {
    return body;
  };
  return { req, res };
}

describe("trackApiRequest", () => {
  beforeEach(() => {
    createMock.mockReset();
    createMock.mockResolvedValue({});
  });

  test("calls next() synchronously without waiting for the response to finish", () => {
    const { req, res } = mockReqRes();
    const next = jest.fn();

    trackApiRequest(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(createMock).not.toHaveBeenCalled();
  });

  test("records the request's method, path (without query string) and status once finished", async () => {
    const { req, res } = mockReqRes();
    trackApiRequest(req, res, jest.fn());

    res.send("hello");
    res.statusCode = 201;
    res.emit("finish");

    // The create() call happens in a 'finish' handler, not awaited by
    // trackApiRequest itself — flush microtasks before asserting.
    await Promise.resolve();

    expect(createMock).toHaveBeenCalledTimes(1);
    const [{ data }] = createMock.mock.calls[0];
    expect(data.method).toBe("GET");
    expect(data.path).toBe("/article/get/all");
    expect(data.statusCode).toBe(201);
    expect(data.responseSize).toBe(Buffer.byteLength("hello"));
    expect(typeof data.responseTime).toBe("number");
  });

  test("does not throw if saving the metric fails", async () => {
    createMock.mockRejectedValue(new Error("boom"));
    const { req, res } = mockReqRes();
    const next = jest.fn();

    expect(() => trackApiRequest(req, res, next)).not.toThrow();
    res.emit("finish");
    await Promise.resolve();
    await Promise.resolve();

    expect(createMock).toHaveBeenCalledTimes(1);
  });
});
