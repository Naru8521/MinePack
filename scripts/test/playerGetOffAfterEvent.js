import playerGetOffAfterEvent from "../events/playerGetOffAfterEvent";

playerGetOffAfterEvent.subscribe(ev => {
    const { player, entity } = ev;

    player.sendMessage(`I got off the ${entity.typeId}.`);
});