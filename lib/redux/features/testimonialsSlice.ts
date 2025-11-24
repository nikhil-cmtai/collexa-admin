"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

export type Testimonial = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  text: string;
  href?: string | null;
  publishedAt?: string | null;
  status?: "pending" | "approved" | "rejected";
  verified?: boolean;
  customerName?: string;
  customerEmail?: string;
  courseName?: string;
  courseId?: string | number;
  rating?: number;
  title?: string;
  helpful?: number;
  notHelpful?: number;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
  graduationYear?: string;
  currentJob?: string;
  salary?: string;
};

type TestimonialsState = {
  items: Testimonial[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
  selected?: Testimonial | null;
};

const initialState: TestimonialsState = {
  items: [],
  status: "idle",
  error: undefined,
  selected: null,
};

type ApiResponse<T> = {
  statusCode?: number;
  data?: T;
  message?: string;
  success?: boolean;
};

const extractData = <T,>(payload: ApiResponse<T> | T): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiResponse<T>).data as T;
  }
  return payload as T;
};

const normalizeTestimonial = (raw: Record<string, unknown>): Testimonial => {
  const author = (raw.author as Record<string, unknown>) || {};
  const name = (raw.name as string) || (author.name as string) || (raw.customerName as string) || "";
  const handle = (raw.handle as string) || (author.handle as string) || "";
  const avatar =
    (raw.avatar as string) ||
    (author.avatar as string) ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || handle || "User")}`;

  const createdAt = (raw.createdAt as string) || (raw.publishedAt as string) || new Date().toISOString();
  const updatedAt = (raw.updatedAt as string) || createdAt;

  return {
    id: (raw.id as string) || (raw._id as string) || `${name}-${handle}` || String(Date.now()),
    name,
    handle,
    avatar,
    text: (raw.text as string) || (raw.quote as string) || (raw.testimonial as string) || "",
    href: (raw.href as string) || (raw.link as string) || null,
    publishedAt: (raw.publishedAt as string) || (raw.createdAt as string) || null,
    status: (raw.status as "pending" | "approved" | "rejected") || "approved",
    verified: (raw.verified as boolean) ?? true,
    customerName: (raw.customerName as string) || name,
    customerEmail: (raw.customerEmail as string) || (raw.email as string) || "",
    courseName: (raw.courseName as string) || (raw.course as string) || "Featured Program",
    courseId: (raw.courseId as string) || (raw.course_id as string) || "",
    rating: Number(raw.rating ?? raw.stars ?? 5),
    title: (raw.title as string) || (raw.heading as string) || "",
    helpful: (raw.helpful as number) ?? 0,
    notHelpful: (raw.notHelpful as number) ?? 0,
    images: Array.isArray(raw.images) ? (raw.images as string[]) : [],
    createdAt,
    updatedAt,
    graduationYear: (raw.graduationYear as string) || "",
    currentJob: (raw.currentJob as string) || "",
    salary: (raw.salary as string) || "",
  };
};

export const fetchTestimonials = createAsyncThunk<Testimonial[], void, { rejectValue: string }>(
  "testimonials/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<ApiResponse<{ docs: Record<string, unknown>[] }>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/testimonials`
      );
      const data = extractData(response.data);
      return (data?.docs || []).map(normalizeTestimonial);
    } catch (error) {
      console.error("Failed to fetch testimonials", error);
      return rejectWithValue("Failed to fetch testimonials");
    }
  }
);

export const createTestimonial = createAsyncThunk<Testimonial, Omit<Testimonial, "id">, { rejectValue: string }>(
  "testimonials/create",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post<ApiResponse<Record<string, unknown>>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/testimonials`,
        payload
      );
      return normalizeTestimonial(extractData(response.data));
    } catch (error) {
      console.error("Failed to create testimonial", error);
      return rejectWithValue("Failed to create testimonial");
    }
  }
);

export const updateTestimonial = createAsyncThunk<Testimonial, { testimonialId: string; data: Partial<Testimonial> }, { rejectValue: string }>(
  "testimonials/update",
  async ({ testimonialId, data }, { rejectWithValue }) => {
    try {
      const response = await axios.patch<ApiResponse<Record<string, unknown>>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/testimonials/${testimonialId}`,
        data
      );
      return normalizeTestimonial(extractData(response.data));
    } catch (error) {
      console.error("Failed to update testimonial", error);
      return rejectWithValue("Failed to update testimonial");
    }
  }
);

export const deleteTestimonial = createAsyncThunk<string, string, { rejectValue: string }>(
  "testimonials/delete",
  async (testimonialId, { rejectWithValue }) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/testimonials/${testimonialId}`);
      return testimonialId;
    } catch (error) {
      console.error("Failed to delete testimonial", error);
      return rejectWithValue("Failed to delete testimonial");
    }
  }
);

const testimonialsSlice = createSlice({
  name: "testimonials",
  initialState,
  reducers: {
    clearSelectedTestimonial(state) {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTestimonials.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchTestimonials.fulfilled, (state, action: PayloadAction<Testimonial[]>) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchTestimonials.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch testimonials";
      })
      .addCase(createTestimonial.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateTestimonial.fulfilled, (state, action) => {
        const idx = state.items.findIndex((item) => item.id === action.payload.id);
        if (idx !== -1) {
          state.items[idx] = action.payload;
        }
        if (state.selected?.id === action.payload.id) {
          state.selected = action.payload;
        }
      })
      .addCase(deleteTestimonial.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.selected?.id === action.payload) {
          state.selected = null;
        }
      });
  },
});

export const { clearSelectedTestimonial } = testimonialsSlice.actions;
export default testimonialsSlice.reducer;
