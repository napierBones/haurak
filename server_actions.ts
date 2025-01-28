"use server";
import fs from "fs";
import path from "path";
import { Courses } from "./types";
import { revalidatePath } from "next/cache";

const filePath = path.join(process.cwd(), "data", "courses.json");

// Helper to read courses
const readCourses = (): Courses[] => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([])); // Initialize the file with an empty array
    }
    const data = fs.readFileSync(filePath, "utf-8");
    return data.trim() === "" ? [] : JSON.parse(data) as Courses[];
  } catch (error) {
    console.error("Error reading courses.json:", error);
    return [];
  }
};

// Helper to write courses
const writeCourses = (data: Courses[]) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing to courses.json:", error);
  }
};

// Get a course by ID
export async function getCourseById(id: string ) {
  try {

    const courses = readCourses();
    const course = courses.find((course: Courses) => course.id === id);
    if (!course) {
      return { message: "Course not found", course: null };
    }
    return { message: "Course fetched successfully", course };
  } catch (error) {
    console.error("Error fetching course by ID:", error);
    return { error, message: "Could not fetch course", course: null };
  }
}

// Add a new course
export async function addCourse(data: Courses) {
  try {
    const courses = readCourses();
    courses.push(data);
    writeCourses(courses);
    return { message: "Course successfully added" };
  } catch (error) {
    console.error("Error adding course:", error);
    return { error, message: "Could not add course" };
  }
}

// Update an existing course
export async function updateCourse(id: string | null, updatedData: Partial<Courses>) {
  try {
    if (!id) {
      return { message: "Course ID is required" };
    }
    const courses = readCourses();
    const index = courses.findIndex((course: Courses) => course.id === id);
    if (index === -1) {
      return { message: "Course not found" };
    }
    courses[index] = { ...courses[index], ...updatedData };
    writeCourses(courses);
    return { message: "Course updated successfully" };
  } catch (error) {
    console.error("Error updating course:", error);
    return { error, message: "Could not update course" };
  }
}

// Delete a course
export async function deleteCourse(id: string) {
  try {
    const courses = readCourses();
    const filteredCourses = courses.filter((course: Courses) => course.id !== id);
    if (courses.length === filteredCourses.length) {
      return { message: "Course not found" };
    }
    writeCourses(filteredCourses);
    return { message: "Course deleted successfully" };
  } catch (error) {
    console.error("Error deleting course:", error);
    return { error, message: "Could not delete course" };
  }
}

// Fetch all courses
export async function getAllCourses() {
  try {
    const courses = readCourses();
    return { courses, message: "Courses fetched successfully" };
  } catch (error) {
    console.error("Error fetching courses:", error);
    return { error, courses: [], message: "Could not fetch courses" };
  }
}

export async function getAllQueryCourses(searchQuery?: string) {
  const {courses}=await getAllCourses() 
  if (searchQuery) {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return {
      courses: courses.filter((course) =>
        course.name.toLowerCase().includes(lowerCaseQuery) ||
        course.category.toLowerCase().includes(lowerCaseQuery) ||
        course.trainer.toLowerCase().includes(lowerCaseQuery)
      ),
    };
  }

  return { courses, message: "Courses fetched successfully" };
}


export async function revalidatePage (path:string) {
  revalidatePath(path)
} 



export async function modifySearchParams(currentUrl: string, action: string, key: string, value?: string) {
  const url = new URL(currentUrl);
  const searchParams = url.searchParams;

  // Perform the action
  switch (action) {
    case "add":
    case "update":
      searchParams.set(key, value || "");
      break;
    case "delete":
      searchParams.delete(key);
      break;
    default:
      throw new Error(`Invalid action: ${action}`);
  }
  const updatedUrl = `${url.origin}${url.pathname}?${searchParams.toString()}`;


  return { redirect: updatedUrl };
}


import { headers } from "next/headers"



export async function getFullUrl(searchParams: URLSearchParams): Promise<string> {
  const headersList = await headers()
  const host = headersList.get("host") || ""
  const protocol = headersList.get("x-forwarded-proto") || "http"

  // Get the path from x-invoke-path header
  const path = headersList.get("x-invoke-path") || ""

  // Construct the full URL
  const fullUrl = `${protocol}://${host}${path}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`

  return fullUrl
}
