import { system, world } from "@minecraft/server";
import CommandHandler from "./modules/commandHandler";

/** @type {import("./modules/commandHandler").CommandsPath} */
const commandsPath = "../commands";

/** @type {import("./modules/commandHandler").CommandSettings} */
const commandSettings = {
    prefixs: ["!"],
    ids: ["a:b"]
};

/** @type {import("./modules/commandHandler").Commands} */
const commands = [
    { 
        name: "test1"
    },
    {
        name: "test2",
        subCommands: [
            {
                name: "a"
            }
        ]
    }
];

const commandHandler = new CommandHandler(commandsPath, commandSettings, commands);

world.beforeEvents.chatSend.subscribe(ev => {
    commandHandler.handleCommand(ev);
    
    if (commandHandler.isCommand(ev)) {
        world.sendMessage("That message is a command.");
    }
});

system.afterEvents.scriptEventReceive.subscribe(ev => {
    commandHandler.handleCommand(ev);
});