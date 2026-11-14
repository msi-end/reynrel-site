// Inserts the main-site header and footer into standalone product pages
// (public/products/<slug>/index.html) at <!--site:header--> and <!--site:footer-->.
// Used by the Vite dev server and after every build, so all product pages share one copy.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const read = (f) => fs.readFileSync(path.join(dir, f), "utf8");

export function injectSiteChrome(html) {
  return html
    .replace("<!--site:header-->", read("header.html"))
    .replace("<!--site:footer-->", read("footer.html"));
}

export function injectProductPages(productsDir) {
  if (!fs.existsSync(productsDir)) return 0;
  let n = 0;
  for (const slug of fs.readdirSync(productsDir)) {
    const file = path.join(productsDir, slug, "index.html");
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, "utf8");
    if (!html.includes("<!--site:header-->") && !html.includes("<!--site:footer-->")) continue;
    fs.writeFileSync(file, injectSiteChrome(html));
    n++;
  }
  return n;
}
