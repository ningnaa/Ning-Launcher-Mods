import * as R from './Runtime.js';

export default class AutoTrash extends Mod {
    Load(){
        GUITrashCan['void ItemDrawImp(ItemGrid_Layout gridLayout, int index, Vector2 position, float scale)'].hook((original,self,layout,index,position,scale)=>{
            const result=original(self,layout,index,position,scale);
            R.runtime.trashAnchor={x:position.X,y:position.Y,size:52*scale,tick:R.runtime.uiTick};
            return result;
        });
        Terraria.Player['Item GetItem(Item newItem, GetItemSettings settings, bool disableMerge)'].hook((original,player,item,settings,disableMerge)=>{
            const replacement=R.consume(player,item);if(replacement)return replacement;
            return original(player,item,settings,disableMerge);
        });
        let spawnInstalled=false;
        R.runtime.ensureSpawnHook=()=>{
            if(spawnInstalled||!R.clientConfig()?.PreventSpawn)return;
            Terraria.Item['int NewItem(IEntitySource source, Vector2 center, int type, int stack, int prefix, NewItemOwnership ownership, Nullable<Vector2> velocity, Item.NewItemModifier modifier, bool noBroadcast)'].hook(
            (original,source,center,type,stack,prefix,ownership,velocity,modifier,noBroadcast)=>{
                if(R.preventSpawn(source,type,modifier))return Terraria.Main.item.length-1;
                return original(source,center,type,stack,prefix,ownership,velocity,modifier,noBroadcast);
            });
            spawnInstalled=true;
        };
    }
    Call(command,item){
        if(command==='IsFiltered'){const model=R.state();return !!model&&R.shouldFilter(model,item);}
        if(command==='Open'){R.runtime.open();return true;}
        return undefined;
    }
}
