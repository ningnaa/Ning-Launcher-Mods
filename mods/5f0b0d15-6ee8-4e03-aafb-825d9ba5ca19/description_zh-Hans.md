# 物品提示图标

在每行物品提示左侧添加小图标，类似 Nil256 制作的 tModLoader 模组 Tooltip Icon。支持按职业区分的伤害、暴击率、速度、击退、防御、镐/斧/锤能力、范围、治疗、魔力、可放置物品、弹药、消耗品、装备、增益时间、材料、钓鱼、带加减号的修饰语，以及专家、大师和研究行。

专家、大师、研究和 Boss 召唤图标与原作一样使用游戏自身的图标。

## Mod.Call

推荐图标尺寸为 22 × 22 像素。纹理可以是 `Texture2D`、资源对象（`ModContent.Request`），或模组中的纹理路径。

```js
const ti = new Ref();
if (ModLoader.TryGetMod('tooltipicon', ti)) {
    ti.value.Call('AddNormalIcon', 'mymod', 'MyLine', ModContent.Request('Assets/MyIcon'));
    ti.value.Call('AddPrefixIcon', 'mymod', 'MyPrefixLine', 'Assets/MyIcon', false);
    ti.value.Call('AddFramedIcon', 'mymod', 'MyLine2', 'Assets/Sheet', Rectangle.new(0, 0, 22, 22), Vector2.new(0, 0));
    ti.value.Call('AddCustomIcon', 'mymod', 'MyLine3', (item, line, spriteBatch, position, color) => {});
    ti.value.Call('AddDamageClassIcon', MyDamageClass, 'Assets/Damage', 'Assets/Speed', null, null);
    ti.value.Call('AddConsumableIcon', (item, line) => item.type === myType, 'Assets/MyConsumable');
    ti.value.Call('AddEquipableIcon', (item, line) => item.type === myType, 'Assets/MyEquip');
    ti.value.Call('AddBuffTimeIcon', (item, line) => item.type === myType, 'Assets/MyBuffTime');
    ti.value.Call('AddBossSummoningItem', ModContent.ItemType('MySummon'));
}
```

请在 `PostSetupContent` 中调用。
