"use client";

import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export type AdmissionRequest = {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  university: string;
  location: string;
  status: "pending" | "under-review" | "approved" | "rejected" | "waitlisted" | "enrolled";
  priority: "low" | "medium" | "high";
  applicationDate: string;
  lastContact: string;
  createdAt?: string;
  assignedTo: string;
  notes: string;
  documents: string[];
  expectedStartDate: string;
  updatedAt?: string;
};

type AdmissionRequestsState = {
  items: AdmissionRequest[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
  query: string;
  statusFilter: string;
  priorityFilter: string;
  courseFilter: string;
  stats: Record<string, unknown> | null;
  selectedRequest: AdmissionRequest | null;
};

const initialState: AdmissionRequestsState = {
  items: [],
  status: "idle",
  error: undefined,
  query: "",
  statusFilter: "",
  priorityFilter: "",
  courseFilter: "",
  stats: null,
  selectedRequest: null,
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

const normalizeAdmissionRequest = (raw: Record<string, unknown>): AdmissionRequest => ({
  ...raw,
  _id: (raw._id as string) ?? "",
  name: (raw.name as string) ?? "",
  email: (raw.email as string) ?? "",
  phone: (raw.phone as string) ?? "",
  course: (raw.course as string) ?? "",
  university: (raw.university as string) ?? "",
  location: (raw.location as string) ?? "",
  status: (raw.status as AdmissionRequest['status']) ?? "pending",
  priority: (raw.priority as AdmissionRequest['priority']) ?? "medium",
  applicationDate: (raw.applicationDate as string) ?? (raw.createdAt as string) ?? new Date().toISOString(),
  lastContact: (raw.lastContact as string) ?? (raw.updatedAt as string) ?? new Date().toISOString(),
  assignedTo: (raw.assignedTo as string) ?? "",
  notes: (raw.notes as string) ?? "",
  documents: Array.isArray(raw.documents) ? (raw.documents as string[]) : [],
  expectedStartDate: (raw.expectedStartDate as string) ?? "",
  createdAt: (raw.createdAt as string) ?? new Date().toISOString(),
  updatedAt: (raw.updatedAt as string) ?? new Date().toISOString(),
} as AdmissionRequest);

// GET /admin/admission-requests
export const fetchAdmissionRequests = createAsyncThunk(
  "admissionRequests/fetchAdmissionRequests",
  async (
    params: { q?: string; status?: string; priority?: string; course?: string } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get<ApiResponse<{ docs: AdmissionRequest[] }>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/admission-requests`,
        { params }
      );
      const data = extractData(response.data);
      return (data?.docs ?? []).map(normalizeAdmissionRequest);
    } catch (error: unknown) {
      console.error("Failed to fetch admission requests:", error);
      return rejectWithValue("Failed to fetch admission requests");
    }
  }
);

// POST /admin/admission-requests
export const createAdmissionRequest = createAsyncThunk(
  "admissionRequests/createAdmissionRequest",
  async (
    data: Omit<AdmissionRequest, "_id" | "createdAt" | "updatedAt">,
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post<ApiResponse<AdmissionRequest>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/admission-requests`,
        data
      );
      return normalizeAdmissionRequest(extractData(response.data));
    } catch (error: unknown) {
      console.error("Failed to create admission request:", error);
      return rejectWithValue("Failed to create admission request");
    }
  }
);

// GET /admin/admission-requests/stats
export const fetchAdmissionRequestsStats = createAsyncThunk(
  "admissionRequests/fetchAdmissionRequestsStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<ApiResponse<Record<string, unknown>>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/admission-requests/stats`
      );
      return extractData(response.data);
    } catch (error: unknown) {
      console.error("Failed to fetch admission request stats:", error);
      return rejectWithValue("Failed to fetch admission request stats");
    }
  }
);

// GET /admin/admission-requests/:id
export const fetchAdmissionRequestById = createAsyncThunk(
  "admissionRequests/fetchAdmissionRequestById",
  async (requestId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get<ApiResponse<AdmissionRequest>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/admission-requests/${requestId}`
      );
      return normalizeAdmissionRequest(extractData(response.data));
    } catch (error: unknown) {
      console.error("Failed to fetch admission request by id:", error);
      return rejectWithValue("Failed to fetch admission request by id");
    }
  }
);

// PATCH /admin/admission-requests/:id
export const updateAdmissionRequest = createAsyncThunk(
  "admissionRequests/updateAdmissionRequest",
  async (
    { requestId, data }: { requestId: string; data: Partial<AdmissionRequest> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch<ApiResponse<AdmissionRequest>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/admission-requests/${requestId}`,
        data
      );
      return normalizeAdmissionRequest(extractData(response.data));
    } catch (error: unknown) {
      console.error("Failed to update admission request:", error);
      return rejectWithValue("Failed to update admission request");
    }
  }
);

// DELETE /admin/admission-requests/:id
export const deleteAdmissionRequest = createAsyncThunk(
  "admissionRequests/deleteAdmissionRequest",
  async (requestId: string, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/admission-requests/${requestId}`
      );
      return requestId;
    } catch (error: unknown) {
      console.error("Failed to delete admission request:", error);
      return rejectWithValue("Failed to delete admission request");
    }
  }
);

const admissionRequestSlice = createSlice({
  name: "admissionRequests",
  initialState,
  reducers: {
    setAdmissionRequestQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    setAdmissionRequestStatusFilter(state, action: PayloadAction<string>) {
      state.statusFilter = action.payload;
    },
    setAdmissionRequestPriorityFilter(state, action: PayloadAction<string>) {
      state.priorityFilter = action.payload;
    },
    setAdmissionRequestCourseFilter(state, action: PayloadAction<string>) {
      state.courseFilter = action.payload;
    },
    clearSelectedAdmissionRequest(state) {
      state.selectedRequest = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all admission requests
      .addCase(fetchAdmissionRequests.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchAdmissionRequests.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchAdmissionRequests.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to load admission requests";
      })

      // Create admission request
      .addCase(createAdmissionRequest.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(createAdmissionRequest.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items.unshift(action.payload);
      })
      .addCase(createAdmissionRequest.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to create admission request";
      })

      // Fetch admission request stats
      .addCase(fetchAdmissionRequestsStats.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchAdmissionRequestsStats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.stats = action.payload;
      })
      .addCase(fetchAdmissionRequestsStats.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to load admission request stats";
      })

      // Get admission request by id
      .addCase(fetchAdmissionRequestById.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
        state.selectedRequest = null;
      })
      .addCase(fetchAdmissionRequestById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedRequest = action.payload;
      })
      .addCase(fetchAdmissionRequestById.rejected, (state, action) => {
        state.status = "failed";
        state.selectedRequest = null;
        state.error = (action.payload as string) || "Failed to fetch admission request";
      })

      // Update admission request
      .addCase(updateAdmissionRequest.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(updateAdmissionRequest.fulfilled, (state, action) => {
        state.status = "succeeded";
        const idx = state.items.findIndex(
          (request) => request._id === action.payload._id
        );
        if (idx !== -1) {
          state.items[idx] = { ...state.items[idx], ...action.payload };
        }
        if (state.selectedRequest?._id === action.payload._id) {
          state.selectedRequest = { ...state.selectedRequest, ...action.payload };
        }
      })
      .addCase(updateAdmissionRequest.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to update admission request";
      })

      // Delete admission request
      .addCase(deleteAdmissionRequest.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(deleteAdmissionRequest.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = state.items.filter((request) => request._id !== action.payload);
        if (state.selectedRequest?._id === action.payload) {
          state.selectedRequest = null;
        }
      })
      .addCase(deleteAdmissionRequest.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to delete admission request";
      });
  },
});

export const {
  setAdmissionRequestQuery,
  setAdmissionRequestStatusFilter,
  setAdmissionRequestPriorityFilter,
  setAdmissionRequestCourseFilter,
  clearSelectedAdmissionRequest,
} = admissionRequestSlice.actions;
export default admissionRequestSlice.reducer;
