import * as R from './Runtime.js';
import {moneyText} from './Rules.js';

const M=Terraria.Main;
const DRAW='void Draw(Texture2D texture, Rectangle destinationRectangle, Color color)';
const ITEM='float DrawItemIcon(Item item, int context, SpriteBatch spriteBatch, Vector2 screenPositionForItemCenter, float scale, float sizeLimit, Color environmentColor, float itemFade, bool flip)';
const glyphs={
    close:[[3,3,2,2],[5,5,2,2],[7,7,2,2],[9,9,2,2],[11,11,2,2],[11,3,2,2],[9,5,2,2],[5,9,2,2],[3,11,2,2]],
    plus:[[7,2,2,12],[2,7,12,2]],minus:[[2,7,12,2]],
    list:[[2,3,2,2],[6,3,8,2],[2,7,2,2],[6,7,8,2],[2,11,2,2],[6,11,8,2]],
    grid:[[2,2,5,5],[9,2,5,5],[2,9,5,5],[9,9,5,5]],
    trash:[[3,3,10,2],[6,1,4,2],[4,6,2,7],[7,6,2,7],[10,6,2,7],[4,13,8,2]],
    power:[[7,1,2,7],[3,3,2,2],[11,3,2,2],[1,5,2,7],[13,5,2,7],[3,12,2,2],[11,12,2,2],[5,14,6,2]],
    zero:[[4,2,8,2],[2,4,2,8],[12,4,2,8],[4,12,8,2],[5,9,2,2],[7,7,2,2],[9,5,2,2]],
    search:[[3,1,7,2],[1,3,2,7],[10,3,2,7],[3,10,7,2],[10,10,2,2],[12,12,2,2],[14,14,2,2]],
    left:[[3,7,10,2],[3,5,2,2],[5,3,2,2],[3,9,2,2],[5,11,2,2]],
    right:[[3,7,10,2],[11,5,2,2],[9,3,2,2],[11,9,2,2],[9,11,2,2]],
    undo:[[2,4,11,2],[2,2,2,2],[2,6,2,2],[4,8,2,2],[12,6,2,5],[4,11,8,2]],
    history:[[4,1,8,2],[1,4,2,8],[13,4,2,8],[4,13,8,2],[7,4,2,5],[9,7,3,2]],
    check:[[2,8,2,2],[4,10,2,2],[6,8,2,2],[8,6,2,2],[10,4,2,2],[12,2,2,2]],
    coin:[[4,1,8,2],[2,3,2,10],[12,3,2,10],[4,13,8,2],[7,4,2,7]],
};
function rect(e,x,y,w,h){e.Left.Set(x,0);e.Top.Set(y,0);e.Width.Set(w,0);e.Height.Set(h,0);return e;}
function short(s,n=30){const a=Array.from(String(s));return a.length>n?a.slice(0,n).join('')+'…':a.join('');}
function inventoryOpen(){return !!GUIInstance.Active?.GUIPageIcons.IsPageSelected(2);}

class IconButton extends UIPanel {
    constructor(icon,hint,selected=false,danger=false){
        super();this.SetPadding(0);this.icon=icon;this.hint=hint;
        this.BackgroundColor=Color.new(...(selected?(danger?[125,48,62]:[55,112,104]):[45,58,109]));
        this.BorderColor=Color.new(...(selected?(danger?[255,125,125]:[129,233,170]):[104,125,188]));
    }
    DrawSelf(batch){
        super.DrawSelf(batch);const d=this.GetDimensions(),scale=Math.min(d.Width-12,d.Height-12)/16;
        const x=d.X+(d.Width-16*scale)/2,y=d.Y+(d.Height-16*scale)/2;
        const texture=Terraria.GameContent.TextureAssets.MagicPixel.Value;
        for(const r of glyphs[this.icon]||glyphs.grid)batch[DRAW](texture,Rectangle.new(Math.round(x+r[0]*scale),Math.round(y+r[1]*scale),Math.max(1,Math.round(r[2]*scale)),Math.max(1,Math.round(r[3]*scale))),Color.White);
        if(this.IsMouseHovering)UICommon.TooltipMouseText(this.hint);
    }
}
class ItemTile extends UIPanel {
    constructor(item,name,selected,filtered){
        super();this.SetPadding(0);this.item=item;this.label=name;
        this.BackgroundColor=Color.new(...(filtered?[43,86,83]:[45,58,109]));
        this.BorderColor=Color.new(...(selected?[255,222,120]:filtered?[129,233,170]:[105,126,194]));
    }
    DrawSelf(batch){
        super.DrawSelf(batch);const d=this.GetDimensions();
        if(this.item?.type>0)Terraria.UI.ItemSlot[ITEM](this.item,0,batch,Vector2.new(d.X+d.Width/2,d.Y+d.Height/2),1,d.Width-10,Color.White,1,false);
        if(this.IsMouseHovering)UICommon.TooltipMouseText(this.label);
    }
}
export class TrashState extends UIState {
    opened=false;selectedHistoryId=null;tab='inventory';page=0;query='';selected=null;keyboard=null;revision=-1;tick=0;clearArmed=false;returnInventory=false;
    OnInitialize(){this.Build();}
    Show(){
        if(!R.isLocal(R.localPlayer()))return;
        this.returnInventory=inventoryOpen();
        if(this.returnInventory)GUIInstance.Active.GUIPageIcons['void Close(bool hideChat)'](false);
        this.opened=true;this.selectedHistoryId=null;this.selected=null;this.clearArmed=false;this.Build();
    }
    Hide(restore=true){
        this.opened=false;if(this.keyboard){M.CloseKeyboard();this.keyboard=null;}
        if(restore&&this.returnInventory&&!M.gameMenu)GUIInstance.Active.GUIPageIcons['void ActionOpenInventory()']();
        this.returnInventory=false;this.Build();
    }
    Icon(parent,icon,hint,x,y,action,selected=false,danger=false,size=30){
        const b=rect(new IconButton(icon,hint,selected,danger),x,y,size,size);
        b.OnLeftClick.Add(()=>{action();this.revision=-1;});parent.Append(b);return b;
    }
    Text(parent,text,x,y,w,h,scale=.65){const t=rect(new UIText(text,scale),x,y,w,h);t.IgnoresMouseInteraction=true;parent.Append(t);return t;}
    SelectedItem(){
        if(!this.selected)return null;const item=R.localPlayer().inventory[this.selected.slot];
        if(R.keyOf(item.type)!==this.selected.key||item.stack!==this.selected.stack||item.prefix!==this.selected.prefix||String(bl.addressOf(item))!==this.selected.address){this.selected=null;R.changed('物品已变化，请重新选择。');return null;}
        return item;
    }
    Search(){
        if(this.keyboard)return;
        M['void OpenKeyboard(string initial, int maxCharacters, bool password, bool multiline, bool filterText)'](this.query,48,false,false,false);
        this.keyboard=true;this.keyboardStarted=false;this.pendingQuery=this.query;
    }
    Update(time){
        super.Update(time);this.tick++;
        if(this.opened&&inventoryOpen())this.Hide(false);
        if(this.keyboard){
            // Keep the mobile native text until confirmation; its UI starts asynchronously.
            const native=M._keyboard;
            if(M.KeyboardIsActive){this.keyboardStarted=true;if(native)this.pendingQuery=String(native.text);}
            if(this.keyboardStarted&&!M.KeyboardIsActive){
                if(native&&!native.wasCanceled)this.pendingQuery=String(native.text);
                this.query=native?.wasCanceled?this.query:this.pendingQuery;this.page=0;
                M.CloseKeyboard();this.keyboard=null;this.revision=-1;
            }else M['string GetInputText(string oldString, Rectangle region, int maxCharacters, bool password, bool retainText, bool multiline, bool filterText)'](this.pendingQuery,Rectangle.new(0,0,0,0),48,false,true,false,false);
        }
        const b=this.GetInnerDimensions(),a=R.runtime.trashAnchor;
        const visible=inventoryOpen()&&a&&R.runtime.uiTick-a.tick<4;
        const layout=b.Width+'x'+b.Height+':'+!!visible+':'+(visible?a.x+','+a.y+','+a.size:'');
        if(!M.mouseLeft&&(layout!==this.layoutStamp||this.revision!==R.runtime.revision||this.opened&&this.tick%30===0)){this.layoutStamp=layout;this.Build();}
    }
    Build(){
        const model=R.state(),player=R.localPlayer();this.revision=R.runtime.revision;this.RemoveAllChildren();if(!model||!player)return;
        const bounds=this.GetInnerDimensions();
        if(!this.opened){
            const a=R.runtime.trashAnchor;if(!inventoryOpen()||!a||R.runtime.uiTick-a.tick>=4)return;
            const size=26,x=Math.max(2,Math.min(bounds.Width-size-2,a.x+a.size+4)),y=Math.max(2,Math.min(bounds.Height-size-2,a.y+(a.size-size)/2));
            this.Icon(this,'list','智能垃圾桶：过滤设置',x,y,()=>this.Show(),model.enabled,false,size);this.Recalculate();return;
        }
        const w=Math.min(388,bounds.Width-24),h=Math.min(270,bounds.Height-24),inner=w-16;
        const panel=rect(new UIPanel(),0,0,w,h);panel.HAlign=.5;panel.VAlign=.5;panel.SetPadding(8);panel.BackgroundColor=Color.new(32,43,84);this.Append(panel);
        this.Text(panel,'智能垃圾桶',0,0,inner-36,26,.82);this.Icon(panel,'close','关闭并返回背包',inner-28,0,()=>this.Hide(),false,false,28);
        const labels={inventory:'背包物品',rules:'过滤名单',last:'最近物品'};
        for(const [i,key,icon] of [[0,'inventory','grid'],[1,'rules','list'],[2,'last','history']])this.Icon(panel,icon,labels[key],i*36,34,()=>{this.tab=key;this.page=0;this.selectedHistoryId=null;this.selected=null;this.clearArmed=false;R.changed();},this.tab===key);
        this.Icon(panel,'power','自动处理：'+(model.enabled?'开':'关'),inner-102,34,()=>{if(model.invalid)R.changed('名单数据无效，请先清空。');else{model.enabled=!model.enabled;R.changed(model.enabled?'自动处理已开启。':'自动处理已关闭。');}},model.enabled);
        this.Icon(panel,'zero','无价值过滤：'+(model.noValue?'开':'关'),inner-66,34,()=>{model.noValue=!model.noValue;R.changed(model.noValue?'已开启无价值物品过滤。':'已关闭无价值物品过滤。');},model.noValue);
        const cfg=R.clientConfig();this.Icon(panel,'coin','自动售卖：'+(cfg?.SellInstead?'开':'关'),inner-30,34,()=>{cfg.SetOption('SellInstead',!cfg.SellInstead);R.changed(cfg.SellInstead?'自动售卖已开启。':'自动售卖已关闭。');},cfg?.SellInstead);
        if(this.tab!=='last'){
        this.Icon(panel,'search','按物品名称搜索',0,72,()=>this.Search(),false,false,26);
        const search=rect(new UITextPanel(short(this.query||'搜索物品',25),.62),32,72,inner-64,26);search.SetPadding(3);search.OnLeftClick.Add(()=>this.Search());panel.Append(search);
        this.Icon(panel,'close','清空搜索',inner-26,72,()=>{this.query='';this.page=0;},false,false,26);
        }else this.Text(panel,'最近 5 组 · 最新在左',0,76,inner,22,.62);
        const list=[];
        if(this.tab==='inventory')for(let slot=0;slot<50;slot++){const item=player.inventory[slot];if(item.type>0&&item.stack>0)list.push({slot,item,key:R.keyOf(item.type),name:String(item.Name)});}
        else if(this.tab==='rules')for(const key of model.keys)list.push({key,item:R.sample(R.typeOf(key)),name:R.label(key)});
        const filtered=list.filter(row=>row.name.toLowerCase().includes(this.query.toLowerCase()));
        const cols=Math.max(1,Math.floor((inner+5)/45)),rows=Math.max(1,Math.floor((h-180)/45)),perPage=cols*rows,pages=Math.max(1,Math.ceil(filtered.length/perPage));this.page=Math.min(this.page,pages-1);
        if(this.tab==='last'){
            if(this.selectedHistoryId===null)this.selectedHistoryId=model.history[0]?.id??null;
            const count=model.history.length,start=(inner-Math.max(0,count*45-5))/2;
            model.history.forEach((record,i)=>{
                const tile=rect(new ItemTile(record.item,String(record.item.Name),this.selectedHistoryId===record.id,false),start+i*45,106,40,40);
                this.Text(tile,String(record.item.stack),1,25,38,13,.45);
                tile.OnLeftClick.Add(()=>{this.selectedHistoryId=record.id;R.changed();});panel.Append(tile);
            });
            const selected=model.history.find(record=>record.id===this.selectedHistoryId);
            this.Text(panel,selected?short(selected.item.Name)+' ×'+selected.item.stack:count?'请选择一条记录':'暂无可取回物品',0,152,inner,21);
            this.Text(panel,selected?(selected.paid?'赎回：'+moneyText(selected.paid):'取回不收取钱币'):'最多保留最近 5 组，退出世界后清空',0,177,inner,22,.58);
        }else filtered.slice(this.page*perPage,(this.page+1)*perPage).forEach((row,i)=>{
            const chosen=this.selected&&(this.tab==='rules'?this.selected.key===row.key:this.selected.slot===row.slot);
            const tile=rect(new ItemTile(row.item,row.name,chosen,model.keys.has(row.key)),(i%cols)*45,106+Math.floor(i/cols)*45,40,40);
            tile.OnLeftClick.Add(()=>{this.selected=row.slot!==undefined?{slot:row.slot,key:row.key,stack:row.item.stack,prefix:row.item.prefix,address:String(bl.addressOf(row.item)),name:row.name}:{key:row.key,name:row.name};R.changed(row.name+(row.item?.favorited?' · 已收藏':'')+(row.slot!==undefined?' ×'+row.item.stack:''));});
            if(row.slot!==undefined&&row.item.stack>1)this.Text(tile,String(row.item.stack),1,25,38,13,.45);
            if(row.item?.favorited){const mark=rect(new IconButton('check','已收藏',true),25,0,15,15);mark.IgnoresMouseInteraction=true;tile.Append(mark);}
            panel.Append(tile);
        });
        const y=h-68;
        if(this.tab!=='last'){this.Icon(panel,'left','上一页',0,y,()=>{this.page=Math.max(0,this.page-1);});this.Text(panel,(this.page+1)+' / '+pages,34,y+5,50,22,.6);this.Icon(panel,'right','下一页',88,y,()=>{this.page=Math.min(pages-1,this.page+1);});}
        if(this.tab==='inventory'){
            this.Icon(panel,'plus','加入过滤名单，不处理现有物品',inner-126,y,()=>{const item=this.SelectedItem();if(item)model.AddItem(item);});
            this.Icon(panel,'trash','处理选中的这一叠',inner-90,y,()=>{const item=this.SelectedItem();if(item)model.ProcessSlot(this.selected.slot);this.selected=null;});
        }else if(this.tab==='rules'){
            this.Icon(panel,'minus','移出过滤名单',inner-126,y,()=>{if(this.selected){model.keys.delete(this.selected.key);this.selected=null;R.changed('已移出过滤名单。');}});
            this.Icon(panel,this.clearArmed?'check':'trash',this.clearArmed?'再次点击确认清空':'清空全部过滤名单',inner-90,y,()=>{if(this.clearArmed){model.ClearRules();this.clearArmed=false;}else{this.clearArmed=true;R.changed('再次点击红色确认按钮，清空名单。');}},this.clearArmed,true);
        }else {const id=this.selectedHistoryId;this.Icon(panel,'undo','取回或赎回选中的一组',inner-90,y,()=>{if(id!==null&&model.Recover(id))this.selectedHistoryId=null;});}
        const status=labels[this.tab]+' · '+(model.enabled?'已开启':'已关闭')+' · '+(cfg?.SellInstead?'售卖 '+(R.rate()??'等待房主')+'%':'丢弃')+' · '+model.keys.size+' 项';
        this.Text(panel,short(R.runtime.message||status,37),0,h-29,inner,20,.55);this.Recalculate();
    }
}
