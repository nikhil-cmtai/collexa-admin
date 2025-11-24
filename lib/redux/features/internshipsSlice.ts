"use client";

import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export type Internship = {
  id: string;
  _id?: string;
  title: string;
  company: string;
  location: string;
  type: string;
  duration: string;
  stipend: number;
  category: string;
  status: string;
  postedDate: string;
  applicationDeadline: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  skills: string[];
  contactEmail: string;
  contactPhone: string;
  website: string;
  applicants: number;
  maxApplicants: number;
  rating: number;
  companySize: string;
  industry: string;
};

type InternshipsState = {
  items: Internship[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
  query: string;
  location: string;
  type: string;
  stats: Record<string, unknown> | null;
  selectedInternship: Internship | null;
};

const initialState: InternshipsState = {
  items: [],
  status: "idle",
  error: undefined,
  query: "",
  location: "",
  type: "",
  stats: null,
  selectedInternship: null,
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

const normalizeInternship = (raw: Record<string, unknown>): Internship => ({
  ...raw,
  id: (raw.id as string) ?? (raw._id as string) ?? "",
} as Internship);

export const fetchInternships = createAsyncThunk(
  "internships/fetchInternships",
  async (
    params: { q?: string; location?: string; type?: string } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get<ApiResponse<{ docs: Internship[] }>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/internships`,
        { params }
      );
      const data = extractData(response.data);
      return (data?.docs ?? []).map(normalizeInternship);
    } catch (error) {
      console.error("Failed to fetch internships", error);
      return rejectWithValue("Failed to fetch internships");
    }
  }
);

export const fetchInternshipStats = createAsyncThunk(
  "internships/fetchInternshipStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<ApiResponse<Record<string, unknown>>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/internships/stats`
      );
      return extractData(response.data);
    } catch (error) {
      console.error("Failed to fetch internship stats", error);
      return rejectWithValue("Failed to fetch internship stats");
    }
  }
);

export const fetchInternshipById = createAsyncThunk(
  "internships/fetchInternshipById",
  async (internshipId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get<ApiResponse<Internship>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/internships/${internshipId}`
      );
      return normalizeInternship(extractData(response.data));
    } catch (error) {
      console.error("Failed to fetch internship", error);
      return rejectWithValue("Failed to fetch internship");
    }
  }
);

export const createInternship = createAsyncThunk(
  "internships/createInternship",
  async (data: Omit<Internship, "id">, { rejectWithValue }) => {
    try {
      const response = await axios.post<ApiResponse<Internship>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/internships`,
        data
      );
      return normalizeInternship(extractData(response.data));
    } catch (error) {
      console.error("Failed to create internship", error);
      return rejectWithValue("Failed to create internship");
    }
  }
);

export const updateInternship = createAsyncThunk(
  "internships/updateInternship",
  async (
    { internshipId, data }: { internshipId: string; data: Partial<Internship> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch<ApiResponse<Internship>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/internships/${internshipId}`,
        data
      );
      return normalizeInternship(extractData(response.data));
    } catch (error) {
      console.error("Failed to update internship", error);
      return rejectWithValue("Failed to update internship");
    }
  }
);

export const deleteInternship = createAsyncThunk(
  "internships/deleteInternship",
  async (internshipId: string, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/internships/${internshipId}`
      );
      return internshipId;
    } catch (error) {
      console.error("Failed to delete internship", error);
      return rejectWithValue("Failed to delete internship");
    }
  }
);

const internshipSlice = createSlice({
  name: "internships",
  initialState,
  reducers: {
    setInternshipQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    setInternshipLocation(state, action: PayloadAction<string>) {
      state.location = action.payload;
    },
    setInternshipType(state, action: PayloadAction<string>) {
      state.type = action.payload;
    },
    clearSelectedInternship(state) {
      state.selectedInternship = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInternships.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchInternships.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchInternships.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to load internships";
      })
      .addCase(fetchInternshipStats.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchInternshipStats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.stats = action.payload;
      })
      .addCase(fetchInternshipStats.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Failed to load internship stats";
      })
      .addCase(fetchInternshipById.pending, (state) => {
        state.status = "loading";
        state.selectedInternship = null;
      })
      .addCase(fetchInternshipById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedInternship = action.payload;
      })
      .addCase(fetchInternshipById.rejected, (state, action) => {
        state.status = "failed";
        state.selectedInternship = null;
        state.error =
          (action.payload as string) || "Failed to fetch internship details";
      })
      .addCase(createInternship.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createInternship.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items.unshift(action.payload);
      })
      .addCase(createInternship.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Failed to create internship";
      })
      .addCase(updateInternship.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateInternship.fulfilled, (state, action) => {
        state.status = "succeeded";
        const idx = state.items.findIndex(
          (internship) => internship.id === action.payload.id
        );
        if (idx !== -1) {
          state.items[idx] = action.payload;
        }
        if (state.selectedInternship?.id === action.payload.id) {
          state.selectedInternship = action.payload;
        }
      })
      .addCase(updateInternship.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Failed to update internship";
      })
      .addCase(deleteInternship.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteInternship.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = state.items.filter(
          (internship) => internship.id !== action.payload
        );
        if (state.selectedInternship?.id === action.payload) {
          state.selectedInternship = null;
        }
      })
      .addCase(deleteInternship.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Failed to delete internship";
      });
  },
});

export const {
  setInternshipQuery,
  setInternshipLocation,
  setInternshipType,
  clearSelectedInternship,
} = internshipSlice.actions;

export default internshipSlice.reducer;