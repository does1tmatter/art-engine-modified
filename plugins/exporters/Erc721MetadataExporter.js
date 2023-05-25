"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Erc721MetadataExporter = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const ItemAttributesRendererInterface_1 = require("../../interfaces/renderers/ItemAttributesRendererInterface");
class Erc721MetadataExporter {
    rendersGetter;
    outputPath;
    metadataFolder;
    metadataPath;
    imageUriPrefix;
    constructor(constructorProps = {}) {
        this.metadataFolder = constructorProps.metadataFolder ?? "erc721 metadata";
        this.imageUriPrefix =
            constructorProps.imageUriPrefix ?? "IMAGE_URI_PREFIX_";
    }
    async init(props) {
        this.rendersGetter = props.rendersGetter;
        this.outputPath = props.outputPath;
        this.metadataPath = path.join(this.outputPath, this.metadataFolder);
    }
    async export() {
        if (!fs.existsSync(this.outputPath)) {
            fs.mkdirSync(this.outputPath);
        }
        if (!fs.existsSync(this.metadataPath)) {
            fs.mkdirSync(this.metadataPath);
        }
        for (const [itemUid, renders] of Object.entries(this.rendersGetter())) {
            let attributes = renders.find((render) => ItemAttributesRendererInterface_1.ITEM_ATTRIBUTES_RENDERER_INTERFACE_V1 === render.kind);
            if (!attributes) {
                throw new Error(`Could not find any supported attributes`);
            }
            let normalizedAttributes = [];
            for (const [attributeKey, attributeValues] of Object.entries(attributes?.data.attributes)) {
                let attributeValuesArr = attributeValues;
                normalizedAttributes.push({
                    trait_type: attributeKey,
                    value: attributeValuesArr[0],
                });
            }
            let metadata = {
                name: attributes?.data.name,
                description: attributes?.data.description,
                image: `${this.imageUriPrefix}${itemUid}.png`,
                dna: attributes?.data.dna[0],
                uid: itemUid,
                attributes: normalizedAttributes,
            };
            fs.writeFileSync(path.join(this.metadataPath, `${itemUid}.json`), JSON.stringify(metadata, null, 2));
        }
    }
}
exports.Erc721MetadataExporter = Erc721MetadataExporter;
