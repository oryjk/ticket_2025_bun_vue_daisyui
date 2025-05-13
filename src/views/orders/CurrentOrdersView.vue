<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth"; // Import the auth store
import OrderList from "@/components/orders/OrderList.vue"; // Import the OrderList component
import { type Match } from "@/types/match";

const authStore = useAuthStore(); // Instantiate the auth store

// State variables for fetching current match
const currentMatchId = ref<string | null>(null);
const isLoadingMatch = ref(false);
const matchError = ref<string | null>(null);

// Function to fetch the current match ID
const fetchCurrentMatch = async () => {
    const license = authStore.memberInfo?.member_key;
    if (!license) {
        matchError.value = "无法获取 License 信息，请尝试重新登录。";
        return;
    }

    isLoadingMatch.value = true;
    matchError.value = null; // Clear previous errors
    currentMatchId.value = null; // Clear previous data

    try {
        // Assuming the endpoint is /api/current-match
        const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/match/currentMatch?licence_key=${encodeURIComponent(license)}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    // Add authorization header if required by your backend
                    // \'Authorization\': `Bearer ${authStore.token}`
                },
            },
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(
                errorData?.message ||
                    `获取当前比赛信息失败 (状态码: ${response.status})`,
            );
        }
        const data: Match = await response.json(); // Use Match interface
        // Extract match_id from the response body
        currentMatchId.value = data.match_id; // Use match_id field
    } catch (error: any) {
        matchError.value = error.message || "加载当前比赛信息时发生错误。";
    } finally {
        isLoadingMatch.value = false;
    }
};

// Fetch current match when the component is mounted
onMounted(() => {
    // Check if user is logged in and has license before fetching
    if (authStore.isLoggedIn && authStore.memberInfo?.member_key) {
        fetchCurrentMatch();
    } else {
        matchError.value = "未登录或无法获取 License，请前往首页登录。";
    }
});
</script>

<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold mb-4">当前订单</h1>

        <!-- Display status based on current match fetch -->
        <div v-if="isLoadingMatch" class="text-center text-lg">
            加载当前比赛信息中...
            <span class="loading loading-spinner loading-lg ml-2"></span>
        </div>

        <div v-else-if="matchError" class="text-center text-error">
            {{ matchError }}
        </div>

        <!-- Use OrderList component if matchId is available -->
        <div v-else-if="currentMatchId">
            <OrderList :match-id="currentMatchId" />
        </div>

        <div v-else class="text-center text-gray-500">
            未能获取当前比赛信息，无法显示订单。
        </div>
    </div>
</template>

<style scoped>
/* Add component-specific styles here */
</style>
