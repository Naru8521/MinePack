import { system, world } from "@minecraft/server";
import { TickingArea } from "./modules/Tickingarea";

world.afterEvents.playerBreakBlock.subscribe(ev => {
    const { player, block } = ev;

    (async () => {
        const area = await TickingArea.createArea(player.dimension, { pos1: block.location }, 4);

        system.runTimeout(async () => {
            const isRemove = await TickingArea.removeArea(area);

            world.sendMessage(`isRemove: ${isRemove}`);
        }, 100);
    })();
});