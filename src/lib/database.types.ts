
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
            "breedings": {
                  Row: {
                    "bred_on": string,"buck_id": string | null,"created_at": string,"created_by": string | null,"doe_id": string,"exposure_end": string | null,"herd_id": string,"id": string,"method": Database["public"]['Enums']["breeding_method"],"notes": string | null,"service_fee_cents": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "bred_on": string,"buck_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"doe_id": string,"exposure_end"?: string | null,"herd_id": string,"id"?: string,"method"?: Database["public"]['Enums']["breeding_method"],"notes"?: string | null,"service_fee_cents"?: number | null
                  }
                  Update: {
                    "bred_on"?: string,"buck_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"doe_id"?: string,"exposure_end"?: string | null,"herd_id"?: string,"id"?: string,"method"?: Database["public"]['Enums']["breeding_method"],"notes"?: string | null,"service_fee_cents"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "breedings_buck_id_herd_id_fkey"
      columns: ["buck_id","herd_id"]
isOneToOne: false
      referencedRelation: "goats"
      referencedColumns: ["id","herd_id"]
    },{
      foreignKeyName: "breedings_doe_id_herd_id_fkey"
      columns: ["doe_id","herd_id"]
isOneToOne: false
      referencedRelation: "goats"
      referencedColumns: ["id","herd_id"]
    }
                  ]
                },"care_events": {
                  Row: {
                    "care_type_id": string,"created_at": string,"created_by": string | null,"done_on": string,"dose": number | null,"goat_id": string,"herd_id": string,"id": string,"notes": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "care_type_id": string,"created_at"?: string,"created_by"?: string | null,"done_on": string,"dose"?: number | null,"goat_id": string,"herd_id": string,"id"?: string,"notes"?: string | null
                  }
                  Update: {
                    "care_type_id"?: string,"created_at"?: string,"created_by"?: string | null,"done_on"?: string,"dose"?: number | null,"goat_id"?: string,"herd_id"?: string,"id"?: string,"notes"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "care_events_care_type_id_herd_id_fkey"
      columns: ["care_type_id","herd_id"]
isOneToOne: false
      referencedRelation: "care_types"
      referencedColumns: ["id","herd_id"]
    },{
      foreignKeyName: "care_events_goat_id_herd_id_fkey"
      columns: ["goat_id","herd_id"]
isOneToOne: false
      referencedRelation: "goats"
      referencedColumns: ["id","herd_id"]
    }
                  ]
                },"care_types": {
                  Row: {
                    "archived": boolean,"created_at": string,"dose_unit": string | null,"herd_id": string,"id": string,"interval_days": number | null,"name": string,"sort_order": number
                  }
                  ComputedFields: never
                  Insert: {
                    "archived"?: boolean,"created_at"?: string,"dose_unit"?: string | null,"herd_id": string,"id"?: string,"interval_days"?: number | null,"name": string,"sort_order"?: number
                  }
                  Update: {
                    "archived"?: boolean,"created_at"?: string,"dose_unit"?: string | null,"herd_id"?: string,"id"?: string,"interval_days"?: number | null,"name"?: string,"sort_order"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "care_types_herd_id_fkey"
      columns: ["herd_id"]
isOneToOne: false
      referencedRelation: "herds"
      referencedColumns: ["id"]
    }
                  ]
                },"disease_tests": {
                  Row: {
                    "created_at": string,"created_by": string | null,"disease": string,"goat_id": string,"herd_id": string,"id": string,"lab": string | null,"notes": string | null,"result": Database["public"]['Enums']["test_result"],"tested_on": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"disease": string,"goat_id": string,"herd_id": string,"id"?: string,"lab"?: string | null,"notes"?: string | null,"result"?: Database["public"]['Enums']["test_result"],"tested_on": string
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"disease"?: string,"goat_id"?: string,"herd_id"?: string,"id"?: string,"lab"?: string | null,"notes"?: string | null,"result"?: Database["public"]['Enums']["test_result"],"tested_on"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "disease_tests_goat_id_herd_id_fkey"
      columns: ["goat_id","herd_id"]
isOneToOne: false
      referencedRelation: "goats"
      referencedColumns: ["id","herd_id"]
    }
                  ]
                },"finance_entries": {
                  Row: {
                    "amount_cents": number,"breeding_id": string | null,"category": string,"created_at": string,"created_by": string | null,"description": string | null,"goat_id": string | null,"herd_id": string,"id": string,"kind": Database["public"]['Enums']["finance_kind"],"notes": string | null,"occurred_on": string,"party": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "amount_cents": number,"breeding_id"?: string | null,"category": string,"created_at"?: string,"created_by"?: string | null,"description"?: string | null,"goat_id"?: string | null,"herd_id": string,"id"?: string,"kind": Database["public"]['Enums']["finance_kind"],"notes"?: string | null,"occurred_on": string,"party"?: string | null
                  }
                  Update: {
                    "amount_cents"?: number,"breeding_id"?: string | null,"category"?: string,"created_at"?: string,"created_by"?: string | null,"description"?: string | null,"goat_id"?: string | null,"herd_id"?: string,"id"?: string,"kind"?: Database["public"]['Enums']["finance_kind"],"notes"?: string | null,"occurred_on"?: string,"party"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "finance_entries_breeding_id_herd_id_fkey"
      columns: ["breeding_id","herd_id"]
isOneToOne: false
      referencedRelation: "breedings"
      referencedColumns: ["id","herd_id"]
    },{
      foreignKeyName: "finance_entries_goat_id_herd_id_fkey"
      columns: ["goat_id","herd_id"]
isOneToOne: false
      referencedRelation: "goats"
      referencedColumns: ["id","herd_id"]
    },{
      foreignKeyName: "finance_entries_herd_id_fkey"
      columns: ["herd_id"]
isOneToOne: false
      referencedRelation: "herds"
      referencedColumns: ["id"]
    }
                  ]
                },"goat_photos": {
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
                    "barn_name": string | null,"birth_date": string | null,"breed": string | null,"breed_category": string | null,"color_markings": string | null,"created_at": string,"created_by": string | null,"dam_id": string | null,"herd_id": string,"horn_status": Database["public"]['Enums']["horn_status"],"id": string,"left_herd_on": string | null,"left_herd_reason": string | null,"microchip": string | null,"notes": string | null,"pedigree_url": string | null,"registered_name": string | null,"registration_number": string | null,"registry": string | null,"scrapie_tag": string | null,"sex": Database["public"]['Enums']["goat_sex"],"sire_id": string | null,"slug": string,"status": Database["public"]['Enums']["goat_status"],"tattoo_left": string | null,"tattoo_right": string | null,"title_prefix": string | null,"title_suffix": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "barn_name"?: string | null,"birth_date"?: string | null,"breed"?: string | null,"breed_category"?: string | null,"color_markings"?: string | null,"created_at"?: string,"created_by"?: string | null,"dam_id"?: string | null,"herd_id": string,"horn_status"?: Database["public"]['Enums']["horn_status"],"id"?: string,"left_herd_on"?: string | null,"left_herd_reason"?: string | null,"microchip"?: string | null,"notes"?: string | null,"pedigree_url"?: string | null,"registered_name"?: string | null,"registration_number"?: string | null,"registry"?: string | null,"scrapie_tag"?: string | null,"sex": Database["public"]['Enums']["goat_sex"],"sire_id"?: string | null,"slug"?: string,"status"?: Database["public"]['Enums']["goat_status"],"tattoo_left"?: string | null,"tattoo_right"?: string | null,"title_prefix"?: string | null,"title_suffix"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "barn_name"?: string | null,"birth_date"?: string | null,"breed"?: string | null,"breed_category"?: string | null,"color_markings"?: string | null,"created_at"?: string,"created_by"?: string | null,"dam_id"?: string | null,"herd_id"?: string,"horn_status"?: Database["public"]['Enums']["horn_status"],"id"?: string,"left_herd_on"?: string | null,"left_herd_reason"?: string | null,"microchip"?: string | null,"notes"?: string | null,"pedigree_url"?: string | null,"registered_name"?: string | null,"registration_number"?: string | null,"registry"?: string | null,"scrapie_tag"?: string | null,"sex"?: Database["public"]['Enums']["goat_sex"],"sire_id"?: string | null,"slug"?: string,"status"?: Database["public"]['Enums']["goat_status"],"tattoo_left"?: string | null,"tattoo_right"?: string | null,"title_prefix"?: string | null,"title_suffix"?: string | null,"updated_at"?: string
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
                },"health_observations": {
                  Row: {
                    "body_condition": number | null,"created_at": string,"created_by": string | null,"famacha": number | null,"goat_id": string,"herd_id": string,"id": string,"notes": string | null,"observed_on": string,"weight_g": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "body_condition"?: number | null,"created_at"?: string,"created_by"?: string | null,"famacha"?: number | null,"goat_id": string,"herd_id": string,"id"?: string,"notes"?: string | null,"observed_on": string,"weight_g"?: number | null
                  }
                  Update: {
                    "body_condition"?: number | null,"created_at"?: string,"created_by"?: string | null,"famacha"?: number | null,"goat_id"?: string,"herd_id"?: string,"id"?: string,"notes"?: string | null,"observed_on"?: string,"weight_g"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "health_observations_goat_id_herd_id_fkey"
      columns: ["goat_id","herd_id"]
isOneToOne: false
      referencedRelation: "goats"
      referencedColumns: ["id","herd_id"]
    }
                  ]
                },"heats": {
                  Row: {
                    "created_at": string,"created_by": string | null,"goat_id": string,"herd_id": string,"id": string,"observed_on": string,"signs": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"goat_id": string,"herd_id": string,"id"?: string,"observed_on": string,"signs"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"goat_id"?: string,"herd_id"?: string,"id"?: string,"observed_on"?: string,"signs"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "heats_goat_id_herd_id_fkey"
      columns: ["goat_id","herd_id"]
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
                    "created_at": string,"created_by": string | null,"id": string,"logo": string | null,"name": string,"weight_unit": Database["public"]['Enums']["weight_unit"]
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"id"?: string,"logo"?: string | null,"name": string,"weight_unit"?: Database["public"]['Enums']["weight_unit"]
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"id"?: string,"logo"?: string | null,"name"?: string,"weight_unit"?: Database["public"]['Enums']["weight_unit"]
                  }
                  Relationships: [
                    
                  ]
                },"kiddings": {
                  Row: {
                    "breeding_id": string | null,"created_at": string,"created_by": string | null,"difficulty": Database["public"]['Enums']["kidding_difficulty"],"doe_id": string,"herd_id": string,"id": string,"kidded_on": string,"notes": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "breeding_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"difficulty"?: Database["public"]['Enums']["kidding_difficulty"],"doe_id": string,"herd_id": string,"id"?: string,"kidded_on": string,"notes"?: string | null
                  }
                  Update: {
                    "breeding_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"difficulty"?: Database["public"]['Enums']["kidding_difficulty"],"doe_id"?: string,"herd_id"?: string,"id"?: string,"kidded_on"?: string,"notes"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "kiddings_breeding_id_herd_id_fkey"
      columns: ["breeding_id","herd_id"]
isOneToOne: false
      referencedRelation: "breedings"
      referencedColumns: ["id","herd_id"]
    },{
      foreignKeyName: "kiddings_doe_id_herd_id_fkey"
      columns: ["doe_id","herd_id"]
isOneToOne: false
      referencedRelation: "goats"
      referencedColumns: ["id","herd_id"]
    }
                  ]
                },"kids": {
                  Row: {
                    "birth_weight_g": number | null,"goat_id": string | null,"herd_id": string,"id": string,"kidding_id": string,"notes": string | null,"outcome": Database["public"]['Enums']["kid_outcome"],"sex": Database["public"]['Enums']["goat_sex"]
                  }
                  ComputedFields: never
                  Insert: {
                    "birth_weight_g"?: number | null,"goat_id"?: string | null,"herd_id": string,"id"?: string,"kidding_id": string,"notes"?: string | null,"outcome"?: Database["public"]['Enums']["kid_outcome"],"sex": Database["public"]['Enums']["goat_sex"]
                  }
                  Update: {
                    "birth_weight_g"?: number | null,"goat_id"?: string | null,"herd_id"?: string,"id"?: string,"kidding_id"?: string,"notes"?: string | null,"outcome"?: Database["public"]['Enums']["kid_outcome"],"sex"?: Database["public"]['Enums']["goat_sex"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "kids_goat_id_herd_id_fkey"
      columns: ["goat_id","herd_id"]
isOneToOne: false
      referencedRelation: "goats"
      referencedColumns: ["id","herd_id"]
    },{
      foreignKeyName: "kids_kidding_id_herd_id_fkey"
      columns: ["kidding_id","herd_id"]
isOneToOne: false
      referencedRelation: "kiddings"
      referencedColumns: ["id","herd_id"]
    }
                  ]
                },"lactations": {
                  Row: {
                    "created_at": string,"created_by": string | null,"dried_off_on": string | null,"freshened_on": string,"goat_id": string,"herd_id": string,"id": string,"lactation_number": number,"notes": string | null,"official_305_fat_g": number | null,"official_305_milk_g": number | null,"official_305_protein_g": number | null,"official_days": number | null,"official_fat_g": number | null,"official_milk_g": number | null,"official_protein_g": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"dried_off_on"?: string | null,"freshened_on": string,"goat_id": string,"herd_id": string,"id"?: string,"lactation_number": number,"notes"?: string | null,"official_305_fat_g"?: number | null,"official_305_milk_g"?: number | null,"official_305_protein_g"?: number | null,"official_days"?: number | null,"official_fat_g"?: number | null,"official_milk_g"?: number | null,"official_protein_g"?: number | null
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"dried_off_on"?: string | null,"freshened_on"?: string,"goat_id"?: string,"herd_id"?: string,"id"?: string,"lactation_number"?: number,"notes"?: string | null,"official_305_fat_g"?: number | null,"official_305_milk_g"?: number | null,"official_305_protein_g"?: number | null,"official_days"?: number | null,"official_fat_g"?: number | null,"official_milk_g"?: number | null,"official_protein_g"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "lactations_goat_id_herd_id_fkey"
      columns: ["goat_id","herd_id"]
isOneToOne: false
      referencedRelation: "goats"
      referencedColumns: ["id","herd_id"]
    }
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
                },"milk_test_results": {
                  Row: {
                    "butterfat_pct": number | null,"dim": number | null,"goat_id": string,"herd_id": string,"id": string,"ltd_fat_g": number | null,"ltd_milk_g": number | null,"ltd_protein_g": number | null,"milk_g": number | null,"notes": string | null,"proj305_fat_g": number | null,"proj305_milk_g": number | null,"proj305_protein_g": number | null,"protein_pct": number | null,"scc": number | null,"test_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "butterfat_pct"?: number | null,"dim"?: number | null,"goat_id": string,"herd_id": string,"id"?: string,"ltd_fat_g"?: number | null,"ltd_milk_g"?: number | null,"ltd_protein_g"?: number | null,"milk_g"?: number | null,"notes"?: string | null,"proj305_fat_g"?: number | null,"proj305_milk_g"?: number | null,"proj305_protein_g"?: number | null,"protein_pct"?: number | null,"scc"?: number | null,"test_id": string
                  }
                  Update: {
                    "butterfat_pct"?: number | null,"dim"?: number | null,"goat_id"?: string,"herd_id"?: string,"id"?: string,"ltd_fat_g"?: number | null,"ltd_milk_g"?: number | null,"ltd_protein_g"?: number | null,"milk_g"?: number | null,"notes"?: string | null,"proj305_fat_g"?: number | null,"proj305_milk_g"?: number | null,"proj305_protein_g"?: number | null,"protein_pct"?: number | null,"scc"?: number | null,"test_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "milk_test_results_goat_id_herd_id_fkey"
      columns: ["goat_id","herd_id"]
isOneToOne: false
      referencedRelation: "goats"
      referencedColumns: ["id","herd_id"]
    },{
      foreignKeyName: "milk_test_results_test_id_herd_id_fkey"
      columns: ["test_id","herd_id"]
isOneToOne: false
      referencedRelation: "milk_tests"
      referencedColumns: ["id","herd_id"]
    }
                  ]
                },"milk_tests": {
                  Row: {
                    "created_at": string,"created_by": string | null,"herd_id": string,"id": string,"kind": Database["public"]['Enums']["milk_test_kind"],"lab": string | null,"notes": string | null,"tested_on": string,"tester": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"herd_id": string,"id"?: string,"kind"?: Database["public"]['Enums']["milk_test_kind"],"lab"?: string | null,"notes"?: string | null,"tested_on": string,"tester"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"herd_id"?: string,"id"?: string,"kind"?: Database["public"]['Enums']["milk_test_kind"],"lab"?: string | null,"notes"?: string | null,"tested_on"?: string,"tester"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "milk_tests_herd_id_fkey"
      columns: ["herd_id"]
isOneToOne: false
      referencedRelation: "herds"
      referencedColumns: ["id"]
    }
                  ]
                },"milk_weights": {
                  Row: {
                    "goat_id": string,"herd_id": string,"id": string,"milked_on": string,"milking": number,"note": string | null,"portions_g": (number)[] | null,"recorded_at": string,"recorded_by": string | null,"weight_g": number
                  }
                  ComputedFields: never
                  Insert: {
                    "goat_id": string,"herd_id": string,"id"?: string,"milked_on": string,"milking": number,"note"?: string | null,"portions_g"?: (number)[] | null,"recorded_at"?: string,"recorded_by"?: string | null,"weight_g": number
                  }
                  Update: {
                    "goat_id"?: string,"herd_id"?: string,"id"?: string,"milked_on"?: string,"milking"?: number,"note"?: string | null,"portions_g"?: (number)[] | null,"recorded_at"?: string,"recorded_by"?: string | null,"weight_g"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "milk_weights_goat_id_herd_id_fkey"
      columns: ["goat_id","herd_id"]
isOneToOne: false
      referencedRelation: "goats"
      referencedColumns: ["id","herd_id"]
    }
                  ]
                },"pregnancy_checks": {
                  Row: {
                    "breeding_id": string,"checked_on": string,"created_at": string,"created_by": string | null,"herd_id": string,"id": string,"method": Database["public"]['Enums']["pregnancy_check_method"],"notes": string | null,"result": Database["public"]['Enums']["pregnancy_result"]
                  }
                  ComputedFields: never
                  Insert: {
                    "breeding_id": string,"checked_on": string,"created_at"?: string,"created_by"?: string | null,"herd_id": string,"id"?: string,"method": Database["public"]['Enums']["pregnancy_check_method"],"notes"?: string | null,"result": Database["public"]['Enums']["pregnancy_result"]
                  }
                  Update: {
                    "breeding_id"?: string,"checked_on"?: string,"created_at"?: string,"created_by"?: string | null,"herd_id"?: string,"id"?: string,"method"?: Database["public"]['Enums']["pregnancy_check_method"],"notes"?: string | null,"result"?: Database["public"]['Enums']["pregnancy_result"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "pregnancy_checks_breeding_id_herd_id_fkey"
      columns: ["breeding_id","herd_id"]
isOneToOne: false
      referencedRelation: "breedings"
      referencedColumns: ["id","herd_id"]
    }
                  ]
                },"treatments": {
                  Row: {
                    "created_at": string,"created_by": string | null,"dose": string | null,"ended_on": string | null,"goat_id": string,"herd_id": string,"id": string,"lot_number": string | null,"medication": string,"milk_withdrawal_days": number,"notes": string | null,"reason": string | null,"route": Database["public"]['Enums']["treatment_route"] | null,"started_on": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"dose"?: string | null,"ended_on"?: string | null,"goat_id": string,"herd_id": string,"id"?: string,"lot_number"?: string | null,"medication": string,"milk_withdrawal_days"?: number,"notes"?: string | null,"reason"?: string | null,"route"?: Database["public"]['Enums']["treatment_route"] | null,"started_on": string
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"dose"?: string | null,"ended_on"?: string | null,"goat_id"?: string,"herd_id"?: string,"id"?: string,"lot_number"?: string | null,"medication"?: string,"milk_withdrawal_days"?: number,"notes"?: string | null,"reason"?: string | null,"route"?: Database["public"]['Enums']["treatment_route"] | null,"started_on"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "treatments_goat_id_herd_id_fkey"
      columns: ["goat_id","herd_id"]
isOneToOne: false
      referencedRelation: "goats"
      referencedColumns: ["id","herd_id"]
    }
                  ]
                }
          }
          Views: {
            "milk_day_totals": {
                  Row: {
                    "goat_id": string | null,"has_am": boolean | null,"has_pm": boolean | null,"herd_id": string | null,"is_day_total": boolean | null,"milked_on": string | null,"milkings": number | null,"total_g": number | null
                  }
                  ComputedFields: never
                  Relationships: [
                    {
      foreignKeyName: "milk_weights_goat_id_herd_id_fkey"
      columns: ["goat_id","herd_id"]
isOneToOne: false
      referencedRelation: "goats"
      referencedColumns: ["id","herd_id"]
    }
                  ]
                }
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
"before_user_created":
{ Args: { "event": Json }; Returns: Json
                           },
"clear_milking":
{ Args: { "p_goat_id": string,"p_milked_on": string,"p_milking": number }; Returns: undefined
                           },
"create_herd":
{ Args: { "herd_name": string }; Returns: {
              "created_at": string,
"created_by": string | null,
"id": string,
"logo": string | null,
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
"record_kidding":
{ Args: { "p_breeding_id"?: string,"p_difficulty"?: Database["public"]['Enums']["kidding_difficulty"],"p_doe_id": string,"p_kidded_on": string,"p_kids"?: Json,"p_notes"?: string,"p_start_lactation"?: boolean }; Returns: {
              "breeding_id": string | null,
"created_at": string,
"created_by": string | null,
"difficulty": Database["public"]['Enums']["kidding_difficulty"],
"doe_id": string,
"herd_id": string,
"id": string,
"kidded_on": string,
"notes": string | null
            }
                          SetofOptions: {
        from: "*"
        to: "kiddings"
        isOneToOne: true
        isSetofReturn: false
      } },
"record_milking":
{ Args: { "p_goat_id": string,"p_milked_on": string,"p_milking": number,"p_note"?: string,"p_portions_g"?: (number)[],"p_weight_g": number }; Returns: {
              "goat_id": string,
"herd_id": string,
"id": string,
"milked_on": string,
"milking": number,
"note": string | null,
"portions_g": (number)[] | null,
"recorded_at": string,
"recorded_by": string | null,
"weight_g": number
            }[]
                          SetofOptions: {
        from: "*"
        to: "milk_weights"
        isOneToOne: false
        isSetofReturn: true
      } },
"set_primary_photo":
{ Args: { "photo_id": string }; Returns: undefined
                           },
"slugify":
{ Args: { "value": string }; Returns: string
                           },
"storage_path_herd":
{ Args: { "path": string }; Returns: string
                           }
          }
          Enums: {
            "breeding_method": "hand"|"pen"|"ai","finance_kind": "income"|"expense","goat_sex": "doe"|"buck"|"wether","goat_status": "active"|"for_sale"|"sold"|"deceased"|"reference","herd_role": "owner"|"helper","horn_status": "disbudded"|"polled"|"horned"|"unknown","kid_outcome": "alive"|"stillborn"|"died","kidding_difficulty": "unassisted"|"assisted"|"vet","milk_test_kind": "dhir"|"one_day"|"owner","pregnancy_check_method": "blood"|"ultrasound"|"observation","pregnancy_result": "pregnant"|"open"|"unsure","test_result": "negative"|"positive"|"inconclusive"|"pending","treatment_route": "oral"|"subq"|"im"|"iv"|"topical"|"intramammary"|"other","weight_unit": "lb"|"kg"
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
            "breeding_method": ["hand", "pen", "ai"],"finance_kind": ["income", "expense"],"goat_sex": ["doe", "buck", "wether"],"goat_status": ["active", "for_sale", "sold", "deceased", "reference"],"herd_role": ["owner", "helper"],"horn_status": ["disbudded", "polled", "horned", "unknown"],"kid_outcome": ["alive", "stillborn", "died"],"kidding_difficulty": ["unassisted", "assisted", "vet"],"milk_test_kind": ["dhir", "one_day", "owner"],"pregnancy_check_method": ["blood", "ultrasound", "observation"],"pregnancy_result": ["pregnant", "open", "unsure"],"test_result": ["negative", "positive", "inconclusive", "pending"],"treatment_route": ["oral", "subq", "im", "iv", "topical", "intramammary", "other"],"weight_unit": ["lb", "kg"]
          }
        }
} as const
