import { ChatSendBeforeEvent, ScriptEventCommandMessageAfterEvent, system, world, Player, Entity, Block } from "@minecraft/server";

/**
 * @typedef {Object} CommandOptions
 * @property {string[]?} prefixes - Command prefixes
 * @property {string[]?} ids - Command ids
 * @property {string} name - Command name
 * @property {string?} description - Command description
 * @property {CommandArgument[]} [args] - List of command arguments
 */

/**
 * @typedef {Object} CommandArgument
 * @property {string} name - Argument name
 * @property {"string" | "number" | "boolean"} [type] - Argument type
 * @property {CommandArgument[]} [args] - Nested arguments
 */

/**
 * @typedef {Object} ParsedCommandArgs
 * @property {string | number | boolean | ParsedCommandArgs} [key] 
 */

/**
 * @callback OnCommandHandler 
 * @param {ParsedCommandArgs} args 
 * @param {Player} player
 */

/**
 * @callback OnScriptCommandHandler 
 * @param {ParsedCommandArgs} args 
 * @param {Entity?} initiator 
 * @param {Entity?} sourceEntity
 * @param {Block?} sourceBlock
 */

class Command {
    /**
     * @param {string[]} prefixes
     * @param {string[]} ids 
     * @param {string} name
     * @param {string} description
     * @param {CommandArgument[]} args
     */
    constructor(prefixes, ids, name, description, args) {
        this.prefixes = prefixes;
        this.ids = ids;
        this.name = name;
        this.description = description;
        this.args = args || [];
        this.onCommandHandler = null;
        this.onScriptCommandHandler = null;
    }

    /**
     * @param {OnCommandHandler} onCommandHandler
     */
    onCommand(onCommandHandler) {
        this.onCommandHandler = onCommandHandler;
    }

    /**
     * @param {OnScriptCommandHandler} onScriptCommandHandler 
     */
    onScriptCommand(onScriptCommandHandler) {
        this.onScriptCommandHandler = onScriptCommandHandler;
    }

    /**
     * @param {string[]} rawArgs
     * @param {CommandArgument[]} argDefs
     * @returns {{parsedArgs: ParsedCommandArgs, valid: boolean}}
     */
    parseArgs(rawArgs, argDefs) {
        let parsedArgs = {};

        if (argDefs.length === 0 || rawArgs.length === 0) return { parsedArgs, valid: false };

        let commandName = rawArgs.shift();
        let matchedArg = argDefs.find(arg => arg.name === commandName);

        if (!matchedArg) {
            return { parsedArgs: {}, valid: false };
        }

        if (matchedArg.args && matchedArg.args.length > 0) {
            parsedArgs[matchedArg.name] = {};

            if (rawArgs.length !== matchedArg.args.length) {
                console.error(`Incorrect number of arguments for ${matchedArg.name} (required: ${matchedArg.args.length}, received: ${rawArgs.length})`);
                return { parsedArgs: {}, valid: false };
            }

            for (let argDef of matchedArg.args) {
                let value = rawArgs.shift();

                if (argDef.type === "number") {
                    value = Number(value);

                    if (isNaN(value)) {
                        console.error(`Error parsing number: ${argDef.name}`);
                        return { parsedArgs: {}, valid: false };
                    }
                } else if (argDef.type === "boolean") {
                    if (value !== "true" && value !== "false") {
                        console.error(`Error parsing Boolean: ${argDef.name}`);
                        return { parsedArgs: {}, valid: false };
                    }

                    value = value === "true";
                }

                parsedArgs[matchedArg.name][argDef.name] = value;
            }
        } else if (rawArgs.length > 0) {
            console.error(`${matchedArg.name} has no arguments but has extra arguments`);
            return { parsedArgs: {}, valid: false };
        }

        return { parsedArgs, valid: true };
    }

    /**
     * @param {string[]} rawArgs
     * @param {Player} sender
     * @returns {boolean} 
     */
    executeCommand(rawArgs, sender) {
        if (!this.onCommandHandler) return false;

        const { parsedArgs, valid } = this.parseArgs(rawArgs, this.args);

        if (!valid) {
            return false;
        }

        this.onCommandHandler(parsedArgs, sender);
        return true;
    }

    /**
     * @param {string[]} rawArgs 
     * @param {Entity} initiator 
     * @param {Entity} sourceEntity 
     * @param {Block} sourceBlock 
     * @returns {boolean}
     */
    executeScriptCommand(rawArgs, initiator, sourceEntity, sourceBlock) {
        if (!this.onScriptCommandHandler) return false;

        const { parsedArgs, valid } = this.parseArgs(rawArgs, this.args);

        if (!valid) {
            return false;
        }

        this.onScriptCommandHandler(parsedArgs, initiator, sourceEntity, sourceBlock);
        return true;
    }
}

class CommandManager {
    constructor() {
        this.commands = new Map();
        world.beforeEvents.chatSend.subscribe(ev => {
            handleChatCommand(ev, this.commands);
        });
        system.afterEvents.scriptEventReceive.subscribe(ev => {
            handleScriptEventCommand(ev, this.commands);
        });
    }

    /**
     * @param {CommandOptions} options
     * @returns {Command}
     */
    register({ prefixes = [], ids = [], name, description = "", args }) {
        if (prefixes.length === 0 && ids.length === 0) {
            throw new Error("prefixes or ids are not defined");
        }

        if (!name || name.trim() === "") {
            throw new Error("name is not defined.");
        }

        const command = new Command(prefixes, ids, name, description, args);

        prefixes.forEach(prefix => {
            this.commands.set(`${prefix}${name}`, command);
        });

        ids.forEach(id => {
            this.commands.set(id, command);
        });

        return command;
    }

    /**
     * @returns {CommandOptions[]}
     */
    getCommands() {
        return [...this.commands.values()];
    }
}

/**
 * @param {ChatSendBeforeEvent} ev 
 * @param {Map<string, Command>} commands 
 */
function handleChatCommand(ev, commands) {
    const { sender, message } = ev;
    const args = message.trim().split(/\s+/);
    const commandKey = args.shift();

    if (commands.has(commandKey)) {
        const command = commands.get(commandKey);
        const executed = command.executeCommand(args, sender);

        if (executed) {
            ev.cancel = true;
        }
    }
}

/**
 * @param {ScriptEventCommandMessageAfterEvent} ev 
 * @param {Map<string, Command>} commands 
 */
function handleScriptEventCommand(ev, commands) {
    const { id, message, initiator, sourceEntity, sourceBlock } = ev;
    const args = message.trim().split(/_s+/);

    if (commands.has(id)) {
        const command = commands.get(id);

        command.executeScriptCommand(args, initiator, sourceEntity, sourceBlock);
    }
}

const commandManager = new CommandManager();
export default commandManager;
