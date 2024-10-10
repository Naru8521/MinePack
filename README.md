## 目次

1. [commandHandler](#anchor1)
2. [playerDropBeforeEvent](#anchor2)
3. [playerMoveBeforeEvent](#anchor3)
4. [playerFishingAfterEvent](#anchor4)
5. [playerRideAfterEvent](#anchor5)
6. [playerGetOffAfterEvent](#anchor6)

<a id="anchor1"></a>

# 1. commandHandler

コマンドのprefixとidを設定します。

```javascript
const commandConfig = {
    prefix: "",
    id: "a:b"
};
```

コマンドを設定します

```javascript
const commands = [
    {
        name: "test1",
        description: "test1"
    },
    {
        name: "test2",
        description: "test2",
        tags: ["op"],
        subCommands: [
            {
                name: "test3",
                description: "test3"
            }
        ]
    }
];
```

コマンドを初期化します

```javascript
const commandHandler = new CommandHandler(commandsPath, commandConfig, commands);
```

チャットコマンドをチェックします

```javascript
world.beforeEvents.chatSend.subscribe(ev => {
    commandHandler.check(ev);
});
```

<a id="anchor2"></a>

# 2. playerDropBeforeEvent

プレイヤーがアイテムをドロップしたときに呼び出されます

```javascript
playerDropBeforeEvent.subscribe(ev => {
    const { player, slot, oldItemStack, newItemStack, container } = ev;

    player.sendMessage(`ドロップされたスロット: ${slot}`);
    player.sendMessage(`ドロップ前のアイテム: ${oldItemStack.typeId}`);
    player.sendMessage(`ドロップ後のアイテム: ${newItemStack ? newItemStack.typeId : "minecraft:air"}`);
    
    // ev.cancel = true;
});
```

<a id="anchor3"></a>

# 3. playerMoveBeforeEvent

プレイヤーが動いた時に呼び出されます

```javascript
playerMoveBeforeEvent.subscribe(ev => {
    const { player, keys } = ev;

    player.onScreenDisplay.setActionBar(`押されたキー ${keys.join(", ")}`);

    ev.cancel = true;
});
```

<a id="anchor4"></a>

# 4. playerFishingAfterEvent

プレイヤーが釣りをした時に呼び出されます

```javascript
playerFishingAfterEvent.subscribe(ev => {
    const { player, itemStack, itemEntity, result } = ev;

    player.sendMessage(`釣りに成功: ${result}`);
    player.sendMessage(`釣れたアイテムID: ${itemStack ? itemStack.typeId : ""}`);
    player.sendMessage(`釣れたアイテムエンティティ: ${itemEntity ? itemEntity.typeId : ""}`);
    player.sendMessage(`釣ったプレイヤー: ${player.name}`);
});
```

<a id="anchor5"></a>

# 4. playerRideAfterEvent

プレイヤーがエンティティに乗ったときに呼び出されます

```javascript
playerRideAfterEvent.subscribe(ev => {
    const { player, entity } = ev;

    player.sendMessage(`${entity.typeId}`);
});
```

<a id="anchor6"></a>

# 4. playerGetOffAfterEvent

プレイヤーがエンティティから降りた時に呼び出されます

```javascript
playerGetOffAfterEvent.subscribe(ev => {
    const { player, entity } = ev;

    player.sendMessage(`${entity.typeId}`);
});
```