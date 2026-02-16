const fs = require("fs");
const path = require("path");

const schemaDir = path.join(__dirname, "../src/event-schema");
const outputFile = path.join(__dirname, "../dist/schema-bundle.json");

const schemas = fs
  .readdirSync(schemaDir)
  .filter((fileName) => fileName.endsWith(".json"))
  .map((fileName) => {
    const schemaPath = path.join(schemaDir, fileName);
    return JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  });

const bundle = {
  $id: "ntko2090.bundle.v1",
  schemas
};

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, JSON.stringify(bundle, null, 2));
console.log("Schema bundle generated.");
