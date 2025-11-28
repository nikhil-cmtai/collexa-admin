import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "@/lib/apiClient";
import { AxiosError } from "axios";

interface DashboardStats {
  totalStudents: number;
  activeCourses: number;
  campusCourses: number;
  skillsBasedCourses: number;
  admissionRequests: number;
  totalLeads: number;
  totalRevenue: number;
  totalTestimonials: number;
}

interface RecentActivity {
  type: string;
  description: string;
  date: string;
}

interface TopCourse {
  name: string;
  enrollments: number;
  revenue: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
  topPerformingCourses: TopCourse[];
}

interface DashboardState {
  data: DashboardData | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: DashboardState = {
  data: null,
  status: 'idle',
  error: null,
};

export const fetchDashboardData = createAsyncThunk<
  DashboardData,
  void,
  { rejectValue: string }
>('dashboard/fetchData', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<{ data: DashboardData }>('/admin/dashboard');
    return response.data.data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch dashboard data');
  }
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action: PayloadAction<DashboardData>) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'An unknown error occurred';
        state.data = null;
      });
  },
});

export default dashboardSlice.reducer;