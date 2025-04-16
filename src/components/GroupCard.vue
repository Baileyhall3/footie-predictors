<template>
  <router-link 
    :to="`/group/${group[groupIdField]}`" 
    class="bg-white shadow-md rounded-xl p-4 transition hover:shadow-lg"
  >
    <div class=" flex items-center">
      <img :src="group.icon_url ?? '/images/green-football-md.png'" class="w-10 h-10 mr-3" alt="Group Logo"/>
      <div>
        <h3 class="text-lg font-semibold">{{ group[groupNameField] }}</h3>
        <p class="text-gray-500" v-if="!props.hideMemberCount">{{ group.member_count }} members</p>
      </div>
    </div>
    <slot name="additionalGroupInfo"></slot>
  </router-link>
</template>

<script setup lang="ts">

export interface IProps {
  group: Object,
  hideMemberCount?: Boolean,
  groupNameField?: string,
  groupIdField?: string,
}

const props = withDefaults(defineProps<IProps>(), {
  groupNameField: 'name',
  groupIdField: 'id'
});
</script>
