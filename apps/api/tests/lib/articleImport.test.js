import { jest } from "@jest/globals";

jest.unstable_mockModule("@omega/db", () => ({ prisma: {} }));
jest.unstable_mockModule("@blocknote/server-util", () => ({ ServerBlockNoteEditor: { create: () => ({}) } }));

const { cleanLegacyHtml, hoistImages, collectImageSources, replaceImageSources, normalizeSourceUrl } = await import(
  "../../lib/articleImport.js"
);

describe("cleanLegacyHtml", () => {
  test("drops Office namespaced tags, conditional comments and empty paragraphs", () => {
    const html = '<p>Texte<o:p></o:p></p><!--[if gte vml 1]><v:shape></v:shape><![endif]--><p>&nbsp;</p><p class="MsoNormal"> </p>';
    expect(cleanLegacyHtml(html)).toBe("<p>Texte</p>");
  });
});

describe("hoistImages", () => {
  test("moves an image nested in a paragraph out to its own position", () => {
    const html = '<p class="MsoNormal"><strong><span><img src="a.jpg" width="10"></span></strong></p>';
    expect(hoistImages(html)).toBe('<img src="a.jpg" width="10">');
  });

  test("keeps the paragraph's text after the image", () => {
    expect(hoistImages('<p><img src="a.jpg"> Bonjour</p>')).toBe('<img src="a.jpg"><p> Bonjour</p>');
  });

  test("leaves paragraphs without images untouched", () => {
    expect(hoistImages("<p>Bonjour</p>")).toBe("<p>Bonjour</p>");
  });
});

describe("image sources", () => {
  const html = '<img src="https://old/image/a.jpg"><p>x</p><img alt="b" src=\'/image/b.png\'><img src="https://old/image/a.jpg">';

  test("collects each distinct src once", () => {
    expect(collectImageSources(html)).toEqual(["https://old/image/a.jpg", "/image/b.png"]);
  });

  test("rewrites mapped sources and leaves the others alone", () => {
    const mapping = new Map([["https://old/image/a.jpg", "https://new/image/1.jpg"]]);
    expect(replaceImageSources(html, mapping)).toBe(
      '<img src="https://new/image/1.jpg"><p>x</p><img alt="b" src=\'/image/b.png\'><img src="https://new/image/1.jpg">'
    );
  });
});

describe("normalizeSourceUrl", () => {
  test("trims spaces and trailing slashes", () => {
    expect(normalizeSourceUrl("  https://backend.example.fr/ ")).toBe("https://backend.example.fr");
  });

  test("rejects anything that isn't an http(s) URL", () => {
    expect(() => normalizeSourceUrl("file:///etc/passwd")).toThrow();
    expect(() => normalizeSourceUrl("backend.example.fr")).toThrow();
    expect(() => normalizeSourceUrl(undefined)).toThrow();
  });
});
