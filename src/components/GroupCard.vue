<template>
  <router-link 
    :to="`/group/${group[groupIdField]}`" 
    class="bg-white shadow-md rounded-xl p-4 transition hover:shadow-lg"
  >
    <div class=" flex items-center">
      <img :src="group.icon_url ?? '/images/green-football-md.png'" class="w-10 h-10 mr-3" alt="Group Logo"/>
      <div>
        <div class="flex items-center">
          <span title="Join requested for this group">
            <Send class="size-4 me-2" v-if="group.joinRequestSent" />
          </span>
          <span title="You are the owner of this group">
            <Crown v-if="group.iAmOwner" class="size-5 text-yellow-300 me-1" />
          </span>
          <h3 class="text-lg font-semibold">{{ group[groupNameField] }}</h3>
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
