import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { parsePdf } from "@/actions/parse-pdf";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File size should be less than 10MB" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'resumes');
    const filePath = join(uploadDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Parse PDF to get text content
    const parseResult = await parsePdf(formData);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Failed to parse PDF content" },
        { status: 400 }
      );
    }

    // Return both file path and parsed text
    const relativePath = `/uploads/resumes/${filename}`;
    
    return NextResponse.json({
      success: true,
      filePath: relativePath,
      fileName: file.name,
      text: parseResult.text,
    });

  } catch (error) {
    console.error("Error uploading resume:", error);

    return NextResponse.json(
      { success: false, error: "Failed to upload resume" },
      { status: 500 }
    );
  }
}
