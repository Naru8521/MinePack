import { world, Entity } from "@minecraft/server";

/**
 * @param {Entity} entity 
 * @param {string[]} args 
 */
export function run(entity, args) {
    world.sendMessage("test1を実行しました");
}