import playerMoveAfterEvent from "../events/playerMoveAfterEvent";

playerMoveAfterEvent.subscribe(ev => {
    const { player, device, keys, firstKeys } = ev;

    player.sendMessage([
        `device: ${device}`,
        `keys: ${JSON.stringify(keys)}`,
        `firstKeys: ${JSON.stringify(firstKeys)}`
    ].join("\n"));
});