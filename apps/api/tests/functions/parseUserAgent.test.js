import { parseDevice, parseBrowser } from "../../Functions/parseUserAgent.js";

const UA = {
  chromeDesktop:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  firefoxDesktop: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0",
  safariDesktop:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
  edgeDesktop:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
  operaDesktop:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 OPR/114.0.0.0",
  chromeAndroid:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36",
  safariIphone:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  safariIpad:
    "Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
};

describe("parseDevice", () => {
  test("desktop UAs are classified as Ordinateur", () => {
    expect(parseDevice(UA.chromeDesktop)).toBe("Ordinateur");
    expect(parseDevice(UA.firefoxDesktop)).toBe("Ordinateur");
    expect(parseDevice(UA.safariDesktop)).toBe("Ordinateur");
  });

  test("phone UAs are classified as Mobile", () => {
    expect(parseDevice(UA.chromeAndroid)).toBe("Mobile");
    expect(parseDevice(UA.safariIphone)).toBe("Mobile");
  });

  test("iPad is classified as Tablette, not Mobile", () => {
    expect(parseDevice(UA.safariIpad)).toBe("Tablette");
  });

  test("missing/empty user agent defaults to Ordinateur", () => {
    expect(parseDevice("")).toBe("Ordinateur");
    expect(parseDevice(null)).toBe("Ordinateur");
    expect(parseDevice(undefined)).toBe("Ordinateur");
  });
});

describe("parseBrowser", () => {
  test("identifies Chrome (and doesn't mistake it for Safari)", () => {
    expect(parseBrowser(UA.chromeDesktop)).toBe("Chrome");
  });

  test("identifies Firefox", () => {
    expect(parseBrowser(UA.firefoxDesktop)).toBe("Firefox");
  });

  test("identifies Safari", () => {
    expect(parseBrowser(UA.safariDesktop)).toBe("Safari");
  });

  test("identifies Edge, not Chrome, even though Edge's UA contains Chrome/Safari tokens", () => {
    expect(parseBrowser(UA.edgeDesktop)).toBe("Edge");
  });

  test("identifies Opera, not Chrome, even though Opera's UA contains Chrome/Safari tokens", () => {
    expect(parseBrowser(UA.operaDesktop)).toBe("Opera");
  });

  test("falls back to Autre for an unrecognized or missing user agent", () => {
    expect(parseBrowser("SomeBot/1.0")).toBe("Autre");
    expect(parseBrowser("")).toBe("Autre");
  });
});
