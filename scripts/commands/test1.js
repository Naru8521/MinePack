import { Block, Entity, Player, world } from "@minecraft/server";

/**
 * @param {string[]} args 
 * @param {{ player: Player?, entity: Entity?, block: Block? }} ev 
 */
export function run(args, ev) {
    const { player, entity, block } = ev;

    world.sendMessage("test1を実行しました");
}