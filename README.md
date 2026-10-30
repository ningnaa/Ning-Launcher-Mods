# 柠版启动器模组目录

供柠版启动器（Android 包名 `com.bunnyloader.mods`）读取的独立在线目录。

本仓库克隆自 [JonataOliveiraa/Bunny-Loader-Mods](https://github.com/JonataOliveiraa/Bunny-Loader-Mods)，保留原 Git 历史和作者署名。初始快照为 `babecd0df5efecbe5ca14b7233e458ce06307d1f`，复制了该快照索引引用的 66 个包；每个包均校验大小与 SHA-256，未修改包内内容。历史 Git 标签保留，但本次不复制索引之外的历史 Release 资产。

## APK 数据源

- 索引：<https://raw.githubusercontent.com/ningnaa/Ning-Launcher-Mods/main/index.json>
- 页面、图标和封面：本仓库 `main` 分支的 `mods/<uid>/`。
- 安装包：本仓库的 GitHub Releases；索引中的全部下载地址已指向这里。
- 下载统计：`stats.json`，由原有 Download stats 工作流更新，统计本仓库的下载量，从零开始。

APK 不需要 GitHub 登录或令牌。这个仓库与上游独立维护，不会自动同步上游新版本。

## 目录结构

- `index.json`：启动器读取的目录索引。
- `mods/<uid>/`：每个资源包的展示页面，包含清单、图标、封面、说明和作者信息。
- Releases `mod-<id>-v<version>`：可下载安装的 `.bl` 包。
- `ports/`：移植材质包和字体包的来源文件。
- `localization-sources.json`：各条目中文译文的来源与核对记录。

每个模组、材质包和字体包都归各自作者所有，并保留自身许可证及署名，详见包内的 `license.md` 和 `authors/`。Bunny Loader 的许可证不替代这些资源包自身的许可。

如果你是目录中某项内容的作者，希望移除内容或调整署名，请在本仓库提交 Issue。

## 中文本地化

66 个在线条目提供中文名称、简介、分类和详情；有更新日志的条目同时提供中文更新日志。启动器使用 `localizedNames["zh-Hans"]`、`localizedSummaries["zh-Hans"]`、`description_zh-Hans.md` 和 `changelog_zh-Hans.md` 读取中文，原始名称和原文文件保留。

汉化遵循**作者发布的中文优先，缺少时采用泰拉瑞亚语境翻译**的原则。已复用 8 个发布包自带的中文说明与更新日志，并参照 28 个发布包中的中文资源核对术语。来源、适用范围和示例见 [汉化说明](LOCALIZATION.md)。

## 更新模组

先上传新的 `.bl` 到对应 `mod-<id>-v<version>` Release，再更新索引中的版本、下载地址、字节数及 SHA-256，以及 `mods/<uid>/` 的展示文件。发布顺序应保证索引指向已经可下载的文件。使用上游发布工具时，必须先将目标仓库配置为 `ningnaa/Ning-Launcher-Mods`。
