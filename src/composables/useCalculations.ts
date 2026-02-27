import { ref, computed, type Ref } from "vue";
import { useApi } from "@/composables/useApi";

export interface CalculationItem {
  item_id: number;
  quantity?: number | null;
  price_per_unit?: number | null;
  unit_price?: number | null;
  discount_type?: number | null;
  discount_val?: number | null;
  discount?: number | null;
  [key: string]: unknown;
}

export interface CalculationItemResult {
  item_id: number;
  quantity: number;
  price_per_unit: number;
  discount_type: number;
  discount_val: number;
  subtotal_before_discount: number;
  discount_amount: number;
  subtotal_after_discount: number;
  total_tax: number;
  subtotal_after_tax: number;
  gross: number;
  discount: number;
  taxable: number;
  vat: number;
  final: number;
}

export interface CalculationTotals {
  total_quantity: number;
  total_gross: number;
  total_discount: number;
  total_taxable: number;
  total_vat: number;
  final_total: number;
  total_out_taxes: number;
  total_taxes: number;
}

export const useCalculations = <T extends CalculationItem>(
  items: Ref<T[]>,
) => {
  const api = useApi();

  const totals = ref<CalculationTotals | null>(null);
  const vatRate = ref<number | null>(null);
  const isCalculating = ref(false);

  const fetchCalculations = async (): Promise<Record<string, CalculationItemResult> | null> => {
    const currentItems = items.value;
    if (currentItems.length === 0) {
      totals.value = null;
      vatRate.value = null;
      return null;
    }

    isCalculating.value = true;
    try {
      const payload = {
        items: currentItems.map((item) => ({
          item_id: item.item_id,
          quantity: Number(item.quantity) || 0,
          price_per_unit: Number(item.price_per_unit ?? item.unit_price) || 0,
          discount_type: item.discount_type ?? 1,
          discount_val: Number(item.discount_val ?? item.discount) || 0,
        })),
      };

      const res = await api.post<any>("/calculations", payload);
      const data = res.data;

      if (data) {
        if (data.totals) {
          totals.value = data.totals;
        }
        if (data.vat_rate != null) {
          vatRate.value = data.vat_rate;
        }
        return data.items ?? null;
      }
      return null;
    } catch (e) {
      console.error("Error fetching calculations:", e);
      return null;
    } finally {
      isCalculating.value = false;
    }
  };

  const summaryTotals = computed(() => {
    const t = totals.value;
    if (t) {
      return {
        subtotalBeforeDiscount: t.total_gross,
        totalDiscount: t.total_discount,
        subtotalAfterDiscount: t.total_taxable,
        totalTaxAmount: t.total_vat,
        finalTotal: t.final_total,
      };
    }
    return {
      subtotalBeforeDiscount: 0,
      totalDiscount: 0,
      subtotalAfterDiscount: 0,
      totalTaxAmount: 0,
      finalTotal: 0,
    };
  });

  return {
    totals,
    vatRate,
    isCalculating,
    fetchCalculations,
    summaryTotals,
  };
};
