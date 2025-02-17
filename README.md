## 目次

1. [CommandManager](#anchor1)
2. [playerDropBeforeEvent](#anchor2)
3. [playerMoveAfterEvent](#anchor3)
4. [playerFishingAfterEvent](#anchor4)
5. [playerRideAfterEvent](#anchor5)
6. [playerGetOffAfterEvent](#anchor6)
7. [playerXpChangeAfterEvent](#anchor7)
8. [entityTagChangeAfterEvent](#anchor8)
9. [playerUseChestBeforeEvent](#anchor9)
10. [playerUseChestAfterEvent](#anchor10)

<a id="anchor1"></a>

# 1. CommandManager

コマンドを設定します

```javascript
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
```

コマンドをチェックします

```javascript
test1Command.onCommand((args, player) => {
    // process
});

test1Command.onScriptCommand((args, initiator, entity, block) => {
    // process
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

# 3. playerMoveAfterEvent

プレイヤーが動いた時に呼び出されます

```javascript
playerMoveAfterEvent.subscribe(ev => {
    const { player, keys, device, firstKeys } = ev;

    player.onScreenDisplay.setActionBar(`押されたキー ${keys.join(", ")}`);
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

# 5. playerRideAfterEvent

プレイヤーがエンティティに乗ったときに呼び出されます

```javascript
playerRideAfterEvent.subscribe(ev => {
    const { player, entity } = ev;

    player.sendMessage(`${entity.typeId}`);
});
```

<a id="anchor6"></a>

# 6. playerGetOffAfterEvent

プレイヤーがエンティティから降りた時に呼び出されます

```javascript
playerGetOffAfterEvent.subscribe(ev => {
    const { player, entity } = ev;

    player.sendMessage(`${entity.typeId}`);
});
```

<a id="anchor7"></a>

# 7. playerXpChangeAfterEvent

プレイヤーのXPに変化が起きた時に呼び出されます

```javascript
playerXpChangeAfterEvent.subscribe(ev => {
    const { player, xp } = ev;

    world.sendMessage("§e" + player.name + `: ${xp}`); 
});
```

<a id="anchor8"></a>

# 8. entityTagChangeAfterEvent

エンティティのタグに変化が起きた時に呼び出されます

```javascript
entityTagChangeAfterEvent.subscribe(ev => {
    const { entity, tags, addTags, removeTags } = ev;

    entity.sendMessage(`tag - ${tags}`);
    entity.sendMessage(`add - ${addTags}`);
    entity.sendMessage(`remove - ${removeTags}`);
});
```

<a id="anchor9"></a>

# 9. playerUseChestBeforeEvent

プレイヤーがチェストを使用した時に呼び出されます

```javascript
playerUseChestBeforeEvent.subscribe(ev => {
    const { player, interactBlock, isLarge, chestPair } = ev;

    if (isLarge) {
        ev.cancel = true;
    }
});
```

<a id="anchor10"></a>

# 10. playerUseChestAfterEvent

プレイヤーがチェストを使用した時に呼び出されます

```javascript
playerUseChestAfterEvent.subscribe(ev => {
    const { player, interactBlock, isLarge, chestPair } = ev;
});
```
