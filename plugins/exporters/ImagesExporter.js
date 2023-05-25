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
exports.ImagesExporter = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const ItemAttributesRendererInterface_1 = require("../../interfaces/renderers/ItemAttributesRendererInterface");
const StaticLayeredImagesRendererInterface_1 = require("../../interfaces/renderers/StaticLayeredImagesRendererInterface");
class ImagesExporter {
    rendersGetter;
    outputPath;
    imagesFolder;
    imagesPath;
    constructor(constructorProps = {}) {
        this.imagesFolder = constructorProps.imagesFolder ?? "images";
    }
    async init(props) {
        this.rendersGetter = props.rendersGetter;
        this.outputPath = props.outputPath;
        this.imagesPath = path.join(this.outputPath, this.imagesFolder);
    }
    async export() {
        if (!fs.existsSync(this.outputPath)) {
            fs.mkdirSync(this.outputPath);
        }
        if (!fs.existsSync(this.imagesPath)) {
            fs.mkdirSync(this.imagesPath);
        }
        for (const [itemUid, renders] of Object.entries(this.rendersGetter())) {
            let image = renders.find((render) => StaticLayeredImagesRendererInterface_1.STATIC_LAYERED_IMAGES_RENDERER_INTERFACE_V1 === render.kind);
            if (!image) {
                throw new Error(`Could not find any supported image`);
            }
            let attributes = renders.find((render) => ItemAttributesRendererInterface_1.ITEM_ATTRIBUTES_RENDERER_INTERFACE_V1 === render.kind);
            if (!attributes) {
                throw new Error(`Could not find any supported attributes`);
            }
            fs.copyFileSync(image?.data.path, path.join(this.imagesPath, `${itemUid}.png`));
        }
    }
}
exports.ImagesExporter = ImagesExporter;
