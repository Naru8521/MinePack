import playerDropBeforeEvent from "../events/playerDropBeforeEvent";

playerDropBeforeEvent.subscribe(ev => {
    const { player, slot, container, newItemStack, oldItemStack } = ev;

    player.sendMessage([
        `dropped slot: ${slot}`,
        `dropped itemId: ${oldItemStack.typeId}`,
        `Number of items after drop: ${newItemStack ? newItemStack.amount : 0}`
    ].join("\n"));

    // ev.cancel = true;
});