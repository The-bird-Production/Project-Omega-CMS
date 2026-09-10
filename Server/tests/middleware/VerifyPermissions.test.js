import { jest } from "@jest/globals";

const getSessionMock = jest.fn();

jest.unstable_mockModule("../../lib/auth.js", () => ({
  auth: {
    api: {
      getSession: getSessionMock,
    },
  },
}));

const { default: VerifyPermission } = await import("../../Middleware/VerifyPermissions.js");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("VerifyPermission", () => {
  beforeEach(() => {
    getSessionMock.mockReset();
  });

  test("returns 401 when there is no session", async () => {
    getSessionMock.mockResolvedValue(null);
    const res = mockRes();
    const next = jest.fn();

    await VerifyPermission("admin")({ headers: {} }, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("never bypasses auth just because NODE_ENV is 'test'", async () => {
    // Regression guard: VerifyPermissions used to short-circuit with
    // `if (process.env.NODE_ENV === "test") return next()`, which meant every
    // protected route was wide open whenever tests (or a misconfigured prod
    // deploy) set NODE_ENV=test.
    expect(process.env.NODE_ENV).toBe("test");
    getSessionMock.mockResolvedValue(null);
    const res = mockRes();
    const next = jest.fn();

    await VerifyPermission("admin")({ headers: {} }, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("returns 403 when the session role does not match the required role", async () => {
    // Regression guard: the middleware used to ignore its `role` argument
    // entirely and always check the same hardcoded permission.
    getSessionMock.mockResolvedValue({ user: { id: "1", role: "user" } });
    const res = mockRes();
    const next = jest.fn();

    await VerifyPermission("admin")({ headers: {} }, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("calls next() when the session role matches the required role", async () => {
    getSessionMock.mockResolvedValue({ user: { id: "1", role: "admin" } });
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    await VerifyPermission("admin")(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(req.session.user.role).toBe("admin");
  });

  test("responds 500 if session lookup throws", async () => {
    getSessionMock.mockRejectedValue(new Error("boom"));
    const res = mockRes();
    const next = jest.fn();

    await VerifyPermission("admin")({ headers: {} }, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(next).not.toHaveBeenCalled();
  });
});
