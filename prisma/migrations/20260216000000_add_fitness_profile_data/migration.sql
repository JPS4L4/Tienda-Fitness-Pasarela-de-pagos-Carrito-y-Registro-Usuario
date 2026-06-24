-- Add JSON snapshot for fitness profile data on users
ALTER TABLE "User" ADD COLUMN "fitnessProfileData" JSONB;
