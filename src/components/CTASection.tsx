'use client';

import Button from './ui/Button';
import Section from './ui/Section';

export default function CTASection() {
  return (
    <Section background="dark" withMeshGradient padding="lg">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-medium mb-6 text-white leading-tight tracking-tight">
          Ready to get started?
        </h2>
        <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">
          Join thousands of creators and enterprises already using paiptree. to bring their creative vision to life.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Button variant="primary" size="lg" className="rounded-xl">
            Let&apos;s get started
          </Button>
        </div>
      </div>
    </Section>
  );
}