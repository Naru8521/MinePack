import { world } from "@minecraft/server";
import { CommandHandler } from "./libs/commandHandler";
import playerMoveBeforeEvent from "./libs/playerMoveBeforeEvent";
import playerDropBeforeEvent from "./libs/playerDropBeforeEvent";
import playerFishingAfterEvent from "./libs/playerFishingAfterEvent";

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

        player.sendMessage(`ドロップされたスロット: ${slot}`);
        player.sendMessage(`ドロップ前のアイテム: ${oldItemStack.typeId}`);
        player.sendMessage(`ドロップ後のアイテム: ${newItemStack ? newItemStack.typeId : "minecraft:air"}`);
    
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

playerFishingAfterEvent: {
    playerFishingAfterEvent.subscribe(ev => {
        const { player, itemStack, itemEntity, result } = ev;

        player.sendMessage(`釣りに成功: ${result}`);
        player.sendMessage(`釣れたアイテムID: ${itemStack ? itemStack.typeId : ""}`);
        player.sendMessage(`釣れたアイテムエンティティ: ${itemEntity ? itemEntity.typeId : ""}`);
        player.sendMessage(`釣ったプレイヤー: ${player.name}`);
    });
}