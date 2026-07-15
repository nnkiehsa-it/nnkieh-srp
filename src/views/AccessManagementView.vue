<template>
  <section class="mx-auto w-full max-w-5xl space-y-5 py-2 md:py-6">
    <div><h1 class="text-2xl font-semibold">角色管理</h1><p class="mt-1 text-sm text-ink-500">平台管理員可操作全站；其他管理員只可操作所屬領域。</p></div>
    <div class="grid gap-2 sm:grid-cols-2">
      <div class="panel px-4 py-3 sm:col-span-2">
        <p class="text-sm font-bold">提案分類管理員</p>
        <p class="mt-1 text-xs text-ink-500">分類來自 issue-categories config；可同時選取多個分類。</p>
      </div>
      <div v-for="role in roles" :key="role.code" class="panel px-4 py-3">
        <p class="text-sm font-bold">{{ role.label }}</p>
        <p class="mt-1 text-xs text-ink-500">{{ role.description }}</p>
      </div>
    </div>
    <input v-model="query" class="field" placeholder="搜尋使用者" aria-label="搜尋使用者" />
    <div v-if="loading" class="py-16 text-center text-sm text-ink-500">正在載入角色…</div>
    <EmptyStatePanel v-else-if="error" title="角色讀取失敗" :description="error" icon="warning" />
    <div v-else class="space-y-3">
      <article v-for="user in users" :key="user.uid" class="panel p-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3"><UserAvatar :photo-url="user.photoUrl" :name="user.name" size="sm" /><div><h2 class="text-sm font-bold">{{ user.name }}</h2><p class="text-xs text-ink-500">{{ user.uid }}</p></div></div>
          <div class="flex flex-wrap justify-end gap-2">
            <label v-for="role in roles" :key="role.code" class="flex items-center gap-2 rounded-full bg-ink-50 px-3 py-2 text-xs font-semibold dark:bg-ink-800"><input type="checkbox" :checked="user.roles.includes(role.code)" :disabled="savingUid === user.uid || (role.code !== 'platform-admin' && user.roles.includes('platform-admin'))" @change="toggleRole(user, role.code)" />{{ role.label }}</label>
            <label v-for="category in ISSUE_CATEGORIES" :key="category.id" class="flex items-center gap-2 rounded-full bg-ink-50 px-3 py-2 text-xs font-semibold dark:bg-ink-800"><input type="checkbox" :checked="user.roles.includes('platform-admin') || user.managedIssueCategoryIds.includes(category.id)" :disabled="savingUid === user.uid || user.roles.includes('platform-admin')" @change="toggleCategory(user, category.id)" />{{ category.label }}管理員</label>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import EmptyStatePanel from '@/components/ui/EmptyStatePanel.vue';
import UserAvatar from '@/components/ui/UserAvatar.vue';
import { listRoleAssignments, setUserRoles, type AccessUser } from '@/services/access';
import type { RoleCode } from '@/services/session-role';
import { ISSUE_CATEGORIES } from '@/generated/issue-categories';
const roles: Array<{ code: RoleCode; label: string; description: string }> = [
  { code: 'platform-admin', label: '平台管理員', description: '最高權限，可管理提案、設備、公告、角色與統計。' },
  { code: 'general-affairs', label: '設備管理員', description: '只可處理及管理設備案件。' },
  { code: 'announcement-manager', label: '公告管理員', description: '只可新增、刪除公告及管理公告留言。' },
];
const users = ref<AccessUser[]>([]); const query = ref(''); const loading = ref(false); const error = ref(''); const savingUid = ref('');
async function load() { loading.value = true; error.value = ''; try { users.value = await listRoleAssignments(query.value.trim()); } catch (caught) { error.value = caught instanceof Error ? caught.message : '讀取失敗。'; } finally { loading.value = false; } }
async function saveAccess(user: AccessUser, roles: RoleCode[], categories: string[]) { savingUid.value = user.uid; try { const result = await setUserRoles(user.uid, roles, categories); user.roles = result.roles; user.managedIssueCategoryIds = result.managedIssueCategoryIds; } catch (caught) { error.value = caught instanceof Error ? caught.message : '儲存失敗。'; } finally { savingUid.value = ''; } }
async function toggleRole(user: AccessUser, role: RoleCode) { const next: RoleCode[] = user.roles.includes(role) ? user.roles.filter((value) => value !== role) : role === 'platform-admin' ? ['platform-admin'] : [...user.roles, role]; await saveAccess(user, next, role === 'platform-admin' ? [] : user.managedIssueCategoryIds); }
async function toggleCategory(user: AccessUser, categoryId: string) { const next = user.managedIssueCategoryIds.includes(categoryId) ? user.managedIssueCategoryIds.filter((value) => value !== categoryId) : [...user.managedIssueCategoryIds, categoryId]; await saveAccess(user, user.roles.filter((role) => role !== 'proposal-manager'), next); }
let timer = 0; watch(query, () => { window.clearTimeout(timer); timer = window.setTimeout(() => void load(), 300); }); onMounted(() => void load());
</script>
