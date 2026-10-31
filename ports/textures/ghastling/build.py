"""Build the pinned Ghastling PC resource pack for Bunny Loader.

Usage: python -X utf8 tools/mods/ports/ghastling.py SOURCE_ZIP OUTPUT_DIRECTORY
Preserves original assets and archives the original Chinese language table before adding translations.
"""
from pathlib import Path, PurePosixPath
import hashlib
import json
import sys
import uuid
import zipfile
import io

SOURCE_SHA256 = '59878dc840c704e80e8354bf9a1f814b6acc8add9580426a589a430b48899b9a'


def build(source, out):
    raw=source.read_bytes()
    assert hashlib.sha256(raw).hexdigest()==SOURCE_SHA256, 'Unexpected source ZIP'
    with zipfile.ZipFile(io.BytesIO(raw)) as z:
        assert z.testzip() is None
        original={}
        for entry in z.infolist():
            n=entry.filename
            assert not PurePosixPath(n).is_absolute() and '..' not in PurePosixPath(n).parts
            assert n not in original
            if not entry.is_dir():original[n]=z.read(n)
    pc=json.loads(original['pack.json'].decode('utf-8-sig'),strict=False)
    workshop=json.loads(original['workshop.json'].decode('utf-8-sig'))
    assert pc['Author']=='Pixivic' and workshop['SteamEntryId']==3631710750
    uid=str(uuid.UUID(bytes=hashlib.md5(b'steam-workshop:3631710750').digest(),version=3))
    url='https://steamcommunity.com/sharedfiles/filedetails/?id=3631710750'
    manifest={
        'uid':uid,'id':'texture-'+uid,'name':'萌萌恶魂','version':'1.0.0-port.2',
        'type':'texture','category':'材质','blVersion':2,'updated':'2026-11-01',
        'author':'Pixivic','authors':[{'name':'Pixivic','role':'原作者','link':url},{'name':'流脌','role':'移植者'}],
        'description':'将阿比盖尔替换为萌萌恶魂外观，并替换召唤物品、增益图标和花朵贴图。附带原版音效替换与中文名称、说明。正式版 0.4.14 仅应用贴图；音效及文字需要启动器支持资源包音效与语言替换。',
        'localizedNames':{'zh-Hans':'萌萌恶魂'},
        'localizedSummaries':{'zh-Hans':'阿比盖尔与相关物品的萌萌恶魂外观；原作者 Pixivic，移植者流脌。附带音效与中文名称资源。'},
        'license':'','links':[{'title':'原包记录的 Steam Workshop 页面','url':url}],
        'portEdition':{'revision':2,'baseVersion':'1.0.0','originalName':pc['Name'],'sourceSha256':SOURCE_SHA256,'porter':'流脌'},
    }
    files={('content/'+n[8:] if n.startswith('Content/') else n):data for n,data in original.items()}
    original_zh='content/Localization/zh-Hans.json'
    files['source/original/'+original_zh]=files[original_zh]
    chinese={
        'ItemName':{'AbigailsFlower':'史蒂夫的雪球'},
        'BuffName':{'AbigailMinion':'萌萌恶魂'},
        'BuffDescription':{'AbigailMinion':'萌萌恶魂会为保护你而战'},
        'ItemTooltip':{'AbigailsFlower':'来自另一个世界的雪球\n召唤一只方块幽灵为你而战'},
    }
    files[original_zh]=(json.dumps(chinese,ensure_ascii=False,indent=2)+'\n').encode()
    files['manifest.json']=(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n').encode()
    files['description_zh-Hans.md']='''# 萌萌恶魂

**原作者：Pixivic · 移植者：流脌**

原包名称：Ghastling as Abigail。

替换阿比盖尔召唤物、阿比盖尔的花、对应增益图标及花朵地形贴图，使其呈现萌萌恶魂主题外观。提供贴图、音效和中文名称资源，不改变原版召唤与战斗机制。

## 当前适配范围

- 替换召唤物、物品、增益和花朵的 4 张贴图。
- 附带召唤、攻击、叫声和强化的 8 个原始音效。
- 召唤物品显示为“史蒂夫的雪球”，增益显示为“萌萌恶魂”，附带中文说明。
- 正式版 0.4.14 仅应用贴图。音效和游戏内文字需要支持资源包音效与语言替换的启动器；不支持时保留原版声音和文字。
- 启用或关闭后完全重启游戏；使用阿比盖尔的花召唤。关闭后恢复原版外观、声音和文字。

包内保留 pack.json、workshop.json、原作者署名及全部原始资源。新增简体中文译文；原中文语言表保存在 source/original/ 中。原包没有附带独立许可证，标记为未声明，不推定其他许可。
'''.encode()
    files['changelog_zh-Hans.md']='''## 1.0.0-port.2（2026-11-01）

统一中文包名，补充召唤物品、增益和提示的简体中文，保留原始音效及语言资源。音效与游戏内文字需要启动器支持资源包音效与语言替换；正式版 0.4.14 仍仅显示贴图。

## 1.0.0-port.1（2026-11-01）

加入 Bunny Loader 在线材质目录，保留原作者 Pixivic，移植者标注为流脌。应用 4 张图片，保留原 PC 音效及语言资源，明确当前附带音效与中文名称资源。
'''.encode()
    record={'sourceFile':source.name,'sourceSha256':SOURCE_SHA256,'originalName':pc['Name'],
            'author':'Pixivic','porter':'流脌','uid':uid,'id':manifest['id'],'version':manifest['version'],
            'originalFileCount':len(original),'modifiedOriginalFiles':[{'runtime':'content/Localization/zh-Hans.json','original':'source/original/content/Localization/zh-Hans.json','reason':'Supplementary Simplified Chinese translation'}],
            'runtimeImages':['Buff_335.png','Item_5114.png','Projectile_963.png','Tiles_624.png'],
            'resourceSounds':8,'languageKeys':4,'requiresCapabilities':['resource-pack-pcm-xnb','resource-pack-localization-json'],'released014Support':'images-only'}
    files['source/port.json']=(json.dumps(record,ensure_ascii=False,indent=2)+'\n').encode()
    buffer=io.BytesIO()
    with zipfile.ZipFile(buffer,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for name,data in sorted(files.items()):
            entry=zipfile.ZipInfo(name,(2026,11,1,0,0,0));entry.compress_type=zipfile.ZIP_DEFLATED
            entry.external_attr=0o100644<<16;z.writestr(entry,data)
    out.mkdir(parents=True,exist_ok=True);target=out/(manifest['id']+'-'+manifest['version']+'.bl')
    data=buffer.getvalue()
    assert not target.exists() or target.read_bytes()==data,'Refusing to overwrite a different package'
    target.write_bytes(data)
    record.update(file=target.name,size=len(data),sha256=hashlib.sha256(data).hexdigest())
    (out/'port.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(record,ensure_ascii=False,indent=2))

if __name__=='__main__':build(Path(sys.argv[1]),Path(sys.argv[2]))
