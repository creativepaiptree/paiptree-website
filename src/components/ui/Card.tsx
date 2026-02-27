import React from 'react';
import Image from 'next/image';

export interface FeatureCardProps {
  icon?: string;
  title: string;
  description: string;
  gradient?: string;
  className?: string;
  onClick?: () => void;
}

export interface PersonCardProps {
  image?: string;
  emoji?: string;
  title: string;
  description: string;
  gradient?: string;
  className?: string;
  onClick?: () => void;
}

export interface ProductCardProps {
  id?: string;
  name: string;
  description: string;
  icon?: string;
  image?: string;
  className?: string;
  onClick?: () => void;
}

// Feature Card - FeaturesSection에서 사용
export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  gradient = 'from-purple-500/20 to-pink-500/20',
  className = '',
  onClick
}) => {
  return (
    <div 
      className={`text-center cursor-pointer group ${className}`}
      onClick={onClick}
    >
      <div className={`w-20 h-20 bg-gradient-to-br ${gradient} rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300`}>
        <span className="text-3xl">{icon}</span>
      </div>
      <h3 className="text-2xl font-bold mb-4 text-[var(--surface-text)] group-hover:opacity-90 transition-colors">
        {title}
      </h3>
      <p className="text-[var(--surface-text-muted)] text-lg leading-relaxed group-hover:opacity-90 transition-colors">
        {description}
      </p>
    </div>
  );
};

// Person Card - ProductsSection에서 사용
export const PersonCard: React.FC<PersonCardProps> = ({
  image,
  emoji,
  title,
  description,
  gradient = 'from-orange-300/40 to-pink-300/40',
  className = '',
  onClick
}) => {
  return (
    <div 
      className={`relative group cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className={`aspect-[3/4] bg-gradient-to-br ${gradient} rounded-3xl overflow-hidden group-hover:scale-105 transition-transform duration-300`}>
        <div className="absolute inset-0 flex items-center justify-center">
          {image ? (
            <Image src={image} alt={title} width={400} height={400} className="w-full h-full object-cover" />
          ) : (
            <div className="text-6xl opacity-60">{emoji}</div>
          )}
        </div>
      </div>
      <div className="absolute bottom-8 left-8 right-8">
        <h3 className="text-[var(--surface-text)] font-bold text-lg mb-2 group-hover:opacity-90 transition-colors">
          {title}
        </h3>
        <p className="text-[var(--surface-text-muted)] text-sm leading-relaxed group-hover:opacity-90 transition-colors">
          {description}
        </p>
      </div>
    </div>
  );
};

// Product Card - 일반적인 제품 카드
export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  description,
  icon,
  image,
  className = '',
  onClick
}) => {
  return (
    <div 
      className={`glass-card group cursor-pointer hover:bg-[var(--glass-bg)] transition-all duration-300 ${className}`}
      onClick={onClick}
    >
      {image ? (
        <div className="w-full h-32 bg-gray-800 rounded-lg mb-4 overflow-hidden">
          <Image src={image} alt={name} width={400} height={128} className="w-full h-full object-cover" />
        </div>
      ) : icon && (
        <div className="w-16 h-16 bg-gradient-to-br from-stability-purple/20 to-stability-pink/20 rounded-2xl flex items-center justify-center mb-4">
          <span className="text-2xl">{icon}</span>
        </div>
      )}
      
      <h3 className="text-xl font-bold text-[var(--surface-text)] mb-3 group-hover:opacity-90 transition-colors">
        {name}
      </h3>
      <p className="text-[var(--surface-text-muted)] leading-relaxed group-hover:opacity-90 transition-colors">
        {description}
      </p>
    </div>
  );
};

// Default export for most common use case
const Card = {
  Feature: FeatureCard,
  Person: PersonCard,
  Product: ProductCard
};

export default Card;