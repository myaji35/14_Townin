-- Add FCM token column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS fcm_token VARCHAR(255);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_fcm_token ON users(fcm_token);
