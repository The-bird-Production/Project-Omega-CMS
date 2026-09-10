import { isSafePluginId } from "../../Functions/pluginIdValidator.js";

describe("isSafePluginId (InstallPlugins path-safety guard)", () => {
  test("accepts simple alphanumeric ids", () => {
    expect(isSafePluginId("my-plugin_1")).toBe(true);
  });

  test.each([
    "../../etc/passwd",
    "..\\..\\windows\\system32",
    "foo/bar",
    "foo\\bar",
    "./foo",
    "",
    "a b",
    "plugin;rm -rf /",
  ])("rejects unsafe id %p", (id) => {
    expect(isSafePluginId(id)).toBe(false);
  });
});
