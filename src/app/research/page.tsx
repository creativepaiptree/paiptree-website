import { redirect } from 'next/navigation';

const researchPapers = [
  {
    title: 'Stable Diffusion 3: Scaling Rectified Flow Transformers for High-Resolution Image Synthesis',
    authors: ['Patrick Esser', 'Sumith Kulal', 'Andreas Blattmann', 'Rahim Entezari'],
    date: '2024-03-05',
    category: 'Computer Vision',
    abstract: 'We present Stable Diffusion 3, a new text-to-image model that significantly improves upon previous versions through architectural innovations and scaling.',
    arxivLink: '#',
    codeLink: '#',
    featured: true
  },
  {
    title: 'SDXL: Improving Latent Diffusion Models for High-Resolution Image Synthesis',
    authors: ['Dustin Podell', 'Zion English', 'Kyle Lacey', 'Andreas Blattmann'],
    date: '2024-02-20',
    category: 'Machine Learning',
    abstract: 'SDXL is a latent diffusion model for text-to-image synthesis that achieves state-of-the-art results in image quality and composition.',
    arxivLink: '#',
    codeLink: '#',
    featured: false
  },
  {
    title: 'High-Resolution Image Synthesis with Latent Diffusion Models',
    authors: ['Robin Rombach', 'Andreas Blattmann', 'Dominik Lorenz', 'Patrick Esser'],
    date: '2024-01-15',
    category: 'Computer Vision',
    abstract: 'By decomposing the image formation process into a sequential application of denoising autoencoders, diffusion models achieve impressive results.',
    arxivLink: '#',
    codeLink: '#',
    featured: false
  },
  {
    title: 'Scaling Autoregressive Video Models',
    authors: ['Wilson Yan', 'Yunzhi Zhang', 'Pieter Abbeel', 'Aravind Srinivas'],
    date: '2024-01-10',
    category: 'Video Generation',
    abstract: 'We explore scaling laws for autoregressive video models and demonstrate significant improvements in video quality and temporal consistency.',
    arxivLink: '#',
    codeLink: '#',
    featured: false
  }
];

const researchAreas = [
  {
    title: 'Generative Models',
    description: 'Advancing the state-of-the-art in diffusion models, GANs, and autoregressive models for high-quality content generation.',
    icon: '🎨',
    papers: 12
  },
  {
    title: 'Multimodal AI',
    description: 'Bridging vision, language, and audio to create more comprehensive and versatile AI systems.',
    icon: '🔗',
    papers: 8
  },
  {
    title: 'AI Safety',
    description: 'Developing robust safety measures and alignment techniques for responsible AI deployment.',
    icon: '🛡️',
    papers: 6
  },
  {
    title: 'Efficiency & Optimization',
    description: 'Making AI models faster, smaller, and more accessible through novel optimization techniques.',
    icon: '⚡',
    papers: 10
  }
];

export default function ResearchPage() {
  // Research 페이지는 About 페이지로 리다이렉트 (연구 내용이 About에 통합됨)
  redirect('/about');
}