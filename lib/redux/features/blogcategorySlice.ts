import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export type BlogCategory = {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  blogCount?: number;
  createdAt: string;
  updatedAt: string;
};

type BlogCategoriesState = {
  items: BlogCategory[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
  query: string;
  selectedCategory: BlogCategory | null;
};

const initialState: BlogCategoriesState = {
  items: [],
  status: "idle",
  error: undefined,
  query: "",
  selectedCategory: null,
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

const normalizeBlogCategory = (raw: Record<string, unknown>): BlogCategory => ({
  ...raw,
  _id: (raw._id as string) ?? (raw.id as string) ?? "",
  isActive: (raw.isActive as boolean) ?? true,
  blogCount: (raw.blogCount as number) ?? 0,
  color: (raw.color as string) ?? "#3b82f6",
  icon: (raw.icon as string) ?? "",
  description: (raw.description as string) ?? "",
} as BlogCategory);

// GET /admin/blog-categories
export const fetchBlogCategories = createAsyncThunk(
  "blogCategories/fetchBlogCategories",
  async (params: { q?: string } | undefined, { rejectWithValue }) => {
    try {
      const response = await axios.get<ApiResponse<{ docs: BlogCategory[] }>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/blog-categories`,
        { params }
      );
      const data = extractData(response.data);
      return (data?.docs ?? []).map(normalizeBlogCategory);
    } catch (error: unknown) {
      console.error("Failed to fetch blog categories:", error);
      return rejectWithValue("Failed to fetch blog categories");
    }
  }
);

// POST /admin/blog-categories
export const createBlogCategory = createAsyncThunk(
  "blogCategories/createBlogCategory",
  async (
    data: Omit<BlogCategory, "_id" | "createdAt" | "updatedAt" | "blogCount">,
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post<ApiResponse<BlogCategory>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/blog-categories`,
        data
      );
      return normalizeBlogCategory(extractData(response.data));
    } catch (error: unknown) {
      console.error("Failed to create blog category:", error);
      return rejectWithValue("Failed to create blog category");
    }
  }
);

// GET /admin/blog-categories/:id
export const fetchBlogCategoryById = createAsyncThunk(
  "blogCategories/fetchBlogCategoryById",
  async (categoryId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get<ApiResponse<BlogCategory>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/blog-categories/${categoryId}`
      );
      return normalizeBlogCategory(extractData(response.data));
    } catch (error: unknown) {
      console.error("Failed to fetch blog category by id:", error);
      return rejectWithValue("Failed to fetch blog category by id");
    }
  }
);

// PATCH /admin/blog-categories/:id
export const updateBlogCategory = createAsyncThunk(
  "blogCategories/updateBlogCategory",
  async (
    { categoryId, data }: { categoryId: string; data: Partial<BlogCategory> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch<ApiResponse<BlogCategory>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/blog-categories/${categoryId}`,
        data
      );
      return normalizeBlogCategory(extractData(response.data));
    } catch (error: unknown) {
      console.error("Failed to update blog category:", error);
      return rejectWithValue("Failed to update blog category");
    }
  }
);

// DELETE /admin/blog-categories/:id
export const deleteBlogCategory = createAsyncThunk(
  "blogCategories/deleteBlogCategory",
  async (categoryId: string, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/blog-categories/${categoryId}`
      );
      return categoryId;
    } catch (error: unknown) {
      console.error("Failed to delete blog category:", error);
      return rejectWithValue("Failed to delete blog category");
    }
  }
);

const blogCategorySlice = createSlice({
  name: "blogCategories",
  initialState,
  reducers: {
    setBlogCategoryQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    clearSelectedCategory(state) {
      state.selectedCategory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all blog categories
      .addCase(fetchBlogCategories.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchBlogCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchBlogCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to load blog categories";
      })

      // Create blog category
      .addCase(createBlogCategory.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(createBlogCategory.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items.unshift(action.payload);
      })
      .addCase(createBlogCategory.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to create blog category";
      })

      // Get blog category by id
      .addCase(fetchBlogCategoryById.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
        state.selectedCategory = null;
      })
      .addCase(fetchBlogCategoryById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedCategory = action.payload;
      })
      .addCase(fetchBlogCategoryById.rejected, (state, action) => {
        state.status = "failed";
        state.selectedCategory = null;
        state.error = (action.payload as string) || "Failed to fetch blog category";
      })

      // Update blog category
      .addCase(updateBlogCategory.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(updateBlogCategory.fulfilled, (state, action) => {
        state.status = "succeeded";
        const idx = state.items.findIndex(
          (category) => category._id === action.payload._id
        );
        if (idx !== -1) {
          state.items[idx] = { ...state.items[idx], ...action.payload };
        }
        if (state.selectedCategory?._id === action.payload._id) {
          state.selectedCategory = {
            ...state.selectedCategory,
            ...action.payload,
          };
        }
      })
      .addCase(updateBlogCategory.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to update blog category";
      })

      // Delete blog category
      .addCase(deleteBlogCategory.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(deleteBlogCategory.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = state.items.filter((category) => category._id !== action.payload);
        if (state.selectedCategory?._id === action.payload) {
          state.selectedCategory = null;
        }
      })
      .addCase(deleteBlogCategory.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to delete blog category";
      });
  },
});

export const { setBlogCategoryQuery, clearSelectedCategory } =
  blogCategorySlice.actions;
export default blogCategorySlice.reducer;
