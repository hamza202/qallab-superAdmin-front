<template>
    <div class="invoice-print-page" dir="rtl">
        <div class="print-actions no-print">
            <button type="button" class="print-btn" @click="handlePrint">
                {{ t('purchases.shared.print.printButton') }}
            </button>
        </div>

        <div v-if="isLoading" class="print-loading">
            <v-progress-circular indeterminate color="primary" size="64" />
        </div>

        <div v-else-if="loadFailed" class="print-error no-print">
            <p>{{ t('purchases.shared.print.loadFailed') }}</p>
        </div>

        <div v-else-if="!isLoading && !loadFailed" class="invoice-content">
            <!-- ===== SECTION 1: Header card with company + logo ===== -->
            <div class="section-card">
                <div class="header-top">
                    <div class="company-col" dir="rtl">
                        <div class="co-name">{{ customer?.full_name ?? 'شركة قلاب' }}</div>
                        <!-- <div class="co-line">
                            هاتف: {{ supplier?.mobile ?? '+966 599 1454323' }} · البريد: {{ supplier?.email ?? 'info@qallab.sa' }}
                        </div> -->
                        <div class="co-line">
                            الرقم الوطني الموحد : {{ customer?.unified_login_id ?? '—' }}
                        </div>
                        <div class="co-line">
                            الرقم الضريبي: {{ customer?.tax_number ?? '—' }} · السجل التجاري:
                            {{ customer?.commercial_register ?? '—' }}
                        </div>
                    </div>
                    <img :src="logoImg" alt="Qallab" class="header-logo" />
                </div>
                <div class="meta-strip" dir="rtl">
                    <span class="meta-item">رقم طلبية المشتريات : <strong>{{ orderNumber }}</strong></span>
                    <span class="meta-item">تاريخ الطلبية : <strong>{{ orderDate }}</strong></span>
                </div>
            </div>

            <!-- ===== Introduction section ===== -->
            <div class="intro-block" dir="rtl">
                <p class="intro-body" v-html="introBodyHtml"></p>
            </div>

            <!-- ===== Items Table ===== -->
            <div class="table-wrapper">
                <table class="items-table">
                    <thead>
                        <tr>
                            <th class="th-first"><span class="th-ar">البند</span></th>
                            <th><span class="th-ar">الوحدة</span></th>
                            <th><span class="th-ar">الكمية</span></th>
                            <th><span class="th-ar">سعر الوحدة</span></th>
                            <th class="th-last"><span class="th-ar">السعر الإجمالي</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(row, idx) in lineItems" :key="idx">
                            <td class="td-name">{{ row.description }}</td>
                            <td>{{ row.unit }}</td>
                            <td>{{ row.quantity }}</td>
                            <td>{{ row.unit_price }} </td>
                            <td class="td-subtotal">{{ row.total }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- ===== Subtotals section ===== -->
            <div class="totals-table">
                <div class="total-row">
                    <span class="total-label">الإجمالي غير شامل ضريبة القيمة المضافة</span>
                    <span class="total-val"><span v-html="rialIcon" class="sar-icon" /> {{ formatCurrency(subtotal) }}</span>
                </div>
                <div class="total-row">
                    <span class="total-label">ضريبة القيمة المضافة</span>
                    <span class="total-val"><span v-html="rialIcon" class="sar-icon" /> {{ formatCurrency(vatAmount) }}</span>
                </div>
                <div class="total-row">
                    <span class="total-label">الإجمالي شامل ضريبة القيمة المضافة</span>
                    <span class="total-val"><span v-html="rialIcon" class="sar-icon" /> {{ formatCurrency(grandTotal) }}</span>
                </div>
                <div class="total-row total-row--words">
                    <span class="total-label">المجموع الكلي بالكلمات</span>
                    <span class="total-val total-val--words">{{ grandTotalWords }}</span>
                </div>
            </div>

            <!-- ===== Notes section ===== -->
            <div class="notes-section" dir="rtl">
                <p class="notes-heading">شروط عامة :</p>
                <ul class="notes-list">
                    <li v-for="(note, i) in generalTerms" :key="'g' + i" v-html="note"></li>
                </ul>
                <div class="payment-method-inline">
                    <span class="payment-title">طريقة السداد :</span>
                    <span class="payment-text" v-html="paymentMethodHtml"></span>
                </div>
                <template v-if="otherTerms.length">
                    <p class="notes-heading notes-heading--secondary">شروط أخرى :</p>
                    <ul class="notes-list">
                        <li v-for="(note, i) in otherTerms" :key="'o' + i" v-html="note"></li>
                    </ul>
                </template>
            </div>

            <p class="closing-line" dir="rtl">وتفضلوا بقبول فائق الاحترام والتحية</p>

            <!-- ===== Signature strip ===== -->
            <div class="sign-strip" dir="rtl">
                <div class="sign-col">
                    <div class="sign-label">اسم العميل</div>
                    <div class="sign-value">{{ customer?.full_name ?? '—' }}</div>
                </div>
                <div class="sign-col sign-col--stamp">
                    <div class="sign-label">توقيع وختم العميل</div>
                    <!-- <img :src="logoBlackImg" alt="Qallab stamp" class="stamp-img" /> -->
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { useNotification } from '@/composables/useNotification'
import { rialIcon } from '@/components/icons/globalIcons'
import logoSvgRaw from '@/assets/logo.svg?raw'
import logoBlackSvgRaw from '@/assets/logo-black.svg?raw'

const { t } = useI18n()

const toDataUri = (svg: string) =>
    `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`

const logoImg = toDataUri(logoSvgRaw)
const logoBlackImg = toDataUri(logoBlackSvgRaw)

const route = useRoute()
const api = useApi()
const { error } = useNotification()

interface OrderLine {
    description: string
    unit: string
    quantity: string
    unit_price: string
    total: string
}

interface OrderPrintDetail {
    supplier?: {
        full_name?: string
        mobile?: string | null
        email?: string | null
        tax_number?: number | string | null
        commercial_register?: number | string | null
        logo_url?: string | null
    }
    customer?: {
        full_name?: string
        mobile?: string | null
        email?: string | null
        tax_number?: number | string | null
        commercial_register?: number | string | null
        unified_login_id?: number | string | null
    }
    subject?: {
        code?: string
        project_name?: string
    }
    locations?: {
        target_location?: string | null
        source_location?: string | null
    }
    items?: Array<{
        item_name?: string
        unit_name?: string
        quantity?: number | string
        price_per_unit?: number | string | null
        line_total?: number | string | null
    }>
    totals?: {
        subtotal_excluding_vat?: number | string | null
        vat_rate?: number | string | null
        vat_amount?: number | string | null
        grand_total_including_vat?: number | string | null
        grand_total_in_words?: string | null
    }
    invoice_interval?: number | string | null
    payment_term_no?: number | string | null
    actual_execution_duration?: number | string | null
    supply_start_date?: string | null
    po_datetime?: string
    other_terms?: string[] | null
    sq_code?: string | null
}

const isLoading = ref(false)
const loadFailed = ref(false)
const detail = ref<OrderPrintDetail | null>(null)

const routeId = computed(() => (route.params.id as string) || '')

const supplier = computed(() => detail.value?.supplier ?? null)
const customer = computed(() => detail.value?.customer ?? null)
const subject = computed(() => detail.value?.subject ?? null)
const locations = computed(() => detail.value?.locations ?? null)
const totals = computed(() => detail.value?.totals ?? null)

const PLACEHOLDER_LINES: OrderLine[] = [
    { description: '[وصف البند]', unit: 'طن', quantity: '—', unit_price: '—', total: '—' },
    { description: '[وصف البند]', unit: 'طن', quantity: '—', unit_price: '—', total: '—' },
]

function normalizeDetail(body: unknown): OrderPrintDetail | null {
    if (!body || typeof body !== 'object') return null
    const o = body as Record<string, unknown>
    if (o.data && typeof o.data === 'object') return o.data as OrderPrintDetail
    return body as OrderPrintDetail
}

const orderNumber = computed(() => {
    const c = subject.value?.code
    return (c && String(c).trim()) || `#${routeId.value.slice(0, 8)}`
})

const orderDate = computed(() => {
    const d = detail.value?.po_datetime
    if (!d) return '—'
    try {
        const dt = new Date(d)
        if (isNaN(dt.getTime())) return String(d)
        const s = dt.toLocaleDateString('en-US-u-ca-gregory', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        })
        return s.replace(/\//g, '\\')
    } catch {
        return String(d)
    }
})

const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const accent = (s: string) => `<span class="blue-accent">${escapeHtml(s)}</span>`

const introBodyHtml = computed(() => {
    const quotationCode = (detail.value?.sq_code && String(detail.value.sq_code).trim()) || '—'
    const orderDateVal = orderDate.value
    const supplierName = supplier.value?.full_name ?? '—'

    return `<span class="intro-line intro-line--greeting">السادة / ${accent(supplierName)} المحترمين</span><span class="intro-line intro-line--salam">السلام عليكم ورحمة الله وبركاته،</span><span class="intro-line">إشارة إلى عرض السعر المقدم من قبلكم رقم ${accent(quotationCode)} بتاريخ ${accent(orderDateVal)} نعمدكم بالآتي حسب البنود أدناه :</span>`
})

const lineItems = computed((): OrderLine[] => {
    const items = detail.value?.items
    if (!items?.length) return PLACEHOLDER_LINES
    return items.map((it) => ({
        description: String(it.item_name ?? '—'),
        unit: String(it.unit_name ?? '—'),
        quantity: it.quantity != null ? String(it.quantity) : '—',
        unit_price: formatMoney(it.price_per_unit),
        total: formatMoney(it.line_total),
    }))
})

const subtotal = computed(() => totals.value?.subtotal_excluding_vat ?? '—')
const vatAmount = computed(() => totals.value?.vat_amount ?? '—')
const grandTotal = computed(() => totals.value?.grand_total_including_vat ?? '—')
const grandTotalWords = computed(
    () => totals.value?.grand_total_in_words ?? '[المبلغ كتابة]'
)

const paymentMethodHtml = computed(() => {
    const invoiceDays = detail.value?.invoice_interval
    const paymentDays = detail.value?.payment_term_no
    const fmt = (v: unknown) => {
        if (v == null || v === '') return '—'
        const n = Number(v)
        return Number.isFinite(n) ? String(n) : String(v)
    }
    return `يتم رفع مستخلص بعد مدة ${accent(`${fmt(invoiceDays)} يوم`)} على أن يتم سدادها بعد ${accent(`${fmt(paymentDays)} يوم`)} .`
})

const generalTerms = computed(() => {
    const executionDuration = detail.value?.actual_execution_duration
    const supplyDate = detail.value?.supply_start_date

    const fmt = (v: unknown) => {
        if (v == null || v === '') return '—'
        const n = Number(v)
        return Number.isFinite(n) ? String(n) : String(v)
    }

    const formatDate = (d: string | null | undefined) => {
        if (!d) return '—'
        try {
            const dt = new Date(d)
            if (isNaN(dt.getTime())) return String(d)
            return dt.toLocaleDateString('ar-SA', { year: 'numeric', month: '2-digit', day: '2-digit' })
        } catch {
            return String(d)
        }
    }

    return [
        `مدة تنفيذ طلبية الشراء في الظروف الطبيعية <strong>${fmt(executionDuration)} يوم</strong>`,
        `تاريخ بداية التوريد <strong>${formatDate(supplyDate)}</strong> او يمكن تغييره بالتنسيق مع مبيعات منصة قلاب .`,
        'يتم احتساب وفوتورة الكميات <strong>(الموردة / المنقولة)</strong> حسب سندات الاستلام .',
    ]
})

const otherTerms = computed<string[]>(() => {
    const list = detail.value?.other_terms
    if (!Array.isArray(list)) return []
    return list.map((t) => String(t ?? '').trim()).filter(Boolean)
})

function formatMoney(value: number | string | null | undefined): string {
    if (value == null || value === '') return '—'
    const n = Number(value)
    if (isNaN(n)) return String(value)
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatCurrency(value: number | string | null) {
    if (value == null || value === '') return '—'
    return formatMoney(value)
}

const waitForImages = (): Promise<void> => {
    return new Promise((resolve) => {
        const imgs = document.querySelectorAll('.invoice-content img')
        if (imgs.length === 0) return resolve()
        const promises = Array.from(imgs).map((img) => {
            if ((img as HTMLImageElement).complete) return Promise.resolve()
            return new Promise<void>((r) => {
                img.addEventListener('load', () => r())
                img.addEventListener('error', () => r())
                setTimeout(r, 3000)
            })
        })
        Promise.all(promises).then(() => resolve())
    })
}

const fetchDetail = async () => {
    if (!routeId.value) return
    isLoading.value = true
    loadFailed.value = false
    try {
        const res = await api.get<unknown>(
            `/purchases/orders/fuels/${routeId.value}/detail`
        )
        detail.value = normalizeDetail(res)
        await nextTick()
        await waitForImages()
        if (window.self !== window.top) {
            window.parent.postMessage({ type: 'order-fuels-print-ready' }, '*')
        }
    } catch (e: unknown) {
        console.error('Purchase order print detail failed:', e)
        loadFailed.value = true
        const err = e as { response?: { data?: { message?: string } } }
        error(err?.response?.data?.message || t('purchases.shared.print.loadFailed'))
    } finally {
        isLoading.value = false
    }
}

const handlePrint = () => {
    window.print()
}

onMounted(() => {
    fetchDetail()
})
</script>

<style scoped>
@page {
    size: A4;
    margin: 0;
}

.invoice-print-page {
    min-height: 100vh;
    font-family: 'Cairo', 'Tajawal', 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
}

.print-actions {
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 100;
}

.print-btn {
    padding: 10px 28px;
    background: #1570ef;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(21, 112, 239, 0.25);
    transition: all 0.2s ease;
}

.print-btn:hover {
    background: #0b5bc4;
    box-shadow: 0 4px 12px rgba(21, 112, 239, 0.35);
}

.print-loading,
.print-error {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    padding: 24px;
}

.invoice-content {
    max-width: 900px;
    margin: 0 auto;
    background: #ffffff;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 20px 0;
}

.section-card {
    margin: 0 36px 16px;
    padding: 20px 36px 0;
    background-color: #f9fafb;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
}

.header-top {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    direction: ltr;
    gap: 20px;
    padding-bottom: 14px;
}

.company-col {
    flex: 1;
    min-width: 0;
    text-align: left;
}

.co-name {
    font-size: 1.25rem;
    font-weight: 800;
    color: #111827;
    margin-bottom: 4px;
}

.co-sub {
    font-size: 0.75rem;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 8px;
}

.co-line {
    font-size: 0.8rem;
    line-height: 1.55;
    color: #6b7280;
    margin-bottom: 4px;
}

.header-logo {
    height: 48px;
    width: auto;
    flex-shrink: 0;
    margin-top: 4px;
    object-fit: contain;
}

.meta-strip {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    margin: 0 -36px;
    padding: 12px 36px;
    background: #eef2f7;
    border-top: 1px solid #e2e8f0;
    border-radius: 0 0 12px 12px;
    font-size: 0.86rem;
    color: #6b7280;
    font-weight: 600;
}

.meta-item strong {
    color: #111827;
    font-weight: 700;
}

.intro-block {
    margin: 0 36px 20px;
    padding: 5px 24px;
    text-align: center;
    line-height: 1.85;
    /* background-color: #f9fafb;
    border: 1px solid #e2e8f0; */
    border-radius: 12px;
}

.intro-title {
    margin: 0 0 12px;
    font-size: 1.1rem;
    font-weight: 800;
    color: #1849A9;
}

.intro-body {
    margin: 0;
    font-size: 0.92rem;
    font-weight: 600;
    color: #374151;
}

.intro-body :deep(.intro-line) {
    display: block;
}

.intro-body :deep(.intro-line--greeting) {
    text-align: right;
    margin-bottom: 14px;
}

.intro-body :deep(.intro-line--salam) {
    text-align: center;
    margin-bottom: 18px;
}

.blue-accent {
    color: #1849A9;
    font-weight: 800;
}

.table-wrapper {
    margin: 0 36px 16px;
}

.items-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    direction: rtl;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
}

.items-table thead tr {
    background: #1849a9;
}

.items-table th {
    color: #fff;
    padding: 14px 12px;
    text-align: center;
    font-size: 0.9rem;
    font-weight: 700;
    vertical-align: middle;
}

.items-table th.th-first {
    text-align: right;
    padding-right: 24px;
}

.items-table th.th-last {
    padding-left: 24px;
}

.items-table tbody td {
    padding: 14px 12px;
    border-bottom: 1px solid #e5e7eb;
    font-size: 0.875rem;
    color: #6b7280;
    text-align: center;
    vertical-align: middle;
    background: #fff;
}

.items-table tbody tr:last-child td {
    border-bottom: none;
}

.items-table tbody td.td-name {
    text-align: right;
    font-weight: 500;
    color: #374151;
    padding-right: 24px;
}

.items-table tbody td.td-subtotal {
    font-weight: 700;
    color: #374151;
    padding-left: 24px;
}

.totals-table {
    margin: 0 36px 16px;
    background-color: #f9fafb;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 12px 24px;
}

.total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    direction: rtl;
    padding: 10px 0;
    border-bottom: 1px solid #e2e8f0;
}

.total-row:last-child {
    border-bottom: none;
}

.total-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #374151;
}

.total-val {
    font-size: 0.9rem;
    font-weight: 600;
    color: #6b7280;
    direction: ltr;
}

.total-row--words .total-label {
    color: #1849A9;
    font-weight: 700;
}

.total-val--words {
    direction: rtl;
    font-weight: 600;
    color: #374151;
    text-align: left;
    max-width: 60%;
    line-height: 1.6;
}

.sar-icon {
    display: inline-block;
    vertical-align: middle;
    margin-inline-start: 4px;
}

.payment-method-inline {
    margin-top: 14px;
    padding-top: 12px;
    font-size: 0.85rem;
    line-height: 1.7;
    color: #374151;
    text-align: right;
}

.payment-title {
    color: #1849A9;
    font-weight: 700;
    margin-inline-end: 6px;
}

.payment-text {
    color: #374151;
}

.notes-section {
    margin: 0 36px 0;
    padding: 10px 24px;
    border-radius: 12px;
}

.notes-heading {
    margin: 0 0 10px;
    font-size: 0.95rem;
    font-weight: 800;
    color: #1849a9;
    text-align: right;
}

.notes-heading--secondary {
    margin-top: 14px;
}

.notes-list {
    margin: 0;
    padding: 0 20px 0 0;
    font-size: 0.85rem;
    line-height: 1.75;
    color: #374151;
    text-align: right;
    list-style-position: outside;
    list-style: disc;
}

.closing-line {
    text-align: center;
    font-weight: 700;
    font-size: 1rem;
    color: #374151;
    margin: 10px 36px;
}

.sign-strip {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 10px 36px;
}

.sign-col {
    text-align: right;
}

.sign-col--stamp {
    text-align: left;
}

.sign-label {
    font-size: 0.85rem;
    color: #6b7280;
    margin-bottom: 8px;
}

.sign-value {
    font-size: 1rem;
    font-weight: 700;
    color: #1849A9;
}

.stamp-img {
    max-width: 104px;
    height: auto;
    object-fit: contain;
}

@media print {
    .no-print,
    .print-actions {
        display: none !important;
    }

    .invoice-print-page {
        background: #fff;
        padding: 0;
    }

    .invoice-content {
        max-width: 100%;
        box-shadow: none;
        margin: 0;
        padding: 14px 0;
    }

    body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
    }

    .items-table,
    .items-table thead tr,
    .section-card,
    .intro-block,
    .meta-strip,
    .totals-table,
    .notes-section {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
    }

    .section-card,
    .intro-block,
    .table-wrapper,
    .totals-table,
    .notes-section,
    .closing-line,
    .sign-strip {
        margin-left: 28px;
        margin-right: 28px;
    }

    .section-card {
        padding: 16px 28px 0;
    }

    .meta-strip {
        margin: 0 -28px;
        padding: 10px 28px;
    }

    .items-table th.th-first,
    .items-table tbody td.td-name {
        padding-right: 20px;
    }

    .items-table th.th-last,
    .items-table tbody td.td-subtotal {
        padding-left: 20px;
    }
}
</style>
