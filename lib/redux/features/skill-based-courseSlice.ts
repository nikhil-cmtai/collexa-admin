"use client";

import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export type SkillBasedCourse = {
  _id?: string;
  name: string;
  code: string;
  duration: string;
  fees: number;
  category: string;
  level: string;
  status: "active" | "inactive";
  seats: number;
  enrolled: number;
  rating: number;
  description: string;
  prerequisites: string;
  skills: string[];
  projects: string[];
  instructor: string;
  platform: string;
  createdAt?: string;
  updatedAt?: string;
};

type SkillBasedCoursesState = {
  items: SkillBasedCourse[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
  query: string;
  categoryFilter: string;
  levelFilter: string;
  statusFilter: string;
  stats: Record<string, unknown> | null;
  selectedCourse: SkillBasedCourse | null;
};

const initialState: SkillBasedCoursesState = {
  items: [],
  status: "idle",
  error: undefined,
  query: "",
  categoryFilter: "",
  levelFilter: "",
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

const normalizeSkillBasedCourse = (raw: Record<string, unknown>): SkillBasedCourse => ({
  ...raw,
  _id: (raw._id as string) ?? (raw.id as string) ?? "",
  name: (raw.name as string) ?? "",
  code: (raw.code as string) ?? "",
  duration: (raw.duration as string) ?? "",
  fees: (raw.fees as number) ?? 0,
  category: (raw.category as string) ?? "",
  level: (raw.level as string) ?? "",
  status: (raw.status as string) ?? "active",
  seats: (raw.seats as number) ?? 0,
  enrolled: (raw.enrolled as number) ?? 0,
  rating: (raw.rating as number) ?? 0,
  description: (raw.description as string) ?? "",
  prerequisites: (raw.prerequisites as string) ?? "",
  skills: Array.isArray(raw.skills) ? (raw.skills as string[]) : [],
  projects: Array.isArray(raw.projects) ? (raw.projects as string[]) : [],
  instructor: (raw.instructor as string) ?? "",
  platform: (raw.platform as string) ?? "",
  createdAt: (raw.createdAt as string) ?? new Date().toISOString(),
  updatedAt: (raw.updatedAt as string) ?? new Date().toISOString(),
} as SkillBasedCourse);

// GET /admin/skill-based-courses
export const fetchSkillBasedCourses = createAsyncThunk(
  "skillBasedCourses/fetchSkillBasedCourses",
  async (
    params: { q?: string; category?: string; level?: string; status?: string } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get<ApiResponse<{ docs: SkillBasedCourse[] }>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/skills-courses`,
        { params }
      );
      const data = extractData(response.data);
      return (data?.docs ?? []).map(normalizeSkillBasedCourse);
    } catch (error: unknown) {
      console.error("Failed to fetch skill-based courses:", error);
      return rejectWithValue("Failed to fetch skill-based courses");
    }
  }
);

// POST /admin/skill-based-courses
export const createSkillBasedCourse = createAsyncThunk(
  "skillBasedCourses/createSkillBasedCourse",
  async (
    data: Omit<SkillBasedCourse, "_id" | "createdAt" | "updatedAt">,
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post<ApiResponse<SkillBasedCourse>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/skills-courses`,
        data
      );
      return normalizeSkillBasedCourse(extractData(response.data));
    } catch (error: unknown) {
      console.error("Failed to create skill-based course:", error);
      return rejectWithValue("Failed to create skill-based course");
    }
  }
);

// GET /admin/skill-based-courses/stats
export const fetchSkillBasedCoursesStats = createAsyncThunk(
  "skillBasedCourses/fetchSkillBasedCoursesStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<ApiResponse<Record<string, unknown>>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/skills-courses/stats`
      );
      return extractData(response.data);
    } catch (error: unknown) {
      console.error("Failed to fetch skill-based course stats:", error);
      return rejectWithValue("Failed to fetch skill-based course stats");
    }
  }
);

// GET /admin/skill-based-courses/:id
export const fetchSkillBasedCourseById = createAsyncThunk(
  "skillBasedCourses/fetchSkillBasedCourseById",
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get<ApiResponse<SkillBasedCourse>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/skills-courses/${courseId}`
      );
      return normalizeSkillBasedCourse(extractData(response.data));
    } catch (error: unknown) {
      console.error("Failed to fetch skill-based course by id:", error);
      return rejectWithValue("Failed to fetch skill-based course by id");
    }
  }
);

// PATCH /admin/skill-based-courses/:id
export const updateSkillBasedCourse = createAsyncThunk(
  "skillBasedCourses/updateSkillBasedCourse",
  async (
    { courseId, data }: { courseId: string; data: Partial<SkillBasedCourse> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch<ApiResponse<SkillBasedCourse>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/skills-courses/${courseId}`,
        data
      );
      return normalizeSkillBasedCourse(extractData(response.data));
    } catch (error: unknown) {
      console.error("Failed to update skill-based course:", error);
      return rejectWithValue("Failed to update skill-based course");
    }
  }
);

// DELETE /admin/skill-based-courses/:id
export const deleteSkillBasedCourse = createAsyncThunk(
  "skillBasedCourses/deleteSkillBasedCourse",
  async (courseId: string, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/skills-courses/${courseId}`
      );
      return courseId;
    } catch (error: unknown) {
      console.error("Failed to delete skill-based course:", error);
      return rejectWithValue("Failed to delete skill-based course");
    }
  }
);

const skillBasedCoursesSlice = createSlice({
  name: "skillBasedCourses",
  initialState,
  reducers: {
    setSkillBasedCourseQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    setSkillBasedCourseCategoryFilter(state, action: PayloadAction<string>) {
      state.categoryFilter = action.payload;
    },
    setSkillBasedCourseLevelFilter(state, action: PayloadAction<string>) {
      state.levelFilter = action.payload;
    },
    setSkillBasedCourseStatusFilter(state, action: PayloadAction<string>) {
      state.statusFilter = action.payload;
    },
    clearSelectedSkillBasedCourse(state) {
      state.selectedCourse = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all skill-based courses
      .addCase(fetchSkillBasedCourses.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchSkillBasedCourses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchSkillBasedCourses.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to load skill-based courses";
      })

      // Create skill-based course
      .addCase(createSkillBasedCourse.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(createSkillBasedCourse.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items.unshift(action.payload);
      })
      .addCase(createSkillBasedCourse.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to create skill-based course";
      })

      // Fetch skill-based course stats
      .addCase(fetchSkillBasedCoursesStats.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchSkillBasedCoursesStats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.stats = action.payload;
      })
      .addCase(fetchSkillBasedCoursesStats.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to load skill-based course stats";
      })

      // Get skill-based course by id
      .addCase(fetchSkillBasedCourseById.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
        state.selectedCourse = null;
      })
      .addCase(fetchSkillBasedCourseById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedCourse = action.payload;
      })
      .addCase(fetchSkillBasedCourseById.rejected, (state, action) => {
        state.status = "failed";
        state.selectedCourse = null;
        state.error = (action.payload as string) || "Failed to fetch skill-based course";
      })

      // Update skill-based course
      .addCase(updateSkillBasedCourse.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(updateSkillBasedCourse.fulfilled, (state, action) => {
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
      .addCase(updateSkillBasedCourse.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to update skill-based course";
      })

      // Delete skill-based course
      .addCase(deleteSkillBasedCourse.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(deleteSkillBasedCourse.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = state.items.filter((course) => course._id !== action.payload);
        if (state.selectedCourse?._id === action.payload) {
          state.selectedCourse = null;
        }
      })
      .addCase(deleteSkillBasedCourse.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to delete skill-based course";
      });
  },
});

export const {
  setSkillBasedCourseQuery,
  setSkillBasedCourseCategoryFilter,
  setSkillBasedCourseLevelFilter,
  setSkillBasedCourseStatusFilter,
  clearSelectedSkillBasedCourse,
} = skillBasedCoursesSlice.actions;
export default skillBasedCoursesSlice.reducer;
