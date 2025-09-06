-- Create resume_feedback_cache table for caching Groq API responses
CREATE TABLE IF NOT EXISTS public.resume_feedback_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    interview_id TEXT NOT NULL,
    call_id TEXT NOT NULL UNIQUE,
    feedback_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint to interview table
ALTER TABLE public.resume_feedback_cache 
ADD CONSTRAINT resume_feedback_cache_interview_id_fkey 
FOREIGN KEY (interview_id) REFERENCES public.interview(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_resume_feedback_cache_call_id ON public.resume_feedback_cache(call_id);
CREATE INDEX IF NOT EXISTS idx_resume_feedback_cache_interview_id ON public.resume_feedback_cache(interview_id);
CREATE INDEX IF NOT EXISTS idx_resume_feedback_cache_created_at ON public.resume_feedback_cache(created_at);

-- Add RLS (Row Level Security) policies if needed
ALTER TABLE public.resume_feedback_cache ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read their own organization's data
CREATE POLICY "Users can read resume feedback cache for their organization" ON public.resume_feedback_cache
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.interview i
            WHERE i.id = resume_feedback_cache.interview_id
            AND i.organization_id = auth.jwt() ->> 'organization_id'
        )
    );

-- Policy to allow authenticated users to insert/update their own organization's data
CREATE POLICY "Users can insert resume feedback cache for their organization" ON public.resume_feedback_cache
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.interview i
            WHERE i.id = resume_feedback_cache.interview_id
            AND i.organization_id = auth.jwt() ->> 'organization_id'
        )
    );

CREATE POLICY "Users can update resume feedback cache for their organization" ON public.resume_feedback_cache
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.interview i
            WHERE i.id = resume_feedback_cache.interview_id
            AND i.organization_id = auth.jwt() ->> 'organization_id'
        )
    );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_resume_feedback_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on row updates
CREATE TRIGGER update_resume_feedback_cache_updated_at_trigger
    BEFORE UPDATE ON public.resume_feedback_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_resume_feedback_cache_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.resume_feedback_cache IS 'Cache table for storing Groq API resume feedback responses to avoid repeated API calls';
COMMENT ON COLUMN public.resume_feedback_cache.id IS 'Primary key UUID';
COMMENT ON COLUMN public.resume_feedback_cache.interview_id IS 'Foreign key to interview table';
COMMENT ON COLUMN public.resume_feedback_cache.call_id IS 'Unique identifier for the call/response';
COMMENT ON COLUMN public.resume_feedback_cache.feedback_data IS 'JSON data containing the complete feedback response from Groq API';
COMMENT ON COLUMN public.resume_feedback_cache.created_at IS 'Timestamp when the cache entry was created';
COMMENT ON COLUMN public.resume_feedback_cache.updated_at IS 'Timestamp when the cache entry was last updated';
