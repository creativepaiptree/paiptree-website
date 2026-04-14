import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Paiptree — Main Experience',
  description: 'Linear-style homepage shell for the Paiptree main company page.',
};

type Pillar = {
  figure: string;
  title: string;
  body: string;
  image: string;
};

type BoardColumn = {
  name: string;
  count: number;
  items: string[];
};

type AgentStep = {
  title: string;
  body: string;
  variant?: 'default' | 'accent';
};

type FooterColumn = {
  title: string;
  links: string[];
};

const referenceImages = {
  hero: 'https://linear.app/cdn-cgi/imagedelivery/fO02fVwohEs9s9UHFwon6A/c7b144b7-4ef0-4991-9bcb-617c6a37d200/f=auto,dpr=2,q=95,fit=scale-down,metadata=none',
  fig02: 'https://linear.app/cdn-cgi/imagedelivery/fO02fVwohEs9s9UHFwon6A/6600ca96-e49b-4fd9-c03a-7979faddad00/f=auto,dpr=2,q=95,fit=scale-down,metadata=none',
  fig03: 'https://linear.app/cdn-cgi/imagedelivery/fO02fVwohEs9s9UHFwon6A/c7fa8f5f-d439-4329-6a65-de549b51e300/f=auto,dpr=2,q=95,fit=scale-down,metadata=none',
};

const pillars: Pillar[] = [
  {
    figure: 'FIG 0.2',
    title: 'Built for purpose',
    body: 'Linear is shaped by the practices and principles of world-class product teams.',
    image: referenceImages.fig02,
  },
  {
    figure: 'FIG 0.3',
    title: 'Powered by AI agents',
    body: 'Designed for workflows shared by humans and agents, from PRD to PR.',
    image: referenceImages.fig03,
  },
  {
    figure: 'FIG 0.4',
    title: 'Designed for speed',
    body: 'Reduces noise and restores momentum to help teams ship with high velocity and focus.',
    image: referenceImages.hero,
  },
];

const boardColumns: BoardColumn[] = [
  {
    name: 'Backlog',
    count: 8,
    items: [
      'ENG-2085 Reduce UI flicker during autonomy...',
      'ENG-2094 Add buffering for autonomy event streams',
      'ENG-2092 Reduce startup delay caused by vehicle sync',
      'ENG-2200 Fix delayed route updates during rerouting',
    ],
  },
  {
    name: 'Todo',
    count: 71,
    items: [
      'ENG-926 Remove UI inconsistencies',
      'ENG-2088 TypeError: Cannot read properties',
      'ENG-924 Upgrade to Claude Opus 4.5',
      'ENG-1882 Optimize load times',
    ],
  },
  {
    name: 'In Progress',
    count: 3,
    items: [
      'ENG-1487 Remove contentData from GraphQL API',
      'MKT-1028 Launch page assets',
      'ENG-2187 Prevent duplicate ride requests...',
    ],
  },
  {
    name: 'Done',
    count: 53,
    items: [
      'ENG-2074 Clean up deprecated APIs...',
      'ENG-1912 Reduce latency in autonomy state...',
      'ENG-1951 Reduce ETA fluctuations during...',
      'ENG-1960 Improve fallback messaging',
    ],
  },
];

const agentSteps: AgentStep[] = [
  {
    title: 'Intake',
    body: 'Turn feedback into work.',
    variant: 'accent',
  },
  {
    title: 'Direction',
    body: 'Plan with shared context.',
  },
  {
    title: 'Execution',
    body: 'Move work across teams and agents.',
  },
  {
    title: 'Review',
    body: 'Review changes in one place.',
  },
  {
    title: 'Insight',
    body: 'See progress clearly.',
  },
];

const footerColumns: FooterColumn[] = [
  {
    title: 'Product',
    links: ['Features', 'Method', 'Integrations', 'Pricing'],
  },
  {
    title: 'Company',
    links: ['About', 'Customers', 'Careers', 'Contact'],
  },
  {
    title: 'Resources',
    links: ['Docs', 'Blog', 'Changelog', 'Guides'],
  },
  {
    title: 'Legal',
    links: ['Terms', 'Privacy', 'Security', 'Status'],
  },
];

function HeroMockWindow() {
  return (
    <div className="linear-hero-window">
      <div className="linear-hero-frame-shell">
        <img src={referenceImages.hero} alt="Linear hero product interface" className="linear-reference-image hero" />
      </div>
    </div>
  );
}

function LogosRow() {
  const logos = ['OpenAI', 'Vercel', 'Ramp', 'Remote', 'Descript', 'Scale', 'Mercury'];

  return (
    <div className="linear-logo-row">
      {logos.map((logo) => (
        <span key={logo}>{logo}</span>
      ))}
    </div>
  );
}

function PillarCard({ pillar }: { pillar: Pillar }) {
  return (
    <article className="linear-shell-card linear-pillar-card">
      <div className="linear-pillar-image-wrap">
        <img src={pillar.image} alt={pillar.title} className="linear-reference-image pillar" />
      </div>
      <span className="linear-figure-label">{pillar.figure}</span>
      <h3>{pillar.title}</h3>
      <p>{pillar.body}</p>
    </article>
  );
}

function IntakeBoard() {
  return (
    <div className="linear-shell-card linear-board-shell">
      <div className="linear-board-head">
        <div>
          <div className="linear-section-kicker">1.0 Intake</div>
          <h3>Turn feedback into work</h3>
        </div>
        <div className="linear-board-actions">
          <span>Add issue</span>
          <span>Open menu</span>
        </div>
      </div>
      <div className="linear-board-grid">
        {boardColumns.map((column) => (
          <div key={column.name} className="linear-board-column">
            <div className="linear-board-column-head">
              <span>{column.name}</span>
              <strong>{column.count}</strong>
            </div>
            <div className="linear-board-list">
              {column.items.map((item) => (
                <div key={item} className="linear-board-item">
                  <span className="linear-priority-dot" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConversationPanel() {
  return (
    <div className="linear-shell-card linear-conversation-panel">
      <div className="linear-thread-header">Thread in #feedback</div>
      <div className="linear-thread-messages">
        <p>didier 12:48 PM Has anyone been looking into the iOS startup performance issues?</p>
        <p>lena 12:48 PM Anyone else noticing the iOS app feels slow to open if you haven’t used it in a bit?</p>
        <p>didier 12:48 PM Yea, we’re still blocking initial render on a full vehicle_state sync every time...</p>
        <p>
          andreas 12:48 PM Feels like we could render sooner and load the rest in the background.
          Probably also worth tracking startup timing so we know how often this happens! @Linear create urgent issues and assign to me
        </p>
      </div>
      <div className="linear-thread-input">Send message</div>
    </div>
  );
}

function DirectionPanel() {
  return (
    <div className="linear-shell-card linear-visual-panel">
      <img src={referenceImages.fig02} alt="Linear direction visual" className="linear-reference-image panel" />
    </div>
  );
}

function AgentOpsPanel() {
  return (
    <div className="linear-shell-card linear-visual-panel">
      <img src={referenceImages.fig03} alt="Linear execution visual" className="linear-reference-image panel" />
    </div>
  );
}

function DiffPanel() {
  const left = [
    '- block startup until vehicle_state refresh completes',
    '- keep loading spinner visible until full sync',
    '- no fallback path when minimum state exists',
  ];
  const right = [
    '+ render shell when minimum state is ready',
    '+ continue vehicle_state refresh in background',
    '+ track startup timing and fallback rate',
  ];

  return (
    <div className="linear-shell-card linear-diff-shell">
      <div className="linear-diff-header">
        <span>Review PRs and agent output</span>
        <span>Diff</span>
      </div>
      <div className="linear-diff-grid">
        <div className="linear-diff-column is-removed">
          {left.map((line) => (
            <div key={line} className="linear-diff-line">{line}</div>
          ))}
        </div>
        <div className="linear-diff-column is-added">
          {right.map((line) => (
            <div key={line} className="linear-diff-line">{line}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InsightPanel() {
  return (
    <div className="linear-insight-grid">
      <div className="linear-shell-card linear-metric-stack">
        <div className="linear-stat-block">
          <span>Cycle health</span>
          <strong>92%</strong>
        </div>
        <div className="linear-stat-block">
          <span>Agent completion</span>
          <strong>61%</strong>
        </div>
        <div className="linear-stat-block">
          <span>Review load</span>
          <strong>14 open</strong>
        </div>
      </div>
      <div className="linear-shell-card linear-chart-shell">
        <div className="linear-chart-header">
          <span>Understand progress at scale</span>
          <span>Last 90 days</span>
        </div>
        <div className="linear-chart-area">
          <div className="linear-chart-line line-blue" />
          <div className="linear-chart-line line-orange" />
          {new Array(8).fill(null).map((_, index) => (
            <span key={index} className={`linear-chart-dot dot-${index + 1}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CommunityTiles() {
  return (
    <div className="linear-community-grid">
      <div className="linear-community-card is-blue">
        <span>Community</span>
        <p>Linear has become the center of gravity for how our team plans, ships, and reviews work.</p>
      </div>
      <div className="linear-community-card is-yellow">
        <span>Teams + agents</span>
        <p>It feels like the first product system that was built for the way modern product teams actually operate.</p>
      </div>
    </div>
  );
}

function SiteFooterColumns() {
  return (
    <div className="linear-footer-grid">
      {footerColumns.map((column) => (
        <div key={column.title} className="linear-footer-col">
          <h3>{column.title}</h3>
          <div>
            {column.links.map((link) => (
              <span key={link}>{link}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MainLinearLikePage() {
  return (
    <div data-theme="company-scale" className="linear-page-shell">
      <Header />
      <main className="linear-main">
        <section className="linear-section-frame linear-hero-block">
          <div className="linear-hero-copy-wrap">
            <div className="linear-hero-copy">
              <h1>
                <span>The product development system</span>
                <span>for teams and agents</span>
              </h1>
              <div className="linear-hero-description-row">
                <p>
                  Purpose-built for planning and building products. Designed for the AI era.
                </p>
                <Link href="/next" className="linear-hero-feature-link">
                  <span className="linear-pulse-dot" />
                  <span>Issue tracking is dead</span>
                  <span className="linear-feature-domain">linear.app/next →</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="linear-bleed-frame-wrap">
          <HeroMockWindow />
        </div>

        <section className="linear-section-frame linear-logos-section">
          <LogosRow />
        </section>

        <section className="linear-section-frame linear-intro-section">
          <div className="linear-copy-block large">
            <h2>
              <strong>A new species of product tool.</strong> Purpose-built for modern teams with AI workflows at its core.
            </h2>
          </div>
          <div className="linear-pillars-grid">
            {pillars.map((pillar) => (
              <PillarCard key={pillar.title} pillar={pillar} />
            ))}
          </div>
        </section>

        <section className="linear-section-frame linear-two-col-section">
          <div className="linear-copy-block">
            <div className="linear-section-kicker">Make product operations self-driving</div>
            <h2>Turn feedback into routed work.</h2>
          </div>
          <div className="linear-showcase-grid two-wide">
            <IntakeBoard />
            <ConversationPanel />
          </div>
        </section>

        <section className="linear-section-frame linear-two-col-section reverse">
          <div className="linear-copy-block">
            <div className="linear-section-kicker">Define the product direction</div>
            <h2>Create direction with shared context.</h2>
          </div>
          <DirectionPanel />
        </section>

        <section className="linear-section-frame linear-two-col-section">
          <div className="linear-copy-block narrow">
            <div className="linear-section-kicker">Move work forward across teams and agents</div>
            <h2>Keep execution clear across people and agents.</h2>
          </div>
          <div className="linear-agent-step-list">
            {agentSteps.map((step) => (
              <article key={step.title} className={`linear-shell-card linear-step-card ${step.variant === 'accent' ? 'is-accent' : ''}`}>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
          <AgentOpsPanel />
        </section>

        <section className="linear-section-frame linear-two-col-section">
          <div className="linear-copy-block narrow">
            <div className="linear-section-kicker">Review PRs and agent output</div>
            <h2>Review changes in one surface.</h2>
          </div>
          <DiffPanel />
        </section>

        <section className="linear-section-frame linear-two-col-section">
          <div className="linear-copy-block narrow">
            <div className="linear-section-kicker">Understand progress at scale</div>
            <h2>See momentum clearly.</h2>
          </div>
          <InsightPanel />
        </section>

        <section className="linear-section-frame linear-two-col-section">
          <div className="linear-copy-block narrow">
            <div className="linear-section-kicker">Community</div>
            <h2>Used by fast product teams.</h2>
          </div>
          <CommunityTiles />
        </section>

        <section className="linear-final-cta linear-section-frame">
          <div className="linear-final-copy">
            <h2>Built for the future. Available today.</h2>
            <p>Use this shell as the visual baseline for the next Paiptree pass.</p>
          </div>
          <div className="linear-hero-actions centered">
            <Link href="/signup" className="linear-primary-button">Sign up</Link>
            <Link href="/contact" className="linear-secondary-button">Contact</Link>
          </div>
        </section>

        <section className="linear-section-frame linear-footer-wrap">
          <SiteFooterColumns />
        </section>
      </main>
      <Footer />
    </div>
  );
}
