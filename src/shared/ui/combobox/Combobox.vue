<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@/shared/ui/icon'

interface Option {
    id: string | number
    label: string
}

interface Props {
    modelValue: string | number | null
    options: Option[]
    placeholder?: string
    searchPlaceholder?: string
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: 'Select option...',
    searchPlaceholder: 'Search...'
})

const emit = defineEmits<{
    (e: 'update:modelValue', value: string | number | null): void
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const wrapperRef = ref<HTMLElement | null>(null)

const selectedLabel = computed(() => {
    const selected = props.options.find(opt => opt.id === props.modelValue)
    return selected ? selected.label : props.placeholder
})

const filteredOptions = computed(() => {
    if (!searchQuery.value) return props.options
    return props.options.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
})

const toggleDropdown = () => {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
        searchQuery.value = ''
    }
}

const selectOption = (option: Option) => {
    emit('update:modelValue', option.id)
    isOpen.value = false
}

// Close on click outside
const closeDropdown = (e: MouseEvent) => {
    if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
        isOpen.value = false
    }
}

// Global click listener
watch(isOpen, (newVal) => {
    if (newVal) {
        window.addEventListener('click', closeDropdown)
    } else {
        window.removeEventListener('click', closeDropdown)
    }
})
</script>

<template>
    <div class="combobox-wrapper" ref="wrapperRef">
        <!-- Trigger Button -->
        <button type="button" class="combobox-trigger" @click.stop="toggleDropdown" :class="{ active: isOpen }">
            <span class="combobox-value" :class="{ placeholder: !modelValue }">
                {{ selectedLabel }}
            </span>
            <Icon name="expand_more" class="chevron-icon" :class="{ rotate: isOpen }" />
        </button>

        <!-- Dropdown Menu -->
        <div v-show="isOpen" class="combobox-dropdown">
            <!-- Search Input -->
            <div class="search-container">
                <Icon name="search" class="search-icon" />
                <input ref="searchInput" v-model="searchQuery" type="text" :placeholder="searchPlaceholder"
                    class="search-input" @click.stop />
            </div>

            <!-- Options List -->
            <ul class="options-list">
                <li v-for="option in filteredOptions" :key="option.id" class="option-item"
                    :class="{ selected: modelValue === option.id }" @click.stop="selectOption(option)">
                    {{ option.label }}
                    <Icon v-if="modelValue === option.id" name="check" class="check-icon" />
                </li>
                <li v-if="filteredOptions.length === 0" class="no-results">
                    No results found.
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
.combobox-wrapper {
    position: relative;
    width: 100%;
}

.combobox-trigger {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background-color: var(--color-white);
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
    text-align: left;
}

.combobox-trigger:hover,
.combobox-trigger.active {
    border-color: var(--color-blue-500);
}

.combobox-value {
    color: #333;
    font-weight: 500;
}

.combobox-value.placeholder {
    color: var(--color-gray-500);
}

.chevron-icon {
    color: var(--color-gray-500);
    transition: transform 0.2s;
}

.chevron-icon.rotate {
    transform: rotate(180deg);
}

.combobox-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    width: 100%;
    background: var(--color-white);
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 50;
    overflow: hidden;
}

.search-container {
    padding: 8px;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    align-items: center;
    gap: 8px;
}

.search-icon {
    font-size: 18px;
    color: var(--color-gray-500);
}

.search-input {
    width: 100%;
    border: none;
    outline: none;
    font-size: 14px;
    color: #333;
}

.options-list {
    max-height: 200px;
    overflow-y: auto;
    padding: 4px 0;
    list-style: none;
    margin: 0;
}

.option-item {
    padding: 10px 16px;
    font-size: 14px;
    color: #333;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.option-item:hover {
    background-color: var(--color-gray-100);
}

.option-item.selected {
    background-color: var(--color-blue-50);
    color: var(--color-blue-600);
    font-weight: 500;
}

.check-icon {
    font-size: 18px;
    color: var(--color-blue-600);
}

.no-results {
    padding: 16px;
    text-align: center;
    color: var(--color-gray-500);
    font-size: 14px;
}
</style>
