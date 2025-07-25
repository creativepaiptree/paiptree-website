// src/components/CreativeUsecasesSection.tsx
const CreativeUsecasesSection = () => {
  const usecases = [
    {
      title: 'Marketing',
      description: 'Create high-quality on-brand assets for every campaign using our image generation and editing tools.',
    },
    {
      title: 'Entertainment',
      description: 'From storyboarding to color grading, our image and video tools help you get to the final cut faster.',
    },
    {
      title: 'Gaming',
      description: 'Build immersive worlds with our 3D and 4D video models that take volumetric generative media to the next level.',
    },
  ];

  return (
    <section className="py-16 bg-black">
      <div className="container mx-auto px-6 text-left max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-semibold mb-4 tracking-tight">
          It starts with real creatives.
        </h2>
        <p className="text-lg text-gray-400 mb-16 max-w-2xl leading-relaxed">
          Our multimodal media generation and editing tools are designed for the best in the business.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {usecases.map((usecase) => (
            <div key={usecase.title} className="bg-neutral-900/60 p-8 rounded-xl border border-neutral-800 hover:bg-neutral-900/80 transition-all duration-300">
              <h3 className="text-xl font-medium mb-4 text-white">{usecase.title}</h3>
              <p className="text-gray-400 leading-relaxed">{usecase.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CreativeUsecasesSection;
