// @ts-check

import { ButtonState, InputButton, Player, system, world } from "@minecraft/server";

/**
 * @callback PlayerJumpAfterEventCallback 
 * @param {PlayerJumpAfterEvent} event - event object 
 */

/**
 * @typedef {Object} PlayerJumpAfterEvent 
 * @prop {Player} player 
 */

const callbacks = new Map();
const pressedJumpMaps = new Map();

export default class playerJumpAfterEvent {
    /**
     * @param {PlayerJumpAfterEventCallback} callback 
     */
    constructor(callback) {
        this.callback = callback;
        callbacks.set(this.callback, true);
    }

    /**
     * @param {PlayerJumpAfterEventCallback} callback 
     */
    static subscribe(callback) {
        new playerJumpAfterEvent(callback);
    }

    /**
     * @param {PlayerJumpAfterEventCallback} callback 
     */
    static unsubscribe(callback) {
        callbacks.delete(callback);
    }
}

system.runInterval(() => {
    const players = world.getAllPlayers();

    for (const player of players) {
        const inputInfo = player.inputInfo;

        if (inputInfo.getButtonState(InputButton.Jump) === ButtonState.Pressed) {
            if (!pressedJumpMaps.has(player.id)) {
                pressedJumpMaps.set(player.id, true);

                /** @type {PlayerJumpAfterEvent} */
                let events = {
                    player: player
                };

                callbacks.forEach((_, callback) => callback(events));
            }
        } else {
            pressedJumpMaps.delete(player.id);
        }
    }
});