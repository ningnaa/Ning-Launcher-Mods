# 更新日志

## 1.1.0

- 设置中新增**手持物品职业（Held Item Class）**区域：手持模组伤害职业的武器，即可在菜单中查看和修改物品提示、伤害及暴击颜色。**模组默认（Mod Defaults）**可恢复模组注册的配色。
- 设置支持 12 种语言，并采用更简短的标签。

## 1.0.1

- 其他模组通过 `Call('AddDamageType', ...)` 传入的配色即使较晚到达也会生效；只有玩家手动修改的颜色会覆盖它们。

## 1.0.0

- 将 tModLoader 的 *Colored Damage Types* 移植到 Bunny Loader。
- 将原作的四组设置整合到同一页面，天界柱配色预设改为按钮。
- 其他模组伤害职业的配色保存在 `CrossModDamageTypes.json` 中。
