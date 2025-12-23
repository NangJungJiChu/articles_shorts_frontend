
import { ref, computed, watchEffect } from 'vue'
import { useCategoryListQuery } from '@/entities/post'

export function useCategorySelect() {
    const categoryId = ref<string | null>(null)
    const { data: categories } = useCategoryListQuery()

    const categoryOptions = computed(() => {
        return categories.value?.map(cat => ({
            id: cat.id,
            label: cat.name
        })) || []
    })

    // Set default category if available
    watchEffect(() => {
        if (!categoryId.value && categoryOptions.value.length > 0) {
            // Default to 'mildlyinteresting' if exists, else first one
            const defaultCat = categoryOptions.value.find(c => c.id === 'mildlyinteresting') || categoryOptions.value[0]
            if (defaultCat) {
                categoryId.value = String(defaultCat.id)
            }
        }
    })

    return {
        categoryId,
        categoryOptions,
        categories
    }
}
