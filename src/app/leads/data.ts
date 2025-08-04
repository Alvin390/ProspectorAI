
import type { GenerateLeadProfileOutput } from "@/ai/flows/generate-lead-profile.schema";

export interface Profile {
  id: string;
  name: string;
  description: string;
  status: 'Completed';
  createdAt: string;
  profileData: GenerateLeadProfileOutput | null;
}

export const initialProfiles: Profile[] = [
  {
    id: '1',
    name: 'Silicon Valley Startups',
    description: 'Tech startups in Silicon Valley with 50-100 employees',
    status: 'Completed',
    createdAt: '2023-10-27',
    profileData: {
      suggestedName: 'Silicon Valley Startups',
      attributes: 'Industry: Technology, B2B SaaS\nLocation: Silicon Valley, CA\nCompany Size: 50-100 employees\nPain Points: Manual lead generation, high customer acquisition costs, inefficient sales processes.',
      onlinePresence: 'Active on LinkedIn, TechCrunch, Hacker News. Follows thought leaders like Sam Altman and Andrew Ng.'
    }
  },
  {
    id: '2',
    name: 'European E-commerce',
    description: 'E-commerce businesses in Europe selling fashion goods',
    status: 'Completed',
    createdAt: '2023-10-25',
    profileData: {
       suggestedName: 'European E-commerce',
       attributes: 'Industry: E-commerce, Fashion & Apparel\nLocation: Europe (UK, Germany, France)\nCompany Size: 10-50 employees\nPain Points: High cart abandonment rates, low customer lifetime value, competition from large retailers.',
       onlinePresence: 'Active on Instagram, Pinterest, and fashion-focused blogs. Uses platforms like Shopify or Magento.'
    }
  },
  {
    id: '3',
    name: 'NY Financial Services',
    description: 'Financial services companies in New York',
    status: 'Completed',
    createdAt: '2023-10-22',
    profileData: {
        suggestedName: 'NY Financial Services',
        attributes: 'Industry: Financial Services, FinTech\nLocation: New York, NY\nCompany Size: 100+ employees\nPain Points: Regulatory compliance, data security, legacy IT systems, need for digital transformation.',
        onlinePresence: 'Active on LinkedIn, Wall Street Journal, Bloomberg. Attends industry conferences like Money 20/20.'
    }
  },
];
