## 目次
1. [commandHandler](#anchor1)
2. [playerDropBeforeEvent](#anchor2)
3. [playerMoveBeforeEvent](#anchor3)

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

    ev.cancel = true;
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
