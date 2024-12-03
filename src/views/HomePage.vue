Nisa, [03/12/2024 11:09] HomePage.vue :
<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Races</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Refresher -->
      <ion-refresher
        slot="fixed"
        :pull-factor="0.5"
        :pull-min="100"
        :pull-max="200"
        @ionRefresh="handleRefresh"
      >
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- Active Races -->
      <div class="scrollable-container">
        <ion-list>
          <ion-item-sliding
            v-for="race in activeRaces"
            :key="race.id"
            :ref="(el) => setItemRef(el, race.id!)"
          >
            <ion-item-options side="start" @ionSwipe="handleDelete(race)">
              <ion-item-option
                color="danger"
                expandable
                @click="handleDelete(race)"
              >
                <ion-icon
                  slot="icon-only"
                  :icon="trash"
                  size="large"
                ></ion-icon>
              </ion-item-option>
            </ion-item-options>

            <ion-item>
              <ion-card>
                <ion-card-header>
                  <ion-card-title class="ion-text-wrap limited-text">{{
                    race.name
                  }}</ion-card-title>
                  <ion-card-subtitle class="limited-text">{{
                    race.description
                  }}</ion-card-subtitle>
                </ion-card-header>
                <ion-card-content>
                  <ion-badge>{{ getRelativeTime(race.scheduledAt) }}</ion-badge>
                  <p><strong>Track:</strong> {{ race.trackDetails }}</p>
                </ion-card-content>
              </ion-card>
            </ion-item>

            <ion-item-options side="end" @ionSwipe="handleStatus(race)">
              <ion-item-option @click="handleEdit(race)">
                <ion-icon
                  slot="icon-only"
                  :icon="create"
                  size="large"
                ></ion-icon>
              </ion-item-option>
              <ion-item-option
                color="success"
                expandable
                @click="handleStatus(race)"
              >
                <ion-icon
                  slot="icon-only"
                  :icon="checkmarkCircle"
                  color="light"
                  size="large"
                ></ion-icon>
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
          <ion-item v-if="activeRaces.length === 0" class="ion-text-center">
            <ion-label>No active races</ion-label>
          </ion-item>
        </ion-list>
      </div>

      <!-- Completed Races -->
      <ion-item class="accordion-container">
        <ion-accordion-group>
          <ion-accordion value="first">
            <ion-item slot="header" color="light">
              <ion-label class="ion-text-center">Completed</ion-label>
            </ion-item>
            <div slot="content" class="scrollable-container">
              <ion-list>
                <ion-item-sliding
                  v-for="race in completedRaces"
                  :key="race.id"
                  :ref="(el) => setItemRef(el, race.id!)"
                >
                  <ion-item-options side="start" @ionSwipe="handleDelete(race)">
                    <ion-item-option
                      color="danger"
                      expandable
                      @click="handleDelete(race)"
                    >
                      <ion-icon
                        slot="icon-only"
                        :icon="trash"
                        size="large"
                      ></ion-icon>
                    </ion-item-option>
                  </ion-item-options>

                  <ion-item>
                    <ion-card>
                      <ion-card-header>
                        <ion-card-title class="ion-text-wrap limited-text">{{
                          race.name
                        }}</ion-card-title>
                        <ion-card-subtitle class="limited-text">{{
                          race.description
                        }}</ion-card-subtitle>
                      </ion-card-header>
                      <ion-card-content>
                        <ion-badge>{{
                          getRelativeTime(race.scheduledAt)
                        }}</ion-badge>
                        <p><strong>Track:</strong> {{ race.trackDetails }}</p>
                      </ion-card-content>
                    </ion-card>
                  </ion-item>

                  <ion-item-options side="end" @ionSwipe="handleStatus(race)">
                    <ion-item-option @click="handleEdit(race)">
                      <ion-icon
                        slot="icon-only"
                        :icon="create"
                        size="large"
                      ></ion-icon>
                    </ion-item-option>
                    <ion-item-option
                      color="warning"
                      expandable
                      @click="handleStatus(race)"
                    >
                      <ion-icon
                        slot="icon-only"
                        :icon="close"
                        color="light"
                        size="large"
                      ></ion-icon>
                    </ion-item-option>
                  </ion-item-options>
                </ion-item-sliding>
                <ion-item
                  v-if="completedRaces.length === 0"
                  class="ion-text-center"
                >
                  <ion-label>No completed races</ion-label>
                </ion-item>
              </ion-list>
            </div>
          </ion-accordion>
        </ion-accordion-group>
      </ion-item>

      <!-- FAB and Modal -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="isOpen = true">
          <ion-icon :icon="add" size="large"></ion-icon>
        </ion-fab-button>
      </ion-fab>
      <InputModal
        v-model:isOpen="isOpen"
        v-model:editingId="editingId"
        :race="race"
        @submit="handleSubmit"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  IonIcon,
  IonFab,
  IonFabButton,
  IonAccordion,
  IonAccordionGroup,
  IonLabel,
  IonList,
  loadingController,
  IonRefresher,
  IonRefresherContent,
  toastController,
} from '@ionic/vue';
import {
  add,
  checkmarkCircle,
  close,
  create,
  trash,
  closeCircle,
  warningOutline,
} from 'ionicons/icons';
import InputModal from '../components/InputModal.vue';
import { onMounted, ref, computed, onUnmounted } from 'vue';
import { firestoreService, type Race } from '@/utils/firestore'; // Sesuaikan tipe data Race
import { formatDistanceToNow } from 'date-fns';

const isOpen = ref(false);
const editingId = ref<string | null>(null);
const races = ref<Race[]>([]); // Menggunakan tipe Race
const race = ref<Omit<Race, 'id' | 'createdAt' | 'updatedAt' | 'status'>>({
  name: '',
  description: '',
  trackDetails: '',
  scheduledAt: new Date(),
});
const activeRaces = computed(() => races.value.filter((race) => !race.status));
const completedRaces = computed(() => races.value.filter((race) => race.status));
const itemRefs = ref<Map<string, HTMLIonItemSlidingElement>>(new Map());
let intervalId: any;
const timeUpdateTrigger = ref(0);

// Load races
const loadRaces = async (isLoading = true) => {
  let loading;
  if (isLoading) {
    loading = await loadingController.create({ message: 'Loading races...' });
    await loading.present();
  }
  try {
    races.value = await firestoreService.getRaces();
  } catch (error) {
    console.error(error);
  } finally {
    if (loading) {
      await loading.dismiss();
    }
  }
};

// Handle Refresh
const handleRefresh = async (event: any) => {
  try {
    await loadRaces(false);
  } catch (error) {
    console.error('Error refreshing:', error);
  } finally {
    event.target.complete();
  }
};

// Handle Submit
const handleSubmit = async (raceData: Omit<Race, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
  if (!raceData.name) {
    await showToast('Race name is required', 'warning', warningOutline);
    return;
  }
  try {
    if (editingId.value) {
      await firestoreService.updateRace(editingId.value, raceData as Race);
      await showToast('Race updated successfully', 'success', checkmarkCircle);
    } else {
      await firestoreService.addRace(raceData as Race);
      await showToast('Race added successfully', 'success', checkmarkCircle);
    }
    loadRaces();
  } catch (error) {
    await showToast('An error occurred', 'danger', closeCircle);
    console.error(error);
  } finally {
    editingId.value = null;
  }
};

// Handle Edit
const handleEdit = async (editRace: Race) => {
  const slidingItem = itemRefs.value.get(editRace.id!);
  await slidingItem?.close();

  editingId.value = editRace.id!;
  race.

value = {
    name: editRace.name,
    description: editRace.description,
    trackDetails: editRace.trackDetails,
    scheduledAt: editRace.scheduledAt,
  };
  isOpen.value = true;
};

// Handle Delete
const handleDelete = async (deleteRace: Race) => {
  try {
    await firestoreService.deleteRace(deleteRace.id!);
    await showToast('Race deleted successfully', 'success', checkmarkCircle);
    loadRaces();
  } catch (error) {
    await showToast('Failed to delete race', 'danger', closeCircle);
    console.error(error);
  }
};

// Handle Status
const handleStatus = async (statusRace: Race) => {
  const slidingItem = itemRefs.value.get(statusRace.id!);
  await slidingItem?.close();
  try {
    await firestoreService.updateStatus(statusRace.id!, !statusRace.status);
    await showToast(
      Race marked as ${!statusRace.status ? 'completed' : 'active'},
      'success',
      checkmarkCircle
    );
    loadRaces();
  } catch (error) {
    await showToast('Failed to update status', 'danger', closeCircle);
    console.error(error);
  }
};

// Toast Notification
const showToast = async (message: string, color: string = 'success', icon: string = checkmarkCircle) => {
  const toast = await toastController.create({
    message,
    duration: 2000,
    color,
    position: 'top',
    icon,
  });
  await toast.present();
};

// Relative Time
const getRelativeTime = (date: any) => {
  timeUpdateTrigger.value;
  try {
    const jsDate = date?.toDate ? date.toDate() : new Date(date);
    return formatDistanceToNow(jsDate, { addSuffix: true });
  } catch (error) {
    return 'Invalid date';
  }
};

// Set Item Reference
const setItemRef = (el: any, id: string) => {
  if (el) {
    itemRefs.value.set(id, el.$el);
  }
};

// Mounted and Unmounted
onMounted(() => {
  loadRaces();
  intervalId = setInterval(() => {
    timeUpdateTrigger.value++;
  }, 60000);
});
onUnmounted(() => {
  clearInterval(intervalId);
});
</script>

<style scoped>
ion-card,
ion-accordion-group {
  width: 100%;
}

ion-fab {
  margin: 25px;
}

.limited-text {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

ion-card-title.limited-text {
  -webkit-line-clamp: 1;
  line-clamp: 1;
}

ion-card-subtitle.limited-text {
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.scrollable-container {
  max-height: 80vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.accordion-container {
  --padding-start: 0;
  --inner-padding-end: 0;
}

ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
}

.scrollable-container::-webkit-scrollbar {
  width: 8px;
}

.scrollable-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.scrollable-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.scrollable-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
