CREATE TABLE b1_exam_drafts (
    owner_id UUID PRIMARY KEY REFERENCES accounts(id),
    responses TEXT NOT NULL,
    version INTEGER NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);
