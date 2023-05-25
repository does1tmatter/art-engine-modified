const fs = require('fs')

const ids = {}

const recordIds = (path, map) => {
  let seedJson = JSON.parse(fs.readFileSync(`${path}/seed.json`))

  map.forEach((value, key) => {
    ids[key] = value
  })

  seedJson = {
    ...seedJson,
    ids
  }

  fs.writeFileSync(`${path}/seed.json`, JSON.stringify(seedJson, null, 2))
}

exports.recordIds = recordIds