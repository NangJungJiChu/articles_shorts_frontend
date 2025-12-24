import { ref } from 'vue'

interface ConfirmOptions {
    title?: string
    message: string
    confirmText?: string
    cancelText?: string
}

const isVisible = ref(false)
const options = ref<ConfirmOptions>({
    title: '',
    message: '',
    confirmText: '확인',
    cancelText: '취소'
})

let resolvePromise: (value: boolean) => void

export function useConfirm() {
    const confirm = (message: string, title: string = '확인', confirmText = '확인', cancelText = '취소'): Promise<boolean> => {
        options.value = {
            title,
            message,
            confirmText,
            cancelText
        }
        isVisible.value = true

        return new Promise((resolve) => {
            resolvePromise = resolve
        })
    }

    const handleConfirm = () => {
        isVisible.value = false
        resolvePromise(true)
    }

    const handleCancel = () => {
        isVisible.value = false
        resolvePromise(false)
    }

    return {
        isVisible,
        options,
        confirm,
        handleConfirm,
        handleCancel
    }
}
