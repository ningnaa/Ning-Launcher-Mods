# Boss Checklist

追踪你世界中的每个Boss、小Boss和事件。Boss Log 是一本记录你全部进度的书：如何召唤每个条目、它会掉落什么、你的战斗表现如何。布局与PC版模组相同，并为触屏而设计。

## 打开 Boss Log

- **触控按钮**：在游戏的操控编辑器中把 **Boss Log** 和 **Boss Checklist** 动作加入你的操控（设置 > 操控，自定义布局，编辑：模组动作位于栏位动作列表的末尾）。每个按钮可打开和关闭对应的界面。
- 打开 Boss Log 或清单会关闭物品栏（以及另一个界面）。点击书本外部，或打开物品栏、地图或暂停菜单即可关闭它们。

## 触控操作

| 手势 | 作用 |
| --- | --- |
| 点击 | 打开页面、选择标签、切换筛选或固定物品说明。 |
| 按住手指 | 显示手指下方内容的说明，以及目录条目的头像图标。按住半秒即可不点击地阅读。 |
| 长按 | PC版的右键：将目录条目标记为已击败或取消标记、比较某个记录类别、隐藏经典清单中的条目；开启**重置选项**后，可清除标记、隐藏条目、物品和记录。 |
| 拖动 | 滚动列表和长文本。 |
| 向左或向右滑动 | 翻页。 |

## 书本

- **目录**：困难模式前后的清单，带勾选标记、高亮显示下一个条目以及进度条（点击进度条可在条目类型和模组之间切换）。左侧的标签可打开Boss、小Boss和事件的筛选，以及选择隐藏哪些条目的隐藏列表。
- 右上角的**指示器**可切换"仅Boss"、自动清单和渐进模式。
- **条目页面**：肖像、头像图标和三个子页面：
  - **召唤信息**：如何召唤、召唤物品及其配方（含材料和制作站）。
  - **战利品与收藏品**：宝藏袋、圣物、宠物、纪念章、面具、八音盒、专家物品以及所有掉落物。已获得的物品会被勾选，大师专属、专家专属和锁定的物品会被标注。
  - **记录**：上一次尝试、首次胜利、个人最佳，以及多人模式下的世界记录：战斗时间、受到的攻击次数和击杀/死亡。小Boss显示你的击杀数，事件显示其旗帜。
- **渐进模式**会隐藏你尚未击败的内容的名称和页面，让你可以盲玩。第一次打开书本时会询问你。
- **制作人员**列出原作贡献者以及所有注册了条目的模组。

## 其他功能

- **经典清单**：右侧的紧凑面板，显示清单。点击条目可查看召唤方法，点击**更多信息**可在 Boss Log 中打开其页面；长按可隐藏该条目。
- **Boss雷达**：屏幕边缘的箭头指向屏幕外的Boss。
- **地图上的物品**：宝藏袋和月亮碎片（以及可选的暗影鳞片和组织样本）会显示在地图上。
- **聊天消息**：当Boss离开、当骷髅王之手或天界柱等部分被击败、以及月亮事件结束时。
- **复活音效**：在复活倒计时的最后3秒播放。
- 所有功能都可以在模组的两个配置中开启或关闭。

## 给模组作者

其他模组可以通过 `Call` 添加条目，使用与原版模组相同的消息：`LogBoss`、`LogMiniBoss`、`LogEvent`、`SubmitEntryLoot`、`SubmitEntryCollectibles`、`SubmitEntrySpawnItems`、`SubmitEventNPCs` 和 `GetBossInfoDictionary`。添加数据的调用必须在 `AddRecipes` 之前进行（在 `PostSetupContent` 中）。

```js
const ref = new Ref();
if (ModLoader.TryGetMod('bosschecklist', ref)) {
    ref.value.Call('LogBoss', bl.mod, 'MyBoss', 5.5, () => MyWorld.downedMyBoss, [ModContent.NPCType(MyBoss)], {
        spawnItems: [ModContent.ItemType(MySummon)],
        collectibles: [ModContent.ItemType(MyTrophy)],
        spawnInfo: 'Use [i:' + ModContent.ItemType(MySummon) + '] at night.',
    });
}
```

`GetEntry`（使用条目键，如 `Terraria KingSlime`）和 `IsDowned` 返回单个条目。
