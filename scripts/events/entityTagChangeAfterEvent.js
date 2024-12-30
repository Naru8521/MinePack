import { system, world, Entity } from "@minecraft/server";

/**
 * @callback EntityTagChangeAfterCallback
 * @param {EntityTagChangeAfterEvent} event - event object
 */

/**
 * @typedef {Object} EntityTagChangeAfterEvent
 * @property {Entity} entity - Entity in which the event occurred
 * @property {string[]} tags - Current Tag List
 * @property {string[]} addTags - List of tags added
 * @property {string[]} removeTags - List of deleted tags
 */

const callbacks = new Map();

export default class entityTagChangeAfterEvent {
    /**
     * @param {EntityTagChangeAfterCallback} callback 
     */
    constructor(callback) {
        this.callback = callback;
        callbacks.set(this.callback, true);
    }

    /**
     * @param {EntityTagChangeAfterCallback} callback 
     */
    static subscribe(callback) {
        new entityTagChangeAfterEvent(callback);
    }

    /**
     * @param {EntityTagChangeAfterCallback} callback 
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
                    /** @type {EntityTagChangeAfterEvent} */
                    let events = {
                        entity,
                        tags,
                        addTags,
                        removeTags
                    };

                    callbacks.forEach((_, callback) => callback(events));
                }

                entity.oldTags = tags;
            }
        }
    }
});