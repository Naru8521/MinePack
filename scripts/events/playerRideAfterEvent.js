import { world, Player, Entity, system } from "@minecraft/server";

/**
 * @callback PlayerRideAfterEventCallback
 * @param {PlayerRideAfterEvent} event - event object
 */

/**
 * @typedef {Object} PlayerRideAfterEvent
 * @property {Player} player - The player who caused the event
 * @property {Entity} entity - Entities trying to get on
 */

const callbacks = new Map();
const ridingPlayers = new Map();

export default class playerRideAfterEvent {
    /**
     * @param {PlayerRideAfterEventCallback} callback 
     */
    constructor(callback) {
        this.callback = callback;
        callbacks.set(this.callback, true);
    }

    /**
     * @param {PlayerRideAfterEventCallback} callback 
     */
    static subscribe(callback) {
        new playerRideAfterEvent(callback);
    }

    /**
     * @param {PlayerRideAfterEventCallback} callback 
     */
    static unsubscribe(callback) {
        callbacks.delete(callback);
    }
}

system.runInterval(() => {
    const players = world.getAllPlayers();

    for (const player of players) {
        const isRiding = player.getComponent("riding");

        if (isRiding && !ridingPlayers.has(player.id)) {
            const target = player.getComponent("riding").entityRidingOn;
            /** @type {PlayerRideAfterEvent} */
            let events = {
                player,
                entity: target
            };

            ridingPlayers.set(player.id, true);

            callbacks.forEach((_, callback) => callback(events));
        } else if (!isRiding) {
            ridingPlayers.delete(player.id);
        }
    }
});