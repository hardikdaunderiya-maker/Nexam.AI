// Temporary solution to map interview IDs to resume file paths
// This will be replaced once database column is added

interface ResumeMapping {
  [interviewId: string]: string;
}

// In-memory storage (will reset on server restart)
let resumeMappings: ResumeMapping = {};

export const setResumeMapping = (interviewId: string, filePath: string) => {
  resumeMappings[interviewId] = filePath;
};

export const getResumeMapping = (interviewId: string): string | null => {
  return resumeMappings[interviewId] || null;
};

export const removeResumeMapping = (interviewId: string) => {
  delete resumeMappings[interviewId];
};

// For persistence, we could also write to a JSON file
import { writeFile, readFile } from "fs/promises";
import { join } from "path";

const MAPPING_FILE = join(process.cwd(), "resume-mappings.json");

export const saveResumeMappingToFile = async (interviewId: string, filePath: string) => {
  try {
    console.log(`[resumeMapping] Saving mapping: ${interviewId} -> ${filePath}`);
    
    let mappings: ResumeMapping = {};
    try {
      const data = await readFile(MAPPING_FILE, "utf-8");
      mappings = JSON.parse(data);
      console.log(`[resumeMapping] Existing mappings:`, mappings);
    } catch {
      console.log(`[resumeMapping] No existing mappings file, creating new one`);
    }
    
    mappings[interviewId] = filePath;
    await writeFile(MAPPING_FILE, JSON.stringify(mappings, null, 2));
    console.log(`[resumeMapping] Mapping saved successfully`);
    
    // Also update in-memory
    resumeMappings[interviewId] = filePath;
  } catch (error) {
    console.error("Error saving resume mapping:", error);
  }
};

export const getResumeMappingFromFile = async (interviewId: string): Promise<string | null> => {
  try {
    console.log(`[resumeMapping] Looking for mapping for interview ID: ${interviewId}`);
    const data = await readFile(MAPPING_FILE, "utf-8");
    const mappings: ResumeMapping = JSON.parse(data);
    console.log(`[resumeMapping] All available mappings:`, mappings);
    const result = mappings[interviewId] || null;
    console.log(`[resumeMapping] Found mapping result:`, result);
    return result;
  } catch (error) {
    console.log(`[resumeMapping] Error reading mappings:`, error);
    return null;
  }
};
