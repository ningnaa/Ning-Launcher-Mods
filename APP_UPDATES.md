# 启动器应用更新提示

从柠版启动器 0.4.10 起，启动器每次启动检查一次根目录 `app-update.json`。
Gitee 镜像优先，失败或内容无效时回退 GitHub。仅远端 `versionCode` 高于
已安装版本且 `enabled` 为 `true` 时弹出提示，返回频道或后台恢复不会重复检查。
提示不强制更新、不下载或安装 APK；按钮使用启动器内置的 QQ 频道入口。

发布后续应用版本时：

1. 先在现有 QQ 频道提供正式安装包。
2. 将 `versionCode`、`versionName` 更新为该包 `version.properties` 中的值，填写简短的 `notes`。
3. 推送 GitHub 并同步 Gitee，核验两边公开文件一致。不要改动模组 `index.json`。
4. 如需撤回提示，将 `enabled` 改为 `false` 后同步双源。

应用标识保持 `com.bunnyloader.mods`；`format` 保持 1。此文件不包含下载地址、
频道凭证或账户信息。不要发布不存在的更高版本来测试提示。

首次接入的版本为 0.4.10（399），安装该版本不会提示自己更新。旧版 0.4.9
及之前尚无应用检查功能，需要先手动更新一次。
