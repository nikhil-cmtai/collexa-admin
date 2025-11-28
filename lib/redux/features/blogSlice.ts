// src/lib/redux/features/blogSlice.ts

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

// 1. Defining strict types for our Blog data
export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: string;
  category: string; // This will hold the ObjectId string
  tags: string[];
  status: 'published' | 'draft' | 'archived';
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  readTime: string;
  views: number;
  likes: number;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}

// Types for API payloads
export type BlogCreatePayload = Omit<Blog, '_id' | 'createdAt' | 'updatedAt' | 'views' | 'likes'>;
export type BlogUpdatePayload = Partial<BlogCreatePayload>;

// 2. Defining the shape of our Redux state
interface BlogsState {
  items: Blog[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
  stats: Record<string, unknown> | null;
  selectedBlog: Blog | null;
}

const initialState: BlogsState = {
  items: [],
  status: "idle",
  error: undefined,
  stats: null,
  selectedBlog: null,
};

// 3. Defining a generic type for our standard API response
interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// Helper to extract data from the response wrapper
const extractData = <T>(response: { data: ApiResponse<T> }): T => response.data.data;

// 4. Async Thunks with proper TypeScript typing
export const fetchBlogs = createAsyncThunk<
  Blog[], // Return type
  { q?: string; category?: string; status?: string } | undefined, // Argument type
  { rejectValue: string } // ThunkAPI config
>(
  "blogs/fetchBlogs",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get<ApiResponse<{ docs: Blog[] }>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/blogs`,
        { params }
      );
      return extractData(response) ?.docs ?? [];
    } catch (error) {
      return rejectWithValue("Failed to fetch blogs.");
    }
  }
);

export const createBlog = createAsyncThunk<
  Blog,
  BlogCreatePayload,
  { rejectValue: string }
>(
  "blogs/createBlog",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post<ApiResponse<Blog>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/blogs`,
        data
      );
      return extractData(response);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || "Failed to create blog.");
    }
  }
);

export const fetchBlogsStats = createAsyncThunk<
  Record<string, unknown>,
  void,
  { rejectValue: string }
>(
  "blogs/fetchBlogsStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<ApiResponse<Record<string, unknown>>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/blogs/stats`
      );
      return extractData(response);
    } catch (error) {
      return rejectWithValue("Failed to fetch blog stats.");
    }
  }
);

export const fetchBlogById = createAsyncThunk<
  Blog,
  string,
  { rejectValue: string }
>(
  "blogs/fetchBlogById",
  async (blogId, { rejectWithValue }) => {
    try {
      const response = await axios.get<ApiResponse<Blog>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/blogs/${blogId}`
      );
      return extractData(response);
    } catch (error) {
      return rejectWithValue("Failed to fetch blog by ID.");
    }
  }
);

export const updateBlog = createAsyncThunk<
  Blog,
  { blogId: string; data: BlogUpdatePayload },
  { rejectValue: string }
>(
  "blogs/updateBlog",
  async ({ blogId, data }, { rejectWithValue }) => {
    try {
      const response = await axios.patch<ApiResponse<Blog>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/blogs/${blogId}`,
        data
      );
      return extractData(response);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || "Failed to update blog.");
    }
  }
);

export const deleteBlog = createAsyncThunk<
  string, // Returns the ID of the deleted blog
  string, // Takes the blog ID as argument
  { rejectValue: string }
>(
  "blogs/deleteBlog",
  async (blogId, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/blogs/${blogId}`
      );
      return blogId;
    } catch (error) {
      return rejectWithValue("Failed to delete blog.");
    }
  }
);

const blogSlice = createSlice({
  name: "blogs",
  initialState,
  reducers: {
    clearSelectedBlog(state) {
      state.selectedBlog = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all blogs
      .addCase(fetchBlogs.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchBlogs.fulfilled, (state, action: PayloadAction<Blog[]>) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Create blog
      .addCase(createBlog.fulfilled, (state, action: PayloadAction<Blog>) => {
        state.status = "succeeded";
        state.items.unshift(action.payload);
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Blog stats
      .addCase(fetchBlogsStats.fulfilled, (state, action: PayloadAction<Record<string, unknown>>) => {
        state.status = "succeeded";
        state.stats = action.payload;
      })
      
      // Get blog by id
      .addCase(fetchBlogById.fulfilled, (state, action: PayloadAction<Blog>) => {
        state.status = "succeeded";
        state.selectedBlog = action.payload;
      })

      // Update blog
      .addCase(updateBlog.fulfilled, (state, action: PayloadAction<Blog>) => {
        state.status = "succeeded";
        const index = state.items.findIndex(blog => blog._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedBlog?._id === action.payload._id) {
          state.selectedBlog = action.payload;
        }
      })
      .addCase(updateBlog.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Delete blog
      .addCase(deleteBlog.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = "succeeded";
        state.items = state.items.filter((blog) => blog._id !== action.payload);
        if (state.selectedBlog?._id === action.payload) {
          state.selectedBlog = null;
        }
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearSelectedBlog } = blogSlice.actions;
export default blogSlice.reducer;