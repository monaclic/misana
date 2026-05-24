<template>
  <div class="min-h-screen flex flex-col pb-12 lg:pb-0">
    <AppHeader />
    <!-- pt-16 reserves space for the fixed header. Pages that want their first
         section to flow under a transparent header (eg. the homepage hero) use
         a -mt-16 on that first section to neutralize this padding. -->
    <div class="pt-16 lg:pt-24">
      <slot />
    </div>
    <AppFooter />
  </div>
</template>
