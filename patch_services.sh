sed -i 's/AuditLogItem }/AuditLogItem, ReviewItem }/g' src/firebase/services.ts
sed -i '/const AUDIT_LOGS_COLLECTION/a const REVIEWS_COLLECTION = '\''reviews'\'';\nconst REVIEWS_STORAGE_KEY = '\''dimensi_reviews_v1'\'';' src/firebase/services.ts
