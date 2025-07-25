'use client';

import Section from './ui/Section';
import Card from './ui/Card';
import { Person } from '@/types';

interface ProductsSectionProps {
  className?: string;
}

const personCards: Person[] = [
  {
    id: 'marketing',
    title: 'Marketing',
    description: 'Create compelling visual content for campaigns and brand storytelling',
    emoji: '👩',
    gradient: 'from-orange-300/40 to-pink-300/40'
  },
  {
    id: 'entertainment',
    title: 'Entertainment',
    description: 'Power next-generation content creation for film and media',
    emoji: '👨',
    gradient: 'from-blue-300/40 to-purple-300/40'
  },
  {
    id: 'gaming',
    title: 'Gaming',
    description: 'Generate assets and environments for immersive gaming experiences',
    emoji: '🧑',
    gradient: 'from-green-300/40 to-teal-300/40'
  }
];

export default function ProductsSection({ className = '' }: ProductsSectionProps) {
  return (
    <Section id="products" background="dark" withMeshGradient padding="lg">
        {/* 상단 텍스트 - Stability.ai 정확한 텍스트 */}
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 max-w-4xl">
            It starts with real creatives.
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl">
            Our multimodal media generation and editing tools are designed for the best in the business.
          </p>
        </div>

        {/* 스크린샷과 똑같은 3개 인물 카드 레이아웃 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {personCards.map((person) => (
            <Card.Person
              key={person.id}
              emoji={person.emoji}
              title={person.title}
              description={person.description}
              gradient={person.gradient}
            />
          ))}
        </div>
    </Section>
  );
}