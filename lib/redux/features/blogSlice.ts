import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import apiClient from "@/lib/apiClient";

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: string;
  category: string;
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

export type BlogCreatePayload = Omit<Blog, '_id' | 'createdAt' | 'updatedAt' | 'views' | 'likes'>;
export type BlogUpdatePayload = Partial<BlogCreatePayload>;

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

interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

const extractData = <T>(response: { data: ApiResponse<T> }): T => response.data.data;

export const fetchBlogs = createAsyncThunk<
  Blog[],
  { q?: string; category?: string; status?: string } | undefined,
  { rejectValue: string }
>(
  "blogs/fetchBlogs",
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<ApiResponse<{ docs: Blog[] }>>(
        `/admin/blogs`,
        { params }
      );
      return extractData(response)?.docs ?? [];
    } catch {
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
      const response = await apiClient.post<ApiResponse<Blog>>(
        `/admin/blogs`,
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
      const response = await apiClient.get<ApiResponse<Record<string, unknown>>>(
        `/admin/blogs/stats`
      );
      return extractData(response);
    } catch {
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
      const response = await apiClient.get<ApiResponse<Blog>>(
        `/admin/blogs/${blogId}`
      );
      return extractData(response);
    } catch {
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
      const response = await apiClient.patch<ApiResponse<Blog>>(
        `/admin/blogs/${blogId}`,
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
  string,
  string,
  { rejectValue: string }
>(
  "blogs/deleteBlog",
  async (blogId, { rejectWithValue }) => {
    try {
      await apiClient.delete(
        `/admin/blogs/${blogId}`
      );
      return blogId;
    } catch {
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
      .addCase(createBlog.fulfilled, (state, action: PayloadAction<Blog>) => {
        state.status = "succeeded";
        state.items.unshift(action.payload);
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchBlogsStats.fulfilled, (state, action: PayloadAction<Record<string, unknown>>) => {
        state.status = "succeeded";
        state.stats = action.payload;
      })
      .addCase(fetchBlogById.fulfilled, (state, action: PayloadAction<Blog>) => {
        state.status = "succeeded";
        state.selectedBlog = action.payload;
      })
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