import playerRideAfterEvent from "../events/playerRideAfterEvent";

playerRideAfterEvent.subscribe(ev => {
    const { player, entity } = ev;

    player.sendMessage(`I got on the ${entity.typeId}.`);
});