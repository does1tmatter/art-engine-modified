const fs = require('fs')

const getSeed = (path) => {
  if (fs.existsSync(path) && fs.existsSync(`${path}/seed.json`)) {
    return JSON.parse(fs.readFileSync(`${path}/seed.json`))
  }
}

exports.getSeed = getSeed