import { system, world, Player, Container, ItemStack, Entity, Dimension } from "@minecraft/server";

/**
 * @callback TagChangeAfterCallback
 * @param {TagChangeAfterEvent} event - イベントオブジェクト
 */

/**
 * @typedef {Object} TagChangeAfterEvent
 * @property {Entity} entity - イベントが起きたエンティティ
 * @property {string[]} tags - 現在のタグ一覧
 * @property {string[]} addTags - 追加されたタグ一覧
 * @property {string[]} removeTags - 削除されたタグ一覧
 */

const callbacks = new Map();

export default class tagChangeAfterEvent {
    /**
     * @param {TagChangeAfterCallback} callback 
     */
    constructor(callback) {
        this.callback = callback;
        callbacks.set(this.callback, true);
    }

    /**
     * @param {TagChangeAfterCallback} callback 
     */
    static subscribe(callback) {
        new tagChangeAfterEvent(callback);
    }

    /**
     * @param {TagChangeAfterCallback} callback 
     */
    static unsubscribe(callback) {
        callbacks.delete(callback);
    }
}

const dimensionIds = ["minecraft:overworld", "minecraft:nether", "minecraft:the_end"];

system.runInterval(() => {
    for (const dimensionId of dimensionIds) {
        const dimension = world.getDimension(dimensionId);
        const entities = dimension.getEntities();

        for (const entity of entities) {
            const tags = entity.getTags();
            let oldTags = entity.oldTags;

            if (!oldTags) {
                entity.oldTags = tags;
                oldTags = tags;
            } else {
                const addTags = tags.filter(tag => !oldTags.includes(tag));
                const removeTags = oldTags.filter(tag => !tags.includes(tag));

                if (addTags.length > 0 || removeTags.length > 0) {
                    /** @type {TagChangeAfterEvent} */
                    let event = {
                        entity,
                        tags,
                        addTags,
                        removeTags
                    };

                    callbacks.forEach((_, callback) => callback(event));
                }

                entity.oldTags = tags;
            }
        }
    }
});