import { NextResponse } from "next/server";
import { parsePdf } from "@/actions/parse-pdf";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const result = await parsePdf(formData);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in parse-pdf route:", error);

    return NextResponse.json(
      { success: false, error: "Failed to parse PDF" },
      { status: 500 }
    );
  }
}
