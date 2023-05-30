const path = require('path')
const crypto = require('crypto')
const RandomSeed = require('random-seed')
const { IMAGE_LAYERS_GENERATOR_INTERFACE_V1 } = require('@hashlips-lab/art-engine/dist/interfaces/generators/ImageLayersGeneratorInterface')
const { ITEM_ATTRIBUTES_GENERATOR_INTERFACE_V1 } = require('@hashlips-lab/art-engine/dist/interfaces/generators/ItemAttributesGeneratorInterface')
const { EDGE_CASE_UID_SEPARATOR } = require('@hashlips-lab/art-engine/dist/plugins/inputs/ImageLayersInput')
const { overrides } = require('../../config.js')
console.log(overrides)

const randomize = (min, max) => Math.round(Math.random() * (max - min) + min)

class ImageLayersAttributesGenerator {
  inputsManager;
  dataSet;
  data;
  startIndex;
  endIndex;
  rmg;
  callback;
  idRange;
  idSet;
  idMap;
  cacheSeed;
  mainSeed;

  constructor(constructorProps) {
    this.dataSet = constructorProps.dataSet;
    this.startIndex = constructorProps.startIndex;
    this.endIndex = constructorProps.endIndex;
    this.callback = constructorProps.randomization.onRender
    this.idRange = constructorProps.randomization.idRange
    this.idSet = constructorProps.randomization.idSet
    this.cacheSeed = constructorProps.randomization.currentSeed
    this.idMap = constructorProps.randomization.idMap

    if (this.endIndex < this.startIndex || this.startIndex + this.endIndex < 1) {
      throw new Error(
        `The startIndex property needs to be less than the endIndex property`
      );
    }
  }

  async init(props) {
    this.inputsManager = props.inputsManager;
    this.data = this.inputsManager.get(this.dataSet);
    this.mainSeed = props.seed

    this.rmg = RandomSeed.create(
      this.dataSet + this.constructor.name + props.seed
    );
    // TODO: add support for "kind"
  }

  async generate() {
    const items = {};
    const dnas = new Set();

    let uid = this.startIndex;
    while (uid <= this.endIndex) {
      const itemAttributes = {};
      let itemAssets = [];
      let overrideNotif = false

      let newId = uid

      if (this.mainSeed != this.cacheSeed?.seed) {
        newId = randomize(...this.idRange)
      
        if (this.idSet.has(newId)) {
          while (this.idSet.has(newId)) {
            newId = randomize(...this.idRange)
          }
        }

        this.callback(this.idSet, this.idMap, newId)
      } else {
        newId = this.cacheSeed.ids[uid]
      }

      // Compute attributes
      for (let layer of Object.values(this.data.layers)) {
        if (overrides[newId]) {
          itemAttributes[layer.name] = overrides[newId][layer.name] ?? null
          if (!overrideNotif) {
            console.log(`Token #${newId} overriden.`)
            overrideNotif = true
          }
        } else {
          itemAttributes[layer.name] = this.selectRandomItemByWeight(layer.options);
        }
      }

      // Compute DNA
      let itemDna = this.calculateDna(itemAttributes);

      if (dnas.has(itemDna) && !overrides[newId]) {
        console.log(`Duplicate DNA entry, generating one more...`);

        while (dnas.has(itemDna)) {
          // Regenerate new attributes while dna exist
          for (let layer of Object.values(this.data.layers)) {
            itemAttributes[layer.name] = this.selectRandomItemByWeight(layer.options);
          }

          // compute new dna
          itemDna = this.calculateDna(itemAttributes);
        }
      }

      dnas.add(itemDna);

      // Compute assets
      for (const attributeName of Object.keys(itemAttributes)) {
        const layer = this.data.layers[attributeName];
        const option = layer.options[itemAttributes[attributeName]];
        let assets = [];
        
        if (option?.edgeCases) {
          for (const edgeCaseUid of Object.keys(option.edgeCases)) {
            const [matchingTrait, matchingValue] = edgeCaseUid.split(
              EDGE_CASE_UID_SEPARATOR
            );
  
            if (matchingValue === itemAttributes[matchingTrait]) {
              assets = assets.concat(option.edgeCases[edgeCaseUid].assets);
  
              break;
            }
          }
        }
        
        if (option?.assets) {
          if (assets.length === 0) {
            assets = assets.concat(option.assets);
          }
  
          itemAssets = itemAssets.concat(
            assets.map((asset) => ({
              path: path.join(this.data.basePath, asset.path),
              latestModifiedTimestamp: asset.lastModifiedTime,
              xOffset: layer.baseXOffset + asset.relativeXOffset,
              yOffset: layer.baseYOffset + asset.relativeYOffset,
              zOffset: layer.baseZOffset + asset.relativeZOffset,
            }))
          );
        }
      }

      items[newId.toString()] = [
        {
          kind: ITEM_ATTRIBUTES_GENERATOR_INTERFACE_V1,
          data: {
            dna: itemDna,
            attributes: itemAttributes,
          },
        },
        {
          kind: IMAGE_LAYERS_GENERATOR_INTERFACE_V1,
          data: {
            assets: itemAssets,
          },
        },
      ];

      uid++;
    }

    return items;
  }

  calculateDna(attributes) {
    const dnaSource = Object.keys(attributes)
      .map((key) => [key, attributes[key]])
      .sort((a, b) => {
        const nameA = a[0].toUpperCase();
        const nameB = b[0].toUpperCase();

        if (nameA < nameB) {
          return -1;
        }

        if (nameA > nameB) {
          return 1;
        }

        return 0;
      });

    return crypto
      .createHash("sha1")
      .update(JSON.stringify(dnaSource))
      .digest("hex");
  }

  selectRandomItemByWeight(options) {
    const totalWeight = Object.values(options).reduce(
      (accumulator, currentValue) => accumulator + currentValue.weight,
      0
    );

    let randomNumber = this.rmg.random() * totalWeight;

    for (const key of Object.keys(options)) {
      if (randomNumber < options[key].weight) {
        return key;
      }

      randomNumber -= options[key].weight;
    }

    throw new Error("Couldn't pick any random option...");
  }
}

exports.ImageLayersAttributesGenerator = ImageLayersAttributesGenerator;