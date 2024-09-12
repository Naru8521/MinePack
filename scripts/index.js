import { world } from "@minecraft/server";
import { CommandHandler } from "./libs/commandHandler";
import playerMoveBeforeEvent from "./libs/playerMoveBeforeEvent";
import playerDropBeforeEvent from "./libs/playerDropBeforeEvent";

commandHandler: {
    // commandsへのpath
    const commandsPath = "../commands";

    /** @type {import("./libs/commandHandler").CommandSetting} */
    const commandSetting = {
        prefix: "",
        id: "a:b"
    };
    
    /** @type {import("./libs/commandHandler").SubCommand[]} */
    const commands = [
        {
            name: "test1",
            description: "test1"
        }
    ];
    
    const commandHandler = new CommandHandler(commandsPath, commandSetting, commands);
    
    world.beforeEvents.chatSend.subscribe(ev => {
        commandHandler.check(ev);
    });
}

playerDropBeforeEvent: {
    playerDropBeforeEvent.subscribe(ev => {
        const { player, slot, oldItemStack, newItemStack, container } = ev;
    
        // ev.cancel = true;
    });
}

playerMoveBeforeEvent: {
    playerMoveBeforeEvent.subscribe(ev => {
        const { player, keys } = ev;
    
        player.onScreenDisplay.setActionBar(`押されたキー ${keys.join(", ")}`);
    
        // ev.cancel = true;
    });
}