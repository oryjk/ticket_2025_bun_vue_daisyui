<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

// 定义响应式状态，用于存储当前小时、分钟、秒
const hours = ref(0);
const minutes = ref(0);
const seconds = ref(0);

// 存储定时器的 ID，以便在组件销毁时清除
let intervalId: number | null = null;

// 更新当前时间的函数
function updateCurrentTime() {
    const now = new Date(); // 获取当前的 Date 对象
    const currentHours = now.getHours(); // 获取当前小时 (0-23)
    const currentMinutes = now.getMinutes(); // 获取当前分钟 (0-59)
    const currentSeconds = now.getSeconds(); // 获取当前秒 (0-59)

    // 更新响应式 ref 的值
    hours.value = currentHours;
    minutes.value = currentMinutes;
    seconds.value = currentSeconds;

    // 注意：daisyUI 的 --value CSS 变量是用来驱动显示的数字的，
    // 我们还需要在文本内容中显示处理过的（如双位数）数字，以便更好的兼容性和可读性。
    // 但对于 --value 本身，直接绑定原始数字是正确的。
}

// 组件挂载时启动定时器
onMounted(() => {
    // 立即更新一次，避免刚加载时的闪烁或显示00:00:00
    updateCurrentTime();
    // 每秒更新一次
    intervalId = setInterval(updateCurrentTime, 1000) as unknown as number; // TS 类型断言
});

// 组件销毁时清除定时器，防止内存泄漏
onUnmounted(() => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
});
</script>

<template>
    <!-- 核心的 daisyUI 倒计时结构，用来显示当前时间 -->
    <span class="countdown font-mono text-2xl">
        <!-- 小时 -->
        <span
            :style="{ '--value': hours }"
            aria-live="polite"
            aria-label="current hours"
        >
            <!-- 这里的内容会随着 --value 改变，但为了确保双位数显示，我们手动处理文本 -->
            {{ String(hours).padStart(2, "0") }}
        </span>
        :
        <!-- 分钟 -->
        <span
            :style="{ '--value': minutes }"
            aria-live="polite"
            aria-label="current minutes"
        >
            {{ String(minutes).padStart(2, "0") }}
        </span>
        :
        <!-- 秒 -->
        <span
            :style="{ '--value': seconds }"
            aria-live="polite"
            aria-label="current seconds"
        >
            {{ String(seconds).padStart(2, "0") }}
        </span>
    </span>
</template>

<style scoped>
/* 如果需要覆盖或添加样式，可以在这里写 */
</style>
