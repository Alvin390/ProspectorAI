import { NextRequest, NextResponse } from 'next/server';
import { FindLeadsOutputSchema } from '@/ai/flows/find-leads.schema';

// Import node-fetch for API calls
import fetch from 'node-fetch';

// Helper to deduplicate leads by contact
function dedupeLeads(leads: any[]) {
  console.log('Deduplicating leads...');
  const seen = new Set();
  const deduped = leads.filter(lead => {
    if (!lead.contact || seen.has(lead.contact)) {
      console.log(`Duplicate or missing contact skipped:`, lead);
      return false;
    }
    seen.add(lead.contact);
    return true;
  });
  console.log(`Deduplication complete. ${deduped.length} unique leads remain.`);
  return deduped;
}

// Main handler
export async function POST(req: NextRequest) {
  const { leadProfile } = await req.json();
  console.log('/api/find-leads: Received request for profile:', leadProfile);
  let errors: string[] = [];

  // Helper to enrich contact info (stub for now)
  async function enrichContact(contact: any) {
    console.log('Enriching contact:', contact);
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

  // Parse lead profile into keywords and attributes for scrapers
  const profileKeywords = typeof leadProfile === 'string' ? leadProfile.split(/[,;\n]+/).map(k => k.trim()).filter(Boolean) : [];
  console.log('Parsed lead profile keywords:', profileKeywords);

  // Define sources
  const sources = [
    { name: 'Apollo.io', fn: async () => {
        if (!process.env.APOLLO_API_KEY) {
            errors.push('Apollo.io API key is not configured.');
            console.error('Apollo.io API key missing.');
            return [];
        }
        console.log('Apollo.io: Searching with keywords:', profileKeywords);
        try {
          const apolloRes = await fetch('https://api.apollo.io/v1/mixed_people/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Api-Key': process.env.APOLLO_API_KEY },
            body: JSON.stringify({
              q_organization_domains: [],
              person_titles: ['CEO', 'Founder', 'VP', 'Director', 'CTO'],
              page: 1, per_page: 5, // Keep it small for demo
              ...profileKeywords.length > 0 && { q_keywords: profileKeywords.join(', ') },
            }),
          });
          if (!apolloRes.ok) throw new Error(`Apollo API failed with status ${apolloRes.status}`);
          const apolloData: any = await apolloRes.json();
          console.log('Apollo.io raw response:', apolloData);
          const leads = apolloData.people?.map((p: any) => ({
              id: `${p.name}-${p.organization_name}`, name: p.name, company: p.organization_name,
              contact: p.email || p.linkedin_url || '', jobTitle: p.title || '',
          })) || [];
          console.log(`Apollo.io mapped ${leads.length} leads.`);
          return leads;
        } catch (err: any) {
          console.error('Apollo.io error:', err);
          errors.push(`Apollo.io failed: ${err.message}`);
          return [];
        }
    }},
    { name: 'Clay.com', fn: async () => {
        console.log('Clay.com: Simulating query with profile bits:', profileKeywords);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network latency
        // Simulate using different bits of the profile for each contact
        const simulatedLeads = [
            { id: 'Jane Doe-Innovate Inc.', name: 'Jane Doe', company: 'Innovate Inc.', contact: 'jane.d@innovate.com', jobTitle: profileKeywords[0] || 'VP of Engineering' },
            { id: 'John Smith-RetailGiant Corp.', name: 'John Smith', company: 'RetailGiant Corp.', contact: 'jsmith@retailgiant.co', jobTitle: profileKeywords[1] || 'Director of Marketing' },
        ];
        console.log('Clay.com simulated leads:', simulatedLeads);
        return simulatedLeads;
    }}
  ];

  // Run all sources concurrently
  const results = await Promise.allSettled(
      sources.map(async (source, idx) => {
          try {
              console.log(`Querying source: ${source.name} (scraper #${idx + 1}) with profile bits:`, profileKeywords);
              const leads = await source.fn();
              console.log(`Source ${source.name} returned ${leads.length} leads.`);
              // Log how sources could help each other (e.g., share found companies)
              if (leads.length > 0) {
                const foundCompanies = leads.map((l: any) => l.company).filter(Boolean);
                console.log(`${source.name} found companies:`, foundCompanies);
              }
              return leads;
          } catch (e: any) {
              console.error(`Error querying source ${source.name}:`, e.message, 'Profile bits:', profileKeywords);
              errors.push(`${source.name} failed: ${e.message}`);
              return [];
          }
      })
  );

  console.log('All lead sources queried. Results:', results);

  // Merge, dedupe, and enrich
  let allLeads: any[] = results
    .filter((r): r is PromiseFulfilledResult<any[]> => r.status === 'fulfilled' && Array.isArray(r.value))
    .flatMap((r: PromiseFulfilledResult<any[]>) => r.value);

  console.log(`Total leads from all sources before deduplication: ${allLeads.length}`);
  allLeads = dedupeLeads(allLeads);
  console.log(`Total leads after deduplication: ${allLeads.length}`);

  console.log('Enriching top 10 leads...');
  const enrichedLeads = await Promise.all(allLeads.slice(0, 10).map(async (lead: any, idx: number) => {
    try {
      console.log(`Enriching lead #${idx + 1}:`, lead);
      return await enrichContact(lead);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`Error enriching lead #${idx + 1}:`, errorMsg);
      errors.push(`Enrichment failed for ${lead.id}: ${errorMsg}`);
      return lead;
    }
  }));
  console.log('Enrichment complete.');

  // Save enriched leads to Firebase for hyperpersonalization
  try {
    const { saveLeadsToFirebase } = await import('@/lib/firebase/firestore');
    await saveLeadsToFirebase(enrichedLeads);
    console.log('Enriched leads saved to Firebase for hyperpersonalization.');
  } catch (firebaseError: unknown) {
    const firebaseErrorMsg = firebaseError instanceof Error ? firebaseError.message : String(firebaseError);
    console.error('Error saving leads to Firebase:', firebaseErrorMsg);
    errors.push(`Firebase save failed: ${firebaseErrorMsg}`);
  }

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
