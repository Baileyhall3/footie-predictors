<template>
    <button v-if="userStore.userProfile?.favourite_group_id === props.group.id" 
        @click="toggleGroupFavourite(false)" 
        class="me-2" 
        title="Remove as favourite group"
    >
        <StarIcon class="size-6 text-yellow-400" />
    </button>
    <button 
        v-else
        @click="toggleGroupFavourite(true)" 
        class="me-2" 
        title="Set as favourite group"
    >
        <StarOutlineIcon class="size-6 text-yellow-400 hover:text-yellow-500" />
    </button>
    <button @click="copyPageLink('Group')" class="p-1 rounded-md hover:bg-gray-200" title="Copy group link">
        <LinkIcon class="size-6 text-blue-500" />
    </button>
    <Dropdown>
        <template #trigger>
            <EllipsisVerticalIcon class="size-6 text-gray-500" />
        </template>
        <template #items>
            <router-link :to="`/gameweek/${activeGameweek?.id}`" class="text-blue-600 dropdown-item item-separator" v-if="activeGameweek">
                Gameweek {{ activeGameweek?.week_number }}
            </router-link>
            <router-link :to="`/season/${activeSeason?.id}`" class="text-blue-600 dropdown-item item-separator" v-if="activeSeason">
                {{ activeSeason?.name }}
            </router-link>
            <router-link :to="`/user-group-profile/${props.group.id}/${userStore.user?.id}`" class="text-blue-600 dropdown-item item-separator">
                My Group Profile
            </router-link>
            <router-link :to="`/group/${props.group.id}/notifications`" class="text-blue-600 dropdown-item item-separator">
                Notifications
            </router-link>
            <template v-if="group?.iAmAdmin">
                <router-link :to="`/group/${group?.id}/admin-view`" >
                    <button class="dropdown-item item-separator text-blue-600 ">
                        Admin View
                    </button>
                </router-link>
            <button class="dropdown-item item-separator" @click="createNotificationDialog.show()">
                Create Notification
            </button>
        </template>
            <template v-if="group?.iAmOwner">
                <router-link :to="`/group/${group?.id}/update-group`" >
                    <button class="dropdown-item item-separator">
                        Edit
                    </button>
                </router-link>
                <router-link :to="`/group/${group?.id}/create-gameweek`" v-if="!activeSeason?.is_finished">
                    <button class="dropdown-item item-separator">
                        Create Gameweek
                    </button>
                </router-link>
                <button class="dropdown-item" @click="createSeasonDialog.show()">
                    New Season
                </button>
            </template>
            <template v-else>
                <button @click="emit('leftGroupClicked')" 
                    class="dropdown-item text-red-700"
                >
                    Leave Group
                </button>
            </template>
        </template>
    </Dropdown>

    <CreateNotification :groupId="props.group.id" ref="createNotificationDialog" />
    <CreateSeason :group="props.group" ref="createSeasonDialog" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { userStore } from "../../../store/userStore";
import { LinkIcon, EllipsisVerticalIcon, StarIcon } from "@heroicons/vue/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/vue/24/outline";
import Dropdown from "../Dropdown.vue";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { copyPageLink } from "../../../utils/sharedFunctions";
import CreateNotification from "../../dialogs/CreateNotification.vue";
import CreateSeason from "../../dialogs/CreateSeason.vue";

const props = defineProps<{
    group: any,
    activeGameweek: any,
    activeSeason: any   
}>();

const emit = defineEmits(['leftGroupClicked']);

const createNotificationDialog = ref(null);
const createSeasonDialog = ref(null);   

function toggleGroupFavourite(isFavourite: boolean) {
    userStore.updateFavouriteGroup(isFavourite ? props.group : null);
    toast(`Group ${isFavourite ? 'set' : 'removed'} as favourite!`, {
        "type": "success",
        "position": "top-center"
    });
}
</script>