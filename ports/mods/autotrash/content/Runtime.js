import {COINS,matches,saleValue,walletPlan} from './Rules.js';

const M=Terraria.Main,I=Terraria.Item;
const SET='void SetDefaults(int Type, ItemVariant variant)';
let config=null,server=null,remotePercent=null;
const keysByType=new Map(),typesByKey=new Map();
export const runtime={revision:0,open:()=>{},ensureSpawnHook:()=>{},message:'',uiTick:0,trashAnchor:null};
export function changed(message='') { runtime.revision++;runtime.message=message; }
export function configure(value) { config=value; }
export function configureServer(value) { server=value; }
export function clientConfig() { return config; }
export function rate() { return M.netMode===1?remotePercent:(server?.SellValue??15); }
export function receiveRate(value) {
    if(M.netMode!==1 || !Number.isInteger(value)||value<1||value>100)return false;
    remotePercent=value;return true;
}
export function clearRemote() { remotePercent=null; }
export function localPlayer() { return M.player && M.myPlayer>=0 && M.myPlayer<255?M.player[M.myPlayer]:null; }
export function state(player=localPlayer()) { return player?.GetModPlayer('autotrash/AutoTrashPlayer'); }
export function isLocal(player) { return !M.gameMenu && player && player.active && player.whoAmI===M.myPlayer && M.myPlayer<255; }
export function makeItem(type,count=1) { const item=I.new();if(type>0){item[SET](type,null);item.stack=count;}else item.stack=0;return item; }

export function rebuildKeys() {
    keysByType.clear();typesByKey.clear();
    // The loader gives both JS and C# item assets the stable <mod UUID>/<item name> used by saves.
    const assets=Terraria.GameContent.TextureAssets.Item;
    for(let type=bl.items.vanillaCount;assets&&type<assets.length;type++) {
        const name=String(assets[type]?.Name||'');
        if(!/^[0-9a-f-]{36}\/[^/]+$/.test(name))continue; // Includes protection for bunnyloader/Unloaded*.
        const key='m:'+name;
        if(typesByKey.has(key)){typesByKey.set(key,0);continue;}
        keysByType.set(type,key);typesByKey.set(key,type);
    }
}
export function keyOf(type) { return type>0&&type<bl.items.vanillaCount?'v:'+type:keysByType.get(type)||null; }
export function typeOf(key) { return key.startsWith('v:')?Number(key.slice(2)):typesByKey.get(key)||0; }
export function sample(type) { const samples=Terraria.ID.ContentSamples.ItemsByType;return samples&&samples.ContainsKey(type)?samples.get_Item(type):null; }
export function label(key) { const type=typeOf(key),item=type?sample(type):null;return item?String(item.Name):'未加载：'+key.slice(key.lastIndexOf('/')+1); }
export function describe(item) {
    const type=item?.type||0,sets=Terraria.ID.ItemID.Sets;
    const flag=array=>!!array&&type>=0&&type<array.length&&!!array[type];
    return {type,stack:item?.stack||0,key:keyOf(type),favorite:!!item?.favorited,value:item?.value||0,
        unloaded:type>=bl.items.vanillaCount&&!keyOf(type),bossBag:flag(sets.BossBag),nebula:flag(sets.NebulaPickup)};
}
export function shouldFilter(model,item) { return !model.invalid && matches(describe(item),model.keys,model.noValue); }
export function addRule(model,item) {
    const d=describe(item);
    if(model.invalid || !d.key || d.stack<=0 || d.favorite || COINS.has(d.type)){changed('这个物品受保护，未加入名单。');return false;}
    model.keys.add(d.key);changed('已加入过滤名单；现有物品未丢弃。');return true;
}

function creditPlan(player,amount) {
    if(!amount)return [];
    const snapshots=[];for(let i=0;i<54;i++){const it=player.inventory[i];snapshots.push({type:it.type,stack:it.stack,favorite:it.favorited});}
    const plan=walletPlan(snapshots,amount);if(!plan)return null;
    return plan.map(p=>({slot:p.slot,old:player.inventory[p.slot],next:makeItem(p.type,p.stack)}));
}
function commitCredit(player,plan) {
    const applied=[];
    try { for(const change of plan){player.inventory[change.slot]=change.next;applied.push(change);} }
    catch(error) { for(const change of applied)player.inventory[change.slot]=change.old;throw error; }
}

/** Returns an empty replacement only after consuming; false forwards to the original pickup path. */
export function consume(player,item) {
    const model=state(player);
    if(!isLocal(player)||!model||!model.enabled||model.busy||!shouldFilter(model,item))return false;
    const percent=rate();
    if(config?.SellInstead && percent===null)return false; // No client-chosen server price before sync.
    const amount=config?.SellInstead?saleValue(item.value,item.stack,percent):0;
    if(amount===null)return false;
    model.busy=true;
    try {
        const clone=item.Clone();
        if(clone.type!==item.type||clone.stack!==item.stack||clone.prefix!==item.prefix){changed('物品副本校验失败，未处理。');return false;}
        const empty=makeItem(0,0);
        const plan=creditPlan(player,amount);
        if(!plan){changed('钱币存放空间不足，物品未处理。');return false;}
        item['void TurnToAir()']();
        if(item.type>0&&item.stack>0)return false;
        const record={id:model.nextHistoryId++,item:clone,paid:0};
        model.history.unshift(record);if(model.history.length>5)model.history.length=5;
        try { commitCredit(player,plan);record.paid=amount; }
        catch(error) { model.enabled=false;changed('售卖未完成，自动处理已关闭；可取回最近物品。');bl.log('智能垃圾桶：货币提交失败，已保留最近物品。');return empty; }
        changed();return empty;
    } finally { model.busy=false; }
}

export function trashSlot(model,slot) {
    const player=model.Player;
    if(!isLocal(player)||slot<0||slot>=50)return false;
    const item=player.inventory[slot];
    if(!model.enabled){changed('请先开启自动处理。');return false;}
    if(!addRule(model,item))return false;
    return !!consume(player,item);
}

export function recover(model,id=model.history[0]?.id) {
    const index=model.history.findIndex(record=>record.id===id);
    if(index<0){changed('记录已更新，请重新选择。');return false;}
    const record=model.history[index],player=model.Player,item=record.item;
    if(!isLocal(player)||model.busy||!item||item.type<=0||item.stack<=0)return false;
    const cap=Math.max(1,Math.min(32767,item.maxStack)),needed=Math.ceil(item.stack/cap),slots=[];
    for(let i=0;i<50;i++)if(player.inventory[i].type<=0||player.inventory[i].stack<=0)slots.push(i);
    if(needed>slots.length){changed('背包空间不足，最近物品仍保留。');return false;}
    const chunks=[];let remaining=item.stack;
    for(let i=0;i<needed;i++){const copy=item.Clone();copy.stack=Math.min(cap,remaining);remaining-=copy.stack;chunks.push({slot:slots[i],old:player.inventory[slots[i]],next:copy});}
    model.busy=true;let paid=false;
    try {
        // Reserve the item slots before BuyItem makes change; failed payment restores those empty slots.
        for(const change of chunks)player.inventory[change.slot]=change.next;
        paid=record.paid===0 || player['bool BuyItem(long price, int customCurrency)'](record.paid,-1);
        if(!paid){changed('钱币或找零空间不足，最近物品仍保留。');return false;}
        model.keys.delete(keyOf(item.type));model.history.splice(index,1);changed('已取回物品，并移出单项过滤名单。');return true;
    } finally {
        if(!paid)for(const change of chunks)player.inventory[change.slot]=change.old;
        model.busy=false;
    }
}

export function preventSpawn(source,type,modifier) {
    if(M.netMode!==0 || !config?.PreventSpawn || modifier || !source)return false;
    const player=localPlayer(),model=state(player);if(!isLocal(player)||!model?.enabled||model.busy)return false;
    const name=String(source.GetType().FullName);
    if(name!=='Terraria.DataStructures.EntitySource_Loot' && name!=='Terraria.DataStructures.EntitySource_TileBreak')return false;
    const item=sample(type);return !!item&&shouldFilter(model,item);
}
