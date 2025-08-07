import { NextRequest, NextResponse } from 'next/server';
import { FindLeadsOutputSchema } from '@/ai/flows/find-leads.schema';

// Import node-fetch for API calls
import fetch from 'node-fetch';

// Helper to deduplicate leads by email/contact
function dedupeLeads(leads: any[]) {
  const seen = new Set();
  return leads.filter(lead => {
    if (seen.has(lead.contact)) return false;
    seen.add(lead.contact);
    return true;
  });
}

// Main handler
export async function POST(req: NextRequest) {
  const { leadProfile } = await req.json();
  let errors: string[] = [];

  // Helper to enrich contact info (stub for now)
  async function enrichContact(contact: any) {
    // Example enrichment: fetch LinkedIn, company news, etc.
    // In production, use Clay, SerpAPI, or custom scraping here
    return {
      ...contact,
      enrichment: {
        linkedin: contact.contact?.includes('linkedin.com') ? contact.contact : '',
        recentNews: '', // Could use SerpAPI or NewsAPI
        jobTitle: contact.jobTitle || '',
        interests: '', // Could use LinkedIn scraping
      }
    };
  }

  // Run all sources concurrently
  const results = await Promise.allSettled([
    // Apollo.io
    (async () => {
      try {
        const apolloRes = await fetch('https://api.apollo.io/v1/mixed_people/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Api-Key': process.env.APOLLO_API_KEY || '',
          },
          body: JSON.stringify({
            q_organization_domains: [],
            person_titles: ['CEO', 'Founder', 'VP', 'Director', 'CTO'],
            page: 1,
            per_page: 10,
            ...leadProfile && { q_keywords: leadProfile },
          }),
        });
        const apolloData: any = await apolloRes.json();
        if (apolloData.people) {
          return apolloData.people.map((p: any) => ({
            id: `${p.name}-${p.organization_name}`,
            name: p.name,
            company: p.organization_name,
            contact: p.email || p.linkedin_url || '',
            jobTitle: p.title || '',
          }));
        }
      } catch (e) {
        errors.push('Apollo.io failed');
      }
      return [];
    })(),
    // Clay
    (async () => {
      try {
        const clayRes = await fetch('https://api.clay.run/v1/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.CLAY_API_KEY}`,
          },
          body: JSON.stringify({ query: leadProfile, limit: 10 }),
        });
        const clayData: any = await clayRes.json();
        if (clayData.results) {
          return clayData.results.map((r: any) => ({
            id: `${r.name}-${r.company}`,
            name: r.name,
            company: r.company,
            contact: r.email || r.linkedin || '',
            jobTitle: r.title || '',
          }));
        }
      } catch (e) {
        errors.push('Clay failed');
      }
      return [];
    })(),
    // Hunter.io
    (async () => {
      try {
        const hunterRes = await fetch(`https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(leadProfile)}&api_key=${process.env.HUNTER_API_KEY}`);
        const hunterData: any = await hunterRes.json();
        if (hunterData.data && hunterData.data.emails) {
          return hunterData.data.emails.map((e: any) => ({
            id: `${e.value}-hunter`,
            name: e.first_name || '',
            company: e.company || '',
            contact: e.value,
            jobTitle: e.position || '',
          }));
        }
      } catch (e) {
        errors.push('Hunter.io failed');
      }
      return [];
    })(),
    // SerpAPI (Google Search)
    (async () => {
      try {
        const serpRes = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(leadProfile + ' contact')}&api_key=${process.env.SERPAPI_KEY}`);
        const serpData: any = await serpRes.json();
        if (serpData.organic_results) {
          return serpData.organic_results.map((r: any) => ({
            id: `${r.title}-serpapi`,
            name: r.title,
            company: r.displayed_link,
            contact: r.link,
            jobTitle: '',
          }));
        }
      } catch (e) {
        errors.push('SerpAPI failed');
      }
      return [];
    })(),
    // ScraperAPI/BrightData (custom scraping, fallback)
    (async () => {
      // In production, use Puppeteer/Playwright with proxy here
      return [{
        id: 'fallback-contact',
        name: 'Fallback Contact',
        company: 'Fallback Company',
        contact: 'fallback@example.com',
        jobTitle: '',
      }];
    })(),
  ]);

  // Merge, dedupe, and enrich
  let allLeads: any[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled' && Array.isArray(result.value)) {
      allLeads.push(...result.value);
    }
  }
  // Deduplicate
  allLeads = dedupeLeads(allLeads);
  // Enrich contacts concurrently
  const enrichedLeads = await Promise.all(allLeads.slice(0, 10).map(enrichContact));

  // Validate output
  const output = { potentialLeads: enrichedLeads };
  const parsed = FindLeadsOutputSchema.safeParse(output);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Output validation failed', details: parsed.error }, { status: 500 });
  }

  return NextResponse.json({ ...output, errors });
}
