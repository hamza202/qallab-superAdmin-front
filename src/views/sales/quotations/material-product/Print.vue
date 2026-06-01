<template>
    <div class="invoice-print-page" dir="rtl">
        <div class="print-actions no-print">
            <button type="button" class="print-btn" @click="handlePrint">
                {{ t('sales.forms.printInvoice.printButton') }}
            </button>
        </div>

        <div v-if="isLoading" class="print-loading">
            <v-progress-circular indeterminate color="primary" size="64" />
        </div>

        <div v-else-if="loadFailed" class="print-error no-print">
            <p>{{ t('sales.quotationsMaterialProduct.print.loadFailed') }}</p>
        </div>

        <div v-else-if="!isLoading && !loadFailed" class="invoice-content">
            <!-- ===== Header card: company info (left) + logo/meta (right) ===== -->
            <div class="section-card">
                <div class="header-top">
                    <div class="company-col" dir="ltr">
                        <div class="co-name">{{ supplier?.full_name ?? 'شركة قلاب' }}</div>
                        <div class="co-info" dir="rtl">
                            <div class="co-line">
                                السجل التجاري : {{ supplier?.commercial_register ?? '—' }}
                            </div>
                            <div class="co-line">
                                الرقم الوطني الموحد : {{ supplier?.unified_login_id ?? '—' }}
                            </div>
                            <div class="co-line">
                                الرقم الضريبي : {{ supplier?.tax_number ?? '—' }}
                            </div>
                        </div>
                        <div class="co-meta" dir="rtl">
                            تاريخ عرض السعر : <strong>{{ quotationDate }}</strong>
                        </div>
                    </div>
                    <div class="logo-col">
                        <img
                            v-if="supplier?.logo_url"
                            :src="supplier.logo_url"
                            alt="logo"
                            class="header-logo"
                        />
                        <div v-else class="header-logo-placeholder"></div>
                        <div class="logo-meta" dir="rtl">
                            رقم عرض سعر : <strong>{{ quotationNumber }}</strong>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ===== Recipient + subject + body ===== -->
            <div class="intro-block" dir="rtl">
                <p class="recipient-line">
                    السادة / <strong class="blue-accent">{{ clientName }}</strong> المحترمين.
                </p>
                <p class="subject-line">
                    الموضوع: <strong>{{ subjectLine }}</strong>
                </p>
                <p class="greeting-line">تحية طيبة وبعد،</p>
                <p class="intro-body" v-html="introBodyHtml"></p>
            </div>

            <!-- ===== Items table ===== -->
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
                            <td>{{ row.unit_price }}</td>
                            <td class="td-subtotal">{{ row.subtotal_before_discount }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- ===== Totals block ===== -->
            <div class="totals-table">
                <div class="total-row">
                    <span class="total-label">الإجمالي غير شامل ضريبة القيمة المضافة</span>
                    <span class="total-val" dir="rtl">
                        <bdi>{{ formatCurrency(subtotal) }}</bdi>
                        <span v-html="rialIcon" class="sar-icon" />
                    </span>
                </div>
                <div class="total-row">
                    <span class="total-label">ضريبة القيمة المضافة</span>
                    <span class="total-val" dir="rtl">
                        <bdi>{{ formatCurrency(vatAmount) }}</bdi>
                        <span v-html="rialIcon" class="sar-icon" />
                    </span>
                </div>
                <div class="total-row">
                    <span class="total-label">الإجمالي شامل ضريبة القيمة المضافة</span>
                    <span class="total-val" dir="rtl">
                        <bdi>{{ formatCurrency(grandTotal) }}</bdi>
                        <span v-html="rialIcon" class="sar-icon" />
                    </span>
                </div>
                <div class="total-row total-row--words">
                    <span class="total-label">المجموع الكلي بالكلمات</span>
                    <span class="total-val total-val--words">{{ grandTotalWords }}</span>
                </div>
            </div>

            <!-- ===== Hope line ===== -->
            <p class="hope-line" dir="rtl">{{ closingHope }}</p>

            <!-- ===== Notes ===== -->
            <div class="notes-section" dir="rtl">
                <p class="notes-heading">ملاحظات هامة :</p>
                <ul class="notes-list">
                    <li v-for="(note, i) in staticNotes" :key="i" v-html="note"></li>
                </ul>
            </div>

            <!-- ===== Sign strip ===== -->
            <div class="sign-strip" dir="rtl">
                <div class="sign-block">
                    <div class="sign-title">إدارة المبيعات</div>
                    <div class="sign-name">{{ supplier?.full_name ?? '—' }}</div>
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

const { t } = useI18n()

/** API path segment for detail (GET /sales/quotations/{segment}/:id/detail). */
const QUOTATION_DETAIL_SEGMENT = 'building-materials'

const route = useRoute()
const api = useApi()
const { error } = useNotification()

interface QuotationLine {
    description: string
    unit: string
    quantity: string
    unit_price: string
    total: string
    subtotal_before_discount: string
}

interface QuotationPrintDetail {
    supplier?: {
        full_name?: string
        mobile?: string | null
        email?: string | null
        tax_number?: number | string | null
        commercial_register?: number | string | null
        unified_login_id?: number | string | null
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
        summary?: string
        code?: string
        project_name?: string
        quotation_type?: string
    }
    locations?: {
        target_location?: string | null
        source_location?: string | null
    }
    items?: Array<{
        item_name?: string
        unit_name?: string
        quantity?: number | string
        price_per_unit?: number | string
        line_total?: number | string
        subtotal_before_discount?: number | string
    }>
    totals?: {
        subtotal_excluding_vat?: number | string | null
        vat_rate?: number | string | null
        vat_amount?: number | string | null
        grand_total_including_vat?: number | string | null
        grand_total_in_words?: string | null
    }
    invoice_interval?: number | string | null
    quotation_validity_no?: number | string | null
    payment_term_no?: number | string | null
    quotations_datetime?: string
    terms_and_conditions?: string[]
    notes_list?: string[]
}

const isLoading = ref(false)
const loadFailed = ref(false)
const detail = ref<QuotationPrintDetail | null>(null)

const routeId = computed(() => (route.params.id as string) || '')

const supplier = computed(() => detail.value?.supplier ?? null)
const customer = computed(() => detail.value?.customer ?? null)
const subject = computed(() => detail.value?.subject ?? null)
const locations = computed(() => detail.value?.locations ?? null)
const totals = computed(() => detail.value?.totals ?? null)

const PLACEHOLDER_LINES: QuotationLine[] = [
    {
        description: '[وصف البند — سيتم ربطه بالبيانات]',
        unit: 'طن',
        quantity: '—',
        unit_price: '—',
        total: '—',
        subtotal_before_discount: '—',
    },
]

function normalizeDetail(body: unknown): QuotationPrintDetail | null {
    if (!body || typeof body !== 'object') return null
    const o = body as Record<string, unknown>
    if (o.data && typeof o.data === 'object') return o.data as QuotationPrintDetail
    return body as QuotationPrintDetail
}

const quotationNumber = computed(() => {
    const c = subject.value?.code
    return (c && String(c).trim()) || `#${routeId.value.slice(0, 8)}`
})

const quotationDate = computed(() => {
    const d = detail.value?.quotations_datetime
    if (!d) return '—'
    try {
        const dt = new Date(d)
        if (isNaN(dt.getTime())) return String(d)
        const day = String(dt.getDate()).padStart(2, '0')
        const month = String(dt.getMonth() + 1).padStart(2, '0')
        const year = dt.getFullYear()
        return `${day}-${month}-${year}`
    } catch {
        return String(d)
    }
})

const clientName = computed(() => customer.value?.full_name ?? '[اسم العميل]')

const subjectLine = computed(() => {
    const projectName = subject.value?.project_name
        ? String(subject.value.project_name).trim()
        : ''
    const quotationType = subject.value?.quotation_type
        ? String(subject.value.quotation_type).trim()
        : ''

    if (projectName && quotationType) return `${projectName} — ${quotationType}`
    if (projectName) return projectName
    if (quotationType) return quotationType
    return 'عرض سعر مواد ومنتجات'
})

const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const accent = (s: string) => `<span class="blue-accent">${escapeHtml(s)}</span>`

const introBodyHtml = computed(() => {
    const projectName = subject.value?.project_name
    const location = locations.value?.target_location

    const projectPart =
        projectName && String(projectName).trim()
            ? `لمشروعكم ${accent(String(projectName).trim())}`
            : 'لمشروعكم'

    const locationPart =
        location && String(location).trim()
            ? ` حسب الموقع ${accent(String(location).trim())}`
            : ''

    return `بالإشارة إلى الموضوع أعلاه حيث أننا بفضل الله من الشركات الرائدة في مجال أعمال توريد ونقل مواد البناء الأولية في مكة وجدة وخارجهما، يسرنا أن نتقدم إليكم بعرض أسعارنا ${projectPart}${locationPart}.`
})

const lineItems = computed((): QuotationLine[] => {
    const items = detail.value?.items
    if (!items?.length) return PLACEHOLDER_LINES
    return items.map((it) => ({
        description: String(it.item_name ?? '—'),
        unit: String(it.unit_name ?? '—'),
        quantity: it.quantity != null ? String(it.quantity) : '—',
        unit_price: formatMoney(it.price_per_unit),
        total: formatMoney(it.line_total),
        subtotal_before_discount: formatMoney(it.subtotal_before_discount ?? it.line_total),
    }))
})

const subtotal = computed(() => totals.value?.subtotal_excluding_vat ?? '—')
const vatAmount = computed(() => totals.value?.vat_amount ?? '—')
const grandTotal = computed(() => totals.value?.grand_total_including_vat ?? '—')
const grandTotalWords = computed(
    () => totals.value?.grand_total_in_words ?? '[المبلغ كتابة — سيتم ربطه بالبيانات]'
)

const closingHope = computed(() => 'آملين أن ينال عرض سعرنا قبولكم واستحسانكم.')

const staticNotes = computed(() => {
    const invoiceIntervalDays = detail.value?.invoice_interval
    const validityDays = detail.value?.quotation_validity_no
    const paymentTermDays = detail.value?.payment_term_no

    const fmt = (v: unknown) => {
        if (v == null || v === '') return '—'
        const n = Number(v)
        return Number.isFinite(n) ? String(n) : String(v)
    }

    const validityPhrase = accent(`${fmt(validityDays)} أيام`)
    const invoicePhrase = accent(`${fmt(invoiceIntervalDays)} أيام`)
    const paymentPhrase = accent(`${fmt(paymentTermDays)} أيام`)

    return [
        'الأسعار أعلاه تشمل ضريبة القيمة المضافة .',
        `صلاحية عرض السعر ${validityPhrase} .`,
        `يتم رفع مستخلص ${invoicePhrase} على أن يتم سدادها بعد ${paymentPhrase} .`,
        'يتم بدء العمل فور الموافقة على عرض السعر وتحويله إلى طلبية مشتريات وتعميدها ورفعها على النظام .',
    ]
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
            `/sales/quotations/${QUOTATION_DETAIL_SEGMENT}/${routeId.value}/detail`
        )
        detail.value = normalizeDetail(res)
        await nextTick()
        await waitForImages()
        if (window.self !== window.top) {
            window.parent.postMessage({ type: 'quotation-material-product-print-ready' }, '*')
        }
    } catch (e: unknown) {
        console.error('Quotation print detail failed:', e)
        loadFailed.value = true
        const err = e as { response?: { data?: { message?: string } } }
        error(err?.response?.data?.message || t('sales.quotationsMaterialProduct.print.loadFailed'))
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

/* ===== Header card ===== */
.section-card {
    margin: 0 36px 16px;
    padding: 20px 28px;
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
}

.header-top {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    direction: ltr;
    gap: 20px;
}

.company-col {
    flex: 1;
    min-width: 0;
    text-align: left;
}

.co-name {
    font-size: 1.5rem;
    font-weight: 800;
    color: #1849A9;
    margin-bottom: 12px;
    text-align: left;
}

.co-info {
    text-align: left;
    direction: rtl;
}

.co-line {
    font-size: 0.82rem;
    line-height: 1.8;
    color: #6b7280;
    margin-bottom: 2px;
    text-align: left;
}

.co-meta {
    margin-top: 12px;
    font-size: 0.86rem;
    color: #374151;
    font-weight: 600;
    text-align: left;
    direction: rtl;
}

.co-meta strong {
    color: #111827;
    font-weight: 700;
    margin-inline-start: 4px;
}

.logo-col {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 14px;
    flex-shrink: 0;
    min-width: 200px;
    direction: ltr;
}

.header-logo {
    height: 64px;
    width: auto;
    max-width: 180px;
    object-fit: contain;
}

.header-logo-placeholder {
    height: 64px;
}

.logo-meta {
    font-size: 0.86rem;
    color: #374151;
    font-weight: 600;
    text-align: right;
    direction: rtl;
    white-space: nowrap;
}

.logo-meta strong {
    color: #111827;
    font-weight: 700;
    margin-inline-start: 4px;
}

/* ===== Intro (recipient + subject + body) ===== */
.intro-block {
    margin: 0 36px 16px;
    padding: 6px 8px;
    line-height: 1.85;
}

.recipient-line {
    margin: 0 0 14px;
    font-size: 0.95rem;
    font-weight: 700;
    color: #111827;
    text-align: right;
}

.subject-line {
    margin: 0 0 8px;
    font-size: 0.95rem;
    color: #111827;
    text-align: right;
}

.subject-line strong {
    font-weight: 800;
    color: #111827;
}

.greeting-line {
    margin: 0 0 10px;
    font-size: 0.9rem;
    font-weight: 700;
    color: #111827;
    text-align: center;
}

.intro-body {
    margin: 0;
    font-size: 0.88rem;
    font-weight: 500;
    color: #374151;
    text-align: center;
    line-height: 1.9;
}

.blue-accent {
    color: #1849A9;
    font-weight: 800;
}

/* ===== Items table ===== */
.table-wrapper {
    margin: 8px 36px 16px;
}

.items-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    direction: rtl;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
}

.items-table thead tr {
    background: #1849a9;
}

.items-table th {
    color: #fff;
    padding: 12px;
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

/* ===== Totals ===== */
.totals-table {
    margin: 0 36px 16px;
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 6px 24px;
}

.total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    direction: rtl;
    padding: 12px 0;
    border-bottom: 1px solid #e5e7eb;
}

.total-row:last-child {
    border-bottom: none;
}

.total-label {
    font-size: 0.9rem;
    font-weight: 700;
    color: #111827;
}

.total-val {
    font-size: 0.9rem;
    font-weight: 700;
    color: #111827;
    direction: rtl;
    unicode-bidi: isolate;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.total-row--words .total-label {
    color: #1849A9;
    font-weight: 800;
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

/* ===== Hope line ===== */
.hope-line {
    text-align: center;
    font-weight: 700;
    font-size: 0.92rem;
    color: #1849A9;
    margin: 14px 36px 8px;
}

/* ===== Notes ===== */
.notes-section {
    margin: 0 36px;
    padding: 4px 12px;
}

.notes-heading {
    margin: 0 0 10px;
    font-size: 0.95rem;
    font-weight: 800;
    color: #1849A9;
    text-align: right;
}

.notes-list {
    margin: 0;
    padding: 0 22px 0 0;
    font-size: 0.86rem;
    line-height: 1.85;
    color: #374151;
    text-align: right;
    list-style-position: outside;
    list-style: disc;
}

/* ===== Sign strip ===== */
.sign-strip {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 28px 36px 20px;
    margin-top: auto;
}

.sign-block {
    text-align: center;
}

.sign-title {
    font-size: 1rem;
    font-weight: 800;
    color: #1849A9;
    margin-bottom: 4px;
}

.sign-name {
    font-size: 1rem;
    font-weight: 800;
    color: #1849A9;
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
    .totals-table,
    .notes-section {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
    }

    .section-card,
    .intro-block,
    .table-wrapper,
    .totals-table,
    .hope-line,
    .notes-section,
    .sign-strip {
        margin-left: 28px;
        margin-right: 28px;
    }

    .section-card {
        padding: 16px 24px;
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
