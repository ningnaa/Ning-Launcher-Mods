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

- `index.json`: the list the app reads.
- `mods/<uid>/`: each mod's page (manifest, icon, banner, description, authors).
- Releases `mod-<id>-v<version>`: the `.bl` packages.
- `ports/`: the sources of the ported texture packs.

Each mod and texture pack belongs to its authors and keeps its own license (`license.md` and `authors/` inside the package). Bunny Loader's license does not apply to them.

If you made something listed here and want it removed or credited differently, open an issue.

## 更新模组

先上传新的 `.bl` 到对应 `mod-<id>-v<version>` Release，再更新索引中的版本、下载地址、字节数及 SHA-256，以及 `mods/<uid>/` 的展示文件。发布顺序应保证索引指向已经可下载的文件。使用上游发布工具时，必须先将目标仓库配置为 `ningnaa/Ning-Launcher-Mods`。
