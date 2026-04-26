<script setup lang="ts">
import { DRIVER_AGE_BRACKETS, type CarBrand } from '~/types/request';
import { CAR_BRAND_CARDS } from '~/lib/fleet';
import { useRequestStore } from '~/stores/request';

const store = useRequestStore();
const { locale, t } = useI18n();
const c = store.cars;

function selectBrand(id: CarBrand) {
  c.brand = c.brand === id ? undefined : id;
}
</script>

<template>
  <div class="space-y-12">
    <!-- Brand cards -->
    <div>
      <div class="flex items-baseline justify-between mb-4">
        <p class="text-sm uppercase tracking-wide text-misana-muted">
          {{ t('request.cars.brand') }}
        </p>
        <p class="text-xs text-misana-muted">{{ t('request.cars.brandHint') }}</p>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <FleetCard
          v-for="b in CAR_BRAND_CARDS"
          :key="b.id"
          :selected="c.brand === b.id"
          :title="b.name"
          :sub="locale === 'fr' ? b.modelsFr : b.models"
          @select="selectBrand(b.id)"
        />
      </div>
    </div>

    <!-- Dates : start + end -->
    <div>
      <p class="text-sm uppercase tracking-wide text-misana-muted mb-3">{{ t('request.dates.when') }}</p>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="cr-start">
            {{ t('request.dates.startDate') }}
          </label>
          <input
            id="cr-start"
            v-model="c.startDate"
            type="date"
            class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
          />
        </div>
        <div>
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="cr-end">
            {{ t('request.dates.endDate') }}
          </label>
          <input
            id="cr-end"
            v-model="c.endDate"
            type="date"
            class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
          />
        </div>
      </div>
    </div>

    <div class="space-y-6">
      <div>
        <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="cr-pickup">
          {{ t('request.cars.pickup') }}
        </label>
        <input
          id="cr-pickup"
          v-model="c.pickup"
          type="text"
          class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
          :placeholder="t('request.cars.pickupHint')"
        />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="cr-age">
            {{ t('request.cars.driverAge') }}
          </label>
          <select
            id="cr-age"
            v-model="c.driverAge"
            class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
          >
            <option :value="undefined">{{ t('common.choose') }}</option>
            <option v-for="age in DRIVER_AGE_BRACKETS" :key="age" :value="age">{{ age }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="cr-licence">
            {{ t('request.cars.licenceCountry') }}
          </label>
          <input
            id="cr-licence"
            v-model="c.licenceCountry"
            type="text"
            class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
            :placeholder="t('request.cars.licenceCountryHint')"
          />
        </div>
      </div>
    </div>

    <div>
      <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="cr-notes">
        {{ t('request.notes') }}
      </label>
      <textarea
        id="cr-notes"
        v-model="c.notes"
        rows="3"
        class="w-full border border-misana-line p-3 bg-transparent focus:border-misana-ink outline-none"
        :placeholder="t('request.notesHint')"
      ></textarea>
    </div>
  </div>
</template>
