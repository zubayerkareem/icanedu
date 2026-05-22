import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/products/types";

export interface UseProductsParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface UseProductsResult {
  items: Product[];
  total: number;
  totalPages: number;
}

export function useProducts(params: UseProductsParams = {}) {
  const { search = "", page = 1, pageSize = 9 } = params;

  return useQuery<UseProductsResult>({
    queryKey: ["products", { search, page, pageSize }],
    staleTime: 30 * 1000,
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*", { count: "exact" })
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (search.trim()) {
        query = query.ilike("name", `%${search.trim()}%`);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      const total = count ?? 0;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));

      return { items: (data ?? []) as Product[], total, totalPages };
    },
  });
}

export function useProduct(idOrSlug: string | undefined) {
  return useQuery<Product | null>({
    queryKey: ["product", idOrSlug],
    enabled: !!idOrSlug,
    staleTime: 60 * 1000,
    queryFn: async () => {
      if (!idOrSlug) return null;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
      const { data, error } = isUuid
        ? await supabase.from("products").select("*").eq("id", idOrSlug).maybeSingle()
        : await supabase.from("products").select("*").eq("slug", idOrSlug).maybeSingle();
      if (error) throw error;
      return (data as Product) ?? null;
    },
  });
}

export function useRelatedProducts(product: Product | null | undefined, limit = 4) {
  return useQuery<Product[]>({
    queryKey: ["related-products", product?.id, product?.category, limit],
    enabled: !!product,
    staleTime: 60 * 1000,
    queryFn: async () => {
      if (!product?.category) return [];
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_published", true)
        .eq("category", product.category)
        .neq("id", product.id)
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as Product[];
    },
  });
}
