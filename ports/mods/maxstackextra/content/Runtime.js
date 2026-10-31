import {KEYS, DEFAULTS, validSettings, categoryOf, keepExistingStack} from './StackRules.js';

let local = DEFAULTS, remote = null;
const categories = new WeakMap();
const finalized = new WeakSet();
const finishing = new WeakSet();

export function loadSettings(config) {
    if (!validSettings(config)) throw new RangeError('堆叠设置必须为 1–32767 的整数');
    local = Object.freeze(Object.fromEntries(KEYS.map(k => [k, config[k]])));
}
export function settings() { return remote || local; }
export function receiveSettings(value) {
    if (Terraria.Main.netMode !== 1 || !validSettings(value)) return false;
    remote = Object.freeze({...value});
    refreshItems();
    return true;
}
export function resetRemote() { remote = null; refreshItems(); }

export function setDefaults(item) {
    const key = categoryOf(item, bl.items.vanillaCount);
    categories.set(item, {type:item.type, key});
    if (key) item.maxStack = settings()[key];
}

export function globalDefaults(item) {
    const modItem = item.type >= bl.items.vanillaCount ? item.ModItem : null;
    if (modItem && finalized.has(Object.getPrototypeOf(modItem))) refreshItem(item);
    else setDefaults(item);
}

export function installModItemFinalizers() {
    // This runtime's custom-item constructor can short-circuit later native
    // hooks. Apply after its public PostSetDefaults callback, in either mod order.
    for (const template of ModContent.GetContent(ModItem)) {
        const proto = Object.getPrototypeOf(template);
        if (finalized.has(proto)) continue;
        const original = proto.PostSetDefaults;
        proto.PostSetDefaults = function(item) {
            const outer = !finishing.has(item);
            if (outer) finishing.add(item);
            try {
                const result = original.call(this, item);
                if (outer) setDefaults(item);
                return result;
            } finally { if (outer) finishing.delete(item); }
        };
        finalized.add(proto);
    }
}

export function refreshItem(item) {
    if (!item || item.type <= 0) return;
    const saved = categories.get(item);
    const key = saved && saved.type === item.type ? saved.key : categoryOf(item, bl.items.vanillaCount);
    if (key) item.maxStack = keepExistingStack(settings()[key], item.stack);
}

export function refreshItems() {
    const Main = Terraria.Main;
    const samples = Terraria.ID.ContentSamples.ItemsByType;
    if (!samples) return;
    const count = Terraria.GameContent.TextureAssets.Item.length;
    for (let type = 1; type < count; type++) {
        if (samples.ContainsKey(type)) refreshItem(samples.get_Item(type));
    }
    const players = Main.player;
    for (let i = 0; players && i < players.length; i++) {
        const player = players[i];
        if (!player || !player.active) continue;
        const lists = [player.inventory, player.armor, player.dye, player.miscEquips, player.miscDyes];
        for (const name of ['bank', 'bank2', 'bank3', 'bank4']) if (player[name]) lists.push(player[name].item);
        if (player.Loadouts) for (let n = 0; n < player.Loadouts.length; n++) {
            lists.push(player.Loadouts[n].Armor, player.Loadouts[n].Dye);
        }
        for (const list of lists) {
            if (list) for (let n = 0; n < list.length; n++) refreshItem(list[n]);
        }
    }
    const items = Main.item;
    for (let i = 0; items && i < items.length; i++) {
        const world = items[i];
        if (world && world.active) refreshItem(world.inner);
    }
}
