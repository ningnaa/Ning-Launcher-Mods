// Runs the shipped WikiUI, registration and hooks with minimal engine stand-ins.
// Usage: node wikithis.mjs EXTRACTED_PACKAGE
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root = path.join(process.argv[2], 'content');
const hooks = new Map(), ready = [];
let draws = 0, originals = 0, returned = 0, setup = 0;
const method = name => ({hook(fn) {
  const previous = hooks.get(name);
  hooks.set(name, previous ? (original, self) => fn(() => previous(original, self), self) : fn);
}});
const Main = {gameMenu:false, mouseLeft:false, mouseItem:{IsAir:true}, mouseX:0, mouseY:0,
  myPlayer:0, player:[{'Item GetItem(Item newItem, GetItemSettings settings, bool disableMerge)':()=>returned++}],
  'void Initialize_AlmostEverything()':method('init')};
const WorldGen = {'void SaveAndQuit()':method('quit')};
const TextureAssets = Object.fromEntries(['InventoryBack7','InventoryBackHighlight7','Trash',
  'InventoryBack2','InventoryBackHighlight2'].map(x=>[x,{Value:x}]));
TextureAssets.Cursors=[null,null,{Value:'cursor'}];
const Item = {new:()=>({IsAir:true,'void .ctor()'(){},'void SetDefaults(int Type, ItemVariant variant)'(){}})};
const List = {makeGeneric:()=>({new:()=>{const items=[];return {
  'void .ctor()'(){},Add:item=>items.push(item),ToArray:()=>items};}})};
const language = {ActiveCulture:{Name:'zh-Hans'}};
const classes = {Main,WorldGen,Item,'List`1':List,TextureAssets,
  ItemID:{Count:2,Search:{GetName:()=> 'IronPickaxe'},Sets:{Deprecated:[]}},
  Language:language,GameCulture:{CultureName:{English:0,Chinese:1}},
  LanguageManager:{Instance:{ActiveCulture:language.ActiveCulture,
    'void SetLanguage(string cultureName)':n=>language.ActiveCulture.Name=n,
    'string GetTextValue(string key)':()=> 'Iron Pickaxe'}},
  InventorySplitStack_Layout:{Instance:{MainButton:{Location:{X:10,Y:20}}}},
  ItemSlot:{'void Draw(SpriteBatch spriteBatch, Item[] inv, int context, int slot, Vector2 position, Color lightColor)':()=>draws++},
};
const context = vm.createContext({Date,ModButton:{Clear(){},Update(){}},
  bl:{classOf:(_ns,name)=>classes[name]||{},onContentReady:fn=>ready.push(fn)},
  GUIInventorySplitStack:{'void Draw()':method('draw')},
  Rectangle:{new:(X,Y,Width,Height)=>({X,Y,Width,Height,'bool Contains(int x, int y)':()=>false})},
  Vector2:{new:(X=0,Y=0)=>({X,Y})},Color:{White:{}},
  Panel_Layout:{new:()=>({'void .ctor()'(){}})},LayoutCalculator:{AnchorType:{TopLeft:0}},
  GUIPanel:{'bool RegisterPickingRegion(Panel_Layout layout)'(){}},
  Draw:{GetAnchoredPosition:(_a,_b,p)=>p,NewSpriteBatchForUI(){}},
  Terraria:{GetItemSettings:{ReturnItemFromSlot:{}}},
});
function load(file, names) {
  const source = fs.readFileSync(path.join(root,file),'utf8').replace(/\r/g,'')
    .replace(/^import .*;\s*$/gm,'').replace(/export (class|function) /g,'$1 ');
  Object.assign(context,vm.runInContext(`(()=>{${source}\nreturn {${names}};})()`,context,{filename:file}));
}
load('TL/ModInterface.js','ModInterface');
load('TL/ModInterfaceLayer.js','ModInterfaceLayer');
load('Wikithis.js','WikiUI');
load('Register.js','Register');
load('ModHooks.js','ModHooks');
context.Register();
const originalSetup=context.WikiUI.Instance.SetupContent.bind(context.WikiUI.Instance);
context.WikiUI.Instance.SetupContent=()=>{setup++;originalSetup();};
context.ModHooks.Initialize();
function invoke(name) {hooks.get(name)(()=>originals++,{});}
// Exact reported sequence: native initialization is already over when the mod loads.
assert.doesNotThrow(()=>invoke('draw'),'early draw must not access undefined Panel.X');
assert.doesNotThrow(()=>invoke('quit'),'early exit must not access undefined slot');
assert.equal(draws,0); assert.equal(originals,2);
assert.equal(ready.length,1,'initialization must use the content-ready lifecycle');
ready[0]();
assert.equal(setup,1); assert.equal(language.ActiveCulture.Name,'zh-Hans');
assert.ok(context.WikiUI.CheckUrl(1));
invoke('draw'); assert.equal(draws,1);
assert.equal(context.WikiUI.Instance.Panel.X,51);
assert.equal(context.WikiUI.Instance.Panel.Y,20);
assert.equal(TextureAssets.InventoryBack7.Value,'InventoryBack7');
Main.IsJourneyMode=true;invoke('draw');assert.equal(context.WikiUI.Instance.Panel.X,92);
Main.gameMenu=true;invoke('draw');assert.equal(draws,2,'title screen must skip the Wiki UI');
Main.gameMenu=false;
context.WikiUI.Item[0]={IsAir:false,DeepClone:()=>({type:1})};
invoke('quit');assert.equal(returned,1);assert.ok(context.WikiUI.Item[0].IsAir);
invoke('draw');assert.equal(draws,3,'re-entering the world still draws the slot');
assert.equal(setup,1,'drawing and re-entry must not recreate the UI or discard its item');
console.log('PASS: early draw/exit, content-ready setup, normal/Journey drawing, texture restoration, title screen, item return and re-entry');
