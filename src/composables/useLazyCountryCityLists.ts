import { useApi } from "@/composables/useApi";

export type CountryCityListRow = { id: number; name: string };

export type LazyCountryCityFetchResult = {
  data: CountryCityListRow[];
  next_cursor: string | null;
};

/**
 * Server-side list fetchers for /countries/list and /cities/list with lazy_loading: true.
 * Use with SelectInput :server-side="true" :fetch-function="...".
 */
export function useLazyCountryCityLists() {
  const api = useApi();

  const buildCountriesFetcher = (options: {
    getSelectedCountryId: () => number | null | undefined;
    /** When false, skip waiting (default true in edit flows). */
    waitForReady?: () => Promise<void> | void;
  }) => {
    return async (
      search = "",
      cursor?: string,
      perPage = 15
    ): Promise<LazyCountryCityFetchResult> => {
      await options.waitForReady?.();
      const params: Record<string, string | number | boolean> = {
        per_page: perPage,
        lazy_loading: true,
      };
      if (search) params.name = search;
      if (cursor) params.cursor = cursor;
      const sid = options.getSelectedCountryId();
      if (sid != null) params.order_by_id = sid;

      const res = await api.get<{
        data?: CountryCityListRow[];
        pagination?: { next_cursor?: string | null };
      }>("/countries/list", { params });

      return {
        data: res.data || [],
        next_cursor: res.pagination?.next_cursor ?? null,
      };
    };
  };

  const buildCitiesFetcher = (options: {
    getCountryId: () => number | null | undefined;
    getSelectedCityId: () => number | null | undefined;
    waitForReady?: () => Promise<void> | void;
    /**
     * When true (default), return empty until a country is chosen.
     * Set false for filters that list all cities.
     */
    requireCountry?: boolean;
    /** Dynamic version of requireCountry (e.g. from props). */
    getRequireCountry?: () => boolean;
  }) => {
    return async (
      search = "",
      cursor?: string,
      perPage = 15
    ): Promise<LazyCountryCityFetchResult> => {
      await options.waitForReady?.();
      const countryId = options.getCountryId();
      const needCountry =
        options.getRequireCountry != null
          ? options.getRequireCountry()
          : options.requireCountry !== false;
      if (needCountry && countryId == null) {
        return { data: [], next_cursor: null };
      }

      const params: Record<string, string | number | boolean> = {
        per_page: perPage,
        lazy_loading: true,
      };
      if (search) params.name = search;
      if (cursor) params.cursor = cursor;
      if (countryId != null) {
        params.country_id = Number(countryId);
      }
      const cid = options.getSelectedCityId();
      if (cid != null) params.order_by_id = cid;

      const res = await api.get<{
        data?: CountryCityListRow[];
        pagination?: { next_cursor?: string | null };
      }>("/cities/list", { params });

      return {
        data: res.data || [],
        next_cursor: res.pagination?.next_cursor ?? null,
      };
    };
  };

  return { api, buildCountriesFetcher, buildCitiesFetcher };
}
