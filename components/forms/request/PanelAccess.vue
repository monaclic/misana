<script setup lang="ts">
// Multi-adresse additif : restaurants / palaces / clubs.
// Chaque item a sa date+heure (un client peut reserver mardi soir + jeudi midi).
import { ACCESS_CATEGORIES, DESTINATIONS, OCCASIONS } from '~/types/request';
import { useRequestStore } from '~/stores/request';

const store = useRequestStore();
const { t } = useI18n();
const a = store.access;

function addItem() {
  a.items.push({
    category: undefined,
    city: store.destination,
    establishment: undefined,
    date: undefined,
    time: undefined,
    guests: undefined,
    occasion: 'none',
  });
}

function removeItem(idx: number) {
  a.items.splice(idx, 1);
}

if (a.items.length === 0) addItem();
</script>

<template>
  <div class="space-y-6">
    <div
      v-for="(item, idx) in a.items"
      :key="idx"
      class="border border-misana-line p-5 space-y-4"
    >
      <div class="flex items-center justify-between">
        <p class="text-sm uppercase tracking-wide text-misana-muted">
          {{ t('request.access.address') }} {{ idx + 1 }}
        </p>
        <button
          v-if="a.items.length > 1"
          type="button"
          class="text-xs text-misana-muted hover:text-misana-ink underline"
          @click="removeItem(idx)"
        >
          {{ t('common.remove') }}
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1">
            {{ t('request.access.category') }}
          </label>
          <select
            v-model="item.category"
            class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
          >
            <option :value="undefined">{{ t('common.choose') }}</option>
            <option v-for="cat in ACCESS_CATEGORIES" :key="cat" :value="cat">
              {{ t(`request.access.categories.${cat}`) }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1">
            {{ t('request.destination.label') }}
          </label>
          <select
            v-model="item.city"
            class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
          >
            <option :value="undefined">{{ t('common.choose') }}</option>
            <option v-for="d in DESTINATIONS" :key="d" :value="d">
              {{ t(`request.destination.${d}`) }}
            </option>
          </select>
        </div>
      </div>

      <div>
        <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1">
          {{ t('request.access.establishment') }}
        </label>
        <input
          v-model="item.establishment"
          type="text"
          class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
          :placeholder="t('request.access.establishmentHint')"
        />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1">
            {{ t('request.dates.date') }}
          </label>
          <input
            v-model="item.date"
            type="date"
            class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
          />
        </div>
        <div>
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1">
            {{ t('request.dates.time') }}
          </label>
          <input
            v-model="item.time"
            type="time"
            class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1">
            {{ t('request.access.guests') }}
          </label>
          <input
            v-model.number="item.guests"
            type="number"
            min="1"
            max="30"
            class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
          />
        </div>
        <div>
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1">
            {{ t('request.access.occasion') }}
          </label>
          <select
            v-model="item.occasion"
            class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
          >
            <option v-for="oc in OCCASIONS" :key="oc" :value="oc">
              {{ t(`request.access.occasions.${oc}`) }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <button
      type="button"
      class="text-sm border border-misana-line px-4 py-2 hover:border-misana-ink transition"
      @click="addItem"
    >
      + {{ t('request.access.add') }}
    </button>

    <div>
      <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="a-notes">
        {{ t('request.notes') }}
      </label>
      <textarea
        id="a-notes"
        v-model="a.notes"
        rows="3"
        class="w-full border border-misana-line p-3 bg-transparent focus:border-misana-ink outline-none"
        :placeholder="t('request.notesHint')"
      ></textarea>
    </div>
  </div>
</template>
