"use client";

import { configureStore } from "@reduxjs/toolkit";
import jobsReducer from "./features/jobsSlice";
import coursesReducer from "./features/coursesSlice";
import internshipsReducer from "./features/internshipsSlice";
import testimonialsReducer from "./features/testimonialsSlice";
import leadsReducer from "./features/leadSlice";
import jobApplicationsReducer from "./features/job-applicationSlice";
import blogsReducer from "./features/blogSlice";
import blogCategoriesReducer from "./features/blogcategorySlice";
import usersReducer from "./features/userSlice";
import campusCoursesReducer from "./features/campus-courseSlice";
import skillBasedCoursesReducer from "./features/skill-based-courseSlice";
import admissionRequestsReducer from "./features/admission-requestSlice";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

export const store = configureStore({
  reducer: {
    jobs: jobsReducer,
    courses: coursesReducer,
    internships: internshipsReducer,
    testimonials: testimonialsReducer,
    leads: leadsReducer,
    jobApplications: jobApplicationsReducer,
    blogs: blogsReducer,
    blogCategories: blogCategoriesReducer,
    users: usersReducer,
    campusCourses: campusCoursesReducer,
    skillBasedCourses: skillBasedCoursesReducer,
    admissionRequests: admissionRequestsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;



