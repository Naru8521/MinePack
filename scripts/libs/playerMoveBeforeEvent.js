import { ButtonState, Dimension, InputButton, InputInfo, InputMode, Player, system, world } from "@minecraft/server";

/**
 * @callback PlayerMoveBeforeEventCallback
 * @param {PlayerMoveBeforeEvent} event - イベントオブジェクト
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
 * @typedef {Object} PlayerMoveBeforeEvent
 * @property {Player} player - イベントを起こしたプレイヤー
 * @property {PlayerInputKey[]} keys - 押されているキー
 * @property {InputMode} device - イベントを起こしたプレイヤーのデバイス
 * @property {boolean} cancel - イベントをキャンセルするかどうか
 */

/**
 * @typedef {Object} PlayerMoveBeforeEvent
 * @property {Player} player - イベントを起こしたプレイヤー
 * @property {[]} keys - 押されているキー
 * @property {InputMode} inputMode - イベントを起こしたプレイヤーのモード
 * @property {boolean} cancel - イベントをキャンセルするかどうか
 */

const callbacks = new Map();
const playerLocationsMap = new Map();

/** @type {Readonly<PlayerInputKeys>} */
export const PlayerInputKeys = Object.freeze({
    W: "W",
    A: "A",
    S: "S",
    D: "D",
    SPACE: "SPACE",
    SHIFT: "SHIFT"
});

export default class playerMoveBeforeEvent {
    /**
     * @param {PlayerMoveBeforeEventCallback} callback 
     */
    constructor(callback) {
        this.callback = callback;
        callbacks.set(this.callback, true);
    }

    /**
     * @param {PlayerMoveBeforeEventCallback} callback 
     */
    static subscribe(callback) {
        new playerMoveBeforeEvent(callback);
    }

    /**
     * @param {PlayerMoveBeforeEventCallback} callback 
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
        const location = player.location;
        const playerLocation = playerLocationsMap.get(player.id) || location;

        if (pressedKeys.length > 0) {
            /** @type {PlayerMoveBeforeEvent} */
            let events = {
                player: player,
                keys: pressedKeys,
                device: inputInfo.lastInputModeUsed,
                cancel: false
            };

            callbacks.forEach((_, callback) => callback(events));

            if (events.cancel) {
                player.teleport(playerLocation);
                continue;
            }
        }

        playerLocationsMap.set(player.id, location);
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