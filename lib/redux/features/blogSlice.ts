import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export type Blog = {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: string;
  category: string;
  tags: string | string[];
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  readTime: string;
  views: number;
  likes: number;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
};

type BlogsState = {
  items: Blog[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
  query: string;
  category: string;
  statusFilter: string;
  stats: Record<string, unknown> | null;
  selectedBlog: Blog | null;
};

const initialState: BlogsState = {
  items: [],
  status: "idle",
  error: undefined,
  query: "",
  category: "",
  statusFilter: "",
  stats: null,
  selectedBlog: null,
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

const normalizeBlog = (raw: Record<string, unknown>): Blog => ({
  ...raw,
  _id: (raw._id as string) ?? (raw.id as string) ?? "",
  tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : typeof raw.tags === "string" ? raw.tags.split(",").map((t: string) => t.trim()) : [],
  views: (raw.views as number) ?? 0,
  likes: (raw.likes as number) ?? 0,
  readTime: (raw.readTime as string) ?? "5 min",
  publishedAt: (raw.publishedAt as string) ?? null,
  metaTitle: (raw.metaTitle as string) ?? (raw.title as string) ?? "",
  metaDescription: (raw.metaDescription as string) ?? (raw.excerpt as string) ?? "",
  metaKeywords: (raw.metaKeywords as string) ?? "",
  canonicalUrl: (raw.canonicalUrl as string) ?? "",
  ogTitle: (raw.ogTitle as string) ?? (raw.title as string) ?? "",
  ogDescription: (raw.ogDescription as string) ?? (raw.excerpt as string) ?? "",
  ogImage: (raw.ogImage as string) ?? (raw.featuredImage as string) ?? "",
} as Blog);

// GET /admin/blogs
export const fetchBlogs = createAsyncThunk(
  "blogs/fetchBlogs",
  async (
    params: { q?: string; category?: string; status?: string } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get<ApiResponse<{ docs: Blog[] }>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/blogs`,
        { params }
      );
      const data = extractData(response.data);
      return (data?.docs ?? []).map(normalizeBlog);
    } catch (error: unknown) {
      console.error("Failed to fetch blogs:", error);
      return rejectWithValue("Failed to fetch blogs");
    }
  }
);

// POST /admin/blogs
export const createBlog = createAsyncThunk(
  "blogs/createBlog",
  async (
    data: Omit<Blog, "_id" | "createdAt" | "updatedAt" | "views" | "likes">,
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post<ApiResponse<Blog>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/blogs`,
        data
      );
      return normalizeBlog(extractData(response.data));
    } catch (error: unknown) {
      console.error("Failed to create blog:", error);
      return rejectWithValue("Failed to create blog");
    }
  }
);

// GET /admin/blogs/stats
export const fetchBlogsStats = createAsyncThunk(
  "blogs/fetchBlogsStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<ApiResponse<Record<string, unknown>>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/blogs/stats`
      );
      return extractData(response.data);
    } catch (error: unknown) {
      console.error("Failed to fetch blog stats:", error);
      return rejectWithValue("Failed to fetch blog stats");
    }
  }
);

// GET /admin/blogs/:id
export const fetchBlogById = createAsyncThunk(
  "blogs/fetchBlogById",
  async (blogId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get<ApiResponse<Blog>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/blogs/${blogId}`
      );
      return normalizeBlog(extractData(response.data));
    } catch (error: unknown) {
      console.error("Failed to fetch blog by id:", error);
      return rejectWithValue("Failed to fetch blog by id");
    }
  }
);

// PATCH /admin/blogs/:id
export const updateBlog = createAsyncThunk(
  "blogs/updateBlog",
  async (
    { blogId, data }: { blogId: string; data: Partial<Blog> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch<ApiResponse<Blog>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/blogs/${blogId}`,
        data
      );
      return normalizeBlog(extractData(response.data));
    } catch (error: unknown) {
      console.error("Failed to update blog:", error);
      return rejectWithValue("Failed to update blog");
    }
  }
);

// DELETE /admin/blogs/:id
export const deleteBlog = createAsyncThunk(
  "blogs/deleteBlog",
  async (blogId: string, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/blogs/${blogId}`
      );
      return blogId;
    } catch (error: unknown) {
      console.error("Failed to delete blog:", error);
      return rejectWithValue("Failed to delete blog");
    }
  }
);

const blogSlice = createSlice({
  name: "blogs",
  initialState,
  reducers: {
    setBlogQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    setBlogCategory(state, action: PayloadAction<string>) {
      state.category = action.payload;
    },
    setBlogStatusFilter(state, action: PayloadAction<string>) {
      state.statusFilter = action.payload;
    },
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
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to load blogs";
      })

      // Create blog
      .addCase(createBlog.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items.unshift(action.payload);
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to create blog";
      })

      // Blog stats
      .addCase(fetchBlogsStats.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchBlogsStats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.stats = action.payload;
      })
      .addCase(fetchBlogsStats.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to load blog stats";
      })

      // Get blog by id
      .addCase(fetchBlogById.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
        state.selectedBlog = null;
      })
      .addCase(fetchBlogById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedBlog = action.payload;
      })
      .addCase(fetchBlogById.rejected, (state, action) => {
        state.status = "failed";
        state.selectedBlog = null;
        state.error = (action.payload as string) || "Failed to fetch blog";
      })

      // Update blog
      .addCase(updateBlog.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.status = "succeeded";
        const idx = state.items.findIndex(
          (blog) => blog._id === action.payload._id
        );
        if (idx !== -1) {
          state.items[idx] = { ...state.items[idx], ...action.payload };
        }
        if (state.selectedBlog?._id === action.payload._id) {
          state.selectedBlog = {
            ...state.selectedBlog,
            ...action.payload,
          };
        }
      })
      .addCase(updateBlog.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to update blog";
      })

      // Delete blog
      .addCase(deleteBlog.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = state.items.filter((blog) => blog._id !== action.payload);
        if (state.selectedBlog?._id === action.payload) {
          state.selectedBlog = null;
        }
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to delete blog";
      });
  },
});

export const {
  setBlogQuery,
  setBlogCategory,
  setBlogStatusFilter,
  clearSelectedBlog,
} = blogSlice.actions;
export default blogSlice.reducer;
