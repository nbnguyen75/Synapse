#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
    CREATE DATABASE auth_db;
    CREATE DATABASE notes_db;
    CREATE DATABASE ai_db;
EOSQL