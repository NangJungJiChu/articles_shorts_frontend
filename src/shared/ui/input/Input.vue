<script setup lang="ts">
interface Props {
    modelValue: string
    placeholder?: string
    type?: 'text' | 'password' | 'email' | 'number'
}

interface Emits {
    (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    placeholder: '',
    type: 'text',
})

const emit = defineEmits<Emits>()

const updateValue = (event: Event) => {
    const target = event.target as HTMLInputElement
    emit('update:modelValue', target.value)
}
</script>

<template>
    <input :type="props.type" :value="props.modelValue" :placeholder="props.placeholder" class="custom-input"
        @input="updateValue" />
</template>

<style scoped>
.custom-input {
    box-sizing: border-box;
    width: 100%;
    height: 48px;
    background-color: #eeeeee;
    /* gray-200 */
    border: none;
    border-radius: 4px;
    padding: 0 16px;
    color: #000000;

    /* label-small */
    font-family: var(--font-family-base);
    font-size: var(--font-label-small-size);
    line-height: var(--font-label-small-line-height);
    letter-spacing: var(--font-label-small-letter-spacing);
    font-weight: 500;

    outline: none;
    transition: background-color 0.2s;
}

.custom-input::placeholder {
    color: #9e9e9e;
    /* gray-500 */
}

.custom-input:focus {
    background-color: #e0e0e0;
    /* Slightly darker on focus */
}
</style>
