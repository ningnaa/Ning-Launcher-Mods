import {readState} from '../Rules.js';
import * as R from '../Runtime.js';
import {TrashState} from '../TrashUI.js';

export class AutoTrashPlayer extends ModPlayer {
    Initialize() { this.enabled=false;this.noValue=false;this.keys=new Set();this.history=[];this.nextHistoryId=1;this.busy=false;this.invalid=null; }
    get last(){return this.history[0]?.item??null;}
    get lastPaid(){return this.history[0]?.paid??0;}
    SaveData(tag) {
        if(this.invalid){for(const key of Object.keys(this.invalid))tag.Set(key,this.invalid[key]);return;}
        tag.format=1;tag.keys=[...this.keys];tag.enabled=this.enabled;tag.noValue=this.noValue;
    }
    LoadData(tag) {
        const data=readState(tag,bl.items.vanillaCount);
        this.keys=new Set(data.keys);this.enabled=data.enabled;this.noValue=data.noValue;
        this.history=[];this.nextHistoryId=1;this.busy=false;this.invalid=data.valid?null:{...tag};
    }
    OnEnterWorld(player) { if(player.whoAmI===Terraria.Main.myPlayer)R.changed(); }
    AddItem(item) { return R.addRule(this,item); }
    ProcessSlot(slot) { return R.trashSlot(this,slot); }
    Recover(id) { return R.recover(this,id); }
    ClearRules() { this.keys.clear();this.noValue=false;this.invalid=null;R.changed('过滤名单已清空。'); }
}

export class AutoTrashClientConfig extends ModConfig {
    static Options={
        SellInstead:ModConfig.Toggle(false),
        PreventSpawn:ModConfig.Toggle(false),
    };
    OnLoaded(){R.configure(this);}
    OnChanged(){R.changed();}
    OnApply(){R.runtime.ensureSpawnHook();R.changed();}
}
export class AutoTrashServerConfig extends ModConfig {
    static VisibleInWorld=false;
    static Options={SellValue:ModConfig.Range(15,{min:1,max:100,step:1,suffix:'%'})};
    OnLoaded(){R.configureServer(this);}
}

export class AutoTrashSystem extends ModSystem {
    ui=null;screen=null;
    PostSetupContent() {
        R.rebuildKeys();this.ui=new UserInterface();this.screen=new TrashState();this.screen.Activate();this.ui.SetState(this.screen);
        R.runtime.open=()=>this.screen.Show();
        R.runtime.ensureSpawnHook();
    }
    ClearWorld(){R.clearRemote();}
    OnWorldUnload(){R.clearRemote();const model=R.state();if(model){model.history=[];model.nextHistoryId=1;}if(this.screen)this.screen.Hide(false);}
    NetSend(writer){writer.Write(R.rate()??15);}
    NetReceive(reader){const value=reader.Read();if(Terraria.Main.netMode===1&&!R.receiveRate(value))bl.log('智能垃圾桶：忽略无效的房主售卖比例。');}
    UpdateUI(time){R.runtime.uiTick++;if(!Terraria.Main.gameMenu)this.ui?.Update(time);}
    ModifyInterfaceLayers(layers){
        const index=layers.FindIndex(layer=>layer.Name==='Vanilla: Mouse Text');if(index<0)return;
        layers.Insert(index,new LegacyGameInterfaceLayer('AutoTrash: Touch Panel',()=>{
            if(!Terraria.Main.gameMenu&&R.localPlayer()?.active)this.ui?.Draw(Terraria.Main.spriteBatch,null);
            return true;
        },InterfaceScaleType.UI));
    }
}

export class AutoTrashCommand extends ModCommand {
    get Command(){return 'trash';}
    get Aliases(){return ['垃圾桶'];}
    get Usage(){return '/trash';}
    get Description(){return '打开智能垃圾桶面板。';}
    Action(){R.runtime.open();}
}
