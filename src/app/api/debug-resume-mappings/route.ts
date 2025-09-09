import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET() {
  try {
    const MAPPING_FILE = join(process.cwd(), "resume-mappings.json");
    
    try {
      const data = await readFile(MAPPING_FILE, "utf-8");
      const mappings = JSON.parse(data);
      
      return NextResponse.json({
        success: true,
        mappings,
        file_path: MAPPING_FILE,
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: "No mappings file found or file is empty",
        file_path: MAPPING_FILE,
      });
    }

  } catch (error) {
    console.error("Error reading resume mappings:", error);

    return NextResponse.json(
      { success: false, error: "Failed to read resume mappings" },
      { status: 500 }
    );
  }
}
