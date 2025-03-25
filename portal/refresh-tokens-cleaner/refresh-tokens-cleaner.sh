#!/usr/bin/env bash
sqlite3 $WISHLIST_DB_PATH <<< "DELETE FROM refresh_tokens WHERE expires < $(date +%s)"
