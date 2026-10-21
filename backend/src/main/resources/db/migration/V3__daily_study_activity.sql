CREATE TABLE study_activity (
 session_id UUID NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
 activity_date DATE NOT NULL, active_seconds INTEGER NOT NULL,
 PRIMARY KEY(session_id,activity_date)
);
