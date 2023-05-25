const { ArtEngine, inputs, generators, renderers, exporters } = require('@hashlips-lab/art-engine');
const { ImagesExporter } = require('./plugins/exporters/ImagesExporter.js')
const { Erc721MetadataExporter } = require('./plugins/exporters/Erc721MetadataExporter.js')
const { ImageLayersAttributesGenerator } = require('./plugins/generators/ImageLayersAttributesGenerator.js')
const { getSeed } = require('./utils/getSeed.js')
const { recordIds } = require('./utils/recordIds.js')

const BASE_PATH = __dirname;
const CACHE_PATH = `${BASE_PATH}/cache`

// Set minimum and maximum token Ids,
// so that randomizer would know total count and range
const minTokenId = 1
const maxTokenId = 100


// Ignore these below settings. this is for randomization
const cacheSeed = getSeed(CACHE_PATH)
const randomLayout = new Map()
const randomizedSet = new Set()
const randomizationConfig = {
  currentSeed: cacheSeed,
  idRange: [minTokenId, maxTokenId],
  idSet: randomizedSet,
  idMap: randomLayout,
  onRender: (idSet, idMap, itemId) => { 
    idSet.add(itemId)
    idMap.set(idMap.size + 1, itemId)
    if (!Object.keys(cacheSeed?.ids ?? {}).length) {
      recordIds(CACHE_PATH, randomLayout)
    }
  }
}
// Ignore settings. this is for randomization

const ae = new ArtEngine({
  cachePath: CACHE_PATH,
  outputPath: `${BASE_PATH}/output`,

  inputs: {
    regulars: new inputs.ImageLayersInput({
      assetsBasePath: `${BASE_PATH}/data/Regulars`,
    }),
    rares: new inputs.ImageLayersInput({
      assetsBasePath: `${BASE_PATH}/data/Rares`,
    })
  },

  generators: [
    new ImageLayersAttributesGenerator({
      dataSet: 'rares',
      startIndex: 1,
      endIndex: 10,
      randomization: randomizationConfig
    }),
    new ImageLayersAttributesGenerator({
      dataSet: 'regulars',
      startIndex: 11,
      endIndex: 100,
      randomization: randomizationConfig
    })
  ],

  renderers: [
    new renderers.ItemAttributesRenderer({
      name: (itemUid) => `Ape ${itemUid}`,
      description: (attributes) => {
        return `This is a token with "${attributes['Background'][0]}" as Background`;
      }
    }),
    new renderers.ImageLayersRenderer({
      width: 2048,
      height: 2048,
    }),
  ],

  exporters: [
    new ImagesExporter(),
    new Erc721MetadataExporter({
      imageUriPrefix: 'ipfs://__CID__/',
      metadataFolder: 'metadata'
    }),
  ],
});

ae.run();