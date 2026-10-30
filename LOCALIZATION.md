# 汉化说明

本次汉化面向柠版启动器的在线目录：66 个资源包的名称、简介、分类、详情、作者职责和链接标题，以及 37 份已有更新日志和物品展示基座的合成页。安装包内容及其下载哈希不因目录翻译而改变。

## 译文来源优先级

1. 原作者或移植维护者随对应版本发布的中文文本。已有中文说明直接复用，避免重新翻译后与模组界面不一致。
2. 模组发布包中的 `content/Localization/zh-Hans.json` 等中文语言文件，用于核对物品、NPC、按钮和机制名称。
3. 原作者公开仓库中的中文资料；只引用与当前 Bunny 移植版有关的术语，不将电脑版独有功能写成移植版能力。
4. 缺少上述中文文本时，依据本版本原文，在泰拉瑞亚的游戏语境中翻译。

“随包中文”可能来自原作者，也可能来自移植维护者；不一概称为 Re-Logic 官方翻译。未在包内找到中文资源，也不代表互联网上不存在其他译本。本次目录译文不等同于将各模组游戏内所有物品、对话和菜单重新汉化。

## 已复用的中文说明

以下 8 个包的中文说明和更新日志直接取自当前发布包：

- Boss Checklist
- Flat Seed
- Gnorp's Builder
- Physaria / Kinetic Gore
- Player Ping UI
- Teleport Keeper
- Universal Map
- WorldGen Previewer

另有模组提供中文语言文件，共计 28 个包有可核对的中文资源。每个条目的原包链接、SHA-256、中文文件路径及复用情况，记录在 [localization-sources.json](localization-sources.json)。

## 术语约定

| 原文或概念 | 本目录用语 | 依据 |
|---|---|---|
| Goblin Tinkerer / reforge | 哥布林工匠 / 重铸 | 泰拉瑞亚游戏语境 |
| Corruption / Crimson / Hallow | 腐化 / 猩红 / 神圣之地 | 泰拉瑞亚生物群系用语 |
| Display Base | 展示基座 | 对应发布包的中文物品名称 |
| Holy Hand Grenade | 神圣手雷 | Consolaria 发布包的中文物品名称 |
| Universal Map | 通用地图 | 发布包的中文配置标题 |
| NPC Unlock Announcer | NPC 入住公告 | 发布包的中文配置标题 |
| Bloom | 外发光 | Lights And Shadows 发布包的中文设置标签 |
| Nebula boosters | 星云强化焰 | [官方中文泰拉瑞亚 Wiki：强化](https://terraria.wiki.gg/zh/wiki/强化?variant=zh) |

东方角色模组优先采用包内已有的人名、召唤物名称与术语。没有中文的条目采用对应作品和泰拉瑞亚的常用语境，不把 API、物品内部标识或配方材料名称机械直译成不相关词语。

## 保留与验证

- 保留 `uid`、`id`、版本、入口、依赖、下载地址、大小和 SHA-256。
- 保留作者姓名、头像、个人链接、版权和许可证原文。
- Markdown 中的代码、API、命令、物品 ID、颜色标记和资源路径保持可用。
- 中文详情使用独立文件，并列入 `index.json` 的 `files`，让已有英文缓存的设备也能下载中文。
- 原始英文或葡萄牙语说明仍在对应目录，便于对照和后续更新。

已安装同版本模组的目录译文展示，需要使用带目录翻译兼容修复的柠版启动器；不会修改本地模组代码或存档。
