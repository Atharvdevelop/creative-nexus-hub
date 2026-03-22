export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  headline: string;
  bio: string;
  location: string;
  website: string;
  profilePicture: string | null;
  coverColor: string;
  followers: number;
  following: number;
  articlesCount: number;
}

export interface BlogPost {
  id: string;
  author: Pick<UserProfile, 'username' | 'fullName' | 'headline' | 'profilePicture'>;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: 'draft' | 'published';
  featuredImage: string | null;
  createdAt: string;
  publishedDate: string | null;
  readTime: number;
  tags: string[];
  claps: number;
}

export const mockUsers: UserProfile[] = [
  {
    id: '1',
    username: 'marianakova',
    fullName: 'Mariana Kovalenko',
    headline: 'Staff Engineer at Meridian · Writing about distributed systems',
    bio: 'I build things that handle millions of requests and write about the interesting parts. Previously at Cloudflare, now leading platform infrastructure at Meridian. I believe good engineering is storytelling with constraints.',
    location: 'Berlin, Germany',
    website: 'marianakova.dev',
    profilePicture: null,
    coverColor: 'hsl(168, 32%, 32%)',
    followers: 4280,
    following: 312,
    articlesCount: 47,
  },
  {
    id: '2',
    username: 'djibrilsane',
    fullName: 'Djibril Sané',
    headline: 'Product Designer · Design Systems & Accessibility',
    bio: 'Designing for the humans who get forgotten. I specialize in accessible design systems that don\'t compromise on beauty. Currently building the design language at Compose.',
    location: 'Dakar / Paris',
    website: 'djibril.design',
    profilePicture: null,
    coverColor: 'hsl(28, 45%, 42%)',
    followers: 2890,
    following: 198,
    articlesCount: 31,
  },
  {
    id: '3',
    username: 'elenamoretti',
    fullName: 'Elena Moretti',
    headline: 'ML Research Scientist · NLP & Generative Models',
    bio: 'Exploring the boundaries of language models at the intersection of linguistics and machine learning. PhD from ETH Zürich. I write long-form explainers on papers I find beautiful.',
    location: 'Zürich, Switzerland',
    website: 'moretti.ai',
    profilePicture: null,
    coverColor: 'hsl(220, 25%, 30%)',
    followers: 7610,
    following: 445,
    articlesCount: 23,
  },
];

export const mockPosts: BlogPost[] = [
  {
    id: '1',
    author: {
      username: 'marianakova',
      fullName: 'Mariana Kovalenko',
      headline: 'Staff Engineer at Meridian',
      profilePicture: null,
    },
    title: 'The Hidden Cost of Eventually Consistent Systems',
    slug: 'hidden-cost-eventually-consistent',
    excerpt: 'We talk about CAP theorem like it\'s a menu. Pick two, live with trade-offs. But the real cost of eventual consistency isn\'t technical — it\'s cognitive. Your team starts building around assumptions that may not hold.',
    content: `We talk about CAP theorem like it's a menu. Pick two, live with trade-offs. But after running distributed systems at scale for eight years, I've learned that the real cost of eventual consistency isn't technical — it's cognitive.

Your team starts building around assumptions that may not hold. A junior engineer writes a read-after-write that works in testing and fails at 3 AM on a Saturday. The oncall page wakes someone up. Trust erodes.

## The Assumption Tax

Every eventually consistent system comes with what I call the "assumption tax." It's the mental overhead your entire organization pays to reason about data that might not be current.

Consider a simple inventory system. When you read a count of 5 remaining items, is that 5 right now, or 5 as of 200 milliseconds ago? In most cases it doesn't matter. But the cases where it does matter are exactly the cases that cost you money, reputation, or both.

> The problem isn't that your system is eventually consistent. The problem is that your team doesn't know which parts are, and which parts aren't.

## What Actually Works

After migrating three major services from eventually consistent to strongly consistent reads (using CockroachDB's follower reads with bounded staleness), our incident rate dropped by 40%. Not because the system was faster — it was actually slightly slower. But because engineers could reason about it.

The takeaway isn't "always use strong consistency." It's that consistency models are a team communication problem disguised as a technical one.`,
    status: 'published',
    featuredImage: null,
    createdAt: '2026-03-18T10:00:00Z',
    publishedDate: '2026-03-18T10:00:00Z',
    readTime: 8,
    tags: ['distributed-systems', 'architecture', 'engineering-culture'],
    claps: 342,
  },
  {
    id: '2',
    author: {
      username: 'djibrilsane',
      fullName: 'Djibril Sané',
      headline: 'Product Designer · Design Systems',
      profilePicture: null,
    },
    title: 'Why Your Design System Fails When It Meets Real Users',
    slug: 'design-system-fails-real-users',
    excerpt: 'Most design systems are built for designers. Beautiful Figma libraries, pixel-perfect components, elegant documentation. Then a product team tries to build a settings page and everything falls apart.',
    content: `Most design systems are built for designers. Beautiful Figma libraries, pixel-perfect components, elegant documentation. Then a product team tries to build a settings page and everything falls apart.

I've seen this pattern at three companies now. The design system team ships gorgeous components. The product teams can't use them. The gap isn't quality — it's empathy.

## The Settings Page Test

Here's my litmus test for any design system: can a product engineer build a settings page in under two hours using only your components? Not a marketing page. Not a dashboard. A boring, complex, form-heavy settings page with conditional visibility, error states, and nested sections.

If your system handles that gracefully, it handles everything.

## Composition Over Configuration

The systems that work best embrace composition. Instead of a \`<FormField variant="settings-nested-checkbox-group">\`, they provide primitives: a Stack, a Field, a Group, a Conditional. Engineers combine them like sentences.

This requires the design system team to let go of control. Your components will be used in ways you didn't anticipate. That's not a failure — that's adoption.`,
    status: 'published',
    featuredImage: null,
    createdAt: '2026-03-15T14:30:00Z',
    publishedDate: '2026-03-15T14:30:00Z',
    readTime: 6,
    tags: ['design-systems', 'product-design', 'accessibility'],
    claps: 518,
  },
  {
    id: '3',
    author: {
      username: 'elenamoretti',
      fullName: 'Elena Moretti',
      headline: 'ML Research Scientist',
      profilePicture: null,
    },
    title: 'Attention Is Not All You Need: The Case for Hybrid Architectures',
    slug: 'attention-not-all-you-need',
    excerpt: 'The transformer architecture has dominated NLP for seven years. But recent work on state-space models suggests that pure attention may be leaving performance on the table for certain classes of problems.',
    content: `The transformer architecture has dominated NLP for seven years. But recent work on state-space models — particularly Mamba and its successors — suggests that pure attention may be leaving performance on the table for certain classes of problems.

This isn't a "transformers are dead" piece. If you're here for that, close the tab. This is about understanding where attention excels and where it doesn't, based on empirical results from our lab.

## Where Attention Struggles

Attention is quadratic in sequence length. We know this. But the practical implication is more nuanced than "long sequences are slow." The real issue is that attention distributes capacity uniformly across the sequence, even when information density is highly non-uniform.

In genomic sequences, for example, 95% of the signal might be concentrated in 5% of the positions. A state-space model can learn to "cruise" through low-information regions and "attend" to high-information ones, achieving comparable accuracy at a fraction of the compute.

## Our Hybrid Results

We tested a hybrid architecture — transformer layers for high-level reasoning, SSM layers for sequential processing — on three benchmarks. The results were striking: 94.2% of the pure transformer's accuracy at 61% of the training compute.

The future isn't one architecture. It's knowing which tool to reach for.`,
    status: 'published',
    featuredImage: null,
    createdAt: '2026-03-12T09:15:00Z',
    publishedDate: '2026-03-12T09:15:00Z',
    readTime: 11,
    tags: ['machine-learning', 'nlp', 'research'],
    claps: 891,
  },
  {
    id: '4',
    author: {
      username: 'marianakova',
      fullName: 'Mariana Kovalenko',
      headline: 'Staff Engineer at Meridian',
      profilePicture: null,
    },
    title: 'Load Shedding Patterns That Actually Work in Production',
    slug: 'load-shedding-patterns-production',
    excerpt: 'Your service is melting. Traffic is 4x normal. Do you drop requests randomly, or do you have a strategy? Here are three load shedding patterns we\'ve battle-tested at Meridian.',
    content: '',
    status: 'draft',
    featuredImage: null,
    createdAt: '2026-03-20T16:00:00Z',
    publishedDate: null,
    readTime: 0,
    tags: ['infrastructure', 'reliability'],
    claps: 0,
  },
];

export const currentUser = mockUsers[0];

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toString();
}
