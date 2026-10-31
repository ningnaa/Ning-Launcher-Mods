import {KEYS, DEFAULTS, MAX_STACK} from '../StackRules.js';
import {loadSettings, settings, receiveSettings, resetRemote, globalDefaults, refreshItems} from '../Runtime.js';

export class MaxStackExtraConfig extends ModConfig {
    static VisibleInWorld = false;
    static Options = {
        RestartNote: ModConfig.Header(),
        ItemStackValue: ModConfig.Range(DEFAULTS.ItemStackValue, {min:1, max:MAX_STACK, step:1}),
        TileStackValue: ModConfig.Range(DEFAULTS.TileStackValue, {min:1, max:MAX_STACK, step:1}),
        WeaponWarning: ModConfig.Header({color:'#FF6060'}),
        WeaponStackValue: ModConfig.Range(1, {min:1, max:MAX_STACK, step:1}),
        EquipStackValue: ModConfig.Range(1, {min:1, max:MAX_STACK, step:1}),
        SpecialStackValue: ModConfig.Range(1, {min:1, max:MAX_STACK, step:1}),
    };
    OnLoaded() { loadSettings(this); }
    OnApply() { bl.log('堆叠上限增强：配置已保存，完全退出并重启游戏后生效。'); }
}

export class MaxStackExtraItem extends GlobalItem {
    SetDefaults(item) { globalDefaults(item); }
}

export class MaxStackExtraSystem extends ModSystem {
    ClearWorld() { resetRemote(); }
    OnWorldLoad() { refreshItems(); }
    OnWorldUnload() { resetRemote(); }
    NetSend(writer) { for (const key of KEYS) writer.Write(settings()[key]); }
    NetReceive(reader) {
        const value = Object.fromEntries(KEYS.map(k => [k, reader.Read()]));
        if (Terraria.Main.netMode === 1 && !receiveSettings(value)) bl.log('堆叠上限增强：忽略超出安全范围的房主配置。');
    }
}
