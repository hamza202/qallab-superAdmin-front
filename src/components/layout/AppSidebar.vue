<template>
  <v-navigation-drawer v-model="drawerProxy" app width="230" :rail="!isMobile && isCollapsed"
    :expand-on-hover="!isMobile && isCollapsed" :permanent="!isMobile" :temporary="isMobile"
    :location="localeStore.isRtl ? 'right' : 'left'"
    class="py-4 lg:ms-2 max-h-[94vh] border-0 bg-gray-50 !border-t-4 !border-qallab-blue q-sidebar-drawer relative"
    :class="{ 'pt-0 pb-0 min-h-[100vh]': isMobile }" @mouseenter="isDrawerHovered = true"
    @mouseleave="isDrawerHovered = false">
    <div
      class="q-sidebar-scroll bg-primary-800 text-white pt-7 pb-4 flex flex-col justify-between w-100 h-100 rounded-[24px] max-h-100"
      :class="{ 'pt-0 rounded-none': isMobile }">
      <div class="flex flex-col gap-4">
        <div class="flex justify-center mb-2 px-3">
          <img src="@/assets/logo-light.svg" alt="Qallab logo" class="w-15" v-if="isSidebarExpanded" />
          <img src="@/assets/vectors/qallab-favicon.svg" alt="" class="w-15" v-else />
        </div>
        <div class="q-sidebar-toggle z-10" v-if="!isMobile">
          <v-btn size="x-small" icon class="bg-qallab-yellow text-white shadow-md !rounded-full"
            @click="toggleCollapse">
            <v-icon size="20">{{
              localeStore.isRtl
                ? (isCollapsed ? "mdi-chevron-left" : "mdi-chevron-right")
                : (isCollapsed ? "mdi-chevron-right" : "mdi-chevron-left")
            }}</v-icon>
          </v-btn>
        </div>

        <v-list :opened="openGroups" density="compact" nav class="text-sm px-0 space-y-1"
          active-class="bg-white !text-qallab-blue !font-bold relative before:absolute before:content-[''] before:inset-y-1 before:start-[-16px] before:bottom-[5px] before:w-1.5 before:bg-qallab-yellow before:rounded-e-lg ">
          <!-- الرئيسية -->
          <v-list-item to="/" value="home" :class="{ '!mx-1 gap-5': !isSidebarExpanded }"
            class="mx-4 px-2 py-1.5 !ps-[11px] rounded-lg text-white hover:bg-primary-700/40 transition flex items-center justify-start gap-2">
            <template #title> {{ t('navigation.sidebar.main.home') }} </template>
            <template #prepend>
              <div class="bg-qallab-yellow text-white rounded-md w-6 h-6 flex items-center justify-center">
                <span v-html="homeIcon"></span>
              </div>
            </template>
          </v-list-item>

          <!-- المنتجات -->
          <v-list-group v-if="hasAnyProductPermission" value="products" class="mt-1">
            <template #activator="{ props, isOpen }">
              <v-list-item v-bind="props" :class="[
                { '!mx-1 gap-5': !isSidebarExpanded },
                isProductsActive ? 'bg-white !text-[#1570EF]' : '',
                '!ps-[11px]',
              ]"
                class="px-2 py-1.5 mx-4 rounded-lg hover:bg-primary-700/40 text-white flex items-center justify-between gap-2">
                <template #append>
                  <v-icon size="20" :class="[
                    'ms-auto transition-transform',
                    isOpen ? 'rotate-180' : '',
                    isProductsActive ? '!text-[#1570EF]' : '',
                  ]">mdi-chevron-down</v-icon>
                </template>
                <template #title>
                  <div class="flex-1">
                    <span class="font-semibold" :class="isProductsActive ? '!text-[#1570EF]' : ''">{{ t('navigation.sidebar.products.title') }}</span>
                  </div>
                </template>
                <template #prepend>
                  <div class="bg-qallab-yellow text-white rounded-md w-6 h-6 flex items-center justify-center">
                    <span v-html="productsIcon"></span>
                  </div>
                </template>
              </v-list-item>
            </template>
            <div class="relative mt-1 ps-10 pe-4 text-sm">
              <h2 v-if="hasAnyProductsManagementPermission" class="text-sm font-medium leading-5 mb-2">{{ t('navigation.sidebar.products.management.title') }}
              </h2>
              <ul v-if="hasAnyProductsManagementPermission"
                class="space-y-2 text-slate-100 text-xs list-disc list-outside ps-5">
                <li v-if="canViewProducts" class="relative">
                  <router-link to="/simple-products/list" :class="[
                    isMenuItemActive('/simple-products/list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.products.management.simpleProducts') }}
                  </router-link>
                </li>
                <li v-if="canViewGroupedProducts" class="relative">
                  <router-link to="/group-products/list" :class="[
                    isMenuItemActive('/group-products/list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.products.management.groupProducts') }}</router-link>
                </li>
                <li v-if="canViewBuildingMaterialPriceLists" class="relative">
                  <router-link to="/products/building-material-products-prices" :class="[
                    isMenuItemActive(
                      '/products/building-material-products-prices'
                    )
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.products.management.buildingMaterialPriceLists') }}</router-link>
                </li>
                <li v-if="canViewGeneralPriceLists" class="relative">
                  <router-link to="/products/general-products-prices" :class="[
                    isMenuItemActive('/products/general-products-prices')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.products.management.generalPriceLists') }}</router-link>
                </li>
                <li v-if="canViewProductionCapacity" class="relative">
                  <router-link to="/products/production-capacity" :class="[
                    isMenuItemActive('/products/production-capacity')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.products.management.productionCapacity') }}</router-link>
                </li>
              </ul>
              <h2 v-if="showProductSettingsSection" class="text-sm font-medium leading-5 my-2">
                {{ t('navigation.sidebar.products.settings.title') }}
              </h2>
              <ul v-if="showProductSettingsSection"
                class="space-y-2 text-slate-100 text-xs list-disc list-outside ps-5">
                <li v-if="canViewProductVariables" class="relative">
                  <router-link to="/product-variables/list" :class="[
                    isMenuItemActive('/product-variables/list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.products.settings.productVariables') }}
                  </router-link>
                </li>
                <!-- <li v-if="canViewProductSettings" class="relative">
                  <router-link to="/products/product-settings" :class="[
                    isMenuItemActive('/products/product-settings')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    اعدادات جدول المنتجات</router-link>
                </li> -->
              </ul>
            </div>
          </v-list-group>

          <!-- الخدمات -->
          <v-list-group v-if="hasAnyServicePermission" value="services" class="mt-1">
            <template #activator="{ props, isOpen }">
              <v-list-item v-bind="props" :class="[
                { '!mx-1 gap-5': !isSidebarExpanded },
                isServicesActive ? 'bg-white !text-[#1570EF]' : '',
                '!ps-[11px]',
              ]"
                class="px-2 py-1.5 mx-4 rounded-lg hover:bg-primary-700/40 text-white flex items-center justify-between gap-2">
                <template #append>
                  <v-icon size="20" :class="[
                    'ms-auto transition-transform',
                    isOpen ? 'rotate-180' : '',
                    isServicesActive ? '!text-[#1570EF]' : '',
                  ]">mdi-chevron-down</v-icon>
                </template>
                <template #title>
                  <div class="flex-1">
                    <span class="font-semibold" :class="isServicesActive ? '!text-[#1570EF]' : ''">{{ t('navigation.sidebar.services.title') }}</span>
                  </div>
                </template>
                <template #prepend>
                  <div class="bg-qallab-yellow text-white rounded-md w-6 h-6 flex items-center justify-center">
                    <span v-html="servicesIcon"></span>
                  </div>
                </template>
              </v-list-item>
            </template>
            <div class="relative mt-1 ps-10 pe-4 text-sm">
              <ul class="space-y-2 text-slate-100 mb-3">
                <li v-if="canViewServices" class="relative">
                  <router-link to="/services/list" :class="[
                    isMenuItemActive('/services/list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.services.servicesManagement') }}
                  </router-link>
                </li>
                <!-- <li v-if="canViewSubscriptions" class="relative">
                  <router-link to="/services/subscriptions" :class="[
                    isMenuItemActive('/services/subscriptions')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    إدارة الاشتراكات</router-link>
                </li> -->
                <li v-if="canViewPriceLists" class="relative">
                  <router-link to="/services/prices-list" :class="[
                    isMenuItemActive('/services/prices-list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.services.priceListsManagement') }}</router-link>
                </li>
                <!-- <li v-if="canViewServiceSettings" class="relative">
                  <router-link to="/services/service-settings" :class="[
                    isMenuItemActive('/services/service-settings')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    إدارة إعدادات الخدمات</router-link>
                </li> -->
              </ul>
            </div>
          </v-list-group>

          <!-- المبيعات -->
          <v-list-group v-if="hasAnySalesPermission" value="sales" class="mt-1">
            <template #activator="{ props, isOpen }">
              <v-list-item v-bind="props" :class="[
                { '!mx-1 gap-5': !isSidebarExpanded },
                isSalesActive ? 'bg-white !text-[#1570EF]' : '',
                '!ps-[11px]',
              ]"
                class="px-2 py-1.5 mx-4 rounded-lg hover:bg-primary-700/40 text-white flex items-center justify-between gap-2">
                <template #append>
                  <v-icon size="20" :class="[
                    'ms-auto transition-transform',
                    isOpen ? 'rotate-180' : '',
                    isSalesActive ? '!text-[#1570EF]' : '',
                  ]">mdi-chevron-down</v-icon>
                </template>
                <template #title>
                  <div class="flex-1">
                    <span class="font-semibold" :class="isSalesActive ? '!text-[#1570EF]' : ''">{{ t('navigation.sidebar.sales.title') }}</span>
                  </div>
                </template>
                <template #prepend>
                  <div class="bg-qallab-yellow text-white rounded-md w-6 h-6 flex items-center justify-center">
                    <span v-html="salesIcon"></span>
                  </div>
                </template>
              </v-list-item>
            </template>
            <div class="relative mt-1 ps-10 pe-4 text-sm">
              <h2 v-if="showSalesCustomersSection" class="text-sm font-medium leading-5 mb-2">{{ t('navigation.sidebar.sales.customers.title') }}</h2>
              <ul v-if="showSalesCustomersSection" class="space-y-2 text-slate-100 text-xs list-disc list-outside ps-5">
                <li v-if="canViewCustomers" class="relative">
                  <router-link to="/customers/list" :class="[
                    isMenuItemActive('/customers/list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.sales.customers.customersList') }}
                  </router-link>
                </li>
                <!-- <li v-if="canViewSalesInvoices" class="relative">
                  <router-link to="/sales/invoices" :class="[
                    isMenuItemActive('/sales/invoices')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">إدارة فواتير المبيعات</router-link>
                </li> -->
                <!-- <li v-if="canViewSalesOrders" class="relative">
                  <router-link to="/sales/orders/material-product/list" :class="[
                    isMenuItemActive('/sales/orders/material-product')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">إدارة طلبات المبيعات</router-link>
                </li> -->
                <!-- <li v-if="canViewContracts" class="relative">
                  <router-link to="/sales/contracts" :class="[
                    isMenuItemActive('/sales/contracts')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">إدارة العقود</router-link>
                </li>
                <li v-if="canViewClearing" class="relative">
                  <router-link to="/sales/clearing" :class="[
                    isMenuItemActive('/sales/clearing')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">إدارة المقاصة</router-link>
                </li> -->
              </ul>
              <h2 v-if="showSalesQuotationsSection" class="text-sm font-medium leading-5 my-2">
                {{ t('navigation.sidebar.sales.quotations.title') }}
              </h2>
              <ul v-if="showSalesQuotationsSection"
                class="space-y-2 text-slate-100 text-xs list-disc list-outside ps-5">
                <li v-if="canViewSalesBuildingMaterialSR" class="relative">
                  <router-link to="/sales/requests/material-product/list" :class="[
                    isMenuItemActive('/sales/requests/material-product')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.sales.quotations.materialRequests') }}</router-link>
                </li>
                <li v-if="canViewSalesBuildingMaterialSQ" class="relative">
                  <router-link to="/sales/quotations/material-product/list" :class="[
                    isMenuItemActive('/sales/quotations/material-product')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.sales.quotations.materialQuotations') }}</router-link>
                </li>
                <li v-if="canViewSalesFuelSR" class="relative">
                  <router-link to="/sales/requests/fuels/list" :class="[
                    $route.path.includes('/sales/requests/fuels')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.sales.quotations.fuelRequests') }}
                  </router-link>
                </li>
                <li v-if="canViewSalesFuelSQ" class="relative">
                  <router-link to="/sales/quotations/fuels/list" :class="[
                    $route.path.includes('/sales/quotations/fuels')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.sales.quotations.fuelQuotations') }}</router-link>
                </li>
                <li v-if="canViewSalesLogisticsSR" class="relative">
                  <router-link to="/sales/requests/logistics/list"
                    :class="[isMenuItemActive('/sales/requests/logistics') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                    {{ t('navigation.sidebar.sales.quotations.logisticsRequests') }}</router-link>
                </li>
                <li v-if="canViewSalesLogisticsSQ" class="relative">
                  <router-link to="/sales/quotations/logistics/list"
                    :class="[isMenuItemActive('/sales/quotations/logistics') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                    {{ t('navigation.sidebar.sales.quotations.logisticsQuotations') }}</router-link>
                </li>

              </ul>

              <h2 v-if="showSalesOrdersSection" class="text-sm font-medium leading-5 my-2">
                {{ t('navigation.sidebar.sales.orders.title') }}
              </h2>
              <ul v-if="showSalesOrdersSection" class="space-y-2 text-slate-100 text-xs list-disc list-outside ps-5">
                <li v-if="canViewSalesBuildingMaterialSO" class="relative">
                  <router-link to="/sales/orders/material-product/list" :class="[
                    isMenuItemActive('/sales/orders/material-product')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.sales.orders.materialOrders') }}</router-link>
                </li>
                <li v-if="canViewSalesFuelSO" class="relative">
                  <router-link to="/sales/orders/fuels/list" :class="[
                    $route.path.includes('/sales/orders/fuels')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.sales.orders.fuelOrders') }}</router-link>
                </li>
                <li v-if="canViewSalesLogisticsSO" class="relative">
                  <router-link to="/sales/orders/logistics/list" :class="[
                    $route.path.includes('/sales/orders/logistics')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.sales.orders.logisticsOrders') }}</router-link>
                </li>
                <li v-if="canViewSalesSoPickups" class="relative">
                  <router-link to="/sales/so-pickups/list" :class="[
                    $route.path.includes('/sales/so-pickups')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.sales.orders.pickups') }}</router-link>
                </li>
                <li v-if="canViewSalesTripManagement" class="relative">
                  <router-link to="/sales/trips/list"
                    :class="[$route.path.includes('/sales/trips') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                    {{ t('navigation.sidebar.sales.orders.trips') }}</router-link>
                </li>
              </ul>
              <h2 v-if="showSalesDeliveryDocsSection" class="text-sm font-medium leading-5 my-2">
                {{ t('navigation.sidebar.sales.deliveryDocs.title') }}
              </h2>
              <ul v-if="showSalesDeliveryDocsSection"
                class="space-y-2 text-slate-100 text-xs list-disc list-outside ps-5">
                <li v-if="canViewSalesDeliveryDocs" class="relative">
                  <router-link to="/sales/delivery-docs/list" :class="[
                    $route.path.includes('/sales/delivery-docs') && !$route.path.includes('/sales/delivery-docs-logistics')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.sales.deliveryDocs.deliveryDocs') }}</router-link>
                </li>
                <li v-if="canViewSalesLogisticsDeliveryDocs" class="relative">
                  <router-link to="/sales/delivery-docs-logistics/list" :class="[
                    $route.path.includes('/sales/delivery-docs-logistics')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.sales.deliveryDocs.logisticsDeliveryDocs') }}</router-link>
                </li>
              </ul>
              <h2 v-if="showSalesInvoicesSection" class="text-sm font-medium leading-5 my-2">
                {{ t('navigation.sidebar.sales.invoices.title') }}
              </h2>
              <ul v-if="showSalesInvoicesSection"
                class="space-y-2 text-slate-100 text-xs list-disc list-outside ps-5 mb-3">
                <li v-if="canViewSalesSaleInvoices" class="relative">
                  <router-link to="/sales/invoices/list" :class="[
                    isMenuItemActive('/sales/invoices')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.sales.invoices.salesInvoices') }}</router-link>
                </li>
                <li v-if="canViewSalesLogisticsSaleInvoices" class="relative">
                  <router-link to="/sales/logistics-invoices/list" :class="[
                    isMenuItemActive('/sales/logistics-invoices')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.sales.invoices.logisticsSaleInvoices') }}</router-link>
                </li>
                <li v-if="canViewSalesSaleInvoices" class="relative">
                  <router-link to="/sales/payments/list" :class="[
                    isMenuItemActive('/sales/payments')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.sales.invoices.payments') }}</router-link>
                </li>
              </ul>
            </div>
          </v-list-group>

          <!-- المشاريع -->
          <!-- <v-list-group v-if="hasAnyProjectsPermission" value="projects" class="mt-1">
            <template #activator="{ props, isOpen }">
              <v-list-item v-bind="props" :class="[
                { '!mx-1 gap-5': !isSidebarExpanded },
                isProjectsActive ? 'bg-white !text-[#1570EF]' : '',
                '!ps-[11px]',
              ]"
                class="px-2 py-1.5 mx-4 rounded-lg hover:bg-primary-700/40 text-white flex items-center justify-between gap-2">
                <template #append>
                  <v-icon size="20" :class="[
                    'ms-auto transition-transform',
                    isOpen ? 'rotate-180' : '',
                    isProjectsActive ? '!text-[#1570EF]' : '',
                  ]">mdi-chevron-down</v-icon>
                </template>
                <template #title>
                  <div class="flex-1">
                    <span class="font-semibold" :class="isProjectsActive ? '!text-[#1570EF]' : ''">المشاريع</span>
                  </div>
                </template>
                <template #prepend>
                  <div class="bg-qallab-yellow text-white rounded-md w-6 h-6 flex items-center justify-center">
                    <span v-html="projectsIcon"></span>
                  </div>
                </template>
              </v-list-item>
            </template>
            <div class="relative mt-1 ps-10 pe-4 text-sm">
              <ul class="space-y-2 text-slate-100">
                <li v-if="canViewProjects" class="relative">
                  <router-link to="/projects/list" :class="[
                    isMenuItemActive('/projects/list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    إدارة المشاريع
                  </router-link>
                </li>
                <li v-if="canViewProjectScheduling" class="relative">
                  <router-link to="/projects/scheduling" :class="[
                    isMenuItemActive('/projects/scheduling')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">إدارة جدولة المشاريع</router-link>
                </li>
              </ul>
            </div>
          </v-list-group> -->

          <!-- المشتريات -->
          <v-list-group v-if="hasAnyPurchasesPermission" value="purchases" class="mt-1">
            <template #activator="{ props, isOpen }">
              <v-list-item v-bind="props" :class="[
                { '!mx-1 gap-5': !isSidebarExpanded },
                isPurchasesActive ? 'bg-white !text-[#1570EF]' : '',
                '!ps-[11px]',
              ]"
                class="px-2 py-1.5 mx-4 rounded-lg hover:bg-primary-700/40 text-white flex items-center justify-between gap-2">
                <template #append>
                  <v-icon size="20" :class="[
                    'ms-auto transition-transform',
                    isOpen ? 'rotate-180' : '',
                    isPurchasesActive ? '!text-[#1570EF]' : '',
                  ]">mdi-chevron-down</v-icon>
                </template>
                <template #title>
                  <div class="flex-1">
                    <span class="font-semibold" :class="isPurchasesActive ? '!text-[#1570EF]' : ''">{{ t('navigation.sidebar.purchases.title') }}</span>
                  </div>
                </template>
                <template #prepend>
                  <div class="bg-qallab-yellow text-white rounded-md w-6 h-6 flex items-center justify-center">
                    <span v-html="purchasesIcon"></span>
                  </div>
                </template>
              </v-list-item>
            </template>
            <div class="relative mt-1 ps-10 pe-4 text-sm">
              <h2 v-if="showPurchasesSuppliersSection" class="text-sm font-medium leading-5 mb-2">{{ t('navigation.sidebar.purchases.suppliers.title') }}</h2>
              <ul v-if="showPurchasesSuppliersSection"
                class="space-y-2 text-slate-100 text-xs list-disc list-outside ps-5">
                <li v-if="canViewSuppliers" class="relative">
                  <router-link to="/suppliers/list" :class="[
                    isMenuItemActive('/suppliers/list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.purchases.suppliers.suppliersManagement') }}
                  </router-link>
                </li>
                <!-- <li v-if="canViewSupplierSettlements" class="relative">
                  <router-link to="/suppliers/supplier-settlement" :class="[
                    isMenuItemActive('/suppliers/supplier-settlement')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    تسوية حساب موردين</router-link>
                </li> -->
              </ul>
              <h2 v-if="showPurchasesQuotationsSection" class="text-sm font-medium leading-5 my-2">
                {{ t('navigation.sidebar.purchases.quotations.title') }}
              </h2>
              <ul v-if="showPurchasesQuotationsSection"
                class="space-y-2 text-slate-100 text-xs list-disc list-outside ps-5">
                <!-- <li  class="relative">
                                    v-if="canViewRequestForQuotations"
                                    <router-link to="/purchases/requests/request-for-quotation/create"
                                        :class="[isMenuItemActive('/purchases/requests/request-for-quotation') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        طلب عروض الأسعار</router-link>
                                </li> -->
                <li v-if="canViewPurchasesBuildingMaterialPR" class="relative">
                  <router-link to="/purchases/requests/material-product/list" :class="[
                    isMenuItemActive('/purchases/requests/material-product')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.purchases.quotations.materialRequests') }}</router-link>
                </li>
                <li v-if="canViewPurchasesBuildingMaterialPQ" class="relative">
                  <router-link to="/purchases/quotations/material-product/list" :class="[
                    isMenuItemActive('/purchases/quotations/material-product')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.purchases.quotations.materialQuotations') }}</router-link>
                </li>
                <li v-if="canViewPurchasesLogisticsPR" class="relative">
                  <router-link to="/purchases/requests/logistics/list"
                    :class="[isMenuItemActive('/purchases/requests/logistics') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                    {{ t('navigation.sidebar.purchases.quotations.logisticsRequests') }}</router-link>
                </li>
                <li v-if="canViewPurchasesLogisticsPQ" class="relative">
                  <router-link to="/purchases/quotations/logistics/list" :class="[
                    isMenuItemActive('/purchases/quotations/logistics')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.purchases.quotations.logisticsQuotations') }}</router-link>
                </li>

                <li v-if="canViewPurchasesFuelPR" class="relative">
                  <router-link to="/purchases/requests/fuels/list" :class="[
                    isMenuItemActive('/purchases/requests/fuels')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.purchases.quotations.fuelRequests') }}</router-link>
                </li>
                <li v-if="canViewPurchasesFuelPQ" class="relative">
                  <router-link to="/purchases/quotations/fuels/list" :class="[
                    isMenuItemActive('/purchases/quotations/fuels')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.purchases.quotations.fuelQuotations') }}</router-link>
                </li>
              </ul>
              <h2 v-if="showPurchasesOrdersSection" class="text-sm font-medium leading-5 my-2">
                {{ t('navigation.sidebar.purchases.orders.title') }}
              </h2>
              <ul v-if="showPurchasesOrdersSection"
                class="space-y-2 text-slate-100 text-xs list-disc list-outside ps-5">
                <li v-if="canViewPurchasesBuildingMaterialPO" class="relative">
                  <router-link to="/purchases/orders/material-product/list" :class="[
                    isMenuItemActive('/purchases/orders/material-product')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.purchases.orders.materialOrders') }}</router-link>
                </li>
                <li v-if="canViewPurchasesLogisticsPO" class="relative">
                  <router-link to="/purchases/orders/logistics/list"
                    :class="isMenuItemActive('/purchases/orders/logistics') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow'">
                    {{ t('navigation.sidebar.purchases.orders.logisticsOrders') }}</router-link>
                </li>
                <li v-if="canViewPurchasesFuelPO" class="relative">
                  <router-link to="/purchases/orders/fuels/list" :class="[
                    isMenuItemActive('/purchases/orders/fuels')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.purchases.orders.fuelOrders') }}</router-link>
                </li>
              </ul>
              <h2 v-if="showPurchasesReceivingDocsSection" class="text-sm font-medium leading-5 my-2">
                {{ t('navigation.sidebar.purchases.receivingDocs.title') }}
              </h2>
              <ul v-if="showPurchasesReceivingDocsSection"
                class="space-y-2 text-slate-100 text-xs list-disc list-outside ps-5">
                <li v-if="canViewPurchasesReceivingDocs" class="relative">
                  <router-link to="/purchases/receiving-docs/list" :class="[
                    isMenuItemActive('/purchases/receiving-docs') && !$route.path.includes('/purchases/receiving-docs-logistics')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.purchases.receivingDocs.receivingDocs') }}</router-link>
                </li>
                <li v-if="canViewPurchasesLogisticsReceivingDocs" class="relative">
                  <router-link to="/purchases/receiving-docs-logistics/list" :class="[
                    $route.path.includes('/purchases/receiving-docs-logistics')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.purchases.receivingDocs.logisticsReceivingDocs') }}</router-link>
                </li>
              </ul>
              <h2 v-if="showPurchasesInvoicesSection" class="text-sm font-medium leading-5 my-2">
                {{ t('navigation.sidebar.purchases.invoices.title') }}
              </h2>
              <ul v-if="showPurchasesInvoicesSection"
                class="space-y-2 text-slate-100 text-xs list-disc list-outside ps-5">
                <li v-if="canViewPurchaseInvoices" class="relative">
                  <router-link to="/purchases/invoices/list" :class="[
                    $route.path.includes('/purchases/invoices') && !$route.path.includes('/purchases/invoices/logistics')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.purchases.invoices.purchaseInvoices') }}</router-link>
                </li>
                <li v-if="canViewLogisticsPurchaseInvoices" class="relative">
                  <router-link to="/purchases/invoices/logistics/list" :class="[
                    $route.path.includes('/purchases/invoices/logistics')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.purchases.invoices.logisticsPurchaseInvoices') }}</router-link>
                </li>
              </ul>
            </div>
          </v-list-group>

          <!-- المالية -->
          <v-list-group v-if="hasAnyFinancePermission" value="finance" class="mt-1">
            <template #activator="{ props, isOpen }">
              <v-list-item v-bind="props" :class="[
                { '!mx-1 gap-5': !isSidebarExpanded },
                isFinanceActive ? 'bg-white !text-[#1570EF]' : '',
                '!ps-[11px]',
              ]"
                class="px-2 py-1.5 mx-4 rounded-lg hover:bg-primary-700/40 text-white flex items-center justify-between gap-2">
                <template #append>
                  <v-icon size="20" :class="[
                    'ms-auto transition-transform',
                    isOpen ? 'rotate-180' : '',
                    isFinanceActive ? '!text-[#1570EF]' : '',
                  ]">mdi-chevron-down</v-icon>
                </template>
                <template #title>
                  <div class="flex-1">
                    <span class="font-semibold" :class="isFinanceActive ? '!text-[#1570EF]' : ''">{{ t('navigation.sidebar.finance.title') }}</span>
                  </div>
                </template>
                <template #prepend>
                  <div class="bg-qallab-yellow text-white rounded-md w-6 h-6 flex items-center justify-center">
                    <span v-html="financeIcon"></span>
                  </div>
                </template>
              </v-list-item>
            </template>
            <div class="relative mt-1 ps-10 pe-4 text-sm pb-2">
              <ul class="space-y-2 text-slate-100">
                <li v-if="canViewReceiptPaymentTransactions" class="relative">
                  <router-link to="/finance/vouchers/list" :class="[
                    isMenuItemActive('/finance/vouchers/list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.finance.financialDashboard') }}
                  </router-link>
                </li>
                <li class="relative" v-if="canViewTreasuryManagement">
                  <router-link to="/banks/list" :class="[
                    isMenuItemActive('/banks/list') || isMenuItemActive('/treasuries/list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.finance.banksAndTreasuries') }}
                  </router-link>
                </li>
                <!-- <li v-if="canViewPaymentVouchers" class="relative">
                  <router-link to="/finance/payment-vouchers" :class="[
                    isMenuItemActive('/finance/paّyment-vouchers')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">إدارة سندات الصرف</router-link>
                </li>
                <li v-if="canViewReceiptVouchers" class="relative">
                  <router-link to="/finance/receipt-vouchers" :class="[
                    isMenuItemActive('/finance/receipt-vouchers')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">إدارة سندات القبض</router-link>
                </li> -->
              </ul>
            </div>
          </v-list-group>

          <!-- المستخدمين -->
          <v-list-group v-if="hasAnyUsersPermission" value="users" class="mt-1">
            <template #activator="{ props, isOpen }">
              <v-list-item v-bind="props" :class="[
                { '!mx-1 gap-5': !isSidebarExpanded },
                isUsersActive ? 'bg-white !text-[#1570EF]' : '',
                '!ps-[11px]',
              ]"
                class="px-2 py-1.5 mx-4 rounded-lg hover:bg-primary-700/40 text-white flex items-center justify-between gap-2">
                <template #append>
                  <v-icon size="20" :class="[
                    'ms-auto transition-transform',
                    isOpen ? 'rotate-180' : '',
                    isUsersActive ? '!text-[#1570EF]' : '',
                  ]">mdi-chevron-down</v-icon>
                </template>
                <template #title>
                  <div class="flex-1">
                    <span class="font-semibold" :class="isUsersActive ? '!text-[#1570EF]' : ''">{{ t('navigation.sidebar.users.title') }}</span>
                  </div>
                </template>
                <template #prepend>
                  <div class="bg-qallab-yellow text-white rounded-md w-6 h-6 flex items-center justify-center">
                    <span v-html="usersIcon"></span>
                  </div>
                </template>
              </v-list-item>
            </template>

            <div class="relative mt-1 ps-10 pe-4 text-sm">
              <ul class="space-y-2 text-slate-100">
                <li v-if="canViewUsers || canViewRoles" class="relative">
                  <router-link to="/users/list" :class="[
                    isMenuItemActive('/users/list') ||
                      isMenuItemActive('/roles/list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.users.usersAndRoles') }}
                  </router-link>
                </li>
                <li v-if="canViewCrushers" class="relative">
                  <router-link to="/crushers/list" :class="[
                    isMenuItemActive('/crushers/list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.users.crushersManagement') }}</router-link>
                </li>
                <li v-if="canViewContractors" class="relative">
                  <router-link to="/contractors/list" :class="[
                    isMenuItemActive('/contractors/list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.users.contractorsManagement') }}</router-link>
                </li>
                <li class="relative">
                  <router-link to="/factories-management/list" :class="[
                    isMenuItemActive('/factories-management/list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.users.factoriesManagement') }}</router-link>
                </li>
                <li v-if="canViewLogistics" class="relative">
                  <router-link to="/logistics/list" :class="[
                    isMenuItemActive('/logistics/list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.users.logisticsManagement') }}
                  </router-link>
                </li>
                <li v-if="canViewLogistics" class="relative">
                  <router-link to="/material-merchants/list" :class="[
                    isMenuItemActive('/material-merchants/list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.users.materialMerchants') }}
                  </router-link>
                </li>
              </ul>
            </div>
          </v-list-group>

          <!-- اللوجستيات -->
          <!-- <v-list-group value="logistics" class="mt-1">
                        <template #activator="{ props, isOpen }">
                            <v-list-item v-bind="props"
                                :class="[{ '!mx-1 gap-5': !isSidebarExpanded }, isLogisticsActive ? 'bg-white !text-[#1570EF]' : '', '!ps-[11px]']"
                                class="px-2 py-1.5 mx-4 rounded-lg hover:bg-primary-700/40 text-white flex items-center justify-between gap-2">
                                <template #append>
                                    <v-icon size="20"
                                        :class="['ms-auto transition-transform', isOpen ? 'rotate-180' : '', isLogisticsActive ? '!text-[#1570EF]' : '']">mdi-chevron-down</v-icon>
                                </template>
                                <template #title>
                                    <div class="flex-1"><span class="font-semibold"
                                            :class="isLogisticsActive ? '!text-[#1570EF]' : ''">اللوجستيات</span></div>
                                </template>
                                <template #prepend>
                                    <div
                                        class="bg-qallab-yellow text-white rounded-md w-6 h-6 flex items-center justify-center">
                                        <span v-html="logisticsIcon"></span>
                                    </div>
                                </template>
                            </v-list-item>
                        </template>
                        <div class="relative mt-1 ps-10 pe-4 text-sm">
                            <ul class="space-y-2 text-slate-100">
                                <li class="relative">
                                    <router-link to="/logistics/transport-orders"
                                        :class="[isMenuItemActive('/logistics/transport-orders') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        طلبات
                                        النقل </router-link>
                                </li>
                                <li class="relative">
                                    <router-link to="/logistics/transport-invoices"
                                        :class="[isMenuItemActive('/logistics/transport-invoices') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">فواتير
                                        النقل</router-link>
                                </li>
                            </ul>

                        </div>
                    </v-list-group> -->

          <!-- التقارير -->
          <!-- <v-list-group v-if="hasAnyReportsPermission" value="reports" class="mt-1">
            <template #activator="{ props, isOpen }">
              <v-list-item v-bind="props" :class="[
                { '!mx-1 gap-5': !isSidebarExpanded },
                isReportsActive ? 'bg-white !text-[#1570EF]' : '',
                '!ps-[11px]',
              ]"
                class="px-2 py-1.5 mx-4 rounded-lg hover:bg-primary-700/40 text-white flex items-center justify-between gap-2">
                <template #append>
                  <v-icon size="20" :class="[
                    'ms-auto transition-transform',
                    isOpen ? 'rotate-180' : '',
                    isReportsActive ? '!text-[#1570EF]' : '',
                  ]">mdi-chevron-down</v-icon>
                </template>
                <template #title>
                  <div class="flex-1">
                    <span class="font-semibold" :class="isReportsActive ? '!text-[#1570EF]' : ''">التقارير</span>
                  </div>
                </template>
                <template #prepend>
                  <div class="bg-qallab-yellow text-white rounded-md w-6 h-6 flex items-center justify-center">
                    <span v-html="reportsIcon"></span>
                  </div>
                </template>
              </v-list-item>
            </template>
            <div class="relative mt-1 ps-10 pe-4 text-sm">
              <ul class="space-y-2 text-slate-100">
                <li v-if="canViewSalesReports" class="relative">
                  <router-link to="/reports/sales" :class="[
                    isMenuItemActive('/reports/sales')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">تقارير المبيعات</router-link>
                </li>
                <li v-if="canViewPurchaseReports" class="relative">
                  <router-link to="/reports/purchases" :class="[
                    isMenuItemActive('/reports/purchases')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">تقارير المشتريات</router-link>
                </li>
              </ul>
            </div>
          </v-list-group> -->

          <!-- الإعدادات -->
          <v-list-group v-if="hasAnySettingsPermission" value="settings" class="mt-1">
            <template #activator="{ props, isOpen }">
              <v-list-item v-bind="props" :class="[
                { '!mx-1 gap-5': !isSidebarExpanded },
                isSettingsActive ? 'bg-white !text-[#1570EF]' : '',
                '!ps-[11px]',
              ]"
                class="px-2 py-1.5 mx-4 rounded-lg hover:bg-primary-700/40 text-white flex items-center justify-between gap-2">
                <template #append>
                  <v-icon size="20" :class="[
                    'ms-auto transition-transform',
                    isOpen ? 'rotate-180' : '',
                    isSettingsActive ? '!text-[#1570EF]' : '',
                  ]">mdi-chevron-down</v-icon>
                </template>
                <template #title>
                  <div class="flex-1">
                    <span class="font-semibold" :class="isSettingsActive ? '!text-[#1570EF]' : ''">{{ t('navigation.sidebar.settings.title') }}</span>
                  </div>
                </template>
                <template #prepend>
                  <div class="bg-qallab-yellow text-white rounded-md w-6 h-6 flex items-center justify-center">
                    <span v-html="settingsIcon"></span>
                  </div>
                </template>
              </v-list-item>
            </template>
            <div class="relative mt-1 ps-10 pe-4 text-sm">
              <h2 v-if="showSettingsBasicSection" class="text-sm font-medium leading-5 mb-2">
                {{ t('navigation.sidebar.settings.basic.title') }}
              </h2>
              <ul v-if="showSettingsBasicSection" class="space-y-2 text-slate-100 text-xs list-disc list-outside ps-5">
                <li v-if="canViewCategories" class="relative">
                  <router-link to="/settings/products-categories/list" :class="[
                    isMenuItemActive('/settings/products-categories/list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.settings.basic.productCategories') }}
                  </router-link>
                </li>
                <li v-if="canViewServiceCategories" class="relative">
                  <router-link to="/settings/services-categories/list" :class="[
                    isMenuItemActive('/settings/services-categories/list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.settings.basic.serviceCategories') }}</router-link>
                </li>
                <li v-if="canViewTreeCategories" class="relative">
                  <router-link to="/settings/products-categories/tree" :class="[
                    isMenuItemActive('/settings/products-categories/tree')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.settings.basic.productTreeCategories') }}
                  </router-link>
                </li>
                <li v-if="canViewTreeServiceCategories" class="relative">
                  <router-link to="/settings/services-categories/tree" :class="[
                    isMenuItemActive('/settings/services-categories/tree')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.settings.basic.serviceTreeCategories') }}</router-link>
                </li>
                <li v-if="canViewUnits" class="relative">
                  <router-link to="/settings/units/list" :class="[
                    isMenuItemActive('/settings/units/list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.settings.basic.units') }}</router-link>
                </li>
                <li v-if="canViewManufacturers" class="relative">
                  <router-link to="/settings/factories/list" :class="[
                    isMenuItemActive('/settings/factories/list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.settings.basic.factories') }}</router-link>
                </li>
                <li v-if="canViewBrands" class="relative">
                  <router-link to="/settings/brands/list" :class="[
                    isMenuItemActive('/settings/brands/list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.settings.basic.brands') }}</router-link>
                </li>
                <li v-if="canViewGeoRegions" class="relative">
                  <router-link to="/settings/geo-areas/list" :class="[
                    isMenuItemActive('/settings/geo-areas/list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.settings.basic.geoRegions') }}</router-link>
                </li>
                <li v-if="canViewGeoZones" class="relative">
                  <router-link to="/settings/geo-segments/list" :class="[
                    isMenuItemActive('/settings/geo-segments/list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.settings.basic.geoZones') }}</router-link>
                </li>
              </ul>
              <h2 v-if="showSettingsTaxesSection" class="text-sm font-medium leading-5 my-2">{{ t('navigation.sidebar.settings.taxes.title') }}</h2>
              <ul v-if="showSettingsTaxesSection" class="space-y-2 text-slate-100 text-xs list-disc list-outside ps-5">
                <li v-if="canViewTaxes" class="relative">
                  <router-link to="/settings/tax-rules/list" :class="[
                    isMenuItemActive('/settings/tax-rules/list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.settings.taxes.taxRules') }}
                  </router-link>
                </li>
                <li v-if="canViewTaxes" class="relative">
                  <router-link to="/settings/taxes/list" :class="[
                    isMenuItemActive('/settings/taxes/list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.settings.taxes.taxes') }}</router-link>
                </li>
              </ul>
              <h2 v-if="showSettingsCountriesCurrenciesSection" class="text-sm font-medium leading-5 my-2">{{ t('navigation.sidebar.settings.countriesCurrencies.title') }}</h2>
              <ul v-if="showSettingsCountriesCurrenciesSection"
                class="space-y-2 text-slate-100 text-xs list-disc list-outside ps-5">
                <li v-if="canViewCountries" class="relative">
                  <router-link to="/settings/countries/list" :class="[
                    isMenuItemActive('/settings/countries/list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.settings.countriesCurrencies.countriesManagement') }}
                  </router-link>
                </li>
                <li v-if="canViewCities" class="relative">
                  <router-link to="/settings/cities/list" :class="[
                    isMenuItemActive('/settings/cities/list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.settings.countriesCurrencies.citiesManagement') }}
                  </router-link>
                </li>
                <li v-if="canViewCurrencies" class="relative">
                  <router-link to="/sales/currencies" :class="[
                    isMenuItemActive('/sales/currencies')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.settings.countriesCurrencies.currenciesManagement') }}</router-link>
                </li>
              </ul>
              <h2 v-if="showSettingsAdvancedSection" class="text-sm font-medium leading-5 my-2">{{ t('navigation.sidebar.settings.advanced.title') }}</h2>
              <ul v-if="showSettingsAdvancedSection"
                class="space-y-2 text-slate-100 text-xs list-disc list-outside ps-5">
                <li v-if="canViewCodesSettings" class="relative">
                  <router-link to="/settings/codes" :class="[
                    isMenuItemActive('/settings/codes')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.settings.advanced.codesSettings') }}
                  </router-link>
                </li>
                <li v-if="canViewAccountTypes" class="relative">
                  <router-link to="/settings/account-types/list" :class="[
                    isMenuItemActive('/settings/account-types/list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.settings.advanced.accountTypes') }}
                  </router-link>
                </li>
                <li v-if="canViewTestGroups" class="relative">
                  <router-link to="/settings/test-group/list" :class="[
                    isMenuItemActive('/settings/test-group/list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.settings.advanced.testGroups') }}
                  </router-link>
                </li>
                <li v-if="canViewTests" class="relative">
                  <router-link to="/settings/tests/list" :class="[
                    isMenuItemActive('/settings/tests/list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.settings.advanced.tests') }}
                  </router-link>
                </li>
                <li v-if="canViewTestMethodologies" class="relative">
                  <router-link to="/settings/test-methodology/list" :class="[
                    isMenuItemActive('/settings/test-methodology/list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.settings.advanced.testMethodologies') }}
                  </router-link>
                </li>
                <li v-if="canViewSampleTypes" class="relative">
                  <router-link to="/settings/sample-types/list" :class="[
                    isMenuItemActive('/settings/sample-types/list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.settings.advanced.sampleTypes') }}
                  </router-link>
                </li>
                <li class="relative">
                  <router-link to="/settings/central-paths" :class="[
                    isMenuItemActive('/settings/central-paths')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ $t('navigation.sidebar.settings.basic.centralPaths') }}
                  </router-link>
                </li>
                <li class="relative">
                  <router-link to="/settings/pricing-by-truck" :class="[
                    isMenuItemActive('/settings/pricing-by-truck')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ $t('navigation.sidebar.settings.basic.pricingByTruck') }}
                  </router-link>
                </li>
                <li class="relative">
                  <router-link to="/settings/pricing-per-ton" :class="[
                    isMenuItemActive('/settings/pricing-per-ton')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ $t('navigation.sidebar.settings.basic.pricingPerTon') }}
                  </router-link>
                </li>
                <li class="relative">
                  <router-link to="/settings/custom-pricing" :class="[
                    isMenuItemActive('/settings/custom-pricing')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ $t('navigation.sidebar.settings.basic.customPricing') }}
                  </router-link>
                </li>
                <li v-if="canViewDrivers" class="relative">
                  <router-link to="/settings/drivers-data" :class="[
                    isMenuItemActive('/settings/drivers-data')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ $t('navigation.sidebar.settings.basic.driversData') }}
                  </router-link>
                </li>
                <li v-if="canViewVehicles" class="relative">
                  <router-link to="/settings/vehicles-data" :class="[
                    isMenuItemActive('/settings/vehicles-data')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ $t('navigation.sidebar.settings.basic.vehiclesData') }}
                  </router-link>
                </li>
                
                <li v-if="canViewSystemStatuses" class="relative">
                  <router-link to="/settings/system-statuses/list" :class="[
                    isMenuItemActive('/settings/system-statuses/list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.settings.advanced.systemStatuses') }}
                  </router-link>
                </li>
                <li class="relative" v-if="canViewDocStatusTransitions">
                  <router-link to="/settings/doc-status-transitions/list" :class="[
                    isMenuItemActive('/settings/doc-status-transitions/list')
                      ? 'font-bold text-qallab-yellow'
                      : 'text-white hover:text-qallab-yellow',
                  ]">
                    {{ t('navigation.sidebar.settings.advanced.docStatusTransitions') }}
                  </router-link>
                </li>
              </ul>
            </div>
          </v-list-group>
        </v-list>
      </div>

      <div class="mt-15 px-2">
        <a href="#" class="block relative" v-if="isSidebarExpanded">
          <v-btn size="x-small"
            class="!absolute !top-[-15px] !end-5 bg-white border-[3px] border-qallab-blue !rounded-full p-1 h-9 w-9 flex items-center justify-center">
            <v-icon size="20" class="text-qallab-blue font-bold">mdi-arrow-top-right</v-icon>
          </v-btn>
          <div
            class="bg-white bg-[url('@/assets/vectors/mobile-download.svg')] bg-cover bg-right-bottom rounded-xl px-3 py-4 leading-relaxed flex items-end justify-between">
            <img src="@/assets/vectors/qallab-iphone.svg"
              class="transform scale-[1.5] translate-x-[-15px] translate-y-[-20px] w-12" />
            <span class="font-bold text-primary-900 text-end">Download our <br />
              Mobile app</span>
          </div>
        </a>
        <div v-else class="flex justify-center">
          <v-btn icon size="x-small" class="bg-white text-qallab-blue rounded-full shadow-sm">
            <v-icon size="18" class="text-qallab-blue">mdi-arrow-top-right</v-icon>
          </v-btn>
        </div>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import {
  homeIcon,
  productsIcon,
  servicesIcon,
  salesIcon,
  projectsIcon,
  purchasesIcon,
  financeIcon,
  usersIcon,
  logisticsIcon,
  reportsIcon,
  settingsIcon,
} from "@/components/icons/sidebarIcons";
import { useI18n } from "vue-i18n";
import { usePermissions } from "@/composables/usePermissions";
import { useLocaleStore } from "@/stores/locale";

const { t } = useI18n();
const route = useRoute();
const localeStore = useLocaleStore();

// Initialize permissions
const {
  // Products
  canViewProducts,
  canViewGroupedProducts,
  canViewGeneralPriceLists,
  canViewBuildingMaterialPriceLists,
  canViewProductionCapacity,
  canViewProductVariables,
  canViewProductSettings,
  hasAnyProductPermission,
  hasAnyProductsManagementPermission,
  // Services
  canViewServices,
  canViewSubscriptions,
  canViewPriceLists,
  canViewServiceSettings,
  hasAnyServicePermission,
  // Sales
  canViewCustomers,
  canViewSalesInvoices,
  canViewSalesOrders,
  canViewContracts,
  canViewClearing,
  canViewBuildingMaterialPriceOffer,
  canViewSalesFuelSR,
  canViewSalesFuelSQ,
  canViewSalesFuelSO,
  canViewSalesBuildingMaterialSR,
  canViewSalesBuildingMaterialSQ,
  canViewSalesBuildingMaterialSO,
  canViewSalesLogisticsSR,
  canViewSalesLogisticsSQ,
  canViewSalesLogisticsSO,
  canViewSalesLogisticsSaleInvoices,
  canViewSalesLogisticsDeliveryDocs,
  canViewSalesSaleInvoices,
  canViewSalesDeliveryDocs,
  canViewSalesSoPickups,
  canViewSalesTripManagement,
  hasAnySalesPermission,
  // Projects
  canViewProjects,
  canViewProjectScheduling,
  hasAnyProjectsPermission,
  // Purchases
  canViewSuppliers,
  canViewSupplierSettlements,
  canViewBuildingMaterialPriceRequests,
  canViewPurchasesFuelPR,
  canViewPurchasesFuelPQ,
  canViewPurchasesFuelPO,
  canViewPurchasesBuildingMaterialPR,
  canViewPurchasesBuildingMaterialPQ,
  canViewPurchasesBuildingMaterialPO,
  canViewPurchasesLogisticsPR,
  canViewPurchasesLogisticsPQ,
  canViewPurchasesLogisticsPO,
  canViewLogisticsPurchaseInvoices,
  canViewPurchaseInvoices,
  canViewPurchasesReceivingDocs,
  canViewPurchasesLogisticsReceivingDocs,
  hasAnyPurchasesPermission,
  // Finance
  canViewReceiptPaymentTransactions,
  canViewTreasuryManagement,
  hasAnyFinancePermission,
  // Users
  canViewUsers,
  canViewRoles,
  canViewCrushers,
  canViewContractors,
  canViewLogistics,
  hasAnyUsersPermission,
  // Reports
  canViewSalesReports,
  canViewPurchaseReports,
  hasAnyReportsPermission,
  // Settings
  canViewUnits,
  canViewTestMethodologies,
  canViewTests,
  canViewTestGroups,
  canViewTaxes,
  canViewCountries,
  canViewCities,
  canViewSampleTypes,
  canViewSystemStatuses,
  canViewDocStatusTransitions,
  canViewBrands,
  canViewManufacturers,
  canViewCategories,
  canViewTreeCategories,
  canViewServiceCategories,
  canViewTreeServiceCategories,
  canViewGeoRegions,
  canViewGeoZones,
  canViewCurrencies,
  canViewCodesSettings,
  canViewAccountTypes,
  hasAnySettingsPermission,
  canViewVehicles,
  canViewDrivers,
  // Sidebar section visibility
  showProductSettingsSection,
  showSalesCustomersSection,
  showSalesQuotationsSection,
  showSalesOrdersSection,
  showSalesDeliveryDocsSection,
  showSalesInvoicesSection,
  showPurchasesSuppliersSection,
  showPurchasesQuotationsSection,
  showPurchasesOrdersSection,
  showPurchasesReceivingDocsSection,
  showPurchasesInvoicesSection,
  showSettingsBasicSection,
  showSettingsTaxesSection,
  showSettingsCountriesCurrenciesSection,
  showSettingsAdvancedSection,
} = usePermissions();

// Define routes for each dropdown group
const productsRoutes = ["/simple-products", "/group-products", "/products"];
const servicesRoutes = ["/services"];
const salesRoutes = ["/customers", "/sales", "/price-offer-material-product"];
const projectsRoutes = ["/projects"];
const purchasesRoutes = ["/suppliers", "/purchases"];
const financeRoutes = ["/finance"];
const usersRoutes = [
  "/users",
  "/roles",
  "/crushers",
  "/factories-management",
  "/contractors",
  "/logistics",
];
// const logisticsRoutes = ['/logistics'];
const reportsRoutes = ["/reports"];
const settingsRoutes = [
  "/products-categories",
  "/services-categories",
  "/products-categories/tree",
  "/units",
  "/brands",
  "/geo-areas",
  "/geo-segments",
  "/tax-rules",
  "/taxes",
  "/countries",
  "/cities",
  "/codes",
  "/account-types",
  "/test-group",
  "/tests",
  "/test-methodology",
  "/sample-types",
  "/system-statuses",
  "/doc-status-transitions",
  "/settings/factories",
  "/settings",
];

// Helper function to check if route matches (including child routes like /form, /create, /edit/:id, /view/:id)
const isRouteActive = (basePath) => {
  const currentPath = route.path;
  // Check if current path starts with the base path
  if (currentPath.startsWith(basePath)) {
    return true;
  }
  return false;
};

// Dynamic function to check if a menu item should be active based on its link path
const isMenuItemActive = (menuLinkPath) => {
  const currentPath = route.path;

  // Direct match
  if (currentPath === menuLinkPath) return true;

  // Extract the base path from the menu link
  const pathParts = menuLinkPath.split("/").filter((p) => p);
  if (pathParts.length === 0) return false;

  // For nested routes like /products/building-material-products-prices
  // Check if current path starts with the full menu link path
  if (currentPath.startsWith(menuLinkPath)) {
    return true;
  }

  // Handle settings routes (e.g., /settings/products-categories/list)
  if (pathParts[0] === "settings" && pathParts.length >= 3) {
    // For settings routes, we need exact match for the last segment (list, tree, etc.)
    // e.g., /settings/products-categories/list should only match that specific link
    const currentParts = currentPath.split("/").filter((p) => p);

    // Check if both are settings routes with same module
    if (currentParts[0] === "settings" && currentParts[1] === pathParts[1]) {
      // For list routes, also match create, edit, view
      if (pathParts[2] === "list") {
        return (
          currentParts[2] === "list" ||
          currentParts[2] === "create" ||
          currentParts[2] === "edit" ||
          currentParts[2] === "view"
        );
      }
      // For other routes (tree, etc.), require exact match of the third segment
      return currentParts[2] === pathParts[2];
    }
    return false;
  }

  const basePath = "/" + pathParts[0];

  // Check if we're in the same parent route
  if (currentPath.startsWith(basePath + "/") || currentPath === basePath) {
    // Special handling for different types of routes

    // 0. Handle shared link routes with category query parameter
    // For purchases/sales quotations and orders link pages
    if (currentPath.includes("/link/") || currentPath.includes("/link")) {
      const category = route.query.category;

      // Check if menu link is for a specific category type AND matches the link type (quotations vs orders)
      if (menuLinkPath.includes("/quotations/fuels")) {
        return category === "fuel" && currentPath.includes("/quotations/link");
      }
      if (menuLinkPath.includes("/orders/fuels")) {
        return category === "fuel" && currentPath.includes("/orders/link");
      }
      if (menuLinkPath.includes("/quotations/material-product")) {
        return category === "building_material" && currentPath.includes("/quotations/link");
      }
      if (menuLinkPath.includes("/orders/material-product")) {
        return category === "building_material" && currentPath.includes("/orders/link");
      }
      if (menuLinkPath.includes("/quotations/logistics")) {
        return category === "logistics" && currentPath.includes("/quotations/link");
      }
      if (menuLinkPath.includes("/orders/logistics")) {
        return category === "logistics" && currentPath.includes("/orders/link");
      }
    }

    // 1. For nested product/service price routes (e.g., /products/building-material-products-prices)
    if (pathParts.length > 1 && pathParts[1].includes("price")) {
      // Build the full nested path from menu link
      const nestedPath = "/" + pathParts.join("/");
      // Check if current path starts with this nested path
      return currentPath.startsWith(nestedPath);
    }

    // 2. Main list routes (e.g., /services/list, /customers/list)
    if (pathParts.length > 1 && pathParts[1] === "list") {
      // Active for: list, create, edit, view, form pages
      // NOT active for: price-related or other sub-features
      const isMainRoute =
        currentPath === menuLinkPath ||
        currentPath === basePath + "/create" ||
        currentPath.startsWith(basePath + "/edit/") ||
        currentPath === basePath + "/form" ||
        currentPath.startsWith(basePath + "/view/") ||
        currentPath === basePath + "/new";

      // Don't activate for price or other special routes
      if (currentPath.includes("price") || currentPath.includes("scheduling")) {
        return false;
      }

      return isMainRoute;
    }

    // 3. Special sub-features (scheduling, production-capacity, etc.)
    if (
      pathParts.length > 1 &&
      (pathParts[1] === "scheduling" || pathParts[1] === "production-capacity")
    ) {
      const nestedPath = "/" + pathParts.join("/");
      return currentPath.startsWith(nestedPath);
    }

    // 4. For simple paths without /list (like /codes)
    if (pathParts.length === 1) {
      return currentPath.startsWith(basePath);
    }

    // Default: match if same path structure
    return currentPath.startsWith(menuLinkPath.replace("/list", ""));
  }

  return false;
};

// Check if current route is active for a group
const isGroupActive = (routes) => {
  return routes.some((r) => isRouteActive(r));
};

// Computed properties for each group's active state
const isProductsActive = computed(() => isGroupActive(productsRoutes));
const isServicesActive = computed(() => isGroupActive(servicesRoutes));
const isSalesActive = computed(() => isGroupActive(salesRoutes));
const isProjectsActive = computed(() => isGroupActive(projectsRoutes));
const isPurchasesActive = computed(() => isGroupActive(purchasesRoutes));
const isFinanceActive = computed(() => isGroupActive(financeRoutes));
const isUsersActive = computed(() => isGroupActive(usersRoutes));
// const isLogisticsActive = computed(() => isGroupActive(logisticsRoutes));
const isReportsActive = computed(() => isGroupActive(reportsRoutes));
const isSettingsActive = computed(() => isGroupActive(settingsRoutes));

// Note: Individual menu items now use the dynamic isMenuItemActive() function
// No need for specific computed properties for each menu item

// Get current active group name
const getActiveGroupName = () => {
  if (isProductsActive.value) return "products";
  if (isServicesActive.value) return "services";
  if (isSalesActive.value) return "sales";
  if (isProjectsActive.value) return "projects";
  if (isPurchasesActive.value) return "purchases";
  if (isFinanceActive.value) return "finance";
  if (isUsersActive.value) return "users";
  // if (isLogisticsActive.value) return 'logistics';
  if (isReportsActive.value) return "reports";
  if (isSettingsActive.value) return "settings";
  return null;
};

// Track open groups
const openGroups = ref([]);

// Initialize openGroups only once - don't watch route changes
// This prevents scroll reset when navigating within the same dropdown
const initActiveGroup = getActiveGroupName();
if (initActiveGroup) {
  openGroups.value = [initActiveGroup];
}

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: true,
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const drawerProxy = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});

const isCollapsed = ref(false);
const isDrawerHovered = ref(false);

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const isSidebarExpanded = computed(
  () => !isCollapsed.value || isDrawerHovered.value
);

// Watch for collapse state changes
watch(isCollapsed, (newValue) => {
  if (newValue) {
    // When collapsed, close all dropdowns
    openGroups.value = [];
  } else {
    // When expanded, open the active group
    const activeGroup = getActiveGroupName();
    if (activeGroup) {
      openGroups.value = [activeGroup];
    }
  }
});

// Watch for drawer hover state when collapsed
watch(isDrawerHovered, (newValue) => {
  if (isCollapsed.value && newValue) {
    // When hovering over collapsed sidebar, open the active group
    const activeGroup = getActiveGroupName();
    if (activeGroup) {
      openGroups.value = [activeGroup];
    }
  } else if (isCollapsed.value && !newValue) {
    // When leaving hover, close all groups
    openGroups.value = [];
  }
});
</script>

<style>
.q-sidebar-drawer {
  overflow: visible !important;
}

.q-sidebar-drawer .v-navigation-drawer__content {
  overflow: hidden !important;
}

.q-sidebar-drawer .v-list-item__content {
  flex: 1;
}

.q-sidebar-drawer .q-sidebar-toggle {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.q-sidebar-drawer.v-navigation-drawer--rail .q-sidebar-toggle {
  position: static;
}

.q-sidebar-drawer.v-navigation-drawer--rail.v-navigation-drawer--expand-on-hover:hover .q-sidebar-toggle,
.q-sidebar-drawer:not(.v-navigation-drawer--rail) .q-sidebar-toggle {
  position: absolute;
  top: 3.5rem;
  inset-inline-end: -1rem;
  margin-bottom: 0;
}

.q-sidebar-scroll {
  overflow-y: auto;
  overflow-x: hidden !important;
  overflow-anchor: none !important;
}

.q-sidebar-scroll::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.q-sidebar-scroll {
  scrollbar-width: none;
}

.q-sidebar-drawer .v-list-item--active>.v-list-item__overlay {
  display: none;
}

.q-sidebar-drawer .v-list-group__items {
  scroll-margin: 0 !important;
}

.q-sidebar-scroll * {
  scroll-behavior: auto !important;
}

.q-sidebar-drawer .v-list-item {
  scroll-margin: 0 !important;
  scroll-snap-align: none !important;
}
</style>
