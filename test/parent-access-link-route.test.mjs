import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { join } from "node:path"
import test from "node:test"
import ts from "typescript"

const requireFromProject = createRequire(import.meta.url)
const source = readFileSync(
  join(process.cwd(), "src/app/api/parent-access-links/validate/route.ts"),
  "utf8"
)
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText
const routeModule = { exports: {} }
new Function("require", "module", "exports", compiled)(
  requireFromProject,
  routeModule,
  routeModule.exports
)

test("parent magic link sets session cookies without exposing credentials in JSON", async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url, options) => {
    assert.match(url, /\/api\/v1\/parent-access-links\/validate$/)
    assert.deepEqual(JSON.parse(options.body), { token: "link-token" })
    return Response.json({
      message: "Access link validated",
      status_code: 200,
      data: {
        access_token: "access-secret",
        refresh_token: "refresh-secret",
        session_id: "session-secret",
        session_expires_at: new Date(Date.now() + 3600_000).toISOString(),
        user: {
          id: "parent-1",
          first_name: "Ada",
          last_name: "Okafor",
          email: "ada@example.com",
          role: ["PARENT"],
        },
        requires_password_reset: false,
      },
    })
  }

  try {
    const response = await routeModule.exports.POST(
      new Request("https://demo.schoolbase.africa/api/parent-access-links/validate", {
        method: "POST",
        body: JSON.stringify({ token: "link-token" }),
      })
    )
    const body = await response.json()

    assert.equal(response.status, 200)
    assert.equal(body.data.user.id, "parent-1")
    assert.equal(body.data.requires_password_reset, false)
    assert.equal(JSON.stringify(body).includes("secret"), false)
    for (const [name, value] of [
      ["access_token", "access-secret"],
      ["refresh_token", "refresh-secret"],
      ["session_id", "session-secret"],
    ]) {
      assert.equal(response.cookies.get(name)?.value, value)
    }
    assert.equal(response.cookies.get("user_id")?.value, "parent-1")
    for (const cookie of response.headers.getSetCookie()) {
      assert.match(cookie, /httponly/i)
    }
  } finally {
    globalThis.fetch = originalFetch
  }
})
