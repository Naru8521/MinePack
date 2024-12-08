import { system, world, Player, Container, ItemStack, Entity, Dimension } from "@minecraft/server";

/**
 * @callback PlayerDropBeforeEventCallback
 * @param {PlayerDropBeforeEvent} event - イベントオブジェクト
 */

/**
 * @typedef {Object} PlayerDropBeforeEvent
 * @property {Player} player - イベントを起こしたプレイヤー
 * @property {number} slot - イベントが起こったスロット
 * @property {Container} container - イベント後のコンテナー
 * @property {ItemStack} oldItemStack - イベントが起こる前のインベントリのアイテム
 * @property {ItemStack?} newItemStack - イベントが起こった後のインベントリのアイテム
 * @property {boolean} cancel - イベントをキャンセルするかどうか
 */

const callbacks = new Map();
const playerContainers = new Map();

export default class playerDropBeforeEvent {
    /**
     * @param {PlayerDropBeforeEventCallback} callback 
     */
    constructor(callback) {
        this.callback = callback;
        callbacks.set(this.callback, true);
    }

    /**
     * @param {PlayerDropBeforeEventCallback} callback 
     */
    static subscribe(callback) {
        new playerDropBeforeEvent(callback);
    }

    /**
     * @param {PlayerDropBeforeEventCallback} callback 
     */
    static unsubscribe(callback) {
        callbacks.delete(callback);
    }
}

system.runInterval(() => {
    const players = world.getAllPlayers();

    for (const player of players) {
        const playerId = player.id;

        const oldContainer = playerContainers.get(playerId);
        const newContainer = getContainer(player);

        if (!oldContainer) {
            playerContainers.set(playerId, copyContainer(getContainer(player)));
            continue;
        }

        if (oldContainer && newContainer) {
            const comparison = getComparisonContainer(player, oldContainer, newContainer);

            if (comparison) {
                const { slot, oldItemStack, newItemStack } = comparison;
                /** @type {PlayerDropBeforeEvent} */
                let events = {
                    player: player,
                    slot: slot,
                    container: newContainer,
                    oldItemStack: oldItemStack,
                    newItemStack: newItemStack,
                    cancel: false,
                };

                callbacks.forEach((_, callback) => callback(events));

                if (events.cancel) {
                    const dropItem = isDropItem(player);

                    if (dropItem) {
                        dropItem.remove();
                    }

                    setContainer(oldContainer, newContainer);
                    playerContainers.set(playerId, copyContainer(oldContainer));
                    continue;
                }
            }

            playerContainers.set(playerId, copyContainer(newContainer));
        }
    }
});

/**
 * ドロップされているアイテムかを検知 (疑似)
 * @param {Player} player
 * @return {Entity?}
 */
function isDropItem(player) {
    const dimension = player.dimension;
    const entities = dimension.getEntities({
        type: "minecraft:item",
        location: player.getHeadLocation(),
        closest: 1
    });

    if (entities.length > 0) {
        const item = entities[0];
        const distance = calculateDistance(item.location, player.getHeadLocation());

        if (
            distance !== Infinity &&
            distance < (
                player.isSprinting
                    ? 2.0
                    : player.isFlying
                        ? 4.0
                        : player.isFalling
                            ? 5.0
                            : 0.8
            )
        ) {
            return item;
        }
    }

    return undefined;
}

/**
 * 距離を計算する
 * @param {import("@minecraft/server").Vector3} vec1
 * @param {import("@minecraft/server").Vector3} vec2
 * @returns {number}
 */
function calculateDistance(vec1, vec2) {
    const dx = vec2.x - vec1.x;
    const dy = vec2.y - vec1.y;
    const dz = vec2.z - vec1.z;

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * インベントリを取得する
 * @param {Player} player 
 * @returns {Container?}
 */
function getContainer(player) {
    const inventory = player.getComponent("inventory");

    if (inventory) {
        return inventory.container;
    }

    return null;
}

/**
 * Containerをセットする
 * @param {Array} c0 - 元のコンテナー
 * @param {Container} c1 - 新しいコンテナー
 */
function setContainer(c0, c1) {
    for (let slot = 0; slot < c0.length; slot++) {
        const item = c0[slot]

        c1.setItem(slot, item ? item.clone() : undefined);
    }
}

/**
 * Containerのコピーを作成する
 * @param {Container} container
 * @returns {Array}
 */
function copyContainer(container) {
    const copy = [];

    for (let slot = 0; slot < container.size; slot++) {
        const item = container.getItem(slot);
        copy[slot] = item ? item.clone() : null;
    }
    return copy;
}

/**
 * Containerを比較する
 * @param {Player} player
 * @param {Array} c0 
 * @param {Container} c1 
 * @returns {{
 *  slot: number,
*   oldItemStack: ItemStack,
*   newItemStack: ItemStack?
 * }?}
 */
function getComparisonContainer(player, c0, c1) {
    const dropItem = isDropItem(player);

    for (let slot = 0; slot < c1.size; slot++) {
        const oldItemStack = c0[slot];
        const newItemStack = c1.getItem(slot);

        if (dropItem) {
            if (oldItemStack && !newItemStack) {
                return { slot, oldItemStack, newItemStack: undefined };
            }

            if (oldItemStack && newItemStack && check(oldItemStack, newItemStack)) {
                return { slot, oldItemStack, newItemStack: newItemStack };
            }
        }
    }

    return null;
}

/**
 * アイテムが一致するかチェックする
 * @param {ItemStack} i0
 * @param {ItemStack} i1
 * @returns {boolean}
 */
function check(i0, i1) {
    if (!i0 || !i1) return false;

    return (
        i0.typeId !== i1.typeId ||
        i0.amount !== i1.amount ||
        (i0.nameTag !== i1.nameTag) ||
        !arraysEqual(i0.getLore(), i1.getLore()) ||
        !arraysEqual(i0.getDynamicPropertyIds(), i1.getDynamicPropertyIds()) ||
        !arraysEqual(i0.getTags(), i1.getTags()) ||
        !arraysEqual(i0.getCanDestroy(), i1.getCanDestroy()) ||
        !arraysEqual(i0.getCanPlaceOn(), i1.getCanPlaceOn()) ||
        i0.lockMode !== i1.lockMode ||
        i0.keepOnDeath !== i1.keepOnDeath ||
        i0.isStackable !== i1.isStackable
    );
}

/**
 * 配列が一致するかチェックする
 * @param {Array} arr1
 * @param {Array} arr2
 * @returns {boolean}
 */
function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;

    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }

    return true;
}
