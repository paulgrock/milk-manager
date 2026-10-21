
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
            "goat_photos": {
                  Row: {
                    "created_at": string,"created_by": string | null,"goat_id": string,"herd_id": string,"id": string,"is_primary": boolean,"kind": string,"storage_path": string,"taken_on": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"goat_id": string,"herd_id": string,"id"?: string,"is_primary"?: boolean,"kind"?: string,"storage_path": string,"taken_on"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"goat_id"?: string,"herd_id"?: string,"id"?: string,"is_primary"?: boolean,"kind"?: string,"storage_path"?: string,"taken_on"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "goat_photos_goat_id_herd_id_fkey"
      columns: ["goat_id","herd_id"]
isOneToOne: false
      referencedRelation: "goats"
      referencedColumns: ["id","herd_id"]
    }
                  ]
                },"goats": {
                  Row: {
                    "barn_name": string | null,"birth_date": string | null,"breed": string | null,"breed_category": string | null,"color_markings": string | null,"created_at": string,"created_by": string | null,"dam_id": string | null,"herd_id": string,"horn_status": Database["public"]['Enums']["horn_status"],"id": string,"left_herd_on": string | null,"left_herd_reason": string | null,"microchip": string | null,"notes": string | null,"pedigree_url": string | null,"registered_name": string | null,"registration_number": string | null,"registry": string | null,"scrapie_tag": string | null,"sex": Database["public"]['Enums']["goat_sex"],"sire_id": string | null,"status": Database["public"]['Enums']["goat_status"],"tattoo_left": string | null,"tattoo_right": string | null,"title_prefix": string | null,"title_suffix": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "barn_name"?: string | null,"birth_date"?: string | null,"breed"?: string | null,"breed_category"?: string | null,"color_markings"?: string | null,"created_at"?: string,"created_by"?: string | null,"dam_id"?: string | null,"herd_id": string,"horn_status"?: Database["public"]['Enums']["horn_status"],"id"?: string,"left_herd_on"?: string | null,"left_herd_reason"?: string | null,"microchip"?: string | null,"notes"?: string | null,"pedigree_url"?: string | null,"registered_name"?: string | null,"registration_number"?: string | null,"registry"?: string | null,"scrapie_tag"?: string | null,"sex": Database["public"]['Enums']["goat_sex"],"sire_id"?: string | null,"status"?: Database["public"]['Enums']["goat_status"],"tattoo_left"?: string | null,"tattoo_right"?: string | null,"title_prefix"?: string | null,"title_suffix"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "barn_name"?: string | null,"birth_date"?: string | null,"breed"?: string | null,"breed_category"?: string | null,"color_markings"?: string | null,"created_at"?: string,"created_by"?: string | null,"dam_id"?: string | null,"herd_id"?: string,"horn_status"?: Database["public"]['Enums']["horn_status"],"id"?: string,"left_herd_on"?: string | null,"left_herd_reason"?: string | null,"microchip"?: string | null,"notes"?: string | null,"pedigree_url"?: string | null,"registered_name"?: string | null,"registration_number"?: string | null,"registry"?: string | null,"scrapie_tag"?: string | null,"sex"?: Database["public"]['Enums']["goat_sex"],"sire_id"?: string | null,"status"?: Database["public"]['Enums']["goat_status"],"tattoo_left"?: string | null,"tattoo_right"?: string | null,"title_prefix"?: string | null,"title_suffix"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "goats_dam_fk"
      columns: ["dam_id","herd_id"]
isOneToOne: false
      referencedRelation: "goats"
      referencedColumns: ["id","herd_id"]
    },{
      foreignKeyName: "goats_herd_id_fkey"
      columns: ["herd_id"]
isOneToOne: false
      referencedRelation: "herds"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "goats_sire_fk"
      columns: ["sire_id","herd_id"]
isOneToOne: false
      referencedRelation: "goats"
      referencedColumns: ["id","herd_id"]
    }
                  ]
                },"herd_invites": {
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
                },"linear_appraisals": {
                  Row: {
                    "appraised_on": string,"appraiser": string | null,"body_capacity": string,"created_at": string,"created_by": string | null,"dairy_strength": string,"final_score": number,"general_appearance": string,"goat_id": string,"herd_id": string,"id": string,"mammary_system": string | null,"notes": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "appraised_on": string,"appraiser"?: string | null,"body_capacity": string,"created_at"?: string,"created_by"?: string | null,"dairy_strength": string,"final_score": number,"general_appearance": string,"goat_id": string,"herd_id": string,"id"?: string,"mammary_system"?: string | null,"notes"?: string | null
                  }
                  Update: {
                    "appraised_on"?: string,"appraiser"?: string | null,"body_capacity"?: string,"created_at"?: string,"created_by"?: string | null,"dairy_strength"?: string,"final_score"?: number,"general_appearance"?: string,"goat_id"?: string,"herd_id"?: string,"id"?: string,"mammary_system"?: string | null,"notes"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "linear_appraisals_goat_id_herd_id_fkey"
      columns: ["goat_id","herd_id"]
isOneToOne: false
      referencedRelation: "goats"
      referencedColumns: ["id","herd_id"]
    }
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
                           },
"set_primary_photo":
{ Args: { "photo_id": string }; Returns: undefined
                           },
"storage_path_herd":
{ Args: { "path": string }; Returns: string
                           }
          }
          Enums: {
            "goat_sex": "doe"|"buck"|"wether","goat_status": "active"|"for_sale"|"sold"|"deceased"|"reference","herd_role": "owner"|"helper","horn_status": "disbudded"|"polled"|"horned"|"unknown","weight_unit": "lb"|"kg"
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
            "goat_sex": ["doe", "buck", "wether"],"goat_status": ["active", "for_sale", "sold", "deceased", "reference"],"herd_role": ["owner", "helper"],"horn_status": ["disbudded", "polled", "horned", "unknown"],"weight_unit": ["lb", "kg"]
          }
        }
} as const
