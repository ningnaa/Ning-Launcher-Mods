// Exercise the actual DevTools entry and layer manager against a versioned list.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root = path.join(process.argv[2], 'content');
const callbacks = new Map(), ready = [];
function cls(name, fields={}) {return new Proxy(fields, {get:(t,key)=>key in t?t[key]:({hook:fn=>callbacks.set(name+':'+key,fn)})});}
const list={items:[],version:0,get Count(){return this.items.length;},
  Insert(i,value){this.items.splice(i,0,value);this.version++;}};
const main={_needToSetupDrawInterfaceLayers:true,_gameInterfaceLayers:list};
const Main = cls('Main',{instance:main}), Player = cls('Player'), WorldGen = cls('WorldGen');
const layerClass = {new:()=>({'void .ctor(string name, GameInterfaceDrawMethod drawMethod, InterfaceScaleType scaleType)'(name) {this.Name=name;}}),
  'bool DrawSelf()':{hook:fn=>callbacks.set('Layer:DrawSelf',fn)}};
const context=vm.createContext({Mod:class {},
  Terraria:{Main,Player,WorldGen,UI:{LegacyGameInterfaceLayer:layerClass,InterfaceScaleType:{None:0}}},
  Microsoft:{Vector2:{}},ModInterface:{SetupContent(){},Update(){},Clear(){}},
  RegisterAll(){},InitializeTextures(){},CameraSystem:{PhotoMode:false},
  bl:{log(){},onContentReady:fn=>ready.push(fn),classOf:(_ns,name)=>cls(name)}});
function load(file,names) {
  const source=fs.readFileSync(path.join(root,file),'utf8').replace(/\r/g,'')
    .replace(/^import[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm,'')
    .replace(/export default class /g,'class ').replace(/export class /g,'class ');
  Object.assign(context,vm.runInContext(`(()=>{${source}\nreturn {${names}};})()`,context,{filename:file}));
}
load('TL/ModInterfaceLayer.js','ModInterfaceLayer');
load('main.js','DevTool');
context.RegisterAll=()=>context.ModInterfaceLayer.register(class TestLayer extends context.ModInterfaceLayer {});
new context.DevTool().Load();
ready.forEach(fn=>fn());
function nativeDraw() {
  if(main._needToSetupDrawInterfaceLayers) {
    list.items=[{Name:'Vanilla: Inventory'},{Name:'Vanilla: Mouse Text'}];list.version++;
    main._needToSetupDrawInterfaceLayers=false;
  }
  const version=list.version;
  for (const layer of list.items) {
    callbacks.get('Layer:DrawSelf')(()=>true,layer);
    if(list.version!==version) throw Error('Collection was modified; enumeration operation may not execute.');
  }
}
function draw() {
  const hook=callbacks.get('Main:void DrawInterface(GameTime gameTime)');
  if(hook) hook(nativeDraw,main,{}); else nativeDraw();
}
assert.doesNotThrow(draw,'first frame must not insert layers during enumeration');
draw();assert.equal(list.items.filter(x=>x.Name==='TestLayer').length,1);
for(let i=0;i<100;i++)draw();
assert.equal(list.Count,3,'repeated draws must not duplicate layers');
main._needToSetupDrawInterfaceLayers=true;draw();draw();
assert.equal(list.items.filter(x=>x.Name==='TestLayer').length,1,'restore custom layer after game rebuild');
console.log('PASS: first frame, 100 repeated frames, no duplicate layers, and game-list rebuild');
