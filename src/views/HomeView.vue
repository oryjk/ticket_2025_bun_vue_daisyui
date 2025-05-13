<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router"; // Import useRouter
import { useAuthStore } from "@/stores/auth"; // Import the auth store

const authStore = useAuthStore(); // Instantiate the auth store
const router = useRouter(); // Instantiate the router

const license = ref("");
const isLoading = ref(false); // To handle loading state during validation
const errorMessage = ref(""); // To display validation errors
const showSuccessMessage = ref(false); // To control display of success message
const countdown = ref(0); // For the redirection countdown

// Remove local validation logic as it's handled in the store action
// const validateLicense = async (inputLicense: string) => { ... };

const handleLogin = async () => {
    isLoading.value = true;
    errorMessage.value = ""; // Clear previous errors

    try {
        // Call the store's login action
        await authStore.login(license.value);
        // If successful, the store state (isLoggedIn) will be updated

        // Show success message and start countdown
        showSuccessMessage.value = true;
        countdown.value = 1; // Start countdown from 1 second

        const timer = setInterval(() => {
          countdown.value--;
          if (countdown.value === 0) {
            clearInterval(timer);
            router.push('/orders/current'); // Redirect to current orders page
          }
        }, 1000); // Update countdown every second
    } catch (error: any) {
        // Catch errors from the store's login action (e.g., validation failure)
        errorMessage.value = error.message || "发生未知错误。";
    } finally {
        isLoading.value = false;
    }
};

// Remove initial login state check as it's handled by the store state's initialization from localStorage
// if (localStorage.getItem('isLoggedIn') === 'true') { ... };
</script>

<template>
    <div class="home flex justify-center items-center h-screen w-full">
        <!-- Use authStore.isLoggedIn for conditional rendering -->
        <div
            v-if="!authStore.isLoggedIn"
            class="card w-96 bg-base-100 shadow-xl"
        >
            <div class="card-body">
                <div class="flex justify-center mb-4">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-16 h-16 text-gray-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                </div>
                <h2 class="card-title">登录</h2>
                <form @submit.prevent="handleLogin">
                    <div class="form-control w-full max-w-xs">
                        <label class="label" for="license-input">
                            <span class="label-text">请输入您的 License</span>
                        </label>
                        <input
                            id="license-input"
                            type="text"
                            placeholder="在这里输入"
                            class="input input-bordered w-full max-w-xs"
                            v-model="license"
                            :disabled="isLoading"
                        />
                        <label class="label">
                            <span
                                v-if="errorMessage"
                                class="label-text-alt text-error"
                                >{{ errorMessage }}</span
                            >
                        </label>
                    </div>
                    <div class="card-actions justify-end mt-4">
                        <button
                            type="submit"
                            class="btn btn-primary"
                            :disabled="isLoading"
                        >
                            <span
                                v-if="isLoading"
                                class="loading loading-spinner"
                            ></span>
                            登录
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <div v-else class="text-center">
            <!-- Show success message and countdown right after login -->
            <div v-if="showSuccessMessage">
                <h1 class="text-2xl font-bold mb-4">登录成功！</h1>
                <p>
                    将在 {{ countdown }} 秒后自动跳转到当前订单页面...
                </p>
            </div>
            <!-- Show regular home content after countdown/redirect (though redirect will happen) -->
            <div v-else>
                <h1 class="text-4xl font-bold">欢迎回家！</h1>
                <p class="py-6">
                    这是登录成功后显示的内容。
                </p>
                <!-- Add your main home page content here -->
            </div>
        </div>
    </div>
</template>
