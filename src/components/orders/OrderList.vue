<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useAuthStore } from "@/stores/auth"; // Import the auth store

// Define props
const props = defineProps<{
    matchId?: string | null; // Optional matchId prop
}>();

// Define the interface for OrderRequest
interface OrderRequest {
    id: number;
    realname: string;
    orderPayload: any; // Corresponds to database\'s order_payload
    orderId: string; // Corresponds to database\'s order_id (might contain seat info)
    matchId: string; // Corresponds to database\'s match_id
    userAgent: string; // Corresponds to database\'s user_agent
    referer: string; // Corresponds to database\'s referer
    createdAt: Date; // Corresponds to database\'s created_at
    updatedAt: Date; // Corresponds to database\'s updated_at
    orderStatus: string; // Corresponds to database\'s order_status
    wechatUid: number; // Corresponds to database\'s wechat_uid
}

const authStore = useAuthStore(); // Instantiate the auth store

const orders = ref<OrderRequest[]>([]);
const isLoadingOrders = ref(false);
const ordersError = ref<string | null>(null);

// Function to fetch orders based on matchId
const fetchOrders = async (matchId: string | null | undefined) => {
    const license = authStore.memberInfo?.member_key;
    // Only fetch if license and a valid matchId are available
    if (!license) {
        ordersError.value = "无法获取 License 信息，请尝试重新登录。";
        orders.value = []; // Clear previous data
        isLoadingOrders.value = false; // Ensure loading is off
        return;
    }

    if (!matchId) {
        ordersError.value = "缺少比赛 ID，无法加载订单。";
        orders.value = []; // Clear previous data
        isLoadingOrders.value = false; // Ensure loading is off
        return;
    }

    isLoadingOrders.value = true;
    ordersError.value = null; // Clear previous errors
    orders.value = []; // Clear previous data

    try {
        // Construct the API URL
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/order/reqable-orders?licence_key=${encodeURIComponent(license.trim())}`;

        const response = await fetch(apiUrl, {
            method: "POST", // Changed method to POST
            headers: {
                "Content-Type": "application/json",
                // Add authorization header if required by your backend
                // \'Authorization\\\': `Bearer ${authStore.token}`
            },
            body: JSON.stringify({
                // Added body for POST request
                matchId: matchId,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(
                errorData?.message ||
                    `获取订单失败 (状态码: ${response.status})`,
            );
        }

        const data: OrderRequest[] = await response.json();
        orders.value = data;
    } catch (error: any) {
        ordersError.value = error.message || "加载订单时发生错误。";
    } finally {
        isLoadingOrders.value = false;
    }
};

// Computed property to group orders by wechatUid
const groupedOrders = computed(() => {
    if (!orders.value || orders.value.length === 0) return {};

    const groups: { [key: number]: OrderRequest[] } = {};
    orders.value.forEach((order) => {
        if (!groups[order.wechatUid]) {
            groups[order.wechatUid] = [];
        }
        groups[order.wechatUid].push(order);
    });
    return groups;
});

// Fetch orders when the component is mounted, if matchId is already available
onMounted(() => {
    // Check if user is logged in and has license and matchId before fetching
    if (
        authStore.isLoggedIn &&
        authStore.memberInfo?.member_key &&
        props.matchId
    ) {
        fetchOrders(props.matchId);
    } else if (!authStore.isLoggedIn || !authStore.memberInfo?.member_key) {
        ordersError.value = "未登录或无法获取 License，请前往首页登录。";
    } else {
        ordersError.value = "缺少比赛 ID，无法加载订单。";
    }
});

// Watch for changes in the matchId prop and re-fetch orders
watch(
    () => props.matchId,
    (newMatchId, oldMatchId) => {
        // Fetch orders when matchId changes and is valid, and auth info is available
        if (
            authStore.isLoggedIn &&
            authStore.memberInfo?.member_key &&
            newMatchId &&
            newMatchId !== oldMatchId
        ) {
            fetchOrders(newMatchId);
        } else if (!newMatchId) {
            // If matchId becomes null/undefined, clear orders and show message
            orders.value = [];
            ordersError.value = "缺少比赛 ID，无法加载订单。";
        }
        // No action needed if auth info is missing, onMounted handles that initially or auth store reactivity will trigger if it logs in later
    },
    { immediate: false }, // Do not run immediately, onMounted handles the initial fetch if matchId is present
);
</script>

<template>
    <div>
        <div v-if="isLoadingOrders" class="text-center text-lg">
            加载订单中...
            <span class="loading loading-spinner loading-lg ml-2"></span>
        </div>

        <div v-else-if="ordersError" class="text-center text-error">
            {{ ordersError }}
        </div>

        <div v-else-if="orders.length === 0" class="text-center text-gray-500">
            没有找到订单。
        </div>

        <div v-else>
            <!-- Display grouped orders -->
            <div
                v-for="(orderGroup, wechatUid) in groupedOrders"
                :key="wechatUid"
                class="mb-6"
            >
                <div class="collapse collapse-arrow bg-base-200">
                    <input type="checkbox" :id="`collapse-${wechatUid}`" />
                    <div class="collapse-title text-xl font-medium">
                        微信用户 ID: {{ wechatUid }} ({{ orderGroup.length }}
                        条订单)
                    </div>
                    <div class="collapse-content">
                        <div
                            v-for="order in orderGroup"
                            :key="order.id"
                            class="card bordered bg-base-100 shadow-sm my-4"
                        >
                            <div class="card-body p-4">
                                <h3 class="card-title text-lg mb-2">
                                    订单 ID: {{ order.id }}
                                </h3>
                                <p class="text-sm">
                                    <strong>姓名:</strong>
                                    <span class="badge badge-info ml-1">{{
                                        order.realname
                                    }}</span>
                                </p>
                                <p class="text-sm">
                                    <strong>状态:</strong>
                                    <span class="badge badge-info ml-1">{{
                                        order.orderStatus
                                    }}</span>
                                </p>
                                <p class="text-sm">
                                    <strong class="mr-1">比赛ID:</strong>
                                    {{ order.matchId }}
                                </p>
                                <p class="text-sm">
                                    <strong class="mr-1">座位号:</strong>
                                    {{ order.orderId.split("|").pop() }}
                                </p>
                                <p class="text-sm">
                                    <strong class="mr-1">创建时间:</strong>
                                    {{
                                        new Date(
                                            order.createdAt,
                                        ).toLocaleString()
                                    }}
                                </p>
                                <p class="text-sm">
                                    <strong class="mr-1">更新时间:</strong>
                                    {{
                                        new Date(
                                            order.updatedAt,
                                        ).toLocaleString()
                                    }}
                                </p>
                                <!-- You can display more order details here -->
                                <!-- <pre class="text-xs mt-2">{{ order.orderPayload }}</pre> -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Add component-specific styles here */
</style>
