
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "herd_invites": {
                  Row: {
                    "created_at": string,"email": string,"herd_id": string,"id": string,"invited_by": string | null,"role": Database["public"]['Enums']["herd_role"]
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"email": string,"herd_id": string,"id"?: string,"invited_by"?: string | null,"role"?: Database["public"]['Enums']["herd_role"]
                  }
                  Update: {
                    "created_at"?: string,"email"?: string,"herd_id"?: string,"id"?: string,"invited_by"?: string | null,"role"?: Database["public"]['Enums']["herd_role"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "herd_invites_herd_id_fkey"
      columns: ["herd_id"]
isOneToOne: false
      referencedRelation: "herds"
      referencedColumns: ["id"]
    }
                  ]
                },"herd_members": {
                  Row: {
                    "created_at": string,"display_name": string,"email": string,"herd_id": string,"role": Database["public"]['Enums']["herd_role"],"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"display_name": string,"email": string,"herd_id": string,"role": Database["public"]['Enums']["herd_role"],"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"display_name"?: string,"email"?: string,"herd_id"?: string,"role"?: Database["public"]['Enums']["herd_role"],"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "herd_members_herd_id_fkey"
      columns: ["herd_id"]
isOneToOne: false
      referencedRelation: "herds"
      referencedColumns: ["id"]
    }
                  ]
                },"herds": {
                  Row: {
                    "created_at": string,"created_by": string | null,"id": string,"name": string,"weight_unit": Database["public"]['Enums']["weight_unit"]
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"id"?: string,"name": string,"weight_unit"?: Database["public"]['Enums']["weight_unit"]
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"id"?: string,"name"?: string,"weight_unit"?: Database["public"]['Enums']["weight_unit"]
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "accept_invite":
{ Args: { "invite_id": string }; Returns: {
              "created_at": string,
"display_name": string,
"email": string,
"herd_id": string,
"role": Database["public"]['Enums']["herd_role"],
"user_id": string
            }
                          SetofOptions: {
        from: "*"
        to: "herd_members"
        isOneToOne: true
        isSetofReturn: false
      } },
"create_herd":
{ Args: { "herd_name": string }; Returns: {
              "created_at": string,
"created_by": string | null,
"id": string,
"name": string,
"weight_unit": Database["public"]['Enums']["weight_unit"]
            }
                          SetofOptions: {
        from: "*"
        to: "herds"
        isOneToOne: true
        isSetofReturn: false
      } },
"current_user_display_name":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"current_user_email":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"is_herd_member":
{ Args: { "target_herd": string }; Returns: boolean
                           },
"is_herd_owner":
{ Args: { "target_herd": string }; Returns: boolean
                           },
"pending_invites":
{ Args: Record<PropertyKey, never>; Returns: {
              "created_at": string,"herd_id": string,"herd_name": string,"id": string,"role": Database["public"]['Enums']["herd_role"]
            }[]
                           }
          }
          Enums: {
            "herd_role": "owner"|"helper","weight_unit": "lb"|"kg"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "herd_role": ["owner", "helper"],"weight_unit": ["lb", "kg"]
          }
        }
} as const
