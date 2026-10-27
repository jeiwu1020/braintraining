import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { parse } from "postcss";
import { expect, it } from "vitest";

const file = (path: string) => new URL(`../${path}`, import.meta.url);

it("uses a food-free dedicated backdrop only for the Master setup panel", () => {
  const css = readFileSync(file("components/playground/night-market-master.css"), "utf8");
  const backgrounds: string[] = [];
  parse(css).walkRules(".pg-master .nm-menu-art", (rule) => {
    rule.walkDecls("background", (decl) => { backgrounds.push(decl.value); });
  });
  expect(backgrounds).toHaveLength(1);
  expect(backgrounds[0]).toContain("/playground/master/night-market-backdrop-v1.webp");
  expect(css).not.toContain("box-night-market.webp");
});

it("ships the raster backdrop without replacing the original three-food illustration", () => {
  const original = readFileSync(file("public/playground/box-night-market.webp"));
  expect(createHash("sha256").update(original).digest("hex"))
    .toBe("e7024f034d26b9f9f89f87fe70d358ad0f0bc7ddca03688608b57850a5dfd214");
  const legacyCss = readFileSync(file("components/playground/playground.css"), "utf8");
  expect(legacyCss).toContain('/playground/box-night-market.webp');
  const backdrop = file("public/playground/master/night-market-backdrop-v1.webp");
  expect(existsSync(backdrop)).toBe(true);
  const image = readFileSync(backdrop);
  expect(image.toString("ascii", 0, 4)).toBe("RIFF");
  expect(image.toString("ascii", 8, 12)).toBe("WEBP");
  expect(image.byteLength).toBeLessThan(200_000);
});
