import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import vm from "node:vm"
import { fileURLToPath } from "node:url"
import ts from "typescript"

const source = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/lib/classes.ts"),
  "utf8"
)
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText
let respond
const calls = []
const moduleObject = { exports: {} }
vm.runInNewContext(compiled, {
  module: moduleObject,
  exports: moduleObject.exports,
  require: (name) => {
    assert.equal(name, "./api/client")
    return {
      apiFetch: async (route, config) => {
        assert.equal(route, "/classes")
        calls.push(config.params)
        return { data: respond(config.params) }
      },
    }
  },
})
const { ClassesAPI } = moduleObject.exports

function group(index, sessionId = "selected-session") {
  return {
    name: `Class ${index}`,
    academicSession: { id: sessionId, name: "Selected" },
    classes: [{ id: `class-${index}`, arm: "A" }],
  }
}

async function main() {
  respond = ({ page }) => ({
    items:
      page === 1 ? Array.from({ length: 100 }, (_, index) => group(index)) : [group(100)],
    pagination: { page, limit: 100, total: 101, total_pages: 2, has_next: page < 2 },
  })
  const result = await ClassesAPI.getAllForSession("selected-session")
  assert.equal(result.flatMap((item) => item.classes).length, 101)
  assert.deepEqual(
    calls.map((call) => [call.session_id, call.page, call.limit, call.includeArchived]),
    [
      ["selected-session", 1, 100, false],
      ["selected-session", 2, 100, false],
    ]
  )
  respond = ({ page }) => ({
    items: page === 1 ? [group(0)] : [],
    pagination: { page, limit: 100, total: 2, total_pages: 2 },
  })
  await assert.rejects(ClassesAPI.getAllForSession("selected-session"), /Class list/)
  respond = ({ page }) => ({
    items: [group(0, "different-session")],
    pagination: { page, limit: 100, total: 1, total_pages: 1 },
  })
  await assert.rejects(
    ClassesAPI.getAllForSession("selected-session"),
    /complete class list/
  )
  console.log("Promotion class pagination and incomplete-list refusal passed")
}
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
