## v1.2.2 · 2026-11-20

**Fixed: star tear no longer counts kills after a death**

- Kill counting moved from player hit hooks to the NPC death event; the hit hooks
  do not always fire on this loader, so a death (which zeroes progress) left the
  accessory permanently stuck at zero.
- Dropped the `NPCID.Sets.CountsAsCritter` lookup (the table can be unavailable in
  the merged pack and the exception was swallowed). Now uses the same rule as loot:
  skip units with <=5 max life or no attack.
- Diagnostics now print `kills / lowest / equipped / tier` every 10 seconds.
