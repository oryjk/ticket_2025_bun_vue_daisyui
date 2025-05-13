<script setup lang="ts">
import { ref, watch } from "vue"; // 导入 ref 和 watch 用于状态管理和数据监听
import { useAuthStore } from "@/stores/auth"; // Import the auth store
import CurrentTimeDisplay from "@/components/CurrentTimeDisplay.vue";

const authStore = useAuthStore(); // Instantiate the auth store

// State variables for editing user info
const isEditing = ref(false); // State to control editing mode
const editingName = ref("");
const editingPhone = ref("");
const editingEmail = ref("");

// State variables for update process
const isUpdating = ref(false);
const updateMessage = ref("");
const isUpdateSuccess = ref(false);

// State variables for email sending
const isSendingEmail = ref(false);
const emailMessage = ref("");
const isEmailSuccess = ref(false);

// Watch for changes in authStore.memberInfo and initialize editing refs
// Also resets editing state when memberInfo changes
watch(
    () => authStore.memberInfo,
    (memberInfo) => {
        console.log(
            `开始修改memberInfo，新的值是 ${JSON.stringify(memberInfo)}`,
        );
        if (memberInfo) {
            editingName.value = memberInfo.member_name || "";
            editingPhone.value = memberInfo.phone || "";
            editingEmail.value = memberInfo.email || "";
            isEditing.value = false; // Reset editing mode when info updates
        }
    },
    { immediate: true, deep: true }, // Run immediately if memberInfo is already available
);

// Function to toggle editing mode
const toggleEditing = () => {
    isEditing.value = !isEditing.value;
};

// Function to cancel editing and revert changes
const cancelEditing = () => {
    if (authStore.memberInfo) {
        editingName.value = authStore.memberInfo.member_name || "";
        editingPhone.value = authStore.memberInfo.phone || "";
        editingEmail.value = authStore.memberInfo.email || "";
    }
    isEditing.value = false;
    updateMessage.value = ""; // Clear any pending update messages
};

// Function to mask a string, keeping start and end characters
const maskString = (
    str: string | null | undefined,
    keepStart = 3,
    keepEnd = 3,
): string => {
    if (!str) return "N/A";
    str = String(str); // Ensure it's a string
    if (str.length <= keepStart + keepEnd) {
        return str; // Don't mask if too short
    }
    const start = str.substring(0, keepStart);
    const end = str.substring(str.length - keepEnd);
    const middle = "*".repeat(str.length - keepStart - keepEnd);
    return `${start}${middle}${end}`;
};

// Function to send a test email
const sendTestEmail = async () => {
    const email = authStore.memberInfo?.email;
    if (!email) {
        emailMessage.value = "没有可用的邮箱地址。";
        isEmailSuccess.value = false;
        return;
    }

    isSendingEmail.value = true;
    emailMessage.value = ""; // Clear previous message

    const license = authStore.memberInfo?.member_key;
    if (!license) {
        emailMessage.value = "无法获取许可证。";
        isEmailSuccess.value = false;
        return;
    }
    try {
        // --- 重点：请将这里的 fetch 替换为你实际调用后端发送测试邮件接口的代码 ---
        // 示例：假设你有一个后端接口 POST /api/send-test-email 接收一个 { email: '...' } 的 JSON
        //
        const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/order/sendEmail?licence_key=${encodeURIComponent(license.trim())}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // 如果需要认证，可能还需要添加认证 Header
                    // 'Authorization': `Bearer ${authStore.token}`
                },
                body: JSON.stringify({ email: email }),
            },
        );

        if (response.ok) {
            // 假设后端返回 { message: '...' }
            const data = await response.json();
            emailMessage.value =
                data.message || "测试邮件已发送成功！请检查收件箱。";
            isEmailSuccess.value = true;
        } else {
            // 假设后端在失败时也返回 { message: '...' }
            const errorData = await response.json();
            emailMessage.value =
                errorData.message || `发送测试邮件失败：${response.statusText}`;
            isEmailSuccess.value = false;
        }
        // --------------------------------------------------------------------
    } catch (error: any) {
        emailMessage.value = "发送测试邮件时发生错误：" + error.message;
        isEmailSuccess.value = false;
    } finally {
        isSendingEmail.value = false;
        //  Optionally clear the message after a few seconds
        setTimeout(() => {
            emailMessage.value = "";
        }, 5000); // Clear message after 5 seconds
    }
};

// Function to update user info
const updateUserInfo = async () => {
    if (!authStore.memberInfo) {
        updateMessage.value = "无法获取用户信息，无法更新。";
        isUpdateSuccess.value = false;
        return;
    }

    const license = authStore.memberInfo.member_key;
    const id = authStore.memberInfo.id;

    isUpdating.value = true;
    updateMessage.value = ""; // Clear previous message

    try {
        const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/member/info/update?licence_key=${encodeURIComponent(license)}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    // Add authorization header if required, based on your auth strategy
                    // \'Authorization\': `Bearer ${authStore.token}`
                },
                body: JSON.stringify({
                    id: id,
                    member_name: editingName.value,
                    phone: editingPhone.value,
                    email: editingEmail.value,
                }),
            },
        );

        if (response.ok) {
            const data = await response.json();
            updateMessage.value = data.msg || "用户信息更新成功！";
            isUpdateSuccess.value = true;
            isEditing.value = false; // Exit editing mode on success
            // Optionally update the store with new info if backend confirms success
            if (authStore.memberInfo) {
                authStore.memberInfo = {
                    ...authStore.memberInfo,
                    member_name: editingName.value,
                    phone: editingPhone.value,
                    email: editingEmail.value,
                };
                authStore.persistenceMemberInfo();
                console.log(
                    `authStore.memberInfo ${JSON.stringify(authStore.memberInfo)}`,
                );
            }
        } else {
            const errorData = await response.json().catch(() => null);
            updateMessage.value =
                errorData?.message ||
                `更新用户信息失败：${response.statusText}`;
            isUpdateSuccess.value = false;
        }
    } catch (error: any) {
        updateMessage.value = "更新用户信息时发生错误：" + error.message;
        isUpdateSuccess.value = false;
    } finally {
        isUpdating.value = false;
        setTimeout(() => {
            updateMessage.value = "";
        }, 5000); // Clear message after 5 seconds
    }
};
const handleLogout = () => {
    // Assuming authStore has a logout method that clears state/cache
    authStore.logout();
};
</script>

<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold mb-4">我的信息</h1>
        <div v-if="authStore.memberInfo" class="card bg-base-100 shadow-xl">
            <div class="card-body">
                <div class="flex justify-center mb-6">
                    <div class="avatar avatar-placeholder">
                        <div
                            class="bg-neutral text-neutral-content w-24 rounded-full flex items-center justify-center"
                        >
                            <span class="text-3xl">{{
                                authStore.memberInfo.member_name
                            }}</span>
                        </div>
                    </div>
                </div>
                <CurrentTimeDisplay />
                <!-- Edit button -->
                <div class="flex justify-center mt-4">
                    <button
                        v-if="!isEditing"
                        class="btn btn-outline btn-primary btn-sm"
                        @click="toggleEditing"
                    >
                        编辑信息
                    </button>
                </div>
                <div class="divider"></div>
                <!-- Optional separator -->
                <p class="text-base py-1">
                    <strong>License 密钥:</strong>
                    {{ maskString(authStore.memberInfo.member_key) }}
                </p>
                <p class="text-base py-1">
                    <strong>状态:</strong>
                    <span class="badge badge-success ml-2">
                        <svg
                            class="size-[1em]"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                        >
                            <g
                                fill="currentColor"
                                stroke-linejoin="miter"
                                stroke-linecap="butt"
                            >
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-linecap="square"
                                    stroke-miterlimit="10"
                                    stroke-width="2"
                                ></circle>
                                <polyline
                                    points="7 13 10 16 17 8"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-linecap="square"
                                    stroke-miterlimit="10"
                                    stroke-width="2"
                                ></polyline>
                            </g>
                        </svg>
                        {{ authStore.memberInfo.member_status }}</span
                    >
                </p>
                <p class="text-base py-1">
                    <strong>邮件数量:</strong>
                    <span class="badge badge-success ml-2">{{
                        authStore.memberInfo.email_count
                    }}</span>
                </p>
                <p class="text-base py-1">
                    <strong>描述:</strong>
                    {{ authStore.memberInfo.description || "无" }}
                </p>

                <!-- Name Field -->
                <div class="form-control w-full max-w-xs py-1">
                    <label class="label">
                        <span class="label-text">姓名:</span>
                    </label>
                    <div v-if="isEditing">
                        <input
                            type="text"
                            v-model="editingName"
                            placeholder="请输入姓名"
                            class="input input-bordered w-full max-w-xs input-sm"
                        />
                    </div>
                    <div v-else class="py-2">
                        <p class="text-base">
                            {{ authStore.memberInfo.member_name || "N/A" }}
                        </p>
                    </div>
                </div>

                <!-- Phone Field -->
                <div class="form-control w-full max-w-xs py-1">
                    <label class="label">
                        <span class="label-text">电话:</span>
                    </label>
                    <div v-if="isEditing">
                        <input
                            type="tel"
                            v-model="editingPhone"
                            placeholder="请输入电话号码"
                            class="input input-bordered w-full max-w-xs input-sm"
                        />
                    </div>
                    <div v-else class="py-2">
                        <p class="text-base">
                            {{ authStore.memberInfo.phone || "N/A" }}
                        </p>
                    </div>
                </div>

                <!-- Email Field -->
                <div class="form-control w-full max-w-xs py-1">
                    <label class="label">
                        <span class="label-text">邮箱:</span>
                    </label>
                    <div v-if="isEditing" class="flex items-center gap-2">
                        <input
                            type="email"
                            v-model="editingEmail"
                            placeholder="请输入邮箱地址"
                            class="input input-bordered w-full max-w-xs input-sm flex-grow"
                        />
                        <button
                            class="btn btn-xs btn-outline btn-primary"
                            @click="sendTestEmail"
                            :disabled="isSendingEmail || !editingEmail"
                            :class="{
                                loading: isSendingEmail,
                                'btn-disabled': isSendingEmail || !editingEmail,
                            }"
                        >
                            <span v-if="isSendingEmail"></span>
                            <!-- DaisyUI loading spinner placeholder -->
                            <svg
                                v-else
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                class="size-4 fill-current"
                            >
                                <path
                                    d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5l-8-5h16zm0 12H4V8l8 5l8-5v10z"
                                ></path>
                            </svg>
                            <!-- Mail icon -->
                            测试邮件
                        </button>
                    </div>
                    <div v-else class="py-2 flex items-center gap-2">
                        <p class="text-base">
                            {{ authStore.memberInfo.email || "N/A" }}
                        </p>
                        <button
                            class="btn btn-xs btn-outline btn-primary"
                            @click="sendTestEmail"
                            :disabled="
                                isSendingEmail || !authStore.memberInfo?.email
                            "
                            :class="{
                                loading: isSendingEmail,
                                'btn-disabled':
                                    isSendingEmail ||
                                    !authStore.memberInfo?.email,
                            }"
                        >
                            <span v-if="isSendingEmail"></span>
                            <!-- DaisyUI loading spinner placeholder -->
                            <svg
                                v-else
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                class="size-4 fill-current"
                            >
                                <path
                                    d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5l-8-5h16zm0 12H4V8l8 5l8-5v10z"
                                ></path>
                            </svg>
                            <!-- Mail icon -->
                            测试邮件
                        </button>
                    </div>
                </div>

                <!-- Email sending status message -->
                <p
                    v-if="emailMessage"
                    :class="{
                        'text-success': isEmailSuccess,
                        'text-error': !isEmailSuccess,
                        'text-base py-1': true,
                    }"
                    class="text-sm ml-2 py-1"
                >
                    {{ emailMessage }}
                </p>

                <!-- Update/Cancel Buttons (only visible in editing mode) -->
                <div v-if="isEditing" class="py-2 flex gap-2">
                    <button
                        class="btn btn-primary"
                        @click="updateUserInfo"
                        :disabled="isUpdating"
                        :class="{
                            loading: isUpdating,
                            'btn-disabled': isUpdating,
                        }"
                    >
                        <span v-if="isUpdating"></span>
                        更新信息
                    </button>
                    <button
                        class="btn btn-outline btn-secondary"
                        @click="cancelEditing"
                        :disabled="isUpdating"
                    >
                        取消
                    </button>
                </div>

                <!-- Update status message -->
                <p
                    v-if="updateMessage"
                    :class="{
                        'text-success': isUpdateSuccess,
                        'text-error': !isUpdateSuccess,
                        'text-base py-1': true,
                    }"
                    class="text-sm mt-2 py-1"
                >
                    {{ updateMessage }}
                </p>

                <p class="text-base py-1 mt-4">
                    <strong>MAC 地址:</strong>
                    {{ maskString(authStore.memberInfo.mac_address) }}
                </p>
                <p class="text-base py-1">
                    <strong>创建时间:</strong>
                    {{
                        authStore.memberInfo.create_at
                            ? new Date(
                                  authStore.memberInfo.create_at,
                              ).toLocaleString()
                            : "N/A"
                    }}
                </p>
                <p class="text-base py-1">
                    <strong>更新时间:</strong>
                    {{
                        authStore.memberInfo.update_at
                            ? new Date(
                                  authStore.memberInfo.update_at,
                              ).toLocaleString()
                            : "N/A"
                    }}
                </p>

                <!-- Logout Button -->
                <div class="py-4 text-center">
                     <button
                        class="btn btn-error"
                        @click="handleLogout"
                     >
                        退出登录
                     </button>
                </div>
            </div>
        </div>
        <div v-else>
            <p>无法加载会员信息。</p>
        </div>
    </div>
</template>

<style scoped>
/* Add component-specific styles here */
/* If you need to adjust spacing/alignment more precisely */
.flex-wrap {
    flex-wrap: wrap;
    /* Allows items to wrap on smaller screens */
}
</style>
