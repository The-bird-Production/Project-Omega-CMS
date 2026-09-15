import { jest } from "@jest/globals";

const getSessionMock = jest.fn();

jest.unstable_mockModule("../../lib/auth.js", () => ({
  auth: { api: { getSession: getSessionMock } },
}));

const { requireAdminSocket } = await import("../../lib/socket.js");

function mockSocket() {
  return { handshake: { headers: { cookie: "session=abc" } } };
}

describe("requireAdminSocket", () => {
  beforeEach(() => {
    getSessionMock.mockReset();
  });

  test("rejects the connection when there is no session", async () => {
    getSessionMock.mockResolvedValue(null);
    const next = jest.fn();

    await requireAdminSocket(mockSocket(), next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  test("rejects a session whose role is not admin", async () => {
    getSessionMock.mockResolvedValue({ user: { id: "1", role: "user" } });
    const next = jest.fn();

    await requireAdminSocket(mockSocket(), next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  test("allows an admin session through", async () => {
    getSessionMock.mockResolvedValue({ user: { id: "1", role: "admin" } });
    const next = jest.fn();

    await requireAdminSocket(mockSocket(), next);

    expect(next).toHaveBeenCalledWith();
  });

  test("rejects the connection if the session lookup throws", async () => {
    getSessionMock.mockRejectedValue(new Error("boom"));
    const next = jest.fn();

    await requireAdminSocket(mockSocket(), next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
