"use client";

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

export type Course = {
  id: string;
  title: string;
  level: "UG" | "PG" | "Executive";
  mode: "Online" | "Distance" | "Hybrid";
  duration: string; // e.g., "3 Years", "2 Years"
  university: string;
  tags: string[]; // specializations or keywords
};

type CoursesState = {
  items: Course[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
  query: string;
  level: string;
  mode: string;
  selectedCourse: Course | null;
};

const dummyCourses: Course[] = [
  // UG
  { id: "c-ba-1", title: "BA - English", level: "UG", mode: "Online", duration: "3 Years", university: "Liberal Arts University", tags: ["English", "Literature"] },
  { id: "c-bsc-1", title: "B.Sc - Computer Science", level: "UG", mode: "Online", duration: "3 Years", university: "Science University", tags: ["CS", "Programming"] },
  { id: "c-bcom-1", title: "B.Com - Accounting", level: "UG", mode: "Distance", duration: "3 Years", university: "Open University", tags: ["Accounting", "Finance"] },
  { id: "c-bba-1", title: "BBA - Management", level: "UG", mode: "Online", duration: "3 Years", university: "Business Institute", tags: ["Management", "Marketing"] },
  { id: "c-bbm-1", title: "BBM - Business Management", level: "UG", mode: "Online", duration: "3 Years", university: "Business Institute", tags: ["Business", "Operations"] },
  { id: "c-bca-1", title: "BCA - Bachelor of Computer Applications", level: "UG", mode: "Online", duration: "3 Years", university: "Tech Institute", tags: ["Programming", "IT", "Software"] },
  { id: "c-btech-1", title: "B.Tech - CSE", level: "UG", mode: "Hybrid", duration: "4 Years", university: "Engineering College", tags: ["Engineering", "CSE"] },
  { id: "c-llb-1", title: "LLB - Bachelor of Laws", level: "UG", mode: "Distance", duration: "3 Years", university: "Law School", tags: ["Law", "Legal"] },
  { id: "c-mbbs-1", title: "MBBS - Medicine", level: "UG", mode: "Hybrid", duration: "5.5 Years", university: "Medical College", tags: ["Medicine", "Clinical"] },
  { id: "c-bpharm-1", title: "B.Pharm - Pharmacy", level: "UG", mode: "Hybrid", duration: "4 Years", university: "Pharmacy College", tags: ["Drugs", "Chemistry"] },
  { id: "c-barch-1", title: "B.Arch - Architecture", level: "UG", mode: "Hybrid", duration: "5 Years", university: "Architecture College", tags: ["Design", "Architecture"] },
  { id: "c-bdes-1", title: "B.Des - Product Design", level: "UG", mode: "Online", duration: "4 Years", university: "Design School", tags: ["Design", "Product"] },
  { id: "c-bed-1", title: "B.Ed - Education", level: "UG", mode: "Online", duration: "2 Years", university: "Education College", tags: ["Teaching", "Education"] },
  { id: "c-bhm-1", title: "BHM - Hotel Management", level: "UG", mode: "Online", duration: "3 Years", university: "Hospitality Institute", tags: ["Hotel", "Hospitality"] },
  // PG
  { id: "c-ma-1", title: "MA - Economics", level: "PG", mode: "Online", duration: "2 Years", university: "Economics School", tags: ["Economics", "Policy"] },
  { id: "c-msc-1", title: "M.Sc - Data Science", level: "PG", mode: "Online", duration: "2 Years", university: "Tech University", tags: ["Data Science", "ML"] },
  { id: "c-mcom-1", title: "M.Com - Finance", level: "PG", mode: "Online", duration: "2 Years", university: "Commerce College", tags: ["Finance", "Accounting"] },
  { id: "c-mba-1", title: "MBA - General", level: "PG", mode: "Online", duration: "2 Years", university: "Business School X", tags: ["HR", "Marketing", "Finance"] },
  { id: "c-mba-2", title: "MBA - Business Analytics", level: "PG", mode: "Online", duration: "2 Years", university: "Business School X", tags: ["Analytics", "Data", "BI"] },
  { id: "c-mca-1", title: "MCA - Master of Computer Applications", level: "PG", mode: "Online", duration: "2 Years", university: "Tech University", tags: ["Software", "AI"] },
  { id: "c-mtech-1", title: "M.Tech - AI", level: "PG", mode: "Hybrid", duration: "2 Years", university: "Engineering College", tags: ["AI", "Research"] },
  { id: "c-llm-1", title: "LLM - Corporate Law", level: "PG", mode: "Online", duration: "2 Years", university: "Law School", tags: ["Law", "Corporate"] },
  { id: "c-md-1", title: "MD - Internal Medicine", level: "PG", mode: "Hybrid", duration: "3 Years", university: "Medical College", tags: ["Medicine"] },
  { id: "c-ms-1", title: "MS - General Surgery", level: "PG", mode: "Hybrid", duration: "3 Years", university: "Medical College", tags: ["Surgery"] },
  { id: "c-mds-1", title: "MDS - Prosthodontics", level: "PG", mode: "Hybrid", duration: "3 Years", university: "Dental College", tags: ["Dental"] },
  { id: "c-mpt-1", title: "MPT - Physiotherapy", level: "PG", mode: "Online", duration: "2 Years", university: "Physiotherapy Institute", tags: ["Physio"] },
  { id: "c-mph-1", title: "MPH - Public Health", level: "PG", mode: "Online", duration: "2 Years", university: "Health Institute", tags: ["Health", "Policy"] },
  { id: "c-mhm-1", title: "MHM - Hospital Management", level: "PG", mode: "Online", duration: "2 Years", university: "Health Institute", tags: ["Hospital", "Admin"] },
  { id: "c-pgdm-1", title: "PGDM - Management", level: "PG", mode: "Online", duration: "2 Years", university: "Institute Z", tags: ["PGDM", "Management"] },
  // Diplomas & Certificates
  { id: "c-poly-1", title: "Polytechnic - Mechanical", level: "UG", mode: "Hybrid", duration: "3 Years", university: "Polytechnic College", tags: ["Mechanical"] },
  { id: "c-dca-1", title: "DCA - Diploma in Computer Applications", level: "UG", mode: "Online", duration: "1 Year", university: "Tech Institute", tags: ["Computers", "Basics"] },
  { id: "c-paramed-1", title: "Paramedical - Lab Technician", level: "UG", mode: "Hybrid", duration: "2 Years", university: "Medical Institute", tags: ["Lab", "Healthcare"] },
  { id: "c-cert-1", title: "Certificate - Digital Marketing", level: "UG", mode: "Online", duration: "6 Months", university: "Online Univ", tags: ["Digital", "Marketing"] },
  { id: "c-hm-1", title: "Hotel Management - Culinary Arts", level: "UG", mode: "Online", duration: "1 Year", university: "Hospitality Institute", tags: ["Culinary", "Hotel"] },
  // Additional entries to cover all categories richly
  { id: "c-ba-2", title: "BA - Psychology", level: "UG", mode: "Online", duration: "3 Years", university: "Liberal Arts University", tags: ["Psychology", "Counselling"] },
  { id: "c-bsc-2", title: "B.Sc - Mathematics", level: "UG", mode: "Distance", duration: "3 Years", university: "Science University", tags: ["Maths", "Statistics"] },
  { id: "c-bcom-2", title: "B.Com - Banking & Insurance", level: "UG", mode: "Online", duration: "3 Years", university: "Commerce College", tags: ["Banking", "Insurance"] },
  { id: "c-bba-2", title: "BBA - Finance", level: "UG", mode: "Online", duration: "3 Years", university: "Business Institute", tags: ["Finance", "Accounting"] },
  { id: "c-bca-2", title: "BCA - Cloud & DevOps", level: "UG", mode: "Online", duration: "3 Years", university: "Tech Institute", tags: ["Cloud", "DevOps"] },
  { id: "c-btech-2", title: "B.Tech - Mechanical", level: "UG", mode: "Hybrid", duration: "4 Years", university: "Engineering College", tags: ["Mechanical", "Design"] },
  { id: "c-llb-2", title: "LLB - Criminal Law", level: "UG", mode: "Distance", duration: "3 Years", university: "Law School", tags: ["Criminal", "Law"] },
  { id: "c-bpharm-2", title: "B.Pharm - Pharmacology", level: "UG", mode: "Hybrid", duration: "4 Years", university: "Pharmacy College", tags: ["Pharma", "Research"] },
  { id: "c-bdes-2", title: "B.Des - UI/UX", level: "UG", mode: "Online", duration: "4 Years", university: "Design School", tags: ["UX", "Interface"] },
  { id: "c-bhm-2", title: "BHM - Tourism Management", level: "UG", mode: "Online", duration: "3 Years", university: "Hospitality Institute", tags: ["Tourism", "Hospitality"] },
  { id: "c-ma-2", title: "MA - English", level: "PG", mode: "Online", duration: "2 Years", university: "Liberal Arts University", tags: ["English", "Literature"] },
  { id: "c-msc-2", title: "M.Sc - Cyber Security", level: "PG", mode: "Online", duration: "2 Years", university: "Tech University", tags: ["Security", "Networks"] },
  { id: "c-mcom-2", title: "M.Com - Accounting & Taxation", level: "PG", mode: "Online", duration: "2 Years", university: "Commerce College", tags: ["Tax", "Finance"] },
  { id: "c-mba-3", title: "MBA - HR", level: "PG", mode: "Online", duration: "2 Years", university: "Business School X", tags: ["HR", "People"] },
  { id: "c-mca-2", title: "MCA - Data Engineering", level: "PG", mode: "Online", duration: "2 Years", university: "Tech University", tags: ["Data", "ETL"] },
  { id: "c-mtech-2", title: "M.Tech - Data Science", level: "PG", mode: "Hybrid", duration: "2 Years", university: "Engineering College", tags: ["Data", "ML"] },
  { id: "c-llm-2", title: "LLM - International Law", level: "PG", mode: "Online", duration: "2 Years", university: "Law School", tags: ["International", "Law"] },
  { id: "c-md-2", title: "MD - Pediatrics", level: "PG", mode: "Hybrid", duration: "3 Years", university: "Medical College", tags: ["Children", "Health"] },
  { id: "c-ms-2", title: "MS - Orthopedics", level: "PG", mode: "Hybrid", duration: "3 Years", university: "Medical College", tags: ["Bones", "Surgery"] },
  { id: "c-mds-2", title: "MDS - Orthodontics", level: "PG", mode: "Hybrid", duration: "3 Years", university: "Dental College", tags: ["Dental", "Braces"] },
  { id: "c-mpt-2", title: "MPT - Sports Physio", level: "PG", mode: "Online", duration: "2 Years", university: "Physiotherapy Institute", tags: ["Sports", "Rehab"] },
  { id: "c-mph-2", title: "MPH - Epidemiology", level: "PG", mode: "Online", duration: "2 Years", university: "Health Institute", tags: ["Epidemiology", "Statistics"] },
  { id: "c-mhm-2", title: "MHM - Healthcare IT", level: "PG", mode: "Online", duration: "2 Years", university: "Health Institute", tags: ["IT", "Healthcare"] },
  { id: "c-pgdm-2", title: "PGDM - Operations", level: "PG", mode: "Online", duration: "2 Years", university: "Institute Z", tags: ["Operations", "Supply Chain"] },
  { id: "c-poly-2", title: "Polytechnic - Civil", level: "UG", mode: "Hybrid", duration: "3 Years", university: "Polytechnic College", tags: ["Civil", "Construction"] },
  { id: "c-dca-2", title: "DCA - Web Design", level: "UG", mode: "Online", duration: "1 Year", university: "Tech Institute", tags: ["HTML", "CSS"] },
  { id: "c-paramed-2", title: "Paramedical - Radiology", level: "UG", mode: "Hybrid", duration: "2 Years", university: "Medical Institute", tags: ["Radiology", "Imaging"] },
  { id: "c-cert-2", title: "Certificate - UI/UX Design", level: "UG", mode: "Online", duration: "6 Months", university: "Online Univ", tags: ["UI", "UX"] },
  { id: "c-hm-2", title: "Hotel Management - Front Office", level: "UG", mode: "Online", duration: "1 Year", university: "Hospitality Institute", tags: ["Front Office", "Hotel"] },
];

const initialState: CoursesState = {
  items: dummyCourses,
  status: "idle",
  error: undefined,
  query: "",
  level: "",
  mode: "",
  selectedCourse: null,
};

export const fetchCourses = createAsyncThunk(
  "courses/fetchCourses",
  async (params: { q?: string; level?: string; mode?: string } | undefined) => {
    try {
      const sp = new URLSearchParams();
      if (params?.q) sp.set("q", params.q);
      if (params?.level) sp.set("level", params.level);
      if (params?.mode) sp.set("mode", params.mode);
      const url = sp.toString() ? `/api/courses?${sp.toString()}` : "/api/courses";
      const res = await axios.get<{ courses: Course[] }>(url);
      return res.data?.courses?.length ? res.data.courses : dummyCourses;
    } catch {
      return dummyCourses;
    }
  }
);

const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    setCourseQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    setCourseLevel(state, action: PayloadAction<string>) {
      state.level = action.payload;
    },
    setCourseMode(state, action: PayloadAction<string>) {
      state.mode = action.payload;
    },
    setSelectedCourse(state, action: PayloadAction<Course | null>) {
      state.selectedCourse = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { setCourseQuery, setCourseLevel, setCourseMode, setSelectedCourse } = coursesSlice.actions;
export default coursesSlice.reducer;


