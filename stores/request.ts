// Pinia store : singleton du tronc /request.
// V1 : un seul service par demande. Dates per-service. URL = source de verite
// pour les champs strategiques (service, destination, event, weekend, lang, step).

import { defineStore } from 'pinia';
import { ref, reactive, computed, watch } from 'vue';
import {
  SERVICES,
  DESTINATIONS,
  REQUEST_STEPS,
  REPLY_LANGS,
  type Service,
  type Destination,
  type RequestStep,
  type ReplyLang,
} from '~/types/request';
import {
  emptyPassengers,
  emptyLuggage,
  emptyChildSeats,
  type ChauffeurDetails,
  type CarsDetails,
  type YachtDetails,
  type HelicopterDetails,
  type AccessDetails,
  type Contact,
  type Billing,
} from '~/lib/forms/requestSchema';

const STEP_ORDER: RequestStep[] = [...REQUEST_STEPS];

const isService = (v: string): v is Service => (SERVICES as readonly string[]).includes(v);
const isDestination = (v: string): v is Destination =>
  (DESTINATIONS as readonly string[]).includes(v);
const isStep = (v: string): v is RequestStep => (REQUEST_STEPS as readonly string[]).includes(v);
const isLang = (v: string): v is ReplyLang => (REPLY_LANGS as readonly string[]).includes(v);

const makeChauffeur = (): ChauffeurDetails => ({
  subtype: 'one-way',
  vehicleId: undefined,
  pickup: undefined,
  pickupPlaceId: undefined,
  dropoff: undefined,
  dropoffPlaceId: undefined,
  distanceKm: undefined,
  date: undefined,
  time: undefined,
  hasReturn: false,
  returnDate: undefined,
  returnTime: undefined,
  flight: undefined,
  train: undefined,
  welcomeSign: undefined,
  durationHours: undefined,
  passengers: emptyPassengers(),
  luggage: emptyLuggage(),
  childSeats: emptyChildSeats(),
  notes: undefined,
});

const makeCars = (): CarsDetails => ({
  type: undefined,
  brand: undefined,
  pickup: undefined,
  startDate: undefined,
  endDate: undefined,
  driverAge: undefined,
  licenceCountry: undefined,
  notes: undefined,
});

const makeYacht = (): YachtDetails => ({
  duration: undefined,
  size: undefined,
  port: undefined,
  startDate: undefined,
  endDate: undefined,
  guests: undefined,
  notes: undefined,
});

const makeHelicopter = (): HelicopterDetails => ({
  departure: undefined,
  destination: undefined,
  date: undefined,
  time: undefined,
  hasReturn: false,
  returnDate: undefined,
  returnTime: undefined,
  helicopterId: undefined,
  passengers: emptyPassengers(),
  luggage: emptyLuggage(),
  notes: undefined,
});

const makeAccess = (): AccessDetails => ({ items: [], notes: undefined });

const makeContact = (): Contact => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: undefined,
  phoneCode: undefined,
  whatsapp: false,
  replyLang: undefined,
  isOther: false,
  guestFirstName: undefined,
  guestLastName: undefined,
  guestPhone: undefined,
  message: undefined,
});

const makeBilling = (): Billing => ({
  enabled: false,
  company: undefined,
  vat: undefined,
  address: undefined,
  city: undefined,
  zip: undefined,
  country: undefined,
  email: undefined,
});

export const useRequestStore = defineStore('request', () => {
  const service = ref<Service | undefined>(undefined);
  const destination = ref<Destination | undefined>(undefined);
  const event = ref<string | undefined>(undefined);
  const weekend = ref<string | undefined>(undefined);
  const replyLang = ref<ReplyLang | undefined>(undefined);
  const step = ref<RequestStep>('context');

  const chauffeur = reactive<ChauffeurDetails>(makeChauffeur());
  const cars = reactive<CarsDetails>(makeCars());
  const yacht = reactive<YachtDetails>(makeYacht());
  const helicopter = reactive<HelicopterDetails>(makeHelicopter());
  const access = reactive<AccessDetails>(makeAccess());
  const contact = reactive<Contact>(makeContact());
  const billing = reactive<Billing>(makeBilling());

  let hydrated = false;

  function hydrateFromRoute() {
    if (hydrated) return;
    hydrated = true;
    const route = useRoute();

    const raw = route.query.service ?? route.query.services;
    if (typeof raw === 'string') {
      const first = raw.split(',')[0]?.trim().toLowerCase();
      if (first && isService(first)) service.value = first;
    }

    if (typeof route.query.destination === 'string' && isDestination(route.query.destination)) {
      destination.value = route.query.destination;
    }
    if (typeof route.query.event === 'string' && route.query.event) {
      event.value = route.query.event;
    }
    if (typeof route.query.weekend === 'string' && route.query.weekend) {
      weekend.value = route.query.weekend;
    }
    if (typeof route.query.lang === 'string' && isLang(route.query.lang)) {
      replyLang.value = route.query.lang;
    }
    if (typeof route.query.step === 'string' && isStep(route.query.step)) {
      step.value = route.query.step;
    }

    if (typeof route.query.from === 'string') chauffeur.pickup = route.query.from;
    if (typeof route.query.to === 'string') chauffeur.dropoff = route.query.to;

    if (typeof route.query.establishment === 'string' && route.query.establishment) {
      access.items.push({
        category: undefined,
        city: destination.value,
        establishment: route.query.establishment,
        date: undefined,
        time: undefined,
        guests: undefined,
        occasion: 'none',
      });
    }

    if (typeof route.query.date === 'string') {
      // Pre-remplit la date du service principal
      if (service.value === 'helicopter') helicopter.date = route.query.date;
      else if (service.value === 'chauffeur') chauffeur.date = route.query.date;
      else if (service.value === 'cars') cars.startDate = route.query.date;
      else if (service.value === 'yacht') yacht.startDate = route.query.date;
    }
  }

  function syncQuery() {
    const route = useRoute();
    const router = useRouter();
    const q: Record<string, string> = {};
    if (step.value !== 'context') q.step = step.value;
    if (service.value) q.service = service.value;
    if (destination.value) q.destination = destination.value;
    if (event.value) q.event = event.value;
    if (weekend.value) q.weekend = weekend.value;
    if (replyLang.value) q.lang = replyLang.value;
    router.replace({ path: route.path, query: q });
  }

  function startUrlSync() {
    watch([step, service, destination, event, weekend, replyLang], syncQuery, { deep: true });
  }

  const stepIndex = computed(() => STEP_ORDER.indexOf(step.value));
  const isFirstStep = computed(() => stepIndex.value === 0);
  const isLastStep = computed(() => stepIndex.value === STEP_ORDER.length - 1);

  function next() {
    if (!isLastStep.value) step.value = STEP_ORDER[stepIndex.value + 1];
  }
  function back() {
    if (!isFirstStep.value) step.value = STEP_ORDER[stepIndex.value - 1];
  }
  function goTo(s: RequestStep) {
    step.value = s;
  }

  function selectService(s: Service) {
    service.value = s;
  }

  function setDestination(d: Destination | undefined) {
    destination.value = d;
    for (const item of access.items) {
      if (!item.city) item.city = d;
    }
  }

  return {
    service,
    destination,
    event,
    weekend,
    replyLang,
    step,
    chauffeur,
    cars,
    yacht,
    helicopter,
    access,
    contact,
    billing,
    stepIndex,
    isFirstStep,
    isLastStep,
    next,
    back,
    goTo,
    selectService,
    setDestination,
    hydrateFromRoute,
    startUrlSync,
    STEP_ORDER,
  };
});
