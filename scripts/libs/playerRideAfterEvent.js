import { world, Player, Entity, system } from "@minecraft/server";

/**
 * @callback PlayerRideAfterEventCallback
 * @param {PlayerRideAfterEvent} event - イベントオブジェクト
 */

/**
 * @typedef {Object} PlayerRideAfterEvent
 * @property {Player} player - イベントを起こしたプレイヤー
 * @property {Entity} entity - 乗ろうとしているエンティティ
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
            let event = {
                player,
                entity: target
            };

            ridingPlayers.set(player.id, true);

            callbacks.forEach((_, callback) => callback(event));
        } else if (!isRiding) {
            ridingPlayers.delete(player.id);
        }
    }
});