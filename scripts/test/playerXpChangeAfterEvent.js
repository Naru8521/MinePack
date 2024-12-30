import playerXpChangeAfterEvent from "../events/playerXpChangeAfterEvent";

playerXpChangeAfterEvent.subscribe(ev => {
    const { player, xp } = ev;

    player.sendMessage(`xp: ${xp}`);
});