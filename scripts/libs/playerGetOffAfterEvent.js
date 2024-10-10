import { world, Player, Entity, system } from "@minecraft/server";

/**
 * @callback PlayerGetOffAfterEventCallback
 * @param {PlayerGetOffAfterEvent} event - イベントオブジェクト
 */

/**
 * @typedef {Object} PlayerGetOffAfterEvent
 * @property {Player} player - イベントを起こしたプレイヤー
 * @property {Entity} entity - 降りたエンティティ
 */

const callbacks = new Map();
const ridingPlayers = new Map();

export default class playerGetOffAfterEvent {
    /**
     * @param {PlayerGetOffAfterEventCallback} callback 
     */
    constructor(callback) {
        this.callback = callback;
        callbacks.set(this.callback, true);
    }

    /**
     * @param {PlayerGetOffAfterEventCallback} callback 
     */
    static subscribe(callback) {
        new playerGetOffAfterEvent(callback);
    }

    /**
     * @param {PlayerGetOffAfterEventCallback} callback 
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

            ridingPlayers.set(player.id, target);
        } else if (!isRiding && ridingPlayers.has(player.id)) {
            const target = ridingPlayers.get(player.id);

            /** @type {PlayerGetOffAfterEvent} */
            let event = {
                player,
                entity: target
            };
            
            ridingPlayers.delete(player.id);
            callbacks.forEach((_, callback) => callback(event));
        }
    }
});