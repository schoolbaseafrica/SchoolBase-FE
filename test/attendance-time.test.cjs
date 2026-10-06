const assert = require("node:assert/strict")
const fs = require("node:fs")
const Module = require("node:module")
const path = require("node:path")
const test = require("node:test")
const ts = require("typescript")

const sourcePath = path.join(__dirname, "../src/lib/attendance-time.ts")
const source = fs.readFileSync(sourcePath, "utf8")
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText
const mod = new Module(sourcePath, module)
mod.filename = sourcePath
mod.paths = module.paths
mod._compile(compiled, sourcePath)
const { formatAttendanceTime } = mod.exports

test("attendance times are readable in the viewer's timezone", () => {
  process.env.TZ = "Africa/Lagos"
  assert.equal(formatAttendanceTime("2026-10-05T08:30:00.000Z"), "9:30 AM")
  assert.equal(formatAttendanceTime("2026-10-05T16:05:00.000Z"), "5:05 PM")
})

test("missing or malformed attendance times do not show raw data", () => {
  assert.equal(formatAttendanceTime(null), "—")
  assert.equal(formatAttendanceTime("invalid"), "—")
})
