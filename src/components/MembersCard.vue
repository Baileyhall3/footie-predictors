<template>
    <TransitionGroup name="member-list" tag="div">
        <div v-for="member in visibleMembers" :key="member.id" class="flex justify-between items-center border-b py-3">
            <div class="flex items-center space-x-2">
                <div
                    class="flex items-center justify-center rounded-full w-6 h-6 text-white text-sm font-medium"
                    :style="{ backgroundColor: member.bg_colour || '#ccc' }"
                >
                    {{ member.username.charAt(0).toUpperCase() }}
                </div>
                <span >{{ member.username }}</span>
                <span v-if="member.id === userStore.user?.id" class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">You</span>
                <span v-if="member.is_admin && groupOwner.id != member.id" class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Admin</span>
                <span v-if="groupOwner.id === member.id" class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Owner</span>
            </div>

            <Dropdown v-if="isAdmin && userStore.user?.id !== member.id && groupOwner.id != member.id">
                <template #items>
                    <button 
                        @click="updateAdminStatus(member)" 
                        :disabled="member.is_fake"
                        class="dropdown-item"
                    >
                        {{ member.is_admin ? 'Remove Admin' : 'Make Admin' }}
                    </button>

                    <router-link 
                        v-if="member.is_fake && props.gameweek && !props.gameweek?.is_locked" 
                        :to="`/admin-gameweek-predictions/${props.gameweek?.id}/${member.id}`"
                        class="dropdown-item"
                    >
                        Predict
                    </router-link>

                    <button 
                        @click="removeMember(member)" 
                        class="dropdown-item text-red-700"
                    >
                        Remove
                    </button>
                </template>
            </Dropdown>
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
import Dropdown from './UI/Dropdown.vue';
import { GroupMember } from '../types';

interface Owner {
    email: string;
    username: string;
    id: string;
}
  
export interface IProps {
  members: GroupMember[];
  groupOwner: Owner;
  gameweek?: {};
  memberLimit?: number
}
const props = withDefaults(defineProps<IProps>(), {
    memberLimit: 10
});
const emit = defineEmits(["update-admin-status", "member-removed"]);

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