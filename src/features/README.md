# Features (Micro-Frontends)

This directory represents the **Micro-Frontend** architecture of the Zalando model.

## Concept
In a real-world scenario like Zalando's, each of these folders would be a completely separate application owned by a different team. They would be deployed independently and stitched together on the homepage.

## Rules
1. **Isolation**: Components in `hero/` should not import components from `cart/`. They should be unaware of each other.
2. **Self-Contained**: Each feature folder should contain everything it needs to render: its own components, hooks, and specific logic.
3. **Composition**: The main page (`app/page.tsx`) will simply import these features and arrange them.

## Structure
- `hero/`: The top banner and main merchandising area.
- `navigation/`: The header, search bar, and menu.
- `products/`: Product grids, lists, and individual cards.
- `recommendation/`: "You might also like" and algorithmic suggestions.
- `cart/`: Shopping cart overlay and improved checkout flow.
