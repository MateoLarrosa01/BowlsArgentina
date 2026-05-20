import fs from "fs";

const files = process.argv.slice(2);
for (const p of files) {
  let c = fs.readFileSync(p, "utf8");
  const bad = "mo" + "tion";
  const good = "div";
  c = c.replaceAll(`</${bad}>`, `</${good}>`);
  c = c.replaceAll(`<${bad} `, `<${good} `);
  c = c.replaceAll(`<${bad}>`, `<${good}>`);
  fs.writeFileSync(p, c);
  console.log("fixed", p);
}
