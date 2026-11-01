# 1.03

- World Warper and Modified World Warper: use to open the full-screen map,
  then hold a point for 0.7 seconds to teleport. Also works from inventory.
  Dragging, pinching and zoom changes cancel the gesture.
- Only a successful teleport consumes the normal World Warper; the modified
  version is reusable. Boss, death and blocked-destination guards remain.
- Cancel Discord teleport targeting when the player dies or returns to the menu.
- Loader equipment initialization errors in the submitted report require a
  launcher update, not just this mod package; they are not claimed fixed here.

# 1.02

- Content for other mods is back, as in the original: it only appears when that
  mod (its Bunny Loader port) is installed. Shops: Calamity, Thorium,
  Redemption, Spirit, Shards of Atheria, imkSushi's, chadsfurni items; Calamity
  Music / Thorium music boxes; modded boss bag pages. Thorium crit for the
  combinations, Calamity defense / Revengeance prices / DoG flags, Census
  spawn conditions, Materia Transmutator MK2 (Calamity).
- Now ported: lifeform analyzer arrow, Luck Charm prefixes, Alchemist Charm
  potion saving and longer buffs, Excavation 3x3 mining, Greater Dangersense
  projectile highlight, trap damage, Materia Transmutator water/lava/honey.
- Fixed: a crash when reading `Main.runningCollectorsEdition` on mobile.
- Still not ported: the vanilla town NPC attack changes (the runtime has no
  hook for vanilla town NPC attacks).

# 1.01

- Restored the Calamity, Thorium, MorePotions and Spirit combination potions,
  as in the original: they only exist with that mod (its Bunny Loader port)
  installed, run that mod's own buffs, are made from its potions (Alchemy
  Table), and the Young Brewer sells them. Without the mod they don't appear.
- Global Teleporter: use it and tap a spot on the screen to teleport there.
  Inside blocks, it looks for free space above; if there is none, nothing is
  spent. Not while a boss is alive.
- Discord teleport: press the touch button, then tap a spot on the screen.
- Fixed: the Penny and the Materia Transmutator didn't count as an Alchemy
  Table; the Catch NPC option did nothing; town NPCs weren't at full life after
  Moon Lord; summon items could spawn far away or inside blocks; teleport
  potions and the Fishing combination's fire ring weren't synced in
  multiplayer; some errors were logged every frame.

# 1.0

- First port of AlchemistNPCLite 1.9.8 to Bunny Loader.
- Ported: potions and combination potions, buffs, the 8 town NPCs with their
  shops, the crafting stations, charms, the teleport potions and items, the
  NPC summon items and the World Control Unit.
- Removed: everything for Calamity, Thorium and other mods.
- Changed for mobile:
  - The shop page panel became the second chat button, which moves to the
    next page.
  - The Discord teleport key is a touch button (Settings > Controls > Edit).
  - World Control Unit: use switches day and night; use while holding down
    switches rain (sandstorm in the desert).
  - Tapping the Excavation buff icon switches between 1x1 and 3x3 mining.
- Not yet ported: the Lifeform Analyzer pointer, the global item and
  projectile changes (3x3 Excavation mining, Traps effect) and the attack
  changes for vanilla town NPCs.
