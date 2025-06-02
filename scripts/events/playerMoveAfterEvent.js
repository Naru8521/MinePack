// @ts-check

import { ButtonState, EntityComponentTypes, InputButton, InputInfo, InputMode, Player, system, world } from "@minecraft/server";

/**
 * @callback PlayerMoveAfterEventCallback
 * @param {PlayerMoveAfterEvent} event - event object
 */

/**
 * @typedef {Object} PlayerInputKeys 
 * @property {"W"} W
 * @property {"A"} A 
 * @property {"S"} S 
 * @property {"D"} D 
 * @property {"SPACE"} SPACE
 * @property {"SHIFT"} SHIFT 
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
 * @property {number} distance - Distance traveled
 * @property {boolean} isSwimming - Swimming
 * @property {boolean} isRiding - Riding 
 */

const callbacks = new Map();
const playerLastPositions = new Map();
const playerBeforePressKeys = new Map();

/** @type {Readonly<PlayerInputKeys>} */
export const PlayerInputKeys = Object.freeze({
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

world.afterEvents.playerLeave.subscribe(ev => {
    const { playerId } = ev;

    playerLastPositions.delete(playerId);
    playerBeforePressKeys.delete(playerId);
});

system.runInterval(() => {
    const players = world.getAllPlayers();

    for (const player of players) {
        const inputInfo = player.inputInfo;
        const pressedKeys = getPressedKeys(inputInfo);

        if (pressedKeys.length > 0) {
            const beforePressKeys = playerBeforePressKeys.get(player.id) || [];
            const firstKeys = pressedKeys.filter(key => !beforePressKeys.includes(key));

            const lastPos = playerLastPositions.get(player.id);
            const currentPos = player.location;
            let distance = 0;

            if (lastPos) {
                const dx = currentPos.x - lastPos.x;
                const dy = currentPos.y - lastPos.y;
                const dz = currentPos.z - lastPos.z;
                distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            }

            playerLastPositions.set(player.id, { ...currentPos });

            /** @type {PlayerMoveAfterEvent} */
            let events = {
                player: player,
                keys: pressedKeys,
                device: inputInfo.lastInputModeUsed,
                firstKeys,
                distance,
                isSwimming: player.isSwimming,
                isRiding: player.getComponent(EntityComponentTypes.Riding) ? true : false
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
    /** @type {PlayerInputKey[]} */
    let pressedKeys = [];

    if (y > 0) pressedKeys.push(PlayerInputKeys.W);
    if (y < 0) pressedKeys.push(PlayerInputKeys.S);
    if (x > 0) pressedKeys.push(PlayerInputKeys.A);
    if (x < 0) pressedKeys.push(PlayerInputKeys.D);
    if (inputInfo.getButtonState(InputButton.Jump) === ButtonState.Pressed) pressedKeys.push(PlayerInputKeys.SPACE);
    if (inputInfo.getButtonState(InputButton.Sneak) === ButtonState.Pressed) pressedKeys.push(PlayerInputKeys.SHIFT);

    return pressedKeys;
}