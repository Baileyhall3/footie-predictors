<template>
    <TransitionGroup name="member-list" tag="div">
        <div v-for="member in visibleMembers" :key="member.id" class="flex justify-between items-center border-b py-3">
            <div class="flex items-center space-x-2">
                <UserIcon class="text-gray-500 size-4" />
                <span >{{ member.username }}</span>
                <span v-if="member.id === userStore.user?.id" class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">You</span>
                <span v-if="member.is_admin && groupOwner.id != member.id" class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Admin</span>
                <span v-if="groupOwner.id === member.id" class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Owner</span>
            </div>
              
            <div v-if="isAdmin && userStore.user?.id !== member.id && groupOwner.id != member.id" class="relative flex items-center gap-2">
                <!-- Ellipsis Dropdown -->
                <div class="relative">
                    <button @click="toggleDropdown(member.id)" class="p-1 rounded-md hover:bg-gray-200" :class="{'bg-gray-200': openMembersDropdown === member.id}">
                        <EllipsisHorizontalIcon class="size-6 text-gray-500" />
                    </button>
    
                    <!-- Dropdown Menu -->
                    <Transition name="fade-slide">
                        <div v-if="openMembersDropdown === member.id" 
                        class="absolute right-0 w-32 bg-white shadow-lg rounded-md border z-50"
                        >
                        <button 
                            @click="updateAdminStatus(member)" 
                            :disabled="member.is_fake"
                            class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-200 disabled:opacity-50"
                        >
                            {{ member.is_admin ? 'Remove Admin' : 'Make Admin' }}
                        </button>
    
                        <router-link 
                            v-if="member.is_fake && props.gameweek && !props.gameweek?.is_locked" 
                            :to="`/admin-gameweek-predictions/${props.gameweek?.id}/${member.id}`"
                            class="block px-4 py-2 text-sm  hover:bg-gray-200"
                        >
                            Predict
                        </router-link>
    
                        <button 
                            @click="removeMember(member)" 
                            class="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-200"
                        >
                            Remove
                        </button>
                        </div>
                    </Transition>
                </div>
            </div>
        </div>
    </TransitionGroup>
    <div v-if="hasMoreMembers" class="text-center mt-4">
        <button 
            @click="showMore"
            class="text-blue-600 hover:underline font-medium"
        >
            Show {{ remainingCount }} more member<span v-if="remainingCount > 1">s</span>
        </button>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { userStore } from "../store/userStore";
import { userIsAdmin } from '../utils/checkPermissions';
import { UserIcon } from "@heroicons/vue/24/outline";
import { EllipsisHorizontalIcon } from "@heroicons/vue/24/solid";
  
interface Member {
  id: string;
  email?: string;
  is_admin: boolean;
  is_fake: boolean;
  joined_at: Date | string;
  membership_id: string;
  username: string;
}

interface Owner {
    email: string;
    username: string;
    id: string;
}
  
export interface IProps {
  members: Member[];
  groupOwner: Owner;
  gameweek?: {};
  memberLimit?: number
}
const props = withDefaults(defineProps<IProps>(), {
    memberLimit: 10
});
const emit = defineEmits(["update-admin-status", "member-removed"]);

const openMembersDropdown = ref(null);
const displayLimit = ref(props.memberLimit);

const visibleMembers = computed(() => {
    return props.members.slice(0, displayLimit.value);
});

const hasMoreMembers = computed(() => {
    return props.members.length > displayLimit.value;
});

const remainingCount = computed(() => {
  const remaining = props.members.length - displayLimit.value;
  return remaining > props.memberLimit ? props.memberLimit : remaining;
});

const isAdmin = computed(() => {
    return userIsAdmin(props.members);
});

const toggleDropdown = (memberId: string) => {
    openMembersDropdown.value = openMembersDropdown.value === memberId ? null : memberId;
};

// Close dropdown when clicking outside
document.addEventListener("click", (event) => {
    if (!event.target.closest(".relative")) {
        openMembersDropdown.value = null;
    }
});

function updateAdminStatus(member: Member) {
    emit("update-admin-status", member)
}

function removeMember(member: Member) {
    emit("member-removed", member);
}

const showMore = () => {
  const nextLimit = displayLimit.value + props.memberLimit;
  displayLimit.value = Math.min(nextLimit, props.members.length);
};

</script>

<style scoped>
/* Fade and slide-down effect */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 0.2s ease-out, transform 0.2s ease-out;
}

.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.member-list-enter-active,
.member-list-leave-active {
  transition: all 0.3s ease;
}
.member-list-enter-from,
.member-list-leave-to {
  opacity: 0;
  transform: translateY(8px);
}


.members-fade-slide-enter-active,
.members-fade-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.members-fade-slide-enter-from,
.members-fade-slide-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

</style>