const test = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const ts = require("typescript")

const source = fs.readFileSync(
  path.join(__dirname, "../src/lib/proxy-media-type.ts"),
  "utf8"
)
const output = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText
const moduleUnderTest = { exports: {} }
new Function("module", "exports", output)(moduleUnderTest, moduleUnderTest.exports)
const { isBinaryProxyResponse } = moduleUnderTest.exports

test("preserves PDF, Office and attachment downloads as bytes", () => {
  assert.equal(isBinaryProxyResponse("application/pdf"), true)
  assert.equal(
    isBinaryProxyResponse(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ),
    true
  )
  assert.equal(
    isBinaryProxyResponse("text/plain; charset=utf-8", 'attachment; filename="work.txt"'),
    true
  )
  assert.equal(isBinaryProxyResponse("image/jpeg"), true)
})

test("keeps JSON and regular text response handling", () => {
  assert.equal(isBinaryProxyResponse("application/json; charset=utf-8"), false)
  assert.equal(isBinaryProxyResponse("text/html"), false)
})
