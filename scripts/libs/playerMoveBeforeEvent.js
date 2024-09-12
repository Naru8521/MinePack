import { system, world, Player } from "@minecraft/server";

/**
 * @callback PlayerMoveBeforeEventCallback
 * @param {PlayerMoveBeforeEvent} event - イベントオブジェクト
 */

/**
 * @typedef {Object} PlayerMoveBeforeEvent
 * @property {Player} player - イベントを起こしたプレイヤー
 * @property {("W" | "A" | "S" | "D")[]} keys 
 * @property {boolean} cancel - イベントをキャンセルするかどうか
 */

const callbacks = new Map();
const previousPositions = new Map();

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
        const playerId = player.id;
        const currentLocation = player.location;
        const viewDirection = player.getViewDirection();
        const previousLocation = previousPositions.get(playerId) || currentLocation;
        const deltaX = currentLocation.x - previousLocation.x;
        const deltaZ = currentLocation.z - previousLocation.z;
        const movementThreshold = 0.01;

        if (Math.abs(deltaX) > movementThreshold || Math.abs(deltaZ) > movementThreshold) {
            const forwardX = viewDirection.x;
            const forwardZ = viewDirection.z;
            const rightX = -forwardZ;
            const rightZ = forwardX;
            const movementMagnitude = Math.sqrt(deltaX * deltaX + deltaZ * deltaZ);
            const forwardMovement = (deltaX * forwardX + deltaZ * forwardZ) / movementMagnitude;
            const rightMovement = (deltaX * rightX + deltaZ * rightZ) / movementMagnitude;
            const pressedKeys = [];

            if (forwardMovement > 0.1) {
                pressedKeys.push("W");
            } else if (forwardMovement < -0.1) {
                pressedKeys.push("S");
            }

            if (rightMovement > 0.1) {
                pressedKeys.push("D");
            } else if (rightMovement < -0.1) {
                pressedKeys.push("A");
            }

            if (pressedKeys.length > 0) {
                /** @type {playerMoveBeforeEvent} */
                let event = {
                    player: player,
                    keys: pressedKeys,
                    cancel: false
                }

                callbacks.forEach((_, callback) => callback(event));

                if (event.cancel) {
                    player.teleport(previousLocation);
                    continue;
                }
            }
        }

        previousPositions.set(playerId, currentLocation);
    }
});