import { world } from "@minecraft/server";
world.sendMessage("A")
world.beforeEvents.playerInteractWithEntity.subscribe(ev => {
    world.sendMessage("A")
});