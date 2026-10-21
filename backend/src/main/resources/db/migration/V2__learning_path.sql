CREATE TABLE courses (
 id UUID PRIMARY KEY, code VARCHAR(100) NOT NULL UNIQUE, title VARCHAR(200) NOT NULL,
 level VARCHAR(20) NOT NULL, description VARCHAR(4000) NOT NULL,
 content_status VARCHAR(20) NOT NULL, content_version INTEGER NOT NULL
);
CREATE TABLE lessons (
 id UUID PRIMARY KEY, course_id UUID NOT NULL REFERENCES courses(id), code VARCHAR(100) NOT NULL UNIQUE,
 title VARCHAR(200) NOT NULL, objective VARCHAR(1000) NOT NULL, position INTEGER NOT NULL,
 kind VARCHAR(20) NOT NULL, content_status VARCHAR(20) NOT NULL, body TEXT NOT NULL, questions TEXT NOT NULL,
 UNIQUE(course_id,position)
);
CREATE TABLE lesson_drafts (
 owner_id UUID NOT NULL REFERENCES accounts(id), lesson_id UUID NOT NULL REFERENCES lessons(id),
 answers TEXT NOT NULL, updated_at TIMESTAMP WITH TIME ZONE NOT NULL, PRIMARY KEY(owner_id,lesson_id)
);
CREATE TABLE lesson_attempts (
 id UUID PRIMARY KEY, owner_id UUID NOT NULL REFERENCES accounts(id), lesson_id UUID NOT NULL REFERENCES lessons(id),
 request_id UUID NOT NULL, fingerprint VARCHAR(64) NOT NULL, answers TEXT NOT NULL,
 score INTEGER, passed BOOLEAN NOT NULL, assisted BOOLEAN NOT NULL, response TEXT NOT NULL,
 created_at TIMESTAMP WITH TIME ZONE NOT NULL, UNIQUE(owner_id,request_id)
);
CREATE INDEX attempts_owner_lesson ON lesson_attempts(owner_id,lesson_id);
CREATE TABLE study_sessions (
 id UUID PRIMARY KEY, owner_id UUID NOT NULL REFERENCES accounts(id), request_id UUID NOT NULL,
 planned_minutes INTEGER NOT NULL, active_seconds INTEGER NOT NULL DEFAULT 0,
 status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', version INTEGER NOT NULL DEFAULT 0,
 created_at TIMESTAMP WITH TIME ZONE NOT NULL, updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
 UNIQUE(owner_id,request_id)
);
CREATE INDEX sessions_owner ON study_sessions(owner_id,status);
