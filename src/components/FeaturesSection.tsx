import Section from './ui/Section';
import Card from './ui/Card';
import { Feature } from '@/types';

interface FeaturesSectionProps {
  className?: string;
}

const features: Feature[] = [
  {
    id: 'lightning-fast',
    icon: '⚡',
    title: 'Lightning fast',
    description: 'Generate high-quality content in seconds, not minutes. Our optimized models deliver results instantly.',
    gradient: 'from-purple-500/20 to-pink-500/20'
  },
  {
    id: 'precise-control',
    icon: '🎯',
    title: 'Precise control',
    description: 'Fine-tune every aspect of generation with advanced parameters and guidance controls.',
    gradient: 'from-blue-500/20 to-green-500/20'
  },
  {
    id: 'global-community',
    icon: '🌍',
    title: 'Global community',
    description: 'Join millions of creators worldwide using our models to build amazing applications.',
    gradient: 'from-orange-500/20 to-red-500/20'
  }
];

export default function FeaturesSection({ className = '' }: FeaturesSectionProps) {
  return (
    <Section background="dark" withGridBackground padding="lg">
        {/* Stability.ai 스타일 3개 카드 섹션 */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Built for creators
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Everything you need to bring your creative vision to life, from ideation to production.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((feature) => (
            <Card.Feature
              key={feature.id}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              gradient={feature.gradient}
            />
          ))}
        </div>
    </Section>
  );
}