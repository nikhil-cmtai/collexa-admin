import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { User } from './userSlice'; // Assuming you have a userSlice with User type
import apiClient from "@/lib/apiClient";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  status: 'idle',
  error: null,
};

interface ApiErrorData {
  message: string;
}

export const registerUser = createAsyncThunk<
  { email: string },
  any,
  { rejectValue: string }
>('auth/registerUser', async (userData, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(`/auth/register`, userData);
    return response.data.data;
  } catch (error) {
    const err = error as AxiosError<ApiErrorData>;
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const verifyEmail = createAsyncThunk<
  { user: User },
  { otp: string },
  { rejectValue: string }
>('auth/verifyEmail', async ({ otp }, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(`/auth/verify-email`, { otp });
    return response.data.data;
  } catch (error) {
    const err = error as AxiosError<ApiErrorData>;
    return rejectWithValue(err.response?.data?.message || 'OTP verification failed');
  }
});

export const loginUser = createAsyncThunk<
  { user: User },
  any,
  { rejectValue: string }
>('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(`/auth/login`, credentials);
    return response.data.data;
  } catch (error) {
    const err = error as AxiosError<ApiErrorData>;
    return rejectWithValue(err.response?.data?.message || 'Invalid credentials');
  }
});

export const logoutUser = createAsyncThunk<
  {},
  void,
  { rejectValue: string }
>('auth/logoutUser', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(`/auth/logout`);
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiErrorData>;
    return rejectWithValue(err.response?.data?.message || 'Logout failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'An unknown error occurred';
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ user: User }>) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload ?? 'An unknown error occurred';
      })
      .addCase(verifyEmail.fulfilled, (state, action: PayloadAction<{ user: User }>) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.status = 'idle';
      });
  },
});

export default authSlice.reducer;