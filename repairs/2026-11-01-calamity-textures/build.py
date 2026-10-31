"""Repair the pinned user-supplied PC pack without changing its artwork.

python -X utf8 tools/mods/repairs/calamity-boss-textures/build.py SOURCE_ZIP OUTPUT_DIR
Requires Pillow only for lossless GIF-to-PNG encoding, not image generation.
"""
from pathlib import Path, PurePosixPath
import hashlib
import io
import json
import sys
import uuid
import zipfile
from PIL import Image

SOURCE_SHA256 = '997b2ea3f55de7724d4c8afa9d2826ad2387337e95efff1a032f69782f6f621d'
FIXED = ('Content/Images/Projectile_102.png', 'Content/Images/Projectile_83.png')
RENAMED = {
    'Content/Images/Arm_Bone_2 - 副本.png': 'content/Images/Arm_Bone_2 - copy.png',
    'Content/Images/三王.zip': 'source/three-bosses.zip',
}


def build(source, output):
    raw = source.read_bytes()
    assert hashlib.sha256(raw).hexdigest() == SOURCE_SHA256, 'Unexpected source archive'
    with zipfile.ZipFile(io.BytesIO(raw)) as z:
        assert z.testzip() is None
        original = {}
        for info in z.infolist():
            n = info.filename
            assert not PurePosixPath(n).is_absolute() and '..' not in PurePosixPath(n).parts
            assert n not in original
            if not info.is_dir(): original[n] = z.read(n)
    pc = json.loads(original['pack.json'].decode('utf-8-sig'))
    workshop = json.loads(original['workshop.json'].decode('utf-8-sig'))
    assert pc['Author'] == '令狐e' and workshop['SteamEntryId'] == 3747656042
    uid = str(uuid.UUID(bytes=hashlib.md5(b'steam-workshop:3747656042').digest(), version=3))
    assert uid == '9921213c-03a8-34b4-914c-ba26bcc23ebd'
    files, changed = {}, []
    for name, data in original.items():
        target = RENAMED.get(name, 'content/' + name[8:] if name.startswith('Content/') else name)
        if name in FIXED:
            image = Image.open(io.BytesIO(data))
            assert image.format == 'GIF' and image.n_frames == 1
            pixels = image.convert('RGBA')
            buffer = io.BytesIO(); pixels.save(buffer, format='PNG', compress_level=9)
            data = buffer.getvalue()
            with Image.open(io.BytesIO(data)) as decoded:
                assert decoded.format == 'PNG' and decoded.size == pixels.size
                assert decoded.convert('RGBA').tobytes() == pixels.tobytes()
            changed.append({'source': name, 'target': target, 'size': list(pixels.size),
                            'beforeSha256': hashlib.sha256(original[name]).hexdigest(),
                            'afterSha256': hashlib.sha256(data).hexdigest(),
                            'decodedPixelsUnchanged': True})
        assert target not in files
        files[target] = data
    assert len(changed) == 2
    for name, data in files.items():
        if name.lower().endswith('.png'):
            assert data.startswith(b'\x89PNG\r\n\x1a\n'), name
            with Image.open(io.BytesIO(data)) as image: image.verify()
    manifest = {
        'uid': uid, 'id': 'texture-' + uid, 'name': pc['Name'], 'version': '1.2.0-fix.1',
        'author': '令狐e', 'type': 'texture', 'category': '材质', 'blVersion': 2,
        'description': pc['Description'], 'license': '', 'updated': '2026-11-01',
        'localizedNames': {'zh-Hans': pc['Name']},
        'localizedSummaries': {'zh-Hans': '将机械三王替换为灾厄风格外观；修复两张弹幕图片编码错误。原作者：令狐e。'},
        'links': [{'title': '原包记录的 Steam Workshop 页面', 'url': 'https://steamcommunity.com/sharedfiles/filedetails/?id=3747656042'}],
        'repairEdition': {'revision': 1, 'parentVersion': '1.2.0', 'parentSha256': SOURCE_SHA256,
                          'sourceFormat': 'Terraria PC resource-pack ZIP'},
    }
    files['manifest.json'] = (json.dumps(manifest, ensure_ascii=False, indent=2)+'\n').encode()
    # Reuse an existing boss-head image verbatim as the catalog icon.
    files['icon.png'] = original['Content/Images/NPC_Head_Boss_15.png']
    description = '''# 灾厄Boss外观

**原作者：令狐e。**

将毁灭者替换为神明吞噬者风格、双子魔眼替换为 XS-01 阿尔忒弥斯和 XS-03 阿波罗风格、机械骷髅王替换为 XF-09 阿瑞斯风格。此包替换外观，不加入灾厄模组的 Boss 行为。

## 兼容修复

原包 Projectile_102.png、Projectile_83.png 实际为单帧 GIF，Unity 无法按当前图片加载方式解码。修复版仅将这两个文件重新编码为真正的 RGBA PNG，尺寸、透明度及解码后的像素保持一致。

保留本地导入原包时生成的 UID，可更新覆盖原 1.2.0。导入或在线安装后，启用材质包并完全重启游戏。

中文副本文件改用兼容发布工具的英文文件名；原内嵌“三王.zip”移至 source/three-bosses.zip，字节不变，不作为运行入口。原 PC 本地化 CSV 保留，但当前材质加载器只保证图片替换，不承诺应用 PC 语言资源。

## 署名与来源

原作者为令狐e；本分支仅进行图片编码修复与目录打包。pack.json、workshop.json 和其余原始文件均保留，路径变动见 source/repair.json。目录图标直接复用原包 Boss 头像，没有生成新美术。

原包没有附带独立许可证，标记为“未声明”，不补写或推定 MIT 等许可。
'''
    files['description_zh-Hans.md'] = description.encode()
    files['changelog_zh-Hans.md'] = ('## 1.2.0-fix.1（2026-11-01）\n\n修复 Projectile_102.png 与 Projectile_83.png 的实际 GIF 编码，转为真正 PNG；保留原始像素、尺寸、透明度、作者令狐e及导入 UID。\n').encode()
    record = {'sourceSha256': SOURCE_SHA256, 'sourceFile': source.name, 'author': '令狐e',
              'uid': uid, 'id': manifest['id'], 'version': manifest['version'], 'parentVersion': '1.2.0',
              'changedImages': changed, 'renamedFiles': RENAMED,
              'contentDirectoryNormalized': 'Content/ -> content/',
              'iconSource': 'Content/Images/NPC_Head_Boss_15.png', 'originalFileCount': len(original)}
    files['source/repair.json'] = (json.dumps(record, ensure_ascii=False, indent=2)+'\n').encode()
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for name, data in sorted(files.items()):
            info = zipfile.ZipInfo(name, (2026,11,1,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED
            info.external_attr=0o100644 << 16;z.writestr(info,data)
    output.mkdir(parents=True,exist_ok=True)
    target = output / (manifest['id']+'-'+manifest['version']+'.bl')
    result=buffer.getvalue()
    assert not target.exists() or target.read_bytes()==result, 'Refusing to overwrite an immutable package'
    target.write_bytes(result)
    record.update(file=target.name,sha256=hashlib.sha256(result).hexdigest(),size=len(result))
    (output/'repair.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(record,ensure_ascii=False,indent=2))

if __name__ == '__main__': build(Path(sys.argv[1]),Path(sys.argv[2]))
