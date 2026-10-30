# 游戏内 Wiki 查询

**Wikithis** 让你直接在游戏内查询选中物品的 Wiki 页面！

支持多种语言。

---

[c/AAAAAA:默认不支持模组物品；如需为自己的模组添加支持，请参考下方方法。]

## 模组兼容

> [!NOTE]
> 你的模组必须有自己的 Wiki 才能使用此功能。

可以用以下方法添加兼容：

```js
export default class MyMod extends Mod {
    PostSetupContent() {
        // First, get the Wikithis mod instance
        const mod = new Ref();
        if (ModLoader.TryGetMod('wikithis', mod)) {
            // the base URL of the wiki
            const baseUrl = 'https://terrariamods.wiki.gg/wiki/MyMod/';
            // Here you would enter the type of all items that have a page on your wiki
            const itemTypes = [];

            // Call the method in WikiThis
            mod.value.Call(0, baseUrl, itemTypes);
        }
    }
}
```

---

每个物品的链接由 baseURL 加上物品名称组成，例如 `https://terrariamods.wiki.gg/wiki/MyMod/Example_Item`。

**使用的是物品的英文名称。**

---

## 替换单个条目

如果“基础 URL + 物品名称”的组合不适用，可以为该物品指定完整链接：

```js
mod.value.Call(1, ModContent.ItemType('ExampleItem'), 'https://terrariamods.wiki.gg/wiki/MyMod/CustomWikiPage')
```
