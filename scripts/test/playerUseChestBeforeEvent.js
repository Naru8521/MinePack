import playerUseChestBeforeEvent from "../events/playerUseChestBeforeEvent";

playerUseChestBeforeEvent.subscribe(ev => {
    const { player, interactBlock, chestPair, isLarge, isFirstEvent } = ev;

    if (isFirstEvent) {
        player.sendMessage([
            `isLarge: ${isLarge}`,
            `chestPair: ${JSON.stringify(chestPair)}`
        ].join("\n"));
    }

    // ev.cancel = true;
});