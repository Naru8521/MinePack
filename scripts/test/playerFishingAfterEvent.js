import playerFishingAfterEvent from "../events/playerFishingAfterEvent";

playerFishingAfterEvent.subscribe(ev => {
    const { player, itemEntity, itemStack, result } = ev;

    player?.sendMessage([
        `result: ${result}`,
        `itemId: ${itemStack.typeId}`
    ].join("\n"));
});