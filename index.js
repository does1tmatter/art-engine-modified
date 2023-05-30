const { ArtEngine, inputs, generators, renderers, exporters } = require('@hashlips-lab/art-engine');
const { ImagesExporter } = require('./plugins/exporters/ImagesExporter.js')
const { Erc721MetadataExporter } = require('./plugins/exporters/Erc721MetadataExporter.js')
const { ImageLayersAttributesGenerator } = require('./plugins/generators/ImageLayersAttributesGenerator.js')

const BASE_PATH = __dirname;
const CACHE_PATH = `${BASE_PATH}/cache`

// Set minimum and maximum token Ids,
// so that randomizer would know total count and range
const minTokenId = 1
const maxTokenId = 10

// Ignore these below settings. this is for randomization
const randomizedSet = new Set()
const randomizationConfig = {
  idRange: [minTokenId, maxTokenId],
  idSet: randomizedSet,
  onRender: (idSet, itemId) => idSet.add(itemId)
}
// Ignore settings. this is for randomization

const ae = new ArtEngine({
  cachePath: CACHE_PATH,
  outputPath: `${BASE_PATH}/output`,

  inputs: {
    mydata: new inputs.ImageLayersInput({
      assetsBasePath: `${BASE_PATH}/data/`,
    })
  },

  generators: [
    new ImageLayersAttributesGenerator({
      dataSet: 'mydata',
      startIndex: 1,
      endIndex: 10,
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