import { createAsyncThunk, createSlice, PayloadAction, AnyAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import apiClient from "@/lib/apiClient";

export interface Job {
  _id: string;
  postedBy: string;
  jobNumber: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Remote' | 'Hybrid';
  experience: string;
  salary: number;
  category: string;
  status: 'active' | 'closed' | 'paused';
  applicationDeadline: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  skills: string[];
  contactEmail: string;
  contactPhone: string;
  website?: string;
  applicants: number;
  maxApplicants: number;
  rating?: number;
  companySize?: string;
  industry?: string;
  createdAt: string;
  updatedAt: string;
}

export type JobCreatePayload = Omit<Job, '_id' | 'postedBy' | 'jobNumber' | 'applicants' | 'createdAt' | 'updatedAt'>;
export type JobUpdatePayload = Partial<JobCreatePayload>;

interface JobsState {
  items: Job[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  stats: Record<string, unknown> | null;
  selectedJob: Job | null;
}

const initialState: JobsState = {
  items: [],
  status: "idle",
  error: null,
  stats: null,
  selectedJob: null,
};

interface ApiErrorData { message: string; }

export const fetchJobs = createAsyncThunk<
  Job[],
  { q?: string; location?: string; type?: string; category?: string; status?: string } | undefined,
  { rejectValue: string }
>(
  "jobs/fetchJobs",
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<{ data: { docs: Job[] } }>(`/admin/jobs`, { params });
      return response.data.data?.docs ?? [];
    } catch (error) {
      return rejectWithValue("Failed to fetch jobs");
    }
  }
);

export const createJob = createAsyncThunk<Job, JobCreatePayload, { rejectValue: string }>(
  "jobs/createJob",
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<{ data: Job }>(`/admin/jobs`, data);
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError<ApiErrorData>;
      return rejectWithValue(err.response?.data?.message || "Failed to create job");
    }
  }
);

export const fetchJobsStats = createAsyncThunk<Record<string, unknown>, void, { rejectValue: string }>(
  "jobs/fetchJobsStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<{ data: Record<string, unknown> }>(`/admin/jobs/stats`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue("Failed to fetch job stats");
    }
  }
);

export const fetchJobById = createAsyncThunk<Job, string, { rejectValue: string }>(
  "jobs/fetchJobById",
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<{ data: Job }>(`/admin/jobs/${jobId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue("Failed to fetch job details");
    }
  }
);

export const updateJob = createAsyncThunk<Job, { jobId: string; data: JobUpdatePayload }, { rejectValue: string }>(
  "jobs/updateJob",
  async ({ jobId, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch<{ data: Job }>(`/admin/jobs/${jobId}`, data);
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError<ApiErrorData>;
      return rejectWithValue(err.response?.data?.message || "Failed to update job");
    }
  }
);

export const deleteJob = createAsyncThunk<string, string, { rejectValue: string }>(
  "jobs/deleteJob",
  async (jobId, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/admin/jobs/${jobId}`);
      return jobId;
    } catch (error) {
      return rejectWithValue("Failed to delete job");
    }
  }
);

const isRejectedAction = (action: AnyAction): action is PayloadAction<string> => {
    return action.type.endsWith('/rejected');
}

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    clearSelectedJob(state) {
      state.selectedJob = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.fulfilled, (state, action: PayloadAction<Job[]>) => {
        state.items = action.payload;
      })
      .addCase(fetchJobsStats.fulfilled, (state, action: PayloadAction<Record<string, unknown>>) => {
        state.stats = action.payload;
      })
      .addCase(fetchJobById.fulfilled, (state, action: PayloadAction<Job>) => {
        state.selectedJob = action.payload;
      })
      .addCase(createJob.fulfilled, (state, action: PayloadAction<Job>) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateJob.fulfilled, (state, action: PayloadAction<Job>) => {
        const index = state.items.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedJob?._id === action.payload._id) {
            state.selectedJob = action.payload;
        }
      })
      .addCase(deleteJob.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
        if (state.selectedJob?._id === action.payload) {
          state.selectedJob = null;
        }
      })
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.status = 'loading';
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled'),
        (state) => {
          state.status = 'succeeded';
        }
      )
      .addMatcher(
        isRejectedAction,
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        }
      );
  },
});

export const { clearSelectedJob } = jobsSlice.actions;
export default jobsSlice.reducer;