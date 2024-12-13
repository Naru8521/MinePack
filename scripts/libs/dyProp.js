import { World, Entity, Player, ItemStack, world } from "@minecraft/server";

export default class DyProp {
    /**
     * @param {World | Entity | Player | ItemStack} target - 操作対象のオブジェクト
     */
    constructor(target) {
        this.target = target;
    }

    /**
     * 指定されたkeyのデータにvalueをセットします。
     * @param {string} key - DynamicPropertyのkey
     * @param {string | number | boolean | Array<any> | object} value - セットするデータ
     * @returns {boolean} 成功時はtrue、失敗時はfalse
     */
    set(key, value) {
        try {
            validateKey(key);

            if (value === undefined) {
                throw new Error("valueはstring | number | boolean | Array | object型のどれかである必要があります。");
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
     * 指定されたkeyから取得できるデータを返します。
     * @param {string} key - DynamicPropertyのkey
     * @returns {string | number | boolean | Array<any> | object | undefined} データ
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
     * 指定されたkeyからデータを削除します。
     * @param {string} key - DynamicPropertyのkey
     */
    remove(key) {
        validateKey(key);
        this.target.setDynamicProperty(key, undefined);
    }

    /**
     * 指定されたtargetから、全てのデータを削除します。
     */
    removeAll() {
        this.target.clearDynamicProperties();
    }

    /**
     * 指定されたtargetに存在するkeyを全て返します。
     * @returns {string[]} keyの配列
     */
    getAllKeys() {
        return this.target.getDynamicPropertyIds();
    }

    /**
     * 指定されたtargetに存在するデータの総合Byte数を返します。
     * @returns {number} バイト数
     */
    getTotalByte() {
        return this.target.getDynamicPropertyTotalByteCount();
    }

    /**
     * 指定されたkeyが存在するかを返します。
     * @param {string} key - DynamicPropertyのkey
     * @returns {boolean} 存在する場合はtrue、そうでない場合はfalse
     */
    hasKey(key) {
        validateKey(key);
        return this.getAllKeys().includes(key);
    }

    /**
     * 指定されたkeyの永続的配列データをすべて削除します。
     * @param {string} key 
     */
    whileRemoveArray(key) {
        validateKey(key);

        let i = 0;

        while (true) {
            const newKey = `${key}_${i}`;

            if (this.hasKey(newKey)) {
                this.remove(newKey);
                i++;
            } else break;
        }
    }

    /**
     * 指定されたkeyのデータに永続的に配列データをセットします。
     * @param {string} key - DynamicPropertyのkey
     * @param {Array<any>} value - セットする配列データ
     */
    whileSetArray(key, value) {
        validateKey(key);

        if (!Array.isArray(value)) {
            throw new Error("valueはArray型である必要があります");
        }

        const splitValues = splitArrayByByteSize(value);

        let i = 0;

        while (i < splitValues.length) {
            const newKey = `${key}_${i}`;

            this.set(newKey, splitValues[i]);
            i++;
        }
    }

    /**
     * 指定されたKeyの永続的データを全て返します。
     * @param {string} key - DynamicPropertyのkey
     * @returns {Array<any>} データ配列
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

    /**
     * 指定されたKeyのDynamicPropertyの名前を全て返します。
     * @param {string} key - DynamicPropertyのkey
     * @returns {Array<string>} ID配列
     */
    whileGetIds(key) {
        validateKey(key);

        let result = [];
        let i = 0;

        while (true) {
            const newKey = `${key}_${i}`;

            if (this.hasKey(newKey)) {
                result.push(newKey);
                i++;
            } else {
                break;
            }
        }

        return result;
    }
}

/**
 * keyの形式を検証します。
 * @param {string} key - DynamicPropertyのkey
 */
function validateKey(key) {
    if (typeof key !== "string") {
        throw new Error("keyはstring型である必要があります。");
    }
}

/**
 * 文字列のバイトサイズを取得します。
 * @param {string} str - 文字列
 * @returns {number} バイトサイズ
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
 * 配列をバイトサイズごとに分割します。
 * @param {Array<any>} value - 配列
 * @param {number} [maxBytes=32767] - 最大バイトサイズ
 * @returns {Array<Array<any>>} 分割された配列
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