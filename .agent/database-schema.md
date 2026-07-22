# Database Schema — Free Tier Optimized

**Goal**: Keep under 20 tables, use JSON columns to avoid joins, stay within Neon 0.5GB.

## Tables

### users (existing)
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| name | varchar(255) | |
| email | varchar(255) unique | |
| points | integer default 0 | |
| subscription | varchar | nullable, for future |

### profiles (extend users)
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| user_id | integer FK -> users | |
| avatar_url | text | GitHub URL |
| bio | text | nullable |
| experience_level | varchar | beginner/intermediate/advanced |
| skills | jsonb | ["React", "Node.js", ...] |
| career_goal | varchar | nullable |

### courses
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| title | varchar(255) | |
| description | text | |
| icon | text | GitHub URL |
| difficulty | varchar | beginner/intermediate/advanced |
| category | varchar | frontend/backend/fullstack/devops |
| order_index | integer | for sorting |
| is_published | boolean | default false |

### chapters
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| course_id | integer FK -> courses | |
| title | varchar(255) | |
| content | jsonb | {instructions: "...", initialCode: "...", solution: "..."} |
| order_index | integer | |
| points_reward | integer | stars/points for completing |

### enrollments
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| user_id | integer FK -> users | |
| course_id | integer FK -> courses | |
| progress | jsonb | {completedChapters: [1,3,5], currentChapter: 7} |
| started_at | timestamp | |
| completed_at | timestamp | nullable |

### badges
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| user_id | integer FK -> users | |
| badge_type | varchar | course_complete, streak, etc. |
| earned_at | timestamp | |

### interview_categories
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| name | varchar | "Frontend Engineer" |
| slug | varchar unique | "frontend-engineer" |
| description | text | |
| icon | text | optional |

### interview_questions
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| category_id | integer FK | |
| tags | jsonb | ["angular", "spring-boot", "react"] |
| question | text | |
| answer | text | AI-generated or curated |
| difficulty | varchar | easy/medium/hard |
| is_top50 | boolean | default false |

### problems
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| title | varchar | |
| description | text | |
| difficulty | varchar | easy/medium/hard |
| category | varchar | arrays, strings, dp, trees, etc. |
| initial_code | jsonb | {javascript: "...", python: "...", ...} |
| solution | text | |

### posts (community)
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| user_id | integer FK | |
| title | varchar(255) | |
| content | text | |
| tags | jsonb | ["react", "help"] |
| upvotes | integer default 0 | |
| created_at | timestamp | |
| is_deleted | boolean | soft delete |

### comments
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| post_id | integer FK | |
| user_id | integer FK | |
| content | text | |
| created_at | timestamp | |
| is_deleted | boolean | soft delete |

### user_notes
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| user_id | integer FK | |
| title | varchar(255) | |
| content | text | |
| code_snippets | jsonb | [{language: "js", code: "..."}] |
| created_at | timestamp | |
| updated_at | timestamp | |

### notifications
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| user_id | integer FK | |
| type | varchar | comment_reply, challenge, ai_feedback |
| message | text | |
| is_read | boolean | default false |
| created_at | timestamp | |

---

## Free Tier Notes

- **17 tables** total — under 20 limit
- **JSONB columns** for flexible data (skills, tags, chapter content, progress)
- **Soft deletes** everywhere (is_deleted flag) — no cascade headaches
- **No migration cost** — Drizzle pushes schema changes without downtime
- **Index only**: user_id, email, slug, course_id, post_id — keep it lean
- Row estimates per table stay well under 10k rows for launch → comfortable in 0.5GB
