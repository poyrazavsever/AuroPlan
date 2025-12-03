export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          total_xp: number | null;
          level: number | null;
          weekly_xp: number | null;
          monthly_xp: number | null;
          last_xp_reset_week: string | null;
          last_xp_reset_month: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          total_xp?: number | null;
          level?: number | null;
          weekly_xp?: number | null;
          monthly_xp?: number | null;
          last_xp_reset_week?: string | null;
          last_xp_reset_month?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      teams: {
        Row: {
          id: string;
          name: string;
          slug: string;
          owner_id: string;
          logo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          owner_id: string;
          logo_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["teams"]["Row"]>;
      };
      team_members: {
        Row: {
          id: number;
          team_id: string;
          user_id: string;
          role: "owner" | "admin" | "member";
          joined_at: string;
        };
        Insert: {
          id?: number;
          team_id: string;
          user_id: string;
          role?: "owner" | "admin" | "member";
          joined_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["team_members"]["Row"]>;
      };
      tasks: {
        Row: {
          id: string;
          team_id: string | null;
          created_at: string;
          title: string;
          description: string | null;
          status: "todo" | "in_progress" | "done";
          priority: "low" | "medium" | "high" | "critical";
          created_by: string;
          assigned_to: string | null;
          due_date: string | null;
        };
        Insert: {
          id?: string;
          team_id?: string | null;
          created_at?: string;
          title: string;
          description?: string | null;
          status?: "todo" | "in_progress" | "done";
          priority?: "low" | "medium" | "high" | "critical";
          created_by: string;
          assigned_to?: string | null;
          due_date?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["tasks"]["Row"]>;
      };
      micro_learnings: {
        Row: {
          id: string;
          team_id: string | null;
          title: string;
          content: string | null;
          content_type: "pdf" | "markdown";
          content_url: string | null;
          xp: number;
          category: string | null;
          is_published: boolean;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          team_id?: string | null;
          title: string;
          content?: string | null;
          content_type: "pdf" | "markdown";
          content_url?: string | null;
          xp: number;
          category?: string | null;
          is_published?: boolean;
          created_by: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["micro_learnings"]["Row"]>;
      };
      user_progress: {
        Row: {
          id: number;
          user_id: string;
          learning_id: string;
          completed_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          learning_id: string;
          completed_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_progress"]["Row"]>;
      };
      projects: {
        Row: {
          id: string;
          team_id: string;
          owner_id: string;
          name: string;
          slug: string;
          description: string | null;
          objective: string | null;
          status:
            | "planning"
            | "in_progress"
            | "on_hold"
            | "completed"
            | "cancelled";
          priority: "low" | "medium" | "high" | "critical";
          start_date: string | null;
          due_date: string | null;
          completed_at: string | null;
          cover_image_url: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          owner_id: string;
          name: string;
          slug: string;
          description?: string | null;
          objective?: string | null;
          status?: Database["public"]["Tables"]["projects"]["Row"]["status"];
          priority?: Database["public"]["Tables"]["projects"]["Row"]["priority"];
          start_date?: string | null;
          due_date?: string | null;
          completed_at?: string | null;
          cover_image_url?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Row"]>;
      };
      project_members: {
        Row: {
          id: number;
          project_id: string;
          user_id: string;
          role: "owner" | "manager" | "contributor" | "viewer";
          color_label: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          project_id: string;
          user_id: string;
          role?: "owner" | "manager" | "contributor" | "viewer";
          color_label?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["project_members"]["Row"]>;
      };
      project_milestones: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          status: "planned" | "in_progress" | "blocked" | "done";
          due_date: string | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          status?: Database["public"]["Tables"]["project_milestones"]["Row"]["status"];
          due_date?: string | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["project_milestones"]["Row"]
        >;
      };
      project_updates: {
        Row: {
          id: number;
          project_id: string;
          author_id: string;
          update_type: "note" | "risk" | "decision" | "retro";
          title: string;
          body: string | null;
          highlight: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          project_id: string;
          author_id: string;
          update_type?: Database["public"]["Tables"]["project_updates"]["Row"]["update_type"];
          title: string;
          body?: string | null;
          highlight?: boolean | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["project_updates"]["Row"]>;
      };
      project_documents: {
        Row: {
          id: string;
          project_id: string;
          uploader_id: string;
          storage_path: string;
          file_name: string;
          file_type: string | null;
          file_size: number | null;
          version: number;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          uploader_id: string;
          storage_path: string;
          file_name: string;
          file_type?: string | null;
          file_size?: number | null;
          version?: number;
          description?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["project_documents"]["Row"]
        >;
      };
      achievements: {
        Row: {
          id: string;
          scope: "global" | "team" | "project";
          team_id: string | null;
          project_id: string | null;
          title: string;
          description: string;
          icon: string;
          badge_color: string;
          xp_reward: number;
          category:
            | "onboarding"
            | "tasks"
            | "projects"
            | "learning"
            | "collaboration"
            | "streak"
            | "level"
            | "general";
          trigger_type:
            | "manual"
            | "task_complete"
            | "project_complete"
            | "learning_complete"
            | "xp_threshold"
            | "level_threshold"
            | "streak"
            | "count_based";
          trigger_value: number;
          trigger_conditions: Json | null;
          order_index: number;
          is_active: boolean;
          is_hidden: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          scope?: "global" | "team" | "project";
          team_id?: string | null;
          project_id?: string | null;
          title: string;
          description: string;
          icon?: string;
          badge_color?: string;
          xp_reward?: number;
          category?: Database["public"]["Tables"]["achievements"]["Row"]["category"];
          trigger_type?: Database["public"]["Tables"]["achievements"]["Row"]["trigger_type"];
          trigger_value?: number;
          trigger_conditions?: Json | null;
          order_index?: number;
          is_active?: boolean;
          is_hidden?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["achievements"]["Row"]>;
      };
      user_achievements: {
        Row: {
          id: number;
          user_id: string;
          achievement_id: string;
          earned_at: string;
          xp_awarded: number;
          progress: number;
          progress_max: number;
        };
        Insert: {
          id?: number;
          user_id: string;
          achievement_id: string;
          earned_at?: string;
          xp_awarded?: number;
          progress?: number;
          progress_max?: number;
        };
        Update: Partial<
          Database["public"]["Tables"]["user_achievements"]["Row"]
        >;
      };
      reports: {
        Row: {
          id: string;
          scope: "personal" | "team" | "project";
          team_id: string | null;
          project_id: string | null;
          uploaded_by: string;
          title: string;
          description: string | null;
          file_name: string;
          file_type: string;
          file_size: number;
          storage_path: string;
          report_period: string | null;
          tags: string[];
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          scope: "personal" | "team" | "project";
          team_id?: string | null;
          project_id?: string | null;
          uploaded_by: string;
          title: string;
          description?: string | null;
          file_name: string;
          file_type: string;
          file_size: number;
          storage_path: string;
          report_period?: string | null;
          tags?: string[];
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reports"]["Row"]>;
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          email_notifications: boolean;
          push_notifications: boolean;
          task_reminders: boolean;
          achievement_notifications: boolean;
          team_updates: boolean;
          weekly_digest: boolean;
          streak_reminders: boolean;
          theme: "light" | "dark" | "system";
          language: string;
          date_format: string;
          time_format: "12h" | "24h";
          profile_visibility: "public" | "team" | "private";
          show_activity: boolean;
          show_achievements: boolean;
          show_xp: boolean;
          show_leaderboard_rank: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email_notifications?: boolean;
          push_notifications?: boolean;
          task_reminders?: boolean;
          achievement_notifications?: boolean;
          team_updates?: boolean;
          weekly_digest?: boolean;
          streak_reminders?: boolean;
          theme?: "light" | "dark" | "system";
          language?: string;
          date_format?: string;
          time_format?: "12h" | "24h";
          profile_visibility?: "public" | "team" | "private";
          show_activity?: boolean;
          show_achievements?: boolean;
          show_xp?: boolean;
          show_leaderboard_rank?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_settings"]["Row"]>;
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          type:
            | "hackathon"
            | "conference"
            | "workshop"
            | "meetup"
            | "social"
            | "webinar"
            | "sprint"
            | "other";
          scope: "personal" | "team" | "project";
          team_id: string | null;
          project_id: string | null;
          created_by: string;
          start_date: string | null;
          end_date: string | null;
          timezone: string;
          location_type: "physical" | "online" | "hybrid";
          location_name: string | null;
          location_address: string | null;
          location_url: string | null;
          location_coordinates: { lat: number; lng: number } | null;
          status: "draft" | "planning" | "active" | "completed" | "cancelled";
          visibility: "private" | "team" | "public";
          cover_image_url: string | null;
          logo_url: string | null;
          color_theme: string;
          metadata: Json;
          total_sponsors: number;
          total_budget: number;
          total_registrations: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          type:
            | "hackathon"
            | "conference"
            | "workshop"
            | "meetup"
            | "social"
            | "webinar"
            | "sprint"
            | "other";
          scope?: "personal" | "team" | "project";
          team_id?: string | null;
          project_id?: string | null;
          created_by: string;
          start_date?: string | null;
          end_date?: string | null;
          timezone?: string;
          location_type?: "physical" | "online" | "hybrid";
          location_name?: string | null;
          location_address?: string | null;
          location_url?: string | null;
          location_coordinates?: { lat: number; lng: number } | null;
          status?: "draft" | "planning" | "active" | "completed" | "cancelled";
          visibility?: "private" | "team" | "public";
          cover_image_url?: string | null;
          logo_url?: string | null;
          color_theme?: string;
          metadata?: Json;
          total_sponsors?: number;
          total_budget?: number;
          total_registrations?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Row"]>;
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: "owner" | "organizer" | "coordinator" | "volunteer" | "member";
          department:
            | "sponsorship"
            | "logistics"
            | "content"
            | "technical"
            | "marketing"
            | "finance"
            | null;
          permissions: Json;
          joined_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role?: "owner" | "organizer" | "coordinator" | "volunteer" | "member";
          department?:
            | "sponsorship"
            | "logistics"
            | "content"
            | "technical"
            | "marketing"
            | "finance"
            | null;
          permissions?: Json;
          joined_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["organization_members"]["Row"]
        >;
      };
      organization_milestones: {
        Row: {
          id: string;
          organization_id: string;
          title: string;
          description: string | null;
          due_date: string | null;
          status: "pending" | "in_progress" | "completed" | "cancelled";
          order_index: number;
          progress: number;
          color: string | null;
          icon: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          title: string;
          description?: string | null;
          due_date?: string | null;
          status?: "pending" | "in_progress" | "completed" | "cancelled";
          order_index?: number;
          progress?: number;
          color?: string | null;
          icon?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["organization_milestones"]["Row"]
        >;
      };
    };
  };
}

// Helper types for achievements
export type Achievement = Database["public"]["Tables"]["achievements"]["Row"];
export type UserAchievement =
  Database["public"]["Tables"]["user_achievements"]["Row"];

export type AchievementWithProgress = Achievement & {
  user_progress?: {
    progress: number;
    progress_max: number;
    earned_at: string | null;
    xp_awarded: number;
  } | null;
};

// Helper types for reports
export type Report = Database["public"]["Tables"]["reports"]["Row"];
export type ReportInsert = Database["public"]["Tables"]["reports"]["Insert"];

export type ReportWithUploader = Report & {
  profiles?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

// Helper types for user settings
export type UserSettings = Database["public"]["Tables"]["user_settings"]["Row"];
export type UserSettingsInsert =
  Database["public"]["Tables"]["user_settings"]["Insert"];
export type UserSettingsUpdate =
  Database["public"]["Tables"]["user_settings"]["Update"];

// Helper types for organizations
export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type OrganizationInsert =
  Database["public"]["Tables"]["organizations"]["Insert"];
export type OrganizationUpdate =
  Database["public"]["Tables"]["organizations"]["Update"];

export type OrganizationMember =
  Database["public"]["Tables"]["organization_members"]["Row"];
export type OrganizationMemberInsert =
  Database["public"]["Tables"]["organization_members"]["Insert"];

export type OrganizationMilestone =
  Database["public"]["Tables"]["organization_milestones"]["Row"];
export type OrganizationMilestoneInsert =
  Database["public"]["Tables"]["organization_milestones"]["Insert"];

// Extended types with relations
export type OrganizationWithRelations = Organization & {
  teams?: { name: string; slug: string } | null;
  projects?: { name: string; slug: string } | null;
  organization_members?: (OrganizationMember & {
    profiles?: {
      id: string;
      full_name: string | null;
      email: string;
      avatar_url: string | null;
    } | null;
  })[];
  organization_milestones?: OrganizationMilestone[];
};

export type OrganizationMemberWithProfile = OrganizationMember & {
  profiles?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
};
