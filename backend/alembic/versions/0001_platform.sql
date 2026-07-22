-- Standalone PostgreSQL schema for the Sosedi platform.
-- Authorization is enforced by the application. This schema intentionally has
-- no Supabase auth schema, JWT helpers, or row-level-security policies.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE user_role AS ENUM ('tenant', 'landlord', 'admin', 'moderator', 'partner');
CREATE TYPE property_status AS ENUM (
  'draft',
  'pending_review',
  'published',
  'paused',
  'rejected',
  'archived'
);
CREATE TYPE group_status AS ENUM (
  'forming',
  'ready',
  'application_sent',
  'under_review',
  'needs_response',
  'approved',
  'rejected',
  'settled',
  'archived'
);
CREATE TYPE application_status AS ENUM (
  'draft',
  'submitted',
  'reviewing',
  'needs_response',
  'approved',
  'rejected',
  'contract_agreed',
  'settled',
  'withdrawn',
  'cancelled'
);
CREATE TYPE conversation_type AS ENUM ('direct', 'group', 'owner_group', 'ai_assistant');
CREATE TYPE message_type AS ENUM (
  'text',
  'property_card',
  'system_notice',
  'attachment',
  'viewing_request',
  'poll',
  'expense_split',
  'voice',
  'ai_bot'
);

CREATE TABLE roles (
  code user_role PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT
);

INSERT INTO roles (code, title, description) VALUES
  ('tenant', 'Арендатор', 'Ищет соседей и жильё'),
  ('landlord', 'Собственник', 'Публикует жильё и рассматривает заявки'),
  ('admin', 'Администратор', 'Управляет платформой'),
  ('moderator', 'Модератор', 'Разбирает жалобы и проверки'),
  ('partner', 'Партнёр', 'Управляет партнёрскими источниками');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email_verified_at TIMESTAMPTZ,
  password_changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  disabled_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_email_length CHECK (length(email::TEXT) BETWEEN 3 AND 254),
  CONSTRAINT users_password_hash_present CHECK (length(password_hash) >= 32)
);

CREATE TABLE user_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL REFERENCES roles(code),
  granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, role)
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL UNIQUE,
  user_agent TEXT,
  ip_hash CHAR(64),
  idle_ttl INTERVAL NOT NULL DEFAULT INTERVAL '7 days',
  expires_at TIMESTAMPTZ NOT NULL,
  idle_expires_at TIMESTAMPTZ NOT NULL,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rotated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT sessions_token_hash_format CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT sessions_ip_hash_format CHECK (ip_hash IS NULL OR ip_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT sessions_expiry_order CHECK (idle_expires_at <= expires_at),
  CONSTRAINT sessions_positive_idle_ttl CHECK (idle_ttl > INTERVAL '0 seconds')
);

CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT password_reset_token_hash_format CHECK (token_hash ~ '^[0-9a-f]{64}$')
);

CREATE TABLE email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT email_verification_token_hash_format CHECK (token_hash ~ '^[0-9a-f]{64}$')
);

CREATE TABLE rate_limit_buckets (
  scope TEXT NOT NULL,
  key_hash CHAR(64) NOT NULL,
  window_started_at TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (scope, key_hash, window_started_at),
  CONSTRAINT rate_limit_scope_present CHECK (length(scope) BETWEEN 1 AND 100),
  CONSTRAINT rate_limit_key_hash_format CHECK (key_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT rate_limit_count_positive CHECK (request_count > 0)
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_path TEXT,
  phone TEXT,
  phone_verified_at TIMESTAMPTZ,
  bio TEXT,
  age SMALLINT,
  job_title TEXT,
  city TEXT NOT NULL DEFAULT 'Краснодар',
  budget_min INTEGER,
  budget_max INTEGER,
  move_in_date DATE,
  lease_months SMALLINT,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT profiles_display_name_length CHECK (length(display_name) BETWEEN 2 AND 80),
  CONSTRAINT profiles_age_range CHECK (age IS NULL OR age BETWEEN 18 AND 120),
  CONSTRAINT profiles_budget_min_nonnegative CHECK (budget_min IS NULL OR budget_min >= 0),
  CONSTRAINT profiles_budget_max_nonnegative CHECK (budget_max IS NULL OR budget_max >= 0),
  CONSTRAINT profiles_budget_order CHECK (
    budget_min IS NULL OR budget_max IS NULL OR budget_min <= budget_max
  ),
  CONSTRAINT profiles_lease_months_range CHECK (
    lease_months IS NULL OR lease_months BETWEEN 1 AND 120
  )
);

CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT NOT NULL DEFAULT 'ru',
  timezone TEXT NOT NULL DEFAULT 'Europe/Moscow',
  reduced_motion BOOLEAN NOT NULL DEFAULT FALSE,
  high_contrast BOOLEAN NOT NULL DEFAULT FALSE,
  message_privacy TEXT NOT NULL DEFAULT 'everyone'
    CHECK (message_privacy IN ('everyone', 'verified', 'none')),
  profile_visibility TEXT NOT NULL DEFAULT 'public'
    CHECK (profile_visibility IN ('public', 'verified', 'hidden')),
  ai_consent BOOLEAN NOT NULL DEFAULT FALSE,
  ai_consent_at TIMESTAMPTZ,
  ai_consent_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL,
  policy_version TEXT NOT NULL,
  granted BOOLEAN NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  CONSTRAINT user_consents_purpose_length CHECK (length(purpose) BETWEEN 1 AND 100),
  CONSTRAINT user_consents_metadata_object CHECK (jsonb_typeof(metadata) = 'object')
);

CREATE TABLE profile_preferences (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  districts TEXT[] NOT NULL DEFAULT '{}',
  smoking TEXT NOT NULL DEFAULT 'no'
    CHECK (smoking IN ('no', 'sometimes', 'yes', 'indifferent')),
  pets TEXT NOT NULL DEFAULT 'indifferent'
    CHECK (pets IN ('no', 'cat', 'dog', 'other', 'indifferent')),
  sleep_schedule TEXT NOT NULL DEFAULT 'flexible'
    CHECK (sleep_schedule IN ('early', 'late', 'flexible')),
  noise_tolerance SMALLINT,
  guests_frequency TEXT NOT NULL DEFAULT 'sometimes'
    CHECK (guests_frequency IN ('never', 'rarely', 'sometimes', 'often')),
  remote_work TEXT NOT NULL DEFAULT 'sometimes'
    CHECK (remote_work IN ('never', 'sometimes', 'often')),
  cleanliness SMALLINT,
  sociability SMALLINT,
  private_space SMALLINT,
  cooking SMALLINT,
  shared_products BOOLEAN NOT NULL DEFAULT TRUE,
  temperature SMALLINT,
  common_zones SMALLINT,
  leisure TEXT[] NOT NULL DEFAULT '{}',
  pet_tolerance TEXT NOT NULL DEFAULT 'any'
    CHECK (pet_tolerance IN ('no', 'cat', 'dog', 'any')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT profile_preferences_noise_range CHECK (
    noise_tolerance IS NULL OR noise_tolerance BETWEEN 1 AND 5
  ),
  CONSTRAINT profile_preferences_cleanliness_range CHECK (
    cleanliness IS NULL OR cleanliness BETWEEN 1 AND 5
  ),
  CONSTRAINT profile_preferences_sociability_range CHECK (
    sociability IS NULL OR sociability BETWEEN 1 AND 5
  ),
  CONSTRAINT profile_preferences_private_space_range CHECK (
    private_space IS NULL OR private_space BETWEEN 1 AND 5
  ),
  CONSTRAINT profile_preferences_cooking_range CHECK (
    cooking IS NULL OR cooking BETWEEN 1 AND 5
  ),
  CONSTRAINT profile_preferences_temperature_range CHECK (
    temperature IS NULL OR temperature BETWEEN 1 AND 5
  ),
  CONSTRAINT profile_preferences_common_zones_range CHECK (
    common_zones IS NULL OR common_zones BETWEEN 1 AND 5
  )
);

CREATE TABLE lifestyle_answers (
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_key TEXT NOT NULL,
  answer JSONB NOT NULL,
  importance SMALLINT NOT NULL DEFAULT 3,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (profile_id, question_key),
  CONSTRAINT lifestyle_question_key_length CHECK (length(question_key) BETWEEN 1 AND 100),
  CONSTRAINT lifestyle_importance_range CHECK (importance BETWEEN 1 AND 5)
);

CREATE TABLE compatibility_weights (
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  criterion TEXT NOT NULL,
  weight NUMERIC(5,4) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (profile_id, criterion),
  CONSTRAINT compatibility_weight_range CHECK (weight BETWEEN 0 AND 1)
);

CREATE TABLE blocked_users (
  blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id),
  CONSTRAINT blocked_users_not_self CHECK (blocker_id <> blocked_id)
);

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug CITEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL DEFAULT 'partner'
    CHECK (kind IN ('landlord', 'agency', 'property_manager', 'partner', 'platform')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT organizations_name_length CHECK (length(name) BETWEEN 2 AND 160),
  CONSTRAINT organizations_slug_format CHECK (slug::TEXT ~ '^[a-z0-9][a-z0-9-]{1,62}$')
);

CREATE TABLE organization_members (
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (organization_id, user_id)
);

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT NOT NULL DEFAULT 'Краснодар',
  district TEXT NOT NULL,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  monthly_rent INTEGER NOT NULL,
  deposit INTEGER NOT NULL DEFAULT 0,
  rooms SMALLINT NOT NULL DEFAULT 1,
  area NUMERIC(8,2) NOT NULL,
  floor SMALLINT,
  total_floors SMALLINT,
  available_from DATE,
  lease_months_min SMALLINT NOT NULL DEFAULT 6,
  pets_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  smoking_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  furnished BOOLEAN NOT NULL DEFAULT FALSE,
  status property_status NOT NULL DEFAULT 'draft',
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  source TEXT NOT NULL DEFAULT 'user',
  source_url TEXT,
  developer_name TEXT,
  complex_name TEXT,
  completion_date DATE,
  finishing_type TEXT,
  external_id TEXT,
  published_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT properties_owner_present CHECK (owner_id IS NOT NULL OR organization_id IS NOT NULL),
  CONSTRAINT properties_title_length CHECK (length(title) BETWEEN 4 AND 160),
  CONSTRAINT properties_rent_positive CHECK (monthly_rent > 0),
  CONSTRAINT properties_deposit_nonnegative CHECK (deposit >= 0),
  CONSTRAINT properties_rooms_range CHECK (rooms BETWEEN 1 AND 100),
  CONSTRAINT properties_area_positive CHECK (area > 0),
  CONSTRAINT properties_floor_valid CHECK (
    floor IS NULL OR total_floors IS NULL OR floor <= total_floors
  ),
  CONSTRAINT properties_lease_months_range CHECK (lease_months_min BETWEEN 1 AND 120),
  CONSTRAINT properties_latitude_range CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
  CONSTRAINT properties_longitude_range CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),
  UNIQUE (source, external_id)
);

CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL UNIQUE,
  alt_text TEXT,
  is_main BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT property_images_storage_path_length CHECK (length(storage_path) BETWEEN 1 AND 1024),
  CONSTRAINT property_images_dimensions_positive CHECK (
    (width IS NULL OR width > 0) AND (height IS NULL OR height > 0)
  )
);

CREATE TABLE amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code CITEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general'
);

CREATE TABLE property_amenities (
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE RESTRICT,
  details TEXT,
  PRIMARY KEY (property_id, amenity_id)
);

CREATE TABLE property_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT property_rules_type_length CHECK (length(rule_type) BETWEEN 1 AND 80),
  CONSTRAINT property_rules_title_length CHECK (length(title) BETWEEN 1 AND 200)
);

CREATE TABLE favorites (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_type TEXT NOT NULL CHECK (subject_type IN ('profile', 'property')),
  subject_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, subject_type, subject_id)
);

CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  target_budget INTEGER,
  move_in_date DATE,
  lease_months SMALLINT,
  status group_status NOT NULL DEFAULT 'forming',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT groups_name_length CHECK (length(name) BETWEEN 2 AND 100),
  CONSTRAINT groups_target_budget_positive CHECK (target_budget IS NULL OR target_budget > 0),
  CONSTRAINT groups_lease_months_range CHECK (
    lease_months IS NULL OR lease_months BETWEEN 1 AND 120
  )
);

CREATE TABLE group_members (
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('invited', 'active', 'declined', 'left', 'removed')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_id, profile_id)
);

CREATE TABLE group_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invitee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email CITEXT,
  token_hash CHAR(64) NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT group_invitations_recipient_present CHECK (invitee_id IS NOT NULL OR email IS NOT NULL),
  CONSTRAINT group_invitations_token_hash_format CHECK (token_hash ~ '^[0-9a-f]{64}$')
);

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE RESTRICT,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status application_status NOT NULL DEFAULT 'submitted',
  total_budget INTEGER NOT NULL,
  tenant_message TEXT,
  owner_note TEXT,
  move_in_date DATE,
  lease_months SMALLINT,
  viewing_date DATE,
  viewing_time_slot TEXT,
  submitted_at TIMESTAMPTZ,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT applications_budget_positive CHECK (total_budget > 0),
  CONSTRAINT applications_lease_months_range CHECK (
    lease_months IS NULL OR lease_months BETWEEN 1 AND 120
  )
);

CREATE TABLE application_members (
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  rent_share INTEGER NOT NULL DEFAULT 0,
  confirmed_at TIMESTAMPTZ,
  PRIMARY KEY (application_id, profile_id),
  CONSTRAINT application_members_rent_share_nonnegative CHECK (rent_share >= 0)
);

CREATE TABLE application_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  from_status application_status,
  to_status application_status NOT NULL,
  note TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT application_events_metadata_object CHECK (jsonb_typeof(metadata) = 'object')
);

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type conversation_type NOT NULL,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE conversation_members (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ,
  last_read_message_id UUID,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  archived_at TIMESTAMPTZ,
  muted_until TIMESTAMPTZ,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (conversation_id, profile_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  body TEXT NOT NULL DEFAULT '',
  system_type message_type NOT NULL DEFAULT 'text',
  reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  extra_data JSONB NOT NULL DEFAULT '{}'::JSONB,
  client_generated_id UUID UNIQUE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  CONSTRAINT messages_body_length CHECK (length(body) <= 20000),
  CONSTRAINT messages_extra_data_object CHECK (jsonb_typeof(extra_data) = 'object')
);

ALTER TABLE conversation_members
  ADD CONSTRAINT conversation_members_last_read_message_fk
  FOREIGN KEY (last_read_message_id) REFERENCES messages(id) ON DELETE SET NULL;

CREATE TABLE message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  storage_path TEXT NOT NULL UNIQUE,
  file_name TEXT,
  mime_type TEXT NOT NULL,
  byte_size BIGINT NOT NULL,
  checksum_sha256 CHAR(44),
  status TEXT NOT NULL DEFAULT 'ready'
    CHECK (status IN ('pending', 'ready', 'quarantined', 'deleted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT message_attachments_storage_path_length CHECK (length(storage_path) BETWEEN 1 AND 1024),
  CONSTRAINT message_attachments_mime_length CHECK (length(mime_type) BETWEEN 1 AND 255),
  CONSTRAINT message_attachments_size_range CHECK (byte_size BETWEEN 1 AND 52428800),
  CONSTRAINT message_attachments_checksum_format CHECK (
    checksum_sha256 IS NULL OR checksum_sha256 ~ '^[A-Za-z0-9+/]{43}=$'
  )
);

CREATE TABLE message_reactions (
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (message_id, profile_id, emoji),
  CONSTRAINT message_reactions_emoji_length CHECK (length(emoji) BETWEEN 1 AND 32)
);

CREATE TABLE message_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  edited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  previous_body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE chores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'done', 'cancelled')),
  is_done BOOLEAN NOT NULL DEFAULT FALSE,
  due_date DATE,
  recurrence_rule TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chores_title_length CHECK (length(title) BETWEEN 1 AND 200),
  CONSTRAINT chores_completion_consistent CHECK (
    (is_done = FALSE AND completed_at IS NULL) OR (is_done = TRUE AND completed_at IS NOT NULL)
  )
);

CREATE TABLE chore_assignments (
  chore_id UUID NOT NULL REFERENCES chores(id) ON DELETE CASCADE,
  assignee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (chore_id, assignee_id)
);

CREATE TABLE chore_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chore_id UUID NOT NULL REFERENCES chores(id) ON DELETE CASCADE,
  completed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  note TEXT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  total_amount INTEGER NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'RUB',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  incurred_at DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'settled', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT expenses_title_length CHECK (length(title) BETWEEN 1 AND 200),
  CONSTRAINT expenses_total_positive CHECK (total_amount > 0),
  CONSTRAINT expenses_currency_format CHECK (currency ~ '^[A-Z]{3}$')
);

CREATE TABLE expense_members (
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  amount INTEGER NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  PRIMARY KEY (expense_id, profile_id),
  CONSTRAINT expense_members_amount_nonnegative CHECK (amount >= 0),
  CONSTRAINT expense_members_paid_consistent CHECK (
    (is_paid = FALSE AND paid_at IS NULL) OR is_paid = TRUE
  )
);

CREATE TABLE settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  payer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  payee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  amount INTEGER NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'RUB',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT settlements_different_parties CHECK (payer_id <> payee_id),
  CONSTRAINT settlements_amount_positive CHECK (amount > 0)
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  entity_type TEXT,
  entity_id UUID,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  action_url TEXT,
  deduplication_key TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT notifications_type_length CHECK (length(type) BETWEEN 1 AND 100),
  CONSTRAINT notifications_title_length CHECK (length(title) BETWEEN 1 AND 300)
);

CREATE TABLE notification_settings (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  in_app_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  marketing_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  types_config JSONB NOT NULL DEFAULT '{}'::JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT notification_settings_types_config_object CHECK (jsonb_typeof(types_config) = 'object')
);

CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth_secret TEXT NOT NULL,
  user_agent TEXT,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('profile', 'message', 'property', 'group')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed')),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  resolution_note TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT reports_reason_length CHECK (length(reason) BETWEEN 1 AND 200)
);

CREATE TABLE moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
  moderator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  reason TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL CHECK (target_type IN ('profile', 'property', 'message', 'image')),
  target_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'escalated')),
  submitted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT moderation_queue_metadata_object CHECK (jsonb_typeof(metadata) = 'object')
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  ip_hash CHAR(64),
  request_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT audit_logs_action_length CHECK (length(action) BETWEEN 1 AND 160),
  CONSTRAINT audit_logs_metadata_object CHECK (jsonb_typeof(metadata) = 'object'),
  CONSTRAINT audit_logs_ip_hash_format CHECK (ip_hash IS NULL OR ip_hash ~ '^[0-9a-f]{64}$')
);

CREATE TABLE verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('identity', 'phone', 'email', 'property_ownership')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'verified', 'rejected', 'expired')),
  provider TEXT,
  provider_reference TEXT,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE verification_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID NOT NULL REFERENCES verification_requests(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  checksum_sha256 CHAR(64) NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT verification_artifacts_checksum_format CHECK (checksum_sha256 ~ '^[0-9a-f]{64}$')
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  mime_type TEXT NOT NULL,
  byte_size BIGINT NOT NULL,
  checksum_sha256 CHAR(64) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'ready', 'signed', 'archived', 'deleted')),
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT documents_owner_present CHECK (owner_id IS NOT NULL OR organization_id IS NOT NULL),
  CONSTRAINT documents_size_positive CHECK (byte_size > 0),
  CONSTRAINT documents_checksum_format CHECK (checksum_sha256 ~ '^[0-9a-f]{64}$'),
  CONSTRAINT documents_metadata_object CHECK (jsonb_typeof(metadata) = 'object')
);

CREATE TABLE document_participants (
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('viewer', 'signer', 'owner')),
  viewed_at TIMESTAMPTZ,
  PRIMARY KEY (document_id, profile_id)
);

CREATE TABLE document_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  provider TEXT,
  provider_reference TEXT,
  signature_hash CHAR(64) NOT NULL,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (document_id, profile_id),
  CONSTRAINT document_signatures_hash_format CHECK (signature_hash ~ '^[0-9a-f]{64}$')
);

-- This table stores payment workflow references only. It must never contain card numbers or CVV.
CREATE TABLE payment_placeholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  payer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  payee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  provider TEXT,
  provider_reference TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  purpose TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'RUB',
  status TEXT NOT NULL DEFAULT 'created'
    CHECK (status IN ('created', 'pending', 'authorized', 'captured', 'failed', 'cancelled', 'refunded')),
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT payment_placeholders_context_present CHECK (
    application_id IS NOT NULL OR group_id IS NOT NULL
  ),
  CONSTRAINT payment_placeholders_amount_positive CHECK (amount > 0),
  CONSTRAINT payment_placeholders_currency_format CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT payment_placeholders_metadata_object CHECK (jsonb_typeof(metadata) = 'object')
);

CREATE TABLE payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payment_placeholders(id) ON DELETE CASCADE,
  provider_event_id TEXT,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider_event_id),
  CONSTRAINT payment_events_payload_object CHECK (jsonb_typeof(payload) = 'object')
);

CREATE TABLE partner_feeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  feed_url TEXT,
  auth_config_encrypted BYTEA,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error', 'disabled')),
  sync_interval_minutes INTEGER NOT NULL DEFAULT 60,
  last_synced_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT partner_feeds_name_length CHECK (length(name) BETWEEN 1 AND 160),
  CONSTRAINT partner_feeds_interval_range CHECK (sync_interval_minutes BETWEEN 5 AND 10080)
);

CREATE TABLE partner_feed_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_id UUID NOT NULL REFERENCES partner_feeds(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'running'
    CHECK (status IN ('running', 'succeeded', 'partial', 'failed', 'cancelled')),
  items_seen INTEGER NOT NULL DEFAULT 0,
  items_created INTEGER NOT NULL DEFAULT 0,
  items_updated INTEGER NOT NULL DEFAULT 0,
  items_failed INTEGER NOT NULL DEFAULT 0,
  error_summary TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  CONSTRAINT partner_feed_runs_counts_nonnegative CHECK (
    items_seen >= 0 AND items_created >= 0 AND items_updated >= 0 AND items_failed >= 0
  )
);

CREATE TABLE partner_feed_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_id UUID NOT NULL REFERENCES partner_feeds(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  content_hash CHAR(64) NOT NULL,
  payload JSONB NOT NULL,
  imported_property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'imported', 'ignored', 'invalid', 'removed')),
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (feed_id, external_id),
  CONSTRAINT partner_feed_items_hash_format CHECK (content_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT partner_feed_items_payload_object CHECK (jsonb_typeof(payload) = 'object')
);

CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  provider TEXT,
  model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  body TEXT NOT NULL,
  redacted_body TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ai_messages_metadata_object CHECK (jsonb_typeof(metadata) = 'object')
);

CREATE TABLE ai_provider_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  request_kind TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('started', 'succeeded', 'failed', 'blocked')),
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  latency_ms INTEGER,
  error_code TEXT,
  request_metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  response_metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT ai_provider_requests_token_counts CHECK (
    (prompt_tokens IS NULL OR prompt_tokens >= 0)
    AND (completion_tokens IS NULL OR completion_tokens >= 0)
  ),
  CONSTRAINT ai_provider_requests_latency CHECK (latency_ms IS NULL OR latency_ms >= 0),
  CONSTRAINT ai_provider_requests_request_metadata_object CHECK (
    jsonb_typeof(request_metadata) = 'object'
  ),
  CONSTRAINT ai_provider_requests_response_metadata_object CHECK (
    jsonb_typeof(response_metadata) = 'object'
  )
);

CREATE TABLE ai_moderation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  provider_request_id UUID REFERENCES ai_provider_requests(id) ON DELETE SET NULL,
  content_type TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('allow', 'review', 'block')),
  categories JSONB NOT NULL DEFAULT '{}'::JSONB,
  model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ai_moderation_events_categories_object CHECK (jsonb_typeof(categories) = 'object')
);

CREATE TABLE ai_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('profile', 'property', 'message', 'document')),
  entity_id UUID NOT NULL,
  model TEXT NOT NULL,
  dimensions INTEGER NOT NULL,
  embedding REAL[] NOT NULL,
  content_hash CHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (entity_type, entity_id, model),
  CONSTRAINT ai_embeddings_dimensions_range CHECK (dimensions BETWEEN 1 AND 8192),
  CONSTRAINT ai_embeddings_vector_size CHECK (cardinality(embedding) = dimensions),
  CONSTRAINT ai_embeddings_content_hash_format CHECK (content_hash ~ '^[0-9a-f]{64}$')
);

CREATE INDEX sessions_user_active_idx
  ON sessions (user_id, expires_at DESC) WHERE revoked_at IS NULL;
CREATE INDEX sessions_expiry_idx ON sessions (expires_at);
CREATE INDEX password_reset_tokens_user_idx ON password_reset_tokens (user_id, expires_at DESC);
CREATE INDEX rate_limit_buckets_expiry_idx ON rate_limit_buckets (expires_at);
CREATE INDEX user_roles_role_idx ON user_roles (role, user_id);
CREATE INDEX profiles_public_city_idx ON profiles (city, id) WHERE is_public = TRUE AND archived_at IS NULL;
CREATE UNIQUE INDEX profiles_verified_phone_idx ON profiles (phone) WHERE phone_verified_at IS NOT NULL;
CREATE INDEX lifestyle_answers_question_idx ON lifestyle_answers (question_key);
CREATE INDEX user_consents_latest_idx ON user_consents (user_id, purpose, recorded_at DESC);
CREATE INDEX organization_members_user_idx ON organization_members (user_id);
CREATE INDEX properties_catalog_idx
  ON properties (status, city, district, monthly_rent, created_at DESC)
  WHERE archived_at IS NULL;
CREATE INDEX properties_owner_idx ON properties (owner_id, status);
CREATE INDEX properties_organization_idx ON properties (organization_id, status);
CREATE UNIQUE INDEX property_images_one_main_idx ON property_images (property_id) WHERE is_main = TRUE;
CREATE INDEX property_images_order_idx ON property_images (property_id, sort_order, id);
CREATE INDEX favorites_subject_idx ON favorites (subject_type, subject_id);
CREATE INDEX group_members_profile_idx ON group_members (profile_id, status);
CREATE INDEX group_invitations_recipient_idx ON group_invitations (invitee_id, status, expires_at);
CREATE INDEX group_invitations_email_idx ON group_invitations (email, status, expires_at);
CREATE UNIQUE INDEX group_invitations_one_pending_profile_idx
  ON group_invitations (group_id, invitee_id)
  WHERE status = 'pending' AND invitee_id IS NOT NULL;
CREATE INDEX applications_group_idx ON applications (group_id, created_at DESC);
CREATE INDEX applications_property_idx ON applications (property_id, status, created_at DESC);
CREATE INDEX application_events_timeline_idx ON application_events (application_id, created_at, id);
CREATE INDEX conversation_members_profile_idx ON conversation_members (profile_id, archived_at);
CREATE UNIQUE INDEX conversations_one_group_chat_idx
  ON conversations (group_id, type) WHERE group_id IS NOT NULL AND type = 'group';
CREATE UNIQUE INDEX conversations_one_application_chat_idx
  ON conversations (application_id) WHERE application_id IS NOT NULL;
CREATE INDEX messages_conversation_timeline_idx ON messages (conversation_id, sent_at DESC, id);
CREATE INDEX messages_sender_idx ON messages (sender_id, sent_at DESC);
CREATE INDEX message_attachments_message_idx ON message_attachments (message_id);
CREATE INDEX message_attachments_pending_cleanup_idx
  ON message_attachments (created_at) WHERE message_id IS NULL AND status = 'pending';
CREATE INDEX chores_group_status_idx ON chores (group_id, status, due_date);
CREATE INDEX expenses_group_status_idx ON expenses (group_id, status, incurred_at DESC);
CREATE INDEX notifications_user_unread_idx ON notifications (user_id, created_at DESC) WHERE read_at IS NULL;
CREATE UNIQUE INDEX notifications_deduplication_idx
  ON notifications (user_id, deduplication_key) WHERE deduplication_key IS NOT NULL;
CREATE INDEX reports_status_idx ON reports (status, created_at);
CREATE INDEX moderation_queue_status_idx ON moderation_queue (status, created_at);
CREATE UNIQUE INDEX moderation_queue_one_pending_target_idx
  ON moderation_queue (target_type, target_id) WHERE status = 'pending';
CREATE INDEX audit_logs_user_timeline_idx ON audit_logs (user_id, created_at DESC);
CREATE INDEX audit_logs_entity_idx ON audit_logs (entity_type, entity_id, created_at DESC);
CREATE INDEX verification_requests_profile_idx ON verification_requests (profile_id, type, status);
CREATE INDEX documents_group_idx ON documents (group_id, created_at DESC);
CREATE INDEX documents_application_idx ON documents (application_id, created_at DESC);
CREATE INDEX payment_placeholders_status_idx ON payment_placeholders (status, created_at);
CREATE INDEX partner_feeds_next_sync_idx ON partner_feeds (status, next_sync_at);
CREATE INDEX partner_feed_runs_feed_idx ON partner_feed_runs (feed_id, started_at DESC);
CREATE INDEX partner_feed_items_status_idx ON partner_feed_items (feed_id, status, last_seen_at DESC);
CREATE INDEX ai_conversations_user_idx ON ai_conversations (user_id, updated_at DESC);
CREATE INDEX ai_messages_conversation_idx ON ai_messages (conversation_id, created_at, id);
CREATE INDEX ai_provider_requests_user_idx ON ai_provider_requests (user_id, created_at DESC);
CREATE INDEX ai_provider_requests_status_idx ON ai_provider_requests (status, created_at DESC);
CREATE INDEX ai_moderation_events_decision_idx ON ai_moderation_events (decision, created_at DESC);

CREATE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_set_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER user_settings_set_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER profile_preferences_set_updated_at BEFORE UPDATE ON profile_preferences
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER lifestyle_answers_set_updated_at BEFORE UPDATE ON lifestyle_answers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER organizations_set_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER properties_set_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER groups_set_updated_at BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER group_members_set_updated_at BEFORE UPDATE ON group_members
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER group_invitations_set_updated_at BEFORE UPDATE ON group_invitations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER applications_set_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER conversations_set_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER chores_set_updated_at BEFORE UPDATE ON chores
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER expenses_set_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER notification_settings_set_updated_at BEFORE UPDATE ON notification_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER push_subscriptions_set_updated_at BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER reports_set_updated_at BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER moderation_queue_set_updated_at BEFORE UPDATE ON moderation_queue
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER verification_requests_set_updated_at BEFORE UPDATE ON verification_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER documents_set_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER payment_placeholders_set_updated_at BEFORE UPDATE ON payment_placeholders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER partner_feeds_set_updated_at BEFORE UPDATE ON partner_feeds
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER partner_feed_items_set_updated_at BEFORE UPDATE ON partner_feed_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER ai_conversations_set_updated_at BEFORE UPDATE ON ai_conversations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER ai_embeddings_set_updated_at BEFORE UPDATE ON ai_embeddings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON COLUMN sessions.token_hash IS 'SHA-256 hash of the opaque browser session token';
COMMENT ON COLUMN password_reset_tokens.token_hash IS 'SHA-256 hash; the raw reset token is never stored';
COMMENT ON COLUMN partner_feeds.auth_config_encrypted IS 'Encrypted provider credentials; encryption key is external to PostgreSQL';
COMMENT ON TABLE payment_placeholders IS 'Payment workflow references only; never store PAN, CVV, or raw bank credentials';
