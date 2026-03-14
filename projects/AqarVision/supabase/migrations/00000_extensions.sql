-- M01 Auth & Identity — Extensions
-- Required extensions for AqarVision

create extension if not exists "postgis";       -- geographic data types & spatial queries
create extension if not exists "btree_gist";    -- GiST index operator classes for exclusion constraints
create extension if not exists "pg_trgm";       -- trigram matching for fuzzy text search
