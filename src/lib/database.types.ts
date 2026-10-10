// Generated from the Supabase project schema. Regenerate after migrations.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.18';
  };
  public: {
    Tables: {
      activity: {
        Row: { actor_id: string | null; created_at: string; data: Json; id: string; kind: string; task_id: string | null; workspace_id: string };
        Insert: { actor_id?: string | null; created_at?: string; data?: Json; id?: string; kind: string; task_id?: string | null; workspace_id: string };
        Update: { actor_id?: string | null; created_at?: string; data?: Json; id?: string; kind?: string; task_id?: string | null; workspace_id?: string };
        Relationships: [
          { foreignKeyName: 'activity_actor_id_fkey'; columns: ['actor_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
          { foreignKeyName: 'activity_task_id_fkey'; columns: ['task_id']; isOneToOne: false; referencedRelation: 'tasks'; referencedColumns: ['id'] },
          { foreignKeyName: 'activity_workspace_id_fkey'; columns: ['workspace_id']; isOneToOne: false; referencedRelation: 'workspaces'; referencedColumns: ['id'] },
        ];
      };
      attachments: {
        Row: { created_at: string; id: string; mime_type: string | null; name: string; size_bytes: number | null; storage_path: string; task_id: string; uploaded_by: string | null; workspace_id: string };
        Insert: { created_at?: string; id?: string; mime_type?: string | null; name: string; size_bytes?: number | null; storage_path: string; task_id: string; uploaded_by?: string | null; workspace_id: string };
        Update: { created_at?: string; id?: string; mime_type?: string | null; name?: string; size_bytes?: number | null; storage_path?: string; task_id?: string; uploaded_by?: string | null; workspace_id?: string };
        Relationships: [
          { foreignKeyName: 'attachments_task_id_fkey'; columns: ['task_id']; isOneToOne: false; referencedRelation: 'tasks'; referencedColumns: ['id'] },
          { foreignKeyName: 'attachments_uploaded_by_fkey'; columns: ['uploaded_by']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
          { foreignKeyName: 'attachments_workspace_id_fkey'; columns: ['workspace_id']; isOneToOne: false; referencedRelation: 'workspaces'; referencedColumns: ['id'] },
        ];
      };
      comments: {
        Row: { author_id: string | null; body: string; created_at: string; id: string; task_id: string; workspace_id: string };
        Insert: { author_id?: string | null; body: string; created_at?: string; id?: string; task_id: string; workspace_id: string };
        Update: { author_id?: string | null; body?: string; created_at?: string; id?: string; task_id?: string; workspace_id?: string };
        Relationships: [
          { foreignKeyName: 'comments_author_id_fkey'; columns: ['author_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
          { foreignKeyName: 'comments_task_id_fkey'; columns: ['task_id']; isOneToOne: false; referencedRelation: 'tasks'; referencedColumns: ['id'] },
          { foreignKeyName: 'comments_workspace_id_fkey'; columns: ['workspace_id']; isOneToOne: false; referencedRelation: 'workspaces'; referencedColumns: ['id'] },
        ];
      };
      invites: {
        Row: { accepted_at: string | null; accepted_by: string | null; created_at: string; created_by: string | null; email: string | null; id: string; role: Database['public']['Enums']['member_role']; token: string; workspace_id: string };
        Insert: { accepted_at?: string | null; accepted_by?: string | null; created_at?: string; created_by?: string | null; email?: string | null; id?: string; role?: Database['public']['Enums']['member_role']; token?: string; workspace_id: string };
        Update: { accepted_at?: string | null; accepted_by?: string | null; created_at?: string; created_by?: string | null; email?: string | null; id?: string; role?: Database['public']['Enums']['member_role']; token?: string; workspace_id?: string };
        Relationships: [
          { foreignKeyName: 'invites_accepted_by_fkey'; columns: ['accepted_by']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
          { foreignKeyName: 'invites_created_by_fkey'; columns: ['created_by']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
          { foreignKeyName: 'invites_workspace_id_fkey'; columns: ['workspace_id']; isOneToOne: false; referencedRelation: 'workspaces'; referencedColumns: ['id'] },
        ];
      };
      labels: {
        Row: { color: string; id: string; name: string; workspace_id: string };
        Insert: { color?: string; id?: string; name: string; workspace_id: string };
        Update: { color?: string; id?: string; name?: string; workspace_id?: string };
        Relationships: [{ foreignKeyName: 'labels_workspace_id_fkey'; columns: ['workspace_id']; isOneToOne: false; referencedRelation: 'workspaces'; referencedColumns: ['id'] }];
      };
      notifications: {
        Row: { actor_id: string | null; body: string; created_at: string; id: string; kind: string; read_at: string | null; snoozed_until: string | null; task_id: string | null; user_id: string; workspace_id: string };
        Insert: { actor_id?: string | null; body: string; created_at?: string; id?: string; kind: string; read_at?: string | null; snoozed_until?: string | null; task_id?: string | null; user_id: string; workspace_id: string };
        Update: { actor_id?: string | null; body?: string; created_at?: string; id?: string; kind?: string; read_at?: string | null; snoozed_until?: string | null; task_id?: string | null; user_id?: string; workspace_id?: string };
        Relationships: [
          { foreignKeyName: 'notifications_actor_id_fkey'; columns: ['actor_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
          { foreignKeyName: 'notifications_task_id_fkey'; columns: ['task_id']; isOneToOne: false; referencedRelation: 'tasks'; referencedColumns: ['id'] },
          { foreignKeyName: 'notifications_user_id_fkey'; columns: ['user_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
          { foreignKeyName: 'notifications_workspace_id_fkey'; columns: ['workspace_id']; isOneToOne: false; referencedRelation: 'workspaces'; referencedColumns: ['id'] },
        ];
      };
      profiles: {
        Row: { avatar_color: string; created_at: string; email: string | null; full_name: string | null; id: string };
        Insert: { avatar_color?: string; created_at?: string; email?: string | null; full_name?: string | null; id: string };
        Update: { avatar_color?: string; created_at?: string; email?: string | null; full_name?: string | null; id?: string };
        Relationships: [];
      };
      project_statuses: {
        Row: { color: string; id: string; is_done: boolean; name: string; position: number; project_id: string; workspace_id: string };
        Insert: { color?: string; id?: string; is_done?: boolean; name: string; position?: number; project_id: string; workspace_id: string };
        Update: { color?: string; id?: string; is_done?: boolean; name?: string; position?: number; project_id?: string; workspace_id?: string };
        Relationships: [
          { foreignKeyName: 'project_statuses_project_id_fkey'; columns: ['project_id']; isOneToOne: false; referencedRelation: 'projects'; referencedColumns: ['id'] },
          { foreignKeyName: 'project_statuses_workspace_id_fkey'; columns: ['workspace_id']; isOneToOne: false; referencedRelation: 'workspaces'; referencedColumns: ['id'] },
        ];
      };
      projects: {
        Row: { archived_at: string | null; color: string; created_at: string; created_by: string | null; description: string | null; due_date: string | null; id: string; name: string; position: number; workspace_id: string };
        Insert: { archived_at?: string | null; color?: string; created_at?: string; created_by?: string | null; description?: string | null; due_date?: string | null; id?: string; name: string; position?: number; workspace_id: string };
        Update: { archived_at?: string | null; color?: string; created_at?: string; created_by?: string | null; description?: string | null; due_date?: string | null; id?: string; name?: string; position?: number; workspace_id?: string };
        Relationships: [
          { foreignKeyName: 'projects_created_by_fkey'; columns: ['created_by']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
          { foreignKeyName: 'projects_workspace_id_fkey'; columns: ['workspace_id']; isOneToOne: false; referencedRelation: 'workspaces'; referencedColumns: ['id'] },
        ];
      };
      subtasks: {
        Row: { created_at: string; id: string; is_done: boolean; position: number; task_id: string; title: string; workspace_id: string };
        Insert: { created_at?: string; id?: string; is_done?: boolean; position?: number; task_id: string; title: string; workspace_id: string };
        Update: { created_at?: string; id?: string; is_done?: boolean; position?: number; task_id?: string; title?: string; workspace_id?: string };
        Relationships: [
          { foreignKeyName: 'subtasks_task_id_fkey'; columns: ['task_id']; isOneToOne: false; referencedRelation: 'tasks'; referencedColumns: ['id'] },
          { foreignKeyName: 'subtasks_workspace_id_fkey'; columns: ['workspace_id']; isOneToOne: false; referencedRelation: 'workspaces'; referencedColumns: ['id'] },
        ];
      };
      task_labels: {
        Row: { label_id: string; task_id: string };
        Insert: { label_id: string; task_id: string };
        Update: { label_id?: string; task_id?: string };
        Relationships: [
          { foreignKeyName: 'task_labels_label_id_fkey'; columns: ['label_id']; isOneToOne: false; referencedRelation: 'labels'; referencedColumns: ['id'] },
          { foreignKeyName: 'task_labels_task_id_fkey'; columns: ['task_id']; isOneToOne: false; referencedRelation: 'tasks'; referencedColumns: ['id'] },
        ];
      };
      tasks: {
        Row: { assignee_id: string | null; completed_at: string | null; created_at: string; created_by: string | null; description: string | null; due_at: string | null; id: string; position: number; priority: Database['public']['Enums']['task_priority']; project_id: string | null; status_id: string | null; title: string; updated_at: string; workspace_id: string };
        Insert: { assignee_id?: string | null; completed_at?: string | null; created_at?: string; created_by?: string | null; description?: string | null; due_at?: string | null; id?: string; position?: number; priority?: Database['public']['Enums']['task_priority']; project_id?: string | null; status_id?: string | null; title: string; updated_at?: string; workspace_id: string };
        Update: { assignee_id?: string | null; completed_at?: string | null; created_at?: string; created_by?: string | null; description?: string | null; due_at?: string | null; id?: string; position?: number; priority?: Database['public']['Enums']['task_priority']; project_id?: string | null; status_id?: string | null; title?: string; updated_at?: string; workspace_id?: string };
        Relationships: [
          { foreignKeyName: 'tasks_assignee_id_fkey'; columns: ['assignee_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
          { foreignKeyName: 'tasks_created_by_fkey'; columns: ['created_by']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
          { foreignKeyName: 'tasks_project_id_fkey'; columns: ['project_id']; isOneToOne: false; referencedRelation: 'projects'; referencedColumns: ['id'] },
          { foreignKeyName: 'tasks_status_id_fkey'; columns: ['status_id']; isOneToOne: false; referencedRelation: 'project_statuses'; referencedColumns: ['id'] },
          { foreignKeyName: 'tasks_workspace_id_fkey'; columns: ['workspace_id']; isOneToOne: false; referencedRelation: 'workspaces'; referencedColumns: ['id'] },
        ];
      };
      workspace_members: {
        Row: { created_at: string; role: Database['public']['Enums']['member_role']; user_id: string; workspace_id: string };
        Insert: { created_at?: string; role?: Database['public']['Enums']['member_role']; user_id: string; workspace_id: string };
        Update: { created_at?: string; role?: Database['public']['Enums']['member_role']; user_id?: string; workspace_id?: string };
        Relationships: [
          { foreignKeyName: 'workspace_members_user_id_fkey'; columns: ['user_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
          { foreignKeyName: 'workspace_members_workspace_id_fkey'; columns: ['workspace_id']; isOneToOne: false; referencedRelation: 'workspaces'; referencedColumns: ['id'] },
        ];
      };
      workspaces: {
        Row: { created_at: string; created_by: string | null; id: string; name: string };
        Insert: { created_at?: string; created_by?: string | null; id?: string; name: string };
        Update: { created_at?: string; created_by?: string | null; id?: string; name?: string };
        Relationships: [{ foreignKeyName: 'workspaces_created_by_fkey'; columns: ['created_by']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] }];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      accept_invite: { Args: { invite_token: string }; Returns: string };
      is_admin: { Args: { ws: string }; Returns: boolean };
      is_member: { Args: { ws: string }; Returns: boolean };
    };
    Enums: {
      member_role: 'owner' | 'admin' | 'member' | 'guest';
      task_priority: 'urgent' | 'high' | 'medium' | 'low' | 'none';
    };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database['public'];
export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row'];
export type TablesInsert<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Update'];
export type Enums<T extends keyof PublicSchema['Enums']> = PublicSchema['Enums'][T];
