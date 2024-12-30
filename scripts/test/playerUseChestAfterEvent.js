import playerUseChestAfterEvent from "../events/playerUseChestAfterEvent";

playerUseChestAfterEvent.subscribe(ev => {
    const { player, interactBlock, chestPair, isLarge, isFirstEvent } = ev;

    if (isFirstEvent) {
        player.sendMessage([
            `isLarge: ${isLarge}`,
            `chestPair: ${JSON.stringify(chestPair)}`
        ].join("\n"));
    }
});