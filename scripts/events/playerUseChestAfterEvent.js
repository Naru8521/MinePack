import { Block, BlockComponentTypes, BlockVolume, BoundingBoxUtils, Container, Player, world } from "@minecraft/server";

/**
 * @callback PlayerUseChestAfterEventCallback
 * @param {PlayerUseChestAfterEvent} event - event object
 */

/**
 * @typedef {Object} PlayerUseChestAfterEvent 
 * @property {Player} player - Players used
 * @property {Block} interactBlock - Blocks used
 * @property {boolean} isFirstEvent - Whether the first event
 * @property {boolean} isLarge - Large chest or not
 * @property {ChestPair?} chestPair - Exists only when isLarge is true
 */

/**
 * @typedef {Object} ChestPair
 * @property {Block} first - First block
 * @property {Block} second - block of a pair
 */

const callbacks = new Map();

export default class playerUseChestAfterEvent {
    /**
     * @param {PlayerUseChestAfterEventCallback} callback
     */
    constructor(callback) {
        this.callback = callback;
        callbacks.set(this.callback, true);
    }

    /**
     * @param {PlayerUseChestAfterEventCallback} callback 
     */
    static subscribe(callback) {
        new playerUseChestAfterEvent(callback);
    }

    /**
     * @param {PlayerUseChestAfterEventCallback} callback 
     */
    static unsubscribe(callback) {
        callbacks.delete(callback);
    }
}

world.afterEvents.playerInteractWithBlock.subscribe(ev => {
    const { player, isFirstEvent, block } = ev;
    const largeChest = getLargeChest(block);

    /** @type {PlayerUseChestAfterEvent} */
    let events = {
        player,
        interactBlock: block,
        isFirstEvent,
        isLarge: largeChest ? true : false,
        chestPair: largeChest
    };

    callbacks.forEach((_, callback) => callback(events));
});

/**
 * @param {Block} block 
 * @returns {Container | undefined}
 */
function getContainer(block) {
    return block.getComponent("inventory")?.container;
}

/**
 * @param {Block} block 
 * @returns {{first: Block, second: Block} | undefined} 
 */
function getLargeChest(block) {
    if (block.typeId !== "minecraft:chest") return undefined;

    const defaultContainer = getContainer(block);
    if (!defaultContainer || defaultContainer.size !== 54) return undefined;

    const directions = ["west", "east", "north", "south"];

    for (const direction of directions) {
        /** @type {Block} */
        const adjacentBlock = block[direction]();
        const adjacentContainer = getContainer(adjacentBlock);

        if (
            adjacentContainer &&
            adjacentContainer.size === 54 &&
            checkObject(block.permutation.getAllStates(), adjacentBlock.permutation.getAllStates()) &&
            checkObject(defaultContainer, adjacentContainer)
        ) {
            return {
                first: block,
                second: adjacentBlock
            };
        }
    }

    return undefined;
}

/**
 * @param  {...Object} objects 
 * @returns {boolean} 
 */
function checkObject(...objects) {
    if (objects.length < 2) return true;

    const [base, ...others] = objects;
    const isEqual = (obj1, obj2) => {
        if (typeof obj1 !== typeof obj2) return false;

        if (obj1 && typeof obj1 === "object") {
            const keys1 = Object.keys(obj1);
            const keys2 = Object.keys(obj2);

            if (keys1.length !== keys2.length) return false;

            return keys1.every(key => 
                obj2.hasOwnProperty(key) && isEqual(obj1[key], obj2[key])
            );
        }

        return obj1 === obj2;
    };

    return others.every(obj => isEqual(base, obj));
}