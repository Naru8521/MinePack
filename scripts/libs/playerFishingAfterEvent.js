import { world, system, Player, ItemStack, Entity } from "@minecraft/server";

/**
 * @callback PlayerFishingAfterEventCallback
 * @param {PlayerFishingAfterEvent} event - イベントオブジェクト
 */

/**
 * @typedef {Object} PlayerFishingAfterEvent
 * @property {boolean} result - 釣りに成功したかどうか
 * @property {Player} player - イベントを起こしたプレイヤー
 * @property {Entity | undefined} itemEntity - 釣れたアイテムのエンティティ
 * @property {ItemStack | undefined} itemStack - 釣れたアイテム
 */

const callbacks = new Map();
const fishingPlayerIds = new Map();

export default class playerFishingAfterEvent {
    /**
     * @param {PlayerFishingAfterEventCallback} callback 
     */
    constructor(callback) {
        this.callback = callback;
        callbacks.set(this.callback, true);
    }

    /**
     * @param {PlayerFishingAfterEventCallback} callback 
     */
    static subscribe(callback) {
        new playerFishingAfterEvent(callback);
    }

    /**
     * @param {PlayerFishingAfterEventCallback} callback 
     */
    static unsubscribe(callback) {
        callbacks.delete(callback);
    }
}

world.beforeEvents.itemUse.subscribe(ev => {
    const { source, itemStack } = ev;

    if (itemStack.typeId === "minecraft:fishing_rod") {
        if (!fishingPlayerIds.has(source.id)) {
            fishingPlayerIds.set(source.id, undefined);
        }
    }
});

world.afterEvents.entitySpawn.subscribe(ev => {
    const { entity } = ev;

    if (entity.typeId === "minecraft:fishing_hook") {
        const keys = [...fishingPlayerIds.keys()];

        if (keys.length > 0) {
            const lastKey = keys[keys.length - 1];
            const player = getPlayerFromId(lastKey);

            fishingPlayerIds.set(lastKey, entity.id);
        }
    }
});

world.beforeEvents.entityRemove.subscribe(ev => {
    const { removedEntity } = ev;

    /** @type {PlayerFishingAfterEvent} */
    let event = {
        result: false,
        player: null,
        itemEntity: undefined,
        itemStack: undefined
    };

    if (removedEntity.typeId === "minecraft:fishing_hook") {
        // アイテムを取得
        const item = removedEntity.dimension.getEntities({
            type: "item",
            location: removedEntity.location,
            minDistance: 0,
            maxDistance: 0.2
        })[0];

        const ids = [...fishingPlayerIds.keys()];

        // プレイヤーをセット
        for (const id of ids) {
            if (fishingPlayerIds.get(id) === removedEntity.id) {
                event.player = getPlayerFromId(id);
                fishingPlayerIds.delete(id);
            }
        }

        // アイテムとリザルトをセット
        if (item) {
            event.result = true;
            event.itemEntity = item;
            event.itemStack = item.getComponent("item").itemStack;
        } else {
            event.result = false;
        }

        callbacks.forEach((_, callback) => callback(event));
    }
});

/**
 * @param {string} id 
 * @returns {Player}
 */
function getPlayerFromId(id) {
    const players = world.getAllPlayers();

    for (const player of players) {
        if (player.id === id) {
            return player;
        }
    }
}