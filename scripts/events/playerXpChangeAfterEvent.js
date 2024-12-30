import { world, Player, system } from "@minecraft/server";

/**
 * @callback PlayerXpChangeAfterEventCallback
 * @param {PlayerXpChangeAfterEvent} event - event object
 */

/**
 * @typedef {Object} PlayerXpChangeAfterEvent
 * @property {Player} player - The player who caused the event
 * @property {number} xp - xp amount after change
 */

const callbacks = new Map();

export default class playerXpChangeAfterEvent {
    /**
     * @param {PlayerXpChangeAfterEventCallback} callback 
     */
    constructor(callback) {
        this.callback = callback;
        callbacks.set(this.callback, true);
    }

    /**
     * @param {PlayerXpChangeAfterEventCallback} callback 
     */
    static subscribe(callback) {
        new playerXpChangeAfterEvent(callback);
    }

    /**
     * @param {PlayerXpChangeAfterEventCallback} callback 
     */
    static unsubscribe(callback) {
        callbacks.delete(callback);
    }
}

system.runInterval(() => {
    const players = world.getAllPlayers();

    for (const player of players) {
        const totalXp = player.getTotalXp();
        let dyTotalXp = player.getDynamicProperty("totalXp");

        if (!dyTotalXp === undefined) {
            dyTotalXp = totalXp;
            player.setDynamicProperty("totalXp", totalXp);
        }

        if (totalXp !== dyTotalXp) {
            player.setDynamicProperty("totalXp", totalXp);

            /** @type {PlayerXpChangeAfterEvent} */
            let events = {
                player,
                xp: totalXp - dyTotalXp
            };

            callbacks.forEach((_, callback) => callback(events));
        }
    }
});