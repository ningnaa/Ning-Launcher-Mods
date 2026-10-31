import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root = process.argv[2];
if (!root) throw Error('Pass the directory containing extracted consolaria and cooleritemvisualeffect packages');
let failures = 0;
function test(name, fn) {
    try { fn(); console.log('PASS', name); }
    catch (e) { failures++; console.log('FAIL', name, e.message); }
}
function load(file, globals, exports) {
    const source = fs.readFileSync(path.join(root, file), 'utf8')
        .replace(/^import .*;\r?$/gm, '').replace(/^export /gm, '');
    return vm.runInNewContext(`${source}\n;({${exports}})`, globals, {filename: file});
}
const npcs = [{type: 900}, {type: 900}, {type: 1}];
const {ConsolariaPlayer} = load('consolaria/content/Common/Players/ConsolariaPlayer.js', {
    Terraria: {Main: {npc: npcs}}, ModPlayer: class {},
    ModContent: {NPCType: () => 900, ProjectileType: n => ['OcramLaser1','OcramLaser2','OcramScythe','OcramSkull'].indexOf(n) + 1000},
    ModLocalization: {GetTextValue: () => '{0} was defeated by Ocram'}, Rand: {NextBool: () => true},
}, 'ConsolariaPlayer');
for (const index of [0, 1, 2, -1, 200, undefined]) {
    test(`Consolaria death NPC index ${index}`, () => {
        const source = {_sourceNPCIndex: index, _sourceProjectileType: -1};
        assert.equal(new ConsolariaPlayer().PreKill({name:'QA'},source,20,1,false),true);
        assert.equal(!!source._sourceCustomReason,index === 0 || index === 1);
    });
}
for (const projectile of [1000,1001,1002,1003,1]) {
    test(`Consolaria projectile death ${projectile}`, () => {
        const source = {_sourceNPCIndex:-1,_sourceProjectileType:projectile};
        new ConsolariaPlayer().PreKill({name:'QA'},source,20,1,false);
        assert.equal(!!source._sourceCustomReason,projectile >= 1000);
    });
}
const {isSwingWeapon, applyCustomAttackPoseInner} = load('cooleritemvisualeffect/content/Common/Players/CoolerItemPlayer.js', {
    Terraria:{Main:{myPlayer:0}, GameContent:{TextureAssets:{}}, Dust:{},
        ID:{ItemID:{Sickle:1786, Search:{GetName:t=>t === 1786 ? 'Sickle' : t === 24 ? 'WoodenSword' : 'DeathSickle'}}}},
    ModPlayer:class {}, ModContent:{GetInstance:()=>({Enabled:true})}, CoolerItemConfig:class {},
}, 'isSwingWeapon, applyCustomAttackPoseInner');
const weapon = type => ({type,damage:9,useStyle:1,pick:0,axe:0,hammer:0,noMelee:false,noUseGraphic:false});
test('Merchant sickle keeps vanilla cutting and hay path', () => {
    const item = weapon(1786);
    assert.equal(isSwingWeapon(item),false,'harvesting tool entered the custom melee path');
    const player = {whoAmI:0,itemAnimation:10,HeldItem:item};
    applyCustomAttackPoseInner(player,0);
    assert.equal(item.noMelee,false,'vanilla tile cutting was disabled');
});
test('Ordinary swords and combat sickles retain sword effects', () => {
    assert.equal(isSwingWeapon(weapon(24)),true);
    assert.equal(isSwingWeapon(weapon(1327)),true);
});
test('Titan client snapshot receives a ModPlayer and round-trips the toggled mode', () => {
    const {TitanPlayer} = load('consolaria/content/Content/Items/Armor/Ranged/TitanHelmet.js', {
        Terraria:{Main:{myPlayer:0},ID:{},Dust:{},Projectile:{},Audio:{SoundEngine:{}}},
        ModPlayer:class {},ModItem:class {},GlobalItem:class {},
    }, 'TitanPlayer');
    const original = new TitanPlayer(), snapshot = new TitanPlayer(), receiver = new TitanPlayer();
    original.titanPower2 = true;
    const nativePlayer = Object.preventExtensions({whoAmI:0});
    original.CopyClientState(nativePlayer,snapshot);
    assert.equal(snapshot.titanPower2,true);
    let sends = 0;
    original.SyncPlayer = () => sends++;
    original.SendClientChanges(nativePlayer,snapshot);
    assert.equal(sends,0);
    original.titanPower2 = false;
    original.SendClientChanges(nativePlayer,snapshot);
    assert.equal(sends,1);
    receiver.ReceivePlayerSync({ReadBoolean:()=>true});
    assert.equal(receiver.titanPower2,true);
    assert.equal(receiver.titanPower,false,'equipment state must not be overwritten by mode sync');
});
process.exitCode = failures ? 1 : 0;
