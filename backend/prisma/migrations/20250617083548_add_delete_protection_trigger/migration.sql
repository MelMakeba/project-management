-- CreateFunction to enforce delete protection
CREATE OR REPLACE FUNCTION prevent_incomplete_project_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != 'COMPLETED' THEN
    RAISE EXCEPTION 'Cannot delete project until status is changed to COMPLETED';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- CreateTrigger to apply the function
CREATE TRIGGER ensure_project_complete_before_delete
BEFORE DELETE ON "Project"
FOR EACH ROW
EXECUTE FUNCTION prevent_incomplete_project_deletion();