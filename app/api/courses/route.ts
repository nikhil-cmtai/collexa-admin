import { NextResponse } from "next/server";

const courses = [
  { id: "c-bca-1", title: "BCA - Bachelor of Computer Applications", level: "UG", mode: "Online", duration: "3 Years", university: "Online University A", tags: ["Programming", "IT", "Software"] },
  { id: "c-bba-1", title: "BBA - Bachelor of Business Administration", level: "UG", mode: "Online", duration: "3 Years", university: "Online University B", tags: ["Management", "Marketing", "Finance"] },
  { id: "c-bcom-1", title: "B.Com - Bachelor of Commerce", level: "UG", mode: "Distance", duration: "3 Years", university: "Open University", tags: ["Accounting", "Finance"] },
  { id: "c-mca-1", title: "MCA - Master of Computer Applications", level: "PG", mode: "Online", duration: "2 Years", university: "Tech University", tags: ["Software", "AI", "Data Science"] },
  { id: "c-mba-1", title: "MBA - General", level: "PG", mode: "Online", duration: "2 Years", university: "Business School X", tags: ["HR", "Marketing", "Finance"] },
  { id: "c-mba-2", title: "MBA - Business Analytics", level: "PG", mode: "Online", duration: "2 Years", university: "Business School X", tags: ["Analytics", "Data", "BI"] },
  { id: "c-ex-mba-1", title: "Executive MBA for Working Professionals", level: "Executive", mode: "Hybrid", duration: "12-18 Months", university: "Institute Y", tags: ["Leadership", "Strategy"] },
  { id: "c-pgdm-1", title: "Online PGDM", level: "PG", mode: "Online", duration: "2 Years", university: "Institute Z", tags: ["PGDM", "Management"] },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase() || "";
  const level = searchParams.get("level")?.toLowerCase() || "";
  const mode = searchParams.get("mode")?.toLowerCase() || "";

  const filtered = courses.filter((c) => {
    const byQ = q ? (c.title + " " + c.university + " " + c.tags.join(" ")).toLowerCase().includes(q) : true;
    const byLevel = level ? c.level.toLowerCase().includes(level) : true;
    const byMode = mode ? c.mode.toLowerCase().includes(mode) : true;
    return byQ && byLevel && byMode;
  });

  return NextResponse.json({ courses: filtered });
}


