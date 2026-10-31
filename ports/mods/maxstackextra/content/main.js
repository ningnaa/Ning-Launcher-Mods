import {refreshItem, refreshItems, installModItemFinalizers} from './Runtime.js';
import {keepExistingStack} from './StackRules.js';

export default class MaxStackExtra extends Mod {
    Load() {
        bl.onContentReady(() => { installModItemFinalizers(); refreshItems(); });
        // Lower limits must not delete existing larger stacks while loading.
        // Preserve only counts representable by the mobile storage format.
        Terraria.Item['void FixAgainstExploit()'].hook((original, item) => {
            refreshItem(item);
            return original(item);
        });
        Terraria.ChestItem['short get_maxStack()'].hook((original, item) => {
            const limit = original(item);
            if (item.type <= 0 || (item.type >= 71 && item.type <= 74)) return limit;
            return keepExistingStack(limit, item.stack);
        });
    }
}
