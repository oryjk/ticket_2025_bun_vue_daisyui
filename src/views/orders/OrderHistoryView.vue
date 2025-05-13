<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth"; // Import the auth store
import OrderList from "@/components/orders/OrderList.vue"; // Import the OrderList component
import { type Match } from "@/types/match";

const authStore = useAuthStore(); // Instantiate the auth store

// State variables for fetching historical matches
const historicalMatches = ref<Match[]>([]);
const isLoadingMatches = ref(false);
const matchesError = ref<string | null>(null);

// State variable for the selected match ID
const selectedMatchId = ref<string | null>(null);

// Function to fetch historical matches
const fetchHistoricalMatches = async () => {
    const license = authStore.memberInfo?.member_key;
    if (!license) {
        matchesError.value = "无法获取 License 信息，请尝试重新登录。";
        return;
    }

    isLoadingMatches.value = true;
    matchesError.value = null; // Clear previous errors
    historicalMatches.value = []; // Clear previous data
    selectedMatchId.value = null; // Clear selected match

    try {
        // Assuming the endpoint is /api/historical-matches
        const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/match/matchList?licence_key=${encodeURIComponent(license)}`,
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
                    `获取历史比赛列表失败 (状态码: ${response.status})`,
            );
        }

        const currentTime = new Date();
        const data: Match[] = await response.json();
        historicalMatches.value = data.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
        historicalMatches.value.forEach((match) => {
            // 确保 match.begin_date 是 Date 对象。如果你的原始数据中是字符串，
            // 并且你没有在排序前或赋值前转换，这里需要 new Date(match.begin_date)
            // 但根据你的接口定义，我们假设它已经是 Date 对象了。
            if (new Date(match.begin_date) <= currentTime) {
                // 如果比赛开始时间早于或等于当前时间，则认为已完成
                match.is_complate = true;
            } else {
                // 如果比赛开始时间晚于当前时间，则认为未完成 (确保初始值是 false)
                match.is_complate = false; // 明确设置为 false，以防原始数据不是 false
            }
        });
    } catch (error: any) {
        matchesError.value = error.message || "加载历史比赛列表时发生错误。";
    } finally {
        isLoadingMatches.value = false;
    }
};

// Function to select a match and display its orders
const selectMatch = (matchId: string) => {
    selectedMatchId.value = matchId;
};

// Function to go back to the match list
const goBackToMatchList = () => {
    selectedMatchId.value = null;
};

// Fetch historical matches when the component is mounted
onMounted(() => {
    // Check if user is logged in and has license before fetching
    if (authStore.isLoggedIn && authStore.memberInfo?.member_key) {
        fetchHistoricalMatches();
    } else {
        matchesError.value = "未登录或无法获取 License，请前往首页登录。";
    }
});
</script>

<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold mb-4">历史订单</h1>

        <!-- Display status based on historical matches fetch -->
        <div v-if="isLoadingMatches" class="text-center text-lg">
            加载历史比赛列表...
            <span class="loading loading-spinner loading-lg ml-2"></span>
        </div>

        <div v-else-if="matchesError" class="text-center text-error">
            {{ matchesError }}
        </div>

        <!-- Display historical matches list if available and no match is selected -->
        <div v-else-if="historicalMatches.length > 0 && !selectedMatchId">
            <h2 class="text-xl font-semibold mb-3">请选择一场历史比赛：</h2>

            <ul class="timeline timeline-vertical">
                <li
                    v-for="(match, index) in historicalMatches"
                    :key="match.id"
                    @click="selectMatch(match.match_id)"
                    :class="[
                        'cursor-pointer',
                        'hover:underline',
                        // 根据 match.is_complate 判断使用哪个颜色类
                        match.is_complate ? 'text-green-700' : 'text-white-500', // 示例：已完成蓝色，未完成灰色
                    ]"
                >
                    <hr
                        v-if="index != 0"
                        :class="{
                            'bg-primary': match.is_complate,
                        }"
                    />

                    <div class="timeline-start timeline-box text-lg">
                        {{ match.away_name }}
                    </div>
                    <div class="timeline-middle">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            :class="{
                                'text-primary': match.is_complate,
                                'h-5 w-5': true,
                            }"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                                clip-rule="evenodd"
                            />
                        </svg>
                    </div>
                    <div class="timeline-end timeline-box text-lg">
                        {{ new Date(match.date).toLocaleString() }}
                    </div>
                    <hr
                        :class="{
                            'bg-primary': match.is_complate,
                        }"
                    />
                </li>
            </ul>
        </div>

        <!-- Display OrderList component if a match is selected -->
        <div v-else-if="selectedMatchId">
            <button
                class="btn btn-outline btn-sm mb-4"
                @click="goBackToMatchList"
            >
                &lt; 返回比赛列表
            </button>
            <OrderList :match-id="selectedMatchId" />
        </div>

        <!-- Message if no historical matches found and not loading/error/selected -->
        <div v-else class="text-center text-gray-500">没有找到历史比赛。</div>
    </div>
</template>

<style scoped>
/* Add component-specific styles here */
</style>
