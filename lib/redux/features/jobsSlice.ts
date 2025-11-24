"use client";

import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  stipend: string | null;
  type: string;
  duration: string | null;
  tags: string[];
  postedAt: string;
};

type JobsState = {
  items: Job[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
  query: string;
  location: string;
  type: string;
  stats: Record<string, unknown> | null;
  selectedJob: Job | null;
};

const initialState: JobsState = {
  items: [],
  status: "idle",
  error: undefined,
  query: "",
  location: "",
  type: "",
  stats: null,
  selectedJob: null,
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

// GET /jobs
export const fetchJobs = createAsyncThunk(
  "jobs/fetchJobs",
  async (
    params: { q?: string; location?: string; type?: string } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get<ApiResponse<{ docs: Job[] }>>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/jobs`, {
        params,
      });
      const data = extractData(response.data);
      return data?.docs ?? [];
    } catch (error: unknown) {
      console.error("Failed to fetch jobs:", error);
      return rejectWithValue("Failed to fetch jobs");
    }
  }
);

// POST /jobs
export const createJob = createAsyncThunk(
  "jobs/createJob",
  async (
    data: Omit<Job, "id" | "postedAt">,
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post<ApiResponse<Job>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/jobs`,
        data
      );
      return extractData(response.data);
    } catch (error: unknown) {
      console.error("Failed to create job:", error);
      return rejectWithValue("Failed to create job");
    }
  }
);

// GET /jobs/stats
export const fetchJobsStats = createAsyncThunk(
  "jobs/fetchJobsStats",
  async (
    _,
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get<ApiResponse<Record<string, unknown>>>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/jobs/stats`);
      return extractData(response.data);
    } catch (error: unknown) {
      console.error("Failed to fetch jobs stats:", error);
      return rejectWithValue("Failed to fetch jobs stats");
    }
  }
);

// GET /jobs/:jobId
export const fetchJobById = createAsyncThunk(
  "jobs/fetchJobById",
  async (
    jobId: string,
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get<ApiResponse<Job>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/jobs/${jobId}`
      );
      return extractData(response.data);
    } catch (error: unknown) {
      console.error("Failed to fetch job by id:", error);
      return rejectWithValue("Failed to fetch job by id");
    }
  }
);

// PATCH /jobs/:jobId
export const updateJob = createAsyncThunk(
  "jobs/updateJob",
  async (
    { jobId, data }: { jobId: string; data: Partial<Job> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch<ApiResponse<Job>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/jobs/${jobId}`,
        data
      );
      return extractData(response.data);
    } catch (error: unknown) {
      console.error("Failed to update job:", error);
      return rejectWithValue("Failed to update job");
    }
  }
);

// DELETE /jobs/:jobId
export const deleteJob = createAsyncThunk(
  "jobs/deleteJob",
  async (
    jobId: string,
    { rejectWithValue }
  ) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/jobs/${jobId}`);
      return jobId;
    } catch (error: unknown) {
      console.error("Failed to delete job:", error);
      return rejectWithValue("Failed to delete job");
    }
  }
);

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    setLocation(state, action: PayloadAction<string>) {
      state.location = action.payload;
    },
    setType(state, action: PayloadAction<string>) {
      state.type = action.payload;
    },
    clearSelectedJob(state) {
      state.selectedJob = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all jobs
      .addCase(fetchJobs.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string || "Failed to load jobs";
      })

      // Create job
      .addCase(createJob.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items.unshift(action.payload);
      })
      .addCase(createJob.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string || "Failed to create job";
      })

      // Jobs stats
      .addCase(fetchJobsStats.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchJobsStats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.stats = action.payload;
      })
      .addCase(fetchJobsStats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string || "Failed to load job stats";
      })

      // Get job by id
      .addCase(fetchJobById.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
        state.selectedJob = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedJob = action.payload;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.status = "failed";
        state.selectedJob = null;
        state.error = action.payload as string || "Failed to fetch job";
      })

      // Update job
      .addCase(updateJob.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Update job in items if found
        const idx = state.items.findIndex((j) => j.id === action.payload.id);
        if (idx !== -1) {
          state.items[idx] = { ...state.items[idx], ...action.payload };
        }
        // If selected job is being updated, update that
        if (state.selectedJob?.id === action.payload.id) {
          state.selectedJob = { ...state.selectedJob, ...action.payload };
        }
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string || "Failed to update job";
      })

      // Delete job
      .addCase(deleteJob.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = state.items.filter((job) => job.id !== action.payload);
        if (state.selectedJob?.id === action.payload) {
          state.selectedJob = null;
        }
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string || "Failed to delete job";
      });
  },
});

export const { setQuery, setLocation, setType, clearSelectedJob } =
  jobsSlice.actions;
export default jobsSlice.reducer;
