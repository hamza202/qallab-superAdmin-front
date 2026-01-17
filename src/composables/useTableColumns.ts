import { ref, computed } from 'vue'
import { useApi } from '@/composables/useApi'

export interface TableHeader {
  key: string
  title: string
  sortable?: boolean
  width?: string
}

export function useTableColumns(tableName: string) {
  const api = useApi()

  const allHeaders = ref<TableHeader[]>([])
  const shownHeaders = ref<TableHeader[]>([])
  const updatingHeaders = ref(false)
  const showHeadersMenu = ref(false)

  // Computed checked headers for menu
  const headerCheckStates = computed(() => {
    const states: Record<string, boolean> = {}
    allHeaders.value.forEach(header => {
      states[header.key] = shownHeaders.value.some(sh => sh.key === header.key)
    })
    return states
  })

  // Computed visible headers for DataTable
  const visibleHeaders = computed(() => shownHeaders.value)

  // Initialize headers from API response
  const initHeaders = (headers: TableHeader[], shown: TableHeader[]) => {
    allHeaders.value = headers.filter(h => h.key !== 'id' && h.key !== 'actions')
    shownHeaders.value = shown.filter(h => h.key !== 'id' && h.key !== 'actions')
  }

  // Toggle header visibility
  const toggleHeader = async (headerKey: string) => {
    const isCurrentlyShown = shownHeaders.value.some(h => h.key === headerKey)

    if (isCurrentlyShown) {
      shownHeaders.value = shownHeaders.value.filter(h => h.key !== headerKey)
    } else {
      const headerToAdd = allHeaders.value.find(h => h.key === headerKey)
      if (headerToAdd) {
        shownHeaders.value.push(headerToAdd)
      }
    }

    await updateHeadersOnServer()
  }

  // Update headers on server
  const updateHeadersOnServer = async () => {
    try {
      updatingHeaders.value = true
      const headerKeys = shownHeaders.value.map(h => h.key)

      const formData = new FormData()
      formData.append('table', tableName)
      headerKeys.forEach((header, index) => {
        formData.append(`header[${index}]`, header)
      })

      await api.post('/headers', formData)
    } catch (err: any) {
      console.error('Error updating headers:', err)
      throw err
    } finally {
      updatingHeaders.value = false
    }
  }

  return {
    allHeaders,
    shownHeaders,
    visibleHeaders,
    updatingHeaders,
    showHeadersMenu,
    headerCheckStates,
    initHeaders,
    toggleHeader,
  }
}
