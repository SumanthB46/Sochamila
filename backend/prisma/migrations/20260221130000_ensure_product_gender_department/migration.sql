-- Ensure Product has gender and department columns (idempotent).
-- Use when the DB is missing these columns (e.g. migration 20260219042941 not applied).

-- Create enums if they do not exist
DO $$ BEGIN
  CREATE TYPE "Gender" AS ENUM ('MEN', 'WOMEN', 'KIDS', 'UNISEX');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ProductDepartment" AS ENUM ('CLOTHING', 'ACCESSORIES', 'HOME_LIVING', 'GEAR');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add gender column if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Product' AND column_name = 'gender'
  ) THEN
    ALTER TABLE "Product" ADD COLUMN "gender" "Gender" NOT NULL DEFAULT 'UNISEX';
  END IF;
END $$;

-- Add department column if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Product' AND column_name = 'department'
  ) THEN
    ALTER TABLE "Product" ADD COLUMN "department" "ProductDepartment" NOT NULL DEFAULT 'CLOTHING';
  END IF;
END $$;
