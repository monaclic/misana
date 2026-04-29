<script setup lang="ts">
// Mini-form sticky sur la fiche access. Ne duplique pas /request,
// pre-remplit les query params et navigue vers /request pour finir.
import type { ServiceOption } from '~/lib/establishmentDetails';

type Props = {
  slug: string;
  name: string;
  city: string;
  category: 'restaurant' | 'palace' | 'beach-club' | 'nightclub';
  minGuests?: number;
  maxGuests?: number;
  leadTimeHours?: number;
  serviceOptions?: ServiceOption[];
  variant?: 'sticky' | 'inline';
};

const props = withDefaults(defineProps<Props>(), {
  minGuests: 1,
  maxGuests: 12,
  leadTimeHours: 24,
  serviceOptions: () => ['lunch', 'dinner'] as ServiceOption[],
  variant: 'sticky',
});

const localePath = useLocalePath();
const { t } = useI18n();

const isPalace = computed(() => props.category === 'palace');
const isRestaurant = computed(() => props.category === 'restaurant');
const showMealToggle = computed(
  () => isRestaurant.value
    && props.serviceOptions.includes('lunch')
    && props.serviceOptions.includes('dinner'),
);

const minDate = computed(() => {
  const d = new Date();
  d.setHours(d.getHours() + props.leadTimeHours);
  return d.toISOString().slice(0, 10);
});

const date = ref('');
const dateFrom = ref('');
const dateTo = ref('');
const meal = ref<ServiceOption>(
  showMealToggle.value ? 'lunch' : (props.serviceOptions[0] ?? 'lunch'),
);
const guests = ref(Math.max(2, props.minGuests));

const minDateTo = computed(() => dateFrom.value || minDate.value);

const canSubmit = computed(() => {
  if (isPalace.value) return !!dateFrom.value && !!dateTo.value && guests.value >= props.minGuests;
  return !!date.value && guests.value >= props.minGuests;
});

function dec() {
  if (guests.value > props.minGuests) guests.value--;
}
function inc() {
  if (guests.value < props.maxGuests) guests.value++;
}

async function submit() {
  if (!canSubmit.value) return;
  const query: Record<string, string> = {
    service: 'access',
    establishment: props.slug,
    city: props.city,
    guests: String(guests.value),
  };
  if (isPalace.value) {
    query.dateFrom = dateFrom.value;
    query.dateTo = dateTo.value;
  } else {
    query.date = date.value;
    if (meal.value) query.meal = meal.value;
  }
  await navigateTo({ path: localePath('/request'), query });
}
</script>

<template>
  <div :class="variant === 'sticky' ? 'lg:sticky lg:top-24' : ''">
    <div class="border border-misana-line bg-misana-paper p-6 sm:p-7 rounded-[6px]">
      <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-1.5">
        {{ t('access.fiche.reservationKicker') }}
      </p>
      <h3 class="font-display text-2xl mb-7 leading-tight">
        {{ t('access.fiche.reservationTitle', { name }) }}
      </h3>

      <div v-if="!isPalace" class="mb-5">
        <label class="block text-[11px] uppercase tracking-[0.15em] text-misana-muted mb-2">
          {{ t('access.fiche.field.date') }}
        </label>
        <input
          v-model="date"
          type="date"
          :min="minDate"
          class="form-input"
        />
      </div>

      <div v-else class="grid grid-cols-2 gap-3 mb-5">
        <div>
          <label class="block text-[11px] uppercase tracking-[0.15em] text-misana-muted mb-2">
            {{ t('access.fiche.field.arrival') }}
          </label>
          <input
            v-model="dateFrom"
            type="date"
            :min="minDate"
            class="form-input"
          />
        </div>
        <div>
          <label class="block text-[11px] uppercase tracking-[0.15em] text-misana-muted mb-2">
            {{ t('access.fiche.field.departure') }}
          </label>
          <input
            v-model="dateTo"
            type="date"
            :min="minDateTo"
            class="form-input"
          />
        </div>
      </div>

      <div v-if="showMealToggle" class="mb-5">
        <label class="block text-[11px] uppercase tracking-[0.15em] text-misana-muted mb-2">
          {{ t('access.fiche.field.service') }}
        </label>
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            class="meal-btn"
            :class="meal === 'lunch' ? 'active' : ''"
            @click="meal = 'lunch'"
          >
            {{ t('access.fiche.field.lunch') }}
          </button>
          <button
            type="button"
            class="meal-btn"
            :class="meal === 'dinner' ? 'active' : ''"
            @click="meal = 'dinner'"
          >
            {{ t('access.fiche.field.dinner') }}
          </button>
        </div>
      </div>

      <div class="mb-7">
        <label class="block text-[11px] uppercase tracking-[0.15em] text-misana-muted mb-2">
          {{ t('access.fiche.field.guests') }}
        </label>
        <div class="flex items-stretch border border-misana-line rounded-[4px] overflow-hidden">
          <button
            type="button"
            class="counter-btn"
            :disabled="guests <= minGuests"
            aria-label="decrement"
            @click="dec"
          >−</button>
          <span class="flex-1 flex items-center justify-center text-base">{{ guests }}</span>
          <button
            type="button"
            class="counter-btn"
            :disabled="guests >= maxGuests"
            aria-label="increment"
            @click="inc"
          >+</button>
        </div>
      </div>

      <button
        type="button"
        class="submit-btn"
        :disabled="!canSubmit"
        @click="submit"
      >
        <span>{{ t('access.fiche.reservationSubmit') }}</span>
        <span class="arrow">→</span>
      </button>

      <p class="mt-5 text-[11px] text-misana-muted leading-relaxed">
        {{ t('access.fiche.reservationFootnote') }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.form-input {
  width: 100%;
  border: 1px solid var(--color-misana-line);
  background: var(--color-misana-paper);
  padding: 0.7rem 0.8rem;
  font-size: 0.875rem;
  color: var(--color-misana-ink);
  border-radius: 4px;
  outline: none;
  transition: border-color 0.2s ease;
  font-family: inherit;
}
.form-input:focus {
  border-color: var(--color-misana-ink);
}
.form-input::-webkit-calendar-picker-indicator {
  opacity: 0.5;
  cursor: pointer;
}

.meal-btn {
  padding: 0.7rem 0.8rem;
  font-size: 0.8125rem;
  border: 1px solid var(--color-misana-line);
  background: var(--color-misana-paper);
  color: var(--color-misana-ink);
  border-radius: 4px;
  transition: all 0.2s ease;
  cursor: pointer;
}
.meal-btn:hover {
  border-color: var(--color-misana-ink);
}
.meal-btn.active {
  background: var(--color-misana-ink);
  color: var(--color-misana-paper);
  border-color: var(--color-misana-ink);
}

.counter-btn {
  width: 44px;
  font-size: 1.1rem;
  color: var(--color-misana-ink);
  background: var(--color-misana-paper);
  transition: background 0.15s ease;
  cursor: pointer;
}
.counter-btn:first-child {
  border-right: 1px solid var(--color-misana-line);
}
.counter-btn:last-child {
  border-left: 1px solid var(--color-misana-line);
}
.counter-btn:hover:not(:disabled) {
  background: var(--color-misana-stone);
}
.counter-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.9rem 1.1rem;
  background: var(--color-misana-ink);
  color: var(--color-misana-paper);
  font-size: 0.9rem;
  letter-spacing: 0.02em;
  border-radius: 4px;
  transition: opacity 0.2s ease;
  cursor: pointer;
}
.submit-btn:hover:not(:disabled) {
  opacity: 0.88;
}
.submit-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.submit-btn .arrow {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.submit-btn:hover:not(:disabled) .arrow {
  transform: translateX(4px);
}
</style>
