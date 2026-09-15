import { jest } from "@jest/globals";

const getSessionMock = jest.fn();
const logCreateMock = jest.fn();
const emitAdminEventMock = jest.fn();

jest.unstable_mockModule("../../lib/auth.js", () => ({
  auth: { api: { getSession: getSessionMock } },
}));

jest.unstable_mockModule("@omega/db", () => ({
  prisma: { log: { create: logCreateMock } },
}));

jest.unstable_mockModule("../../lib/socket.js", () => ({
  emitAdminEvent: emitAdminEventMock,
}));

const { default: AddLogs } = await import("../../Functions/AddLogs.js");

describe("AddLogs", () => {
  beforeEach(() => {
    getSessionMock.mockReset();
    logCreateMock.mockReset();
    emitAdminEventMock.mockReset();
  });

  test("creates a log row and broadcasts it to connected admins before calling next()", async () => {
    getSessionMock.mockResolvedValue({ user: { id: "1", name: "Alice", role: "admin" } });
    const createdLog = { id: 42, action: "Install a new theme", color: "green", user: "Alice", date: new Date() };
    logCreateMock.mockResolvedValue(createdLog);
    const next = jest.fn();

    await AddLogs("Install a new theme", "green")({ headers: {} }, {}, next);

    expect(logCreateMock).toHaveBeenCalledWith({
      data: { action: "Install a new theme", user: "Alice", color: "green" },
    });
    expect(emitAdminEventMock).toHaveBeenCalledWith("log:new", createdLog);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("falls back to the user id when there is no session name", async () => {
    getSessionMock.mockResolvedValue({ user: { id: "user-1", role: "admin" } });
    logCreateMock.mockResolvedValue({ id: 1 });
    const next = jest.fn();

    await AddLogs("Delete a redirect", "red")({ headers: {} }, {}, next);

    expect(logCreateMock).toHaveBeenCalledWith({
      data: { action: "Delete a redirect", user: "user-1", color: "red" },
    });
  });

  test("falls back to Unknown when there is no session at all", async () => {
    getSessionMock.mockResolvedValue(null);
    logCreateMock.mockResolvedValue({ id: 1 });
    const next = jest.fn();

    await AddLogs("Update plugin", "info")({ headers: {} }, {}, next);

    expect(logCreateMock).toHaveBeenCalledWith({
      data: { action: "Update plugin", user: "Unknown", color: "info" },
    });
  });
});
