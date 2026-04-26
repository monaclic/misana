<script setup lang="ts">
import { YACHT_DURATIONS, type YachtSize } from '~/types/request';
import { YACHT_SIZE_CARDS } from '~/lib/fleet';
import { useRequestStore } from '~/stores/request';

const store = useRequestStore();
const { locale, t } = useI18n();
const y = store.yacht;

function selectSize(id: YachtSize) {
  y.size = y.size === id ? undefined : id;
}
</script>

<template>
  <div class="space-y-12">
    <!-- Duration -->
    <div>
      <p class="text-sm uppercase tracking-wide text-misana-muted mb-3">
        {{ t('request.yacht.duration') }}
      </p>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="d in YACHT_DURATIONS"
          :key="d"
          type="button"
          class="border p-3 text-sm transition"
          :class="y.duration === d ? 'border-misana-ink bg-misana-ink text-misana-paper' : 'border-misana-line hover:border-misana-ink'"
          @click="y.duration = d"
        >
          {{ t(`request.yacht.durations.${d}`) }}
        </button>
      </div>
    </div>

    <!-- Size cards -->
    <div>
      <p class="text-sm uppercase tracking-wide text-misana-muted mb-4">
        {{ t('request.yacht.size') }}
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FleetCard
          v-for="s in YACHT_SIZE_CARDS"
          :key="s.id"
          :selected="y.size === s.id"
          :title="s.label"
          :sub="s.pax"
          :features="locale === 'fr' ? s.vibeFr : s.vibe"
          :image="s.image"
          @select="selectSize(s.id)"
        />
      </div>
    </div>

    <!-- Dates -->
    <div>
      <p class="text-sm uppercase tracking-wide text-misana-muted mb-3">{{ t('request.dates.when') }}</p>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="y-start">
            {{ t('request.dates.startDate') }}
          </label>
          <input
            id="y-start"
            v-model="y.startDate"
            type="date"
            class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
          />
        </div>
        <div v-if="y.duration && y.duration !== 'day'">
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="y-end">
            {{ t('request.dates.endDate') }}
          </label>
          <input
            id="y-end"
            v-model="y.endDate"
            type="date"
            class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
          />
        </div>
      </div>
    </div>

    <div class="space-y-6">
      <div>
        <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="y-port">
          {{ t('request.yacht.port') }}
        </label>
        <input
          id="y-port"
          v-model="y.port"
          type="text"
          class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
          :placeholder="t('request.yacht.portHint')"
        />
      </div>
      <div>
        <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="y-guests">
          {{ t('request.yacht.guests') }}
        </label>
        <input
          id="y-guests"
          v-model.number="y.guests"
          type="number"
          min="1"
          max="30"
          class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
          placeholder="6"
        />
      </div>
    </div>

    <div>
      <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="y-notes">
        {{ t('request.notes') }}
      </label>
      <textarea
        id="y-notes"
        v-model="y.notes"
        rows="3"
        class="w-full border border-misana-line p-3 bg-transparent focus:border-misana-ink outline-none"
        :placeholder="t('request.notesHint')"
      ></textarea>
    </div>
  </div>
</template>
