import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("getAppVersion", () => {
  test("returns the version declared in the workspace root package.json", async () => {
    const { getAppVersion } = await import("../../lib/version.js");
    const rootPkg = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "../../../../package.json"), "utf-8")
    );

    expect(getAppVersion()).toBe(rootPkg.version);
    expect(getAppVersion()).toMatch(/^\d+\.\d+\.\d+/);
  });
});
