"use client";

import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export type Lead = {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  source: string;
  status: string;
  priority: string;
  estimatedValue: number;
  notes: string;
  lastContact: string;
  createdAt: string;
};

type LeadsState = {
  items: Lead[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
  query: string;
  location: string;
  type: string;
  stats: Record<string, unknown> | null;
  selectedLead: Lead | null;
};

const initialState: LeadsState = {
  items: [],
  status: "idle",
  error: undefined,
  query: "",
  location: "",
  type: "",
  stats: null,
  selectedLead: null,
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

const normalizeLead = (raw: Record<string, unknown>): Lead => ({
  ...raw,
  _id: (raw._id as string) ?? "",
} as Lead);

export const fetchLeads = createAsyncThunk(
  "leads/fetchLeads",
  async (
    params: { q?: string; location?: string; type?: string } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get<ApiResponse<{ docs: Lead[] }>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/leads`,
        { params }
      );
      const data = extractData(response.data);
      return (data?.docs ?? []).map(normalizeLead);
    } catch (error) {
      console.error("Failed to fetch leads", error);
      return rejectWithValue("Failed to fetch leads");
    }
  }
);

export const fetchLeadStats = createAsyncThunk(
  "leads/fetchLeadStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<ApiResponse<Record<string, unknown>>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/leads/stats`
      );
      return extractData(response.data);
    } catch (error) {
      console.error("Failed to fetch lead stats", error);
      return rejectWithValue("Failed to fetch lead stats");
    }
  }
);

  export const fetchLeadById = createAsyncThunk(
  "leads/fetchLeadById",
  async (leadId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get<ApiResponse<Lead>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/leads/${leadId}`
      );
      return normalizeLead(extractData(response.data));
    } catch (error) {
      console.error("Failed to fetch lead", error);
      return rejectWithValue("Failed to fetch lead");
    }
  }
);

export const createLead = createAsyncThunk(
  "leads/createLead",
  async (data: Omit<Lead, "_id">, { rejectWithValue }) => {
    try {
      const response = await axios.post<ApiResponse<Lead>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/leads`,
        data
      );
      return normalizeLead(extractData(response.data));
    } catch (error) {
      console.error("Failed to create lead", error);
      return rejectWithValue("Failed to create lead");
    }
  }
);

export const updateLead = createAsyncThunk(
  "leads/updateLead",
  async (
    { leadId, data }: { leadId: string; data: Partial<Lead> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch<ApiResponse<Lead>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/leads/${leadId}`,
        data
      );
      return normalizeLead(extractData(response.data));
    } catch (error) {
      console.error("Failed to update lead", error);
      return rejectWithValue("Failed to update lead");
    }
  }
);

export const deleteLead = createAsyncThunk(
  "leads/deleteLead",
  async (leadId: string, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/leads/${leadId}`
      );
      return leadId;
    } catch (error) {
      console.error("Failed to delete lead", error);
      return rejectWithValue("Failed to delete lead");
    }
  }
);

const leadSlice = createSlice({
  name: "leads",
  initialState,
  reducers: {
    setLeadQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    setLeadLocation(state, action: PayloadAction<string>) {
      state.location = action.payload;
    },
    setLeadType(state, action: PayloadAction<string>) {
      state.type = action.payload;
    },
    clearSelectedLead(state) {
      state.selectedLead = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
        .addCase(fetchLeads.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to load leads";
      })
      .addCase(fetchLeadStats.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchLeadStats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.stats = action.payload;
      })
      .addCase(fetchLeadStats.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Failed to load lead stats";
      })
      .addCase(fetchLeadById.pending, (state) => {
        state.status = "loading";
        state.selectedLead = null;
      })
      .addCase(fetchLeadById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedLead = action.payload;
      })
      .addCase(fetchLeadById.rejected, (state, action) => {
        state.status = "failed";
        state.selectedLead = null;
        state.error =
          (action.payload as string) || "Failed to fetch lead details";
      })
      .addCase(createLead.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items.unshift(action.payload);
      })
      .addCase(createLead.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Failed to create lead";
      })
      .addCase(updateLead.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        state.status = "succeeded";
        const idx = state.items.findIndex(
          (lead) => lead._id === action.payload._id
        );
        if (idx !== -1) {
          state.items[idx] = action.payload;
        }
        if (state.selectedLead?._id === action.payload._id) {
          state.selectedLead = action.payload;
        }
      })
      .addCase(updateLead.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Failed to update lead";
      })
      .addCase(deleteLead.pending, (state) => {
        state.status = "loading";
      })
        .addCase(deleteLead.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = state.items.filter(
          (lead) => lead._id !== action.payload
        );
        if (state.selectedLead?._id === action.payload) {
          state.selectedLead = null;
        }
      })
      .addCase(deleteLead.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Failed to delete lead";
      });
  },
});

export const {
  setLeadQuery,
  setLeadLocation,
  setLeadType,
  clearSelectedLead,
} = leadSlice.actions;

export default leadSlice.reducer;