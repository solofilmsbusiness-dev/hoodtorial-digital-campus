import type { DegreePath, CertificateDepartment } from "@/hooks/useDegreeSelection";

// Shared course code sequences for each degree path
export const DEGREE_PATH_COURSES: Record<Exclude<DegreePath, null>, string[]> = {
  associate: ["HU-101", "HU-102", "HU-103", "HU-104", "HU-105", "HU-106"],
  bachelor: [
    "HU-101", "HU-102", "HU-103", "HU-104", "HU-105", "HU-106",
    "HU-201", "HU-202", "HU-203", "HU-204",
    "HU-301", "HU-302", "HU-303", "HU-304",
  ],
  certificate: ["HU-101", "HU-102", "HU-201"],
};

// Department-specific course overrides for certificate paths
export const CERTIFICATE_DEPARTMENT_COURSES: Record<Exclude<CertificateDepartment, null>, string[]> = {
  cinematography: ["HU-101", "HU-102", "HU-201", "HU-301"],
  "post-production": ["HU-103", "HU-104", "HU-202", "HU-302"],
  directing: ["HU-105", "HU-203", "HU-303"],
  production: ["HU-106", "HU-204", "HU-304"],
};

// Path display names
export const DEGREE_PATH_NAMES: Record<Exclude<DegreePath, null>, string> = {
  associate: "Associate of Film",
  bachelor: "Bachelor of Film",
  certificate: "Certificate",
};

// Path total credits
export const DEGREE_PATH_CREDITS: Record<Exclude<DegreePath, null>, number> = {
  associate: 30,
  bachelor: 60,
  certificate: 15,
};

/**
 * Get the ordered course codes for a given degree path and optional department.
 * Certificate paths use department-specific courses when a department is provided.
 */
export function getPathCourses(
  path: Exclude<DegreePath, null>,
  department?: CertificateDepartment
): string[] {
  if (path === "certificate" && department) {
    return CERTIFICATE_DEPARTMENT_COURSES[department];
  }
  return DEGREE_PATH_COURSES[path];
}
