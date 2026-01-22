<template>
    <TransitionGroup name="member-list" tag="div">
        <div v-for="(member, index) in visibleMembers"
            :key="member.id"
            class="flex justify-between items-center py-3"
            :class="{'border-b': index !== visibleMembers.length - 1}"
        >
            <div class="flex items-center space-x-2">
                <component
                    :is="props.includeProfileLink ? 'router-link' : 'span'"
                    :to="props.includeProfileLink ? `/user-group-profile/${props.groupId}/${member.id}` : undefined"
                >
                    <div class="flex items-center space-x-2">
                        <div v-if="member.profile_picture_url" class=" w-6 h-6 flex items-center justify-center rounded-full overflow-hidden me-2">
                            <img :src="member.profile_picture_url" alt="Profile Image" class="object-cover w-full h-full" />
                        </div>
                        <div v-else class="flex items-center justify-center rounded-full w-6 h-6 text-white text-sm font-medium me-2"
                            :style="{ backgroundColor: member.bg_colour || '#ccc' }"
                        >
                            {{ member.username.charAt(0).toUpperCase() }}
                        </div>
                        {{ member.username }}
                    </div>
                </component>
                <span v-if="member.id === userStore.user?.id" title="You">
                    <StarIcon class="size-5 text-yellow-300" />
                </span>
                <template v-if="props.groupOwner">
                    <span v-if="member.is_admin && groupOwner.id !== member.id" class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        Admin
                    </span>
                    <span title="User is the owner of this group">
                        <Crown v-if="groupOwner.id === member.id" class="size-5 text-xs text-yellow-300 me-1" />
                    </span>
                </template>
            </div>

            <slot name="additionalContent" v-bind="{ member }"></slot>

            <Dropdown v-if="isAdmin && userStore.user?.id !== member.id && groupOwner.id !== member.id">
                <template #items>
                    <button
                        @click="updateAdminStatus(member)"
                        :disabled="member.is_fake"
                        class="dropdown-item"
                    >
                        {{ member.is_admin ? 'Remove Admin' : 'Make Admin' }}
                    </button>

                    <RouterLink
                        v-if="props.groupId && props.includeProfileLink"
                        :to="`/user-group-profile/${props.groupId}/${member.id}`"
                        class="dropdown-item item-separator text-blue-600"
                    >
                        Group Profile
                    </RouterLink>

                    <RouterLink
                        v-if="member.is_fake && props.gameweek && !props.gameweek?.is_locked"
                        :to="`/admin-gameweek-predictions/${props.gameweek.id}/${member.id}`"
                        class="dropdown-item"
                    >
                        Predict
                    </RouterLink>

                    <button @click="removeMember(member)" class="dropdown-item text-red-700">
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
import { GroupMember, Gameweek } from '../types';
import { RouterLink } from 'vue-router';
import { Crown } from 'lucide-vue-next';
import { StarIcon } from "@heroicons/vue/24/solid";

interface Owner {
    username: string;
    id: string;
}
  
export interface IProps {
    members: GroupMember[];
    groupOwner?: Owner;
    gameweek?: Gameweek;
    memberLimit?: number;
    includeProfileLink?: boolean;
    groupId?: string;
}
const props = withDefaults(defineProps<IProps>(), {
    memberLimit: 10
});
const emit = defineEmits(["update-admin-status", "member-removed"]);

const rowTag = computed(() =>
  props.includeProfileLink && props.groupId ? RouterLink : 'div'
)

/** Build the destination path for a member */
const memberPath = (memberId: string | number) =>
  `/user-group-profile/${props.groupId}/${memberId}`

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

function updateAdminStatus(member: GroupMember) {
    emit("update-admin-status", member)
}

function removeMember(member: GroupMember) {
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