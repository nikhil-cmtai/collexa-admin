"use client";

import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export type User = {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "admin" | "student" | "company" | "institution";
  status: "active" | "inactive" | "suspended";
  avatar?: string;
  address?: string;
  dateOfBirth?: string;
  joinDate?: string;
  lastLogin?: string;
  bio?: string;
  verified?: boolean;
  totalCourses?: number;
  totalSpent?: number;
  rating?: number;
  students?: number;
  createdAt?: string;
  updatedAt?: string;
};

type UsersState = {
  items: User[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
  query: string;
  roleFilter: string;
  statusFilter: string;
  stats: Record<string, unknown> | null;
  selectedUser: User | null;
};

const initialState: UsersState = {
  items: [],
  status: "idle",
  error: undefined,
  query: "",
  roleFilter: "",
  statusFilter: "",
  stats: null,
  selectedUser: null,
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

const normalizeUser = (raw: Record<string, unknown>): User => {
  const name = (raw.name as string) || "";
  const nameParts = name.split(" ");
  return {
    ...raw,
    _id: (raw._id as string) ?? (raw.id as string) ?? "",
    firstName: (raw.firstName as string) ?? nameParts[0] ?? "",
    lastName: (raw.lastName as string) ?? nameParts.slice(1).join(" ") ?? "",
    email: (raw.email as string) ?? "",
    phone: (raw.phone as string) ?? "",
    role: (raw.role as string) ?? "student",
    status: (raw.status as string) ?? "active",
    avatar: (raw.avatar as string) ?? "",
    address: (raw.address as string) ?? "",
    dateOfBirth: (raw.dateOfBirth as string) ?? "",
    joinDate: (raw.joinDate as string) ?? (raw.createdAt as string) ?? new Date().toISOString(),
    lastLogin: (raw.lastLogin as string) ?? "",
    bio: (raw.bio as string) ?? "",
    verified: (raw.verified as boolean) ?? false,
    totalCourses: (raw.totalCourses as number) ?? 0,
    totalSpent: (raw.totalSpent as number) ?? 0,
    rating: (raw.rating as number) ?? 0,
    students: (raw.students as number) ?? 0,
    createdAt: (raw.createdAt as string) ?? new Date().toISOString(),
    updatedAt: (raw.updatedAt as string) ?? new Date().toISOString(),
  } as User;
};

// GET /admin/users
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (
    params: { q?: string; role?: string; status?: string } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get<ApiResponse<{ docs: User[] }>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users`,
        { params }
      );
      const data = extractData(response.data);
      return (data?.docs ?? []).map(normalizeUser);
    } catch (error: unknown) {
      console.error("Failed to fetch users:", error);
      return rejectWithValue("Failed to fetch users");
    }
  }
);

// POST /admin/users
export const createUser = createAsyncThunk(
  "users/createUser",
  async (
    data: Omit<User, "_id" | "createdAt" | "updatedAt">,
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post<ApiResponse<User>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users`,
        data
      );
      return normalizeUser(extractData(response.data));
    } catch (error: unknown) {
      console.error("Failed to create user:", error);
      return rejectWithValue("Failed to create user");
    }
  }
);

// GET /admin/users/stats
export const fetchUsersStats = createAsyncThunk(
  "users/fetchUsersStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<ApiResponse<Record<string, unknown>>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users/stats`
      );
      return extractData(response.data);
    } catch (error: unknown) {
      console.error("Failed to fetch user stats:", error);
      return rejectWithValue("Failed to fetch user stats");
    }
  }
);

// GET /admin/users/:id
export const fetchUserById = createAsyncThunk(
  "users/fetchUserById",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get<ApiResponse<User>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users/${userId}`
      );
      return normalizeUser(extractData(response.data));
    } catch (error: unknown) {
      console.error("Failed to fetch user by id:", error);
      return rejectWithValue("Failed to fetch user by id");
    }
  }
);

// PATCH /admin/users/:id
export const updateUser = createAsyncThunk(
  "users/updateUser",
  async (
    { userId, data }: { userId: string; data: Partial<User> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch<ApiResponse<User>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users/${userId}`,
        data
      );
      return normalizeUser(extractData(response.data));
    } catch (error: unknown) {
      console.error("Failed to update user:", error);
      return rejectWithValue("Failed to update user");
    }
  }
);

// DELETE /admin/users/:id
export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users/${userId}`
      );
      return userId;
    } catch (error: unknown) {
      console.error("Failed to delete user:", error);
      return rejectWithValue("Failed to delete user");
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUserQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    setUserRoleFilter(state, action: PayloadAction<string>) {
      state.roleFilter = action.payload;
    },
    setUserStatusFilter(state, action: PayloadAction<string>) {
      state.statusFilter = action.payload;
    },
    clearSelectedUser(state) {
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all users
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to load users";
      })

      // Create user
      .addCase(createUser.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items.unshift(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to create user";
      })

      // Fetch user stats
      .addCase(fetchUsersStats.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchUsersStats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.stats = action.payload;
      })
      .addCase(fetchUsersStats.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to load user stats";
      })

      // Get user by id
      .addCase(fetchUserById.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
        state.selectedUser = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.status = "failed";
        state.selectedUser = null;
        state.error = (action.payload as string) || "Failed to fetch user";
      })

      // Update user
      .addCase(updateUser.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        const idx = state.items.findIndex(
          (user) => user._id === action.payload._id
        );
        if (idx !== -1) {
          state.items[idx] = { ...state.items[idx], ...action.payload };
        }
        if (state.selectedUser?._id === action.payload._id) {
          state.selectedUser = { ...state.selectedUser, ...action.payload };
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to update user";
      })

      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = state.items.filter((user) => user._id !== action.payload);
        if (state.selectedUser?._id === action.payload) {
          state.selectedUser = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to delete user";
      });
  },
});

export const {
  setUserQuery,
  setUserRoleFilter,
  setUserStatusFilter,
  clearSelectedUser,
} = userSlice.actions;
export default userSlice.reducer;
