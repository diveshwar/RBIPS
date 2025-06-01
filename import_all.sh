#!/bin/bash

SUPABASE_CONN="postgresql://postgres:Diveshwar2004@db.vayrhxeejgxqekbxrbhi.supabase.co:5432/postgres"
   
#psql "$SUPABASE_CONN" -f my-app/Database/profiles_rows.sql
psql "$SUPABASE_CONN" -f my-app/Database/exam_sessions_rows.sql
psql "$SUPABASE_CONN" -f my-app/Database/admin_warnings_rows.sql
psql "$SUPABASE_CONN" -f my-app/Database/exam_violations_rows.sql
psql "$SUPABASE_CONN" -f my-app/Database/behavior_logs_rows.sql
psql "$SUPABASE_CONN" -f my-app/Database/questions_rows.sql
psql "$SUPABASE_CONN" -f my-app/Database/typing_analysis_rows.sql
psql "$SUPABASE_CONN" -f my-app/Database/typing_speeds_rows.sql

echo "All SQL files imported!" 