/**
 * PosMeta
 *
 * @example
 *  let public_data = {"context": "Music"};
 *  let private_data = {spaceID: 90900909090, adID: 3423423432423};
 *  let privateKey = "x67x8v7xc8v6v8vcx912";
 *  let meta = new host.PosMeta(public_data, privateKey, private_data); 
 *
 *  meta.value("context"); // will return "Music" since it is public data
 *  meta.value("adId"); // will return undefined since it is private data
 *  meta.value("adId", privateKey); // will return 3423423432423 since we provided the secret
 */
export default class PosMeta {
    /**
     * @constructor
     *
     * @param {object} [publicData] - An object containing key /value pairs for publicd metadata
     * @param {string} [privateKey] - A key name to identify the owner or a particular set of metadata.
     * @param {object} [privateData] - An object containing the key value pairs of metadata
     */
    constructor(publicData, privateKey, privateData) {
        this.data = publicData || {};
        this.privateData = privateData || {};
        this.privateKey = privateKey;
    }


    /**
     * @param {string} key - The name of the value to retrieve
     * @param {string} [privateKey] - The name of the owner key of the metadata
     * value. By default, it is assumed to be publicd, so nothing needs to be
     * passed in unless looking for a specific proprietary value
     *
     * @returns {string|number|boolean}
     */
    value(key, privateKey) {
        if (privateKey !== undefined && privateKey == this.privateKey) {
            return this.privateData[key];
        } 
        return this.data[key];
    }
}
/**
 * @param {string} jsonString - Public and private data as a json encoded string
 * @param {string} [privateKey] - A key name to identify the owner or a particular set of metadata.
 *
 * @static
 * @returns {PosMeta}
 */
PosMeta.fromString = function(jsonString, privateKey) {
    let publicData = {};
    try {
        publicData = JSON.parse(jsonString);
    } catch(e) {
    }
    let privateData = {};
    if (publicData.hasOwnProperty(privateKey)) {
        privateData = publicData[privateKey];
        delete publicData[privateKey];
    }
    return new PosMeta(publicData, privateKey, privateData);
}
