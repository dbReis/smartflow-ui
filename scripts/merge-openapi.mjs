// Merges openapi.planned.json (endpoints the UI needs that the API does not
// have yet) into the API's openapi.json snapshot, for openapi-typescript.
// Fails when the API already defines a planned path+method or schema, so the
// planned file only ever holds what is still missing.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

const [, , apiFile, plannedFile, outFile] = process.argv
const api = JSON.parse(readFileSync(apiFile, 'utf8'))
const planned = JSON.parse(readFileSync(plannedFile, 'utf8'))

const conflicts = []
for (const [path, operations] of Object.entries(planned.paths ?? {})) {
  api.paths[path] ??= {}
  for (const [method, operation] of Object.entries(operations)) {
    if (api.paths[path][method]) {
      conflicts.push(`${method.toUpperCase()} ${path}`)
    }
    api.paths[path][method] = operation
  }
}
for (const [name, schema] of Object.entries(
  planned.components?.schemas ?? {},
)) {
  if (api.components.schemas[name]) conflicts.push(`schema ${name}`)
  api.components.schemas[name] = schema
}

if (conflicts.length) {
  console.error(
    `The API now defines what ${plannedFile} still plans:\n  ${conflicts.join('\n  ')}\n` +
      `Remove these entries from ${plannedFile} (and check the shapes still match).`,
  )
  process.exit(1)
}

mkdirSync(dirname(outFile), { recursive: true })
writeFileSync(outFile, JSON.stringify(api, null, 2) + '\n')
