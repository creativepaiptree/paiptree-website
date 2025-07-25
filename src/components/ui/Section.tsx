import React from 'react';

export interface SectionProps {
  id?: string;
  className?: string;
  children: React.ReactNode;
  background?: 'dark' | 'darker' | 'transparent';
  withMeshGradient?: boolean;
  withGridBackground?: boolean;
  withNoiseOverlay?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

const Section: React.FC<SectionProps> = ({
  id,
  className = '',
  children,
  background = 'dark',
  withMeshGradient = false,
  withGridBackground = false,
  withNoiseOverlay = false,
  padding = 'lg'
}) => {
  const baseStyles = 'relative overflow-hidden';
  
  const backgrounds = {
    dark: 'bg-stability-dark',
    darker: 'bg-stability-darker',
    transparent: 'bg-transparent'
  };

  const paddings = {
    sm: 'py-12',
    md: 'py-16', 
    lg: 'py-24',
    xl: 'py-32'
  };

  const sectionClassName = [
    baseStyles,
    backgrounds[background],
    paddings[padding],
    className
  ].filter(Boolean).join(' ');

  return (
    <section id={id} className={sectionClassName}>
      {/* Background Elements */}
      {withMeshGradient && (
        <div className="absolute inset-0 mesh-gradient opacity-10"></div>
      )}
      
      {withGridBackground && (
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
      )}
      
      {withNoiseOverlay && (
        <div className="absolute inset-0 noise-overlay"></div>
      )}

      {/* Content Container */}
      <div className="max-w-8xl mx-auto px-6 relative z-10">
        {children}
      </div>
    </section>
  );
};

export default Section;