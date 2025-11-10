# Design Document: Culture Page Restructure

## Overview

This design document outlines the restructuring of the Culture page to create a cleaner, more focused layout inspired by modern organizational culture pages. The redesign emphasizes visual clarity, simplified content structure, and improved user engagement through strategic layout choices.

## Architecture

### Page Structure

The Culture page will follow a vertical scrolling layout with the following main sections:

1. **Hero Section** - Introduction and main message
2. **Core Values Section** - Company values in grid layout
3. **Work Style Section** - How the team works (optional, can be merged with values)
4. **Benefits Section** - Categorized perks and benefits
5. **Employee Stories Section** - Team testimonials
6. **CTA Section** - Call-to-action for careers

### Component Hierarchy

```
CulturePage
├── ParticleBackground
├── Header
├── Main Content
│   ├── HeroSection
│   ├── CoreValuesSection
│   ├── BenefitsSection
│   ├── EmployeeStoriesSection
│   └── CTASection
└── Footer
```

## Components and Interfaces

### 1. Hero Section

**Purpose**: Provide immediate context about company culture

**Layout**:
- Centered content with max-width constraint
- Minimal badge/tag at top (optional)
- Large headline with gradient text emphasis
- Supporting paragraph (2-3 sentences max)
- No CTA buttons in hero (keep it clean)

**Styling**:
```typescript
- Container: max-w-4xl mx-auto text-center
- Headline: heading-xl with gradient-text on key word
- Paragraph: body-lg with max-w-3xl
- Spacing: section-padding with mb-16 for content
```

### 2. Core Values Section

**Purpose**: Display company values in an easily scannable format

**Layout**:
- Grid layout: 1 column (mobile) → 2 columns (tablet) → 4 columns (desktop)
- Each value card contains:
  - Icon/emoji in colored circle
  - Value title
  - Brief description (1-2 sentences)

**Data Structure**:
```typescript
interface CoreValue {
  icon: string;
  title: string;
  description: string;
  color: string; // gradient classes
}
```

**Styling**:
- Cards: glass-card with hover effects
- Icon container: w-16 h-16 with gradient background
- Grid gap: gap-8
- Background: bg-secondary for section contrast

### 3. Benefits Section

**Purpose**: Showcase employee benefits organized by category

**Layout**:
- Grid layout: 1 column (mobile) → 2 columns (tablet) → 4 columns (desktop)
- Each category card contains:
  - Category title
  - List of benefits with bullet points

**Data Structure**:
```typescript
interface BenefitCategory {
  category: string;
  items: string[];
}
```

**Styling**:
- Cards: glass-card
- List items: flex with colored dot indicator
- Spacing: space-y-3 for list items
- Background: bg-secondary

### 4. Employee Stories Section

**Purpose**: Share authentic team member experiences

**Layout**:
- Grid layout: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop)
- Each story card contains:
  - Avatar/profile image
  - Name and role
  - Quote/testimonial

**Data Structure**:
```typescript
interface EmployeeStory {
  name: string;
  role: string;
  quote: string;
  avatar: string; // emoji or image URL
}
```

**Styling**:
- Cards: glass-card
- Avatar: gradient circle with emoji/image
- Quote: italic text with quotation marks
- Grid gap: gap-8

### 5. CTA Section

**Purpose**: Drive users to take action (view jobs, learn more)

**Layout**:
- Centered content
- Headline with gradient emphasis
- Supporting text
- 1-2 CTA buttons (primary and secondary)

**Styling**:
- Container: text-center with max-w-2xl
- Buttons: flex gap-4 justify-center
- Spacing: section-padding

## Removed/Simplified Sections

To achieve a cleaner layout similar to the reference site, the following sections will be removed or consolidated:

1. **Work Style Section** - Can be merged into Core Values or removed if redundant
2. **Team Stats Card** - Remove standalone stats card, can integrate key stats elsewhere if needed
3. **Office Environment Section** - Remove or significantly simplify
4. **Duplicate CTAs** - Remove CTAs from hero section, keep only final CTA

## Data Models

### Page Data Structure

```typescript
// Core Values Data
const coreValues: CoreValue[] = [
  {
    icon: '🚀',
    title: 'Innovation',
    description: 'Brief description of innovation value',
    color: 'from-purple-600 to-pink-600'
  },
  // ... 3-4 total values
];

// Benefits Data
const benefits: BenefitCategory[] = [
  {
    category: 'Health & Wellness',
    items: [
      'Comprehensive health insurance',
      'Mental health support',
      // ... 3-4 items per category
    ]
  },
  // ... 4 categories total
];

// Employee Stories Data
const employeeStories: EmployeeStory[] = [
  {
    name: 'Sarah Chen',
    role: 'Senior AI Researcher',
    quote: 'Authentic testimonial quote',
    avatar: '👩‍💻'
  },
  // ... 3 stories total
];
```

## Responsive Design Strategy

### Breakpoints

- Mobile: < 768px (1 column grids)
- Tablet: 768px - 1024px (2 column grids)
- Desktop: > 1024px (3-4 column grids)

### Grid Behavior

```css
/* Core Values & Benefits */
grid-cols-1 md:grid-cols-2 lg:grid-cols-4

/* Employee Stories */
grid-cols-1 md:grid-cols-2 lg:grid-cols-3
```

### Typography Scaling

- Headings: Use responsive heading classes (heading-xl, heading-lg, heading-sm)
- Body text: Use body-lg, body-md, body-sm classes
- Ensure minimum 16px base font size on mobile

## Styling and Theming

### Color Scheme

- Background: var(--bg-primary) and var(--bg-secondary) alternating
- Text: var(--text-primary) and var(--text-secondary)
- Accents: gradient-text for emphasis
- Cards: glass-card component

### Spacing System

- Section padding: section-padding class
- Container max-width: container-max class
- Grid gaps: gap-8 (32px)
- Card padding: p-6 to p-8

### Visual Effects

- Glass morphism: glass-card component
- Hover effects: scale-110 transition on icons
- Gradient text: gradient-text class
- Particle background: ParticleBackground component

## Error Handling

### Missing Data

- If core values array is empty, display fallback message
- If employee stories are missing, hide section entirely
- If benefits data is incomplete, show available categories only

### Image Loading

- Use emoji avatars as default (no external image dependencies)
- Fallback to colored circles if emoji not supported

## Testing Strategy

### Visual Testing

1. Verify layout at all breakpoints (mobile, tablet, desktop)
2. Test grid responsiveness and column stacking
3. Verify text readability and contrast ratios
4. Test hover effects and transitions

### Content Testing

1. Verify all data renders correctly
2. Test with varying content lengths
3. Ensure proper text truncation if needed

### Accessibility Testing

1. Verify keyboard navigation works for all interactive elements
2. Test screen reader compatibility
3. Ensure sufficient color contrast (WCAG AA minimum)
4. Verify touch target sizes on mobile (minimum 44x44px)

### Browser Testing

1. Test on Chrome, Firefox, Safari, Edge
2. Verify mobile browser compatibility (iOS Safari, Chrome Mobile)
3. Test glass-card effects across browsers

## Implementation Notes

### Existing Components to Reuse

- `ParticleBackground` - Keep as-is
- `Header` - Keep as-is
- `Footer` - Keep as-is
- CSS variables and utility classes from globals.css

### New Components Needed

None - all sections will be implemented inline within the page component for simplicity

### Code Organization

- Keep all section data (coreValues, benefits, employeeStories) at the top of the file
- Organize sections in logical reading order
- Use consistent naming conventions for section classes
- Add comments to separate major sections

## Design Decisions and Rationales

1. **Removed Hero CTAs**: Keeps focus on the message rather than immediate action
2. **Simplified Section Count**: Reduces cognitive load and improves content focus
3. **Grid-Based Layouts**: Provides visual consistency and easier responsive behavior
4. **Emoji Avatars**: Eliminates external dependencies and loading issues
5. **Alternating Backgrounds**: Creates visual rhythm and section separation
6. **Single CTA at End**: Guides users through content before asking for action
7. **Consolidated Work Style**: Avoids repetition with core values section
