<template>
  <SkeletonBlock v-if="authorProfile.loading" :class="skeletonSizeClass" class="shrink-0 rounded-full" />
  <UserAvatar
    v-else
    :photo-url="authorProfile.profile?.photoUrl ?? null"
    :name="authorProfile.profile?.displayName ?? ''"
    :size="size"
    :alt-text="altText"
  />
</template>

<script setup lang="ts">
import UserAvatar from '@/components/ui/atoms/UserAvatar.vue';
import SkeletonBlock from '@/components/ui/atoms/SkeletonBlock.vue';
import { useAuthorProfile } from '@/composables/useAuthorProfile';
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  altText?: string;
  authorUid: string | null;
  size?: 'sm' | 'md' | 'lg';
}>(), {
  altText: 'settings.userAvatar',
  size: 'md',
});

const authorProfile = useAuthorProfile(() => props.authorUid);
const skeletonSizeClass = computed(() => ({
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-16 w-16',
})[props.size]);
</script>
