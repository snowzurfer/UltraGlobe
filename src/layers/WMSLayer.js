
import {CancellableTextureLoader} from '../loaders/CancellableTextureLoader.js'
import {ImageryLayer} from "./ImageryLayer.js"
/**
 * A service to retrieve maps from a WMS Service
 */

const toDegrees = 57.295779513082320876798154814105;
class WMSLayer extends ImageryLayer {

    /**
     * 
     * @param {id: Object, 
     * name: String, 
     * bounds: [Double], 
     * url: String,
     * layer: String[],
     * epsg:String,
     * version:String} properties 
     */
    constructor(properties) {
        super(properties);
        this.url = properties.url;
        this.layer = properties.layer;
        this.epsg = properties.epsg;
        this.version = properties.version;
        this.textureLoader = new CancellableTextureLoader();
    }

    getMap(tile, callbackSuccess, callbackFailure, width = 128, height = 128) {
        if(!this.bounds || !this.bounds.intersectsBox(tile.bounds)){
            callbackFailure("bounds don't intersect with layer");
        }
        var minY = Math.min(90, Math.max(-90, tile.bounds.min.y * toDegrees));
            var maxY = Math.min(90, Math.max(-90, tile.bounds.max.y * toDegrees));
            var minX = Math.min(179.99999999, Math.max(-180, tile.bounds.min.x * toDegrees));
            var maxX = Math.min(179.99999999, Math.max(-180, tile.bounds.max.x * toDegrees));

            var request = this.url + "?request=getmap&service=wms&format=image/jpeg&BBOX=" +
                minX + "," + minY + "," +
                maxX + "," + maxY +
                "&srs=" + this.epsg +
                "&layers=" + this.layer +
                "&width=" + width +
                "&height=" + height +
                "&version=" + this.version +
                "&styles=default";

            
            
            return this.textureLoader.load(request, (texture) => callbackSuccess(texture), null, (error)=>callbackFailure(error));

    };
}

export { WMSLayer };