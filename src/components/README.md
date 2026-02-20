# Components (Design System)

This directory represents the **Design System Governance** of the Zalando model.

## Concept
Zalando maintains a company-wide design system (like "Mosaic" or "ZDS") to ensure consistency. These are the reusable *atoms* and *molecules* that all teams must use.

## Rules
1. **Reusability**: These components must be generic. A `Button` here should work for the Cart team AND the Hero team.
2. **Consistency**: By using these components, we ensure that typography, spacing, and colors are identical across the entire site.
3. **No Business Logic**: These components should just focus on *how things look*, not *how things work*.

## Structure
- `ui/`: Primitive elements like Buttons, Inputs, Cards, Icons.
- `layout/`: Structural wrappers like Containers, Grids, and Sections.
