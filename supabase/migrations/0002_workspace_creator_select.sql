-- INSERT ... RETURNING checks the SELECT policy before the after-insert trigger adds the owner row,
-- so the creator must be allowed to see the workspace directly.
alter policy "workspaces_select" on public.workspaces
  using (public.is_member(id) or created_by = auth.uid());
