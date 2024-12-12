import { Block, Entity, Player } from "@minecraft/server";

/**
 * @param {string[]} args 
 * @param {{ player: Player?, entity: Entity?, initiator: Entity?, block: Block? }} ev 
 */
export function run(args, ev) {
    const { player, entity, initiator, block } = ev;

    world.sendMessage("test2 aを実行しました");
}