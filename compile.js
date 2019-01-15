var browserify = require('browserify')
var tsify = require('tsify')
var pathmodify = require('pathmodify')
var derequire = require('browserify-derequire')
var path = require('path')
var tsconfig = require('./tsconfig.json')

if (!global.crypto) {
  global.crypto = require('isomorphic-webcrypto')
}

browserify('index.ts', { standalone: 'BandProtocolClient' })
  .plugin(pathmodify, {
    mods: [pathmodify.mod.dir('~', path.join(__dirname, 'src'))],
  })
  .plugin(derequire)
  .plugin(tsify, { project: tsconfig })
  .external('isomorphic-fetch')
  .bundle()
  .on('error', function(error) {
    console.error(error.toString())
  })
  .pipe(process.stdout)
