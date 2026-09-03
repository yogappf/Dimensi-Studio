cat << 'INNER_EOF' >> src/types.ts

export interface ReviewItem {
  id: string; // usually the orderId
  clientName: string;
  packageName: string;
  rating: number;
  review: string;
  reviewedAt: string;
  showInTestimonials?: boolean;
}
INNER_EOF
