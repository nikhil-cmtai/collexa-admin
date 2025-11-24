"use client";

import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export type JobApplication = {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  coverLetter: string;
  jobId: string;
  userId: string;
  resume: string;
  status: "applied" | "under_review" | "shortlisted" | "interview_scheduled" | "hired" | "rejected";
  createdAt: string;
  updatedAt: string;
  interviewScheduled: boolean;
  interviewDate: string | null;
  notes: string;
}

type JobApplicationState = {
  items: JobApplication[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
  query: string;
  stats: Record<string, unknown> | null;
  selectedJobApplication: JobApplication | null;
}

const initialState: JobApplicationState = {
  items: [],
  status: "idle",
  error: undefined,
  query: "",
  stats: null,
  selectedJobApplication: null,
}

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

const normalizeJobApplication = (raw: Record<string, unknown>): JobApplication => ({
  ...raw,
  _id: (raw._id as string) ?? (raw.id as string) ?? "",
  interviewScheduled: (raw.interviewScheduled as boolean) ?? false,
  interviewDate: (raw.interviewDate as string) ?? null,
  notes: (raw.notes as string) ?? "",
} as JobApplication);

// GET /admin/job-applications
export const fetchJobApplications = createAsyncThunk(
  "jobApplications/fetchJobApplications",
  async (
    params: { q?: string; status?: string; jobId?: string } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get<ApiResponse<{ docs: JobApplication[] }>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/applications`,
        { params }
      );
      const data = extractData(response.data);
      return (data?.docs ?? []).map(normalizeJobApplication);
    } catch (error: unknown) {
      console.error("Failed to fetch job applications:", error);
      return rejectWithValue("Failed to fetch job applications");
    }
  }
);

// POST /admin/job-applications
export const createJobApplication = createAsyncThunk(
  "jobApplications/createJobApplication",
  async (
    data: Omit<JobApplication, "_id" | "createdAt" | "updatedAt">,
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post<ApiResponse<JobApplication>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/applications`,
        data
      );
      return normalizeJobApplication(extractData(response.data));
    } catch (error: unknown) {
      console.error("Failed to create job application:", error);
      return rejectWithValue("Failed to create job application");
    }
  }
);

// GET /admin/job-applications/stats
export const fetchJobApplicationStats = createAsyncThunk(
  "jobApplications/fetchJobApplicationStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<ApiResponse<Record<string, unknown>>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/applications/stats`
      );
      return extractData(response.data);
    } catch (error: unknown) {
      console.error("Failed to fetch job application stats:", error);
      return rejectWithValue("Failed to fetch job application stats");
    }
  }
);

// GET /admin/job-applications/:id
export const fetchJobApplicationById = createAsyncThunk(
  "jobApplications/fetchJobApplicationById",
  async (applicationId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get<ApiResponse<JobApplication>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/applications/${applicationId}`
      );
      return normalizeJobApplication(extractData(response.data));
    } catch (error: unknown) {
      console.error("Failed to fetch job application by id:", error);
      return rejectWithValue("Failed to fetch job application by id");
    }
  }
);

// PATCH /admin/job-applications/:id
export const updateJobApplication = createAsyncThunk(
  "jobApplications/updateJobApplication",
  async (
    { applicationId, data }: { applicationId: string; data: Partial<JobApplication> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch<ApiResponse<JobApplication>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/applications/${applicationId}`,
        data
      );
      return normalizeJobApplication(extractData(response.data));
    } catch (error: unknown) {
      console.error("Failed to update job application:", error);
      return rejectWithValue("Failed to update job application");
    }
  }
);

// DELETE /admin/job-applications/:id
export const deleteJobApplication = createAsyncThunk(
  "jobApplications/deleteJobApplication",
  async (applicationId: string, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/applications/${applicationId}`
      );
      return applicationId;
    } catch (error: unknown) {
      console.error("Failed to delete job application:", error);
      return rejectWithValue("Failed to delete job application");
    }
  }
);

const jobApplicationSlice = createSlice({
  name: "jobApplications",
  initialState,
  reducers: {
    setJobApplicationQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    clearSelectedJobApplication(state) {
      state.selectedJobApplication = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all job applications
      .addCase(fetchJobApplications.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchJobApplications.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchJobApplications.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to load job applications";
      })

      // Create job application
      .addCase(createJobApplication.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(createJobApplication.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items.unshift(action.payload);
      })
      .addCase(createJobApplication.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to create job application";
      })

      // Job application stats
      .addCase(fetchJobApplicationStats.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchJobApplicationStats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.stats = action.payload;
      })
      .addCase(fetchJobApplicationStats.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to load job application stats";
      })

      // Get job application by id
      .addCase(fetchJobApplicationById.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
        state.selectedJobApplication = null;
      })
      .addCase(fetchJobApplicationById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedJobApplication = action.payload;
      })
      .addCase(fetchJobApplicationById.rejected, (state, action) => {
        state.status = "failed";
        state.selectedJobApplication = null;
        state.error = (action.payload as string) || "Failed to fetch job application";
      })

      // Update job application
      .addCase(updateJobApplication.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(updateJobApplication.fulfilled, (state, action) => {
        state.status = "succeeded";
        const idx = state.items.findIndex(
          (app) => app._id === action.payload._id
        );
        if (idx !== -1) {
          state.items[idx] = { ...state.items[idx], ...action.payload };
        }
        if (state.selectedJobApplication?._id === action.payload._id) {
          state.selectedJobApplication = {
            ...state.selectedJobApplication,
            ...action.payload,
          };
        }
      })
      .addCase(updateJobApplication.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to update job application";
      })

      // Delete job application
      .addCase(deleteJobApplication.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(deleteJobApplication.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = state.items.filter((app) => app._id !== action.payload);
        if (state.selectedJobApplication?._id === action.payload) {
          state.selectedJobApplication = null;
        }
      })
      .addCase(deleteJobApplication.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to delete job application";
      });
  },
});

export const {
  setJobApplicationQuery,
  clearSelectedJobApplication,
} = jobApplicationSlice.actions;
export default jobApplicationSlice.reducer;