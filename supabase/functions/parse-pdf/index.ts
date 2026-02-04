import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabase.auth.getUser(token);

    if (authError || !data?.user) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Authenticated user:", data.user.id);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No PDF file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return new Response(
        JSON.stringify({ error: "File must be a PDF" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check file size (20MB max)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ error: "File size exceeds 20MB limit" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Parsing PDF: ${file.name} (${file.size} bytes)`);

    // Read the PDF file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Extract text from PDF using a simple text extraction approach
    // This extracts readable text content from the PDF binary
    const text = extractTextFromPDF(uint8Array);

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Could not extract text from PDF. The PDF may be image-based or protected." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Estimate page count based on form feed characters or text length
    const pageCount = estimatePageCount(text);

    console.log(`Extracted ${text.length} characters from ${pageCount} estimated page(s)`);

    return new Response(
      JSON.stringify({ 
        text: text.substring(0, 100000), // Limit to ~100k chars for AI processing
        pageCount,
        fileName: file.name,
        truncated: text.length > 100000
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Parse PDF error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to parse PDF" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Simple PDF text extraction
// This extracts text streams from PDF content
function extractTextFromPDF(data: Uint8Array): string {
  const decoder = new TextDecoder("latin1");
  const pdfContent = decoder.decode(data);
  
  const textParts: string[] = [];
  
  // Extract text from PDF stream objects
  // Look for text between BT (begin text) and ET (end text) markers
  const btEtPattern = /BT\s*([\s\S]*?)\s*ET/g;
  let match;
  
  while ((match = btEtPattern.exec(pdfContent)) !== null) {
    const textBlock = match[1];
    
    // Extract text from Tj and TJ operators
    const tjPattern = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjPattern.exec(textBlock)) !== null) {
      const extractedText = decodeText(tjMatch[1]);
      if (extractedText.trim()) {
        textParts.push(extractedText);
      }
    }
    
    // Extract text from TJ arrays
    const tjArrayPattern = /\[(.*?)\]\s*TJ/g;
    let tjArrayMatch;
    while ((tjArrayMatch = tjArrayPattern.exec(textBlock)) !== null) {
      const arrayContent = tjArrayMatch[1];
      const stringPattern = /\(([^)]*)\)/g;
      let stringMatch;
      const lineText: string[] = [];
      while ((stringMatch = stringPattern.exec(arrayContent)) !== null) {
        const extractedText = decodeText(stringMatch[1]);
        if (extractedText) {
          lineText.push(extractedText);
        }
      }
      if (lineText.length > 0) {
        textParts.push(lineText.join(""));
      }
    }
  }
  
  // Also try to extract from stream objects directly
  const streamPattern = /stream\s*([\s\S]*?)\s*endstream/g;
  while ((match = streamPattern.exec(pdfContent)) !== null) {
    const streamContent = match[1];
    // Look for readable ASCII text sequences
    const readableText = streamContent.match(/[A-Za-z0-9\s.,!?;:'"()-]{20,}/g);
    if (readableText) {
      textParts.push(...readableText.filter(t => !t.match(/^[\s\d]+$/)));
    }
  }
  
  // Clean up and join the text
  let result = textParts.join(" ")
    .replace(/\s+/g, " ")
    .replace(/[^\x20-\x7E\n]/g, " ")
    .trim();
  
  // If we couldn't extract structured text, try a more aggressive approach
  if (result.length < 100) {
    // Extract any readable strings from the PDF
    const allStrings = pdfContent.match(/[A-Za-z][A-Za-z0-9\s.,!?;:'"()-]{10,}/g);
    if (allStrings) {
      result = allStrings
        .filter(s => !s.match(/^(obj|endobj|stream|endstream|xref|trailer|startxref)/))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    }
  }
  
  return result;
}

// Decode escaped characters in PDF text strings
function decodeText(text: string): string {
  return text
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\")
    .replace(/\\(\d{3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)));
}

// Estimate page count based on content
function estimatePageCount(text: string): number {
  // Count form feed characters
  const formFeeds = (text.match(/\f/g) || []).length;
  if (formFeeds > 0) {
    return formFeeds + 1;
  }
  
  // Estimate based on text length (roughly 3000 chars per page)
  return Math.max(1, Math.ceil(text.length / 3000));
}
