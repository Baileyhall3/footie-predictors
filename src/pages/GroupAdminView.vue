<template>
    <div class="container mx-auto py-8">
        <LoadingScreen v-if="isLoading" />
        <NoAccess v-else-if="!hasAccess" />
        <template v-else>
            <PageHeader>
                <template #header>
                    <img 
                        :src="group?.icon_url ?? '/images/green-football-md.png'" 
                        class="w-10 h-10 flex-shrink-0" 
                        alt="Group Logo"
                    />
                    <div>
                        <h2 class="text-2xl font-bold truncate">{{ group?.name }}</h2>
                        <h6 class="text-gray-500">Admin View</h6>
                    </div>
                </template>
                <!-- <template #actionItems>
                    <Dropdown>
                        <template #trigger>
                            <EllipsisVerticalIcon class="size-6 text-gray-500" />
                        </template>
                        <template #items="{ close }">
                            <router-link :to="`/group/${groupId}`" class="text-blue-600 dropdown-item item-separator">
                                Go to Group
                            </router-link>
                            <button 
                                class="dropdown-item disabled:opacity-50 item-separator" 
                                @click="markAllAsRead(); close();"
                                :disabled="unreadNotifications.length === 0"
                                :title="unreadNotifications.length === 0 ? 'All notifications have been read' : 'Mark all notifications as read'"
                            >
                                Mark All as Read
                            </button>
                            <button
                                class="dropdown-item disabled:opacity-50 text-red-600"
                                :disabled="readNotifications.length === 0"
                                @click="deleteAllRead(); close();"
                                :title="readNotifications.length === 0 ? 'No notifications have been read' : 'Delete all notifications that have been read'"
                            >
                                Delete All Read
                            </button>
                        </template>
                    </Dropdown>
                </template> -->
            </PageHeader>
            <Tabs>
                <Tab header="Submitted Predictions">
                    <RoundedContainer v-if="memberPredictionsStatus.length === 0">
                        <p class="text-lg font-medium mb-2">No data yet!</p>
                    </RoundedContainer>
                    <RoundedContainer v-else>
                        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                            <h3 class="text-2xl font-semibold">Members' Submitted Predictions</h3>
                            <SearchBar2 v-model="memberSearchQuery" @update:model-value="handleSearchQuery" placeholder="Search for member..." />
                        </div>
                        <div class="flex gap-2 flex-wrap mb-4">
                            <!-- Example filter buttons -->
                            <button class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                @click="setActiveFilter('all')"
                                :class="{ 'border border-blue-600' : activeMemberFilter === 'all' }"
                            >
                                All
                            </button>
                            <button class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                @click="setActiveFilter('submitted')"
                                :class="{ 'border border-blue-600' : activeMemberFilter === 'submitted' }"
                            >
                                Submitted
                            </button>
                            <button class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                @click="setActiveFilter('unsubmitted')"
                                :class="{ 'border border-blue-600' : activeMemberFilter === 'unsubmitted' }"
                            >
                                Unsubmitted
                            </button>
                        </div>
                        <div v-if="unsubmittedMembers.length" class="rounded-md bg-gray-200 p-2 justify-center mb-2">
                            <div class="flex justify-center mt-2 mb-2">
                                <ExclamationTriangleIcon class="size-6 text-yellow-600" />
                                <span class="ms-2 font-medium">Some members have not submitted all predictions</span>
                            </div>
                            <div class="w-full">
                                <button 
                                    @click="reminderDialog.show()" 
                                    class="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 w-full flex justify-center items-center"
                                >
                                    <Send class="size-4 me-2" />
                                    Send Reminder
                                </button>
                            </div>
                        </div>
                        <div v-for="(member, index) in groupedMembers" :key="member.user_id" 
                            class="flex justify-between items-center py-3"
                            :class="{'border-b': index !== groupedMembers.length - 1}">
                            <UsernameDisplay :user="member" />
                            <span class="font-medium">
                                {{ member.predictions_submitted }} / {{ member.total_matches }}
                            </span>
                        </div>
                    </RoundedContainer>
                </Tab>
                <Tab header="Notifications">
                </Tab>
            </Tabs>
        </template>
    </div>

    <PredictionsReminder :groupMembers="unsubmittedMembers" :groupId="group?.id" ref="reminderDialog" />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from "vue-router";
import { groupsService } from '../api/groupsService';
import { Group } from '../types';
import NoAccess from '../components/NoAccess.vue';
import LoadingScreen from '../components/LoadingScreen.vue';
import { Tab, Tabs, RoundedContainer } from '../components/UI';
import PageHeader from '../components/PageHeader.vue';
import UsernameDisplay from '../components/UI/UsernameDisplay.vue';
import { SearchBar2 } from '../components/UI/input';
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline';
import { Send } from 'lucide-vue-next'; 
import PredictionsReminder from '../components/dialogs/PredictionsReminder.vue';

type MemberFilter = 'all' | 'submitted' | 'unsubmitted'

const isLoading = ref<boolean>(false);
const group = ref<Group>();
const hasAccess = ref<boolean>(true);
const memberPredictionsStatus = ref([]);
const allMemberPredictionsStatus = ref([]);
const memberSearchQuery = ref<string>('');
const activeMemberFilter = ref<MemberFilter>('all');
const unsubmittedMembers = ref([]);
const reminderDialog = ref(null);

const route = useRoute();
const router = useRouter();

onMounted(() => {
    fetchAllData();
});

async function fetchAllData() {
    try {
        isLoading.value = true;

        let groupId = route.params.id || route.query.id;

        if (!groupId) {
            throw new Error('Group ID is missing');
        }

        const { data, error } = await groupsService.getGroupByIdUsingView(groupId);
        if (error) throw new Error(error);

        group.value = data || [];

        if (!group.value?.iAmAdmin) {
            hasAccess.value = false;
            isLoading.value = false;
            return;
        }

        const { data: memberData, error: memberError } = await groupsService.getGroupMembersPredictionsStatus(groupId);
        if (memberError) throw new Error(memberError)

        memberPredictionsStatus.value = memberData || [];
        allMemberPredictionsStatus.value = memberData;
        unsubmittedMembers.value = memberData.filter(x => x.predictions_submitted < x.total_matches);
    } catch (err) {
        console.error(err);
    } finally {
        isLoading.value = false;
    }
}

const groupedMembers = computed(() => {
    let filtered = allMemberPredictionsStatus.value;

    if (activeMemberFilter.value === 'submitted') {
        filtered = filtered.filter(n => n.predictions_submitted === n.total_matches);
    } else if (activeMemberFilter.value === 'unsubmitted') {
        filtered = filtered.filter(n => n.predictions_submitted < n.total_matches);
    }

    if (memberSearchQuery.value.trim()) {
        const query = memberSearchQuery.value.trim().toLowerCase();
        filtered = filtered.filter(n => 
            n.username?.toLowerCase().includes(query)
        );
    }

    return filtered;
});

function handleSearchQuery() {
    const query = memberSearchQuery.value.trim().toLowerCase();

    if (query) {
        memberPredictionsStatus.value = allMemberPredictionsStatus.value.filter(member =>
            member.username.toLowerCase().includes(query)
        );
    } else {
        memberPredictionsStatus.value = allMemberPredictionsStatus.value;
    }
}

function setActiveFilter(filter: MemberFilter) {
    activeMemberFilter.value = filter;
}

</script>