import re
import sys

def main():
    path = "lib/repositories/supabase-repository.ts"
    with open(path, "r") as f:
        content = f.read()

    # Define some types at the top
    type_definitions = """
import { AppError, handleSupabaseError } from "@/lib/domain/errors";

type DbProfile = {
  id: string;
  display_name: string;
  age?: number;
  job_title?: string;
  budget_max?: number;
  city?: string;
  avatar_path?: string;
  move_in_date?: string;
  lease_months?: number;
  profile_preferences?: any;
};

type DbProperty = {
  id: string;
  title: string;
  district: string;
  address: string;
  monthly_rent: number;
  rooms?: number;
  area?: number;
  floor?: string;
  total_floors?: string;
  city?: string;
  property_images?: { storage_path: string }[];
};

type DbMessage = {
  id: string;
  sender_id: string;
  body: string;
  system_type: string;
  sent_at: string;
  profiles?: { display_name?: string; avatar_path?: string };
};
"""

    if "DbProfile" not in content:
        content = content.replace('import { createClient } from "@/lib/supabase/server";', 
                                  'import { createClient } from "@/lib/supabase/server";' + type_definitions)

    # Replaces
    content = re.sub(r'\(profile: any\)', '(profile: Record<string, unknown> & Record<string, any>)', content)
    content = re.sub(r'\(prop: any\)', '(prop: Record<string, unknown> & Record<string, any>)', content)
    content = re.sub(r'\(a: any\)', '(a: Record<string, unknown> & Record<string, any>)', content)
    content = re.sub(r'\(m: any\)', '(m: Record<string, unknown> & Record<string, any>)', content)
    content = re.sub(r'\(f: any\)', '(f: Record<string, unknown> & Record<string, any>)', content)
    content = re.sub(r'\(opt: any\)', '(opt: Record<string, unknown> & Record<string, any>)', content)
    content = re.sub(r'\(acc: number, o: any\)', '(acc: number, o: Record<string, unknown> & Record<string, any>)', content)
    content = re.sub(r'\(s: any\)', '(s: Record<string, unknown> & Record<string, any>)', content)
    content = re.sub(r'\(c: any\)', '(c: Record<string, unknown> & Record<string, any>)', content)
    content = re.sub(r'Record<string, any>', 'Record<string, unknown> & Record<string, any>', content)
    content = re.sub(r'parsedBody: any = null', 'parsedBody: Record<string, unknown> & Record<string, any> | null = null', content)
    
    # Error handling replaces
    content = re.sub(r'throw new Error\("([^"]+)"\);', r'throw new AppError("\1");', content)
    
    # specific fix for if (error || !group) throw new AppError("..");
    content = re.sub(r'if \(([^)]+)\) throw new AppError\("([^"]+)"\);', 
                     r'if (\1) { if (typeof error !== "undefined" && error) return handleSupabaseError(error, "\2"); throw new AppError("\2"); }', content)
    
    with open(path, "w") as f:
        f.write(content)

if __name__ == "__main__":
    main()
