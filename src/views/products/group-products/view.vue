<template>
  <default-layout>
    <div class="product-view-page -mx-6">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-3 mb-6 text-sm px-6">
        <router-link to="/" class="text-gray-500 hover:text-primary-600">
          <span v-html="homeIcon"></span>
        </router-link>
        <span class="text-lg text-gray-300">/</span>
        <router-link
          to="/group-products/list"
          class="text-gray-600 hover:text-primary-600"
        >
          المنتجات
        </router-link>
        <span class="text-lg text-gray-300">/</span>
        <router-link
          to="/group-products/list"
          class="text-gray-600 hover:text-primary-600"
        >
          جدول المنتجات المجموعة
        </router-link>
        <span class="text-lg text-gray-300">/</span>
        <span
          class="text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md"
          >{{ product.name }}</span
        >
      </div>

      <!-- Page Header -->
      <div class="bg-white px-6 py-4 border-y border-gray-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-lg flex items-center justify-center">
              <span v-html="productIcon" class="text-primary-600"></span>
            </div>
            <div>
              <h1 class="text-lg font-bold text-gray-900 mb-1">
                {{ product.name }}
              </h1>
              <p class="text-sm text-gray-600">
                {{ product.description || "لا يوجد وصف" }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white border-b border-gray-200 px-6 py-3">
        <div class="flex gap-2 items-center overflow-x-auto no-scroll-style">
          <button
            @click="activeTab = 'general'"
            :class="
              activeTab === 'general'
                ? 'bg-primary-500 text-white'
                : 'text-gray-400 hover:text-gray-600'
            "
            class="flex items-center gap-2 px-4 py-2.5 rounded-md font-semibold text-base transition-colors whitespace-nowrap"
          >
            <span v-html="fileIcon"></span>
            المعلومات العامة للمنتج
          </button>
          <button
            @click="activeTab = 'tests'"
            :class="
              activeTab === 'tests'
                ? 'bg-primary-500 text-white'
                : 'text-gray-400 hover:text-gray-600'
            "
            class="flex items-center gap-2 px-4 py-2.5 rounded-md font-semibold text-base transition-colors whitespace-nowrap"
          >
            <span v-html="fileCheckIcon"></span>
            الاختبارات على المنتج
          </button>
        </div>
      </div>

      <!-- Tab Content: General Information -->
      <div v-if="activeTab === 'general'">
        <!-- General Information Section -->
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-bold text-primary-900 mb-6">
            المعلومات العامة
          </h2>
          <div class="flex flex-wrap gap-4 -mx-6">
            <div class="info-item-bordered  px-6 py-4 ">
              <label class="font-semibold text-sm text-gray-500 mb-2 block"
                >الاسم بالعربية</label
              >
              <p class="text-base font-semibold text-gray-900">
                {{ product.name_ar || "-" }}
              </p>
            </div>
            <v-divider vertical class="my-6 border-gray-300"></v-divider>
            <div class="info-item-bordered  px-6 py-4 ">
              <label class="font-semibold text-sm text-gray-500 mb-2 block"
                >الاسم بالإنجليزية</label
              >
              <p class="text-base font-semibold text-gray-900">
                {{ product.name_en || "-" }}
              </p>
            </div>
            <v-divider vertical class="my-6 border-gray-300"></v-divider>
            <div class="info-item-bordered  px-6 py-4 ">
              <label class="font-semibold text-sm text-gray-500 mb-2 block"
                >كود المنتج</label
              >
              <p class="text-base font-semibold text-gray-900">
                {{ product.code || "-" }}
              </p>
            </div>
            <v-divider vertical class="my-6 border-gray-300"></v-divider>
            <div class="info-item-bordered  px-6 py-4 ">
              <label class="font-semibold text-sm text-gray-500 mb-2 block"
                >حالة المنتج</label
              >
              <p class="text-base font-semibold text-gray-900">
                <span
                  :class="product.is_active ? 'text-green-600' : 'text-red-600'"
                >
                  {{ product.is_active ? "فعال" : "غير فعال" }}
                </span>
              </p>
            </div>
            <v-divider vertical class="my-6 border-gray-300"></v-divider>
            <div class="info-item-bordered  px-6 py-4 ">
              <label class="font-semibold text-sm text-gray-500 mb-2 block"
                >نوع المنتج</label
              >
              <p class="text-base font-semibold text-gray-900">
                {{ product.product_type || "-" }}
              </p>
            </div>
            <v-divider vertical class="my-6 border-gray-300"></v-divider>
            <div class="info-item-bordered  px-6 py-4 ">
              <label class="font-semibold text-sm text-gray-500 mb-2 block"
                >فئة المنتج</label
              >
              <p class="text-base font-semibold text-gray-900">
                {{ product.category || "-" }}
              </p>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-0 py-4 -mx-6">
            <div class="info-item-bordered px-6">
              <label class="font-semibold text-sm text-gray-500 mb-2 block"
                >الوصف عربي</label
              >
              <p class="text-sm text-gray-700 leading-relaxed">
                {{ product.description_ar || "-" }}
              </p>
            </div>

            <div class="info-item-bordered px-6 md:border-s md:border-gray-300">
              <label class="font-semibold text-sm text-gray-500 mb-2 block"
                >الوصف بالإنجليزي</label
              >
              <p class="text-sm text-gray-700 leading-relaxed">
                {{ product.description_en || "-" }}
              </p>
            </div>
          </div>
        </div>

        <!-- Pricing Section -->
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-bold text-primary-900 mb-6">الأسعار</h2>
          <div class="flex flex-wrap gap-4 -mx-6">
            <div class="info-item-bordered  px-6 py-4 ">
              <label class="font-semibold text-sm text-gray-500 mb-2 block"
                >سعر البيع</label
              >
              <p class="text-base font-semibold text-gray-900">
                {{ product.sell_price || "-" }}
              </p>
            </div>
            <v-divider vertical class="my-6 border-gray-300"></v-divider>
            <div class="info-item-bordered  px-6 py-4 ">
              <label class="font-semibold text-sm text-gray-500 mb-2 block"
                >اعلى سعر بيع</label
              >
              <p class="text-base font-semibold text-gray-900">
                {{ product.max_sell_price || "-" }}
              </p>
            </div>
            <v-divider vertical class="my-6 border-gray-300"></v-divider>
            <div class="info-item-bordered  px-6 py-4 ">
              <label class="font-semibold text-sm text-gray-500 mb-2 block"
                >اقل سعر بيع</label
              >
              <p class="text-base font-semibold text-gray-900">
                {{ product.min_sell_price || "-" }}
              </p>
            </div>
            <v-divider vertical class="my-6 border-gray-300"></v-divider>
            <div class="info-item-bordered  px-6 py-4 ">
              <label class="font-semibold text-sm text-gray-500 mb-2 block"
                >سعر الجملة</label
              >
              <p class="text-base font-semibold text-gray-900">
                {{ product.wholesale_price || "-" }}
              </p>
            </div>
          </div>
          <div class="flex flex-wrap gap-4 mt-4 -mx-6">
            <div class="info-item-bordered  px-6 py-4 ">
              <label class="font-semibold text-sm text-gray-500 mb-2 block"
                >سعر نصف الجملة</label
              >
              <p class="text-base font-semibold text-gray-900">
                {{ product.semi_wholesale_price || "-" }}
              </p>
            </div>
            <v-divider vertical class="my-6 border-gray-300"></v-divider>
            <div class="info-item-bordered  px-6 py-4 ">
              <label class="font-semibold text-sm text-gray-500 mb-2 block"
                >نوع الخصم</label
              >
              <p class="text-base font-semibold text-gray-900">
                {{ product.discount_type || "-" }}
              </p>
            </div>
            <v-divider vertical class="my-6 border-gray-300"></v-divider>
            <div class="info-item-bordered  px-6 py-4 ">
              <label class="font-semibold text-sm text-gray-500 mb-2 block"
                >قيمة الخصم</label
              >
              <p class="text-base font-semibold text-gray-900">
                {{ product.discount_value || "-" }}
              </p>
            </div>
            <v-divider vertical class="my-6 border-gray-300"></v-divider>
            <div class="info-item-bordered  px-6 py-4 ">
              <label class="font-semibold text-sm text-gray-500 mb-2 block"
                >ضريبة</label
              >
              <p class="text-base font-semibold text-gray-900">
                {{
                  product.tax_percentage ? product.tax_percentage + "%" : "-"
                }}
              </p>
            </div>
          </div>
        </div>

        <!-- الضرائب المضافة -->
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-bold text-primary-900 mb-6">
            الضرائب المضافة
          </h2>

          <!-- ضريبة 1 -->
          <div class="mb-6">
            <h3 class="text-base font-bold text-primary-600 mb-4">ضريبة 1</h3>
            <div class="flex flex-wrap gap-4 -mx-6">
              <div class="info-item-bordered  px-6 py-4 ">
                <label class="font-semibold text-sm text-gray-500 mb-2 block"
                  >اسم الضريبة المضافة</label
                >
                <p class="text-base font-semibold text-gray-900">
                  {{ product.tax1_name || "-" }}
                </p>
              </div>
              <v-divider vertical class="my-6 border-gray-300"></v-divider>
              <div class="info-item-bordered  px-6 py-4 ">
                <label class="font-semibold text-sm text-gray-500 mb-2 block"
                  >قيمة الضريبة</label
                >
                <p class="text-base font-semibold text-gray-900">
                  {{ product.tax1_value || "-" }}
                </p>
              </div>
              <v-divider vertical class="my-6 border-gray-300"></v-divider>
              <div class="info-item-bordered  px-6 py-4 ">
                <label class="font-semibold text-sm text-gray-500 mb-2 block"
                  >الأولوية</label
                >
                <p class="text-base font-semibold text-gray-900">
                  {{ product.tax1_priority || "-" }}
                </p>
              </div>
              <v-divider vertical class="my-6 border-gray-300"></v-divider>
              <div class="info-item-bordered  px-6 py-4 ">
                <label class="font-semibold text-sm text-gray-500 mb-2 block"
                  >الحد الأدنى</label
                >
                <p class="text-base font-semibold text-gray-900">
                  {{ product.tax1_min || "-" }}
                </p>
              </div>
            </div>
          </div>

          <!-- ضريبة 2 -->
          <div>
            <h3 class="text-base font-bold text-primary-600 mb-4">ضريبة 2</h3>
            <div class="flex flex-wrap gap-4 -mx-6">
              <div class="info-item-bordered  px-6 py-4 ">
                <label class="font-semibold text-sm text-gray-500 mb-2 block"
                  >اسم الضريبة المضافة</label
                >
                <p class="text-base font-semibold text-gray-900">
                  {{ product.tax2_name || "-" }}
                </p>
              </div>
              <v-divider vertical class="my-6 border-gray-300"></v-divider>
              <div class="info-item-bordered  px-6 py-4 ">
                <label class="font-semibold text-sm text-gray-500 mb-2 block"
                  >قيمة الضريبة</label
                >
                <p class="text-base font-semibold text-gray-900">
                  {{ product.tax2_value || "-" }}
                </p>
              </div>
              <v-divider vertical class="my-6 border-gray-300"></v-divider>
              <div class="info-item-bordered  px-6 py-4 ">
                <label class="font-semibold text-sm text-gray-500 mb-2 block"
                  >الأولوية</label
                >
                <p class="text-base font-semibold text-gray-900">
                  {{ product.tax2_priority || "-" }}
                </p>
              </div>
              <v-divider vertical class="my-6 border-gray-300"></v-divider>
              <div class="info-item-bordered  px-6 py-4 ">
                <label class="font-semibold text-sm text-gray-500 mb-2 block"
                  >الحد الأدنى</label
                >
                <p class="text-base font-semibold text-gray-900">
                  {{ product.tax2_min || "-" }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- التوريد والعلاقات الداخلية للمنتج -->
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-bold text-primary-900 mb-6">
            التوريد والعلاقات الداخلية للمنتج
          </h2>
          <div class="flex flex-wrap gap-4 -mx-4">
            <div class="info-item-bordered  px-4 py-4 min-w-[120px]">
              <label class="font-semibold text-sm text-gray-500 mb-2 block"
                >العلامة التجارية</label
              >
              <p class="text-base font-semibold text-gray-900">
                {{ product.brand || "-" }}
              </p>
            </div>
            <v-divider vertical class="my-6 border-gray-300"></v-divider>
            <div class="info-item-bordered  px-4 py-4 min-w-[120px]">
              <label class="font-semibold text-sm text-gray-500 mb-2 block"
                >المصنع</label
              >
              <p class="text-base font-semibold text-gray-900">
                {{ product.manufacturer || "-" }}
              </p>
            </div>
            <v-divider vertical class="my-6 border-gray-300"></v-divider>
            <div class="info-item-bordered  px-4 py-4 min-w-[120px]">
              <label class="font-semibold text-sm text-gray-500 mb-2 block"
                >بلد المنشأ</label
              >
              <p class="text-base font-semibold text-gray-900">
                {{ product.country_of_origin || "-" }}
              </p>
            </div>
            <v-divider vertical class="my-6 border-gray-300"></v-divider>
            <div class="info-item-bordered  px-4 py-4 min-w-[120px]">
              <label class="font-semibold text-sm text-gray-500 mb-2 block"
                >المنتجات البديلة</label
              >
              <p class="text-base font-semibold text-gray-900">
                {{ product.alternative_products || "-" }}
              </p>
            </div>
            <v-divider vertical class="my-6 border-gray-300"></v-divider>
            <div class="info-item-bordered  px-4 py-4 min-w-[120px]">
              <label class="font-semibold text-sm text-gray-500 mb-2 block"
                >المنتجات الملحقة</label
              >
              <p class="text-base font-semibold text-gray-900">
                {{ product.accessory_products || "-" }}
              </p>
            </div>
            <v-divider vertical class="my-6 border-gray-300"></v-divider>
            <div class="info-item-bordered  px-4 py-4 min-w-[120px]">
              <label class="font-semibold text-sm text-gray-500 mb-2 block"
                >المنتجات المرتبطة</label
              >
              <p class="text-base font-semibold text-gray-900">
                {{ product.related_products || "-" }}
              </p>
            </div>
            <v-divider vertical class="my-6 border-gray-300"></v-divider>
            <div class="info-item-bordered  px-4 py-4 min-w-[120px]">
              <label class="font-semibold text-sm text-gray-500 mb-2 block"
                >أفضل الموردين</label
              >
              <p class="text-base font-semibold text-gray-900">
                {{ product.best_suppliers || "-" }}
              </p>
            </div>
          </div>
        </div>

        <!-- سمات / خصائص المنتج المتقدمة -->
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-bold text-primary-900 mb-6">
            سمات / خصائص المنتج المتقدمة
          </h2>
          <div class="flex flex-wrap gap-4 items-center">
            <div
              v-if="product.is_manufacturable"
              class="flex items-center gap-3"
            >
              <p class="text-base text-gray-900 py-2">
                منتج تصنيع
              </p>
            </div>
            <v-divider
              v-if="product.is_sellable"
              vertical
              class="my-2 border-gray-300"
            ></v-divider>
            <div v-if="product.is_sellable" class="flex items-center gap-3">
              <p class="text-base text-gray-900 py-2">
                متاح للبيع
              </p>
            </div>
            <v-divider
              v-if="product.is_purchasable"
              vertical
              class="my-2 border-gray-300"
            ></v-divider>
            <div v-if="product.is_purchasable" class="flex items-center gap-3">
              <p class="text-base text-gray-900 py-2">
                متاح للشراء
              </p>
            </div>
            <v-divider
              v-if="product.is_barterable"
              vertical
              class="my-2 border-gray-300"
            ></v-divider>
            <div v-if="product.is_barterable" class="flex items-center gap-3">
              <p class="text-base text-gray-900 py-2">
                قابل للمقايضة
              </p>
            </div>
            <v-divider
              v-if="product.is_clearable"
              vertical
              class="my-2 border-gray-300"
            ></v-divider>
            <div v-if="product.is_clearable" class="flex items-center gap-3">
              <p class="text-base text-gray-900 py-2">
                قابل للمقاصة
              </p>
            </div>
            <v-divider
              v-if="product.is_rentable"
              vertical
              class="my-2 border-gray-300"
            ></v-divider>
            <div v-if="product.is_rentable" class="flex items-center gap-3">
              <p class="text-base text-gray-900 py-2">
                قابل للإيجار
              </p>
            </div>
            <v-divider
              v-if="product.allow_negative_sales"
              vertical
              class="my-2 border-gray-300"
            ></v-divider>
            <div
              v-if="product.allow_negative_sales"
              class="flex items-center gap-3"
            >
              <p class="text-base text-gray-900 py-2">
                البيع بالسالب
              </p>
            </div>
          </div>
        </div>

        <!-- المرفقات -->
        <div class="p-6 border-b border-primary-600 ">
          <h2 class="text-xl font-bold text-primary-900 mb-6">المرفقات</h2>
          <div
            class="border border-primary-200 rounded-lg p-4 bg-primary-50/30 inline-block cursor-pointer group transition-all hover:shadow-md shadow-none duration-300"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0 before:content-[''] before:h-8 before:w-8 before:block before:rounded-full before:bg-primary-100 relative before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:transition-all before:duration-300 group-hover:before:scale-110 group-hover:before:bg-primary-200"
                >
                  <span v-html="fileIcon2" class="text-primary-600 relative z-10"></span>
                </div>
                <div class="text-right">
                  <p class="text-sm font-semibold text-gray-900">
                    ملف مشروع البيوت
                  </p>
                  <p class="text-xs text-gray-500">200 KB - 100% uploaded</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Content: Tests -->
      <div v-if="activeTab === 'tests'">
        <!-- Test 1: اختبار التدرج الحبيبي -->
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-bold text-primary-900 mb-4">
            اختبار التدرج الحبيبي
          </h2>
          <div class="flex flex-wrap gap-4 -mx-6">
            <div class="info-item-bordered  px-6 py-4">
              <label class="font-semibold text-sm text-gray-500 mb-2 block"
                >عدد الاختبارات</label
              >
              <p class="text-base font-semibold text-gray-900">
                {{ tests.gradation.test_count }}
              </p>
            </div>
            <v-divider vertical class="my-6 border-gray-300"></v-divider>
            <div class="info-item-bordered  px-6 py-4">
              <label class="font-semibold text-sm text-gray-500 mb-2 block"
                >عدد العينات</label
              >
              <p class="text-base font-semibold text-gray-900">
                {{ tests.gradation.sample_count }}
              </p>
            </div>
            <v-divider vertical class="my-6 border-gray-300"></v-divider>
            <div class="info-item-bordered  px-6 py-4">
              <label class="font-semibold text-sm text-gray-500 mb-2 block"
                >كمية العينات</label
              >
              <p class="text-base font-semibold text-gray-900">
                {{ tests.gradation.sample_quantity }}
              </p>
            </div>
          </div>
        </div>

        <!-- Test 2: اختبار الصلابة -->
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-bold text-primary-900 mb-4">
            اختبار الصلابة
          </h2>
          <div class="flex flex-wrap gap-4 -mx-6">
            <div class="info-item-bordered  px-6 py-4">
              <label class="font-semibold text-sm text-gray-500 mb-2 block"
                >عدد الاختبارات</label
              >
              <p class="text-base font-semibold text-gray-900">
                {{ tests.hardness.test_count }}
              </p>
            </div>
            <v-divider vertical class="my-6 border-gray-300"></v-divider>
            <div class="info-item-bordered  px-6 py-4">
              <label class="font-semibold text-sm text-gray-500 mb-2 block"
                >عدد العينات</label
              >
              <p class="text-base font-semibold text-gray-900">
                {{ tests.hardness.sample_count }}
              </p>
            </div>
            <v-divider vertical class="my-6 border-gray-300"></v-divider>
            <div class="info-item-bordered  px-6 py-4">
              <label class="font-semibold text-sm text-gray-500 mb-2 block"
                >كمية العينات</label
              >
              <p class="text-base font-semibold text-gray-900">
                {{ tests.hardness.sample_quantity }}
              </p>
            </div>
          </div>
        </div>

        <!-- Test 3: اختبار التحمل -->
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-bold text-primary-900 mb-4">اختبار التحمل</h2>
          <div class="flex flex-wrap gap-4 -mx-6">
            <div class="info-item-bordered  px-6 py-4">
              <label class="font-semibold text-sm text-gray-500 mb-2 block"
                >عدد الاختبارات</label
              >
              <p class="text-base font-semibold text-gray-900">
                {{ tests.endurance.test_count }}
              </p>
            </div>
            <v-divider vertical class="my-6 border-gray-300"></v-divider>
            <div class="info-item-bordered  px-6 py-4">
              <label class="font-semibold text-sm text-gray-500 mb-2 block"
                >عدد العينات</label
              >
              <p class="text-base font-semibold text-gray-900">
                {{ tests.endurance.sample_count }}
              </p>
            </div>
            <v-divider vertical class="my-6 border-gray-300"></v-divider>
            <div class="info-item-bordered  px-6 py-4">
              <label class="font-semibold text-sm text-gray-500 mb-2 block"
                >كمية العينات</label
              >
              <p class="text-base font-semibold text-gray-900">
                {{ tests.endurance.sample_quantity }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </default-layout>
</template>

<script setup lang="ts">
import { ref } from "vue";

const activeTab = ref("general");

const homeIcon = `<svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.00016 13.1109H11.6668M7.51491 1.24755L1.86299 5.64348C1.48518 5.93734 1.29628 6.08426 1.16019 6.26826C1.03963 6.43125 0.949831 6.61487 0.895186 6.81009C0.833496 7.03048 0.833496 7.26979 0.833496 7.74842V13.7775C0.833496 14.711 0.833496 15.1777 1.01515 15.5342C1.17494 15.8478 1.42991 16.1028 1.74351 16.2625C2.10003 16.4442 2.56674 16.4442 3.50016 16.4442H13.1668C14.1003 16.4442 14.567 16.4442 14.9235 16.2625C15.2371 16.1028 15.4921 15.8478 15.6518 15.5342C15.8335 15.1777 15.8335 14.711 15.8335 13.7775V7.74842C15.8335 7.26979 15.8335 7.03048 15.7718 6.81009C15.7172 6.61487 15.6274 6.43125 15.5068 6.26826C15.3707 6.08426 15.1818 5.93734 14.804 5.64349L9.15208 1.24755C8.85931 1.01984 8.71293 0.90598 8.55129 0.862214C8.40866 0.823598 8.25833 0.823598 8.11571 0.862214C7.95407 0.90598 7.80768 1.01984 7.51491 1.24755Z" stroke="#697586" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const productIcon = `<svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
<path opacity="0.12" d="M9.33337 18.6667H46.6667V37.8001C46.6667 41.7205 46.6667 43.6806 45.9038 45.178C45.2326 46.4952 44.1618 47.566 42.8446 48.2371C41.3473 49.0001 39.3871 49.0001 35.4667 49.0001H20.5334C16.613 49.0001 14.6528 49.0001 13.1554 48.2371C11.8383 47.566 10.7674 46.4952 10.0963 45.178C9.33337 43.6806 9.33337 41.7204 9.33337 37.8001V18.6667Z" fill="#1570EF"/>
<path d="M9.33329 18.6587C8.95061 18.6488 8.67272 18.6267 8.42287 18.577C6.57165 18.2088 5.12453 16.7616 4.75629 14.9104C4.66663 14.4596 4.66663 13.9175 4.66663 12.8333C4.66663 11.7491 4.66663 11.207 4.75629 10.7562C5.12453 8.90502 6.57165 7.4579 8.42287 7.08967C8.87367 7 9.41576 7 10.5 7H45.5C46.5842 7 47.1263 7 47.5771 7.08967C49.4283 7.4579 50.8754 8.90502 51.2436 10.7562C51.3333 11.207 51.3333 11.7491 51.3333 12.8333C51.3333 13.9175 51.3333 14.4596 51.2436 14.9104C50.8754 16.7616 49.4283 18.2088 47.5771 18.577C47.3272 18.6267 47.0493 18.6488 46.6666 18.6587M23.3333 30.3333H32.6666M9.33329 18.6667H46.6666V37.8C46.6666 41.7204 46.6666 43.6805 45.9037 45.1779C45.2326 46.4951 44.1617 47.5659 42.8446 48.237C41.3472 49 39.387 49 35.4666 49H20.5333C16.6129 49 14.6527 49 13.1554 48.237C11.8382 47.5659 10.7674 46.4951 10.0962 45.1779C9.33329 43.6805 9.33329 41.7204 9.33329 37.8V18.6667Z" stroke="#1570EF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const fileIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20 12.5V6.8C20 5.11984 20 4.27976 19.673 3.63803C19.3854 3.07354 18.9265 2.6146 18.362 2.32698C17.7202 2 16.8802 2 15.2 2H8.8C7.11984 2 6.27976 2 5.63803 2.32698C5.07354 2.6146 4.6146 3.07354 4.32698 3.63803C4 4.27976 4 5.11984 4 6.8V17.2C4 18.8802 4 19.7202 4.32698 20.362C4.6146 20.9265 5.07354 21.3854 5.63803 21.673C6.27976 22 7.11984 22 8.8 22H12M14 11H8M10 15H8M16 7H8M14.5 19L16.5 21L21 16.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const fileCheckIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14 2.26953V6.40007C14 6.96012 14 7.24015 14.109 7.45406C14.2049 7.64222 14.3578 7.7952 14.546 7.89108C14.7599 8.00007 15.0399 8.00007 15.6 8.00007H19.7305M16 13H8M16 17H8M10 9H8M14 2H8.8C7.11984 2 6.27976 2 5.63803 2.32698C5.07354 2.6146 4.6146 3.07354 4.32698 3.63803C4 4.27976 4 5.11984 4 6.8V17.2C4 18.8802 4 19.7202 4.32698 20.362C4.6146 20.9265 5.07354 21.3854 5.63803 21.673C6.27976 22 7.11984 22 8.8 22H15.2C16.8802 22 17.7202 22 18.362 21.673C18.9265 21.3854 19.3854 20.9265 19.673 20.362C20 19.7202 20 18.8802 20 17.2V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const fileIcon2 = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.33268 1.51314V4.26683C9.33268 4.6402 9.33268 4.82688 9.40534 4.96949C9.46926 5.09493 9.57125 5.19692 9.69669 5.26083C9.8393 5.3335 10.026 5.3335 10.3993 5.3335H13.153M13.3327 6.65898V11.4668C13.3327 12.5869 13.3327 13.147 13.1147 13.5748C12.9229 13.9511 12.617 14.2571 12.2407 14.4488C11.8128 14.6668 11.2528 14.6668 10.1327 14.6668H5.86602C4.74591 14.6668 4.18586 14.6668 3.75803 14.4488C3.38171 14.2571 3.07575 13.9511 2.884 13.5748C2.66602 13.147 2.66602 12.5869 2.66602 11.4668V4.5335C2.66602 3.41339 2.66602 2.85334 2.884 2.42552C3.07575 2.04919 3.38171 1.74323 3.75803 1.55148C4.18586 1.3335 4.74591 1.3335 5.86602 1.3335H8.0072C8.49638 1.3335 8.74097 1.3335 8.97115 1.38876C9.17522 1.43775 9.37031 1.51856 9.54925 1.62822C9.75109 1.7519 9.92404 1.92485 10.2699 2.27075L12.3954 4.39624C12.7413 4.74214 12.9143 4.91509 13.038 5.11693C13.1476 5.29587 13.2284 5.49096 13.2774 5.69503C13.3327 5.92521 13.3327 6.1698 13.3327 6.65898Z" stroke="#1570EF" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const product = ref({
  name: "منتج مواد بناء",
  name_ar: "منتج مواد بناء",
  name_en: "Building Materials Product",
  code: "#112445",
  description: "منتج مواد بناء خاص بقلاب",
  description_ar:
    'يُدرج في مشروع "تطوير بنية تحتية" أحدث البناء مواد البناء المختلفة بصيغ للتناسب المتطلبة المعمارية والبنائية المتنوعة والمتطلبات البيئية الحديثة أيضاً',
  description_en:
    "Porttitor mi at pellentesque eu eros. Bibendum venenatis facilisis tempus pulvinar. Et imperdiet amet morbi adipiscing pulvinar condimentum.",
  is_active: true,
  product_type: "طوب",
  category: "مواد بناء",
  purchase_price: "1200 ريال",
  sell_price: "100 ريال",
  min_sell_price: "100 ريال",
  max_sell_price: "100 ريال",
  wholesale_price: "100 ريال",
  semi_wholesale_price: "100 ريال",
  discount_type: "نسبة",
  discount_value: "25%",
  tax_percentage: "25",
  tax1_name: "ضريبة القيمة المضافة",
  tax1_value: "% 25",
  tax1_priority: "عليه",
  tax1_min: "% 25",
  tax2_name: "اسم الضريبة المضافة",
  tax2_value: "ضريبة القيمة",
  tax2_priority: "الأولوية",
  tax2_min: "% 25",
  brand: "بناء مكة",
  manufacturer: "مصنع مكة",
  country_of_origin: "السعودية",
  alternative_products: "طوب",
  accessory_products: "حديد",
  related_products: "حديد، حصمة",
  best_suppliers: "قلاب",
  is_manufacturable: true,
  is_rentable: true,
  is_clearable: true,
  is_barterable: true,
  is_sellable: true,
  is_purchasable: true,
  is_available_for_projects: true,
  allow_negative_sales: false,
});

const tests = ref({
  gradation: {
    test_count: "5 اختبارات",
    sample_count: "10 عينات",
    sample_quantity: "50 كجم تقريباً للعينة الواحدة",
  },
  hardness: {
    test_count: "5 اختبارات",
    sample_count: "10 عينات",
    sample_quantity: "50 كجم تقريباً للعينة الواحدة",
  },
  endurance: {
    test_count: "5 اختبارات",
    sample_count: "10 عينات",
    sample_quantity: "50 كجم تقريباً للعينة الواحدة",
  },
});
</script>

<style scoped>
.info-item-bordered {
  min-width: 0;
}
</style>
