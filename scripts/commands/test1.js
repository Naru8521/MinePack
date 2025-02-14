import commandManager from "../modules/CommandManager";

const test1Command = commandManager.register({
    prefixes: ["!"],
    name: "test1",
    args: [
        {
            name: "a"
        },
        {
            name: "test"
        }
    ]
});

// get all commands
commandManager.getCommands();

test1Command.onCommand((args, player) => {
    // process
});

test1Command.onScriptCommand((args, initiator, entity, block) => {
    // process
});