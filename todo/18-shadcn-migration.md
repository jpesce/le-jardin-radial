# 18 — Migrate interactive primitives to shadcn/Radix

## Context

Custom Popover and Checkbox reinvent what Radix UI provides with focus trapping, viewport-aware positioning, correct WAI-ARIA roles, scroll locking, and focus restoration. For a portfolio project, using industry-standard primitives signals pragmatism over reinvention.

## Scope

Replace custom interactive primitives with shadcn/Radix equivalents. Keep domain-specific components custom.

## Migrate

| Component | Current                                              | Target          | Why                                                   |
| --------- | ---------------------------------------------------- | --------------- | ----------------------------------------------------- |
| Popover   | Custom (click-outside, escape, cloneElement trigger) | Radix Popover   | Focus trapping, Floating UI positioning, correct ARIA |
| Checkbox  | Custom styled input                                  | shadcn Checkbox | Radix-based, accessible, indeterminate support        |

## Keep custom

| Component                                                | Why                                                       |
| -------------------------------------------------------- | --------------------------------------------------------- |
| Button                                                   | Animated width variant with react-use-measure is unique   |
| BackButton                                               | Mount-aware transition suppression is unique              |
| Logo, SadFlower                                          | Brand illustrations, no library equivalent                |
| RadialChart                                              | D3 imperative visualization                               |
| MonthGrid                                                | Domain-specific bloom cycle editor                        |
| FlowerRow, FlowerGardenView, FlowerCatalog, FlowerEditor | Domain-specific                                           |
| Reset, Share, GardenPanel                                | Compose Popover — migrate to use Radix Popover internally |

## Impact

- Reset, Share, GardenPanel currently use our custom Popover — they'd switch to Radix Popover
- Popover stories in Storybook would update to show Radix-based behavior
- Popover unit tests would verify Radix integration
- Floating UI replaces `calc(100dvh - 5rem)` hardcoded max-height

## Considerations

- shadcn is copy-paste (not a dependency) — we own the code
- Radix adds ~5 packages as dependencies
- Bundle size impact is small (~10-15KB)
- Existing E2E tests should pass unchanged (behavior is the same, implementation changes)
