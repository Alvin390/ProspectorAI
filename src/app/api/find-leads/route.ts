
import { NextRequest, NextResponse } from 'next/server';
import { FindLeadsOutputSchema } from '@/ai/flows/find-leads.schema';

// Import node-fetch for API calls
import fetch from 'node-fetch';

// Helper to deduplicate leads by contact
function dedupeLeads(leads: any[]) {
  const seen = new Set();
  return leads.filter(lead => {
    if (!lead.contact || seen.has(lead.contact)) return false;
    seen.add(lead.contact);
    return true;
  });
}

// Main handler
export async function POST(req: NextRequest) {
  const { leadProfile } = await req.json();
  console.log('/api/find-leads: Received request for profile:', leadProfile);
  let errors: string[] = [];

  // Helper to enrich contact info (stub for now)
  async function enrichContact(contact: any) {
    // In a real app, this would be a more robust enrichment call
    return {
      ...contact,
      enrichment: {
        linkedin: contact.contact?.includes('linkedin.com') ? contact.contact : '',
        recentNews: '', // Placeholder
        jobTitle: contact.jobTitle || '',
        interests: [], // Placeholder
      }
    };
  }

  // Define sources
  const sources = [
    { name: 'Apollo.io', fn: async () => {
        if (!process.env.APOLLO_API_KEY) {
            errors.push('Apollo.io API key is not configured.');
            return [];
        }
        const apolloRes = await fetch('https://api.apollo.io/v1/mixed_people/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Api-Key': process.env.APOLLO_API_KEY },
          body: JSON.stringify({
            q_organization_domains: [],
            person_titles: ['CEO', 'Founder', 'VP', 'Director', 'CTO'],
            page: 1, per_page: 5, // Keep it small for demo
            ...leadProfile && { q_keywords: leadProfile },
          }),
        });
        if (!apolloRes.ok) throw new Error(`Apollo API failed with status ${apolloRes.status}`);
        const apolloData: any = await apolloRes.json();
        return apolloData.people?.map((p: any) => ({
            id: `${p.name}-${p.organization_name}`, name: p.name, company: p.organization_name,
            contact: p.email || p.linkedin_url || '', jobTitle: p.title || '',
        })) || [];
    }},
    { name: 'Clay.com', fn: async () => {
        // This is a MOCK function to simulate another data source
        console.log('Simulating query to Clay.com...');
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network latency
        return [
            { id: 'Jane Doe-Innovate Inc.', name: 'Jane Doe', company: 'Innovate Inc.', contact: 'jane.d@innovate.com', jobTitle: 'VP of Engineering' },
            { id: 'John Smith-RetailGiant Corp.', name: 'John Smith', company: 'RetailGiant Corp.', contact: 'jsmith@retailgiant.co', jobTitle: 'Director of Marketing' },
        ];
    }}
  ];

  // Run all sources concurrently
  const results = await Promise.allSettled(
      sources.map(async (source) => {
          try {
              console.log(`Querying source: ${source.name}...`);
              const leads = await source.fn();
              console.log(`Source ${source.name} returned ${leads.length} leads.`);
              return leads;
          } catch (e: any) {
              console.error(`Error querying source ${source.name}:`, e.message);
              errors.push(`${source.name} failed: ${e.message}`);
              return [];
          }
      })
  );

  console.log('All lead sources queried.');

  // Merge, dedupe, and enrich
  let allLeads: any[] = results
    .filter((r): r is PromiseFulfilledResult<any[]> => r.status === 'fulfilled' && Array.isArray(r.value))
    .flatMap(r => r.value);
  
  console.log(`Total leads from all sources before deduplication: ${allLeads.length}`);
  allLeads = dedupeLeads(allLeads);
  console.log(`Total leads after deduplication: ${allLeads.length}`);

  console.log('Enriching top 10 leads...');
  const enrichedLeads = await Promise.all(allLeads.slice(0, 10).map(enrichContact));
  console.log('Enrichment complete.');

  // Validate output
  const output = { potentialLeads: enrichedLeads };
  const parsed = FindLeadsOutputSchema.safeParse(output);

  if (!parsed.success) {
    console.error('Final output validation failed:', parsed.error);
    return NextResponse.json({ error: 'Output validation failed', details: parsed.error }, { status: 500 });
  }

  console.log('/api/find-leads: Request successful. Returning leads.');
  return NextResponse.json({ ...output, errors });
}
