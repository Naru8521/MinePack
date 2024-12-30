import { Block, Entity, Player, world } from "@minecraft/server";

/**
 * @param {string[]} args 
 * @param {{ player: Player?, entity: Entity?, initiator: Entity?, block: Block? }} ev 
 */
export function run(args, ev) {
    const { player, entity, initiator, block } = ev;

    world.sendMessage("test1を実行しました");
}