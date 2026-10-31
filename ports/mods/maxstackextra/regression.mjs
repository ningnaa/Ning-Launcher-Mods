import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import path from 'node:path';

const root=path.resolve(process.argv[2] || 'samples/MaxStackExtra/content');
const rules=await import(pathToFileURL(path.join(root,'StackRules.js')));
const {KEYS,DEFAULTS,validSettings,categoryOf,keepExistingStack}=rules;
const settings=Object.fromEntries(KEYS.map((k,i)=>[k,[12000,32767,7,5,9][i]]));
const checks=[];
function check(name,fn){fn();checks.push(name);console.log('PASS',name);}
const item=(props={})=>({type:9,maxStack:9999,stack:1,createTile:-1,damage:0,defense:0,accessory:false,OnlyNeedOneInInventory:()=>false,...props});
check('five source categories and mobile single-item policy',()=>{
 const rows=[['TileStackValue',item({createTile:30})],['ItemStackValue',item({createTile:0})],
 ['ItemStackValue',item({damage:10,consumable:true})],['ItemStackValue',item({defense:1})],
 ['WeaponStackValue',item({damage:7,OnlyNeedOneInInventory:()=>true})],
 ['EquipStackValue',item({accessory:true,OnlyNeedOneInInventory:()=>true})],
 ['SpecialStackValue',item({OnlyNeedOneInInventory:()=>true})]];
 for(const [expected,i] of rows)assert.equal(categoryOf(i,6134),expected);
});
check('all coin denominations and empty slots remain untouched',()=>{
 for(const type of [0,71,72,73,74])assert.equal(categoryOf(item({type}),6134),null);
});
check('mod items use their own original maxStack',()=>{
 assert.equal(categoryOf(item({type:7000,maxStack:1,damage:10}),6134),'WeaponStackValue');
 assert.equal(categoryOf(item({type:7000,maxStack:99,damage:10}),6134),'ItemStackValue');
});
check('safe bounds reject zero, overflow, fractions and partial packets',()=>{
 assert.ok(validSettings(DEFAULTS));assert.ok(validSettings(settings));
 for(const bad of [0,-1,32768,2147483647,NaN,Infinity,1.5,'99'])assert.equal(validSettings({...settings,ItemStackValue:bad}),false);
 assert.equal(validSettings({}),false);
});
check('lowering caps preserves representable old stack quantities',()=>{
 assert.equal(keepExistingStack(1,20),20);assert.equal(keepExistingStack(9999,32767),32767);
 assert.equal(keepExistingStack(9999,5),9999);assert.equal(keepExistingStack(9999,32768),9999);
});

const sample=item({type:24,damage:7,OnlyNeedOneInInventory:()=>true});
globalThis.bl={items:{vanillaCount:6134},log(){}};
globalThis.Terraria={Main:{netMode:0,player:[],item:[]},ID:{ContentSamples:{ItemsByType:{ContainsKey:t=>t===24,get_Item:()=>sample}}},GameContent:{TextureAssets:{Item:{length:25}}}};
const runtime=await import(pathToFileURL(path.join(root,'Runtime.js')));
globalThis.ModConfig=class {static Range(value,options){return {value,...options};} static Header(options){return options||{};}};
globalThis.GlobalItem=class {};
globalThis.ModSystem=class {};
const content=await import(pathToFileURL(path.join(root,'Common/StackContent.js')));
check('real content hook applies defaults and never edits quantity/prefix',()=>{
 const g=new content.MaxStackExtraItem();sample.stack=1;sample.prefix=18;g.SetDefaults(sample);
 assert.equal(sample.maxStack,1);assert.equal(sample.stack,1);assert.equal(sample.prefix,18);
 const coin=item({type:71,maxStack:100});g.SetDefaults(coin);assert.equal(coin.maxStack,100);
});
check('configuration Apply persists for next restart, not this session',()=>{
 const c=new content.MaxStackExtraConfig();Object.assign(c,DEFAULTS);c.OnLoaded();
 c.WeaponStackValue=7;c.OnApply();assert.equal(runtime.settings().WeaponStackValue,1);
 c.OnLoaded();assert.equal(runtime.settings().WeaponStackValue,7);
});
check('host settings round-trip, client refreshes samples and host rejects client overwrite',()=>{
 runtime.loadSettings(settings);const system=new content.MaxStackExtraSystem(),values=[];
 system.NetSend({Write:v=>values.push(v)});assert.deepEqual(values,KEYS.map(k=>settings[k]));
 runtime.loadSettings(DEFAULTS);Terraria.Main.netMode=1;
 system.NetReceive({Read:()=>values.shift()});assert.deepEqual(runtime.settings(),settings);assert.equal(sample.maxStack,7);
 Terraria.Main.netMode=3;assert.equal(runtime.receiveSettings({...settings,WeaponStackValue:9}),false);
 system.OnWorldUnload();assert.deepEqual(runtime.settings(),DEFAULTS);assert.equal(sample.maxStack,1);
});
check('malformed host packet is rejected without a partial configuration',()=>{
 Terraria.Main.netMode=1;assert.equal(runtime.receiveSettings({...settings,ItemStackValue:0}),false);
 assert.deepEqual(runtime.settings(),DEFAULTS);
});
check('refresh retains old count and changes neither stack nor prefix',()=>{
 runtime.loadSettings(DEFAULTS);sample.stack=20;sample.prefix=18;runtime.refreshItem(sample);
 assert.equal(sample.maxStack,20);assert.equal(sample.stack,20);assert.equal(sample.prefix,18);
});
check('custom-item finalizers retain inherited callbacks without double classification',()=>{
 runtime.loadSettings(settings);let calls=0;
 globalThis.ModItem=class {PostSetDefaults(){calls++;}};
 class BaseWeapon extends ModItem {}
 class DerivedWeapon extends BaseWeapon {PostSetDefaults(i){super.PostSetDefaults(i);i.maxStack=1;}}
 const base=new BaseWeapon(),derived=new DerivedWeapon();
 globalThis.ModContent={GetContent:()=>[base,derived]};
 runtime.installModItemFinalizers();runtime.installModItemFinalizers();
 const weapon=item({type:7000,maxStack:1,damage:10,ModItem:derived});
 derived.PostSetDefaults(weapon);assert.equal(calls,1);assert.equal(weapon.maxStack,7);
 runtime.globalDefaults(weapon);assert.equal(weapon.maxStack,7,'later global hook reclassified the already-adjusted weapon');
 Object.assign(weapon,item({type:9,createTile:0}));runtime.refreshItem(weapon);
 assert.equal(weapon.maxStack,12000,'cached category leaked to another item type');
});
console.log(`${checks.length} Max Stack Extra regression groups passed`);
