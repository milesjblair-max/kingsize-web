# Kingsize Website Uplift - Architecture Overview

This project is set up to mimic the architecture of **Zalando**, but adapted for a single developer learning the ropes.

## The Goal
To create a "Micro-Frontend" style website where independent features are composed together to form a cohesive experience.

## Folder Structure

### 1. `src/features/` (The Fragments)
These are your building blocks. Each folder here is like a mini-application.
- **Hero**: The big banner at the top.
- **Navigation**: The menu and search.
- **Products**: The item lists.
- **Recommendations**: The "You might also like" section.
- **Cart**: The shopping cart.

### 2. `src/services/` (The Backend)
These "services" simulate fetching data from a real backend.
- **api.ts**: Generic data fetcher.
- **catalogue.ts**: Simulates the Product Service (fetching items).
- **cms.ts**: Simulates the Content Service (deciding layout).

### 3. `src/components/` (The Design System)
These are the shared "Lego blocks" that every feature uses.
- **ui**: Buttons, Cards, Inputs.
- **layout**: Grids, Containers.

## core Principles

1. **Isolation**: Features shouldn't depend on each other.
2. **Data-Driven**: Features should ask `services` for data, not hardcode it.
3. **Consistency**: Use `components` for all styling.

## Getting Started

1. Run the development server:
   ```bash
   npm run dev
   ```
2. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
3. Start editing files in `src/features/` to see changes.
