<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const route = useRoute(); // 获取当前路由对象
const authStore = useAuthStore(); // Instantiate the auth store

const isDev = import.meta.env.DEV; // Expose development mode status to the template

// 检查当前路由是否活跃的函数
const isActiveRoute = (path: string) => {
    // 检查当前路由路径是否精确匹配给定的路径
    // 或者 (如果给定的路径不是 '/')，检查当前路由路径是否以给定路径开头 (用于处理嵌套路由)
    return route.path === path || (path !== "/" && route.path.startsWith(path));
    // 如果你只需要精确匹配，可以使用 return route.path === path;
};

// Function to clear localStorage and reset auth state
const clearLocalStorage = () => {
    localStorage.clear();
    // Also reset Pinia state to reflect the change
    authStore.isLoggedIn = false;
    authStore.memberInfo = null;
    // Optional: Force a page reload or redirect to home if necessary
    // window.location.reload();
    // router.push('/'); // Need to import useRouter for this
};
</script>

<template>
    <div class="pb-16">
        <RouterView />
    </div>
    <div class="dock">
        <RouterLink
            to="/orders/current"
            v-if="authStore.isLoggedIn"
            class="dock-item"
            :class="{ 'dock-active': isActiveRoute('/orders/current') }"
        >
            <svg
                class="size-[1.2em]"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
            >
                <g
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                >
                    <path
                        d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"
                    ></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <line x1="10" y1="9" x2="8" y2="9"></line>
                </g>
            </svg>
            <span class="dock-label">当前订单</span>
        </RouterLink>

        <router-link
            to="/orders/history"
            v-if="authStore.isLoggedIn"
            class="dock-item"
            :class="{ 'dock-active': isActiveRoute('/orders/history') }"
        >
            <svg
                class="size-[1.2em]"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
            >
                <g
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </g>
            </svg>
            <span class="dock-label">历史订单</span>
        </router-link>

        <router-link
            to="/my"
            v-if="authStore.isLoggedIn"
            class="dock-item"
            :class="{ 'dock-active': isActiveRoute('/my') }"
        >
            <svg
                class="size-[1.2em]"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
            >
                <g
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </g>
            </svg>
            <span class="dock-label">我的</span>
        </router-link>
    </div>
    <!-- Floating button to clear localStorage in development -->
    <button
        v-if="isDev"
        class="btn btn-error btn-sm fixed bottom-24 right-4 z-50"
        @click="clearLocalStorage"
    >
        清除缓存
    </button>
</template>

<style scoped></style>
