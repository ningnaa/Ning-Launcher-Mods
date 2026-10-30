# 武器外显精简版

将 **Flashkirby** 制作的 tModLoader 模组 *Weapon Out Lite* 移植到 **Bunny Loader**，沿用 MIT 许可证。未使用物品时，手持物品会展示在角色身上：剑挂在腰间，斧与步枪背在身后，弓放在肩上，书与法杖由另一只手拿着，魔法媒介则悬浮在身旁。攻击或受伤后，角色会保持数秒适合该类武器的**战斗姿势**，随后以动画收起物品。

安装模组的其他玩家也能看到你展示的物品。

## 工作方式

根据像素图尺寸、使用方式和伤害职业，将每个物品归入一个**分组**，例如近战武器、长矛、悠悠球、弓、手枪、自动枪械、法杖、书、药水、大型物品或巨型物品。每组都有自己的**姿势**，共 58 种可选，从背负姿势到栓动步枪战斗姿势。

## 选项

在暂停菜单的**模组配置**中可以设置：

- 模组启用、显示物品、战斗姿势持续时间、始终保持战斗姿势或受伤时进入战斗姿势。
- 每个分组的姿势，包括物品、工具、近战、远程、魔法和巨型物品。
- 物品物理、收起动画、修饰语缩放、区分单手与双手武器的尺寸阈值，以及巨型物品尺寸。
- 在角色选择菜单显示物品，以及使用弹幕像素图显示小型悠悠球和大型长矛。
- 针对手持物品的**下一组**、**旋转图像**和**清除自定义**按钮。若其他模组的物品显示方向不对，请手持它并反复点击**旋转图像**，直到方向正确；旋转设置会按物品保存。

## `/wo` 命令

电脑版背包中的眼睛按钮，在移动版中改为聊天命令 `/wo`：

| 命令 | 功能 |
|---|---|
| `/wo` | 显示或隐藏手持物品。 |
| `/wo next` | 将手持物品切换到下一分组。 |
| `/wo pose <name>` | 强制指定手持物品姿势，例如 `/wo pose FloatingBack`。 |
| `/wo turn` | 将手持物品图像旋转 90°，并按物品保存。 |
| `/wo clear` | 清除手持物品的自定义设置。 |
| `/wo reset` | 重置所有自定义设置。 |
| `/wo info` | 查看手持物品的分组与姿势。 |
| `/wo poses` | 查看姿势名称。 |

原版 Bunny Loader 的自定义设置保存在 `Android/data/com.bunnyloader/mod_data/<uid>/ItemOverrides.json`。柠版启动器的包名为 `com.bunnyloader.mods`，对应路径为 `Android/data/com.bunnyloader.mods/mod_data/<uid>/ItemOverrides.json`。物品以游戏内部名称记录，例如 `EmpressBlade` 或 `mod/Item`。

## 与其他模组联动

从 `PostSetupContent` 阶段起，可以通过 `Call` 使用原版 API：

```js
const wo = ModLoader.GetMod('weaponoutlite');
wo.Call('RegisterSpear', ModContent.ItemType(MySpear));           // or RegisterBow, RegisterGun, RegisterStaff...
wo.Call('RegisterItemHoldPose', ModContent.ItemType(MyItem), 'FloatingOffHandAimed');
wo.Call('HidePlayerHeldItem', player.whoAmI);                      // hides it this frame
wo.Call('RegisterItemSpriteTurn', ModContent.ItemType(MySpear), 90); // turns the sprite (0, 90, 180, 270); a player's saved turn wins
```

`RegisterCustomItemStyle` 配合 `RegisterCustomDrawDepth`、`RegisterCustomUpdateIdleBodyFrame` 和 `RegisterCustomPreDrawData`，可以自定义物品绘制。在 `RegisterCustomPreDrawData` 中，`data` 与原版 `DrawData` 类似，包含 `position`、`origin`、`rotation`、`texture`、`sourceRect`、`color`、`scale`、`effect` 以及 `move(x, y)`。

## 与原作的差异

- 没有电脑版设置页面的动态预览，通过名称选择姿势。
- 未包含对其他模组反向箭头的检测，以及实验性挥动效果。
- 角色在床上睡觉时不显示物品。
- 电脑版模组联动，如灾厄、瑟银和 Overhaul 等，不适用于此移植版。

支持英语、葡萄牙语、西班牙语、法语、德语、意大利语、波兰语、俄语、简体中文、繁体中文、日语和韩语。
