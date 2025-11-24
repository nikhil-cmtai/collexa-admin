"use client";

import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export type CampusCourse = {
  _id?: string;
  name: string;
  code: string;
  duration: string;
  fees: number;
  university: string;
  location: string;
  type: string;
  specialization: string;
  status: "active" | "inactive";
  seats: number;
  enrolled: number;
  rating: number;
  description: string;
  eligibility: string;
  curriculum: string[];
  faculty: string[];
  createdAt?: string;
  updatedAt?: string;
};

type CampusCoursesState = {
  items: CampusCourse[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
  query: string;
  typeFilter: string;
  statusFilter: string;
  stats: Record<string, unknown> | null;
  selectedCourse: CampusCourse | null;
};

const initialState: CampusCoursesState = {
  items: [],
  status: "idle",
  error: undefined,
  query: "",
  typeFilter: "",
  statusFilter: "",
  stats: null,
  selectedCourse: null,
};

type ApiResponse<T> = {
  statusCode?: number;
  data?: T;
  message?: string;
  success?: boolean;
};

const extractData = <T>(payload: ApiResponse<T> | T): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiResponse<T>).data as T;
  }
  return payload as T;
};

const normalizeCampusCourse = (raw: Record<string, unknown>): CampusCourse => ({
  ...raw,
  _id: (raw._id as string) ?? (raw.id as string) ?? "",
  name: (raw.name as string) ?? "",
  code: (raw.code as string) ?? "",
  duration: (raw.duration as string) ?? "",
  fees: (raw.fees as number) ?? 0,
  university: (raw.university as string) ?? "",
  location: (raw.location as string) ?? "",
  type: (raw.type as string) ?? "",
  specialization: (raw.specialization as string) ?? "",
  status: (raw.status as string) ?? "active",
  seats: (raw.seats as number) ?? 0,
  enrolled: (raw.enrolled as number) ?? 0,
  rating: (raw.rating as number) ?? 0,
  description: (raw.description as string) ?? "",
  eligibility: (raw.eligibility as string) ?? "",
  curriculum: Array.isArray(raw.curriculum) ? (raw.curriculum as string[]) : [],
  faculty: Array.isArray(raw.faculty) ? (raw.faculty as string[]) : [],
  createdAt: (raw.createdAt as string) ?? new Date().toISOString(),
  updatedAt: (raw.updatedAt as string) ?? new Date().toISOString(),
} as CampusCourse);

// GET /admin/campus-courses
export const fetchCampusCourses = createAsyncThunk(
  "campusCourses/fetchCampusCourses",
  async (
    params: { q?: string; type?: string; status?: string } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get<ApiResponse<{ docs: CampusCourse[] }>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/campus-courses`,
        { params }
      );
      const data = extractData(response.data);
      return (data?.docs ?? []).map(normalizeCampusCourse);
    } catch (error: unknown) {
      console.error("Failed to fetch campus courses:", error);
      return rejectWithValue("Failed to fetch campus courses");
    }
  }
);

// POST /admin/campus-courses
export const createCampusCourse = createAsyncThunk(
  "campusCourses/createCampusCourse",
  async (
    data: Omit<CampusCourse, "_id" | "createdAt" | "updatedAt">,
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post<ApiResponse<CampusCourse>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/campus-courses`,
        data
      );
      return normalizeCampusCourse(extractData(response.data));
    } catch (error: unknown) {
      console.error("Failed to create campus course:", error);
      return rejectWithValue("Failed to create campus course");
    }
  }
);

// GET /admin/campus-courses/stats
export const fetchCampusCoursesStats = createAsyncThunk(
  "campusCourses/fetchCampusCoursesStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<ApiResponse<Record<string, unknown>>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/campus-courses/stats`
      );
      return extractData(response.data);
    } catch (error: unknown) {
      console.error("Failed to fetch campus course stats:", error);
      return rejectWithValue("Failed to fetch campus course stats");
    }
  }
);

// GET /admin/campus-courses/:id
export const fetchCampusCourseById = createAsyncThunk(
  "campusCourses/fetchCampusCourseById",
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get<ApiResponse<CampusCourse>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/campus-courses/${courseId}`
      );
      return normalizeCampusCourse(extractData(response.data));
    } catch (error: unknown) {
      console.error("Failed to fetch campus course by id:", error);
      return rejectWithValue("Failed to fetch campus course by id");
    }
  }
);

// PATCH /admin/campus-courses/:id
export const updateCampusCourse = createAsyncThunk(
  "campusCourses/updateCampusCourse",
  async (
    { courseId, data }: { courseId: string; data: Partial<CampusCourse> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch<ApiResponse<CampusCourse>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/campus-courses/${courseId}`,
        data
      );
      return normalizeCampusCourse(extractData(response.data));
    } catch (error: unknown) {
      console.error("Failed to update campus course:", error);
      return rejectWithValue("Failed to update campus course");
    }
  }
);

// DELETE /admin/campus-courses/:id
export const deleteCampusCourse = createAsyncThunk(
  "campusCourses/deleteCampusCourse",
  async (courseId: string, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/campus-courses/${courseId}`
      );
      return courseId;
    } catch (error: unknown) {
      console.error("Failed to delete campus course:", error);
      return rejectWithValue("Failed to delete campus course");
    }
  }
);

const campusCoursesSlice = createSlice({
  name: "campusCourses",
  initialState,
  reducers: {
    setCampusCourseQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    setCampusCourseTypeFilter(state, action: PayloadAction<string>) {
      state.typeFilter = action.payload;
    },
    setCampusCourseStatusFilter(state, action: PayloadAction<string>) {
      state.statusFilter = action.payload;
    },
    clearSelectedCampusCourse(state) {
      state.selectedCourse = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all campus courses
      .addCase(fetchCampusCourses.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchCampusCourses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchCampusCourses.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to load campus courses";
      })

      // Create campus course
      .addCase(createCampusCourse.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(createCampusCourse.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items.unshift(action.payload);
      })
      .addCase(createCampusCourse.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to create campus course";
      })

      // Fetch campus course stats
      .addCase(fetchCampusCoursesStats.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchCampusCoursesStats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.stats = action.payload;
      })
      .addCase(fetchCampusCoursesStats.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to load campus course stats";
      })

      // Get campus course by id
      .addCase(fetchCampusCourseById.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
        state.selectedCourse = null;
      })
      .addCase(fetchCampusCourseById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedCourse = action.payload;
      })
      .addCase(fetchCampusCourseById.rejected, (state, action) => {
        state.status = "failed";
        state.selectedCourse = null;
        state.error = (action.payload as string) || "Failed to fetch campus course";
      })

      // Update campus course
      .addCase(updateCampusCourse.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(updateCampusCourse.fulfilled, (state, action) => {
        state.status = "succeeded";
        const idx = state.items.findIndex(
          (course) => course._id === action.payload._id
        );
        if (idx !== -1) {
          state.items[idx] = { ...state.items[idx], ...action.payload };
        }
        if (state.selectedCourse?._id === action.payload._id) {
          state.selectedCourse = { ...state.selectedCourse, ...action.payload };
        }
      })
      .addCase(updateCampusCourse.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to update campus course";
      })

      // Delete campus course
      .addCase(deleteCampusCourse.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(deleteCampusCourse.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = state.items.filter((course) => course._id !== action.payload);
        if (state.selectedCourse?._id === action.payload) {
          state.selectedCourse = null;
        }
      })
      .addCase(deleteCampusCourse.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to delete campus course";
      });
  },
});

export const {
  setCampusCourseQuery,
  setCampusCourseTypeFilter,
  setCampusCourseStatusFilter,
  clearSelectedCampusCourse,
} = campusCoursesSlice.actions;
export default campusCoursesSlice.reducer;
