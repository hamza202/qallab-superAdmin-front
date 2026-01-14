import { defineStore } from "pinia";

export const useDateFormatStore = defineStore("dateFormat", () => {
  const formatDate = (
    dateString: string | null | undefined,
    options?: {
      includeTime?: boolean;
      format?: "short" | "long" | "medium";
    }
  ): string => {
    if (!dateString) return "-";

    try {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        return "-";
      }

      const { includeTime = true, format = "medium" } = options || {};

      if (format === "short") {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }

      if (format === "long") {
        return date.toLocaleDateString("ar-SA", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: includeTime ? "2-digit" : undefined,
          minute: includeTime ? "2-digit" : undefined,
        });
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      if (!includeTime) {
        return `${year}-${month}-${day}`;
      }

      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "-";
    }
  };

  return {
    formatDate,
  };
});
