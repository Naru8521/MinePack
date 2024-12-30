import { World, Entity, Player, ItemStack } from "@minecraft/server";

export default class DyProp {
    /**
     * @param {World | Entity | Player | ItemStack} target - Objects to be manipulated
     */
    constructor(target) {
        this.target = target;
    }

    /**
     * Sets value to the data of the specified key.
     * @param {string} key - DynamicProperty key
     * @param {string | number | boolean | Array<any> | object} value - Data to be set
     * @returns {boolean} true on success, false on failure
     */
    set(key, value) {
        try {
            validateKey(key);

            if (value === undefined) {
                throw new Error("value must be of type string | number | boolean | Array | object.");
            }

            if (Array.isArray(value) || typeof value === "object") {
                value = JSON.stringify(value);
            }

            this.target.setDynamicProperty(key, value);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Returns the data that can be retrieved from the specified key.
     * @param {string} key - DynamicProperty key
     * @returns {string | number | boolean | Array<any> | object | undefined} data
     */
    get(key) {
        validateKey(key);

        let data = this.target.getDynamicProperty(key);

        if (typeof data === "string") {
            try {
                data = JSON.parse(data);
            } catch { }
        }

        return data;
    }

    /**
     * Deletes data from the specified key.
     * @param {string} key - DynamicProperty key
     */
    remove(key) {
        validateKey(key);
        this.target.setDynamicProperty(key, undefined);
    }

    /**
     * Deletes all data from the specified target.
     */
    removeAll() {
        this.target.clearDynamicProperties();
    }

    /**
     * Returns all keys that exist for a given target.
     * @returns {string[]} Array of keys
     */
    getAllKeys() {
        return this.target.getDynamicPropertyIds();
    }

    /**
     * Returns the total number of bytes of data present in the specified target.
     * @returns {number} byte count
     */
    getTotalByte() {
        return this.target.getDynamicPropertyTotalByteCount();
    }

    /**
     * Returns whether the specified key exists.
     * @param {string} key - DynamicProperty key
     * @returns {boolean} true if present, false otherwise
     */
    hasKey(key) {
        validateKey(key);
        return this.getAllKeys().includes(key);
    }

    /**
     * Sets the array data permanently to the data of the specified key.
     * @param {string} key - DynamicProperty key
     * @param {Array<any>} value - Array data to be set
     */
    whileSetArray(key, value) {
        validateKey(key);

        if (!Array.isArray(value)) {
            throw new Error("value must be an Array type");
        }

        const splitValues = splitArrayByByteSize(value);

        let i = 0;

        while (i < splitValues.length) {
            const newKey = `${key}_${i}`;

            if (!this.hasKey(newKey)) {
                this.set(newKey, splitValues[i]);
                i++;
            } else {
                i++;
            }
        }
    }

    /**
     * Returns all persistent data for a given Key.
     * @param {string} key - DynamicProperty key
     * @returns {Array<any>} data array
     */
    whileGetArray(key) {
        validateKey(key);

        let result = [];
        let i = 0;

        while (true) {
            const newKey = `${key}_${i}`;

            if (this.hasKey(newKey)) {
                result.push(this.get(newKey));
                i++;
            } else {
                break;
            }
        }

        return result.flat();
    }
}

/**
 * @param {Array<any>} value 
 * @param {number} [maxBytes=32767] 
 * @returns {Array<Array<any>>}  
 */
function splitArrayByByteSize(value, maxBytes = 32767) {
    const result = [];
    let currentChunk = [];
    let currentSize = 0;

    for (const item of value) {
        let itemSize;
        let itemData;

        if (typeof item === "string") {
            itemData = item;
        } else if (typeof item === "number" || typeof item === "boolean") {
            itemData = String(item);
        } else {
            itemData = JSON.stringify(item);
        }

        itemSize = getByteSize(itemData);

        if (currentSize + itemSize > maxBytes) {
            result.push(currentChunk);
            currentChunk = [];
            currentSize = 0;
        }

        currentChunk.push(item);
        currentSize += itemSize;
    }

    if (currentChunk.length > 0) {
        result.push(currentChunk);
    }

    return result;
}

/**
 * @param {string} str 
 * @returns {number} 
 */
function getByteSize(str) {
    let byteSize = 0;
    for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i);
        if (charCode <= 0x7F) {
            byteSize += 1;
        } else if (charCode <= 0x7FF) {
            byteSize += 2;
        } else if (charCode <= 0xFFFF) {
            byteSize += 3;
        } else {
            byteSize += 4;
        }
    }
    return byteSize;
}

/**
 * @param {string} key 
 */
function validateKey(key) {
    if (typeof key !== "string") {
        throw new Error("key must be of type string.");
    }
}