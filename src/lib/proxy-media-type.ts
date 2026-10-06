export function isBinaryProxyResponse(contentType: string, contentDisposition = "") {
  if (/\battachment\b/i.test(contentDisposition)) return true
  const type = contentType.split(";", 1)[0].trim().toLowerCase()
  if (!type) return false
  return (
    !type.startsWith("text/") &&
    !type.endsWith("json") &&
    type !== "application/xml" &&
    !type.endsWith("+xml")
  )
}
