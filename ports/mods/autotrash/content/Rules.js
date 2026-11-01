export const COINS = new Map([[71,1],[72,100],[73,10000],[74,1000000]]);
export const PICKUP_PROTECTED = new Set([58,184,1734,1735,1867,1868,3453,3454,3455,3817]);

export function validKey(key, vanillaCount) {
    if(typeof key!=='string' || key.length>220)return false;
    if(/^v:[1-9]\d*$/.test(key))return Number(key.slice(2))<vanillaCount;
    return /^m:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[^\x00-\x1f/]{1,160}$/.test(key);
}

export function readState(tag, vanillaCount) {
    if(!tag || Object.keys(tag).length===0)return {keys:[],enabled:false,noValue:false,valid:true};
    const valid=tag.format===1 && Array.isArray(tag.keys) && tag.keys.length<=16384 &&
        tag.keys.every(k=>validKey(k,vanillaCount)) && typeof tag.enabled==='boolean' && typeof tag.noValue==='boolean';
    return valid?{keys:[...new Set(tag.keys)],enabled:tag.enabled,noValue:tag.noValue,valid:true}:
        {keys:[],enabled:false,noValue:false,valid:false};
}

export function matches(item, keys, noValue) {
    if(!item || !item.key || item.type<=0 || !Number.isInteger(item.stack) || item.stack<=0 || item.favorite || COINS.has(item.type) || item.unloaded)return false;
    return keys.has(item.key) || (noValue && item.value===0 && !item.bossBag && !item.nebula && !PICKUP_PROTECTED.has(item.type));
}

export function saleValue(value,stack,percent) {
    if(!Number.isInteger(value)||value<0||!Number.isInteger(stack)||stack<=0||!Number.isInteger(percent)||percent<1||percent>100)return null;
    const product=value*stack*percent;
    return Number.isSafeInteger(product)?Math.floor(product/100):null;
}

/** Coin credit is planned without touching live inventory. Non-coins/favorites are never moved. */
export function walletPlan(slots,credit) {
    if(!Number.isSafeInteger(credit)||credit<0)return null;
    let total=credit;
    const available=[],oldCoins=[];
    for(let i=0;i<Math.min(54,slots.length);i++) {
        const s=slots[i];if(!s || s.favorite)continue;
        if(COINS.has(s.type) && s.stack>0) {
            if(!Number.isInteger(s.stack))return null;
            total+=COINS.get(s.type)*s.stack;oldCoins.push(i);available.push(i);
        }else if(s.type<=0 || s.stack<=0)available.push(i);
    }
    if(!Number.isSafeInteger(total)||total<0)return null;
    available.sort((a,b)=>(a>=50?0:oldCoins.includes(a)?1:2)-(b>=50?0:oldCoins.includes(b)?1:2)||a-b);
    const coins=[];
    for(const type of [74,73,72,71]) {
        let count=Math.floor(total/COINS.get(type));total%=COINS.get(type);
        while(count>0) {
            if(coins.length>=available.length)return null;
            const stack=Math.min(count,100);coins.push({type,stack});count-=stack;
        }
    }
    const changes=new Map(oldCoins.map(i=>[i,{type:0,stack:0}]));
    coins.forEach((coin,i)=>changes.set(available[i],coin));
    return [...changes].map(([slot,value])=>({slot,...value}));
}

export function moneyText(value) {
    if(!value)return '0 铜币';
    const parts=[];
    for(const [unit,label] of [[1000000,'铂金币'],[10000,'金币'],[100,'银币'],[1,'铜币']]) {
        const n=Math.floor(value/unit);if(n)parts.push(n+' '+label);value%=unit;
    }
    return parts.join(' ');
}
