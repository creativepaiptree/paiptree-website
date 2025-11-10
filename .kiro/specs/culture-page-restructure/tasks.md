# Implementation Plan: Culture Page Restructure

- [ ] 1. Simplify hero section
  - Remove CTA buttons from hero section
  - Remove optional badge/tag element
  - Simplify hero content to headline and single paragraph
  - Ensure centered layout with proper max-width constraints
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 2. Update core values section layout
  - Verify grid layout classes (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
  - Ensure consistent card styling with glass-card
  - Verify icon container sizing and gradient backgrounds
  - Test hover effects on value cards
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 3. Remove or consolidate work style section
  - Remove the "How We Work" section entirely
  - Remove the "Team Stats" card component
  - Ensure smooth transition between core values and benefits sections
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 4. Update benefits section
  - Verify grid layout for benefit categories (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
  - Ensure consistent bullet point styling with colored dots
  - Verify glass-card styling on all benefit cards
  - Test responsive behavior at all breakpoints
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3_

- [ ] 5. Update employee stories section
  - Verify grid layout (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
  - Ensure avatar, name, role, and quote are properly displayed
  - Verify glass-card styling
  - Test responsive behavior
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 5.1, 5.2, 5.3_

- [ ] 6. Remove office environment section
  - Remove the "Our Spaces" section entirely
  - Remove associated office location cards
  - Remove placeholder icon grid
  - _Requirements: 6.1, 6.2_

- [ ] 7. Update final CTA section
  - Verify centered layout with max-width constraint
  - Ensure headline uses gradient text emphasis
  - Verify button layout (flex gap-4 justify-center)
  - Update button text if needed
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 8. Verify section spacing and backgrounds
  - Ensure alternating backgrounds (bg-primary and bg-secondary)
  - Verify consistent section-padding on all sections
  - Check vertical spacing between sections
  - _Requirements: 6.3, 6.4_

- [ ] 9. Test responsive behavior
  - Test layout at mobile breakpoint (< 768px)
  - Test layout at tablet breakpoint (768px - 1024px)
  - Test layout at desktop breakpoint (> 1024px)
  - Verify all grids stack properly on mobile
  - Verify text remains readable at all sizes
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 10. Accessibility verification
  - Verify keyboard navigation for interactive elements
  - Check color contrast ratios
  - Verify touch target sizes on mobile
  - Test with screen reader
  - _Requirements: 5.5_
