sed -i '/const \[auditLogs, setAuditLogs\] = useState<AuditLogItem\[\]>(\[\]);/a \  const \[reviews, setReviews\] = useState<ReviewItem\[\]>(\[\]);' src/App.tsx
