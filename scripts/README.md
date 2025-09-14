This folder contains SQL scripts used to initialize and seed the database.

Run order:
1. 001_create_tables.sql - creates tables and constraints
2. 002_seed_data.sql - inserts example data (agents, sample cases)

Usage:
- Use psql or your preferred Postgres client to run these scripts against your database.
- Example:
  psql <DATABASE_URL> -f scripts/001_create_tables.sql
  psql <DATABASE_URL> -f scripts/002_seed_data.sql

Security notes:
- Replace placeholder password hashes with securely-generated hashes.
- Review all scripts before running in production.
