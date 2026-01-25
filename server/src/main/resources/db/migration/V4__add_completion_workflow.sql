-- Add new status values and completion tracking fields to proposals table

-- Add new columns for completion workflow
ALTER TABLE proposals
ADD COLUMN completion_notes TEXT,
ADD COLUMN client_feedback TEXT,
ADD COLUMN rejection_reason TEXT,
ADD COLUMN submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;

-- Note: ProposalStatus enum will now include:
-- PENDING, ACCEPTED (transitional), IN_PROGRESS, AWAITING_COMPLETION, COMPLETED, REJECTED

-- Note: RequirementStatus enum will now include:
-- OPEN, IN_PROGRESS, COMPLETED, CANCELLED, CLOSED (legacy)
