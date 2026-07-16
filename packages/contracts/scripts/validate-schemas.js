const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");

const schemaDir = path.join(__dirname, "../src/event-schema");
const ajv = new Ajv({ strict: true });

const schemaFiles = fs.readdirSync(schemaDir).filter((fileName) => fileName.endsWith(".json"));

schemaFiles.forEach((fileName) => {
  const schemaPath = path.join(schemaDir, fileName);
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  ajv.compile(schema);
});

console.log(`Validated ${schemaFiles.length} schema(s).`);
