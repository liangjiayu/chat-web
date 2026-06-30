PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS conversations (
	id TEXT PRIMARY KEY,
	user_id TEXT NOT NULL,
	title TEXT NOT NULL,
	model TEXT NOT NULL,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL,
	deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_updated
ON conversations (user_id, deleted_at, updated_at DESC);

CREATE TABLE IF NOT EXISTS messages (
	id TEXT PRIMARY KEY,
	conversation_id TEXT NOT NULL,
	role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant')),
	content TEXT NOT NULL,
	model TEXT,
	status TEXT NOT NULL DEFAULT 'done',
	token_input INTEGER,
	token_output INTEGER,
	created_at TEXT NOT NULL,
	FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
ON messages (conversation_id, created_at ASC);
