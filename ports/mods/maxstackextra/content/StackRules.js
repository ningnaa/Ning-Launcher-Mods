export const KEYS = ['ItemStackValue', 'TileStackValue', 'WeaponStackValue', 'EquipStackValue', 'SpecialStackValue'];
export const DEFAULTS = Object.freeze({ItemStackValue:9999, TileStackValue:9999, WeaponStackValue:1, EquipStackValue:1, SpecialStackValue:1});
export const MAX_STACK = 32767; // Terraria mobile ChestItem.stack/maxStack are signed Int16.

export function validSettings(value) {
    return value != null && KEYS.every(k => Number.isInteger(value[k]) && value[k] >= 1 && value[k] <= MAX_STACK);
}

export function categoryOf(item, vanillaCount) {
    if (!item || item.type <= 0 || (item.type >= 71 && item.type <= 74)) return null;
    // Mobile gives even swords maxStack=9999. Use its existing single-item
    // policy (including bucket/doll exceptions); mod items keep their declared cap.
    const stackable = item.type < vanillaCount ? !item.OnlyNeedOneInInventory() : item.maxStack > 1;
    if (stackable) return item.createTile > 0 ? 'TileStackValue' : 'ItemStackValue';
    if (item.accessory || item.defense > 0) return 'EquipStackValue';
    if (item.damage > 0) return 'WeaponStackValue';
    return 'SpecialStackValue';
}

export function keepExistingStack(limit, count) {
    return Number.isInteger(count) && count > limit && count <= MAX_STACK ? count : limit;
}
