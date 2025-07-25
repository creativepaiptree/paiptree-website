// Common types used across components

export interface Product {
  id: string;
  name: string;
  description: string;
  icon?: string;
  image?: string;
}

export interface Feature {
  id?: string;
  icon: string;
  title: string;
  description: string;
  gradient?: string;
}

export interface Person {
  id?: string;
  name?: string;
  title: string;
  description: string;
  image?: string;
  emoji?: string;
  gradient?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  image?: string;
  link?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: React.ReactNode;
}

export interface NavigationItem {
  label: string;
  href: string;
  external?: boolean;
}

// Theme related types
export type ColorVariant = 'primary' | 'secondary' | 'purple' | 'pink' | 'blue';
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Spacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ClickableComponentProps extends BaseComponentProps {
  onClick?: () => void;
  disabled?: boolean;
}