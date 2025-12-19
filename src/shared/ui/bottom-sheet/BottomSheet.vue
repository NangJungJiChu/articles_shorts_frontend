<script setup lang="ts">
import { ref } from 'vue'
import { DrawerRoot, DrawerTrigger, DrawerPortal, DrawerOverlay, DrawerContent, DrawerTitle } from 'vaul-vue'

interface Props {
    snapPoints?: (number | string)[]
}

const props = withDefaults(defineProps<Props>(), {
    snapPoints: () => [0.5, 0.9, 1]
})

const activeSnapPoint = ref<number | string | null>(props.snapPoints?.[0] ?? null)
</script>

<template>
    <DrawerRoot :snapPoints="snapPoints" v-model:activeSnapPoint="activeSnapPoint">
        <DrawerTrigger asChild>
            <slot name="trigger" />
        </DrawerTrigger>

        <DrawerPortal>
            <DrawerOverlay class="drawer-overlay" />
            <DrawerContent class="drawer-content">
                <div class="drawer-inner-content" :class="{ 'scrollable': activeSnapPoint === 1 }">
                    <div class="drawer-handle" />
                    <div class="drawer-body">
                        <DrawerTitle class="drawer-title">
                            <slot name="title">Comments</slot>
                        </DrawerTitle>
                        <slot name="content" />
                    </div>
                </div>
            </DrawerContent>
        </DrawerPortal>
    </DrawerRoot>
</template>

<style scoped>
.drawer-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 500;
}

.drawer-content {
    background-color: white;
    display: flex;
    flex-direction: column;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100%;
    max-height: 97%;
    margin: 0 -1px;
    z-index: 501;
    outline: none;
    border: 1px solid #e5e7eb;
    /* border-gray-200 */
    border-bottom: none;
}

/* 
   Important: vaul-vue might obscure content if height isn't managed.
   The library handles the translation (y-axis) based on snap points.
   We just define the layout.
*/

.drawer-inner-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px 16px 16px 16px;
    /* p-4 pt-5 */
    max-width: 28rem;
    /* max-w-md */
    margin: 0 auto;
    width: 100%;
    overflow: hidden;
    /* Default hidden */
}

/* Equivalent to: 'overflow-y-auto': snap === 1 */
.drawer-inner-content.scrollable {
    overflow-y: auto;
}

.drawer-handle {
    margin: 0 auto 32px auto;
    width: 48px;
    height: 6px;
    flex-shrink: 0;
    border-radius: 9999px;
    background-color: #d4d4d8;
    /* bg-zinc-300 / equivalent to gray-300 */
}

.drawer-body {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.drawer-title {
    font-size: 1.5rem;
    /* text-2xl */
    font-weight: 500;
    color: #111827;
    /* text-gray-900 */
    margin-bottom: 8px;
    /* mt-2 (approx) */
}
</style>
