import path from "path";
import AdmZip from "adm-zip";
import { assertInside, assertSafeZipEntries } from "../../Functions/InstallTheme.js";

describe("assertInside (path traversal guard)", () => {
  const base = path.resolve("/tmp/omega-themes");

  test("allows a path that resolves inside the base directory", () => {
    const target = path.join(base, "my-theme");
    expect(assertInside(base, target, "test")).toBe(path.resolve(target));
  });

  test("allows the base directory itself", () => {
    expect(assertInside(base, base, "test")).toBe(base);
  });

  test("rejects a path that escapes the base directory via ..", () => {
    const target = path.join(base, "..", "..", "etc", "passwd");
    expect(() => assertInside(base, target, "test")).toThrow(/hors dossier autorisé/);
  });

  test("rejects a sibling directory that merely shares a name prefix", () => {
    // e.g. base = /tmp/omega-themes, sibling = /tmp/omega-themes-evil
    const sibling = `${base}-evil`;
    expect(() => assertInside(base, sibling, "test")).toThrow(/hors dossier autorisé/);
  });
});

describe("assertSafeZipEntries (zip-slip guard)", () => {
  const extractDir = path.resolve("/tmp/omega-themes/extract/my-theme");

  test("passes when every entry stays inside the extraction directory", () => {
    const zip = new AdmZip();
    zip.addFile("theme.json", Buffer.from("{}"));
    zip.addFile("style/main.css", Buffer.from("body{}"));

    expect(() => assertSafeZipEntries(zip, extractDir)).not.toThrow();
  });

  test("throws when an entry tries to escape the extraction directory (zip-slip)", () => {
    // adm-zip's own addFile() sanitizes entryName, so a real crafted malicious
    // archive can't be built through its public API here. A malicious zip
    // built with a lower-level tool can still carry a raw ../ entryName in its
    // central directory, so we fake the parsed-entries shape our guard reads.
    const zip = { getEntries: () => [{ entryName: "../../../../etc/cron.d/evil" }] };

    expect(() => assertSafeZipEntries(zip, extractDir)).toThrow(/entrée d'archive/i);
  });
});
