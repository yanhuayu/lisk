\c lisk_test;
DROP DATABASE lisk_main;
CREATE DATABASE lisk_main OWNER sean;
GRANT ALL PRIVILEGES ON DATABASE lisk_main to sean;
\c lisk_main;
CREATE EXTENSION pgcrypto;