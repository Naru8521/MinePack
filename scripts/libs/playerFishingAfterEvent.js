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
const fishingEntityIds = new Map();

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

world.afterEvents.projectileHitBlock.subscribe(ev => {
    const { projectile, source } = ev;

    console.warn("TEST1");

    if (source && projectile.typeId === "minecraft:fishing_hook") {
        if (!fishingEntityIds.has(source.id)) {
            fishingEntityIds.set(source.id, projectile.id);
        }
    }
});

world.afterEvents.projectileHitEntity.subscribe(ev => {
    console.warn("TEST2");
});

world.beforeEvents.entityRemove.subscribe(ev => {
    const { removedEntity } = ev;

    /** @type {PlayerFishingAfterEvent} */
    let events = {
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

        const ids = [...fishingEntityIds.keys()];

        // プレイヤーをセット
        for (const id of ids) {
            if (fishingEntityIds.get(id) === removedEntity.id) {
                events.player = getPlayerFromId(id);
                fishingEntityIds.delete(id);
            }
        }

        // アイテムとリザルトをセット
        if (item) {
            events.result = true;
            events.itemEntity = item;
            events.itemStack = item.getComponent("item").itemStack;
        } else {
            events.result = false;
        }

        callbacks.forEach((_, callback) => callback(events));
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