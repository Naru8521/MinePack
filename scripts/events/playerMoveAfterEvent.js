import { ButtonState, Dimension, InputButton, InputInfo, InputMode, Player, system, world } from "@minecraft/server";

/**
 * @callback PlayerMoveAfterEventCallback
 * @param {PlayerMoveAfterEvent} event - event object
 */

/**
 * @typedef {"W" | "A" | "S" | "D" | "SPACE" | "SHIFT"} PlayerInputKey
 */

/**
 * @typedef {Object} PlayerMoveAfterEvent
 * @property {Player} player - The player who caused the event
 * @property {PlayerInputKey[]} keys - Key being pressed
 * @property {InputMode} device - Device of the player who caused the event
 * @property {PlayerInputKey[]} firstKeys - First executed key
 */

const callbacks = new Map();
const playerBeforePressKeys = new Map();

export const PlayerInputKey = Object.freeze({
    W: "W",
    A: "A",
    S: "S",
    D: "D",
    SPACE: "SPACE",
    SHIFT: "SHIFT"
});

export default class playerMoveAfterEvent {
    /**
     * @param {PlayerMoveAfterEventCallback} callback 
     */
    constructor(callback) {
        this.callback = callback;
        callbacks.set(this.callback, true);
    }

    /**
     * @param {PlayerMoveAfterEventCallback} callback 
     */
    static subscribe(callback) {
        new playerMoveAfterEvent(callback);
    }

    /**
     * @param {PlayerMoveAfterEventCallback} callback 
     */
    static unsubscribe(callback) {
        callbacks.delete(callback);
    }
}

system.runInterval(() => {
    const players = world.getAllPlayers();

    for (const player of players) {
        const inputInfo = player.inputInfo;
        const pressedKeys = getPressedKeys(inputInfo);

        if (pressedKeys.length > 0) {
            const beforePressKeys = playerBeforePressKeys.get(player.id) || [];
            const firstKeys = pressedKeys.filter(key => !beforePressKeys.includes(key));

            /** @type {PlayerMoveAfterEvent} */
            let events = {
                player: player,
                keys: pressedKeys,
                device: inputInfo.lastInputModeUsed,
                firstKeys,
            };

            callbacks.forEach((_, callback) => callback(events));
        }

        playerBeforePressKeys.set(player.id, pressedKeys);
    }
});

/**
 * @param {InputInfo} inputInfo 
 * @returns {PlayerInputKey[]}
 */
function getPressedKeys(inputInfo) {
    const { x, y } = inputInfo.getMovementVector();
    let pressedKeys = [];

    if (y > 0) pressedKeys.push("W");
    if (y < 0) pressedKeys.push("S");
    if (x > 0) pressedKeys.push("A");
    if (x < 0) pressedKeys.push("D");
    if (inputInfo.getButtonState(InputButton.Jump) === ButtonState.Pressed) pressedKeys.push("SPACE");
    if (inputInfo.getButtonState(InputButton.Sneak) === ButtonState.Pressed) pressedKeys.push("SHIFT");

    return pressedKeys;
}