<template>
  <Teleport to="body">
      <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex justify-center items-center z-50" @click.self="cancel">
          <div class="bg-white rounded-lg shadow-xl p-6 w-96 text-center">
              <h2 class="text-xl font-semibold mb-4">Create New Member</h2>
              <p class="text-gray-700 mb-4">Create a new member to be added to the group.</p>

              <div>
                  <input
                    ref="inputRef"
                    v-model="username"
                    type="text"
                    placeholder="Enter username"
                    class="w-full border p-2 rounded-md"
                    required
                  />
              </div>

              <p v-if="errorMessage" class="text-red-500 mt-3">{{ errorMessage }}</p>

              <div class="mt-6 flex justify-center gap-4">
                  <button :disabled="!username" @click="confirm" class="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50">
                      Create
                  </button>
                  <button @click="cancel" class="bg-gray-300 px-4 py-2 rounded-md font-medium hover:bg-gray-400">
                      Cancel
                  </button>
              </div>
          </div>
      </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import { groupsService } from "../api/groupsService";

const props = defineProps({
  groupId: {
    type: Number,
    required: true,
  },
});
const emit = defineEmits(["user-created"]);

const isVisible = ref(false);
const errorMessage = ref("");
const username = ref("");
const inputRef = ref<HTMLInputElement | null>(null);

const show = async () => {
  isVisible.value = true;
  username.value = "";
  errorMessage.value = "";

  await nextTick();
  inputRef.value?.focus();
};

const confirm = async() => {
  if (username.value == "") {
    errorMessage.value = "You must enter a username to create user."
    return;
  }
  else {
    try {
      const { data: createdUser, error: createdUserError } = await groupsService.addFakeUserToGroup(props.groupId, username.value);
      if (createdUserError) {
        errorMessage.value = createdUserError;
        throw new Error('Failed to create user');
      }
      emit("user-created", createdUser);
      isVisible.value = false;
    } catch (err) {
      errorMessage.value = err;
      console.error(err);
    }
  }
};

const cancel = () => {
  isVisible.value = false;
};

// Expose the show method to be called from parent
defineExpose({ show });
</script>
