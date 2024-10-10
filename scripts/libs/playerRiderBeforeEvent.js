import { world, Player, Entity } from "@minecraft/server";

/**
 * @callback PlayerRideBeforeEventCallback
 * @param {PlayerRideBeforeEvent} event - イベントオブジェクト
 */

/**
 * @typedef {Object} PlayerRideBeforeEvent
 * @property {Player} player - イベントを起こしたプレイヤー
 * @property {Entity} entity - 乗ろうとしているエンティティ
 * @property {boolean} cancel - イベントをキャンセル
 */

const callbacks = new Map();

export default class playerRideBeforeEvent {
    /**
     * @param {PlayerRideBeforeEventCallback} callback 
     */
    constructor(callback) {
        this.callback = callback;
        callbacks.set(this.callback, true);
    }

    /**
     * @param {PlayerRideBeforeEventCallback} callback 
     */
    static subscribe(callback) {
        new playerRideBeforeEvent(callback);
    }

    /**
     * @param {PlayerRideBeforeEventCallback} callback 
     */
    static unsubscribe(callback) {
        callbacks.delete(callback);
    }
}

world.beforeEvents.playerInteractWithEntity.subscribe(ev => {
    const { player, target } = ev;

    /** @type {PlayerRideBeforeEvent} */
    let event = {
        player,
        entity: target,
        cancel: false
    };

    callbacks.forEach((_, callback) => callback(event));

    if (event.cancel) {
        ev.cancel = true;
    }
});