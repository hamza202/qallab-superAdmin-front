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
            <!-- ===== SECTION 1: section-card — company + logo (reference layout) ===== -->
            <div class="section-card section-card--quotation">
                <div class="quot-header-top">
                        <div class="quot-company-col" dir="rtl">
                            <div class="quot-co-name">{{ supplier?.full_name ?? 'شركة قلاب' }}</div>
                        <div class="quot-co-sub">Qallab Company</div>
                        <div class="quot-co-line">
                            هاتف: {{ supplier?.mobile ?? '+966 599 1454323' }} · البريد: {{ supplier?.email ?? 'info@qallab.sa' }}
                        </div>
                        <div class="quot-co-line">
                            الرقم الضريبي: {{ supplier?.tax_number ?? '—' }} · السجل التجاري:
                            {{ supplier?.commercial_register ?? '—' }}
                        </div>
                    </div>
                    <img :src="logoImg" alt="Qallab" class="quot-header-logo" />
                </div>
                <div class="quot-meta-strip" dir="rtl">
                    <span class="quot-meta-item"
                        >تاريخ عرض السعر : <strong>{{ quotationDate }}</strong></span
                    >
                    <span class="quot-meta-item"
                        >رقم عرض سعر : <strong>{{ quotationNumber }}</strong></span
                    >
                </div>
            </div>

            <!-- ===== Intro (recipient / subject / body — reference copy) ===== -->
            <div class="quot-intro-block" dir="rtl">
                <p class="quot-recipient">
                    السادة / <strong>{{ clientName }}</strong> المحترمين تحية طيبة وبعد.
                </p>
                <p class="quot-subject-line">الموضوع: <strong>{{ subjectLine }}</strong></p>
                <p class="quot-body-text" v-html="introBodyHtml"></p>
            </div>

            <!-- ===== Items Table (same wrapper + table pattern as invoice) ===== -->
            <div class="table-wrapper">
                <table class="items-table items-table--quotation">
                    <thead>
                        <tr>
                            <th class="th-first">
                                <span class="th-ar th-ar--only">البند</span>
                            </th>
                            <th><span class="th-ar th-ar--only">الوحدة</span></th>
                            <th><span class="th-ar th-ar--only">الكمية</span></th>
                            <th><span class="th-ar th-ar--only">سعر الوحدة</span></th>
                            <th class="th-last">
                                <span class="th-ar th-ar--only">السعر الإجمالي</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(row, idx) in lineItems" :key="idx">
                            <td class="td-name">{{ row.description }}</td>
                            <td>{{ row.unit }}</td>
                            <td>{{ row.quantity }}</td>
                            <td>{{ row.unit_price }} <span v-html="rialIcon" class="sar-icon" /></td>
                            <td class="td-subtotal">{{ row.total }} <span v-html="rialIcon" class="sar-icon" /></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- ===== totals-qr-section — totals column + hope (reference placement) ===== -->
            <div class="totals-qr-table--quotation">
                <div class="totals-area totals-table--quotation">
                    <div class="total-row total-row--quotation">
                        <span class="total-label-ar-only">الإجمالي غير شامل ضريبة القيمة المضافة</span>
                        <span class="total-val"
                            >{{ formatCurrency(subtotal) }} <span v-html="rialIcon" class="sar-icon"
                        /></span>
                    </div>
                    <div class="total-row total-row--quotation">
                        <span class="total-label-ar-only">ضريبة القيمة المضافة</span>
                        <span class="total-val"
                            >{{ formatCurrency(vatAmount) }} <span v-html="rialIcon" class="sar-icon"
                        /></span>
                    </div>
                </div>
            </div>

            <div class="totals-qr-section totals-qr-section--quotation">
                <div class="hope-area hope-area--quotation" dir="rtl">
                    <p class="hope-text">{{ closingHope }}</p>
                </div>
                <div class="totals-area totals-area--quotation">
                    <div class="total-due-box total-due-box--quotation-tri" dir="rtl">
                        <div class="qgt-cell qgt-cell--label">
                            <span class="qgt-title">الإجمالي الكلي</span>
                        </div>
                        <div class="qgt-cell qgt-cell--amount">
                            {{ formatCurrency(grandTotal) }}
                            <span v-html="rialIcon" class="sar-icon sar-icon--white" />
                        </div>
                        <div class="qgt-cell qgt-cell--words">{{ grandTotalWords }}</div>
                    </div>
                </div>
            </div>

            <!-- ===== Notes (project-section pattern — blue title like reference) ===== -->
            <div class="project-section project-section--notes" dir="rtl">
                <p class="notes-heading">ملاحظات هامة :</p>
                <ul class="terms-list">
                    <li v-for="(note, i) in staticNotes" :key="i" v-html="note"></li>
                </ul>
            </div>

            <p class="quotation-respect" dir="rtl">وتفضلوا بقبول فائق الاحترام والتحية</p>

            <!-- ===== Signature strip (reference) + invoice footer bar ===== -->
            <div class="quot-sign-strip" dir="rtl">
                <div class="quot-sign-text">
                    <div>إدارة المبيعات</div>
                    <div class="quot-sign-muted">منصة قلاب</div>
                </div>
                <img :src="logoBlackImg" alt="Qallab stamp" class="quot-stamp-img" />
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
}

interface QuotationPrintDetail {
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
    }
    subject?: {
        summary?: string
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
        price_per_unit?: number | string
        line_total?: number | string
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
    },
    {
        description: '[وصف البند — سيتم ربطه بالبيانات]',
        unit: 'طن',
        quantity: '—',
        unit_price: '—',
        total: '—',
    },
    {
        description: '[وصف البند — سيتم ربطه بالبيانات]',
        unit: 'طن',
        quantity: '—',
        unit_price: '—',
        total: '—',
    },
]

const DEFAULT_TERMS = [
    '[بند الشروط — سيتم ربطه بالبيانات]',
    '[صلاحية العرض — سيتم ربطه بالبيانات]',
    '[شروط الدفع — سيتم ربطه بالبيانات]',
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

const clientName = computed(() => customer.value?.full_name ?? '[اسم العميل]')

function isUnusableSubjectText(s: string | undefined): boolean {
    if (!s || !String(s).trim()) return true
    const x = String(s).trim()
    if (x.startsWith('{') || x.startsWith('[')) return true
    if (x.includes('"summary"') && x.includes('"code"')) return true
    return false
}

const subjectLine = computed(() => {
    const s = subject.value?.summary
    if (!isUnusableSubjectText(s)) return String(s).trim()
    return 'عرض سعر توريد مع نقل / نقل فقط'
})

const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const accent = (s: string) => `<span class="blue-accent">${escapeHtml(s)}</span>`

const introBodyHtml = computed(() => {
    const projectName = subject.value?.project_name
    const location = locations.value?.target_location

    const projectPart =
        projectName && String(projectName).trim()
            ? accent(`لمشروعكم ${String(projectName).trim()}`)
            : accent('لمشروعكم')

    const locationPart =
        location && String(location).trim()
            ? accent(`حسب الموقع ${String(location).trim()}`)
            : ''

    return `بالإشارة إلى الموضوع أعلاه حيث أننا بفضل الله من الشركات الرائدة في مجال أعمال توريد ونقل مواد البناء الأولية في مكة وجدة وخارجهما، يسرنا أن نتقدم إليكم بعرض أسعارنا ${projectPart}${locationPart ? ` ${locationPart}` : ''} .`
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
    }))
})

const subtotal = computed(() => totals.value?.subtotal_excluding_vat ?? '—')
const vatAmount = computed(() => totals.value?.vat_amount ?? '—')
const grandTotal = computed(() => totals.value?.grand_total_including_vat ?? '—')
const grandTotalWords = computed(
    () => totals.value?.grand_total_in_words ?? '[المبلغ كتابة — سيتم ربطه بالبيانات]'
)

const termsList = computed(() => {
    const t1 = detail.value?.terms_and_conditions
    if (t1?.length) return t1
    const t2 = detail.value?.notes_list
    if (t2?.length) return t2
    return DEFAULT_TERMS
})

const closingHope = computed(() => 'آملين أن ينال عرض سعرنا قبولكم واستحسانكم ...')

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
        'الأسعار أعلاه تشمل ضريبة القيمة المضافة.',
        `صلاحية عرض السعر ${validityPhrase}.`,
        `يتم رفع مستخلص خلال ${invoicePhrase} على أن يتم سدادها بعد ${paymentPhrase}.`,
        'يتم بدء العمل فور الموافقة على عرض السعر وتحويله إلى طلب مشتريات وتصديقها ووضعها على النظام.',
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
/* ============================================
   QUOTATION PRINT — aligned with sales/invoices/Print.vue
   ============================================ */

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
}

.section-card {
    margin: 0 36px 10px;
    padding: 15px 36px 15px;
    background-color: rgba(248, 250, 252, 1);
    border: 1px solid rgba(246, 248, 252, 1);
    border-radius: 16px;
}

.section-card--quotation {
    padding-bottom: 0;
}

.quot-header-top {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    direction: ltr;
    gap: 20px;
    padding-bottom: 14px;
}

.quot-company-col {
    flex: 1;
    min-width: 0;
    text-align: left;
}

.quot-co-name {
    font-size: 1.1rem;
    font-weight: 800;
    color: #1849a9;
    margin-bottom: 4px;
}

/* Improve image clarity inside iframe printing */
img {
    image-rendering: auto;
}

.quot-co-sub {
    font-size: 0.75rem;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 8px;
}

.quot-co-line {
    font-size: 0.8rem;
    line-height: 1.55;
    color: #475569;
    margin-bottom: 4px;
}

.quot-header-logo {
    height: 48px;
    width: auto;
    flex-shrink: 0;
    margin-top: 4px;
    object-fit: contain;
}

.quot-meta-strip {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    margin: 0 -36px -1px;
    padding: 12px 36px;
    background: #eef2f7;
    border-top: 1px solid #e2e8f0;
    border-radius: 0 0 14px 14px;
    font-size: 0.86rem;
    color: #334155;
}

.quot-meta-item strong {
    color: #0f172a;
    font-weight: 700;
}

.quot-intro-block {
    margin: 14px 36px 25px;
    padding: 10px 15px;
    text-align: center;
    line-height: 1.85;
    background-color:#F8FAFC;
    border-radius:16px
}

.quot-recipient {
    margin: 0 0 6px;
    font-size: 0.95rem;
    font-weight: 700;
    color: #0f172a;
}

.quot-subject-line {
    margin: 0 0 8px;
    font-size: 0.92rem;
    font-weight: 700;
    color: #0f172a;
}

.quot-intro-block strong,
.quot-intro-block a,
.blue-accent {
    color: #1849A9;
    font-weight: 800;
    text-decoration: none;
}

.quot-body-text {
    margin: 0;
    font-size: 0.88rem;
    text-align: center;
    text-justify: inter-word;
}

.project-section {
    border: 1px solid rgba(246, 248, 252, 1);
    border-radius: 16px;
    border-image: none;
    padding: 13px 36px;
    margin: 0 36px;
    background: unset;
    background-color: rgba(248, 250, 252, 1);
    color: rgba(248, 250, 252, 1);
}

.project-section--notes {
    margin-top: 12px;
}

.project-section--notes .notes-heading {
    margin: 0 0 10px;
    font-size: 0.95rem;
    font-weight: 800;
    color: #1849a9;
    text-align: right;
}

.project-section--notes .terms-list {
    margin: 0;
    padding: 0 20px 0 0;
    font-size: 0.86rem;
    line-height: 1.65;
    color: #334155;
    text-align: right;
    list-style-position: outside;
    list-style: disc;
}

.quotation-respect {
    text-align: center;
    font-weight: 700;
    font-size: 0.92rem;
    color: #101828;
    margin: 16px 36px 12px;
}

.table-wrapper {
    margin: 10px 0 0;
    padding: 0 36px;
}

.items-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    direction: ltr;
    border-width: 0;
    border-style: none;
    border-color: transparent;
    border-image: none;
    border-radius: 8px;
    overflow: hidden;
}

.items-table--quotation {
    direction: rtl;
}

.items-table--quotation th.th-first {
    text-align: right;
    padding-left: 12px;
    padding-right: 36px;
}

.items-table--quotation th.th-last {
    padding-right: 12px;
    padding-left: 36px;
}

.items-table--quotation .th-ar--only {
    display: block;
    font-weight: 900;
    font-size: 1rem;
    opacity: 1;
}

.items-table--quotation tbody td.td-name {
    text-align: right;
    padding-right: 36px;
    padding-left: 12px;
}

.items-table--quotation tbody td.td-subtotal {
    padding-left: 36px;
    padding-right: 12px;
}

.items-table thead tr {
    background: #1849a9;
}

.items-table th {
    color: #fff;
    padding: 4px 12px;
    text-align: center;
    font-size: 0.78rem;
    font-weight: 600;
    vertical-align: middle;
    line-height: 1.4;
    white-space: nowrap;
}

.items-table th .th-en {
    display: block;
    font-weight: 700;
    font-size: 0.78rem;
    margin-bottom: 2px;
}

.items-table th .th-ar {
    display: block;
    font-weight: 700;
    font-size: .8rem;
    opacity: 0.85;
    padding:8px 0
}

.items-table th.th-first {
    text-align: left;
    white-space: normal;
    padding-left: 36px;
}

.items-table th.th-last {
    padding-right: 36px;
}

.items-table tbody td {
    padding: 4px 12px;
    border-bottom: 1px solid #f6f8fc;
    font-size: 0.875rem;
    color: #344054;
    text-align: center;
    vertical-align: middle;
}

.items-table tbody td.td-name {
    text-align: left;
    font-weight: 500;
    color: #101828;
    padding-left: 36px;
}

.items-table tbody td.td-subtotal {
    font-weight: 700;
    color: #101828;
    font-size: 0.85rem;
    padding-right: 36px;
}

.totals-qr-section {
    display: flex;
    direction: ltr;
    gap: 10px;
    padding: 0 36px 15px;
    align-items: flex-start;
}

.totals-qr-table--quotation{
    padding: 0 36px 15px;
    width: 100%;
}
.totals-area {
    flex: 1;
    margin-left: auto;
    padding-right: 56px;
    background-color: rgba(248, 250, 252, 1);
}

.totals-table--quotation{
    border-radius: 10px;
    margin-left: 0;
    margin-right: 0;
    margin-top:15px;
    padding: 12px 18px 14px 12px;
}

.totals-qr-section--quotation{
    align-items:center
}
.totals-area--quotation {
    flex: 1 1 58%;
    max-width: 520px;
    margin-left: 0;
    margin-right: 0;
    padding: 12px 18px 14px 12px;
    border-radius: 10px;
}

.hope-area--quotation {
    flex: 1 1 36%;
    min-width: 160px;
    max-width: 320px;
    display: flex;
    align-items: center;
    padding: 8px;
}

.hope-text {
    margin: 0;
    font-size: .85rem;
    line-height: 1.65;
    color: #1849a9;
    font-weight: 700;
    text-align: right;
}

.total-row--quotation {
    display: flex;
    justify-content: space-between;
    direction: rtl;
    padding: 6px 12px 6px 8px;
    align-items: center;
    border-bottom: 1px solid #e2e8f0;
}

.total-row--quotation:last-of-type {
    border-bottom: none;
}

.total-label-ar-only {
    font-size: 0.8rem;
    font-weight: 600;
    color: #344054;
    line-height: 1.35;
    text-align: right;
    flex: 1;
    min-width: 0;
    padding-left: 10px;
}

.total-row--quotation .total-val {
    text-align: left;
    direction: ltr;
}

.total-val {
    font-size: 0.9rem;
    font-weight: 600;
    color: #101828;
    min-width: 110px;
    white-space: nowrap;
    padding-top: 2px;
}

.sar-icon {
    display: inline-block;
    vertical-align: middle;
    margin-inline-start: 4px;
}

.sar-icon--white :deep(svg path) {
    fill: #fff;
}

.total-due-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #1849a9;
    color: #fff;
    padding: 10px 36px;
    border-radius: 10px;
    margin-right: -56px;
    direction: ltr;
}

.total-due-box--quotation-tri {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 12px;
    margin-right: 0;
    padding: 12px 20px;
    direction: rtl;
}

.qgt-cell--label {
    text-align: right;
}

.qgt-title {
    font-size: 0.95rem;
    font-weight: 800;
    color: #fff;
}

.qgt-cell--amount {
    text-align: center;
    font-size: 1.2rem;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    direction: ltr;
}

.qgt-cell--words {
    text-align: left;
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1.45;
    color: rgba(255, 255, 255, 0.92);
    padding-inline-start: 4px;
}

.quot-sign-strip {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 20px;
    padding: 16px 36px 20px;
    margin-top: auto;
    break-inside: avoid;
    page-break-inside: avoid;
}

.quot-sign-text {
    font-size: 0.88rem;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.5;
    text-align: right;
}

.quot-sign-muted {
    font-size: 0.82rem;
    font-weight: 500;
    color: #64748b;
}

.quot-stamp-placeholder {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 2px dashed #94a3b8;
    background: linear-gradient(145deg, #f8fafc, #f1f5f9);
    flex-shrink: 0;
}

.quot-stamp-img {
    flex-shrink: 0;
    object-fit: contain;
    opacity: 0.95;
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
    }

    body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
    }

    .items-table,
    .items-table thead tr,
    .total-due-box,
    .total-due-box--quotation-tri,
    .section-card,
    .project-section,
    .quot-meta-strip,
    .totals-area--quotation {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
    }

    .section-card {
        margin: 20px 28px 10px;
        padding: 15px 28px 0;
    }

    .quot-meta-strip {
        margin: 0 -28px 0;
        padding: 10px 28px;
    }

    .table-wrapper {
        margin: 10px 0 0;
        padding: 0 28px;
    }

    .items-table th.th-first {
        padding-left: 28px;
    }

    .items-table th.th-last {
        padding-right: 28px;
    }

    .items-table tbody td.td-name {
        padding-left: 28px;
    }

    .items-table tbody td.td-subtotal {
        padding-right: 28px;
    }

    .items-table--quotation th.th-first {
        padding-right: 28px;
        padding-left: 10px;
    }

    .items-table--quotation th.th-last {
        padding-left: 28px;
        padding-right: 10px;
    }

    .items-table--quotation tbody td.td-name {
        padding-right: 28px;
        padding-left: 10px;
    }

    .items-table--quotation tbody td.td-subtotal {
        padding-left: 28px;
        padding-right: 10px;
    }

    .totals-qr-section {
        padding: 0 28px 15px;
    }

    .totals-area--quotation {
        padding: 10px 14px 12px 8px;
    }

    .total-due-box {
        padding: 10px 28px;
        margin-right: -46px;
    }

    .total-due-box--quotation-tri {
        margin-right: 0;
        padding: 10px 16px;
    }

    .project-section {
        margin: 0 28px;
        padding: 4px 28px;
    }

    .quotation-respect {
        margin-left: 28px;
        margin-right: 28px;
    }

    .quot-intro-block {
        margin-left: 28px;
        margin-right: 28px;
    }

    .quot-sign-strip {
        padding-left: 28px;
        padding-right: 28px;
    }

    /* footer removed */
}
</style>
