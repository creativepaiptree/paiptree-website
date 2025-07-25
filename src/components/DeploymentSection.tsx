'use client';

import Section from './ui/Section';
import Card from './ui/Card';
import { Feature } from '@/types';

interface DeploymentSectionProps {
  className?: string;
}

const deploymentOptions: Feature[] = [
  {
    id: 'self-host',
    icon: '🏠',
    title: 'Self-Host',
    description: 'Deploy on your own infrastructure with complete control and customization options.',
    gradient: 'from-blue-500/20 to-purple-500/20'
  },
  {
    id: 'api',
    icon: '⚡',
    title: 'API',
    description: 'Get started instantly with our cloud API. Scale as you grow with simple integration.',
    gradient: 'from-purple-500/20 to-pink-500/20'
  },
  {
    id: 'cloud-service',
    icon: '☁️',
    title: 'Cloud Service',
    description: 'Fully managed cloud deployment with enterprise-grade security and reliability.',
    gradient: 'from-green-500/20 to-blue-500/20'
  }
];

export default function DeploymentSection({ className = '' }: DeploymentSectionProps) {
  return (
    <Section background="dark" padding="lg" className={className}>
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Deploy your way
        </h2>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Choose the deployment option that fits your needs. From cloud APIs to on-premise solutions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {deploymentOptions.map((option) => (
          <Card.Feature
            key={option.id}
            icon={option.icon}
            title={option.title}
            description={option.description}
            gradient={option.gradient}
          />
        ))}
      </div>
    </Section>
  );
}