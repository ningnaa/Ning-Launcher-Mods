# Changelog

## v1.7.0
Added
- Getsuga is now its own button
- Cyclone Slash is now its own button
- Attack range added as a growth stat
- Third slash becomes a Sweeping Edge
- Item tooltips follow the blade colour; Rainbow is per-letter
- Prefix size bonus now multiplies reach and hitbox

Changed
- Skill multipliers: Ground Smash 75%, Kuuenzan 80%, Cyclone 60%, Getsuga 500%, Dimensional Slash 1024%
- Knockback unified to 3.25
- Boss progress table reworked: damage cap 126, crit cap 58%, range cap 111%

- | Condition | Damage | Crit | Range |
  |---|---|---|---|
  | Goblin Army | 2 | — | 10% |
  | King Slime | 2 | 3% | 5% |
  | Eye of Cthulhu | 2 | — | 5% |
  | Evil Boss | 3 | — | — |
  | Deerclops | 9 | 4% | — |
  | Queen Bee | — | — | 5% |
  | Skeletron | 3 | 2% | — |
  | Wall of Flesh | 5 | 5% | 10% |
  | Pirate Invasion | 4 | 2% | — |
  | Queen Slime | 4 | — | 5% |
  | Each Mech Boss | 3 | 2% | 5% |
  | All Mech Bosses | 5 | 5% | — |
  | Plantera | 4 | — | 5% |
  | Empress of Light | — | — | 15% |
  | Duke Fishron | — | 10% | — |
  | Golem | 8 | 5% | 15% |
  | Lunatic Cultist | 5 | 5% | — |
  | Stardust Pillar | 5 | — | — |
  | Nebula Pillar | — | — | 5% |
  | Vortex Pillar | — | 5% | — |
  | Solar Pillar | 6 | 6% | 6% |
  | Moon Lord | 50 | — | 10% |

- | Skill | Unlock |
  |---|---|
  | Throw & Dash | Goblin Army |
  | Cyclone Slash | Evil Boss |
  | Kuuenzan | Queen Bee |
  | Ground Smash | Skeletron |
  | Getsuga | Wall of Flesh |
  | Dimensional Slash | All three Mech Bosses |

Removed
- Removed the Ground Smash / Getsuga ModConfig switch
- Removed the Kuuenzan / Cyclone ModConfig switch
- Removed Cyclone's projectile reflection

## v1.6.1
Added
- Cyclone Slash unlocks after Skeletron; 2 charge per frame, slower fall and faster horizontal movement while active
- Ground Smash and Getsuga gain a 1.25 s cooldown
- Kuuenzan now deals two hits (8-frame interval)
- All dust colours follow the blade main/secondary colour
- Rainbow skin uses a random hue per burst
- Ground Smash i-frames reduced to descend (12f) and impact (15f)

## v1.6.0
Added
- Getsuga: the Ground Smash key could be switched to it
- Rainbow and Amurasama skins, 23 in total
- Each blade has its own charge / combo bars with a decoration layer
- Item names tinted per skin; Rainbow is a per-letter rainbow
- Getsuga combo cost configurable in ModConfig (default 3)
- I-frames: Ground Smash 6/12/15/20, Dimensional Slash 15/120, Dash 6, Kuuenzan 12, Breaker 15
- Ground Smash / Getsuga / Kuuenzan / Dimensional Slash put Ground Smash on a 1.5 s cooldown

Fixed
- Ground Smash charging let the player pass upward through blocks
- Reforge price was 0
- Removed Him

## v1.5.1
- The Murasama recipe is unified: Copper Shortsword + 48 Iron/Lead Bars + 16 Fallen Stars at an Iron Anvil

## v1.5.0
- Panel damage / crit grow with boss progress (damage 15 → 70, crit 4% → 34%)
- Skills unlock by progress: Throw (Goblin Invasion), Dash (Evil Boss), Ground Smash & Kuuenzan (Skeletron), Dimensional Slash (Wall of Flesh)
- Growth can be disabled in ModConfig
- New toggle: Dimensional Slash plays the full-screen rift effect
- With "Dimensional Slash requires a hit" off, it triggers on reaching the blade
- The 21 free-skin recipes were merged into a RecipeGroup (64 → 22 recipes)
- Damage tuning: Ground Smash 1.5×, Dash 1.25×, Dimensional Slash 3× panel damage

## v1.4.0
- Everything can be customised in ModConfig
- All skills let you configure their combo / charge cost in ModConfig
- Dimensional Slash shader slash count configurable in [5,50]
- Removed Him

## v1.3.0
- The original 4 skill keys were merged into 2 smart keys (Combat Art, Finisher)
- Combat Art charges, throws at full, and chains into a dash; Finisher covers Kuuenzan and Ground Smash
- Longer blade field time; Dash hits restore 80 charge and grant i-frames
- Kuuenzan can reflect projectiles for combo points; numbers tuned
- Improved Chinese localisation
- Removed Him

## 1.0.4
- Original release

