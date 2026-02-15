<template>
    <div class="invoice-print-page" dir="rtl">
        <!-- Print button (hidden when printing) -->
        <div class="print-actions no-print">
            <button class="print-btn" @click="handlePrint">
                طباعة الفاتورة
            </button>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="print-loading">
            <v-progress-circular indeterminate color="primary" size="64" />
        </div>

        <!-- Invoice content -->
        <div v-else-if="invoiceData" class="invoice-content">
            <!-- ===== SECTION 1: Header Card ===== -->
            <div class="section-card">
                <!-- Header with wave decoration -->
                <div class="invoice-header">
                    <div class="header-content">
                        <div class="title-block">
                            <h1 class="title-en">Tax Invoice</h1>
                            <h2 class="title-ar">فاتورة مبيعات ضريبية</h2>
                        </div>
                        <img :src="logoImg" alt="Qallab" class="header-logo" />
                    </div>
                </div>

                <!-- Three info blocks -->
                <div class="info-blocks">
                    <!-- Invoice Details -->
                    <div class="info-block">
                        <h3 class="info-title">Invoice Details:</h3>
                        <div class="info-row">
                            <span class="info-label">Invoice number (رقم الفاتورة):</span>
                            <span class="info-value">N°: {{ invoiceData.code }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Issued (تاريخ الفاتورة):</span>
                            <span class="info-value">{{ formatDate(invoiceData.invoice_issues_datetime) }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Pay type:</span>
                            <span class="info-value">{{ payTypeLabel }}</span>
                        </div>
                    </div>

                    <!-- Qallab Company -->
                    <div class="info-block">
                        <h3 class="info-title info-title--blue">Qallab Company</h3>
                        <div class="info-row">
                            <span class="info-label">VAT No. (الرقم الضريبي):</span>
                            <span class="info-value">{{ supplier?.tax_no ?? '—' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Address (العنوان):</span>
                            <span class="info-value">{{ supplier?.address ?? '—' }}</span>
                        </div>
                    </div>

                    <!-- Invoice To (accent card) -->
                    <div class="info-block info-block--accent">
                        <h3 class="info-title info-title--blue">Invoice To:</h3>
                        <p class="recipient-name">{{ customer?.name ?? invoiceData.customer_name ?? '—' }}</p>
                        <div class="info-row">
                            <span class="info-label">Address (العنوان):</span>
                            <span class="info-value">{{ customer?.address ?? '—' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">VAT No. (الرقم الضريبي):</span>
                            <span class="info-value">{{ customer?.tax_no ?? '—' }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ===== Project & Note Section ===== -->
            <div class="project-section">
                <p>
                    <span class="project-value">{{ invoiceData.project_name ?? '—' }}</span>
                    <span class="project-label">: (اسم المشروع) Project Name</span>
                </p>
                <p>
                    <span class="note-value">{{ invoiceData.notes ?? '—' }}</span>
                    <span class="note-label">: (البيان) Note</span>
                </p>
            </div>

            <!-- ===== Items Table ===== -->
            <div class="table-wrapper">
                <table class="items-table">
                    <thead>
                        <tr>
                            <th class="th-first">
                                <span class="th-en">Nature of goods or services</span>
                                <span class="th-ar">تفاصيل السلع والخدمات</span>
                            </th>
                            <th>
                                <span class="th-en">Unit Price</span>
                                <span class="th-ar">سعر الوحدة</span>
                            </th>
                            <th>
                                <span class="th-en">Qty</span>
                                <span class="th-ar">الكمية</span>
                            </th>
                            <th>
                                <span class="th-en">Taxable Amount</span>
                                <span class="th-ar">المبلغ الخاضع للضريبة</span>
                            </th>
                            <th>
                                <span class="th-en">Tax Amount</span>
                                <span class="th-ar">مبلغ الضريبة</span>
                            </th>
                            <th class="th-last">
                                <span class="th-en">Subtotal</span>
                                <span class="th-ar">المجموع الكلي</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, idx) in invoiceData.items" :key="item.id ?? idx">
                            <td class="td-name">{{ item.item_name }}</td>
                            <td>{{ formatNumber(item.price_per_unit) }}</td>
                            <td>{{ formatNumber(item.quantity) }}</td>
                            <td>{{ formatNumber(item.taxable_amount) }}</td>
                            <td>{{ formatNumber(item.total_tax) }}</td>
                            <td class="td-subtotal">{{ formatNumber(item.subtotal_after_tax) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- ===== Totals + QR Code ===== -->
            <div class="totals-qr-section">
                <!-- QR Code Area -->
                <div class="qr-area">
                    <img
                        v-if="invoiceData.qr_code"
                        :src="invoiceData.qr_code"
                        alt="QR Code"
                        class="qr-image"
                    />
                    <div v-else class="qr-placeholder"></div>
                </div>

                <!-- Totals -->
                <div class="totals-area">
                    <!-- Total QTY -->
                    <div class="total-row">
                        <div class="total-labels">
                            <span class="total-label-en">Total QTY</span>
                            <span class="total-label-ar">إجمالي الكميات</span>
                        </div>
                        <span class="total-val">{{ formatCurrency(invoiceData.total_quantity) }}</span>
                    </div>
                    <!-- Total (Excluding VAT) -->
                    <div class="total-row">
                        <div class="total-labels">
                            <span class="total-label-en">Total (Excluding VAT)</span>
                            <span class="total-label-ar">الإجمالي غير شامل الضريبة</span>
                        </div>
                        <span class="total-val">{{ formatCurrency(totalExcludingVat) }}</span>
                    </div>
                    <!-- Total Discount -->
                    <div class="total-row">
                        <div class="total-labels">
                            <span class="total-label-en">Total Discount</span>
                            <span class="total-label-ar">مجموع الخصومات</span>
                        </div>
                        <span class="total-val">{{ formatCurrency(invoiceData.total_discount) }}</span>
                    </div>
                    <!-- Total Taxable Amount (Excluding VAT) -->
                    <div class="total-row">
                        <div class="total-labels">
                            <span class="total-label-en">Total Taxable Amount (Excluding VAT)</span>
                            <span class="total-label-ar">الإجمالي الخاضع للضريبة غير شامل ضريبة القيمة المضافة</span>
                        </div>
                        <span class="total-val">{{ formatCurrency(totalTaxableAmount) }}</span>
                    </div>
                    <!-- Total VAT -->
                    <div class="total-row">
                        <div class="total-labels">
                            <span class="total-label-en">Total VAT</span>
                            <span class="total-label-ar">مجموع ضريبة القيمة المضافة</span>
                        </div>
                        <span class="total-val">{{ formatCurrency(invoiceData.total_taxes) }}</span>
                    </div>
                    <!-- Total Amount Due -->
                    <div class="total-due-box">
                        <div class="total-due-labels">
                            <span class="total-due-en">Total Amount Due</span>
                            <span class="total-due-ar">الإجمالي المستحق</span>
                        </div>
                        <span class="total-due-val">{{ formatCurrency(invoiceData.final_total) }}</span>
                    </div>
                </div>
            </div>

            <!-- ===== Footer ===== -->
            <footer class="invoice-footer">
                <div class="footer-inner">
                    <div class="footer-info">
                        <span class="footer-company">Qallab Company</span>
                        <span class="footer-sep">|</span>
                        <span>Phone No: +966 599 1454323  ·  Email: Info@qallab.sa</span>
                        <span class="footer-sep">|</span>
                        <span>الرقم الضريبي: {{ supplier?.tax_no || 'N/A' }}</span>
                        <span class="footer-sep">|</span>
                        <span>السجل التجاري: {{ supplier?.commercial_register || 'N/A' }}</span>
                        <span class="footer-sep">|</span>
                        <span>العنوان: {{ supplier?.address || 'N/A' }}</span>
                    </div>
                    <img :src="logoLightImg" alt="Qallab" class="footer-logo" />
                </div>
                <div class="footer-gradient"></div>
            </footer>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { useNotification } from '@/composables/useNotification'
import logoSvgRaw from '@/assets/logo.svg?raw'
import logoLightSvgRaw from '@/assets/logo-light.svg?raw'

// Convert raw SVGs to data URIs so they are embedded directly and
// don't depend on external resource loading (fixes print-in-iframe issue)
const toDataUri = (svg: string) =>
    `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`

const logoImg = toDataUri(logoSvgRaw)
const logoLightImg = toDataUri(logoLightSvgRaw)

const route = useRoute()
const api = useApi()
const { error } = useNotification()

const isLoading = ref(false)
const invoiceData = ref<any>(null)

const routeId = computed(() => route.params.id as string)

const supplier = computed(() => invoiceData.value?.supplier ?? null)
const customer = computed(() => invoiceData.value?.customer ?? null)

const payTypeLabel = computed(() => {
    const so = invoiceData.value?.so_type
    if (!so) return '—'
    if (so === 'so_without_logistics') return 'آجل'
    if (so === 'so_with_logistics') return 'آجل'
    return so
})

const totalTaxableAmount = computed(() => {
    const items = invoiceData.value?.items ?? []
    return items.reduce((sum: number, i: any) => sum + (Number(i.taxable_amount) || 0), 0)
})

const totalExcludingVat = computed(() => {
    const total = invoiceData.value?.final_total
    const tax = invoiceData.value?.total_taxes
    if (total != null && tax != null) return Number(total) - Number(tax)
    return totalTaxableAmount.value
})

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

const fetchInvoiceData = async () => {
    if (!routeId.value) return
    isLoading.value = true
    try {
        const res = await api.get<any>(`/sales/invoices/building-materials/${routeId.value}`)
        invoiceData.value = res.data
        await nextTick()
        await waitForImages()
        if (window.self !== window.top) {
            window.parent.postMessage({ type: 'invoice-print-ready' }, '*')
        }
    } catch (e: any) {
        console.error('Error fetching invoice data:', e)
        error(e?.response?.data?.message || 'فشل تحميل بيانات الفاتورة')
    } finally {
        isLoading.value = false
    }
}

const formatDate = (value: string | null) => {
    if (!value) return '—'
    try {
        const d = new Date(value)
        return isNaN(d.getTime()) ? value : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    } catch {
        return value
    }
}

const formatNumber = (value: number | string | null) => {
    if (value == null) return '—'
    const n = Number(value)
    return isNaN(n) ? String(value) : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatCurrency = (value: number | string | null) => {
    if (value == null) return '—'
    return `$ ${formatNumber(value)}`
}

const handlePrint = () => {
    window.print()
}

onMounted(() => {
    fetchInvoiceData()
})
</script>

<style scoped>
/* ============================================
   INVOICE PRINT PAGE — Figma Design Match
   ============================================ */

@page {
    size: A4;
    margin: 0;
}

/* ====== PAGE WRAPPER ====== */
.invoice-print-page {
    min-height: 100vh;
    font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
}

/* ====== PRINT ACTIONS (hidden when printing) ====== */
.print-actions {
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 100;
}

.print-btn {
    padding: 10px 28px;
    background: #1570EF;
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

/* ====== LOADING ====== */
.print-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
}

/* ====== INVOICE CONTENT WRAPPER ====== */
.invoice-content {
    max-width: 900px;
    margin: 0 auto;
    background: #ffffff;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* ============================================
   SECTION 1: HEADER CARD
   ============================================ */
.section-card {
    margin: 0 36px 10px;
    padding: 15px 36px 15px;
    background-color: rgba(248, 250, 252, 1);
    border: 1px solid rgba(246, 248, 252, 1);
    border-radius: 16px;
}

/* ---- Header with Wave ---- */
.invoice-header {
    position: relative;
    margin-bottom: 28px;
    overflow: hidden;
}

.header-content {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    direction: ltr;
    padding: 24px 0 12px;
    z-index: 1;
}

.title-block {
    flex: 1;
}

.title-en {
    margin: 0 0 6px;
    font-size: 24px;
    font-weight: 600;
    color: rgba(25, 33, 61, 1);
    font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
    line-height: 1.15;
    letter-spacing: -0.01em;
}

.title-ar {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: rgba(25, 33, 61, 1);
}

.header-logo {
    height: 40px;
    width: auto;
    flex-shrink: 0;
}

/* ---- Info Blocks Grid ---- */
.info-blocks {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 20px;
    direction: ltr;
}

.info-block {
    padding: 0;
}

.info-block--accent {
    background: unset;
    background-color: rgba(255, 255, 255, 1);
    border-left: none;
    border-radius: 14px;
    padding: 16px 18px;
}

.info-title {
    margin: 0 0 10px;
    font-size: 10px;
    font-weight: 700;
    color: #101828;
}

.info-title--blue {
    color: #175CD3;
}

.info-row {
    margin-bottom: 8px;
    font-size: 0.85rem;
    line-height: 1.5;
}

.info-label {
    display: flex;
    color: rgba(102, 112, 133, 1);
    font-size: 12px;
    line-height: 18px;
    font-weight: 400;
}

.info-value {
    margin-left: 0;
    padding-left: 0;
    color: rgba(25, 33, 61, 1);
    font-size: 10px;
    font-weight: 600;
}

.recipient-name {
    font-size: 12px;
    font-weight: 600;
    color: rgba(25, 33, 61, 1);
    margin: 0 0 10px;
    line-height: 1.4;
}

/* ============================================
   PROJECT & NOTE SECTION
   ============================================ */
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

.project-section p {
    margin: 6px 0;
    font-size: 0.9rem;
    line-height: 1.6;
    text-align: left;
}

.project-label {
    font-weight: 600;
    font-size: 12px;
    color: rgba(93, 100, 129, 1);
}

.project-value {
    font-weight: 700;
    font-size: 12px;
    color: rgba(25, 33, 61, 1);
}

.note-label {
    font-weight: 600;
    font-size: 12px;
    color: rgba(93, 100, 129, 1);
}

.note-value {
    font-weight: 700;
    font-size: 12px;
    color: rgba(25, 33, 61, 1);
}

/* ============================================
   ITEMS TABLE
   ============================================ */
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

.items-table thead tr {
    background: #1849A9;
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
    font-weight: 400;
    font-size: 0.72rem;
    opacity: 0.85;
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
    border-bottom: 1px solid #F6F8FC;
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



/* ============================================
   TOTALS + QR SECTION
   ============================================ */
.totals-qr-section {
    display: flex;
    direction: ltr;
    gap: 32px;
    padding: 0 36px 15px;
    align-items: flex-start;
}

.qr-area {
    flex-shrink: 0;
    align-self: flex-end;
}

.qr-image {
    width: 140px;
    height: 140px;
    border-radius: 8px;
    object-fit: contain;
}

.qr-placeholder {
    width: 140px;
    height: 140px;
    border: 2px dashed #D0D5DD;
    background: #F9FAFB;
    border-radius: 8px;
}

/* ---- Totals Area ---- */
.totals-area {
    flex: 1;
    margin-left: auto;
    max-width: 520px;
    padding-right: 56px;
    background-color: rgba(248, 250, 252, 1);
}

.total-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 2px 0;
    padding-left: 15px;
    border-bottom: 1px solid #F2F4F7;
    direction: ltr;
}

.total-row:last-of-type {
    border-bottom: none;
}

.total-labels {
    display: flex;
    flex-direction: column;
    gap: 1px;
}

.total-label-en {
    font-size: 0.85rem;
    font-weight: 700;
    color: #344054;
    line-height: 1.4;
}

.total-label-ar {
    font-size: 0.78rem;
    font-weight: 400;
    color: #667085;
    line-height: 1.3;
}

.total-val {
    font-size: 0.9rem;
    font-weight: 600;
    color: #101828;
    min-width: 110px;
    text-align: right;
    white-space: nowrap;
    padding-top: 2px;
}

/* ---- Total Amount Due Box ---- */
.total-due-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #1849A9;
    color: #fff;
    padding: 10px 36px;
    border-radius: 10px;
    margin-top: 14px;
    margin-right: -56px;
    direction: ltr;
}

.total-due-labels {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.total-due-en {
    font-size: 0.9rem;
    font-weight: 700;
    color: #fff;
    line-height: 1.4;
}

.total-due-ar {
    font-size: 0.8rem;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.75);
    line-height: 1.3;
}

.total-due-val {
    font-size: 1.15rem;
    font-weight: 800;
    color: #fff;
    white-space: nowrap;
    letter-spacing: 0.01em;
}

/* ============================================
   FOOTER
   ============================================ */
.invoice-footer {
    margin-top: auto;
    background: #1849A9;
    color: #fff;
    position: relative;
    overflow: hidden;
}

.footer-inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 36px;
    direction: ltr;
    gap: 16px;
    position: relative;
    z-index: 1;
}

.footer-info {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 12px;
    font-size: 0.78rem;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.4;
}

.footer-sep {
    opacity: 0.7;
    flex-shrink: 0;
}

.footer-company {
    font-weight: 700;
    font-size: 0.85rem;
    color: #fff;
}

.footer-logo {
    height: 40px;
    width: auto;
    flex-shrink: 0;
}

/* Footer gradient wave decoration */
.footer-gradient {
    height: 6px;
    background: linear-gradient(90deg, #2E6ECC 0%, #4A9BF5 35%, #7DB8F9 65%, #A8D4FF 100%);
    position: relative;
    z-index: 1;
}

/* ============================================
   PRINT STYLES
   ============================================ */
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
    .invoice-footer,
    .footer-gradient,
    .info-block--accent,
    .section-card,
    .project-section {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
    }

    .section-card {
        margin: 0 28px 10px;
        padding: 15px 28px 15px;
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

    .totals-qr-section {
        padding: 0 28px 15px;
    }

    .totals-area {
        padding-right: 46px;
    }

    .total-due-box {
        padding: 10px 28px;
        margin-right: -46px;
    }

    .project-section {
        margin: 0 28px;
        padding: 4px 28px;
    }

    .footer-inner {
        padding: 16px 28px;
    }
}
</style>
