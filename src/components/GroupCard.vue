<template>
  <router-link 
    :to="`/group/${group[groupIdField]}`" 
    class="bg-white shadow rounded-xl p-4 transition hover:shadow-md"
  >
    <div class=" flex items-center min-w-0 w-full">
      <img :src="group.icon_url ?? '/images/green-football-md.png'" class="w-10 h-10 mr-3" alt="Group Logo"/>
      <div class="min-w-0">
        <div class="flex items-center min-w-0">
          <span title="Join requested for this group" v-if="group.joinRequestSent">
            <Send class="size-4 me-2" />
          </span>
          <!-- <span title="This group is private" v-if="!group.is_public">
            <LockClosedIcon class="size-5 me-1" />
          </span> -->
          <span title="You are the owner of this group" v-if="group.iAmOwner">
            <Crown class="size-5 text-yellow-300 me-1" />
          </span>
          <h3 class="text-lg font-semibold truncate">{{ group[groupNameField] }}</h3>
        </div>
        <div class="flex items-center" v-if="!props.hideMemberCount">
          <UsersIcon class="size-5 me-1 text-black" />
          {{ group.member_count }}
        </div>
      </div>
    </div>
    <slot name="additionalGroupInfo"></slot>
  </router-link>
</template>

<script setup lang="ts">
import type { Group } from '../types';
import { UsersIcon } from '@heroicons/vue/24/solid';
import { Crown, Send } from 'lucide-vue-next'; 

export interface IProps {
  group: Group,
  hideMemberCount?: Boolean,
  groupNameField?: string,
  groupIdField?: string,
}

const props = withDefaults(defineProps<IProps>(), {
  groupNameField: 'name',
  groupIdField: 'id'
});
</script>
