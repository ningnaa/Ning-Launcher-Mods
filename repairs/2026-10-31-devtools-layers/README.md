修复开发者工具在 DrawSelf 绘制过程中向正在遍历的界面层列表插入内容，导致 `DrawInterface: Collection was modified; enumeration operation may not execute` 的问题。

版本：1.0.1-ningzh.1.fix.2。改为在 DrawInterface 遍历开始前插入界面层；游戏重建列表后恢复工具层，不重复插入。保留 fix.1 的纹理/UI 初始化修复。

验证：旧包源码回归复现同一异常；修复版通过首次绘制、连续 100 帧、列表重建回归。当前雷电模拟器以用户原模组组合、人物和世界副本进入游戏，工具栏展开与保存退出正常，未再记录该异常。原始 11 个存档文件逐字节不变。此结果不代表所有真机和模组组合。

原作者 GST378 署名、原包许可声明、UID、中文和素材均保留。请更新“开发者工具”并重启游戏，无需重装 APK。

SHA-256：273926a05c6da4a1d98585eaa11fff34caccefbf5be47f2cf082db552a801133
