"""Build the pinned Ghastling PC resource pack for Bunny Loader.

Usage: python -X utf8 tools/mods/ports/ghastling.py SOURCE_ZIP OUTPUT_DIRECTORY
Preserves original assets; only creates the launcher manifest and storefront.
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
        'uid':uid,'id':'texture-'+uid,'name':pc['Name'],'version':'1.0.0-port.1',
        'type':'texture','category':'材质','blVersion':2,'updated':'2026-11-01',
        'author':'Pixivic','authors':[{'name':'Pixivic','role':'原作者','link':url},{'name':'流脌','role':'移植者'}],
        'description':'将阿比盖尔替换为萌萌恶魂外观，并替换召唤物品、增益图标和花朵贴图。当前版本仅应用图片，PC 音效和名称替换暂不生效。',
        'localizedNames':{'zh-Hans':'萌萌恶魂'},
        'localizedSummaries':{'zh-Hans':'阿比盖尔与相关物品的萌萌恶魂外观；原作者 Pixivic，移植者流脌。仅图片替换。'},
        'license':'','links':[{'title':'原包记录的 Steam Workshop 页面','url':url}],
        'portEdition':{'revision':1,'baseVersion':'1.0.0','sourceSha256':SOURCE_SHA256,'porter':'流脌'},
    }
    files={('content/'+n[8:] if n.startswith('Content/') else n):data for n,data in original.items()}
    files['manifest.json']=(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n').encode()
    files['description_zh-Hans.md']='''# 萌萌恶魂

**原作者：Pixivic · 移植者：流脌**

原包名称：Ghastling as Abigail。

替换阿比盖尔召唤物、阿比盖尔的花、对应增益图标及花朵地形贴图，使其呈现萌萌恶魂主题外观。只改变贴图，不改变原版召唤与战斗机制。

## 当前适配范围

- 应用 4 张游戏贴图，原始图片字节不变。
- 原 PC 音效 XNB 和语言资源完整保留，当前启动器纯材质加载器不会应用这些音效或名称替换。
- 启用后完全重启游戏；使用阿比盖尔的花观察召唤物外观。

包内保留 pack.json、workshop.json、原作者署名及全部原始文件。原包没有附带独立许可证，标记为未声明，不推定其他许可。
'''.encode()
    files['changelog_zh-Hans.md']='''## 1.0.0-port.1（2026-11-01）

加入 Bunny Loader 在线材质目录，保留原作者 Pixivic，移植者标注为流脌。应用 4 张图片，保留原 PC 音效及语言资源，明确当前仅图片替换。
'''.encode()
    record={'sourceFile':source.name,'sourceSha256':SOURCE_SHA256,'originalName':pc['Name'],
            'author':'Pixivic','porter':'流脌','uid':uid,'id':manifest['id'],'version':manifest['version'],
            'originalFileCount':len(original),'modifiedOriginalFiles':[],
            'runtimeImages':['Buff_335.png','Item_5114.png','Projectile_963.png','Tiles_624.png'],
            'unsupportedPreserved':['PC XNB sounds','PC vanilla localization replacements']}
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
