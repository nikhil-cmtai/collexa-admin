import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { toast } from "sonner";
import apiClient from "@/lib/apiClient";

// Interface for API Error Response
interface ApiErrorResponse {
  message: string;
}

export interface Package {
  _id: string;
  packageNumber: string;
  name: string;
  description: string;
  jobLimit: number;
  internshipLimit: number;
  isActive: boolean;
  createdAt: string;
}

interface PackagesState {
  items: Package[];
  stats: {
    totalPackages: number;
    activePackages: number;
  };
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: PackagesState = {
  items: [],
  stats: {
    totalPackages: 0,
    activePackages: 0,
  },
  status: "idle",
  error: null,
};

export const fetchPackages = createAsyncThunk(
  "packages/fetchAll",
  async (params: { search?: string; isActive?: boolean } | undefined, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/admin/packages", { params });
      return response.data.data;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      return rejectWithValue(error.response?.data?.message || "Failed to fetch packages");
    }
  }
);

export const fetchPackageStats = createAsyncThunk(
  "packages/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/admin/packages/stats");
      return response.data.data;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const createPackage = createAsyncThunk(
  "packages/create",
  async (data: Partial<Package>, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/admin/packages", data);
      toast.success("Package created successfully");
      return response.data.data;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      toast.error(error.response?.data?.message || "Failed to create package");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updatePackage = createAsyncThunk(
  "packages/update",
  async ({ id, data }: { id: string; data: Partial<Package> }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(`/admin/packages/${id}`, data);
      toast.success("Package updated successfully");
      return response.data.data;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      toast.error(error.response?.data?.message || "Failed to update package");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deletePackage = createAsyncThunk(
  "packages/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/admin/packages/${id}`);
      toast.success("Package deleted successfully");
      return id;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      toast.error(error.response?.data?.message || "Failed to delete package");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const packagesSlice = createSlice({
  name: "packages",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPackages.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPackages.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.docs;
      })
      .addCase(fetchPackages.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(fetchPackageStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(createPackage.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.stats.totalPackages += 1;
        if (action.payload.isActive) state.stats.activePackages += 1;
      })
      .addCase(updatePackage.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deletePackage.fulfilled, (state, action) => {
        const pkg = state.items.find(p => p._id === action.payload);
        if (pkg && pkg.isActive) state.stats.activePackages -= 1;
        state.items = state.items.filter((item) => item._id !== action.payload);
        state.stats.totalPackages -= 1;
      });
  },
});

export default packagesSlice.reducer;