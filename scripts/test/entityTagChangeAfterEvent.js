import { Player } from "@minecraft/server";
import entityTagChangeAfterEvent from "../events/entityTagChangeAfterEvent";

entityTagChangeAfterEvent.subscribe(ev => {
    const { entity, tags, addTags, removeTags } = ev;

    if (entity instanceof Player) {
        entity.sendMessage([
            `addTags: ${JSON.stringify(addTags)}`,
            `removeTags: ${JSON.stringify(removeTags)}`,
            `tags: ${JSON.stringify(tags)}`
        ].join("\n"));
    }
});