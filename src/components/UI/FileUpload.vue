<template>
    <div class="flex items-center justify-center w-full">
        <label for="dropzone-file" class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
            <div class="flex flex-col items-center justify-center pt-5 pb-6">
                <template v-if="previewUrl || props.currentFileUrl">
                    <img :src="props.currentFileUrl ?? previewUrl" alt="Preview" class="object-contain max-h-48 rounded-lg" />
                </template>
                <template v-else>
                    <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span class="font-semibold">
                            Click to upload
                        </span> 
                        or drag and drop
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ readableFileTypes }} (MAX. {{ props.maxFileSizeMB }}MB)</p>
                </template>
            </div>
            <input id="dropzone-file" type="file" class="hidden" :accept="fileTypesList" @change="handleFileChange" />
        </label>
    </div> 
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

type FileType =
  | 'image/png'
  | 'image/jpeg'
  | 'image/gif'
  | 'application/pdf'
  | 'text/csv'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
  | 'application/msword' // .doc
  | 'application/vnd.ms-excel'
  | 'application/zip';

export interface IProps {
    fileTypes: FileType[],
    maxFileSizeMB?: number,
    modelValue: any,
    currentFileUrl?: string
}

const props = withDefaults(defineProps<IProps>(), {
    maxFileSizeMB: 2,
});
const emit = defineEmits<{
  (e: 'update:modelValue', value: File | null): void
}>();

const fileTypeLabels: Record<FileType, string> = {
    'image/png': 'PNG',
    'image/jpeg': 'JPEG',
    'image/gif': 'GIF',
    'application/pdf': 'PDF',
    'text/csv': 'CSV',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'application/msword': 'DOC',
    'application/vnd.ms-excel': 'XLS',
    'application/zip': 'ZIP',
};

const fileTypesList = computed(() => {
    return props.fileTypes.length > 0 ? props.fileTypes.join(' , ') : props.fileTypes[0];
});

const readableFileTypes = computed(() => {
  return props.fileTypes
    .map(type => fileTypeLabels[type] || type)
    .join(', ');
});

const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);

function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;

    selectedFile.value = file;
    emit('update:modelValue', file);

    if (file && file.type.startsWith('image/')) {
        previewUrl.value = URL.createObjectURL(file);
    } else {
        previewUrl.value = null;
    }
}
</script>