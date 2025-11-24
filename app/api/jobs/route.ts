import { NextResponse } from "next/server";

// Mock Internshala-style jobs data (covering cities, categories, and types)
const jobs = [
  {
    id: "job-1",
    title: "Frontend Developer Intern",
    company: "TechNova Labs",
    location: "Bengaluru",
    stipend: "₹15,000 - ₹25,000 / month",
    type: "Internship",
    duration: "6 months",
    tags: ["React", "TypeScript", "TailwindCSS"],
    postedAt: "2 days ago",
  },
  {
    id: "job-2",
    title: "Data Analyst - Fresher",
    company: "InsightWorks",
    location: "Remote",
    stipend: "₹4.5 - 6 LPA",
    type: "Full-time",
    duration: null,
    tags: ["SQL", "Excel", "Python"],
    postedAt: "Today",
  },
  {
    id: "job-3",
    title: "Backend Developer Intern",
    company: "CloudBridge",
    location: "Hyderabad",
    stipend: "₹20,000 / month",
    type: "Internship",
    duration: "3 months",
    tags: ["Node.js", "Express", "MongoDB"],
    postedAt: "1 week ago",
  },
  // City-specific examples
  { id: "job-delhi-1", title: "UI/UX Designer Intern", company: "DesignHub", location: "Delhi", stipend: "₹12,000 / month", type: "Internship", duration: "4 months", tags: ["Figma", "UI", "UX"], postedAt: "3 days ago" },
  { id: "job-delhi-2", title: "Finance Associate", company: "LedgerPro", location: "Delhi", stipend: "₹4 - 5 LPA", type: "Full-time", duration: null, tags: ["Accounting", "Tally", "Finance"], postedAt: "2 days ago" },
  { id: "job-mumbai-1", title: "Junior QA Engineer", company: "QualityWorks", location: "Mumbai", stipend: "₹3.6 - 5 LPA", type: "Full-time", duration: null, tags: ["Testing", "Automation"], postedAt: "Yesterday" },
  { id: "job-mumbai-2", title: "Marketing Intern", company: "BrightAds", location: "Mumbai", stipend: "₹10,000 / month", type: "Internship", duration: "3 months", tags: ["Marketing", "SEO", "Ads"], postedAt: "Today" },
  { id: "job-bangalore-1", title: "AI Research Intern", company: "DeepVision", location: "Bengaluru", stipend: "₹30,000 / month", type: "Internship", duration: "6 months", tags: ["Python", "PyTorch", "ML"], postedAt: "5 days ago" },
  { id: "job-bangalore-2", title: "Full-stack Developer", company: "AppSmiths", location: "Bengaluru", stipend: "₹8 - 10 LPA", type: "Full-time", duration: null, tags: ["React", "Node.js", "PostgreSQL"], postedAt: "3 days ago" },
  { id: "job-hyderabad-1", title: "Cloud Support Associate", company: "SkyOps", location: "Hyderabad", stipend: "₹4 - 6 LPA", type: "Full-time", duration: null, tags: ["AWS", "Linux"], postedAt: "Today" },
  { id: "job-hyderabad-2", title: "Data Analyst Intern", company: "Insightly", location: "Hyderabad", stipend: "₹14,000 / month", type: "Internship", duration: "4 months", tags: ["SQL", "Python", "Dashboards"], postedAt: "Yesterday" },
  { id: "job-kolkata-1", title: "Business Analyst Intern", company: "Bizlytics", location: "Kolkata", stipend: "₹10,000 / month", type: "Internship", duration: "3 months", tags: ["Excel", "SQL"], postedAt: "1 week ago" },
  { id: "job-kolkata-2", title: "Junior Developer", company: "EastStack", location: "Kolkata", stipend: "₹3 - 4.5 LPA", type: "Full-time", duration: null, tags: ["JavaScript", "React"], postedAt: "4 days ago" },
  { id: "job-chennai-1", title: "Junior Backend Developer", company: "SouthStack", location: "Chennai", stipend: "₹5 - 7 LPA", type: "Full-time", duration: null, tags: ["Node.js", "Postgres"], postedAt: "2 days ago" },
  { id: "job-chennai-2", title: "UI Engineer", company: "PixelCraft", location: "Chennai", stipend: "₹5 - 6 LPA", type: "Full-time", duration: null, tags: ["UI", "Accessibility", "CSS"], postedAt: "6 days ago" },
  { id: "job-pune-1", title: "Data Engineering Intern", company: "DataForge", location: "Pune", stipend: "₹18,000 / month", type: "Internship", duration: "6 months", tags: ["SQL", "ETL", "Python"], postedAt: "3 days ago" },
  { id: "job-pune-2", title: "Full-stack Developer", company: "StackForge", location: "Pune", stipend: "₹6 - 8 LPA", type: "Full-time", duration: null, tags: ["React", "Node.js", "PostgreSQL"], postedAt: "4 days ago" },
  // Categories
  { id: "job-dev-1", title: "Full-stack Developer", company: "StackForge", location: "Pune", stipend: "₹6 - 8 LPA", type: "Full-time", duration: null, tags: ["React", "Node.js", "PostgreSQL"], postedAt: "4 days ago" },
  { id: "job-design-1", title: "Graphic Designer", company: "PixelCraft", location: "Chennai", stipend: "₹10,000 / month", type: "Internship", duration: "3 months", tags: ["Figma", "Illustrator"], postedAt: "6 days ago" },
  { id: "job-design-2", title: "Product Designer Intern", company: "UIWorks", location: "Bengaluru", stipend: "₹15,000 / month", type: "Internship", duration: "4 months", tags: ["Figma", "UI", "UX"], postedAt: "2 days ago" },
  { id: "job-mkt-1", title: "Digital Marketing Executive", company: "GrowthX", location: "Remote", stipend: "₹3.5 - 5 LPA", type: "Full-time", duration: null, tags: ["SEO", "Ads", "Analytics"], postedAt: "Today" },
  { id: "job-mkt-2", title: "Content Marketing Intern", company: "WriteRight", location: "Remote", stipend: "₹9,000 / month", type: "Internship", duration: "3 months", tags: ["Content", "SEO", "Social"], postedAt: "3 days ago" },
  { id: "job-fin-1", title: "Finance Trainee", company: "BlueStone Capital", location: "Delhi", stipend: "₹3 - 4 LPA", type: "Full-time", duration: null, tags: ["Accounting", "Tally"], postedAt: "7 days ago" },
  { id: "job-fin-2", title: "Accounts Intern", company: "LedgerPro", location: "Mumbai", stipend: "₹10,000 / month", type: "Internship", duration: "6 months", tags: ["Accounting", "Excel"], postedAt: "5 days ago" },
  { id: "job-hr-1", title: "HR Coordinator Intern", company: "PeopleFirst", location: "Kolkata", stipend: "₹8,000 / month", type: "Internship", duration: "6 months", tags: ["HR", "Recruitment"], postedAt: "2 days ago" },
  { id: "job-hr-2", title: "HR Executive", company: "TalentHub", location: "Hyderabad", stipend: "₹3 - 4.2 LPA", type: "Full-time", duration: null, tags: ["HR", "Onboarding"], postedAt: "1 day ago" },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get("location")?.toLowerCase() || "";
  const type = searchParams.get("type")?.toLowerCase() || "";
  const q = searchParams.get("q")?.toLowerCase() || "";

  const filtered = jobs.filter((job) => {
    const byLocation = location ? job.location.toLowerCase().includes(location) : true;
    const byType = type ? job.type.toLowerCase().includes(type) : true;
    const byQuery = q ? (job.title + job.company).toLowerCase().includes(q) : true;
    return byLocation && byType && byQuery;
  });

  return NextResponse.json({ jobs: filtered });
}



